import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { GameIcon, StarRating } from '../components/icons';
import {
  ACTIVE_POKEDEX,
  computeStats,
  getSkillsForPokemon,
  getTemplate,
  getEvolutionLineage,
  getActiveEvolutionsFrom,
} from '@gatchamon/shared';
import type { PokemonType, PokemonTemplate, BaseStats } from '@gatchamon/shared';
import { assetUrl } from '../utils/asset-url';
import { SkillCard } from '../components/monster/SkillCard';
import './CollectionPage.css';
import './PokedexPage.css';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'fairy', 'dark', 'steel',
];

type SortBy = 'id' | 'stars' | 'name';
type DetailTab = 'info' | 'skill';

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#ff4444',
  6: '#ff6b6b',
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

export function PokedexPage() {
  const navigate = useNavigate();
  const { collection, loadCollection } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('id');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [showForms, setShowForms] = useState(false);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const ownedTemplateIds = useMemo(
    () => new Set(collection.map(c => c.instance.templateId)),
    [collection],
  );

  const filtered = useMemo(() => {
    return ACTIVE_POKEDEX
      .filter(t => {
        if (!showForms && t.id >= 15000) return false;
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (typeFilter && !t.types.includes(typeFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'id') return a.id - b.id;
        if (sortBy === 'stars') return b.naturalStars - a.naturalStars || a.id - b.id;
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, typeFilter, sortBy, showForms]);

  const selected = selectedId != null ? getTemplate(selectedId) : null;

  const selectedStats = selected
    ? computeStats(selected, 1, selected.naturalStars)
    : null;

  const selectedSkills = selected
    ? getSkillsForPokemon(selected.skillIds)
    : [];

  const lineage = selected
    ? getEvolutionLineage(selected.id)
    : [];

  const evolutions = selected
    ? getActiveEvolutionsFrom(selected.id)
    : [];

  const ownedCount = useMemo(
    () => ACTIVE_POKEDEX.filter(t => (showForms || t.id < 15000) && ownedTemplateIds.has(t.id)).length,
    [ownedTemplateIds, showForms],
  );

  const totalCount = useMemo(
    () => ACTIVE_POKEDEX.filter(t => showForms || t.id < 15000).length,
    [showForms],
  );

  return (
    <div className="page pokedex-page">
      {/* Header */}
      <div className="box-header">
        <span className="box-title">
          Pokedex {ownedCount}/{totalCount}
        </span>
        <button className="box-close" onClick={() => navigate('/collection')}><GameIcon id="close" size={18} /></button>
      </div>

      <div className="box-layout">
        {/* Left: Grid */}
        <div className="box-grid-panel">
          {/* Filters */}
          <div className="pdex-filters">
            <input
              className="pdex-search"
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="pdex-filter-row">
              <select
                className="box-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
              >
                <option value="id">Dex #</option>
                <option value="stars">Stars</option>
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
              <button
                className={`pdex-toggle ${showForms ? 'pdex-toggle--active' : ''}`}
                onClick={() => setShowForms(!showForms)}
              >
                Forms
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="box-grid">
            {filtered.map(template => {
              const owned = ownedTemplateIds.has(template.id);
              const isSelected = template.id === selectedId;
              const starColor = STAR_COLORS[template.naturalStars] ?? STAR_COLORS[1];
              return (
                <div
                  key={template.id}
                  className={`box-cell ${isSelected ? 'box-cell--selected' : ''} ${!owned ? 'pdex-cell--unowned' : ''}`}
                  onClick={() => setSelectedId(template.id)}
                >
                  {owned && <div className="pdex-owned-badge" />}
                  <div className="box-cell-stars" style={{ color: starColor }}>
                    <StarRating count={template.naturalStars} size={10} />
                  </div>
                  <img
                    className="box-cell-sprite"
                    src={assetUrl(template.spriteUrl)}
                    alt={template.name}
                    loading="lazy"
                  />
                  <div className="pdex-cell-name">{template.name}</div>
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
                  <div className="box-detail-info">
                    {/* Name + stars */}
                    <div className="box-detail-header">
                      <span className="box-detail-name">{selected.name}</span>
                      <span className="box-detail-stars" style={{ color: STAR_COLORS[selected.naturalStars] }}>
                        <StarRating count={selected.naturalStars} size={10} />
                      </span>
                    </div>

                    {/* Dex # */}
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      #{selected.id.toString().padStart(3, '0')}
                      {selected.summonable === false && (
                        <span className="pdex-summonable pdex-summonable--no" style={{ marginLeft: 6 }}>
                          Not Summonable
                        </span>
                      )}
                      {selected.summonable !== false && (
                        <span className="pdex-summonable pdex-summonable--yes" style={{ marginLeft: 6 }}>
                          Summonable
                        </span>
                      )}
                    </div>

                    {/* Types */}
                    <div className="box-detail-types">
                      {selected.types.map(t => (
                        <span key={t} className="box-type-badge" style={{ background: `var(--type-${t})` }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Base Stats at natural stars */}
                    <div className="box-stats">
                      <div className="box-stat-row">
                        <span className="box-stat-label">Base (Lv.1)</span>
                        <span className="box-stat-value" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                          <StarRating count={selected.naturalStars} size={10} />
                        </span>
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

                    {/* Evolution chain */}
                    {lineage.length > 1 && (
                      <div className="pdex-evo-section">
                        <span className="pdex-evo-label">Evolution Chain</span>
                        <div className="pdex-evo-chain">
                          {lineage.map((id, i) => {
                            const tmpl = getTemplate(id);
                            if (!tmpl) return null;
                            const isOwned = ownedTemplateIds.has(id);
                            return (
                              <span key={id} style={{ display: 'contents' }}>
                                {i > 0 && <span className="pdex-evo-arrow"><GameIcon id="arrow_right" size={12} /></span>}
                                <div
                                  className={`pdex-evo-node ${id === selected.id ? 'pdex-evo-node--current' : ''} ${isOwned ? 'pdex-evo-node--owned' : 'pdex-evo-node--unowned'}`}
                                  onClick={() => setSelectedId(id)}
                                >
                                  <img
                                    className="pdex-evo-sprite"
                                    src={assetUrl(tmpl.spriteUrl)}
                                    alt={tmpl.name}
                                  />
                                  <span className="pdex-evo-name">{tmpl.name}</span>
                                </div>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Branching evolutions (if any beyond lineage) */}
                    {evolutions.length > 1 && (
                      <div className="pdex-evo-section">
                        <span className="pdex-evo-label">Evolves Into</span>
                        <div className="pdex-evo-chain">
                          {evolutions.map(chain => {
                            const tmpl = getTemplate(chain.to);
                            if (!tmpl) return null;
                            const isOwned = ownedTemplateIds.has(chain.to);
                            return (
                              <div
                                key={chain.to}
                                className={`pdex-evo-node ${isOwned ? 'pdex-evo-node--owned' : 'pdex-evo-node--unowned'}`}
                                onClick={() => setSelectedId(chain.to)}
                              >
                                <img
                                  className="pdex-evo-sprite"
                                  src={assetUrl(tmpl.spriteUrl)}
                                  alt={tmpl.name}
                                />
                                <span className="pdex-evo-name">{tmpl.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Skill tab */
                  <div className="box-skills">
                    {selectedSkills.map((skill, i) => (
                      <SkillCard key={skill.id} skill={skill} index={i + 1} />
                    ))}
                  </div>
                )}
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
