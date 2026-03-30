import { useMemo, useState } from 'react';
import { SKILLS } from '@gatchamon/shared';
import type { PokemonType, SkillCategory, SkillDefinition } from '@gatchamon/shared';
import { useAdminStore } from './useAdminStore';
import { SkillTooltip } from './SkillTooltip';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'fairy', 'dark', 'steel',
];

const CATEGORIES: SkillCategory[] = ['basic', 'active', 'passive'];

const allSkills = Object.values(SKILLS);

export function AdminSkillPicker({ pokemonId, slotIndex }: { pokemonId: number; slotIndex: 0 | 1 | 2 }) {
  const { setSkillId, setSkillPickerSlot } = useAdminStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | ''>('');
  const [catFilter, setCatFilter] = useState<SkillCategory | ''>('');
  const [hoveredSkill, setHoveredSkill] = useState<SkillDefinition | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allSkills.filter(s => {
      if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      if (typeFilter && s.type !== typeFilter) return false;
      if (catFilter && s.category !== catFilter) return false;
      return true;
    }).slice(0, 200); // limit for performance
  }, [search, typeFilter, catFilter]);

  function handleSelect(skillId: string) {
    setSkillId(pokemonId, slotIndex, skillId);
    setSkillPickerSlot(null);
  }

  return (
    <div className="admin-skill-picker-overlay" onClick={() => setSkillPickerSlot(null)}>
      <div className="admin-skill-picker" onClick={e => e.stopPropagation()}>
        <div className="admin-skill-picker-header">
          <h3>Select Skill for S{slotIndex + 1}</h3>
          <button className="admin-btn" onClick={() => setSkillPickerSlot(null)}>Close</button>
        </div>

        <div className="admin-skill-picker-filters">
          <input
            className="admin-search"
            type="text"
            placeholder="Search skill name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <select
            className="admin-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as PokemonType | '')}
          >
            <option value="">All Types</option>
            {ALL_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="admin-select"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as SkillCategory | '')}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            {filtered.length}{filtered.length === 200 ? '+' : ''} results
          </span>
        </div>

        <div className="admin-skill-picker-list">
          {filtered.map(s => (
            <div
              key={s.id}
              className="admin-skill-picker-item"
              onClick={() => handleSelect(s.id)}
              onMouseEnter={() => setHoveredSkill(s)}
              onMouseLeave={() => setHoveredSkill(h => h?.id === s.id ? null : h)}
            >
              <span
                className="admin-skill-picker-item-type"
                style={{ background: `var(--type-${s.type})` }}
              >
                {s.type}
              </span>
              <span className="admin-skill-picker-item-name">{s.name}</span>
              <span className="admin-skill-picker-item-meta">
                {s.category} · {s.multiplier}x · {s.cooldown > 0 ? `${s.cooldown}t` : 'no CD'}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No skills found
            </div>
          )}
        </div>
        {hoveredSkill && <SkillTooltip skill={hoveredSkill} />}
      </div>
    </div>
  );
}
