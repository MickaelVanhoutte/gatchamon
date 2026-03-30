import type { SkillDefinition, SkillEffect } from '@gatchamon/shared';
import { getSkillMultiplierBonus, MAX_SKILL_LEVEL, EFFECT_REGISTRY } from '@gatchamon/shared';

const EFFECT_LABELS: Record<string, string> = {
  buff: 'Buff',
  debuff: 'Debuff',
  dot: 'DoT',
  heal: 'Heal',
  stun: 'Stun',
};

function getEffectLabel(eff: SkillEffect): string {
  if (eff.id && EFFECT_REGISTRY[eff.id]) return EFFECT_REGISTRY[eff.id].name;
  return EFFECT_LABELS[eff.type ?? 'buff'] ?? 'Effect';
}

function getEffectTypeClass(eff: SkillEffect): string {
  if (eff.id && EFFECT_REGISTRY[eff.id]) return EFFECT_REGISTRY[eff.id].category;
  return eff.type ?? 'buff';
}

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

export function SkillCard({ skill, index, skillLevel = 1, isAbility = false }: { skill: SkillDefinition; index: number; skillLevel?: number; isAbility?: boolean }) {
  const bonus = getSkillMultiplierBonus(skillLevel);
  const effectiveMultiplier = skill.multiplier > 0
    ? Math.round(skill.multiplier * bonus * 100) / 100
    : 0;
  const hasBonus = skillLevel > 1 && skill.multiplier > 0;

  return (
    <div className="skill-card">
      <div className="skill-card-header">
        <span className="skill-card-index">{isAbility ? 'A' : `S${index}`}</span>
        <span className="skill-card-name">{skill.name}</span>
        <span className="skill-card-level">
          Lv.{skillLevel}/{MAX_SKILL_LEVEL}
        </span>
        <span className="skill-card-type" style={{ background: `var(--type-${skill.type})` }}>
          {skill.type}
        </span>
      </div>

      <p className="skill-card-desc">{skill.description}</p>

      <div className="skill-card-stats">
        <div className="skill-meta-row">
          <span className="skill-meta-label">Category</span>
          <span className="skill-meta-value">{isAbility ? 'Ability' : CATEGORY_LABELS[skill.category]}</span>
        </div>
        <div className="skill-meta-row">
          <span className="skill-meta-label">Multiplier</span>
          <span className="skill-meta-value">
            {effectiveMultiplier > 0
              ? <>{effectiveMultiplier}x{hasBonus && <span className="skill-bonus"> (+{Math.round((bonus - 1) * 100)}%)</span>}</>
              : '—'}
          </span>
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
              <span className={`skill-effect-type skill-effect--${getEffectTypeClass(eff)}`}>
                {getEffectLabel(eff)}
              </span>
              <span className="skill-effect-detail">
                {eff.value !== 0 && <>{eff.value > 0 ? '+' : ''}{eff.value} · </>}
                {eff.duration}t · {eff.chance}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
