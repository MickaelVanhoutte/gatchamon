import { useState, useMemo } from 'react';
import type { HeldItemInstance, HeldItemSlot, BaseStats } from '@gatchamon/shared';
import { ITEM_SETS, GRADE_COLORS, ITEM_REMOVAL_COST, computeStatsWithItems, computeStats, getItemSellValue } from '@gatchamon/shared';
import { POKEDEX } from '@gatchamon/shared';
import type { OwnedPokemon } from '../stores/gameStore';
import { useGameStore } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { HeldItemCard } from '../components/held-item/HeldItemCard';
import { GameIcon } from '../components/icons';
import './HeldItemSelectModal.css';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'CRI Rate', critDmg: 'CRI Dmg', acc: 'Accuracy', res: 'Resistance',
};

const PCT_STATS: Array<keyof BaseStats> = ['critRate', 'critDmg', 'acc', 'res'];

type SortOption = 'stars' | 'level' | 'grade' | 'mainValue';

interface HeldItemSelectModalProps {
  pokemon: OwnedPokemon;
  slot: HeldItemSlot;
  heldItems: HeldItemInstance[];
  equippedItems: HeldItemInstance[];
  playerStardust: number;
  onClose: () => void;
}

export function HeldItemSelectModal({ pokemon, slot, heldItems, equippedItems, playerStardust, onClose }: HeldItemSelectModalProps) {
  const { equipItem, unequipItem, sellItems: storeSellItems, refreshPlayer } = useGameStore();
  const [setFilter, setSetFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('stars');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sellMode, setSellMode] = useState(false);
  const [sellSelection, setSellSelection] = useState<Set<string>>(new Set());
  const [confirmBulkSell, setConfirmBulkSell] = useState(false);

  const tutorialStep = useTutorialStore(s => s.step);
  const isTutorial = tutorialStep === 15;

  const currentEquipped = equippedItems.find(i => i.slot === slot);

  // Available items for this slot (unequipped or equipped on other pokemon)
  const availableItems = useMemo(() => {
    let items = heldItems.filter(i => i.slot === slot);
    if (setFilter) items = items.filter(i => i.setId === setFilter);
    return items.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'grade') {
        const gradeOrder = { legend: 4, hero: 3, rare: 2, common: 1 };
        return gradeOrder[b.grade] - gradeOrder[a.grade];
      }
      return b.mainStatValue - a.mainStatValue;
    });
  }, [heldItems, slot, setFilter, sortBy]);

  const selectedItem = selectedItemId ? heldItems.find(i => i.itemId === selectedItemId) : null;

  // Stat preview: compare current equipped vs selected
  const currentStats = computeStatsWithItems(pokemon.template, pokemon.instance.level, pokemon.instance.stars, equippedItems);

  const previewItems = selectedItem
    ? [...equippedItems.filter(i => i.slot !== slot), selectedItem]
    : equippedItems;
  const previewStats = computeStatsWithItems(pokemon.template, pokemon.instance.level, pokemon.instance.stars, previewItems);

  function getEquippedPokemonName(item: HeldItemInstance): string | null {
    if (!item.equippedTo || item.equippedTo === pokemon.instance.instanceId) return null;
    const collection = useGameStore.getState().collection;
    const owner = collection.find(p => p.instance.instanceId === item.equippedTo);
    return owner?.template.name ?? null;
  }

  function handleEquip() {
    if (!selectedItem) return;
    equipItem(selectedItem.itemId, pokemon.instance.instanceId);
    refreshPlayer();
    onClose();
  }

  function handleRemove() {
    if (!currentEquipped) return;
    if (playerStardust < ITEM_REMOVAL_COST) return;
    if (!confirm(`Remove item? This costs ${ITEM_REMOVAL_COST.toLocaleString()} Stardust.`)) return;
    unequipItem(currentEquipped.itemId);
    refreshPlayer();
    onClose();
  }

  // Count items per set for this slot
  const slotItems = useMemo(() => heldItems.filter(i => i.slot === slot), [heldItems, slot]);
  const setCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const set of ITEM_SETS) counts[set.id] = 0;
    for (const item of slotItems) {
      counts[item.setId] = (counts[item.setId] ?? 0) + 1;
    }
    return counts;
  }, [slotItems]);

  return (
    <div className="held-item-select-overlay" onClick={onClose}>
      <div className="held-item-select-modal" onClick={e => e.stopPropagation()}>
        <div className="held-item-select-header">
          <h3>Select Item for Slot {slot}</h3>
          <div className="held-item-select-header-actions">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
              <option value="stars">Stars</option>
              <option value="level">Level</option>
              <option value="grade">Grade</option>
              <option value="mainValue">Main Stat</option>
            </select>
            <button
              className={`held-item-sell-mode-btn ${sellMode ? 'active' : ''}`}
              onClick={() => { setSellMode(!sellMode); setSellSelection(new Set()); setConfirmBulkSell(false); }}
            >
              {sellMode ? 'Cancel' : 'Sell'}
            </button>
            <button className="held-item-select-close" onClick={onClose}><GameIcon id="close" size={18} /></button>
          </div>
        </div>

        <div className="held-item-select-body">
          {/* Set sidebar */}
          <div className="held-item-select-sidebar">
            <button
              className={`held-item-select-sidebar-item ${setFilter === '' ? 'held-item-select-sidebar-item--active' : ''}`}
              onClick={() => setSetFilter('')}
            >
              <span className="held-item-select-sidebar-name">All</span>
              <span className="held-item-select-sidebar-count">{slotItems.length}</span>
            </button>
            {ITEM_SETS.map(set => (
              <button
                key={set.id}
                className={`held-item-select-sidebar-item ${setFilter === set.id ? 'held-item-select-sidebar-item--active' : ''}`}
                style={setFilter === set.id ? { borderColor: set.color } : undefined}
                onClick={() => setSetFilter(set.id)}
              >
                <GameIcon id={set.icon} size={14} />
                <span className="held-item-select-sidebar-name">{set.name}</span>
                <span className="held-item-select-sidebar-count">{setCounts[set.id] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Item list column */}
          <div className="held-item-select-main">
            {/* Set effect banner */}
            {setFilter && (() => {
              const activeDef = ITEM_SETS.find(s => s.id === setFilter);
              if (!activeDef) return null;
              const effectDesc = activeDef.effectType === 'stat'
                ? `${activeDef.bonusStat?.toUpperCase()} +${activeDef.bonusValue}${activeDef.bonusType === 'percent' ? '%' : ''}`
                : activeDef.procDescription;
              return (
                <div className="held-item-select-set-effect" style={{ borderColor: activeDef.color }}>
                  <GameIcon id={activeDef.icon} size={16} />
                  <span className="held-item-select-set-effect-name">{activeDef.name}</span>
                  <span className="held-item-select-set-effect-pieces">{activeDef.pieces}-Set</span>
                  <span className="held-item-select-set-effect-desc">{effectDesc}</span>
                </div>
              );
            })()}

            <div className="held-item-select-list">
            {availableItems.length === 0 && (
              <div className="held-item-select-empty">No items for slot {slot}</div>
            )}
            {availableItems.map((item, idx) => {
              const isEquipped = item.equippedTo !== null;
              const isSellSelected = sellSelection.has(item.itemId);
              const tutorialHighlightItem = isTutorial && idx === 0 && !selectedItemId;
              return (
                <HeldItemCard
                  key={item.itemId}
                  item={item}
                  selected={sellMode ? isSellSelected : item.itemId === selectedItemId}
                  equippedPokemonName={getEquippedPokemonName(item)}
                  className={tutorialHighlightItem ? 'tutorial-highlight' : undefined}
                  onClick={() => {
                    if (sellMode) {
                      if (isEquipped) return; // can't sell equipped items
                      const next = new Set(sellSelection);
                      if (isSellSelected) next.delete(item.itemId);
                      else next.add(item.itemId);
                      setSellSelection(next);
                      setConfirmBulkSell(false);
                    } else {
                      setSelectedItemId(item.itemId === selectedItemId ? null : item.itemId);
                    }
                  }}
                />
              );
            })}
            </div>
          </div>

          {/* Stat preview – full (desktop) */}
          <div className="held-item-select-preview held-item-preview-full">
            <h4>Stat Preview</h4>
            <div className="held-item-preview-stats">
              {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => {
                const current = currentStats[key];
                const preview = previewStats[key];
                const diff = preview - current;
                const isPct = PCT_STATS.includes(key);
                return (
                  <div key={key} className="held-item-preview-row">
                    <span className="held-item-preview-label">{STAT_LABELS[key]}</span>
                    <span className="held-item-preview-current">{current}{isPct ? '%' : ''}</span>
                    <span className="held-item-preview-arrow">&rarr;</span>
                    <span className={`held-item-preview-new ${diff > 0 ? 'stat-up' : diff < 0 ? 'stat-down' : ''}`}>
                      {preview}{isPct ? '%' : ''}
                    </span>
                    {diff !== 0 && (
                      <span className={diff > 0 ? 'stat-up' : 'stat-down'}>
                        ({diff > 0 ? '+' : ''}{diff})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Stat preview – compact (mobile): only changed stats, single row */}
          <div className="held-item-preview-compact">
            {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => {
              const diff = previewStats[key] - currentStats[key];
              if (diff === 0) return null;
              const isPct = PCT_STATS.includes(key);
              return (
                <span key={key} className={`held-item-preview-chip ${diff > 0 ? 'stat-up' : 'stat-down'}`}>
                  {STAT_LABELS[key]} {diff > 0 ? '+' : ''}{diff}{isPct ? '%' : ''}
                </span>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="held-item-select-actions">
          {sellMode ? (
            <>
              {(() => {
                const totalValue = Array.from(sellSelection).reduce((sum, id) => {
                  const itm = heldItems.find(i => i.itemId === id);
                  return sum + (itm ? getItemSellValue(itm) : 0);
                }, 0);
                return confirmBulkSell ? (
                  <div className="held-item-sell-confirm" style={{ flex: 1 }}>
                    <span>Sell {sellSelection.size} items for {totalValue.toLocaleString()} <GameIcon id="stardust" size={12} />?</span>
                    <button className="held-item-sell-yes" onClick={() => {
                      storeSellItems(Array.from(sellSelection));
                      setSellMode(false);
                      setSellSelection(new Set());
                      setConfirmBulkSell(false);
                      refreshPlayer();
                    }}>Yes</button>
                    <button className="held-item-sell-no" onClick={() => setConfirmBulkSell(false)}>No</button>
                  </div>
                ) : (
                  <button
                    className="held-item-sell-bulk-btn"
                    disabled={sellSelection.size === 0}
                    onClick={() => setConfirmBulkSell(true)}
                  >
                    Sell {sellSelection.size} items ({totalValue.toLocaleString()} <GameIcon id="stardust" size={12} />)
                  </button>
                );
              })()}
            </>
          ) : (
            <>
              {currentEquipped && (
                <button
                  className="held-item-remove-btn"
                  onClick={handleRemove}
                  disabled={playerStardust < ITEM_REMOVAL_COST}
                >
                  Remove ({ITEM_REMOVAL_COST.toLocaleString()} <GameIcon id="stardust" size={12} />)
                </button>
              )}
              <button
                className={`held-item-equip-action-btn ${isTutorial && selectedItem ? 'tutorial-highlight' : ''}`}
                onClick={handleEquip}
                disabled={!selectedItem}
              >
                Equip
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
