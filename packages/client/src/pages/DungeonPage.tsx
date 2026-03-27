import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { DUNGEONS, ESSENCES, ITEM_DUNGEONS, getItemSet, BATTLE_TOWER, getCurrentTowerResetDate } from '@gatchamon/shared';
import type { DungeonDef, ItemDungeonDef } from '@gatchamon/shared';
import { GameIcon } from '../components/icons';
import './DungeonPage.css';

type DungeonTab = 'essence' | 'items' | 'tower';

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

  const isItemDungeon = tab === 'items';
  const dungeonList = isItemDungeon ? ITEM_DUNGEONS : DUNGEONS;

  const handleEnter = () => {
    if (!player) return;
    const cost = selectedDungeon.energyCost;
    if (player.energy < cost) {
      alert('Not enough energy!');
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
      </div>

      {tab === 'tower' && <TowerPanel player={player} navigate={navigate} />}

      {tab !== 'tower' && <div className="dungeon-layout">
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

          {/* Floor info */}
          <div className="dungeon-floor-info">
            <div className="dungeon-info-row">
              <span>Enemy Level</span>
              <span>Lv.{floor?.enemyLevel ?? '?'}</span>
            </div>
            <div className="dungeon-info-row">
              <span>Energy Cost</span>
              <span>{selectedDungeon.energyCost}</span>
            </div>
            {isItemDungeon && floor && 'stardustReward' in floor && (
              <div className="dungeon-info-row">
                <span>Stardust</span>
                <span><GameIcon id="stardust" size={12} /> {(floor as any).stardustReward[0]}–{(floor as any).stardustReward[1]}</span>
              </div>
            )}
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
            style={{ background: selectedDungeon.color }}
          >
            Enter Dungeon
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

  const handleEnterTower = () => {
    if (!player || isCompleted) return;
    if (player.energy < nextFloorDef.energyCost) {
      alert('Not enough energy!');
      return;
    }
    navigate(`/battle/team-select?mode=tower&floor=${nextFloor}`);
  };

  return (
    <div className="tower-layout">
      <div className="tower-header">
        <h3><GameIcon id="tower" size={18} /> Battle Tower</h3>
        <p className="tower-desc">
          A 100-floor gauntlet of increasingly powerful foes. Earn rewards at every floor, with premium pokeballs every 10 floors and a legendary pokeball at the top!
        </p>
      </div>

      <div className="tower-progress-section">
        <div className="tower-progress-label">
          Progress: Floor {towerProgress} / 100
          <span className="tower-reset-timer">Resets in {resetTimer}</span>
        </div>
        <div className="tower-progress-bar">
          <div className="tower-progress-fill" style={{ width: `${towerProgress}%` }} />
        </div>
      </div>

      {!isCompleted && nextFloorDef && (
        <div className="tower-next-floor">
          <h4>Next: Floor {nextFloor}</h4>
          <div className="dungeon-floor-info">
            <div className="dungeon-info-row">
              <span>Enemy Level</span>
              <span>Lv.{nextFloorDef.enemyLevel}</span>
            </div>
            <div className="dungeon-info-row">
              <span>Enemy Stars</span>
              <span>{'★'.repeat(nextFloorDef.enemyStars)}</span>
            </div>
            <div className="dungeon-info-row">
              <span>Enemies</span>
              <span>{nextFloorDef.enemyCount}</span>
            </div>
            <div className="dungeon-info-row">
              <span>Energy Cost</span>
              <span>{nextFloorDef.energyCost}</span>
            </div>
            <div className="dungeon-info-row">
              <span>Reward</span>
              <span className="tower-reward-text">{getRewardSummary(nextFloorDef.reward)}</span>
            </div>
          </div>

          <button
            className="dungeon-enter-btn tower-enter-btn"
            onClick={handleEnterTower}
            disabled={!player || player.energy < nextFloorDef.energyCost}
          >
            Enter Floor {nextFloor}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="tower-completed">
          <GameIcon id="crown" size={24} />
          <p>Tower Conquered!</p>
        </div>
      )}

      <div className="tower-floor-list">
        <h4>All Floors</h4>
        <div className="tower-floors-scroll">
          {BATTLE_TOWER.map(f => {
            const isMilestone = f.floor % 10 === 0;
            const isCleared = f.floor <= towerProgress;
            const isCurrent = f.floor === nextFloor;
            const isLocked = f.floor > nextFloor;
            return (
              <div
                key={f.floor}
                className={`tower-floor-row ${isMilestone ? 'tower-floor-milestone' : ''} ${isCleared ? 'tower-floor-cleared' : ''} ${isCurrent ? 'tower-floor-current' : ''} ${isLocked ? 'tower-floor-locked' : ''}`}
              >
                <span className="tower-floor-num">F{f.floor}</span>
                <span className="tower-floor-reward">{getRewardSummary(f.reward)}</span>
                {isCleared && <span className="tower-floor-check"><GameIcon id="check" size={12} /></span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
