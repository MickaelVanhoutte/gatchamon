import { useState } from 'react';
import { EFFECT_REGISTRY } from '@gatchamon/shared';
import type {
  SkillDefinition, SkillEffect, SkillTarget, SkillCategory,
  PokemonType, PassiveTrigger, EffectId,
} from '@gatchamon/shared';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'fairy', 'dark', 'steel',
];

const TARGETS: { value: SkillTarget; label: string }[] = [
  { value: 'single_enemy', label: 'Single Enemy' },
  { value: 'all_enemies', label: 'All Enemies' },
  { value: 'self', label: 'Self' },
  { value: 'single_ally', label: 'Single Ally' },
  { value: 'all_allies', label: 'All Allies' },
];

const CATEGORIES: SkillCategory[] = ['basic', 'active', 'passive'];

const PASSIVE_TRIGGERS: PassiveTrigger[] = [
  'battle_start', 'turn_start', 'on_attack', 'on_hit', 'on_hit_received',
  'on_crit', 'on_kill', 'on_ally_death', 'hp_threshold', 'always',
];

// Group effects by category for the dropdown
const EFFECT_GROUPS = (() => {
  const groups: Record<string, { id: EffectId; name: string }[]> = {
    buff: [], debuff: [], status: [], instant: [],
  };
  for (const [id, meta] of Object.entries(EFFECT_REGISTRY)) {
    groups[meta.category].push({ id: id as EffectId, name: meta.name });
  }
  return groups;
})();

function defaultEffect(): SkillEffect {
  return { id: 'atk_buff' as EffectId, value: 0, duration: 2, chance: 100 };
}

interface Props {
  skill: SkillDefinition;
  onSave: (skill: SkillDefinition) => void;
  onClose: () => void;
}

export function AdminSkillEditor({ skill, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<SkillDefinition>(() => structuredClone(skill));

  function updateField<K extends keyof SkillDefinition>(key: K, value: SkillDefinition[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function updateEffect(index: number, patch: Partial<SkillEffect>) {
    setDraft(d => {
      const effects = [...d.effects];
      effects[index] = { ...effects[index], ...patch };
      return { ...d, effects };
    });
  }

  function addEffect() {
    setDraft(d => ({ ...d, effects: [...d.effects, defaultEffect()] }));
  }

  function removeEffect(index: number) {
    setDraft(d => ({ ...d, effects: d.effects.filter((_, i) => i !== index) }));
  }

  return (
    <div className="admin-skill-editor">
      <div className="admin-skill-editor-header">
        <span className="admin-section-title" style={{ margin: 0 }}>Edit Skill</span>
        <div className="admin-skill-editor-actions">
          <button className="admin-btn" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(draft)}>Save</button>
        </div>
      </div>

      {/* Name & Description */}
      <div className="admin-skill-editor-row">
        <label className="admin-skill-editor-label">Name</label>
        <input
          className="admin-skill-editor-input"
          value={draft.name}
          onChange={e => updateField('name', e.target.value)}
        />
      </div>
      <div className="admin-skill-editor-row">
        <label className="admin-skill-editor-label">Desc</label>
        <textarea
          className="admin-skill-editor-textarea"
          value={draft.description}
          onChange={e => updateField('description', e.target.value)}
          rows={2}
        />
      </div>

      {/* Type, Category, Target */}
      <div className="admin-skill-editor-grid">
        <div className="admin-skill-editor-row">
          <label className="admin-skill-editor-label">Type</label>
          <select
            className="admin-select"
            value={draft.type}
            onChange={e => updateField('type', e.target.value as PokemonType)}
          >
            {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="admin-skill-editor-row">
          <label className="admin-skill-editor-label">Category</label>
          <select
            className="admin-select"
            value={draft.category}
            onChange={e => updateField('category', e.target.value as SkillCategory)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="admin-skill-editor-row">
          <label className="admin-skill-editor-label">Target</label>
          <select
            className="admin-select"
            value={draft.target}
            onChange={e => updateField('target', e.target.value as SkillTarget)}
          >
            {TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="admin-skill-editor-row">
          <label className="admin-skill-editor-label">Cooldown</label>
          <input
            className="admin-skill-editor-input admin-skill-editor-input--sm"
            type="number"
            min={0}
            value={draft.cooldown}
            onChange={e => updateField('cooldown', Number(e.target.value) || 0)}
          />
        </div>
        <div className="admin-skill-editor-row">
          <label className="admin-skill-editor-label">Multiplier</label>
          <input
            className="admin-skill-editor-input admin-skill-editor-input--sm"
            type="number"
            min={0}
            step={0.1}
            value={draft.multiplier}
            onChange={e => updateField('multiplier', Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Passive fields */}
      {draft.category === 'passive' && (
        <div className="admin-skill-editor-grid" style={{ marginTop: 6 }}>
          <div className="admin-skill-editor-row">
            <label className="admin-skill-editor-label">Trigger</label>
            <select
              className="admin-select"
              value={draft.passiveTrigger ?? 'battle_start'}
              onChange={e => updateField('passiveTrigger', e.target.value as PassiveTrigger)}
            >
              {PASSIVE_TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {draft.passiveTrigger === 'hp_threshold' && (
            <div className="admin-skill-editor-row">
              <label className="admin-skill-editor-label">HP Below %</label>
              <input
                className="admin-skill-editor-input admin-skill-editor-input--sm"
                type="number"
                min={1}
                max={100}
                value={draft.passiveCondition?.hpBelow ?? 50}
                onChange={e => updateField('passiveCondition', { hpBelow: Number(e.target.value) || 50 })}
              />
            </div>
          )}
        </div>
      )}

      {/* Effects */}
      <div className="admin-skill-editor-effects">
        <div className="admin-skill-editor-effects-header">
          <span className="admin-section-title" style={{ margin: 0 }}>Effects ({draft.effects.length})</span>
          <button className="admin-btn" onClick={addEffect}>+ Add</button>
        </div>
        {draft.effects.map((eff, i) => (
          <div key={i} className="admin-skill-effect-row">
            <select
              className="admin-select admin-skill-effect-select"
              value={eff.id ?? ''}
              onChange={e => updateEffect(i, { id: (e.target.value || undefined) as EffectId | undefined })}
            >
              <option value="">-- Select --</option>
              {Object.entries(EFFECT_GROUPS).map(([cat, effects]) => (
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {effects.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <label className="admin-skill-effect-field">
              <span>Val</span>
              <input
                type="number"
                value={eff.value}
                onChange={e => updateEffect(i, { value: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="admin-skill-effect-field">
              <span>Dur</span>
              <input
                type="number"
                min={0}
                value={eff.duration}
                onChange={e => updateEffect(i, { duration: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="admin-skill-effect-field">
              <span>%</span>
              <input
                type="number"
                min={0}
                max={100}
                value={eff.chance}
                onChange={e => updateEffect(i, { chance: Number(e.target.value) || 0 })}
              />
            </label>
            <select
              className="admin-select admin-skill-effect-target"
              value={eff.target ?? ''}
              onChange={e => updateEffect(i, { target: (e.target.value || undefined) as SkillTarget | undefined })}
            >
              <option value="">Inherit</option>
              {TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button
              className="admin-skill-effect-remove"
              onClick={() => removeEffect(i)}
              title="Remove effect"
            >
              &times;
            </button>
          </div>
        ))}
        {draft.effects.length === 0 && (
          <div className="admin-skill-editor-empty">No effects</div>
        )}
      </div>
    </div>
  );
}
