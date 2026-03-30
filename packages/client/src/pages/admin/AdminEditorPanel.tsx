import { useCallback, useRef, useState } from 'react';
import type { PokemonTemplate, BaseStats } from '@gatchamon/shared';
import { SKILLS } from '@gatchamon/shared';
import { assetUrl } from '../../utils/asset-url';
import { useAdminStore } from './useAdminStore';
import { SkillTooltip } from './SkillTooltip';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'CRI Rate', critDmg: 'CRI Dmg', acc: 'ACC', res: 'RES',
};

const STAT_KEYS: (keyof BaseStats)[] = ['hp', 'atk', 'def', 'spd', 'critRate', 'critDmg', 'acc', 'res'];

const CATEGORY_SHORT: Record<string, string> = {
  basic: 'Basic', active: 'Active', passive: 'Passive',
};

export function AdminEditorPanel({ template }: { template: PokemonTemplate }) {
  const {
    diffs, getEffective, setStars, setSummonable, setStat,
    resetPokemon, setSkillPickerSlot,
  } = useAdminStore();

  const diff = diffs.get(template.id);
  const eff = getEffective(template);
  const hasDiff = !!diff;

  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((slot: number) => {
    longPressTimer.current = setTimeout(() => setHoveredSlot(slot), 400);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setHoveredSlot(null);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="admin-editor-header">
        <img className="admin-editor-sprite" src={assetUrl(template.spriteUrl)} alt={template.name} />
        <div className="admin-editor-info">
          <h2>{template.name}</h2>
          <span className="admin-id">#{template.id}</span>
          <div className="admin-editor-types">
            {template.types.map(t => (
              <span key={t} className="admin-type-badge" style={{ background: `var(--type-${t})` }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-editor-body">
        {/* Stars */}
        <div className="admin-section">
          <div className="admin-section-title">
            Natural Stars
            {diff?.naturalStars !== undefined && (
              <span style={{ color: '#f59e0b', marginLeft: 6, fontSize: 11 }}>
                (was {template.naturalStars})
              </span>
            )}
          </div>
          <div className="admin-stars-row">
            {([1, 2, 3, 4, 5] as const).map(s => (
              <button
                key={s}
                className={`admin-star-btn${s <= eff.naturalStars ? ' admin-star-btn--active' : ''}${diff?.naturalStars !== undefined ? ' admin-star-btn--modified' : ''}`}
                onClick={() => setStars(template.id, s)}
                title={`${s} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Summonable */}
        <div className="admin-section">
          <div className="admin-section-title">Summonable</div>
          <div className="admin-summon-row">
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={eff.summonable !== false}
                onChange={e => setSummonable(template.id, e.target.checked)}
              />
              <span className="admin-switch-slider" />
            </label>
            <span className="admin-summon-label">
              {eff.summonable !== false ? 'Yes' : 'No'}
              {diff?.summonable !== undefined && (
                <span style={{ color: '#f59e0b', marginLeft: 6, fontSize: 11 }}>
                  (was {(template.summonable ?? true) ? 'Yes' : 'No'})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Base Stats */}
        <div className="admin-section">
          <div className="admin-section-title">Base Stats</div>
          <div className="admin-stats-grid">
            {STAT_KEYS.map(key => {
              const origVal = template.baseStats[key];
              const curVal = eff.baseStats[key];
              const modified = diff?.baseStats?.[key] !== undefined;
              return (
                <div key={key} className={`admin-stat-field${modified ? ' admin-stat-field--modified' : ''}`}>
                  <span className="admin-stat-label">{STAT_LABELS[key]}</span>
                  <input
                    className="admin-stat-input"
                    type="number"
                    value={curVal}
                    onChange={e => {
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setStat(template.id, key, v);
                    }}
                    min={0}
                  />
                  {modified && (
                    <>
                      <span className="admin-stat-orig">{origVal}</span>
                      <button
                        className="admin-stat-revert"
                        title="Revert"
                        onClick={() => setStat(template.id, key, origVal)}
                      >
                        ↩
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="admin-section">
          <div className="admin-section-title">Skills</div>
          {eff.skillIds.map((skillId, i) => {
            const skill = SKILLS[skillId];
            const origSkillId = template.skillIds[i];
            const modified = diff?.skillIds !== undefined && diff.skillIds[i] !== origSkillId;
            return (
              <div
                key={i}
                className={`admin-skill-slot${modified ? ' admin-skill-slot--modified' : ''}`}
                onMouseEnter={() => setHoveredSlot(i)}
                onMouseLeave={() => setHoveredSlot(null)}
                onTouchStart={() => handleTouchStart(i)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <span className="admin-skill-index">S{i + 1}</span>
                <div className="admin-skill-info">
                  <div className="admin-skill-name">
                    {skill?.name ?? skillId}
                    {skill && (
                      <span
                        className="admin-type-badge"
                        style={{ background: `var(--type-${skill.type})`, marginLeft: 6, fontSize: 10 }}
                      >
                        {skill.type}
                      </span>
                    )}
                  </div>
                  <div className="admin-skill-meta">
                    {skill ? `${CATEGORY_SHORT[skill.category]} · ${skill.cooldown > 0 ? `${skill.cooldown}t CD` : 'No CD'} · ${skill.multiplier}x` : 'Unknown skill'}
                    {modified && (
                      <span style={{ color: '#f59e0b', marginLeft: 6 }}>
                        (was: {SKILLS[origSkillId]?.name ?? origSkillId})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="admin-skill-change-btn"
                  onClick={() => setSkillPickerSlot(i)}
                >
                  Change
                </button>
                {hoveredSlot === i && skill && (
                  <SkillTooltip skill={skill} className="admin-skill-tooltip--floating" />
                )}
              </div>
            );
          })}
        </div>

        {/* Reset */}
        {hasDiff && (
          <div className="admin-reset-row">
            <button
              className="admin-btn admin-btn--danger"
              onClick={() => resetPokemon(template.id)}
            >
              Reset {template.name}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
