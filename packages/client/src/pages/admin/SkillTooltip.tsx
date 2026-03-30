import { EFFECT_REGISTRY } from '@gatchamon/shared';
import type { SkillDefinition, SkillEffect } from '@gatchamon/shared';

const TARGET_LABELS: Record<string, string> = {
  single_enemy: 'Single Enemy', all_enemies: 'All Enemies',
  self: 'Self', single_ally: 'Single Ally', all_allies: 'All Allies',
};

function getEffectLabel(eff: SkillEffect): string {
  if (eff.id && EFFECT_REGISTRY[eff.id]) return EFFECT_REGISTRY[eff.id].name;
  return eff.type ?? 'Effect';
}

export function SkillTooltip({ skill, className }: { skill: SkillDefinition; className?: string }) {
  return (
    <div className={`admin-skill-tooltip${className ? ` ${className}` : ''}`}>
      <div className="admin-skill-tooltip-name">{skill.name}</div>
      <div className="admin-skill-tooltip-desc">{skill.description}</div>
      <div className="admin-skill-tooltip-stats">
        <span>Target: {TARGET_LABELS[skill.target] ?? skill.target}</span>
        {skill.multiplier > 0 && <span>Mult: {skill.multiplier}x</span>}
        {skill.cooldown > 0 && <span>CD: {skill.cooldown}t</span>}
        {skill.passiveTrigger && <span>Trigger: {skill.passiveTrigger}</span>}
      </div>
      {skill.effects.length > 0 && (
        <div className="admin-skill-tooltip-effects">
          {skill.effects.map((eff, i) => (
            <div key={i} className="admin-skill-tooltip-effect">
              <strong>{getEffectLabel(eff)}</strong>
              {eff.value !== 0 && <> · val:{eff.value}</>}
              {eff.duration > 0 && <> · {eff.duration}t</>}
              <> · {eff.chance}%</>
              {eff.target && <> · {TARGET_LABELS[eff.target] ?? eff.target}</>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
