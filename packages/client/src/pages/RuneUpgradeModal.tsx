import { useState } from 'react';
import type { HeldItemInstance, HeldItemSlot } from '@gatchamon/shared';
import { getUpgradeCost, getUpgradeSuccessRate, STAT_TYPE_LABELS, getItemSet, GRADE_COLORS, getItemSellValue } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { GameIcon, StarRating } from '../components/icons';
import './RuneUpgradeModal.css';

interface RuneUpgradeModalProps {
  item: HeldItemInstance;
  playerStardust: number;
  onClose: () => void;
  onEquipSlot?: (slot: HeldItemSlot) => void;
  hideChangeItem?: boolean;
}

export function RuneUpgradeModal({ item: initialItem, playerStardust, onClose, onEquipSlot, hideChangeItem }: RuneUpgradeModalProps) {
  const { upgradeItem: storeUpgrade, sellItem: storeSell, heldItems } = useGameStore();
  const tutorialStep = useTutorialStore(s => s.step);
  const isTutorial = tutorialStep === 16;
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [confirmSell, setConfirmSell] = useState(false);

  // Always read fresh item data from store
  const item = heldItems.find(i => i.itemId === initialItem.itemId) ?? initialItem;

  const setDef = getItemSet(item.setId);
  const gradeColor = GRADE_COLORS[item.grade];
  const isMaxLevel = item.level >= 15;
  const cost = isMaxLevel ? 0 : getUpgradeCost(item.level, item.stars);
  const successRate = isMaxLevel ? 0 : getUpgradeSuccessRate(item.level + 1);
  const canAfford = playerStardust >= cost;

  function handleUpgrade() {
    if (isMaxLevel || !canAfford || animating) return;
    setAnimating(true);
    setLastResult(null);

    // Small delay for UX
    setTimeout(() => {
      try {
        const result = storeUpgrade(item.itemId);
        if (result.success) {
          let msg = `Success! +${item.level + 1}`;
          if (result.newSubStat) {
            const label = STAT_TYPE_LABELS[result.newSubStat.type];
            msg += result.newSubStat.isNew
              ? ` — New sub: ${label} +${result.newSubStat.value}`
              : ` — ${label} +${result.newSubStat.value}`;
          }
          setLastResult({ success: true, message: msg });
        } else {
          setLastResult({ success: false, message: 'Upgrade failed!' });
        }
      } catch (err: any) {
        setLastResult({ success: false, message: err.message ?? 'Error' });
      }
      setAnimating(false);
    }, 300);
  }

  const pctDisplay = (type: string) =>
    type.includes('pct') || ['critRate', 'critDmg', 'acc', 'res'].includes(type) ? '%' : '';

  return (
    <div className="rune-upgrade-overlay" onClick={onClose}>
      <div className="rune-upgrade-modal" onClick={e => e.stopPropagation()}>
        <div className="rune-upgrade-header">
          <h3>Upgrade Item</h3>
          <button className="rune-upgrade-close" onClick={onClose}><GameIcon id="close" size={18} /></button>
        </div>

        <div className="rune-upgrade-content">
          {/* Item display */}
          <div className={`rune-upgrade-card ${animating ? 'rune-upgrading' : ''} ${lastResult?.success ? 'rune-upgrade-success' : ''}`}
               style={{ borderColor: gradeColor }}>
            <div className="rune-upgrade-card-top">
              <span className="rune-upgrade-icon"><GameIcon id={setDef?.icon} size={14} /></span>
              <span className="rune-upgrade-set">{setDef?.name}</span>
              <span className="rune-upgrade-slot">S{item.slot}</span>
            </div>
            <div className="rune-upgrade-stars" style={{ color: gradeColor }}>
              <StarRating count={item.stars} size={10} />
              <span className="rune-upgrade-grade">{item.grade}</span>
            </div>
            <div className="rune-upgrade-level">+{item.level}{isMaxLevel ? ' MAX' : ''}</div>

            <div className="rune-upgrade-main">
              <span>{STAT_TYPE_LABELS[item.mainStat]}</span>
              <span className="rune-upgrade-main-val">+{item.mainStatValue}{pctDisplay(item.mainStat)}</span>
            </div>

            {item.subStats.length > 0 && (
              <div className="rune-upgrade-subs">
                {item.subStats.map((sub, i) => (
                  <div key={i} className="rune-upgrade-sub">
                    <span>{STAT_TYPE_LABELS[sub.type]}</span>
                    <span>+{sub.value}{pctDisplay(sub.type)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Result message */}
          {lastResult && (
            <div className={`rune-upgrade-result ${lastResult.success ? 'result-success' : 'result-fail'}`}>
              {lastResult.message}
            </div>
          )}

          {/* Upgrade info */}
          {!isMaxLevel && (
            <div className="rune-upgrade-info">
              <div className="rune-upgrade-info-row">
                <span>Cost</span>
                <span><GameIcon id="stardust" size={12} /> {cost.toLocaleString()}</span>
              </div>
              <div className="rune-upgrade-info-row">
                <span>Success Rate</span>
                <span>{Math.round(successRate * 100)}%</span>
              </div>
              {(item.level + 1) % 3 === 0 && (item.level + 1) <= 12 && (
                <div className="rune-upgrade-info-row rune-upgrade-milestone">
                  <span>+{item.level + 1}</span>
                  <span>{item.subStats.length < 4 ? 'New sub stat!' : 'Sub stat upgrade!'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="rune-upgrade-actions">
          {!hideChangeItem && onEquipSlot && (
            <button className="rune-upgrade-swap-btn" onClick={() => onEquipSlot(item.slot)}>
              Change Item
            </button>
          )}
          {!isMaxLevel ? (
            <button
              className={`rune-upgrade-btn ${isTutorial ? 'tutorial-highlight' : ''}`}
              onClick={handleUpgrade}
              disabled={!canAfford || animating}
            >
              {animating ? 'Upgrading...' : <>Upgrade ({cost.toLocaleString()} <GameIcon id="stardust" size={12} />)</>}
            </button>
          ) : (
            <div className="rune-upgrade-maxed">MAX LEVEL</div>
          )}
        </div>

        {/* Sell */}
        <div className="rune-sell-section">
          {!confirmSell ? (
            <button
              className="rune-sell-btn"
              onClick={() => setConfirmSell(true)}
              disabled={item.equippedTo !== null}
              title={item.equippedTo !== null ? 'Unequip item first' : undefined}
            >
              Sell ({getItemSellValue(item).toLocaleString()} <GameIcon id="stardust" size={12} />)
            </button>
          ) : (
            <div className="rune-sell-confirm">
              <span>Sell for {getItemSellValue(item).toLocaleString()} <GameIcon id="stardust" size={12} />?</span>
              <button className="rune-sell-yes" onClick={() => { storeSell(item.itemId); onClose(); }}>Yes</button>
              <button className="rune-sell-no" onClick={() => setConfirmSell(false)}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
