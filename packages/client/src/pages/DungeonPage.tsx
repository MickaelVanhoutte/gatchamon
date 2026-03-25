import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { DUNGEONS, ESSENCES, ITEM_DUNGEONS, getItemSet } from '@gatchamon/shared';
import type { DungeonDef, ItemDungeonDef } from '@gatchamon/shared';
import { GameIcon, StarRating } from '../components/icons';
import './DungeonPage.css';

type DungeonTab = 'essence' | 'items';

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

  // Essence dungeon drops
  const droppableEssences = new Set<string>();
  if (!isItemDungeon && 'floors' in selectedDungeon) {
    for (const floor of (selectedDungeon as DungeonDef).floors) {
      for (const drop of floor.drops) {
        droppableEssences.add(drop.essenceId);
      }
    }
  }

  // Item dungeon drops
  const droppableItemSets = new Set<string>();
  if (isItemDungeon) {
    for (const floor of (selectedDungeon as ItemDungeonDef).floors) {
      for (const drop of floor.drops) {
        droppableItemSets.add(drop.setId);
      }
    }
  }

  const materials = player?.materials ?? {};
  const floor = selectedDungeon.floors[selectedFloor];

  return (
    <div className="page dungeon-page">
      <h2 className="dungeon-title">Dungeons</h2>

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
      </div>

      <div className="dungeon-layout">
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
              {!isItemDungeon && Array.from(droppableEssences).map(essId => {
                const ess = ESSENCES[essId];
                if (!ess) return null;
                return (
                  <div key={essId} className="dungeon-drop-item">
                    <span className="drop-icon"><GameIcon id={ess.icon} size={14} /></span>
                    <span className="drop-name">{ess.name}</span>
                    <span className="drop-owned">x{materials[essId] ?? 0}</span>
                  </div>
                );
              })}
              {isItemDungeon && Array.from(droppableItemSets).map(setId => {
                const setDef = getItemSet(setId);
                if (!setDef) return null;
                return (
                  <div key={setId} className="dungeon-drop-item">
                    <span className="drop-icon"><GameIcon id={setDef.icon} size={14} /></span>
                    <span className="drop-name">{setDef.name}</span>
                    <span className="drop-owned" style={{ color: setDef.color }}>
                      {setDef.pieces}-set
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
      </div>
    </div>
  );
}
