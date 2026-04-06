import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { GameIcon, StarRating } from '../components/icons';
import type { OwnedPokemon } from '../stores/gameStore';
import { computeStats, computeStatsWithItems, getSkillsForPokemon, MAX_LEVEL_BY_STARS, isMaxLevel, getTemplate, ESSENCES, getActiveEvolutionsFrom, getTypeChangeDef, getAvailableTypeChanges, isActivePokemon } from '@gatchamon/shared';
import { canEvolveInstance } from '../services/evolution.service';
import { canChangeType } from '../services/type-change.service';
import type { PokemonType, BaseStats } from '@gatchamon/shared';
import { assetUrl, staticSpriteUrl } from '../utils/asset-url';

import { HeldItemEquipPanel } from './HeldItemEquipPanel';
import { SkillCard } from '../components/monster/SkillCard';
import { Spinner } from '../components/Spinner';
import { EvolutionAnimation } from '../components/EvolutionAnimation';
import { useTutorialStore } from '../stores/tutorialStore';
import './CollectionPage.css';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon',
];

type SortBy = 'stars' | 'level' | 'name';
type DetailTab = 'info' | 'skill' | 'items' | 'misc';

const STAR_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#fbbf24',
  5: '#f87171',
  6: '#fbbf24',
};

/** Map Pokemon height (meters) to a sprite scale (0.45–1.0) for the grid cell. */
function getSpriteScale(heightMeters: number): number {
  const clamped = Math.min(2.5, Math.max(0.2, heightMeters));
  return 0.45 + ((clamped - 0.2) / (2.5 - 0.2)) * 0.55;
}

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
  const navigate = useNavigate();
  const { collection, loadCollection, evolvePokemon, changeType, player, heldItems, loadHeldItems, updateInstance, isLoading } = useGameStore();
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [shinyFilter, setShinyFilter] = useState<'all' | 'shiny'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('stars');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const lastSelectedRef = useRef<string | null>(null);
  const [evoAnim, setEvoAnim] = useState<{
    fromSprite: string;
    toSprite: string;
    evolvedName: string;
    instanceId: string;
    targetTemplateId: number;
  } | null>(null);

  const tutorialStep = useTutorialStore(s => s.step);
  const advanceTutorial = useTutorialStore(s => s.advanceStep);

  useEffect(() => {
    loadCollection();
    loadHeldItems();
  }, [loadCollection, loadHeldItems]);

  const visibleCollection = collection.filter(mon => isActivePokemon(mon.instance.templateId));

  useEffect(() => {
    if (visibleCollection.length > 0) {
      // Restore previous selection if it still exists in collection
      const prevId = lastSelectedRef.current ?? selectedId;
      const stillExists = prevId && visibleCollection.some(m => m.instance.instanceId === prevId);
      if (stillExists) {
        setSelectedId(prevId);
      } else if (!selectedId) {
        setSelectedId(visibleCollection[0].instance.instanceId);
        if (tutorialStep === 13) advanceTutorial();
      }
    }
  }, [visibleCollection]);

  const selected: OwnedPokemon | undefined = collection.find(
    m => m.instance.instanceId === selectedId,
  );

  const filtered = visibleCollection
    .filter(mon => {
      if (typeFilter && !mon.template.types.includes(typeFilter)) return false;
      if (shinyFilter === 'shiny' && !mon.instance.isShiny) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.instance.stars - a.instance.stars;
      if (sortBy === 'level') return b.instance.level - a.instance.level;
      return a.template.name.localeCompare(b.template.name);
    });

  const selectedStats = selected
    ? computeStats(selected.template, selected.instance.level, selected.instance.stars)
    : null;

  const equippedItems = selected ? heldItems.filter(i => i.equippedTo === selected.instance.instanceId) : [];
  const totalStats = selected
    ? computeStatsWithItems(selected.template, selected.instance.level, selected.instance.stars, equippedItems)
    : null;

  const selectedSkills = selected
    ? getSkillsForPokemon(selected.template.skillIds)
    : [];

  const maxLevel = selected ? (MAX_LEVEL_BY_STARS[selected.instance.stars] ?? 99) : 0;
  const atMaxLevel = selected ? isMaxLevel(selected.instance.level, selected.instance.stars) : false;

  // Evolution data
  const evolutionOptions = selected ? getActiveEvolutionsFrom(selected.instance.templateId) : [];
  const hasEvolutions = evolutionOptions.length > 0;

  // Type change data
  const typeChangeDef = selected ? getTypeChangeDef(selected.instance.templateId) : undefined;
  const typeChangeOptions = (selected && typeChangeDef)
    ? getAvailableTypeChanges(typeChangeDef, selected.instance.templateId)
    : [];
  const hasTypeChange = typeChangeOptions.length > 0;

  return (
    <div className="page collection-page">
      {/* Header */}
      <div className="box-header">
        <span className="box-title">
          {`Monster ${visibleCollection.length}/120`}
        </span>
        <div className="box-header-actions">
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
          <select
            className="box-sort-select"
            value={shinyFilter}
            onChange={e => setShinyFilter(e.target.value as 'all' | 'shiny')}
          >
            <option value="all">All</option>
            <option value="shiny">Shiny</option>
          </select>
          <button className="pdex-nav-btn" onClick={() => navigate('/pokedex')}>
            Pokedex
          </button>
          <button className="pdex-nav-btn" onClick={() => navigate('/inventory')}>
            Items
          </button>
          <button className="box-close" onClick={() => { history.back(); }}><GameIcon id="close" size={18} /></button>
        </div>
      </div>

      <div className="box-layout">
        {/* Left: Compact grid */}
        <div className="box-grid-panel">
          {isLoading && <div className="box-grid-loading"><Spinner label="Loading..." /></div>}
          <div className="box-grid">
            {filtered.map((mon, idx) => {
              const starColor = STAR_COLORS[mon.instance.stars] ?? STAR_COLORS[1];
              const isSelected = mon.instance.instanceId === selectedId;
              const isTutorialTarget = idx === 0 && tutorialStep === 13;
              return (
                <div
                  key={mon.instance.instanceId}
                  className={`box-cell ${isSelected ? 'box-cell--selected' : ''} ${isTutorialTarget ? 'tutorial-target' : ''}`}
                  data-tutorial-id={idx === 0 ? 'collection-first-mon' : undefined}
                  onClick={() => {
                    setSelectedId(mon.instance.instanceId);
                    lastSelectedRef.current = mon.instance.instanceId;
                    if (tutorialStep === 13) advanceTutorial(); // step 13 → 14
                  }}
                >
                  <div className="box-cell-stars" style={{ color: starColor }}>
                    <StarRating count={mon.instance.stars} size={10} />
                  </div>
                  <img
                    className="box-cell-sprite"
                    src={mon.instance.isShiny
                      ? staticSpriteUrl(`monsters/ani-shiny/${mon.template.name.toLowerCase()}.gif`)
                      : staticSpriteUrl(mon.template.spriteUrl)}
                    alt={mon.template.name}
                    style={{ width: `${getSpriteScale(mon.template.height) * 80}%` }}
                  />
                  {mon.instance.isShiny && <div className="box-cell-shiny-badge"><GameIcon id="shiny" size={10} /></div>}
                  <div className="box-cell-level">
                    {mon.instance.isLocked && <span className="box-cell-lock"><GameIcon id="lock" size={14} /></span>}
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
                <button
                  className={`box-tab ${activeTab === 'items' ? 'box-tab--active' : ''} ${tutorialStep === 14 ? 'tutorial-target' : ''}`}
                  data-tutorial-id="collection-tab-items"
                  onClick={() => {
                    setActiveTab('items');
                    if (tutorialStep === 14) advanceTutorial(); // step 14 → 15
                  }}
                >Items</button>
                <button
                  className={`box-tab ${activeTab === 'misc' ? 'box-tab--active' : ''}`}
                  onClick={() => setActiveTab('misc')}
                >Misc</button>
              </div>

              <div className="box-detail-content">
              {activeTab === 'misc' ? (
                <div className="box-misc-tab">
                  <div className="box-misc-row">
                    <div className="box-misc-left">
                      <div className="box-misc-label">
                        <GameIcon id="lock" size={16} />
                        <span>Lock</span>
                      </div>
                      <span className="box-misc-desc">Prevent sacrificing in Power-Up Circle</span>
                    </div>
                    <label className="box-switch">
                      <input
                        type="checkbox"
                        checked={!!selected.instance.isLocked}
                        onChange={e => updateInstance(selected.instance.instanceId, { isLocked: e.target.checked })}
                      />
                      <span className="box-switch-slider" />
                    </label>
                  </div>
                  <div className="box-misc-row">
                    <div className="box-misc-left">
                      <div className="box-misc-label">
                        <GameIcon id="home" size={16} />
                        <span>Home</span>
                      </div>
                      <span className="box-misc-desc">Show on island home view</span>
                    </div>
                    <label className="box-switch">
                      <input
                        type="checkbox"
                        checked={!!selected.instance.showOnHome}
                        onChange={e => updateInstance(selected.instance.instanceId, { showOnHome: e.target.checked })}
                      />
                      <span className="box-switch-slider" />
                    </label>
                  </div>
                </div>
              ) : activeTab === 'items' ? (
                <HeldItemEquipPanel
                  pokemon={selected}
                  heldItems={heldItems}
                  player={{ pokedollars: player?.pokedollars ?? 0 }}
                />
              ) : activeTab === 'info' ? (
                <>
                {/* Monster info */}
                <div className="box-detail-info">
                  <div className="box-detail-header">
                    <span className="box-detail-name">
                      {selected.template.name}
                      {selected.instance.isShiny && <span className="shiny-icon"><GameIcon id="shiny" size={12} /></span>}
                    </span>
                    <span className="box-detail-stars" style={{ color: STAR_COLORS[selected.instance.stars] }}>
                      <StarRating count={selected.instance.stars} size={10} />
                    </span>
                  </div>

                  {/* EXP bar or MAX badge */}
                  {atMaxLevel ? (
                    <div className="box-detail-exp">
                      <span className="box-detail-exp-label">EXP</span>
                      <div className="box-detail-max-badge">MAX</div>
                    </div>
                  ) : (
                    <div className="box-detail-exp">
                      <span className="box-detail-exp-label">EXP</span>
                      <div className="box-detail-exp-bar">
                        <div
                          className="box-detail-exp-fill"
                          style={{ width: `${(selected.instance.exp / (selected.instance.level * 100)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats table */}
                  <div className="box-stats">
                    <div className="box-stat-row">
                      <span className="box-stat-label">Level</span>
                      <span className="box-stat-value">{selected.instance.level} / {maxLevel}</span>
                    </div>
                    {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => {
                      const base = selectedStats![key];
                      const total = totalStats ? totalStats[key] : base;
                      const diff = total - base;
                      const isPct = key === 'critRate' || key === 'critDmg' || key === 'acc' || key === 'res';
                      return (
                        <div key={key} className="box-stat-row">
                          <span className="box-stat-label">{STAT_LABELS[key]}</span>
                          <span className="box-stat-value">
                            {total}{isPct ? '%' : ''}
                            {diff > 0 && <span className="box-stat-bonus"> (+{diff})</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Types */}
                  <div className="box-detail-types">
                    {selected.template.types.map(t => (
                      <span key={t} className="box-type-badge" style={{ background: `var(--type-${t})` }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Power Up — navigates to Altar page */}
                  <button
                    className="box-powerup-btn"
                    onClick={() => navigate(`/altar?baseId=${selected.instance.instanceId}`)}
                  >
                    <GameIcon id="arrow_up" size={14} /> Power Up
                  </button>

                  {/* Evolution section */}
                  {hasEvolutions && player && (
                    <div className="box-evolution">
                      <span className="box-evo-label">Evolution</span>
                      {evolutionOptions.map(chain => {
                        const targetTemplate = getTemplate(chain.to);
                        if (!targetTemplate) return null;
                        const validation = canEvolveInstance(selected.instance, player, chain.to);
                        const materials = player.materials ?? {};
                        return (
                          <div key={chain.to} className="box-evo-option">
                            <div className="box-evo-header">
                              <img src={assetUrl(targetTemplate.spriteUrl)} alt={targetTemplate.name} className="box-evo-sprite" />
                              <span className="box-evo-name">{targetTemplate.name}</span>
                            </div>
                            <div className="box-evo-reqs">
                              <div className="box-evo-req-row">
                                <span>Level</span>
                                <span className={selected.instance.level >= chain.requirements.levelRequired ? 'req-met' : 'req-unmet'}>
                                  {selected.instance.level}/{chain.requirements.levelRequired}
                                </span>
                              </div>
                              {Object.entries(chain.requirements.essences).map(([essId, needed]) => {
                                const ess = ESSENCES[essId];
                                const owned = materials[essId] ?? 0;
                                return (
                                  <div key={essId} className="box-evo-req-row">
                                    <span><GameIcon id={ess?.icon} size={14} /> {ess?.name ?? essId}</span>
                                    <span className={owned >= needed ? 'req-met' : 'req-unmet'}>
                                      {owned}/{needed}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <button
                              className="box-evo-btn"
                              disabled={!validation.valid}
                              onClick={() => {
                                if (confirm(`Evolve ${selected.template.name} into ${targetTemplate.name}?`)) {
                                  const fromSprite = selected.instance.isShiny
                                    ? assetUrl(`monsters/ani-shiny/${selected.template.name.toLowerCase()}.gif`)
                                    : assetUrl(selected.template.spriteUrl);
                                  const toSprite = assetUrl(targetTemplate.spriteUrl);
                                  setEvoAnim({
                                    fromSprite,
                                    toSprite,
                                    evolvedName: targetTemplate.name,
                                    instanceId: selected.instance.instanceId,
                                    targetTemplateId: chain.to,
                                  });
                                }
                              }}
                            >
                              {validation.valid ? 'Evolve' : 'Requirements not met'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Type Change section */}
                  {hasTypeChange && player && (
                    <div className="box-evolution">
                      <span className="box-evo-label">Type Change</span>
                      {typeChangeOptions.map(option => {
                        const targetTemplate = getTemplate(option.targetTemplateId);
                        if (!targetTemplate) return null;
                        const validation = canChangeType(selected.instance, player, option.targetTemplateId);
                        const materials = player.materials ?? {};
                        const isFree = Object.keys(option.cost.essences).length === 0;
                        return (
                          <div key={option.targetTemplateId} className="box-evo-option">
                            <div className="box-evo-header">
                              <img src={assetUrl(targetTemplate.spriteUrl)} alt={targetTemplate.name} className="box-evo-sprite" />
                              <span className="box-evo-name">{targetTemplate.name}</span>
                            </div>
                            <div className="box-evo-reqs">
                              {isFree ? (
                                <div className="box-evo-req-row">
                                  <span>Cost</span>
                                  <span className="req-met">Free</span>
                                </div>
                              ) : (
                                Object.entries(option.cost.essences).map(([essId, needed]) => {
                                  const ess = ESSENCES[essId];
                                  const owned = materials[essId] ?? 0;
                                  return (
                                    <div key={essId} className="box-evo-req-row">
                                      <span><GameIcon id={ess?.icon} size={14} /> {ess?.name ?? essId}</span>
                                      <span className={owned >= needed ? 'req-met' : 'req-unmet'}>
                                        {owned}/{needed}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                            <button
                              className="box-evo-btn"
                              disabled={!validation.valid}
                              onClick={() => {
                                if (confirm(`Change ${selected.template.name} to ${targetTemplate.name}?`)) {
                                  changeType(selected.instance.instanceId, option.targetTemplateId);
                                  setSelectedId(selected.instance.instanceId);
                                }
                              }}
                            >
                              {validation.valid ? 'Change Type' : 'Requirements not met'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                </>
              ) : (
                /* Skill tab */
                <div className="box-skills">
                  {selectedSkills.map((skill, i) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      index={i + 1}
                      skillLevel={selected.instance.skillLevels?.[i] ?? 1}
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

      {/* Evolution animation overlay */}
      {evoAnim && (
        <EvolutionAnimation
          fromSprite={evoAnim.fromSprite}
          toSprite={evoAnim.toSprite}
          evolvedName={evoAnim.evolvedName}
          onComplete={() => {
            evolvePokemon(evoAnim.instanceId, evoAnim.targetTemplateId);
            setSelectedId(evoAnim.instanceId);
            setEvoAnim(null);
          }}
        />
      )}
    </div>
  );
}
