import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { REGIONS, DUNGEONS, ITEM_DUNGEONS, getTemplate, getTowerFloor, getTowerEnemyPool, getCurrentTowerResetDate, getFloorCount, getGymLeader, getLeagueChampion, isLeagueRegion, isActivePokemon, STORY_ENERGY_COST, getMysteryDungeonDef, describeLeaderSkill } from '@gatchamon/shared';
import type { Difficulty } from '@gatchamon/shared';
import { buildFloorEnemies } from '../services/floor.service';
import { loadLastTeam, saveLastTeam, getTeamKey } from '../services/storage';
import * as serverApi from '../services/server-api.service';
import { useRotatedHorizontalScroll } from '../hooks/useRotatedHorizontalScroll';
import { MonsterDetailModal } from '../components/MonsterDetailModal';
import { GameIcon, StarRating } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import { useTutorialStore } from '../stores/tutorialStore';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import { haptic } from '../utils/haptics';
import './TeamSelectPage.css';

const STAR_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#fbbf24',
  5: '#f87171',
  6: '#fbbf24',
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
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
  const isArenaMode = mode === 'arena' || mode === 'arena-rival';
  const isDungeonMode = mode === 'dungeon' || mode === 'item-dungeon' || mode === 'mystery-dungeon';
  const teamKey = getTeamKey(mode, dungeonId);

  const regionDef = REGIONS.find(r => r.id === region);
  const dungeonDef = DUNGEONS.find(d => d.id === dungeonId);
  const itemDungeonDef = ITEM_DUNGEONS.find(d => d.id === dungeonId);
  const mysteryDungeonDef = mode === 'mystery-dungeon' ? getMysteryDungeonDef() : null;

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
      const saved = loadLastTeam(teamKey);
      const validIds = saved
        .filter(id => visibleCollection.some(m => m.instance.instanceId === id))
        .slice(0, 4);
      if (validIds.length > 0) {
        setSelected(validIds);
      }
    }
    setTeamRestored(true);
  }, [visibleCollection, teamRestored, teamKey]);

  // Build enemy preview
  const enemyPreviews = useMemo((): EnemyPreview[] => {
    if (isArenaMode) {
      // Enemy data passed via search params
      try {
        const raw = searchParams.get('enemies');
        if (raw) {
          const parsed = JSON.parse(decodeURIComponent(raw));
          return (parsed as Array<{ templateId: number; level: number; stars: number }>).map(e => {
            const tmpl = getTemplate(e.templateId);
            return {
              templateId: e.templateId,
              name: tmpl?.name ?? '???',
              spriteUrl: tmpl?.spriteUrl ?? '',
              level: e.level,
              stars: e.stars,
            };
          });
        }
      } catch { /* ignore */ }
      return [];
    }
    if (mode === 'mystery-dungeon' && mysteryDungeonDef) {
      const floorData = mysteryDungeonDef.floors[dungeonFloor];
      if (!floorData) return [];
      return floorData.enemies.map(tid => {
        const tmpl = getTemplate(tid);
        return {
          templateId: tid,
          name: tmpl?.name ?? '???',
          spriteUrl: tmpl?.spriteUrl ?? '',
          level: floorData.enemyLevel,
          stars: floorData.enemyStars,
        };
      });
    }
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
        const resetDate = getCurrentTowerResetDate();
        const pool = getTowerEnemyPool(towerFloor, resetDate);
        const previews: EnemyPreview[] = [];
        for (let i = 0; i < towerDef.enemyCount; i++) {
          const tid = pool[i];
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

  const handleStart = async () => {
    if (!player || selected.length === 0) return;
    haptic.medium();

    // Repeat battle mode — start first battle visually, BattlePage chains the rest
    if (isDungeonMode && repeatCount > 1) {
      const repeatStore = useRepeatBattleStore.getState();
      if (repeatStore.status === 'running') {
        setStartError('Repeat battle already in progress');
        return;
      }
      saveLastTeam(selected, teamKey);
      const dName = mode === 'mystery-dungeon'
        ? (mysteryDungeonDef?.name ?? 'Mystery Dungeon')
        : mode === 'item-dungeon' ? itemDungeonDef?.name : dungeonDef?.name;
      const config = {
        teamIds: [...selected],
        dungeonId,
        floorIndex: dungeonFloor,
        mode: mode as 'dungeon' | 'item-dungeon' | 'mystery-dungeon',
        totalRuns: repeatCount,
        dungeonName: dName ?? 'Dungeon',
        floorLabel: `B${dungeonFloor + 1}`,
      };
      repeatStore.startRepeat(config);
      navigate('/');
      return;
    }

    setIsStarting(true);
    saveLastTeam(selected, teamKey);
    try {
      let result: any;
      if (mode === 'arena') {
        const defenderId = searchParams.get('defenderId')!;
        result = await serverApi.startArenaBattle(selected, defenderId);
      } else if (mode === 'arena-rival') {
        const rivalId = searchParams.get('rivalId')!;
        result = await serverApi.startRivalBattle(selected, rivalId);
      } else if (mode === 'mystery-dungeon') {
        result = await serverApi.startMysteryDungeonBattle(selected, dungeonFloor);
      } else if (mode === 'tower') {
        const towerFloor = Number(searchParams.get('floor') ?? 1);
        result = await serverApi.startTowerBattle(selected, towerFloor);
      } else if (mode === 'item-dungeon') {
        result = await serverApi.startItemDungeonBattle(selected, dungeonId, dungeonFloor);
      } else if (mode === 'dungeon') {
        result = await serverApi.startDungeonBattle(selected, dungeonId, dungeonFloor);
      } else {
        result = await serverApi.startBattle(selected, { region, floor, difficulty });
        if (tutorialStep === 10) useTutorialStore.getState().setStep(11);
      }
      const battleId = result.state?.battleId ?? result.battleId;
      navigate(`/battle/${battleId}`);
    } catch (err: any) {
      setStartError(err.message);
      setIsStarting(false);
    }
  };

  const sorted = [...visibleCollection].sort(
    (a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level,
  );

  let headerText: string;
  if (mode === 'mystery-dungeon' && mysteryDungeonDef) {
    const featuredTemplate = getTemplate(mysteryDungeonDef.featuredTemplateId);
    headerText = `Mystery Dungeon (${featuredTemplate?.name ?? '???'}) - B${dungeonFloor + 1}`;
  } else if (mode === 'tower') {
    const towerFloor = Number(searchParams.get('floor') ?? 1);
    headerText = `Battle Tower - Floor ${towerFloor}`;
  } else if (mode === 'item-dungeon' && itemDungeonDef) {
    headerText = `${itemDungeonDef.name} - B${dungeonFloor + 1}`;
  } else if (mode === 'dungeon' && dungeonDef) {
    headerText = `${dungeonDef.name} - B${dungeonFloor + 1}`;
  } else {
    const regionName = regionDef?.name ?? `Region ${region}`;
    const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    if (isLeagueRegion(region)) {
      const champ = getLeagueChampion(region, floor);
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

  const energyCost = mode === 'mystery-dungeon'
    ? (mysteryDungeonDef?.energyCosts[dungeonFloor] ?? 4)
    : mode === 'item-dungeon'
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

      {/* Leader Skill Banner */}
      {(() => {
        const leaderMon = selected[0] ? collection.find(m => m.instance.instanceId === selected[0]) : null;
        const ls = leaderMon?.template.leaderSkill;
        if (!ls) return null;
        return (
          <div className="ts-leader-skill">
            <span className="ts-leader-icon">&#x1F451;</span>
            <span className="ts-leader-text">{describeLeaderSkill(ls)}</span>
          </div>
        );
      })()}

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
                className={`ts-slot ${mon ? 'filled' : 'empty'}${dragOverIdx === i && dragIdx !== i ? ' ts-slot--drag-over' : ''}`}
                style={mon ? { borderColor: STAR_COLORS[mon.instance.stars] } : undefined}
                draggable={!!mon}
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i); }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== i && selected[dragIdx]) {
                    setSelected(prev => {
                      const next = [...prev];
                      const dragged = next[dragIdx];
                      next.splice(dragIdx, 1);
                      const insertAt = Math.min(i, next.length);
                      next.splice(insertAt, 0, dragged);
                      return next;
                    });
                  }
                  setDragIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
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
            className={`ts-go-btn ${tutorialStep === 10 ? 'tutorial-target' : ''} ${energyCost > 0 && !!player && player.energy < energyCost * repeatCount ? 'ts-go-btn-disabled' : ''}`}
            data-tutorial-id="team-select-go"
            onPointerDown={(e) => { e.preventDefault(); handleStart(); }}
            disabled={selected.length === 0 || isStarting || (energyCost > 0 && !!player && player.energy < energyCost * repeatCount)}
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
