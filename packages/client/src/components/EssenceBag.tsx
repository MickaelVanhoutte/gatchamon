import { useState, useCallback } from 'react';
import { TIER_LABELS } from '@gatchamon/shared';
import type { EssenceTier } from '@gatchamon/shared';
import { GameIcon } from './icons';
import { useGameStore } from '../stores/gameStore';
import { getOwnedEssences, calculateMergeCost, getMaxMergeCount } from '../services/essence-merge.service';
import './EssenceBag.css';

const TIER_ORDER: EssenceTier[] = ['low', 'mid', 'high'];

export function EssenceBag() {
  const { player, mergeEssences } = useGameStore();
  const [expandedElement, setExpandedElement] = useState<string | null>(null);
  const [targetTier, setTargetTier] = useState<'mid' | 'high'>('mid');
  const [targetCount, setTargetCount] = useState(1);

  if (!player) return null;

  const materials = player.materials ?? {};
  const essences = getOwnedEssences(materials);

  const mergePanelRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [expandedElement]);

  const handleToggle = (element: string) => {
    if (expandedElement === element) {
      setExpandedElement(null);
    } else {
      setExpandedElement(element);
      setTargetTier('mid');
      setTargetCount(1);
    }
  };

  const handleMerge = (element: string) => {
    const low = materials[`${element}_low`] ?? 0;
    const mid = materials[`${element}_mid`] ?? 0;
    const cost = calculateMergeCost(targetTier, targetCount, low, mid);
    if (!cost) return;

    const costParts: string[] = [];
    if (cost.lowConsumed > 0) costParts.push(`${cost.lowConsumed} Low`);
    if (cost.midConsumed > 0) costParts.push(`${cost.midConsumed} Mid`);

    mergeEssences(element, targetTier, targetCount);

    // Reset count if it exceeds new max
    const newMaterials = useGameStore.getState().player?.materials ?? {};
    const newLow = newMaterials[`${element}_low`] ?? 0;
    const newMid = newMaterials[`${element}_mid`] ?? 0;
    const newMax = getMaxMergeCount(targetTier, newLow, newMid);
    if (targetCount > newMax) setTargetCount(Math.max(1, newMax));
  };

  return (
    <div className="essence-bag">
      <div className="essence-bag-title">Essence Bag</div>

      {essences.length === 0 ? (
        <div className="essence-empty">
          No essences yet.<br />
          Complete dungeons to earn essences!
        </div>
      ) : (
        <div className="essence-list" data-nested-scroll>
          {essences.map(ess => {
            const isExpanded = expandedElement === ess.element;
            const low = ess.low;
            const mid = ess.mid;
            const high = ess.high;

            const maxCount = isExpanded ? getMaxMergeCount(targetTier, low, mid) : 0;
            const cost = isExpanded && maxCount > 0
              ? calculateMergeCost(targetTier, Math.min(targetCount, maxCount), low, mid)
              : null;

            return (
              <div key={ess.element} className="essence-row">
                <div className="essence-row-header" onClick={() => handleToggle(ess.element)}>
                  <div className="essence-row-icon">
                    <GameIcon id={ess.element} size={14} color={`var(--type-${ess.element})`} />
                  </div>
                  <div className="essence-row-name">{ess.element}</div>
                  <div className="essence-row-counts">
                    {TIER_ORDER.map(tier => {
                      const count = tier === 'low' ? low : tier === 'mid' ? mid : high;
                      if (count === 0) return null;
                      return (
                        <span key={tier} className={`essence-tier-badge essence-tier-badge--${tier}`}>
                          {TIER_LABELS[tier][0]}{count}
                        </span>
                      );
                    })}
                  </div>
                  <span className={`essence-row-chevron ${isExpanded ? 'open' : ''}`}>
                    &#9654;
                  </span>
                </div>

                {isExpanded && (
                  <div className="essence-merge-panel" ref={mergePanelRef}>
                    <div className="essence-merge-tier-toggle">
                      <button
                        className={`essence-merge-tier-btn ${targetTier === 'mid' ? 'active' : ''}`}
                        disabled={getMaxMergeCount('mid', low, mid) === 0}
                        onClick={() => { setTargetTier('mid'); setTargetCount(1); }}
                      >
                        Merge to Mid
                      </button>
                      <button
                        className={`essence-merge-tier-btn ${targetTier === 'high' ? 'active' : ''}`}
                        disabled={getMaxMergeCount('high', low, mid) === 0}
                        onClick={() => { setTargetTier('high'); setTargetCount(1); }}
                      >
                        Merge to High
                      </button>
                    </div>

                    {maxCount > 0 ? (
                      <>
                        <div className="essence-merge-qty">
                          <span className="essence-merge-qty-label">Produce:</span>
                          <div className="essence-merge-qty-stepper">
                            <button
                              className="essence-merge-qty-btn"
                              disabled={targetCount <= 1}
                              onClick={() => setTargetCount(c => Math.max(1, c - 1))}
                            >
                              -
                            </button>
                            <span className="essence-merge-qty-value">{Math.min(targetCount, maxCount)}</span>
                            <button
                              className="essence-merge-qty-btn"
                              disabled={targetCount >= maxCount}
                              onClick={() => setTargetCount(c => Math.min(maxCount, c + 1))}
                            >
                              +
                            </button>
                          </div>
                          <span className="essence-merge-qty-max">/ {maxCount}</span>
                        </div>

                        {cost && (
                          <div className="essence-merge-cost">
                            {cost.lowConsumed > 0 && (
                              <span className="essence-merge-cost-val">{cost.lowConsumed} Low</span>
                            )}
                            {cost.lowConsumed > 0 && cost.midConsumed > 0 && ' + '}
                            {cost.midConsumed > 0 && (
                              <span className="essence-merge-cost-val">{cost.midConsumed} Mid</span>
                            )}
                            {' '}<span className="essence-merge-arrow">&rarr;</span>{' '}
                            <span className="essence-merge-cost-val">
                              {cost.targetCount} {TIER_LABELS[cost.targetTier]}
                            </span>
                          </div>
                        )}

                        <button
                          className="essence-merge-confirm"
                          disabled={!cost}
                          onClick={() => handleMerge(ess.element)}
                        >
                          Merge
                        </button>
                      </>
                    ) : (
                      <div className="essence-merge-cost">
                        Not enough essences to merge to {TIER_LABELS[targetTier]}.
                        {targetTier === 'mid' ? ' Need at least 10 Low.' : ' Need at least 10 Mid (or 100 Low).'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
