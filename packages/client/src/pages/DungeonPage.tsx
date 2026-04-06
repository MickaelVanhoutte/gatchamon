import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { DUNGEONS, ESSENCES, ITEM_DUNGEONS, getItemSet, BATTLE_TOWER, getCurrentTowerResetDate } from '@gatchamon/shared';
import type { DungeonDef, ItemDungeonDef } from '@gatchamon/shared';
import { GameIcon } from '../components/icons';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import { MysteryDungeonPanel } from './MysteryDungeonPanel';
import './DungeonPage.css';

type DungeonTab = 'essence' | 'items' | 'tower' | 'mystery';

function useEnergyError() {
  const [error, setError] = useState<string | null>(null);
  const show = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 2000);
  };
  return { error, show };
}

function resolveInitialState(searchParams: URLSearchParams) {
  const tab = (searchParams.get('tab') as DungeonTab) || 'essence';
  const dungeonId = Number(searchParams.get('dungeonId') || 0);
  const floor = Number(searchParams.get('floor') || 0);
  const list = tab === 'items' ? ITEM_DUNGEONS : DUNGEONS;
  const dungeon = (dungeonId
    ? [...DUNGEONS, ...ITEM_DUNGEONS].find(d => d.id === dungeonId)
    : list[0]) ?? list[0];
  return { tab, dungeon, floor };
}

function getRewardSummary(reward: Record<string, any>): string {
  const parts: string[] = [];
  if (reward.legendaryPokeballs) parts.push(`${reward.legendaryPokeballs} Legendary Ball`);
  if (reward.premiumPokeballs) parts.push(`${reward.premiumPokeballs} Premium Balls`);
  if (reward.regularPokeballs) parts.push(`${reward.regularPokeballs} Pokeballs`);
  if (reward.pokedollars) parts.push(`${reward.pokedollars} ₽`);
  if (reward.stardust) parts.push(`${reward.stardust} Stardust`);
  if (reward.essences) parts.push('Essences');
  if (reward.heldItem) parts.push('Held Item');
  if (reward.dittos) parts.push(`${reward.dittos} Ditto`);
  return parts.join(', ');
}

export function DungeonPage() {
  const navigate = useNavigate();
  const { player } = useGameStore();
  const [searchParams] = useSearchParams();
  const initial = resolveInitialState(searchParams);
  const [tab, setTab] = useState<DungeonTab>(initial.tab);
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonDef | ItemDungeonDef>(initial.dungeon);
  const [selectedFloor, setSelectedFloor] = useState(initial.floor);
  const energyError = useEnergyError();

  // Keep URL in sync so navigate(-1) from team-select restores state
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== 'essence') params.set('tab', tab);
    if (tab !== 'tower' && tab !== 'mystery') {
      params.set('dungeonId', String(selectedDungeon.id));
      if (selectedFloor > 0) params.set('floor', String(selectedFloor));
    }
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      navigate(`?${newSearch}`, { replace: true });
    }
  }, [tab, selectedDungeon.id, selectedFloor]);

  const isItemDungeon = tab === 'items';
  const dungeonList = isItemDungeon ? ITEM_DUNGEONS : DUNGEONS;

  const repeatStatus = useRepeatBattleStore(s => s.status);

  const handleEnter = () => {
    if (!player) return;
    if (repeatStatus === 'running') {
      energyError.show('Repeat battle in progress!');
      return;
    }
    const cost = selectedDungeon.energyCost;
    if (player.energy < cost) {
      energyError.show('Not enough energy!');
      return;
    }
    if (isItemDungeon) {
      navigate(`/battle/team-select?mode=item-dungeon&dungeonId=${selectedDungeon.id}&floor=${selectedFloor}`);
    } else {
      navigate(`/battle/team-select?mode=dungeon&dungeonId=${selectedDungeon.id}&floor=${selectedFloor}`);
    }
  };

  function handleTabChange(newTab: DungeonTab) {
    setTab(newTab);
    const list = newTab === 'items' ? ITEM_DUNGEONS : DUNGEONS;
    if (list.length > 0) {
      setSelectedDungeon(list[0]);
      setSelectedFloor(0);
    }
  }

  const floor = selectedDungeon.floors[selectedFloor];

  // Essence dungeon drops — selected floor only
  const floorEssenceDrops = !isItemDungeon && floor ? (floor as DungeonDef['floors'][0]).drops : [];

  // Item dungeon drops — selected floor only
  const floorItemDrops = isItemDungeon && floor ? (floor as ItemDungeonDef['floors'][0]).drops : [];

  return (
    <div className="page dungeon-page">
      {energyError.error && <div className="dungeon-energy-error">{energyError.error}</div>}
      {/* Tab toggle */}
      <div className="dungeon-tab-toggle">
        <button
          className={`dungeon-tab-btn ${tab === 'essence' ? 'dungeon-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('essence')}
        >
          Essence
        </button>
        <button
          className={`dungeon-tab-btn ${tab === 'items' ? 'dungeon-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('items')}
        >
          Held Items
        </button>
        <button
          className={`dungeon-tab-btn ${tab === 'tower' ? 'dungeon-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('tower')}
        >
          <GameIcon id="tower" size={14} /> Tower
        </button>
        <button
          className={`dungeon-tab-btn ${tab === 'mystery' ? 'dungeon-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('mystery')}
        >
          Mystery
        </button>
      </div>

      {tab === 'tower' && <TowerPanel player={player} navigate={navigate} />}
      {tab === 'mystery' && <MysteryDungeonPanel />}

      {tab !== 'tower' && tab !== 'mystery' && <div className="dungeon-layout">
        {/* Left: Dungeon list */}
        <div className="dungeon-list">
          {dungeonList.map(d => (
            <div
              key={d.id}
              className={`dungeon-card ${selectedDungeon.id === d.id ? 'dungeon-card--selected' : ''}`}
              onClick={() => { setSelectedDungeon(d); setSelectedFloor(0); }}
              style={{ borderLeftColor: d.color }}
            >
              <span className="dungeon-card-icon"><GameIcon id={d.icon} size={16} /></span>
              <div className="dungeon-card-info">
                <span className="dungeon-card-name">{d.name}</span>
                <span className="dungeon-card-cost">{d.energyCost} Energy</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detail panel */}
        <div className="dungeon-detail">
          <div className="dungeon-detail-header" style={{ borderBottomColor: selectedDungeon.color }}>
            <span className="dungeon-detail-icon"><GameIcon id={selectedDungeon.icon} size={16} /></span>
            <h3>{selectedDungeon.name}</h3>
          </div>

          <p className="dungeon-desc">{selectedDungeon.description}</p>

          {/* Floor selector */}
          <div className="dungeon-floors">
            <span className="dungeon-floors-label">Floor</span>
            <div className="dungeon-floor-btns">
              {selectedDungeon.floors.map((_, i) => (
                <button
                  key={i}
                  className={`dungeon-floor-btn ${selectedFloor === i ? 'dungeon-floor-btn--active' : ''}`}
                  onClick={() => setSelectedFloor(i)}
                >
                  B{i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Drops */}
          <div className="dungeon-drops">
            <span className="dungeon-drops-label">Possible Drops</span>
            <div className="dungeon-drops-grid">
              {!isItemDungeon && floorEssenceDrops.map(drop => {
                const ess = ESSENCES[drop.essenceId];
                if (!ess) return null;
                return (
                  <div key={drop.essenceId} className="dungeon-drop-item">
                    <span className="drop-icon"><GameIcon id={ess.icon} size={14} /></span>
                    <span className="drop-name">{ess.name}</span>
                    <span className="drop-qty">{drop.quantity[0]}–{drop.quantity[1]}</span>
                    <span className="drop-chance">{Math.round(drop.chance * 100)}%</span>
                  </div>
                );
              })}
              {isItemDungeon && floorItemDrops.map(drop => {
                const setDef = getItemSet(drop.setId);
                if (!setDef) return null;
                return (
                  <div key={drop.setId} className="dungeon-drop-item">
                    <span className="drop-icon"><GameIcon id={setDef.icon} size={14} /></span>
                    <span className="drop-name">{setDef.name}</span>
                    <span className="drop-qty" style={{ color: setDef.color }}>
                      {drop.minStars}–{drop.maxStars}★
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="dungeon-enter-btn"
            onClick={handleEnter}
            disabled={!player || player.energy < selectedDungeon.energyCost}
          >
            Go ({selectedDungeon.energyCost} <GameIcon id="energy" size={14} />)
          </button>
        </div>
      </div>}
    </div>
  );
}

function getNextResetDate(): Date {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  if (day < 15) return new Date(Date.UTC(year, month, 15));
  return new Date(Date.UTC(year, month + 1, 1));
}

function formatTimeUntilReset(): string {
  const now = new Date();
  const next = getNextResetDate();
  const diff = next.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function TowerPanel({ player, navigate }: { player: any; navigate: any }) {
  const towerProgress = player?.towerProgress ?? 0;
  const nextFloor = Math.min(towerProgress + 1, 100);
  const nextFloorDef = BATTLE_TOWER[nextFloor - 1];
  const isCompleted = towerProgress >= 100;
  const resetTimer = useMemo(() => formatTimeUntilReset(), []);
  const currentRef = useRef<HTMLDivElement>(null);
  const energyError = useEnergyError();

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  const handleEnterTower = () => {
    if (!player || isCompleted) return;
    if (player.energy < nextFloorDef.energyCost) {
      energyError.show('Not enough energy!');
      return;
    }
    navigate(`/battle/team-select?mode=tower&floor=${nextFloor}`);
  };

  // Key floors: every 5th + floor 1 + current floor
  const keyFloorSet = new Set<number>([1]);
  for (let i = 5; i <= 100; i += 5) keyFloorSet.add(i);
  keyFloorSet.add(nextFloor);
  const keyFloors = BATTLE_TOWER.filter(f => keyFloorSet.has(f.floor)).reverse();

  return (
    <div className="tower-layout">
      {energyError.error && <div className="dungeon-energy-error">{energyError.error}</div>}
      <div className="tower-status-bar">
        <span className="tower-status-progress">
          <GameIcon id="tower" size={14} /> Floor {towerProgress} / 100
        </span>
        <span className="tower-reset-timer">Resets in {resetTimer}</span>
      </div>

      {isCompleted && (
        <div className="tower-completed">
          <GameIcon id="crown" size={24} />
          <p>Tower Conquered!</p>
        </div>
      )}

      <div className="tower-timeline">
        {keyFloors.map((f, idx) => {
          const isCleared = f.floor <= towerProgress;
          const isCurrent = f.floor === nextFloor && !isCompleted;
          const isLocked = f.floor > nextFloor;
          const isLast = idx === keyFloors.length - 1;

          return (
            <div
              key={f.floor}
              ref={isCurrent ? currentRef : undefined}
              className={[
                'tower-node',
                isCleared && 'tower-node--cleared',
                isCurrent && 'tower-node--current',
                isLocked && 'tower-node--locked',
                isLast && 'tower-node--last',
              ].filter(Boolean).join(' ')}
            >
              <div className="tower-node-spine">
                <div className="tower-node-dot">
                  {isCleared && <GameIcon id="check" size={8} />}
                </div>
              </div>
              <div className="tower-node-body">
                <span className="tower-node-floor">F{f.floor}</span>
                {isCurrent && (
                  <div className="tower-node-current-info">
                    <span className="tower-node-badge">READY</span>
                    <span className="tower-node-reward">{getRewardSummary(f.reward)}</span>
                    <button
                      className="tower-go-btn"
                      onClick={handleEnterTower}
                      disabled={!player || player.energy < f.energyCost}
                    >
                      Go ({f.energyCost} <GameIcon id="energy" size={12} />)
                    </button>
                  </div>
                )}
                {!isCurrent && (
                  <span className="tower-node-reward">{getRewardSummary(f.reward)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
