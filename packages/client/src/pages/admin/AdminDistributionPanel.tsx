import { useMemo, useState } from 'react';
import { POKEDEX } from '@gatchamon/shared';
import { useAdminStore } from './useAdminStore';
import { STAR_COLORS } from './constants';

interface StarBucket {
  total: number;
  summonable: number;
  nonSummonable: number;
}

export function AdminDistributionPanel() {
  const { diffs, getEffective } = useAdminStore();
  const [includeForms, setIncludeForms] = useState(false);
  const [applyDiffs, setApplyDiffs] = useState(true);

  const buckets = useMemo(() => {
    const map: Record<number, StarBucket> = {
      1: { total: 0, summonable: 0, nonSummonable: 0 },
      2: { total: 0, summonable: 0, nonSummonable: 0 },
      3: { total: 0, summonable: 0, nonSummonable: 0 },
      4: { total: 0, summonable: 0, nonSummonable: 0 },
      5: { total: 0, summonable: 0, nonSummonable: 0 },
    };

    for (const t of POKEDEX) {
      if (!includeForms && t.id >= 10000) continue;
      const eff = applyDiffs ? getEffective(t) : t;
      const bucket = map[eff.naturalStars];
      if (!bucket) continue;
      bucket.total++;
      if (eff.summonable === false) {
        bucket.nonSummonable++;
      } else {
        bucket.summonable++;
      }
    }

    return map;
  }, [includeForms, applyDiffs, diffs, getEffective]);

  const maxTotal = Math.max(...Object.values(buckets).map(b => b.total), 1);
  const totalSummonable = Object.values(buckets).reduce((s, b) => s + b.summonable, 0);
  const grandTotal = Object.values(buckets).reduce((s, b) => s + b.total, 0);

  return (
    <div className="admin-distribution">
      <h2 className="admin-distribution-title">Star Distribution</h2>

      <div className="admin-distribution-options">
        <label className="admin-toggle">
          <input type="checkbox" checked={includeForms} onChange={e => setIncludeForms(e.target.checked)} />
          Include Forms
        </label>
        {diffs.size > 0 && (
          <label className="admin-toggle">
            <input type="checkbox" checked={applyDiffs} onChange={e => setApplyDiffs(e.target.checked)} />
            Apply Pending Diffs ({diffs.size})
          </label>
        )}
      </div>

      <div className="admin-distribution-chart">
        {[1, 2, 3, 4, 5].map(star => {
          const b = buckets[star];
          return (
            <div key={star} className="admin-distribution-row">
              <div className="admin-distribution-label" style={{ color: STAR_COLORS[star] }}>
                {'★'.repeat(star)}
              </div>
              <div className="admin-distribution-bars">
                <div
                  className="admin-distribution-bar"
                  style={{
                    width: `${(b.summonable / maxTotal) * 100}%`,
                    backgroundColor: STAR_COLORS[star],
                  }}
                >
                  {b.summonable > 0 && <span className="admin-distribution-bar-label">{b.summonable}</span>}
                </div>
                {b.nonSummonable > 0 && (
                  <div
                    className="admin-distribution-bar admin-distribution-bar--ns"
                    style={{
                      width: `${(b.nonSummonable / maxTotal) * 100}%`,
                      backgroundColor: STAR_COLORS[star],
                    }}
                  >
                    <span className="admin-distribution-bar-label">{b.nonSummonable}</span>
                  </div>
                )}
              </div>
              <div className="admin-distribution-count">
                {b.total}
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-distribution-legend">
        <span className="admin-distribution-legend-item">
          <span className="admin-distribution-legend-swatch" /> Summonable
        </span>
        <span className="admin-distribution-legend-item">
          <span className="admin-distribution-legend-swatch admin-distribution-legend-swatch--ns" /> Not Summonable
        </span>
      </div>

      <table className="admin-distribution-table">
        <thead>
          <tr>
            <th>Star</th>
            <th>Summonable</th>
            <th>Not Summ.</th>
            <th>Total</th>
            <th>% of Pool</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(star => {
            const b = buckets[star];
            return (
              <tr key={star}>
                <td style={{ color: STAR_COLORS[star] }}>{'★'.repeat(star)}</td>
                <td>{b.summonable}</td>
                <td>{b.nonSummonable}</td>
                <td>{b.total}</td>
                <td>{totalSummonable > 0 ? (b.summonable / totalSummonable * 100).toFixed(1) : '0.0'}%</td>
              </tr>
            );
          })}
          <tr className="admin-distribution-total-row">
            <td>Total</td>
            <td>{totalSummonable}</td>
            <td>{grandTotal - totalSummonable}</td>
            <td>{grandTotal}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
