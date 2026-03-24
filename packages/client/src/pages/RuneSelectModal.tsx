import { useState, useMemo } from 'react';
import type { HeldItemInstance, HeldItemSlot, BaseStats } from '@gatchamon/shared';
import { ITEM_SETS, GRADE_COLORS, ITEM_REMOVAL_COST, computeStatsWithItems, computeStats } from '@gatchamon/shared';
import { POKEDEX } from '@gatchamon/shared';
import type { OwnedPokemon } from '../stores/gameStore';
import { useGameStore } from '../stores/gameStore';
import { RuneCard } from '../components/rune/RuneCard';
import './RuneSelectModal.css';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'CRI Rate', critDmg: 'CRI Dmg', acc: 'Accuracy', res: 'Resistance',
};

const PCT_STATS: Array<keyof BaseStats> = ['critRate', 'critDmg', 'acc', 'res'];

type SortOption = 'stars' | 'level' | 'grade' | 'mainValue';

interface RuneSelectModalProps {
  pokemon: OwnedPokemon;
  slot: HeldItemSlot;
  heldItems: HeldItemInstance[];
  equippedItems: HeldItemInstance[];
  playerStardust: number;
  onClose: () => void;
}

export function RuneSelectModal({ pokemon, slot, heldItems, equippedItems, playerStardust, onClose }: RuneSelectModalProps) {
  const { equipItem, unequipItem, refreshPlayer } = useGameStore();
  const [setFilter, setSetFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('stars');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

  return (
    <div className="rune-select-overlay" onClick={onClose}>
      <div className="rune-select-modal" onClick={e => e.stopPropagation()}>
        <div className="rune-select-header">
          <h3>Select Item for Slot {slot}</h3>
          <button className="rune-select-close" onClick={onClose}>&#x2715;</button>
        </div>

        {/* Filters */}
        <div className="rune-select-filters">
          <select value={setFilter} onChange={e => setSetFilter(e.target.value)}>
            <option value="">All Sets</option>
            {ITEM_SETS.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
            <option value="stars">Stars</option>
            <option value="level">Level</option>
            <option value="grade">Grade</option>
            <option value="mainValue">Main Stat</option>
          </select>
        </div>

        <div className="rune-select-body">
          {/* Item list */}
          <div className="rune-select-list">
            {availableItems.length === 0 && (
              <div className="rune-select-empty">No items for slot {slot}</div>
            )}
            {availableItems.map(item => (
              <RuneCard
                key={item.itemId}
                item={item}
                selected={item.itemId === selectedItemId}
                equippedPokemonName={getEquippedPokemonName(item)}
                onClick={() => setSelectedItemId(item.itemId === selectedItemId ? null : item.itemId)}
              />
            ))}
          </div>

          {/* Stat preview */}
          <div className="rune-select-preview">
            <h4>Stat Preview</h4>
            <div className="rune-preview-stats">
              {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => {
                const current = currentStats[key];
                const preview = previewStats[key];
                const diff = preview - current;
                const isPct = PCT_STATS.includes(key);
                return (
                  <div key={key} className="rune-preview-row">
                    <span className="rune-preview-label">{STAT_LABELS[key]}</span>
                    <span className="rune-preview-current">{current}{isPct ? '%' : ''}</span>
                    <span className="rune-preview-arrow">&rarr;</span>
                    <span className={`rune-preview-new ${diff > 0 ? 'stat-up' : diff < 0 ? 'stat-down' : ''}`}>
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
        </div>

        {/* Actions */}
        <div className="rune-select-actions">
          {currentEquipped && (
            <button
              className="rune-remove-btn"
              onClick={handleRemove}
              disabled={playerStardust < ITEM_REMOVAL_COST}
            >
              Remove ({ITEM_REMOVAL_COST.toLocaleString()} ✦)
            </button>
          )}
          <button
            className="rune-equip-action-btn"
            onClick={handleEquip}
            disabled={!selectedItem}
          >
            Equip
          </button>
        </div>
      </div>
    </div>
  );
}
