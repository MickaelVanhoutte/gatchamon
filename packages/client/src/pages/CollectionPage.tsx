import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { OwnedPokemon } from '../stores/gameStore';
import { computeStats, getSkillsForPokemon } from '@gatchamon/shared';
import type { PokemonType, BaseStats, SkillDefinition } from '@gatchamon/shared';
import './CollectionPage.css';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon',
];

type SortBy = 'stars' | 'level' | 'name';
type DetailTab = 'info' | 'skill';

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fbbf24',
};

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  spd: 'SPD',
  critRate: 'CRI Rate',
  critDmg: 'CRI Dmg',
  acc: 'Accuracy',
  res: 'Resistance',
};

export function CollectionPage() {
  const { collection, loadCollection } = useGameStore();
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('stars');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  // Auto-select first monster
  useEffect(() => {
    if (!selectedId && collection.length > 0) {
      setSelectedId(collection[0].instance.instanceId);
    }
  }, [collection, selectedId]);

  const filtered = collection
    .filter(mon => !typeFilter || mon.template.types.includes(typeFilter))
    .sort((a, b) => {
      if (sortBy === 'stars') return b.instance.stars - a.instance.stars;
      if (sortBy === 'level') return b.instance.level - a.instance.level;
      return a.template.name.localeCompare(b.template.name);
    });

  const selected: OwnedPokemon | undefined = collection.find(
    m => m.instance.instanceId === selectedId,
  );

  const selectedStats = selected
    ? computeStats(selected.template, selected.instance.level, selected.instance.stars)
    : null;

  const selectedSkills = selected
    ? getSkillsForPokemon(selected.template.skillIds)
    : [];

  return (
    <div className="page collection-page">
      {/* Header */}
      <div className="box-header">
        <span className="box-title">Monster {collection.length}/120</span>
        <button className="box-close" onClick={() => history.back()}>✕</button>
      </div>

      <div className="box-layout">
        {/* Left: Compact grid */}
        <div className="box-grid-panel">
          <div className="box-grid">
            {filtered.map(mon => {
              const starColor = STAR_COLORS[mon.instance.stars] ?? STAR_COLORS[1];
              const isSelected = mon.instance.instanceId === selectedId;
              return (
                <div
                  key={mon.instance.instanceId}
                  className={`box-cell ${isSelected ? 'box-cell--selected' : ''}`}
                  onClick={() => setSelectedId(mon.instance.instanceId)}
                >
                  <div className="box-cell-stars" style={{ color: starColor }}>
                    {'★'.repeat(mon.instance.stars)}
                  </div>
                  <img
                    className="box-cell-sprite"
                    src={mon.template.spriteUrl}
                    alt={mon.template.name}
                  />
                  <div className="box-cell-level">
                    <span className="box-cell-lock">🔒</span>
                    {mon.instance.level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="box-detail-panel">
          {selected && selectedStats ? (
            <>
              {/* Tabs */}
              <div className="box-tabs">
                <button
                  className={`box-tab ${activeTab === 'info' ? 'box-tab--active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >Info</button>
                <button
                  className={`box-tab ${activeTab === 'skill' ? 'box-tab--active' : ''}`}
                  onClick={() => setActiveTab('skill')}
                >Skill</button>
              </div>

              <div className="box-detail-content">
              {activeTab === 'info' ? (
                <>
                {/* Monster info */}
                <div className="box-detail-info">
                  <div className="box-detail-header">
                    <span className="box-detail-name">{selected.template.name}</span>
                    <span className="box-detail-stars" style={{ color: STAR_COLORS[selected.instance.stars] }}>
                      {'★'.repeat(selected.instance.stars)}
                    </span>
                  </div>

                  <div className="box-detail-exp">
                    <span className="box-detail-exp-label">EXP</span>
                    <div className="box-detail-exp-bar">
                      <div
                        className="box-detail-exp-fill"
                        style={{ width: `${(selected.instance.exp / (selected.instance.level * 100)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats table */}
                  <div className="box-stats">
                    <div className="box-stat-row">
                      <span className="box-stat-label">Level</span>
                      <span className="box-stat-value">{selected.instance.level} / 40</span>
                    </div>
                    {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => (
                      <div key={key} className="box-stat-row">
                        <span className="box-stat-label">{STAT_LABELS[key]}</span>
                        <span className="box-stat-value">
                          {key === 'critRate' || key === 'critDmg' || key === 'acc' || key === 'res'
                            ? `${selectedStats[key]}%`
                            : selectedStats[key]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Types */}
                  <div className="box-detail-types">
                    {selected.template.types.map(t => (
                      <span key={t} className="box-type-badge" style={{ background: `var(--type-${t})` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                </>
              ) : (
                /* Skill tab */
                <div className="box-skills">
                  {selectedSkills.map((skill, i) => (
                    <SkillCard key={skill.id} skill={skill} index={i + 1} />
                  ))}
                </div>
              )}

              {/* Filters at bottom */}
              <div className="box-filters">
                <div className="box-filter-row">
                  <select
                    className="box-sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                  >
                    <option value="stars">Grade</option>
                    <option value="level">Level</option>
                    <option value="name">Name</option>
                  </select>
                  <select
                    className="box-type-select"
                    value={typeFilter ?? ''}
                    onChange={e => setTypeFilter((e.target.value || null) as PokemonType | null)}
                  >
                    <option value="">All Types</option>
                    {ALL_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              </div>
            </>
          ) : (
            <div className="box-detail-empty">
              <p>Select a monster</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

function SkillCard({ skill, index }: { skill: SkillDefinition; index: number }) {
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
