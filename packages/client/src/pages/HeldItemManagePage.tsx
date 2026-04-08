import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import type { HeldItemInstance, HeldItemSlot, BaseStats } from '@gatchamon/shared';
import {
  ITEM_SETS, GRADE_COLORS, ITEM_REMOVAL_COST, STAT_TYPE_LABELS,
  getItemSet, getUpgradeCost, getUpgradeSuccessRate, getItemSellValue,
  computeStatsWithItems, computeStats, getActiveSetEffects,
} from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { HeldItemCard } from '../components/held-item/HeldItemCard';
import { GameIcon, StarRating } from '../components/icons';
import './HeldItemManagePage.css';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'CRI Rate', critDmg: 'CRI Dmg', acc: 'Accuracy', res: 'Resistance',
};
const PCT_STATS: Array<keyof BaseStats> = ['critRate', 'critDmg', 'acc', 'res'];

type SortOption = 'stars' | 'level' | 'grade' | 'mainValue';

export function HeldItemManagePage() {
  const { pokemonInstanceId } = useParams<{ pokemonInstanceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    collection, heldItems, player,
    equipItem, unequipItem, upgradeItem: storeUpgrade,
    sellItems: storeSellItems, refreshPlayer,
  } = useGameStore();

  const tutorialStep = useTutorialStore(s => s.step);

  const pokemon = collection.find(p => p.instance.instanceId === pokemonInstanceId);

  // Slot selection
  const initialSlot = Number(searchParams.get('slot') || 1) as HeldItemSlot;
  const [selectedSlot, setSelectedSlot] = useState<HeldItemSlot>(initialSlot);

  // Item selection in grid
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Upgrade state
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [animating, setAnimating] = useState(false);

  // Filter & sort
  const [setFilter, setSetFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('stars');

  // Sell mode
  const [sellMode, setSellMode] = useState(false);
  const [sellSelection, setSellSelection] = useState<Set<string>>(new Set());
  const [confirmBulkSell, setConfirmBulkSell] = useState(false);

  // Reset selection when slot changes
  useEffect(() => {
    setSelectedItemId(null);
    setLastResult(null);
  }, [selectedSlot]);

  if (!pokemon) {
    return (
      <div className="manage-page">
        <div className="manage-header">
          <button className="manage-back" onClick={() => navigate(-1)}><GameIcon id="back" size={18} /></button>
          <span className="manage-title">Items</span>
        </div>
        <div className="manage-empty">Pokemon not found</div>
      </div>
    );
  }

  const equippedItems = heldItems.filter(i => i.equippedTo === pokemon.instance.instanceId);
  const equippedBySlot: Record<number, HeldItemInstance | undefined> = {};
  for (const item of equippedItems) {
    equippedBySlot[item.slot] = item;
  }

  const currentEquipped = equippedBySlot[selectedSlot];
  // Always read fresh item data from store
  const equippedItem = currentEquipped
    ? heldItems.find(i => i.itemId === currentEquipped.itemId) ?? currentEquipped
    : null;

  // Available items for the selected slot
  const availableItems = useMemo(() => {
    let items = heldItems.filter(i => i.slot === selectedSlot);
    if (setFilter) items = items.filter(i => i.setId === setFilter);
    return [...items].sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'grade') {
        const gradeOrder: Record<string, number> = { legend: 4, hero: 3, rare: 2, common: 1 };
        return gradeOrder[b.grade] - gradeOrder[a.grade];
      }
      return b.mainStatValue - a.mainStatValue;
    });
  }, [heldItems, selectedSlot, setFilter, sortBy]);

  // Count items per set for this slot
  const slotItems = useMemo(() => heldItems.filter(i => i.slot === selectedSlot), [heldItems, selectedSlot]);
  const setCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const set of ITEM_SETS) counts[set.id] = 0;
    for (const item of slotItems) {
      counts[item.setId] = (counts[item.setId] ?? 0) + 1;
    }
    return counts;
  }, [slotItems]);

  const selectedItem = selectedItemId ? heldItems.find(i => i.itemId === selectedItemId) : null;

  // Stat preview
  const currentStats = computeStatsWithItems(pokemon.template, pokemon.instance.level, pokemon.instance.stars, equippedItems);
  const previewItems = selectedItem
    ? [...equippedItems.filter(i => i.slot !== selectedSlot), selectedItem]
    : equippedItems;
  const previewStats = computeStatsWithItems(pokemon.template, pokemon.instance.level, pokemon.instance.stars, previewItems);

  // Upgrade logic
  const isMaxLevel = equippedItem ? equippedItem.level >= 15 : false;
  const cost = equippedItem && !isMaxLevel ? getUpgradeCost(equippedItem.level, equippedItem.stars) : 0;
  const successRate = equippedItem && !isMaxLevel ? getUpgradeSuccessRate(equippedItem.level + 1) : 0;
  const canAfford = (player?.pokedollars ?? 0) >= cost;

  function handleUpgrade() {
    if (!equippedItem || isMaxLevel || !canAfford || animating) return;
    setAnimating(true);
    setLastResult(null);

    setTimeout(() => {
      try {
        const result = storeUpgrade(equippedItem.itemId);
        if (result.success) {
          let msg = `Success! +${equippedItem.level + 1}`;
          if (result.newSubStat) {
            const label = STAT_TYPE_LABELS[result.newSubStat.type as keyof typeof STAT_TYPE_LABELS];
            msg += result.newSubStat.isNew
              ? ` — New sub: ${label} +${result.newSubStat.value}`
              : ` — ${label} +${result.newSubStat.value}`;
          }
          setLastResult({ success: true, message: msg });
          // Tutorial step 16: advance when item upgraded
          if (tutorialStep === 16) {
            useTutorialStore.getState().advanceStep();
          }
        } else {
          setLastResult({ success: false, message: 'Upgrade failed!' });
        }
      } catch (err: any) {
        setLastResult({ success: false, message: err.message ?? 'Error' });
      }
      setAnimating(false);
    }, 300);
  }

  function handleEquip() {
    if (!selectedItem) return;
    equipItem(selectedItem.itemId, pokemon!.instance.instanceId);
    refreshPlayer();
    setSelectedItemId(null);
    // Tutorial step 15: advance when item equipped
    if (tutorialStep === 15) {
      useTutorialStore.getState().advanceStep();
    }
  }

  function handleRemove() {
    if (!equippedItem) return;
    if ((player?.pokedollars ?? 0) < ITEM_REMOVAL_COST) return;
    if (!confirm(`Remove item? This costs ${ITEM_REMOVAL_COST.toLocaleString()} Stardust.`)) return;
    unequipItem(equippedItem.itemId);
    refreshPlayer();
  }

  function getEquippedPokemonName(item: HeldItemInstance): string | null {
    if (!item.equippedTo || item.equippedTo === pokemon!.instance.instanceId) return null;
    const owner = collection.find(p => p.instance.instanceId === item.equippedTo);
    return owner?.template.name ?? null;
  }

  const pctDisplay = (type: string) =>
    type.includes('pct') || ['critRate', 'critDmg', 'acc', 'res'].includes(type) ? '%' : '';

  const totalSellValue = useMemo(() => {
    return Array.from(sellSelection).reduce((sum, id) => {
      const itm = heldItems.find(i => i.itemId === id);
      return sum + (itm ? getItemSellValue(itm) : 0);
    }, 0);
  }, [sellSelection, heldItems]);

  const gradeColor = equippedItem ? GRADE_COLORS[equippedItem.grade] : undefined;
  const setDef = equippedItem ? getItemSet(equippedItem.setId) : null;

  // Active set bonuses
  const activeEffects = getActiveSetEffects(equippedItems);
  const setCounts2: Record<string, number> = {};
  for (const item of equippedItems) {
    setCounts2[item.setId] = (setCounts2[item.setId] ?? 0) + 1;
  }
  const activeSetIds = new Set(activeEffects.map(e => e.setId));

  return (
    <div className="manage-page">
      {/* Header */}
      <div className="manage-header">
        <button className="manage-back" onClick={() => navigate(-1)}>
          <GameIcon id="back" size={16} />
        </button>
        <span className="manage-title">Items — {pokemon.template.name}</span>
        <div className="manage-header-actions">
          <select className="manage-sort" value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
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
        </div>
      </div>

      {/* Slot strip */}
      <div className="manage-slot-strip">
        {([1, 2, 3, 4, 5, 6] as HeldItemSlot[]).map(s => {
          const eq = equippedBySlot[s];
          const isTutorialTarget = s === 1 && tutorialStep === 15 && !equippedBySlot[1];
          return (
            <div
              key={s}
              className={`manage-slot ${selectedSlot === s ? 'manage-slot--active' : ''} ${isTutorialTarget ? 'tutorial-target' : ''}`}
              data-tutorial-id={s === 1 ? 'held-item-slot-1' : undefined}
              onClick={() => setSelectedSlot(s)}
            >
              {eq ? (
                <HeldItemCard item={eq} compact />
              ) : (
                <div className="manage-slot-empty">
                  <span className="manage-slot-num">{s}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="manage-body">
        {/* Equipped item detail + upgrade */}
        {equippedItem && setDef && (
          <div className="manage-equipped-section">
            <div
              className={`manage-equipped-card ${animating ? 'held-item-upgrading' : ''} ${lastResult?.success ? 'held-item-upgrade-success' : ''}`}
              style={{ borderColor: gradeColor }}
            >
              <div className="held-item-upgrade-card-top">
                <span className="held-item-upgrade-icon"><GameIcon id={setDef.icon} size={14} /></span>
                <span className="held-item-upgrade-set">{setDef.name}</span>
                <span className="held-item-upgrade-slot">S{equippedItem.slot}</span>
              </div>
              <div className="held-item-upgrade-stars" style={{ color: gradeColor }}>
                <StarRating count={equippedItem.stars} size={10} />
                <span className="held-item-upgrade-grade">{equippedItem.grade}</span>
              </div>
              <div className="held-item-upgrade-level">+{equippedItem.level}{isMaxLevel ? ' MAX' : ''}</div>

              <div className="held-item-upgrade-main">
                <span>{STAT_TYPE_LABELS[equippedItem.mainStat]}</span>
                <span className="held-item-upgrade-main-val">+{equippedItem.mainStatValue}{pctDisplay(equippedItem.mainStat)}</span>
              </div>

              {equippedItem.subStats.length > 0 && (
                <div className="held-item-upgrade-subs">
                  {equippedItem.subStats.map((sub, i) => (
                    <div key={i} className="held-item-upgrade-sub">
                      <span>{STAT_TYPE_LABELS[sub.type]}</span>
                      <span>+{sub.value}{pctDisplay(sub.type)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Result message */}
            {lastResult && (
              <div className={`held-item-upgrade-result ${lastResult.success ? 'result-success' : 'result-fail'}`}>
                {lastResult.message}
              </div>
            )}

            {/* Upgrade info + actions */}
            {!isMaxLevel && (
              <div className="held-item-upgrade-info">
                <div className="held-item-upgrade-info-row">
                  <span>Cost</span>
                  <span><GameIcon id="pokedollar" size={12} /> {cost.toLocaleString()}</span>
                </div>
                <div className="held-item-upgrade-info-row">
                  <span>Success Rate</span>
                  <span>{Math.round(successRate * 100)}%</span>
                </div>
                {(equippedItem.level + 1) % 3 === 0 && (equippedItem.level + 1) <= 12 && (
                  <div className="held-item-upgrade-info-row held-item-upgrade-milestone">
                    <span>+{equippedItem.level + 1}</span>
                    <span>{equippedItem.subStats.length < 4 ? 'New sub stat!' : 'Sub stat upgrade!'}</span>
                  </div>
                )}
              </div>
            )}

            <div className="manage-equipped-actions">
              {!isMaxLevel ? (
                <button
                  className={`held-item-upgrade-btn ${tutorialStep === 16 ? 'tutorial-highlight' : ''}`}
                  onClick={handleUpgrade}
                  disabled={!canAfford || animating}
                >
                  {animating ? 'Upgrading...' : <>Upgrade ({cost.toLocaleString()} <GameIcon id="pokedollar" size={12} />)</>}
                </button>
              ) : (
                <div className="held-item-upgrade-maxed">MAX LEVEL</div>
              )}
              <button
                className="held-item-remove-btn"
                onClick={handleRemove}
                disabled={(player?.pokedollars ?? 0) < ITEM_REMOVAL_COST}
              >
                Remove ({ITEM_REMOVAL_COST.toLocaleString()} <GameIcon id="pokedollar" size={12} />)
              </button>
            </div>
          </div>
        )}

        {!equippedItem && (
          <div className="manage-empty-slot-prompt">
            Select an item below to equip in Slot {selectedSlot}
          </div>
        )}

        {/* Set bonuses */}
        {Object.keys(setCounts2).length > 0 && (
          <div className="manage-set-bonuses">
            {Object.entries(setCounts2).map(([setId, count]) => {
              const sd = ITEM_SETS.find(s => s.id === setId);
              if (!sd) return null;
              const isActive = activeSetIds.has(setId);
              const eff = activeEffects.find(e => e.setId === setId);
              return (
                <div key={setId} className={`held-item-set-bonus ${!isActive ? 'held-item-set-bonus--inactive' : ''}`} style={{ borderColor: isActive ? sd.color : undefined }}>
                  <span className="held-item-set-icon">{sd.icon}</span>
                  <span className="held-item-set-name">{sd.name} ({count}/{sd.pieces})</span>
                  <span className={`held-item-set-desc ${!isActive ? 'held-item-set-desc--hidden' : ''}`}>
                    {isActive && eff
                      ? (eff.effectType === 'stat'
                        ? `${eff.bonusStat?.toUpperCase()} +${eff.bonusValue}${eff.bonusType === 'percent' ? '%' : ''}`
                        : sd.procDescription)
                      : '???'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Item selection grid */}
        <div className="manage-select-section">
          {/* Set filter tabs */}
          <div className="manage-filter-strip">
            <button
              className={`manage-filter-tab ${setFilter === '' ? 'manage-filter-tab--active' : ''}`}
              onClick={() => setSetFilter('')}
            >
              All <span className="manage-filter-count">{slotItems.length}</span>
            </button>
            {ITEM_SETS.map(set => (
              <button
                key={set.id}
                className={`manage-filter-tab ${setFilter === set.id ? 'manage-filter-tab--active' : ''}`}
                style={setFilter === set.id ? { borderColor: set.color } : undefined}
                onClick={() => setSetFilter(set.id)}
              >
                <GameIcon id={set.icon} size={12} />
                <span className="manage-filter-count">{setCounts[set.id] ?? 0}</span>
              </button>
            ))}
          </div>

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

          {/* Item grid */}
          <div className="manage-item-grid">
            {availableItems.length === 0 && (
              <div className="manage-grid-empty">No items for slot {selectedSlot}</div>
            )}
            {availableItems.map((item, idx) => {
              const isEquipped = item.equippedTo !== null;
              const isSellSelected = sellSelection.has(item.itemId);
              const tutorialHighlightItem = tutorialStep === 15 && idx === 0 && !selectedItemId;
              return (
                <HeldItemCard
                  key={item.itemId}
                  item={item}
                  selected={sellMode ? isSellSelected : item.itemId === selectedItemId}
                  equippedPokemonName={getEquippedPokemonName(item)}
                  className={tutorialHighlightItem ? 'tutorial-highlight' : undefined}
                  onClick={() => {
                    if (sellMode) {
                      if (isEquipped) return;
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

          {/* Stat preview chips */}
          {!sellMode && (
            <div className="manage-stat-preview">
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
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="manage-actions-bar">
        {sellMode ? (
          confirmBulkSell ? (
            <div className="held-item-sell-confirm" style={{ flex: 1 }}>
              <span>Sell {sellSelection.size} items for {totalSellValue.toLocaleString()} <GameIcon id="pokedollar" size={12} />?</span>
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
              style={{ flex: 1 }}
            >
              Sell {sellSelection.size} ({totalSellValue.toLocaleString()} <GameIcon id="pokedollar" size={12} />)
            </button>
          )
        ) : (
          <>
            {equippedItem && currentEquipped && (
              <button
                className="held-item-remove-btn"
                onClick={handleRemove}
                disabled={(player?.pokedollars ?? 0) < ITEM_REMOVAL_COST}
                style={{ display: 'none' }}
              >
                Remove
              </button>
            )}
            <button
              className={`held-item-equip-action-btn ${tutorialStep === 15 && selectedItem ? 'tutorial-highlight' : ''}`}
              onClick={handleEquip}
              disabled={!selectedItem}
              style={{ flex: 1 }}
            >
              Equip
            </button>
          </>
        )}
      </div>
    </div>
  );
}
