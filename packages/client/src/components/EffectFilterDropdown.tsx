import { useState, useMemo } from 'react';
import { EFFECT_REGISTRY } from '@gatchamon/shared';
import type { EffectId } from '@gatchamon/shared';
import type { EffectMeta } from '@gatchamon/shared';
import './EffectFilterDropdown.css';

interface Props {
  selected: Set<EffectId>;
  onChange: (next: Set<EffectId>) => void;
}

const CATEGORY_LABELS: Record<EffectMeta['category'], string> = {
  buff: 'Buffs',
  debuff: 'Debuffs',
  status: 'Status',
  instant: 'Instant',
};

const CATEGORIES: EffectMeta['category'][] = ['buff', 'debuff', 'status', 'instant'];

export function EffectFilterDropdown({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);



  const grouped = useMemo(() => {
    const groups: Record<EffectMeta['category'], { id: EffectId; meta: EffectMeta }[]> = {
      buff: [], debuff: [], status: [], instant: [],
    };
    for (const [id, meta] of Object.entries(EFFECT_REGISTRY)) {
      groups[meta.category].push({ id: id as EffectId, meta });
    }
    return groups;
  }, []);

  function toggle(id: EffectId) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  return (
    <div className="effect-filter">
      <button
        className={`pdex-toggle ${selected.size > 0 ? 'pdex-toggle--active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        Effects{selected.size > 0 && ` (${selected.size})`}
      </button>

      {open && (
        <div className="effect-filter__panel">
          <div className="effect-filter__header">
            <span className="effect-filter__title">Filter by Effect</span>
            <div className="effect-filter__actions">
              {selected.size > 0 && (
                <button
                  className="effect-filter__clear"
                  onClick={() => onChange(new Set())}
                >
                  Clear
                </button>
              )}
              <button className="effect-filter__close" onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
          {CATEGORIES.map(cat => (
            <div key={cat} className="effect-filter__category">
              <div className="effect-filter__category-label">{CATEGORY_LABELS[cat]}</div>
              <div className="effect-filter__chips">
                {grouped[cat].map(({ id, meta }) => {
                  const active = selected.has(id);
                  return (
                    <button
                      key={id}
                      className={`effect-filter__chip ${active ? 'effect-filter__chip--active' : ''}`}
                      style={{
                        '--chip-color': meta.color,
                      } as React.CSSProperties}
                      onClick={() => toggle(id)}
                    >
                      {meta.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
