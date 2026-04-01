import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { REGIONS, DUNGEONS, ITEM_DUNGEONS, getTemplate, getTowerFloor, getFloorCount, getGymLeader, getLeagueChampion, isActivePokemon, STORY_ENERGY_COST } from '@gatchamon/shared';
import type { Difficulty } from '@gatchamon/shared';
import { startBattle, startDungeonBattle, startItemDungeonBattle, startTowerBattle } from '../services/battle.service';
import { buildFloorEnemies } from '../services/floor.service';
import { loadLastTeam, saveLastTeam } from '../services/storage';
import { useRotatedHorizontalScroll } from '../hooks/useRotatedHorizontalScroll';
import { MonsterDetailModal } from '../components/MonsterDetailModal';
import { GameIcon, StarRating } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import { useTutorialStore } from '../stores/tutorialStore';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import './TeamSelectPage.css';

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#ff4444',
  6: '#ff6b6b',
};

interface EnemyPreview {
  templateId: number;
  name: string;
  spriteUrl: string;
  level: number;
  stars: number;
}

export function TeamSelectPage() {
  const { player, collection, loadCollection } = useGameStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [teamRestored, setTeamRestored] = useState(false);
  const [detailMon, setDetailMon] = useState<OwnedPokemon | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const rosterRef = useRef<HTMLDivElement>(null);
  useRotatedHorizontalScroll(rosterRef);

  const [repeatCount, setRepeatCount] = useState(1);

  const mode = searchParams.get('mode') ?? 'story';
  const region = Number(searchParams.get('region') ?? 1);
  const floor = Number(searchParams.get('floor') ?? 1);
  const difficulty = (searchParams.get('difficulty') as Difficulty) ?? 'normal';
  const dungeonId = Number(searchParams.get('dungeonId') ?? 0);
  const dungeonFloor = Number(searchParams.get('floor') ?? 0);
  const isDungeonMode = mode === 'dungeon' || mode === 'item-dungeon';

  const regionDef = REGIONS.find(r => r.id === region);
  const dungeonDef = DUNGEONS.find(d => d.id === dungeonId);
  const itemDungeonDef = ITEM_DUNGEONS.find(d => d.id === dungeonId);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const visibleCollection = useMemo(
    () => collection.filter(m => isActivePokemon(m.instance.templateId)),
    [collection],
  );

  // Restore last team once collection is loaded
  useEffect(() => {
    if (teamRestored || visibleCollection.length === 0) return;
    const tStep = useTutorialStore.getState().step;
    if (tStep === 10) {
      // Tutorial: auto-select all monsters
      setSelected(visibleCollection.map(m => m.instance.instanceId).slice(0, 4));
    } else {
      const saved = loadLastTeam();
      const validIds = saved
        .filter(id => visibleCollection.some(m => m.instance.instanceId === id))
        .slice(0, 4);
      if (validIds.length > 0) {
        setSelected(validIds);
      }
    }
    setTeamRestored(true);
  }, [visibleCollection, teamRestored]);

  // Build enemy preview
  const enemyPreviews = useMemo((): EnemyPreview[] => {
    if (mode === 'item-dungeon' && itemDungeonDef) {
      const floorData = itemDungeonDef.floors[dungeonFloor];
      const level = floorData?.enemyLevel ?? 10;
      return (floorData?.enemies ?? []).map(tid => {
        const tmpl = getTemplate(tid);
        return {
          templateId: tid,
          name: tmpl?.name ?? '???',
          spriteUrl: tmpl?.spriteUrl ?? '',
          level,
          stars: floorData?.enemyStars ?? tmpl?.naturalStars ?? 1,
        };
      });
    }
    if (mode === 'dungeon' && dungeonDef) {
      const floorData = dungeonDef.floors[dungeonFloor];
      const level = floorData?.enemyLevel ?? 10;
      return (floorData?.enemies ?? []).map(tid => {
        const tmpl = getTemplate(tid);
        return {
          templateId: tid,
          name: tmpl?.name ?? '???',
          spriteUrl: tmpl?.spriteUrl ?? '',
          level,
          stars: floorData?.enemyStars ?? tmpl?.naturalStars ?? 1,
        };
      });
    }
    if (mode === 'tower') {
      const towerFloor = Number(searchParams.get('floor') ?? 1);
      const towerDef = getTowerFloor(towerFloor);
      if (towerDef) {
        const previews: EnemyPreview[] = [];
        for (let i = 0; i < towerDef.enemyCount; i++) {
          const tid = towerDef.enemyPool[i % towerDef.enemyPool.length];
          const tmpl = getTemplate(tid);
          previews.push({
            templateId: tid,
            name: tmpl?.name ?? '???',
            spriteUrl: tmpl?.spriteUrl ?? '',
            level: towerDef.enemyLevel,
            stars: towerDef.enemyStars,
          });
        }
        return previews;
      }
    }
    // Story mode
    const floorDef = buildFloorEnemies(region, floor, difficulty);
    return floorDef.enemies.map(e => {
      const tmpl = getTemplate(e.templateId);
      return {
        templateId: e.templateId,
        name: tmpl?.name ?? '???',
        spriteUrl: tmpl?.spriteUrl ?? '',
        level: e.level,
        stars: e.stars,
      };
    });
  }, [mode, region, floor, difficulty, dungeonId, dungeonFloor, dungeonDef]);

  const toggleSelect = (instanceId: string) => {
    setSelected(prev => {
      if (prev.includes(instanceId)) return prev.filter(id => id !== instanceId);
      if (prev.length >= 4) return prev;
      return [...prev, instanceId];
    });
  };

  const tutorialStep = useTutorialStore(s => s.step);

  const handleStart = () => {
    if (!player || selected.length === 0) return;

    // Repeat battle mode — start first battle visually, BattlePage chains the rest
    if (isDungeonMode && repeatCount > 1) {
      const repeatStore = useRepeatBattleStore.getState();
      if (repeatStore.status === 'running') {
        setStartError('Repeat battle already in progress');
        return;
      }
      saveLastTeam(selected);
      const dDef = mode === 'item-dungeon' ? itemDungeonDef : dungeonDef;
      const config = {
        teamIds: [...selected],
        dungeonId,
        floorIndex: dungeonFloor,
        mode: mode as 'dungeon' | 'item-dungeon',
        totalRuns: repeatCount,
        dungeonName: dDef?.name ?? 'Dungeon',
        floorLabel: `B${dungeonFloor + 1}`,
      };
      repeatStore.startRepeat(config);
      navigate('/');
      return;
    }

    setIsStarting(true);
    saveLastTeam(selected);
    try {
      if (mode === 'tower') {
        const towerFloor = Number(searchParams.get('floor') ?? 1);
        const result = startTowerBattle(selected, towerFloor);
        navigate(`/battle/${result.state.battleId}`);
      } else if (mode === 'item-dungeon') {
        const result = startItemDungeonBattle(selected, dungeonId, dungeonFloor);
        navigate(`/battle/${result.state.battleId}`);
      } else if (mode === 'dungeon') {
        const result = startDungeonBattle(selected, dungeonId, dungeonFloor);
        navigate(`/battle/${result.state.battleId}`);
      } else {
        const result = startBattle(selected, { region, floor, difficulty });
        if (tutorialStep === 10) useTutorialStore.getState().setStep(11);
        navigate(`/battle/${result.state.battleId}`);
      }
    } catch (err: any) {
      setStartError(err.message);
      setIsStarting(false);
    }
  };

  const sorted = [...visibleCollection].sort(
    (a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level,
  );

  let headerText: string;
  if (mode === 'tower') {
    const towerFloor = Number(searchParams.get('floor') ?? 1);
    headerText = `Battle Tower - Floor ${towerFloor}`;
  } else if (mode === 'item-dungeon' && itemDungeonDef) {
    headerText = `${itemDungeonDef.name} - B${dungeonFloor + 1}`;
  } else if (mode === 'dungeon' && dungeonDef) {
    headerText = `${dungeonDef.name} - B${dungeonFloor + 1}`;
  } else {
    const regionName = regionDef?.name ?? `Region ${region}`;
    const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    if (region === 10) {
      const champ = getLeagueChampion(floor);
      headerText = champ
        ? `${regionName} - ${champ.icon} ${champ.name} (${diffLabel})`
        : `${regionName} - Floor ${floor} (${diffLabel})`;
    } else if (floor === getFloorCount(region)) {
      const leader = getGymLeader(region);
      headerText = leader
        ? `${regionName} - ${leader.icon} ${leader.name} (${diffLabel})`
        : `${regionName} - BOSS (${diffLabel})`;
    } else {
      const floorName = regionDef?.floorNames[floor - 1] ?? `Floor ${floor}`;
      headerText = `${regionName} - ${floorName} (${diffLabel})`;
    }
  }

  const getSpriteUrl = (mon: OwnedPokemon) => {
    const isShiny = mon.instance.isShiny ?? false;
    return isShiny
      ? assetUrl(`monsters/ani-shiny/${mon.template.name.toLowerCase()}.gif`)
      : assetUrl(mon.template.spriteUrl);
  };

  const energyCost = mode === 'item-dungeon'
    ? (itemDungeonDef?.energyCost ?? 5)
    : mode === 'dungeon'
      ? (dungeonDef?.energyCost ?? 5)
      : mode === 'tower'
        ? (getTowerFloor(floor)?.energyCost ?? 3)
        : STORY_ENERGY_COST;

  return (
    <div className="page team-select-page">
      {startError && <div className="ts-error-banner" onClick={() => setStartError(null)}>{startError}</div>}
      {/* Header */}
      <div className="ts-header">
        <span className="ts-stage-name">{headerText}</span>
        <span className="ts-pick-count">{selected.length}/4</span>
      </div>

      {/* VS Panel */}
      <div className="ts-vs-panel">
        {/* Player team slots */}
        <div className="ts-team-side ts-player-side">
          {[0, 1, 2, 3].map(i => {
            const mon = selected[i]
              ? collection.find(m => m.instance.instanceId === selected[i])
              : null;
            return (
              <div
                key={i}
                className={`ts-slot ${mon ? 'filled' : 'empty'}`}
                style={mon ? { borderColor: STAR_COLORS[mon.instance.stars] } : undefined}
                onClick={() => mon && toggleSelect(mon.instance.instanceId)}
              >
                {mon ? (
                  <>
                    <img
                      src={getSpriteUrl(mon)}
                      alt={mon.template.name}
                      className="ts-slot-sprite"
                    />
                    <div className="ts-slot-stars" style={{ color: STAR_COLORS[mon.instance.stars] }}>
                      <StarRating count={mon.instance.stars} size={10} />
                    </div>
                    <div className="ts-slot-level">Lv.{mon.instance.level}</div>
                  </>
                ) : (
                  <span className="ts-slot-empty-icon">+</span>
                )}
              </div>
            );
          })}
        </div>

        {/* VS divider */}
        <div className="ts-vs-divider">VS</div>

        {/* Enemy preview */}
        <div className="ts-team-side ts-enemy-side">
          {enemyPreviews.map((enemy, i) => (
            <div
              key={i}
              className="ts-slot ts-enemy-slot"
              style={{ borderColor: STAR_COLORS[enemy.stars] }}
            >
              <img
                src={assetUrl(enemy.spriteUrl)}
                alt={enemy.name}
                className="ts-slot-sprite"
              />
              <div className="ts-slot-stars" style={{ color: STAR_COLORS[enemy.stars] }}>
                <StarRating count={enemy.stars} size={10} />
              </div>
              <div className="ts-slot-level">Lv.{enemy.level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom panel: roster + actions */}
      <div className="ts-bottom-panel">
        <div className="ts-roster" ref={rosterRef} data-horizontal-scroll>
          <div className="ts-roster-scroll">
            {sorted.map(mon => {
              const isSelected = selected.includes(mon.instance.instanceId);
              const starColor = STAR_COLORS[mon.instance.stars] ?? STAR_COLORS[1];
              return (
                <div
                  key={mon.instance.instanceId}
                  className={`ts-mini-card ${isSelected ? 'selected' : ''}`}
                  style={{ borderColor: starColor }}
                  onContextMenu={e => e.preventDefault()}
                  onClick={() => {
                    if (longPressTriggered.current) {
                      longPressTriggered.current = false;
                      return;
                    }
                    toggleSelect(mon.instance.instanceId);
                  }}
                  onTouchStart={() => {
                    longPressTriggered.current = false;
                    longPressTimer.current = setTimeout(() => {
                      longPressTriggered.current = true;
                      setDetailMon(mon);
                    }, 500);
                  }}
                  onTouchMove={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onTouchEnd={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                >
                  <img
                    src={getSpriteUrl(mon)}
                    alt={mon.template.name}
                    className="ts-mini-sprite"
                  />
                  <span className="ts-mini-name">{mon.template.name}</span>
                  <span className="ts-mini-stars" style={{ color: starColor }}>
                    <StarRating count={mon.instance.stars} size={10} />
                  </span>
                  <span className="ts-mini-level">Lv.{mon.instance.level}</span>
                  {isSelected && <div className="ts-checkmark"><GameIcon id="check" size={14} /></div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="ts-actions">
          {isDungeonMode && (
            <div className="ts-repeat-row">
              <div className="ts-repeat-options">
                {[1, 5, 10, 20, 30].map(n => (
                  <button
                    key={n}
                    className={`ts-repeat-btn ${repeatCount === n ? 'active' : ''}`}
                    onClick={() => setRepeatCount(n)}
                  >
                    {n === 1 ? '1x' : `${n}x`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            className={`ts-go-btn ${tutorialStep === 10 ? 'tutorial-target' : ''} ${energyCost > 0 && !!player && player.energy < energyCost ? 'ts-go-btn-disabled' : ''}`}
            data-tutorial-id="team-select-go"
            onClick={handleStart}
            disabled={selected.length === 0 || isStarting || (energyCost > 0 && !!player && player.energy < energyCost)}
          >
            {isStarting ? '...' : (
              <>
                {repeatCount > 1 ? `Repeat x${repeatCount}` : 'GO'}
                {energyCost > 0 && (
                  <span className="ts-go-energy">
                    <GameIcon id="energy" size={12} />
                    {energyCost * repeatCount}
                  </span>
                )}
              </>
            )}
          </button>
          <button className="ts-cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>

      {detailMon && (
        <MonsterDetailModal pokemon={detailMon} onClose={() => setDetailMon(null)} />
      )}
    </div>
  );
}
