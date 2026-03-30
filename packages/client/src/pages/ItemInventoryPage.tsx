import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeldItemInstance, HeldItemSlot } from '@gatchamon/shared';
import { ITEM_SETS, MAX_HELD_ITEMS, GRADE_COLORS, getItemSellValue } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { RuneCard } from '../components/rune/RuneCard';
import { RuneUpgradeModal } from './RuneUpgradeModal';
import { GameIcon } from '../components/icons';
import './ItemInventoryPage.css';

type SortOption = 'stars' | 'level' | 'grade' | 'mainValue';

const SLOT_LABELS: Record<number, string> = {
  1: 'Slot 1',
  2: 'Slot 2',
  3: 'Slot 3',
  4: 'Slot 4',
  5: 'Slot 5',
  6: 'Slot 6',
};

function sortItems(items: HeldItemInstance[], sortBy: SortOption): HeldItemInstance[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'level') return b.level - a.level;
    if (sortBy === 'grade') {
      const gradeOrder: Record<string, number> = { legend: 4, hero: 3, rare: 2, common: 1 };
      return gradeOrder[b.grade] - gradeOrder[a.grade];
    }
    return b.mainStatValue - a.mainStatValue;
  });
}

export function ItemInventoryPage() {
  const navigate = useNavigate();
  const { heldItems, collection, player, loadHeldItems, loadCollection, sellItems: storeSellItems, refreshPlayer } = useGameStore();

  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<HeldItemSlot | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('stars');
  const [sellMode, setSellMode] = useState(false);
  const [sellSelection, setSellSelection] = useState<Set<string>>(new Set());
  const [confirmBulkSell, setConfirmBulkSell] = useState(false);
  const [upgradeItemId, setUpgradeItemId] = useState<string | null>(null);

  useEffect(() => {
    loadHeldItems();
    loadCollection();
  }, [loadHeldItems, loadCollection]);

  // Pokemon name lookup map
  const pokemonNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of collection) {
      map.set(p.instance.instanceId, p.template.name);
    }
    return map;
  }, [collection]);

  // Count items per set
  const setCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const set of ITEM_SETS) counts[set.id] = 0;
    for (const item of heldItems) {
      counts[item.setId] = (counts[item.setId] ?? 0) + 1;
    }
    return counts;
  }, [heldItems]);

  // Filter items based on selected set and slot
  const filteredItems = useMemo(() => {
    let items = heldItems;
    if (selectedSetId) items = items.filter(i => i.setId === selectedSetId);
    if (selectedSlot) items = items.filter(i => i.slot === selectedSlot);
    return sortItems(items, sortBy);
  }, [heldItems, selectedSetId, selectedSlot, sortBy]);

  // Group filtered items by slot
  const groupedBySlot = useMemo(() => {
    const groups: Record<number, HeldItemInstance[]> = {};
    for (let s = 1; s <= 6; s++) groups[s] = [];
    for (const item of filteredItems) {
      groups[item.slot].push(item);
    }
    return groups;
  }, [filteredItems]);

  const upgradeItem = upgradeItemId ? heldItems.find(i => i.itemId === upgradeItemId) : null;

  function getEquippedPokemonName(item: HeldItemInstance): string | null {
    if (!item.equippedTo) return null;
    return pokemonNameMap.get(item.equippedTo) ?? null;
  }

  function handleItemClick(item: HeldItemInstance) {
    if (sellMode) {
      if (item.equippedTo !== null) return; // can't sell equipped items
      const next = new Set(sellSelection);
      if (next.has(item.itemId)) next.delete(item.itemId);
      else next.add(item.itemId);
      setSellSelection(next);
      setConfirmBulkSell(false);
    } else {
      setUpgradeItemId(item.itemId);
    }
  }

  function handleBulkSell() {
    storeSellItems(Array.from(sellSelection));
    setSellMode(false);
    setSellSelection(new Set());
    setConfirmBulkSell(false);
    refreshPlayer();
  }

  const totalSellValue = useMemo(() => {
    return Array.from(sellSelection).reduce((sum, id) => {
      const itm = heldItems.find(i => i.itemId === id);
      return sum + (itm ? getItemSellValue(itm) : 0);
    }, 0);
  }, [sellSelection, heldItems]);

  // Capacity status
  const capacityPct = heldItems.length / MAX_HELD_ITEMS;
  const capacityClass = capacityPct >= 1 ? 'inventory-capacity--full' : capacityPct >= 0.9 ? 'inventory-capacity--warning' : '';

  // Determine if we should show slot sections or a flat list
  const showSlotSections = selectedSlot === null;

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header">
        <div className="inventory-title">
          Items
          <span className={`inventory-capacity ${capacityClass}`}>
            {heldItems.length}/{MAX_HELD_ITEMS}
          </span>
        </div>
        <div className="inventory-header-actions">
          <select className="inventory-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
            <option value="stars">Stars</option>
            <option value="level">Level</option>
            <option value="grade">Grade</option>
            <option value="mainValue">Main Stat</option>
          </select>
          <button
            className={`rune-sell-mode-btn ${sellMode ? 'active' : ''}`}
            onClick={() => { setSellMode(!sellMode); setSellSelection(new Set()); setConfirmBulkSell(false); }}
          >
            {sellMode ? 'Cancel' : 'Sell'}
          </button>
          <button className="inventory-close-btn" onClick={() => navigate(-1)}>
            <GameIcon id="close" size={18} />
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="inventory-layout">
        {/* Sidebar */}
        <div className="inventory-sidebar">
          <div className="inventory-sidebar-section">
            <span className="inventory-sidebar-label">Sets</span>
            <button
              className={`inventory-sidebar-item ${selectedSetId === null ? 'inventory-sidebar-item--active' : ''}`}
              onClick={() => setSelectedSetId(null)}
            >
              <span className="inventory-sidebar-item-name">All</span>
              <span className="inventory-sidebar-item-count">{heldItems.length}</span>
            </button>
            {ITEM_SETS.map(set => (
              <button
                key={set.id}
                className={`inventory-sidebar-item ${selectedSetId === set.id ? 'inventory-sidebar-item--active' : ''}`}
                style={selectedSetId === set.id ? { borderColor: set.color } : undefined}
                onClick={() => setSelectedSetId(set.id)}
              >
                <GameIcon id={set.icon} size={14} />
                <span className="inventory-sidebar-item-name">{set.name}</span>
                <span className="inventory-sidebar-item-count">{setCounts[set.id] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Slot filter */}
          <div className="inventory-slot-tabs">
            <button
              className={`inventory-slot-tab ${selectedSlot === null ? 'inventory-slot-tab--active' : ''}`}
              onClick={() => setSelectedSlot(null)}
            >
              All
            </button>
            {([1, 2, 3, 4, 5, 6] as HeldItemSlot[]).map(s => (
              <button
                key={s}
                className={`inventory-slot-tab ${selectedSlot === s ? 'inventory-slot-tab--active' : ''}`}
                onClick={() => setSelectedSlot(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="inventory-main">
          {filteredItems.length === 0 ? (
            <div className="inventory-empty">No items found</div>
          ) : showSlotSections ? (
            // Grouped by slot
            ([1, 2, 3, 4, 5, 6] as HeldItemSlot[]).map(slot => {
              const slotItems = groupedBySlot[slot];
              if (slotItems.length === 0) return null;
              return (
                <div key={slot} className="inventory-section">
                  <div className="inventory-section-header">
                    <span className="inventory-section-title">{SLOT_LABELS[slot]}</span>
                    <span className="inventory-section-count">{slotItems.length} items</span>
                  </div>
                  <div className="inventory-grid">
                    {slotItems.map(item => (
                      <RuneCard
                        key={item.itemId}
                        item={item}
                        selected={sellMode ? sellSelection.has(item.itemId) : false}
                        equippedPokemonName={getEquippedPokemonName(item)}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Flat grid (specific slot selected)
            <div className="inventory-grid">
              {filteredItems.map(item => (
                <RuneCard
                  key={item.itemId}
                  item={item}
                  selected={sellMode ? sellSelection.has(item.itemId) : false}
                  equippedPokemonName={getEquippedPokemonName(item)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sell mode action bar */}
      {sellMode && (
        <div className="inventory-sell-bar">
          {confirmBulkSell ? (
            <div className="rune-sell-confirm" style={{ flex: 1 }}>
              <span>Sell {sellSelection.size} items for {totalSellValue.toLocaleString()} <GameIcon id="stardust" size={12} />?</span>
              <button className="rune-sell-yes" onClick={handleBulkSell}>Yes</button>
              <button className="rune-sell-no" onClick={() => setConfirmBulkSell(false)}>No</button>
            </div>
          ) : (
            <button
              className="rune-sell-bulk-btn"
              disabled={sellSelection.size === 0}
              onClick={() => setConfirmBulkSell(true)}
            >
              Sell {sellSelection.size} items ({totalSellValue.toLocaleString()} <GameIcon id="stardust" size={12} />)
            </button>
          )}
        </div>
      )}

      {/* Upgrade modal */}
      {upgradeItem && (
        <RuneUpgradeModal
          item={upgradeItem}
          playerStardust={player?.stardust ?? 0}
          onClose={() => setUpgradeItemId(null)}
          hideChangeItem
        />
      )}
    </div>
  );
}
