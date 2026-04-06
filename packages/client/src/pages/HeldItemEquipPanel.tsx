import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeldItemInstance, HeldItemSlot, BaseStats } from '@gatchamon/shared';
import { getItemSet, computeStatsWithItems, computeStats, getActiveSetEffects, ITEM_SETS } from '@gatchamon/shared';
import type { OwnedPokemon } from '../stores/gameStore';
import { HeldItemCard } from '../components/held-item/HeldItemCard';
import { HeldItemSelectModal, type StatsDiff } from './HeldItemSelectModal';
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
  player: { pokedollars: number };
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function HeldItemEquipPanel({ pokemon, heldItems, player, expanded, onToggleExpand }: HeldItemEquipPanelProps) {
  const navigate = useNavigate();
  const [selectSlot, setSelectSlot] = useState<HeldItemSlot | null>(null);
  const [upgradeItem, setUpgradeItem] = useState<HeldItemInstance | null>(null);
  const [statsDiff, setStatsDiff] = useState<StatsDiff>([]);

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
    if (onToggleExpand) {
      onToggleExpand();
      setSelectSlot(slot);
    } else {
      const equipped = equippedBySlot[slot];
      if (equipped) {
        setUpgradeItem(equipped);
      } else {
        setSelectSlot(slot);
      }
    }
  }

  const slotsGrid = (
    <div className="held-item-slots-grid">
      {([1, 2, 3, 4, 5, 6] as HeldItemSlot[]).map(s => {
        const equipped = equippedBySlot[s];
        const modalOpen = selectSlot !== null || upgradeItem !== null;
        const isTutorialTarget = s === 1 && (tutorialStep === 15 || tutorialStep === 16) && !modalOpen;
        return (
          <div
            key={s}
            className={`held-item-slot ${selectSlot === s ? 'held-item-slot--active' : ''} ${isTutorialTarget ? 'tutorial-target' : ''}`}
            data-tutorial-id={s === 1 && !modalOpen ? 'held-item-slot-1' : undefined}
            onClick={() => { if (expanded) setSelectSlot(s); else handleSlotClick(s); }}
          >
            {equipped ? (
              <HeldItemCard item={equipped} compact />
            ) : (
              <div className="held-item-slot-empty">
                <span className="held-item-slot-num">{s}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ===== Expanded layout: slots sidebar | inline item selection =====
  if (expanded) {
    return (
      <div className="held-item-equip-panel held-item-equip-panel--expanded">
        <div className="held-item-expanded-sidebar">
          {slotsGrid}
          {statsDiff.length > 0 && (
            <div className="held-item-sidebar-stats">
              {statsDiff.map(d => (
                <span key={d.key} className={`held-item-sidebar-stat ${d.diff > 0 ? 'stat-up' : 'stat-down'}`}>
                  {d.label} {d.diff > 0 ? '+' : ''}{d.diff}{d.isPct ? '%' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="held-item-expanded-main">
          {selectSlot !== null ? (
            <HeldItemSelectModal
              pokemon={pokemon}
              slot={selectSlot}
              heldItems={heldItems}
              equippedItems={equippedItems}
              playerPokedollars={player.pokedollars ?? 0}
              onClose={() => setSelectSlot(null)}
              onStatsPreview={setStatsDiff}
              inline
            />
          ) : (
            <div className="held-item-expanded-empty">Select a slot to manage items</div>
          )}
        </div>

        {upgradeItem && (
          <HeldItemUpgradeModal
            item={upgradeItem}
            playerPokedollars={player.pokedollars ?? 0}
            onClose={() => setUpgradeItem(null)}
            onEquipSlot={(s) => { setUpgradeItem(null); setSelectSlot(s); }}
          />
        )}
      </div>
    );
  }

  // ===== Normal (collapsed) layout =====
  return (
    <div className="held-item-equip-panel">
      {slotsGrid}

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

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="held-item-equip-btn" onClick={() => {
          if (onToggleExpand) {
            onToggleExpand();
            setSelectSlot(1);
          } else {
            setSelectSlot(1);
          }
        }} style={{ flex: 1 }}>
          Manage Items
        </button>
        <button className="held-item-equip-btn" onClick={() => navigate('/inventory')} style={{ flex: 1 }}>
          View All
        </button>
      </div>

      {/* Modal item selection when NOT expanded */}
      {selectSlot !== null && (
        <HeldItemSelectModal
          pokemon={pokemon}
          slot={selectSlot}
          heldItems={heldItems}
          equippedItems={equippedItems}
          playerPokedollars={player.pokedollars ?? 0}
          onClose={() => setSelectSlot(null)}
        />
      )}

      {upgradeItem && (
        <HeldItemUpgradeModal
          item={upgradeItem}
          playerPokedollars={player.pokedollars ?? 0}
          onClose={() => setUpgradeItem(null)}
          onEquipSlot={(slot) => { setUpgradeItem(null); setSelectSlot(slot); }}
        />
      )}
    </div>
  );
}
