import { useState } from 'react';
import { EFFECT_REGISTRY } from '@gatchamon/shared';
import type { EffectId } from '@gatchamon/shared';

type Category = 'buff' | 'debuff' | 'status' | 'instant';

const CATEGORY_LABELS: Record<Category, string> = {
  buff: 'Buffs',
  debuff: 'Debuffs',
  status: 'Status Effects',
  instant: 'Instant Effects',
};

const CATEGORIES: Category[] = ['buff', 'debuff', 'status', 'instant'];

const grouped = (() => {
  const groups: Record<Category, { id: EffectId; meta: (typeof EFFECT_REGISTRY)[EffectId] }[]> = {
    buff: [], debuff: [], status: [], instant: [],
  };
  for (const [id, meta] of Object.entries(EFFECT_REGISTRY)) {
    groups[meta.category].push({ id: id as EffectId, meta });
  }
  return groups;
})();

export function AdminEffectsPanel() {
  const [filter, setFilter] = useState<Category | 'all'>('all');

  const cats = filter === 'all' ? CATEGORIES : [filter];

  return (
    <div className="admin-effects-panel">
      <h2 className="admin-effects-title">Effects Reference</h2>
      <div className="admin-effects-filters">
        <button
          className={`admin-btn${filter === 'all' ? ' admin-btn--primary' : ''}`}
          onClick={() => setFilter('all')}
        >All</button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`admin-btn${filter === c ? ' admin-btn--primary' : ''}`}
            onClick={() => setFilter(c)}
          >{CATEGORY_LABELS[c]}</button>
        ))}
      </div>

      {cats.map(cat => (
        <div key={cat} className="admin-effects-group">
          <h3 className="admin-effects-group-title">{CATEGORY_LABELS[cat]}</h3>
          <div className="admin-effects-list">
            {grouped[cat].map(({ id, meta }) => (
              <div key={id} className="admin-effects-card">
                <div className="admin-effects-card-header">
                  <span
                    className="admin-effects-card-dot"
                    style={{ background: meta.color }}
                  />
                  <span className="admin-effects-card-name">{meta.name}</span>
                  <span className="admin-effects-card-id">{id}</span>
                </div>
                <div className="admin-effects-card-desc">{meta.description}</div>
                <div className="admin-effects-card-tags">
                  {meta.unique && <span className="admin-effects-tag">unique</span>}
                  {meta.maxStacks && <span className="admin-effects-tag">max {meta.maxStacks} stacks</span>}
                  {meta.statMod && (
                    <span className="admin-effects-tag">
                      {meta.statMod.stat} {meta.statMod.percent > 0 ? '+' : ''}{meta.statMod.percent}%
                      {meta.statMod.perStack ? '/stack' : ''}
                    </span>
                  )}
                  {meta.dot && <span className="admin-effects-tag">DoT {meta.dot.percentHp}% HP/turn</span>}
                  {meta.hot && <span className="admin-effects-tag">HoT {meta.hot.percentHp}% HP/turn</span>}
                  {meta.cc && <span className="admin-effects-tag">CC: {meta.cc}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
