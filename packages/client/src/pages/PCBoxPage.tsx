import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { GameIcon, StarRating } from '../components/icons';
import type { PokemonType, BaseStats } from '@gatchamon/shared';
import { computeStats, getSkillsForPokemon, isActivePokemon, describeLeaderSkill } from '@gatchamon/shared';
import { staticSpriteUrl } from '../utils/asset-url';
import { SkillCard } from '../components/monster/SkillCard';
import './CollectionPage.css';
import './PCBoxPage.css';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon',
];

type SortBy = 'stars' | 'name';
type DetailTab = 'info' | 'skill';

const STAR_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#fbbf24',
  5: '#f87171',
  6: '#fbbf24',
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

interface PCStack {
  key: string;
  templateId: number;
  stars: number;
  isShiny: boolean;
  count: number;
  instanceIds: string[];
  representative: { templateId: number; stars: number; isShiny: boolean; level: number; skillLevels?: [number, number, number] };
  templateName: string;
  spriteUrl: string;
  types: PokemonType[];
}

export function PCBoxPage() {
  const navigate = useNavigate();
  const { pcBox, loadPcBox, transferFromPC } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('stars');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [transferQty, setTransferQty] = useState(1);

  useEffect(() => {
    loadPcBox();
  }, [loadPcBox]);

  // Build stacks
  const stacks = useMemo(() => {
    const map = new Map<string, PCStack>();
    for (const mon of pcBox) {
      if (!isActivePokemon(mon.instance.templateId)) continue;
      const key = `${mon.instance.templateId}-${mon.instance.stars}-${mon.instance.isShiny ? 1 : 0}`;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
        existing.instanceIds.push(mon.instance.instanceId);
      } else {
        map.set(key, {
          key,
          templateId: mon.instance.templateId,
          stars: mon.instance.stars,
          isShiny: mon.instance.isShiny,
          count: 1,
          instanceIds: [mon.instance.instanceId],
          representative: {
            templateId: mon.instance.templateId,
            stars: mon.instance.stars,
            isShiny: mon.instance.isShiny,
            level: mon.instance.level,
            skillLevels: mon.instance.skillLevels as [number, number, number] | undefined,
          },
          templateName: mon.template.name,
          spriteUrl: mon.template.spriteUrl,
          types: mon.template.types,
        });
      }
    }
    return Array.from(map.values());
  }, [pcBox]);

  const totalPcCount = pcBox.length;

  const filtered = useMemo(() => {
    return stacks
      .filter(s => {
        if (searchQuery && !s.templateName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (typeFilter && !s.types.includes(typeFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stars - a.stars || a.templateName.localeCompare(b.templateName);
        return a.templateName.localeCompare(b.templateName);
      });
  }, [stacks, searchQuery, typeFilter, sortBy]);

  const selected = selectedKey ? stacks.find(s => s.key === selectedKey) : undefined;

  // Reset transfer qty when selection changes
  useEffect(() => {
    setTransferQty(1);
  }, [selectedKey]);

  const selectedTemplate = selected
    ? pcBox.find(m => m.instance.templateId === selected.templateId)?.template
    : undefined;

  const selectedStats = selected && selectedTemplate
    ? computeStats(selectedTemplate, selected.representative.level, selected.representative.stars as 1 | 2 | 3 | 4 | 5 | 6)
    : null;

  const selectedSkills = selectedTemplate
    ? getSkillsForPokemon(selectedTemplate.skillIds)
    : [];

  function handleTransfer() {
    if (!selected) return;
    const ids = selected.instanceIds.slice(0, transferQty);
    transferFromPC(ids);
    if (transferQty >= selected.count) {
      setSelectedKey(null);
    }
  }

  return (
    <div className="page pc-box-page">
      {/* Header */}
      <div className="box-header">
        <span className="box-title">
          PC Box
          <span className="pc-total-count">({totalPcCount})</span>
        </span>
        <button className="box-close" onClick={() => navigate('/collection')}><GameIcon id="close" size={18} /></button>
      </div>

      {/* Filters */}
      <div className="pc-filters">
        <input
          className="pc-search"
          type="search"
          inputMode="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
        />
        <select
          className="box-sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
        >
          <option value="stars">Grade</option>
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

      <div className="box-layout">
        {/* Left: Grid */}
        <div className="box-grid-panel">
          <div className="box-grid">
            {filtered.map(stack => {
              const starColor = STAR_COLORS[stack.stars] ?? STAR_COLORS[1];
              const isSelected = stack.key === selectedKey;
              return (
                <div
                  key={stack.key}
                  className={`box-cell ${isSelected ? 'box-cell--selected' : ''}`}
                  onClick={() => setSelectedKey(stack.key)}
                >
                  <div className="box-cell-stars" style={{ color: starColor }}>
                    <StarRating count={stack.stars} size={10} />
                  </div>
                  <img
                    className="box-cell-sprite"
                    src={staticSpriteUrl(stack.spriteUrl)}
                    alt={stack.templateName}
                    loading="lazy"
                  />
                  {stack.isShiny && (
                    <span className="box-cell-shiny-badge"><GameIcon id="shiny" size={10} /></span>
                  )}
                  {stack.count > 1 && (
                    <span className="pc-stack-badge">&times;{stack.count}</span>
                  )}
                  <span className="box-cell-level">{stack.templateName.slice(0, 6)}</span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="box-empty-merge">
                {totalPcCount === 0 ? 'PC Box is empty' : 'No matches'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="box-detail-panel">
          {selected && selectedStats && selectedTemplate ? (
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
                      <span className="box-detail-name">
                        {selectedTemplate.name}
                        {selected.isShiny && <span className="shiny-icon"><GameIcon id="shiny" size={12} /></span>}
                      </span>
                      <span className="box-detail-stars" style={{ color: STAR_COLORS[selected.stars] }}>
                        <StarRating count={selected.stars} size={10} />
                      </span>
                    </div>

                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      In PC: &times;{selected.count}
                    </div>

                    {/* Types */}
                    <div className="box-detail-types">
                      {selectedTemplate.types.map(t => (
                        <span key={t} className="box-type-badge" style={{ background: `var(--type-${t})` }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="box-stats">
                      <div className="box-stat-row">
                        <span className="box-stat-label">Level</span>
                        <span className="box-stat-value">{selected.representative.level}</span>
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

                    {/* Transfer to collection */}
                    <div className="pc-transfer-bar">
                      {selected.count > 1 && (
                        <>
                          <div className="pc-qty-label">How many to bring?</div>
                          <div className="pc-qty-row">
                            <button className="pc-qty-btn" onClick={() => setTransferQty(q => Math.max(1, q - 1))}>-</button>
                            <span className="pc-qty-value">{transferQty}</span>
                            <button className="pc-qty-btn" onClick={() => setTransferQty(q => Math.min(selected.count, q + 1))}>+</button>
                            <button className="pc-qty-btn" style={{ fontSize: '0.55rem', width: 'auto', padding: '0 6px' }} onClick={() => setTransferQty(selected.count)}>All</button>
                          </div>
                        </>
                      )}
                      <button className="pc-transfer-btn" onClick={handleTransfer}>
                        Bring to Collection{transferQty > 1 ? ` (${transferQty})` : ''}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Skill tab */
                  <div className="box-skills">
                    {selectedTemplate?.leaderSkill && (
                      <div className="box-leader-skill">
                        <span className="box-leader-label">Leader Skill</span>
                        <div className="box-leader-desc">{describeLeaderSkill(selectedTemplate.leaderSkill)}</div>
                      </div>
                    )}
                    {selectedSkills.map((skill, i) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        index={i + 1}
                        skillLevel={selected.representative.skillLevels?.[i] ?? 1}
                        isAbility={i === 2 && skill.category === 'passive'}
                      />
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
