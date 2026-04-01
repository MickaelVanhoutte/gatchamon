import { useMemo, useState } from 'react';
import { POKEDEX } from '@gatchamon/shared';
import type { PokemonType } from '@gatchamon/shared';
import { assetUrl } from '../../utils/asset-url';
import { useAdminStore, getGeneration } from './useAdminStore';
import { AdminEditorPanel } from './AdminEditorPanel';
import { AdminSkillPicker } from './AdminSkillPicker';
import { AdminDistributionPanel } from './AdminDistributionPanel';
import { AdminEffectsPanel } from './AdminEffectsPanel';
import { STAR_COLORS } from './constants';
import './AdminPage.css';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'fairy', 'dark', 'steel',
];

export function AdminPage() {
  const {
    diffs, selectedId, searchQuery, typeFilter, starFilter,
    summonableFilter, sortBy, genFilter, showForms, changesOnly, skillPickerSlot,
    setSelectedId, setSearchQuery, setTypeFilter, setStarFilter,
    setSummonableFilter, setSortBy, setGenFilter, setShowForms, setChangesOnly,
    exportDiff, importDiff, resetAll, getDiffCount, getEffective,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'distribution' | 'effects'>('editor');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const diffCount = getDiffCount();

  const filtered = useMemo(() => {
    return POKEDEX
      .filter(t => {
        if (!showForms && t.id >= 10000) return false;
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (typeFilter && !t.types.includes(typeFilter)) return false;
        if (starFilter !== null && t.naturalStars !== starFilter) return false;
        if (genFilter !== null && getGeneration(t.id) !== genFilter) return false;
        if (summonableFilter === 'yes' && t.summonable === false) return false;
        if (summonableFilter === 'no' && t.summonable !== false) return false;
        if (changesOnly && !diffs.has(t.id)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'id') return a.id - b.id;
        if (sortBy === 'stars') return b.naturalStars - a.naturalStars || a.id - b.id;
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, typeFilter, starFilter, genFilter, summonableFilter, sortBy, showForms, changesOnly, diffs]);

  const selectedTemplate = useMemo(
    () => selectedId !== null ? POKEDEX.find(p => p.id === selectedId) ?? null : null,
    [selectedId],
  );

  function handleExport() {
    const json = exportDiff();
    navigator.clipboard.writeText(json).catch(() => {});
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokedex-diff-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    importDiff(importText);
    setShowImport(false);
    setImportText('');
  }

  function handleResetAll() {
    if (diffCount === 0) return;
    if (!confirm(`Reset all ${diffCount} changes?`)) return;
    resetAll();
  }

  return (
    <div className="admin-page">
      {/* ─── Top Bar ─── */}
      <div className="admin-topbar">
        <h1>Pokedex Admin</h1>
        <span className={`admin-badge ${diffCount === 0 ? 'admin-badge--zero' : ''}`}>
          {diffCount} change{diffCount !== 1 ? 's' : ''}
        </span>
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'editor' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >Editor</button>
          <button
            className={`admin-tab ${activeTab === 'distribution' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >Distribution</button>
          <button
            className={`admin-tab ${activeTab === 'effects' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('effects')}
          >Effects</button>
        </div>
        <div className="admin-topbar-actions">
          <button className="admin-btn" onClick={() => setShowImport(true)}>Import</button>
          <button className="admin-btn admin-btn--primary" onClick={handleExport} disabled={diffCount === 0}>
            Export Diff
          </button>
          <button className="admin-btn admin-btn--danger" onClick={handleResetAll} disabled={diffCount === 0}>
            Reset All
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <>
          {/* ─── Left: Grid Panel ─── */}
          <div className="admin-grid-panel">
            <div className="admin-filters">
              <input
                className="admin-search"
                type="search"
                inputMode="search"
                placeholder="Search name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                enterKeyHint="search"
                autoComplete="off"
              />
              <select
                className="admin-select"
                value={typeFilter ?? ''}
                onChange={e => setTypeFilter((e.target.value || null) as PokemonType | null)}
              >
                <option value="">All Types</option>
                {ALL_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                className="admin-select"
                value={starFilter ?? ''}
                onChange={e => setStarFilter(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All Stars</option>
                {[1, 2, 3, 4, 5].map(s => (
                  <option key={s} value={s}>{s} star</option>
                ))}
              </select>
              <select
                className="admin-select"
                value={genFilter ?? ''}
                onChange={e => setGenFilter(e.target.value ? Number(e.target.value) as 1|2|3|4|5|6|7|8|9 : null)}
              >
                <option value="">All Gens</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                  <option key={g} value={g}>Gen {g}</option>
                ))}
              </select>
              <select
                className="admin-select"
                value={summonableFilter}
                onChange={e => setSummonableFilter(e.target.value as 'all' | 'yes' | 'no')}
              >
                <option value="all">Summonable: All</option>
                <option value="yes">Summonable</option>
                <option value="no">Not Summonable</option>
              </select>
              <select
                className="admin-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'id' | 'stars' | 'name')}
              >
                <option value="id">Sort: ID</option>
                <option value="stars">Sort: Stars</option>
                <option value="name">Sort: Name</option>
              </select>
              <label className="admin-toggle">
                <input type="checkbox" checked={showForms} onChange={e => setShowForms(e.target.checked)} />
                Forms
              </label>
              <label className="admin-toggle">
                <input type="checkbox" checked={changesOnly} onChange={e => setChangesOnly(e.target.checked)} />
                Changed
              </label>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {filtered.length} shown
              </span>
            </div>

            <div className="admin-grid">
              {filtered.map(t => {
                const eff = getEffective(t);
                const hasChange = diffs.has(t.id);
                return (
                  <div
                    key={t.id}
                    className={`admin-card${selectedId === t.id ? ' admin-card--selected' : ''}${hasChange ? ' admin-card--changed' : ''}`}
                    onClick={() => setSelectedId(t.id)}
                  >
                    {eff.summonable === false && (
                      <span className="admin-card-not-summonable" title="Not summonable">NS</span>
                    )}
                    <img
                      className="admin-card-sprite"
                      src={assetUrl(t.spriteUrl)}
                      alt={t.name}
                      loading="lazy"
                    />
                    <span className="admin-card-name" title={t.name}>{t.name}</span>
                    <span className="admin-card-stars" style={{ color: STAR_COLORS[eff.naturalStars] }}>
                      {'★'.repeat(eff.naturalStars)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right: Editor Panel ─── */}
          <div className="admin-editor">
            {selectedTemplate ? (
              <AdminEditorPanel template={selectedTemplate} />
            ) : (
              <div className="admin-editor-empty">Select a Pokemon to edit</div>
            )}
          </div>
        </>
      ) : activeTab === 'distribution' ? (
        <AdminDistributionPanel />
      ) : (
        <AdminEffectsPanel />
      )}

      {/* ─── Skill Picker Modal ─── */}
      {skillPickerSlot !== null && selectedTemplate && (
        <AdminSkillPicker
          pokemonId={selectedTemplate.id}
          slotIndex={skillPickerSlot as 0 | 1 | 2}
        />
      )}

      {/* ─── Import Modal ─── */}
      {showImport && (
        <div className="admin-import-overlay" onClick={() => setShowImport(false)}>
          <div className="admin-import-modal" onClick={e => e.stopPropagation()}>
            <h3>Import Diff JSON</h3>
            <textarea
              className="admin-import-textarea"
              placeholder="Paste exported JSON here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <div className="admin-import-actions">
              <button className="admin-btn" onClick={() => setShowImport(false)}>Cancel</button>
              <button className="admin-btn admin-btn--primary" onClick={handleImport} disabled={!importText.trim()}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
