import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeldItemInstance, HeldItemSlot, BaseStats } from '@gatchamon/shared';
import { getItemSet, computeStatsWithItems, computeStats, getActiveSetEffects, ITEM_SETS } from '@gatchamon/shared';
import type { OwnedPokemon } from '../stores/gameStore';
import { HeldItemCard } from '../components/held-item/HeldItemCard';
import { HeldItemSelectModal } from './HeldItemSelectModal';
import { HeldItemUpgradeModal } from './HeldItemUpgradeModal';
import { useTutorialStore } from '../stores/tutorialStore';
import './HeldItemEquipPanel.css';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'CRI Rate', critDmg: 'CRI Dmg', acc: 'Accuracy', res: 'Resistance',
};

const PCT_STATS: Array<keyof BaseStats> = ['critRate', 'critDmg', 'acc', 'res'];

interface HeldItemEquipPanelProps {
  pokemon: OwnedPokemon;
  heldItems: HeldItemInstance[];
  player: { stardust: number };
}

export function HeldItemEquipPanel({ pokemon, heldItems, player }: HeldItemEquipPanelProps) {
  const navigate = useNavigate();
  const [selectSlot, setSelectSlot] = useState<HeldItemSlot | null>(null);
  const [upgradeItem, setUpgradeItem] = useState<HeldItemInstance | null>(null);

  const tutorialStep = useTutorialStore(s => s.step);
  const prevSelectSlot = useRef(selectSlot);
  const prevUpgradeItem = useRef(upgradeItem);

  const equippedItems = heldItems.filter(i => i.equippedTo === pokemon.instance.instanceId);
  const equippedBySlot: Record<number, HeldItemInstance | undefined> = {};
  for (const item of equippedItems) {
    equippedBySlot[item.slot] = item;
  }

  // Tutorial step 15: detect when equip modal closes and slot 1 is now equipped
  useEffect(() => {
    if (tutorialStep === 15 && prevSelectSlot.current !== null && selectSlot === null) {
      // Modal just closed — check if slot 1 now has an item
      if (equippedBySlot[1]) {
        useTutorialStore.getState().advanceStep(); // 15 → 16
      }
    }
    prevSelectSlot.current = selectSlot;
  }, [selectSlot, tutorialStep, equippedBySlot]);

  // Tutorial step 16: detect when upgrade modal closes and item level > 0
  useEffect(() => {
    if (tutorialStep === 16 && prevUpgradeItem.current !== null && upgradeItem === null) {
      // Modal just closed — check if item was upgraded
      const slot1Item = equippedBySlot[1];
      if (slot1Item && slot1Item.level > 0) {
        useTutorialStore.getState().advanceStep(); // 16 → 17
      }
    }
    prevUpgradeItem.current = upgradeItem;
  }, [upgradeItem, tutorialStep, equippedBySlot]);

  // Stats comparison
  const baseStats = computeStats(pokemon.template, pokemon.instance.level, pokemon.instance.stars);
  const totalStats = computeStatsWithItems(pokemon.template, pokemon.instance.level, pokemon.instance.stars, equippedItems);

  // Active set bonuses
  const activeEffects = getActiveSetEffects(equippedItems);

  // Count all equipped items per set (including incomplete sets)
  const setCounts: Record<string, number> = {};
  for (const item of equippedItems) {
    setCounts[item.setId] = (setCounts[item.setId] ?? 0) + 1;
  }
  const activeSetIds = new Set(activeEffects.map(e => e.setId));

  function handleSlotClick(slot: HeldItemSlot) {
    const equipped = equippedBySlot[slot];
    if (equipped) {
      setUpgradeItem(equipped);
    } else {
      setSelectSlot(slot);
    }
  }

  return (
    <div className="held-item-equip-panel">
      {/* 6-slot grid */}
      <div className="held-item-slots-grid">
        {([1, 2, 3, 4, 5, 6] as HeldItemSlot[]).map(slot => {
          const equipped = equippedBySlot[slot];
          const modalOpen = selectSlot !== null || upgradeItem !== null;
          const isTutorialTarget = slot === 1 && (tutorialStep === 15 || tutorialStep === 16) && !modalOpen;
          return (
            <div
              key={slot}
              className={`held-item-slot ${isTutorialTarget ? 'tutorial-target' : ''}`}
              data-tutorial-id={slot === 1 && !modalOpen ? 'held-item-slot-1' : undefined}
              onClick={() => handleSlotClick(slot)}
            >
              {equipped ? (
                <HeldItemCard item={equipped} compact />
              ) : (
                <div className="held-item-slot-empty">
                  <span className="held-item-slot-num">{slot}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Set bonuses */}
      {Object.keys(setCounts).length > 0 && (
        <div className="held-item-set-bonuses">
          {Object.entries(setCounts).map(([setId, count]) => {
            const setDef = ITEM_SETS.find(s => s.id === setId);
            if (!setDef) return null;
            const isActive = activeSetIds.has(setId);
            const eff = activeEffects.find(e => e.setId === setId);
            return (
              <div key={setId} className={`held-item-set-bonus ${!isActive ? 'held-item-set-bonus--inactive' : ''}`} style={{ borderColor: isActive ? setDef.color : undefined }}>
                <span className="held-item-set-icon">{setDef.icon}</span>
                <span className="held-item-set-name">{setDef.name} ({count}/{setDef.pieces})</span>
                <span className={`held-item-set-desc ${!isActive ? 'held-item-set-desc--hidden' : ''}`}>
                  {isActive && eff
                    ? (eff.effectType === 'stat'
                      ? `${eff.bonusStat?.toUpperCase()} +${eff.bonusValue}${eff.bonusType === 'percent' ? '%' : ''}`
                      : setDef.procDescription)
                    : '???'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats with item bonuses */}
      <div className="held-item-stats">
        {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => {
          const base = baseStats[key];
          const total = totalStats[key];
          const diff = total - base;
          const isPct = PCT_STATS.includes(key);
          return (
            <div key={key} className="held-item-stat-row">
              <span className="held-item-stat-label">{STAT_LABELS[key]}</span>
              <span className="held-item-stat-value">
                {total}{isPct ? '%' : ''}
                {diff > 0 && <span className="held-item-stat-bonus"> (+{diff})</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Equip button for empty slots */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="held-item-equip-btn" onClick={() => setSelectSlot(1)} style={{ flex: 1 }}>
          Manage Items
        </button>
        <button className="held-item-equip-btn" onClick={() => navigate('/inventory')} style={{ flex: 1 }}>
          View All
        </button>
      </div>

      {/* Modals */}
      {selectSlot !== null && (
        <HeldItemSelectModal
          pokemon={pokemon}
          slot={selectSlot}
          heldItems={heldItems}
          equippedItems={equippedItems}
          playerStardust={player.stardust ?? 0}
          onClose={() => setSelectSlot(null)}
        />
      )}

      {upgradeItem && (
        <HeldItemUpgradeModal
          item={upgradeItem}
          playerStardust={player.stardust ?? 0}
          onClose={() => setUpgradeItem(null)}
          onEquipSlot={(slot) => { setUpgradeItem(null); setSelectSlot(slot); }}
        />
      )}
    </div>
  );
}
