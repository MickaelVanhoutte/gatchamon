import { useNavigate } from 'react-router-dom';
import type { HeldItemInstance, HeldItemSlot, BaseStats } from '@gatchamon/shared';
import { computeStatsWithItems, computeStats, getActiveSetEffects, ITEM_SETS } from '@gatchamon/shared';
import type { OwnedPokemon } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { HeldItemCard } from '../components/held-item/HeldItemCard';
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
}

export function HeldItemEquipPanel({ pokemon, heldItems, player }: HeldItemEquipPanelProps) {
  const navigate = useNavigate();
  const tutorialStep = useTutorialStore(s => s.step);

  const equippedItems = heldItems.filter(i => i.equippedTo === pokemon.instance.instanceId);
  const equippedBySlot: Record<number, HeldItemInstance | undefined> = {};
  for (const item of equippedItems) {
    equippedBySlot[item.slot] = item;
  }

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

  return (
    <div className="held-item-equip-panel">
      <div className="held-item-slots-grid">
        {([1, 2, 3, 4, 5, 6] as HeldItemSlot[]).map(s => {
          const equipped = equippedBySlot[s];
          return (
            <div
              key={s}
              className={`held-item-slot ${s === 1 && (tutorialStep === 15 || tutorialStep === 16) ? 'tutorial-target' : ''}`}
              data-tutorial-id={s === 1 ? 'held-item-slot-1' : undefined}
              onClick={() => navigate(`/items/${pokemon.instance.instanceId}?slot=${s}`)}
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
        <button className="held-item-equip-btn" onClick={() => navigate(`/items/${pokemon.instance.instanceId}`)} style={{ flex: 1 }}>
          Manage Items
        </button>
        <button className="held-item-equip-btn" onClick={() => navigate('/inventory')} style={{ flex: 1 }}>
          View All
        </button>
      </div>
    </div>
  );
}
