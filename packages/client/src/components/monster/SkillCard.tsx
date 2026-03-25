import type { SkillDefinition } from '@gatchamon/shared';

const EFFECT_LABELS: Record<string, string> = {
  buff: 'Buff',
  debuff: 'Debuff',
  dot: 'DoT',
  heal: 'Heal',
  stun: 'Stun',
};

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic',
  active: 'Active',
  passive: 'Passive',
};

const TARGET_LABELS: Record<string, string> = {
  single_enemy: 'Single Enemy',
  all_enemies: 'All Enemies',
  self: 'Self',
  single_ally: 'Single Ally',
  all_allies: 'All Allies',
};

export function SkillCard({ skill, index }: { skill: SkillDefinition; index: number }) {
  return (
    <div className="skill-card">
      <div className="skill-card-header">
        <span className="skill-card-index">S{index}</span>
        <span className="skill-card-name">{skill.name}</span>
        <span className="skill-card-type" style={{ background: `var(--type-${skill.type})` }}>
          {skill.type}
        </span>
      </div>

      <p className="skill-card-desc">{skill.description}</p>

      <div className="skill-card-stats">
        <div className="skill-meta-row">
          <span className="skill-meta-label">Category</span>
          <span className="skill-meta-value">{CATEGORY_LABELS[skill.category]}</span>
        </div>
        <div className="skill-meta-row">
          <span className="skill-meta-label">Multiplier</span>
          <span className="skill-meta-value">{skill.multiplier > 0 ? `${skill.multiplier}x` : '—'}</span>
        </div>
        <div className="skill-meta-row">
          <span className="skill-meta-label">Cooldown</span>
          <span className="skill-meta-value">{skill.cooldown > 0 ? `${skill.cooldown} turns` : 'None'}</span>
        </div>
        <div className="skill-meta-row">
          <span className="skill-meta-label">Target</span>
          <span className="skill-meta-value">{TARGET_LABELS[skill.target]}</span>
        </div>
      </div>

      {skill.effects.length > 0 && (
        <div className="skill-effects">
          {skill.effects.map((eff, i) => (
            <div key={i} className="skill-effect">
              <span className={`skill-effect-type skill-effect--${eff.type}`}>
                {EFFECT_LABELS[eff.type]}
              </span>
              <span className="skill-effect-detail">
                {eff.stat && (
                  <>{eff.stat.toUpperCase()} {eff.value > 0 ? '+' : ''}{eff.value} · </>
                )}
                {eff.duration}t · {eff.chance}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
