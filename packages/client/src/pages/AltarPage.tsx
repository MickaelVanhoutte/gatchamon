import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { GameIcon, StarRating } from '../components/icons';
import type { OwnedPokemon } from '../stores/gameStore';
import { isMaxLevel, canStarEvolve, calculateFodderXp, MAX_LEVEL_BY_STARS, xpToNextLevel, isActivePokemon, getEvolutionLineage, DITTO_TEMPLATE_ID } from '@gatchamon/shared';
import type { PokemonType } from '@gatchamon/shared';
import { previewAltarFeed } from '../services/altar.service';
import { assetUrl } from '../utils/asset-url';

import './AltarPage.css';

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#ff4444',
  6: '#ff6b6b',
};

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon',
];

type SortBy = 'stars' | 'level' | 'name';

function getSpriteScale(heightMeters: number): number {
  const clamped = Math.min(2.5, Math.max(0.2, heightMeters));
  return 0.45 + ((clamped - 0.2) / (2.5 - 0.2)) * 0.55;
}

export function AltarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { collection, loadCollection, altarFeed } = useGameStore();
  const [baseId, setBaseId] = useState<string | null>(searchParams.get('baseId'));
  const [fodderIds, setFodderIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('stars');
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  // If arriving with a baseId that doesn't exist in collection, clear it
  useEffect(() => {
    if (baseId && !collection.find(m => m.instance.instanceId === baseId)) {
      if (collection.length > 0) setBaseId(null);
    }
  }, [baseId, collection]);

  const base = useMemo(
    () => collection.find(m => m.instance.instanceId === baseId),
    [collection, baseId],
  );

  const baseLineageSet = useMemo(() => {
    if (!base) return null;
    return new Set(getEvolutionLineage(base.instance.templateId));
  }, [base]);

  function isSkillUpEligible(mon: OwnedPokemon): boolean {
    if (!base || !baseLineageSet) return false;
    if (mon.instance.instanceId === baseId) return false;
    return baseLineageSet.has(mon.instance.templateId) || mon.instance.templateId === DITTO_TEMPLATE_ID;
  }

  const fodder = useMemo(
    () => fodderIds.map(id => collection.find(m => m.instance.instanceId === id)).filter(Boolean) as OwnedPokemon[],
    [collection, fodderIds],
  );

  const maxSlots = 5;
  const fodderIdSet = new Set(fodderIds);

  // Preview calculation
  const preview = useMemo(() => {
    if (!base || fodder.length === 0) return null;
    return previewAltarFeed(
      base.instance,
      fodder.map(f => f.instance),
    );
  }, [base, fodder]);

  // Grid: filter, partition skill-ups to top, then sort by user preference
  const sortedCollection = useMemo(() => {
    let filtered = collection.filter(m => isActivePokemon(m.instance.templateId));
    if (typeFilter) {
      filtered = filtered.filter(m => m.template.types.includes(typeFilter));
    }

    const comparator = (a: OwnedPokemon, b: OwnedPokemon) => {
      if (sortBy === 'stars') return b.instance.stars - a.instance.stars || b.instance.level - a.instance.level;
      if (sortBy === 'level') return b.instance.level - a.instance.level;
      return a.template.name.localeCompare(b.template.name);
    };

    // Hide the base monster from the fodder grid
    if (baseId) {
      filtered = filtered.filter(m => m.instance.instanceId !== baseId);
    }

    if (base && baseLineageSet) {
      const skillUp: OwnedPokemon[] = [];
      const normal: OwnedPokemon[] = [];
      for (const mon of filtered) {
        if (baseLineageSet.has(mon.instance.templateId) || mon.instance.templateId === DITTO_TEMPLATE_ID) {
          skillUp.push(mon);
        } else {
          normal.push(mon);
        }
      }
      skillUp.sort(comparator);
      normal.sort(comparator);
      return [...skillUp, ...normal];
    }

    filtered.sort(comparator);
    return filtered;
  }, [collection, typeFilter, sortBy, base, baseId, baseLineageSet]);

  function handleGridClick(mon: OwnedPokemon) {
    // If no base selected, select as base
    if (!baseId) {
      setBaseId(mon.instance.instanceId);
      setFodderIds([]);
      return;
    }
    // If clicking the base, deselect
    if (mon.instance.instanceId === baseId) {
      return;
    }
    // Prevent locked monsters from being used as fodder
    if (mon.instance.isLocked) {
      return;
    }
    // If already in fodder, remove it
    if (fodderIdSet.has(mon.instance.instanceId)) {
      setFodderIds(prev => prev.filter(id => id !== mon.instance.instanceId));
      return;
    }
    // Add as fodder if slots available
    if (fodderIds.length < maxSlots) {
      setFodderIds(prev => [...prev, mon.instance.instanceId]);
    }
  }

  function removeFodder(index: number) {
    setFodderIds(prev => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    if (!base || fodder.length === 0) return;
    altarFeed(base.instance.instanceId, fodderIds);
    setFodderIds([]);
    setShowConfirm(false);
    // Stay on the page with the base selected (it's been updated)
  }

  function changeBase() {
    setBaseId(null);
    setFodderIds([]);
  }

  return (
    <div className="page altar-page">
      <div className="altar-header">
        <button className="altar-back-btn" onClick={() => navigate(-1)}>
          <GameIcon id="close" size={18} />
        </button>
        <span className="altar-title">Power-Up Circle</span>
        <div className="altar-header-controls">
          <select
            className="altar-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
          >
            <option value="stars">Grade</option>
            <option value="level">Level</option>
            <option value="name">Name</option>
          </select>
          <select
            className="altar-type-select"
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

      <div className="altar-layout">
        {/* Left: Monster grid */}
        <div className="altar-grid-panel">
          <div className="altar-grid">
            {sortedCollection.map(mon => {
              const isBase = mon.instance.instanceId === baseId;
              const isFodder = fodderIdSet.has(mon.instance.instanceId);
              const isSkillUp = isSkillUpEligible(mon);
              const isLockedFodder = !!mon.instance.isLocked && !!baseId && !isBase;
              const starColor = STAR_COLORS[mon.instance.stars] ?? STAR_COLORS[1];

              return (
                <div
                  key={mon.instance.instanceId}
                  className={[
                    'altar-cell',
                    isBase ? 'altar-cell--base' : '',
                    isFodder ? 'altar-cell--fodder' : '',
                    isLockedFodder ? 'altar-cell--locked' : '',
                    isSkillUp && !isFodder ? 'altar-cell--skillup' : '',
                  ].join(' ')}
                  onClick={() => handleGridClick(mon)}
                >
                  <div className="altar-cell-stars" style={{ color: starColor }}>
                    <StarRating count={mon.instance.stars} size={8} />
                  </div>
                  <img
                    className="altar-cell-sprite"
                    src={mon.instance.isShiny
                      ? assetUrl(`monsters/ani-shiny/${mon.template.name.toLowerCase()}.gif`)
                      : assetUrl(mon.template.spriteUrl)}
                    alt={mon.template.name}
                    style={{ width: `${getSpriteScale(mon.template.height) * 80}%` }}
                  />
                  {isSkillUp && !isFodder && (
                    <div className="altar-cell-skillup-badge">Skill</div>
                  )}
                  {isLockedFodder && (
                    <div className="altar-cell-lock-badge"><GameIcon id="lock" size={12} /></div>
                  )}
                  <div className="altar-cell-level">Lv.{mon.instance.level}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Altar panel */}
        <div className="altar-panel">
          {/* Base monster */}
          {base ? (
            <div className="altar-base" onClick={changeBase} style={{ cursor: 'pointer' }}>
              <img
                className="altar-base-sprite"
                src={base.instance.isShiny
                  ? assetUrl(`monsters/ani-shiny/${base.template.name.toLowerCase()}.gif`)
                  : assetUrl(base.template.spriteUrl)}
                alt={base.template.name}
              />
              <span className="altar-base-name">{base.template.name}</span>
              <div className="altar-base-info">
                <span style={{ color: STAR_COLORS[base.instance.stars] }}>
                  <StarRating count={base.instance.stars} size={10} />
                </span>
                <span>Lv.{base.instance.level}</span>
              </div>
            </div>
          ) : (
            <div className="altar-base-placeholder">
              Select a base monster from the grid
            </div>
          )}

          {/* Fodder slots */}
          {base && (
            <div className="altar-fodder-section">
              <span className="altar-fodder-label">
                Fodder ({fodderIds.length}/{maxSlots})
              </span>
              <div className="altar-fodder-slots">
                {Array.from({ length: maxSlots }).map((_, i) => {
                  const f = fodder[i];
                  return (
                    <div
                      key={i}
                      className={`altar-slot ${f ? 'altar-slot--filled' : ''}`}
                    >
                      {f ? (
                        <>
                          <img
                            className="altar-slot-sprite"
                            src={f.instance.isShiny
                              ? assetUrl(`monsters/ani-shiny/${f.template.name.toLowerCase()}.gif`)
                              : assetUrl(f.template.spriteUrl)}
                            alt={f.template.name}
                          />
                          <button
                            className="altar-slot-remove"
                            onClick={(e) => { e.stopPropagation(); removeFodder(i); }}
                          >
                            x
                          </button>
                        </>
                      ) : (
                        <span className="altar-slot-empty">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview */}
          {base && preview && (
            <div className="altar-preview">
              <span className="altar-preview-title">Preview</span>

              {preview.willStarEvolve && (
                <div className="altar-star-evolve-badge">
                  Star Evolution! {base.instance.stars} → {preview.newStars}
                </div>
              )}

              <div className="altar-preview-row">
                <span className="altar-preview-label">XP Gain</span>
                <span className="altar-preview-value altar-preview-value--xp">
                  +{preview.totalXpGain}
                </span>
              </div>

              <div className="altar-preview-row">
                <span className="altar-preview-label">Result Level</span>
                <span className="altar-preview-value">
                  Lv.{preview.newLevel}
                </span>
              </div>

              {preview.skillUps > 0 && (
                <div className="altar-preview-row">
                  <span className="altar-preview-label">Skill Ups</span>
                  <span className="altar-preview-value altar-preview-value--skill">
                    +{preview.skillUps} random
                  </span>
                </div>
              )}

              {!preview.willStarEvolve && base.instance.stars < 6 && (
                <div className="altar-preview-row">
                  <span className="altar-preview-label">Star Evolve</span>
                  <span className="altar-preview-value" style={{ color: '#999', fontSize: '0.65rem' }}>
                    {!isMaxLevel(base.instance.level, base.instance.stars)
                      ? 'Base must be max level'
                      : `Need ${base.instance.stars}x ${base.instance.stars}-star fodder`
                    }
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Confirm button */}
          {base && (
            <button
              className="altar-confirm-btn"
              disabled={fodder.length === 0}
              onClick={() => setShowConfirm(true)}
            >
              Power Up ({fodder.length} fodder)
            </button>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && base && preview && (
        <div className="altar-overlay" onClick={() => setShowConfirm(false)}>
          <div className="altar-dialog" onClick={e => e.stopPropagation()}>
            <h3>Confirm Power Up</h3>
            <p>
              Feed <strong>{fodder.length}</strong> monster{fodder.length > 1 ? 's' : ''} to{' '}
              <strong>{base.template.name}</strong>?
            </p>
            <div className="altar-dialog-results">
              {preview.willStarEvolve && (
                <div className="altar-preview-row">
                  <span>Star Evolution</span>
                  <span style={{ color: '#ffd700', fontWeight: 700 }}>
                    {base.instance.stars} → {preview.newStars}
                  </span>
                </div>
              )}
              <div className="altar-preview-row">
                <span>XP Gain</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>+{preview.totalXpGain}</span>
              </div>
              <div className="altar-preview-row">
                <span>Result Level</span>
                <span style={{ fontWeight: 700 }}>Lv.{preview.newLevel}</span>
              </div>
              {preview.skillUps > 0 && (
                <div className="altar-preview-row">
                  <span>Skill Ups</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>+{preview.skillUps}</span>
                </div>
              )}
            </div>
            <p className="altar-dialog-warning">
              {fodder.length} monster{fodder.length > 1 ? 's' : ''} will be consumed permanently.
            </p>
            <div className="altar-dialog-actions">
              <button className="altar-dialog-cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="altar-dialog-confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
