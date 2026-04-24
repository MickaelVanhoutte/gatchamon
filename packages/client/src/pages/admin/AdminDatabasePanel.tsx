import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { POKEDEX, POKEDEX_MAP, ESSENCES, ELEMENTS, TIERS, TIER_LABELS, type MissionReward } from '@gatchamon/shared';
import { assetUrl } from '../../utils/asset-url';
import { STAR_COLORS } from './constants';

const ADMIN_API_OPTS = { skipReloadOn401: true };
const PAGE_SIZE = 25;

// ── Types ────────────────────────────────────────────────────────────

interface PlayerRow {
  id: string;
  name: string;
  trainer_level: number;
  energy: number;
  stardust: number;
  pokedollars: number;
  regular_pokeballs: number;
  premium_pokeballs: number;
  legendary_pokeballs: number;
  glowing_pokeballs: number;
  created_at: string;
}

interface PaginatedPlayers {
  players: PlayerRow[];
  total: number;
  page: number;
  limit: number;
}

interface PlayerPokemon {
  instanceId: string;
  templateId: number;
  name: string;
  spriteUrl: string;
  types: string[];
  naturalStars: number;
  level: number;
  stars: number;
  exp: number;
  isShiny: boolean;
  skillLevels: number[];
  location: string;
  isLocked: boolean;
}

interface HeldItem {
  itemId: string;
  setId: string;
  slot: number;
  stars: number;
  grade: string;
  level: number;
  mainStat: string;
  mainStatValue: number;
  subStats: { type: string; value: number }[];
  equippedTo: string | null;
}

interface PlayerDetail {
  player: {
    id: string;
    trainerName: string;
    trainerLevel: number;
    trainerExp: number;
    trainerSkillPoints: number;
    trainerSkills: Record<string, number>;
    energy: number;
    stardust: number;
    pokedollars: number;
    regularPokeballs: number;
    premiumPokeballs: number;
    legendaryPokeballs: number;
    glowingPokeballs: number;
    materials: Record<string, number>;
    mysteryPieces: Record<string, number>;
    storyProgress: Record<string, Record<string, number>>;
    towerProgress: number;
    premiumPityCounter: number;
    createdAt: string;
  };
  pokemon: PlayerPokemon[];
  heldItems: HeldItem[];
  pokemonCount: number;
  inboxCount: number;
}

interface DashboardStats {
  totalPlayers: number;
  totalPokemon: number;
}

// ── Skill label mapping ──────────────────────────────────────────────

const SKILL_LABELS: Record<string, string> = {
  energyRegenSpeed: 'Energy Regen Speed',
  maxEnergyPool: 'Max Energy Pool',
  globalAtkBonus: 'ATK Bonus',
  globalDefBonus: 'DEF Bonus',
  globalHpBonus: 'HP Bonus',
  globalSpdBonus: 'SPD Bonus',
  pokedollarBonus: 'Pokedollar Bonus',
  xpBonus: 'XP Bonus',
  pokeballBonus: 'Pokeball Bonus',
  essenceBonus: 'Essence Bonus',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  normal: 'Normal',
  hard: 'Hard',
  hell: 'Hell',
};

// ── Reward fields for inbox ──────────────────────────────────────────

const REWARD_FIELDS: { key: keyof MissionReward; label: string }[] = [
  { key: 'regularPokeballs', label: 'Pokeballs' },
  { key: 'premiumPokeballs', label: 'Premium' },
  { key: 'legendaryPokeballs', label: 'Legendary' },
  { key: 'glowingPokeballs', label: 'Glowing' },
  { key: 'energy', label: 'Energy' },
  { key: 'stardust', label: 'Stardust' },
  { key: 'pokedollars', label: 'Pokedollars' },
];

// ── Editable field definitions ───────────────────────────────────────

const RESOURCE_FIELDS = [
  { key: 'energy', label: 'Energy' },
  { key: 'stardust', label: 'Stardust' },
  { key: 'pokedollars', label: 'Pokedollars' },
] as const;

const POKEBALL_FIELDS = [
  { key: 'regularPokeballs', label: 'Regular' },
  { key: 'premiumPokeballs', label: 'Premium' },
  { key: 'legendaryPokeballs', label: 'Legendary' },
  { key: 'glowingPokeballs', label: 'Glowing' },
] as const;

const TRAINER_FIELDS = [
  { key: 'trainerLevel', label: 'Level' },
  { key: 'trainerExp', label: 'EXP' },
  { key: 'trainerSkillPoints', label: 'Skill Points' },
] as const;

// ══════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════

export function AdminDatabasePanel() {
  // ── Dashboard stats ──
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // ── Player list ──
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerList, setPlayerList] = useState<PlayerRow[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  // ── Player detail ──
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  // ── Edit mode ──
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [editMaterials, setEditMaterials] = useState<Record<string, number>>({});
  const [editMysteryPieces, setEditMysteryPieces] = useState<Record<string, number>>({});
  const [editTrainerSkills, setEditTrainerSkills] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState('');

  // ── Add pokemon ──
  const [showAddPokemon, setShowAddPokemon] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [addStars, setAddStars] = useState(1);
  const [addLevel, setAddLevel] = useState(1);
  const [addShiny, setAddShiny] = useState(false);

  // ── Inbox ──
  const [inboxTitle, setInboxTitle] = useState('');
  const [inboxMessage, setInboxMessage] = useState('');
  const [inboxReward, setInboxReward] = useState<Record<string, number>>({});
  const [sendStatus, setSendStatus] = useState('');

  // ── Error state ──
  const [globalError, setGlobalError] = useState('');

  // ── Load stats ──
  useEffect(() => {
    api.get<DashboardStats>('/admin/stats', ADMIN_API_OPTS)
      .then(setStats)
      .catch((e) => setGlobalError(e.message));
  }, []);

  // ── Load player list ──
  const loadPlayers = useCallback(async (p: number, search: string) => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      const res = await api.get<PaginatedPlayers>(`/admin/players?${params}`, ADMIN_API_OPTS);
      setPlayerList(res.players);
      setTotalPlayers(res.total);
    } catch (e: any) {
      setGlobalError(e.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadPlayers(page, searchQuery), 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery, loadPlayers]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalPlayers / PAGE_SIZE));

  // ── Select player ──
  async function selectPlayer(id: string) {
    setDetailLoading(true);
    setDetailError('');
    setEditing(false);
    setSaveStatus('');
    setShowAddPokemon(false);
    try {
      const detail = await api.get<PlayerDetail>(`/admin/players/${id}`, ADMIN_API_OPTS);
      setSelectedPlayer(detail);
    } catch (e: any) {
      setDetailError(e.message);
    } finally {
      setDetailLoading(false);
    }
  }

  // ── Edit mode ──
  function startEditing() {
    if (!selectedPlayer) return;
    const p = selectedPlayer.player;
    setEditValues({
      energy: p.energy,
      stardust: p.stardust,
      pokedollars: p.pokedollars,
      regularPokeballs: p.regularPokeballs,
      premiumPokeballs: p.premiumPokeballs,
      legendaryPokeballs: p.legendaryPokeballs,
      glowingPokeballs: p.glowingPokeballs,
      trainerLevel: p.trainerLevel,
      trainerExp: p.trainerExp,
      trainerSkillPoints: p.trainerSkillPoints,
    });
    setEditMaterials({ ...p.materials });
    setEditMysteryPieces(
      Object.fromEntries(Object.entries(p.mysteryPieces).map(([k, v]) => [String(k), Number(v)]))
    );
    setEditTrainerSkills({ ...p.trainerSkills });
    setEditing(true);
    setSaveStatus('');
  }

  async function saveEdits() {
    if (!selectedPlayer) return;
    setSaveStatus('Saving...');
    try {
      await api.patch(`/admin/players/${selectedPlayer.player.id}`, {
        ...editValues,
        materials: editMaterials,
        mysteryPieces: editMysteryPieces,
        trainerSkills: editTrainerSkills,
      }, ADMIN_API_OPTS);
      setSaveStatus('Saved!');
      setEditing(false);
      await selectPlayer(selectedPlayer.player.id);
    } catch (e: any) {
      setSaveStatus(`Error: ${e.message}`);
    }
  }

  function setMaterial(key: string, raw: string) {
    const num = parseInt(raw, 10);
    setEditMaterials(prev => {
      const next = { ...prev };
      if (!raw || isNaN(num) || num <= 0) delete next[key];
      else next[key] = num;
      return next;
    });
  }

  function setMysteryPiece(key: string, raw: string) {
    const num = parseInt(raw, 10);
    setEditMysteryPieces(prev => {
      const next = { ...prev };
      if (!raw || isNaN(num) || num <= 0) delete next[key];
      else next[key] = num;
      return next;
    });
  }

  function setTrainerSkill(key: string, raw: string) {
    const num = parseInt(raw, 10);
    setEditTrainerSkills(prev => ({
      ...prev,
      [key]: !raw || isNaN(num) || num < 0 ? 0 : num,
    }));
  }

  // ── Add pokemon ──
  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return [];
    const q = templateSearch.toLowerCase();
    return POKEDEX.filter(t => t.name.toLowerCase().includes(q)).slice(0, 20);
  }, [templateSearch]);

  function selectTemplate(id: number) {
    const tmpl = POKEDEX.find(t => t.id === id);
    setSelectedTemplateId(id);
    if (tmpl) {
      setAddStars(tmpl.naturalStars);
      setAddLevel(1);
      setAddShiny(false);
    }
  }

  async function handleAddPokemon() {
    if (!selectedPlayer || selectedTemplateId === null) return;
    try {
      await api.post(`/admin/players/${selectedPlayer.player.id}/pokemon`, {
        templateId: selectedTemplateId,
        stars: addStars,
        level: addLevel,
        isShiny: addShiny,
      }, ADMIN_API_OPTS);
      setShowAddPokemon(false);
      setSelectedTemplateId(null);
      setTemplateSearch('');
      await selectPlayer(selectedPlayer.player.id);
    } catch (e: any) {
      setDetailError(e.message);
    }
  }

  async function handleDeletePokemon(instanceId: string, name: string) {
    if (!selectedPlayer) return;
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/players/${selectedPlayer.player.id}/pokemon/${instanceId}`, ADMIN_API_OPTS);
      await selectPlayer(selectedPlayer.player.id);
    } catch (e: any) {
      setDetailError(e.message);
    }
  }

  // ── Inbox ──
  function updateRewardField(key: string, value: string) {
    const num = parseInt(value, 10);
    if (!value || isNaN(num) || num <= 0) {
      const next = { ...inboxReward };
      delete next[key];
      setInboxReward(next);
    } else {
      setInboxReward({ ...inboxReward, [key]: num });
    }
  }

  function resetInboxForm() {
    setInboxTitle('');
    setInboxMessage('');
    setInboxReward({});
  }

  async function handleSendToPlayer() {
    if (!inboxTitle.trim() || !inboxMessage.trim()) {
      setSendStatus('error:Title and message are required');
      return;
    }
    if (!selectedPlayer) { setSendStatus('error:Select a player first'); return; }
    const reward = Object.keys(inboxReward).length > 0 ? inboxReward : undefined;
    setSendStatus('Sending...');
    try {
      const res = await api.post<{ ok: boolean; playerName?: string; inboxCount?: number }>('/admin/inbox/send', {
        playerId: selectedPlayer.player.id,
        title: inboxTitle, message: inboxMessage, reward,
      }, ADMIN_API_OPTS);
      const msg = `Sent to ${res.playerName ?? selectedPlayer.player.trainerName} (inbox: ${res.inboxCount ?? '?'} items)`;
      setSendStatus(`success:${msg}`);
      resetInboxForm();
    } catch (e: any) {
      setSendStatus(`error:${e.message}`);
      alert(`Send failed: ${e.message}`);
    }
  }

  async function handleBroadcast() {
    if (!inboxTitle.trim() || !inboxMessage.trim()) {
      setSendStatus('error:Title and message are required');
      return;
    }
    if (!confirm('Send this message to ALL players?')) return;
    const reward = Object.keys(inboxReward).length > 0 ? inboxReward : undefined;
    setSendStatus('Broadcasting...');
    try {
      const res = await api.post<{ ok: boolean; sent: number }>('/admin/inbox/broadcast', {
        title: inboxTitle, message: inboxMessage, reward,
      }, ADMIN_API_OPTS);
      setSendStatus(`success:Broadcast sent to ${res.sent} players`);
      resetInboxForm();
    } catch (e: any) {
      setSendStatus(`error:${e.message}`);
      alert(`Broadcast failed: ${e.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════════════

  return (
    <div className="admin-db-panel">
      {globalError && (
        <div className="admin-db-error">
          {globalError}
          <button className="admin-btn" onClick={() => setGlobalError('')} style={{ marginLeft: 8 }}>Dismiss</button>
        </div>
      )}

      {/* ── Stats Overview ── */}
      <div className="admin-db-section">
        <div className="admin-db-detail-header">
          <h2 className="admin-db-section-title">Dashboard</h2>
          <button
            className="admin-btn"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              api.get<DashboardStats>('/admin/stats', ADMIN_API_OPTS)
                .then(setStats)
                .catch((e) => setGlobalError(e.message));
              loadPlayers(page, searchQuery);
              if (selectedPlayer) selectPlayer(selectedPlayer.player.id);
            }}
          >
            Refresh
          </button>
        </div>
        {stats ? (
          <div className="admin-db-stats-grid">
            <div className="admin-db-stat-card">
              <div className="admin-db-stat-value">{stats.totalPlayers}</div>
              <div className="admin-db-stat-label">Accounts</div>
            </div>
            <div className="admin-db-stat-card">
              <div className="admin-db-stat-value">{stats.totalPokemon}</div>
              <div className="admin-db-stat-label">Pokemon</div>
            </div>
          </div>
        ) : !globalError && (
          <div className="admin-db-loading">Loading stats...</div>
        )}
      </div>

      {/* ── Player List (Paginated) ── */}
      <div className="admin-db-section">
        <h2 className="admin-db-section-title">Players</h2>
        <input
          className="admin-search admin-db-search-input"
          type="search"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoComplete="off"
        />

        {listLoading && <div className="admin-db-loading">Loading...</div>}

        <div className="admin-db-table">
          <div className="admin-db-table-header">
            <span className="admin-db-col-name">Name</span>
            <span className="admin-db-col-level">Level</span>
            <span className="admin-db-col-resource">Stardust</span>
            <span className="admin-db-col-resource">Pokedollars</span>
            <span className="admin-db-col-date">Created</span>
          </div>
          {playerList.map(p => (
            <div
              key={p.id}
              className={`admin-db-table-row ${selectedPlayer?.player.id === p.id ? 'admin-db-table-row--selected' : ''}`}
              onClick={() => selectPlayer(p.id)}
            >
              <span className="admin-db-col-name">{p.name || 'Unknown'}</span>
              <span className="admin-db-col-level">{p.trainer_level}</span>
              <span className="admin-db-col-resource">{p.stardust.toLocaleString()}</span>
              <span className="admin-db-col-resource">{p.pokedollars.toLocaleString()}</span>
              <span className="admin-db-col-date">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {!listLoading && playerList.length === 0 && (
            <div className="admin-db-table-empty">No players found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="admin-db-pagination">
          <button
            className="admin-btn"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >Prev</button>
          <span className="admin-db-page-info">
            Page {page} of {totalPages} ({totalPlayers} total)
          </span>
          <button
            className="admin-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >Next</button>
        </div>
      </div>

      {/* ── Player Detail ── */}
      {detailLoading && <div className="admin-db-loading">Loading player...</div>}
      {detailError && <div className="admin-db-error">{detailError}</div>}

      {selectedPlayer && !detailLoading && (
        <>
          {/* Header */}
          <div className="admin-db-section">
            <div className="admin-db-detail-header">
              <h2 className="admin-db-section-title">
                {selectedPlayer.player.trainerName || 'Unknown'}
              </h2>
              <span className="admin-db-player-id">{selectedPlayer.player.id}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                {!editing ? (
                  <button className="admin-btn admin-btn--primary" onClick={startEditing}>Edit</button>
                ) : (
                  <>
                    <button className="admin-btn admin-btn--primary" onClick={saveEdits}>Save</button>
                    <button className="admin-btn" onClick={() => { setEditing(false); setSaveStatus(''); }}>Cancel</button>
                  </>
                )}
              </div>
            </div>
            {saveStatus && <div className="admin-db-save-status">{saveStatus}</div>}

            {/* Resources */}
            <h3 className="admin-db-subsection-title">Resources</h3>
            <div className="admin-db-player-grid">
              {RESOURCE_FIELDS.map(f => (
                <div key={f.key} className="admin-db-player-field">
                  <span className="admin-db-field-label">{f.label}</span>
                  {editing ? (
                    <input
                      className="admin-db-edit-input"
                      type="number"
                      value={editValues[f.key] ?? 0}
                      onChange={e => setEditValues({ ...editValues, [f.key]: Number(e.target.value) })}
                    />
                  ) : (
                    <span className="admin-db-field-value">
                      {(selectedPlayer.player as any)[f.key]?.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Pokeballs */}
            <h3 className="admin-db-subsection-title">Pokeballs</h3>
            <div className="admin-db-player-grid">
              {POKEBALL_FIELDS.map(f => (
                <div key={f.key} className="admin-db-player-field">
                  <span className="admin-db-field-label">{f.label}</span>
                  {editing ? (
                    <input
                      className="admin-db-edit-input"
                      type="number"
                      value={editValues[f.key] ?? 0}
                      onChange={e => setEditValues({ ...editValues, [f.key]: Number(e.target.value) })}
                    />
                  ) : (
                    <span className="admin-db-field-value">
                      {(selectedPlayer.player as any)[f.key]?.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Trainer Info */}
            <h3 className="admin-db-subsection-title">Trainer</h3>
            <div className="admin-db-player-grid">
              {TRAINER_FIELDS.map(f => (
                <div key={f.key} className="admin-db-player-field">
                  <span className="admin-db-field-label">{f.label}</span>
                  {editing ? (
                    <input
                      className="admin-db-edit-input"
                      type="number"
                      value={editValues[f.key] ?? 0}
                      onChange={e => setEditValues({ ...editValues, [f.key]: Number(e.target.value) })}
                    />
                  ) : (
                    <span className="admin-db-field-value">
                      {(selectedPlayer.player as any)[f.key]?.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
              <div className="admin-db-player-field">
                <span className="admin-db-field-label">Pity Counter</span>
                <span className="admin-db-field-value">{selectedPlayer.player.premiumPityCounter}</span>
              </div>
            </div>

            {/* Trainer Skills */}
            <h3 className="admin-db-subsection-title">Trainer Skills</h3>
            <div className="admin-db-player-grid">
              {Object.entries(selectedPlayer.player.trainerSkills).map(([key, value]) => (
                <div key={key} className="admin-db-player-field">
                  <span className="admin-db-field-label">{SKILL_LABELS[key] ?? key}</span>
                  {editing ? (
                    <input
                      className="admin-db-edit-input"
                      type="number"
                      min={0}
                      value={editTrainerSkills[key] ?? 0}
                      onChange={e => setTrainerSkill(key, e.target.value)}
                    />
                  ) : (
                    <span className="admin-db-field-value">{value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Essences — grouped by element, one row per element, 3 tiers */}
            <h3 className="admin-db-subsection-title">Essences</h3>
            <div className="admin-db-essence-grid">
              {ELEMENTS.map(element => (
                <div key={element} className="admin-db-essence-row">
                  <span className="admin-db-essence-label">{element}</span>
                  {TIERS.map(tier => {
                    const id = `${element}_${tier}`;
                    const currentValue = editing
                      ? (editMaterials[id] ?? 0)
                      : (selectedPlayer.player.materials[id] ?? 0);
                    return (
                      <div key={tier} className="admin-db-essence-field">
                        <span className="admin-db-essence-tier">{TIER_LABELS[tier]}</span>
                        {editing ? (
                          <input
                            className="admin-db-edit-input"
                            type="number"
                            min={0}
                            value={currentValue}
                            onChange={e => setMaterial(id, e.target.value)}
                          />
                        ) : (
                          <span className="admin-db-field-value">{currentValue}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Other materials (non-essence keys) */}
            {(() => {
              const source = editing ? editMaterials : selectedPlayer.player.materials;
              const otherKeys = Object.keys(source).filter(k => !ESSENCES[k]);
              if (otherKeys.length === 0 && !editing) return null;
              return (
                <>
                  <h3 className="admin-db-subsection-title">Other Materials</h3>
                  <div className="admin-db-player-grid">
                    {otherKeys.map(key => (
                      <div key={key} className="admin-db-player-field">
                        <span className="admin-db-field-label">{key}</span>
                        {editing ? (
                          <input
                            className="admin-db-edit-input"
                            type="number"
                            min={0}
                            value={editMaterials[key] ?? 0}
                            onChange={e => setMaterial(key, e.target.value)}
                          />
                        ) : (
                          <span className="admin-db-field-value">{source[key]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* Mystery Pieces (keyed by templateId) */}
            {(() => {
              const source = editing ? editMysteryPieces : selectedPlayer.player.mysteryPieces;
              const keys = Object.keys(source);
              if (keys.length === 0) return null;
              return (
                <>
                  <h3 className="admin-db-subsection-title">Mystery Pieces</h3>
                  <div className="admin-db-player-grid">
                    {keys.map(key => {
                      const tmpl = POKEDEX_MAP.get(Number(key));
                      const label = tmpl ? `${tmpl.name} #${key}` : `#${key}`;
                      return (
                        <div key={key} className="admin-db-player-field">
                          <span className="admin-db-field-label">{label}</span>
                          {editing ? (
                            <input
                              className="admin-db-edit-input"
                              type="number"
                              min={0}
                              value={editMysteryPieces[key] ?? 0}
                              onChange={e => setMysteryPiece(key, e.target.value)}
                            />
                          ) : (
                            <span className="admin-db-field-value">{(source as Record<string, number>)[key]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Story Progress */}
            <h3 className="admin-db-subsection-title">Story Progress</h3>
            <div className="admin-db-story-grid">
              {Object.entries(selectedPlayer.player.storyProgress).map(([diff, regions]) => (
                <div key={diff} className="admin-db-story-difficulty">
                  <span className="admin-db-story-diff-label">{DIFFICULTY_LABELS[diff] ?? diff}</span>
                  <div className="admin-db-story-regions">
                    {Object.entries(regions as Record<string, number>).map(([region, floor]) => (
                      <span key={region} className="admin-db-story-region">
                        R{region}: {floor >= 11 ? 'Done' : `F${floor}`}
                      </span>
                    ))}
                    {Object.keys(regions as object).length === 0 && <span className="admin-db-story-region">—</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Tower */}
            <div className="admin-db-player-grid" style={{ marginTop: 8 }}>
              <div className="admin-db-player-field">
                <span className="admin-db-field-label">Tower Floor</span>
                <span className="admin-db-field-value">{selectedPlayer.player.towerProgress}</span>
              </div>
              <div className="admin-db-player-field">
                <span className="admin-db-field-label">Pokemon</span>
                <span className="admin-db-field-value">{selectedPlayer.pokemonCount}</span>
              </div>
              <div className="admin-db-player-field">
                <span className="admin-db-field-label">Inbox</span>
                <span className="admin-db-field-value">{selectedPlayer.inboxCount}</span>
              </div>
              <div className="admin-db-player-field admin-db-player-field--wide">
                <span className="admin-db-field-label">Created</span>
                <span className="admin-db-field-value">{new Date(selectedPlayer.player.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* ── Pokemon Collection ── */}
          <div className="admin-db-section">
            <div className="admin-db-detail-header">
              <h2 className="admin-db-section-title">Pokemon ({selectedPlayer.pokemon.length})</h2>
              <button
                className="admin-btn admin-btn--primary"
                style={{ marginLeft: 'auto' }}
                onClick={() => setShowAddPokemon(v => !v)}
              >
                {showAddPokemon ? 'Cancel' : 'Add Pokemon'}
              </button>
            </div>

            {/* Add Pokemon Form */}
            {showAddPokemon && (
              <div className="admin-db-add-form">
                <input
                  className="admin-search"
                  type="search"
                  placeholder="Search pokemon template..."
                  value={templateSearch}
                  onChange={e => { setTemplateSearch(e.target.value); setSelectedTemplateId(null); }}
                  autoComplete="off"
                />
                {filteredTemplates.length > 0 && selectedTemplateId === null && (
                  <div className="admin-db-template-picker">
                    {filteredTemplates.map(t => (
                      <div
                        key={t.id}
                        className="admin-db-template-option"
                        onClick={() => selectTemplate(t.id)}
                      >
                        <img src={assetUrl(t.spriteUrl)} alt={t.name} className="admin-db-template-sprite" />
                        <span>{t.name}</span>
                        <span style={{ color: STAR_COLORS[t.naturalStars], marginLeft: 'auto' }}>
                          {'★'.repeat(t.naturalStars)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTemplateId !== null && (
                  <div className="admin-db-add-fields">
                    <div className="admin-db-add-selected">
                      {(() => {
                        const tmpl = POKEDEX.find(t => t.id === selectedTemplateId);
                        return tmpl ? (
                          <>
                            <img src={assetUrl(tmpl.spriteUrl)} alt={tmpl.name} className="admin-db-template-sprite" />
                            <span>{tmpl.name}</span>
                          </>
                        ) : null;
                      })()}
                      <button className="admin-btn" onClick={() => { setSelectedTemplateId(null); setTemplateSearch(''); }}>
                        Change
                      </button>
                    </div>
                    <div className="admin-db-add-options">
                      <label>
                        Stars
                        <select value={addStars} onChange={e => setAddStars(Number(e.target.value))}>
                          {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label>
                        Level
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={addLevel}
                          onChange={e => setAddLevel(Number(e.target.value))}
                          className="admin-db-edit-input"
                        />
                      </label>
                      <label className="admin-toggle">
                        <input type="checkbox" checked={addShiny} onChange={e => setAddShiny(e.target.checked)} />
                        Shiny
                      </label>
                      <button className="admin-btn admin-btn--primary" onClick={handleAddPokemon}>
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pokemon Grid */}
            <div className="admin-db-pokemon-grid">
              {selectedPlayer.pokemon.map(p => (
                <div
                  key={p.instanceId}
                  className={`admin-db-pokemon-card ${p.isShiny ? 'admin-db-pokemon-card--shiny' : ''}`}
                >
                  {p.isShiny && <span className="admin-db-shiny-badge">✦</span>}
                  {p.isLocked && <span className="admin-db-lock-badge">🔒</span>}
                  <img
                    className="admin-db-pokemon-sprite"
                    src={assetUrl(p.spriteUrl)}
                    alt={p.name}
                    loading="lazy"
                  />
                  <span className="admin-db-pokemon-name">{p.name}</span>
                  <div className="admin-db-pokemon-info">
                    <span className="admin-db-pokemon-level">Lv.{p.level}</span>
                    <span style={{ color: STAR_COLORS[p.stars] }}>{'★'.repeat(p.stars)}</span>
                  </div>
                  <span className="admin-db-pokemon-location">{p.location}</span>
                  <button
                    className="admin-db-pokemon-delete"
                    onClick={(e) => { e.stopPropagation(); handleDeletePokemon(p.instanceId, p.name); }}
                    title="Delete"
                  >×</button>
                </div>
              ))}
              {selectedPlayer.pokemon.length === 0 && (
                <div className="admin-db-table-empty">No pokemon</div>
              )}
            </div>
          </div>

          {/* ── Held Items ── */}
          {selectedPlayer.heldItems.length > 0 && (
            <div className="admin-db-section">
              <h2 className="admin-db-section-title">Held Items ({selectedPlayer.heldItems.length})</h2>
              <div className="admin-db-items-list">
                {selectedPlayer.heldItems.map(item => (
                  <div key={item.itemId} className="admin-db-item-row">
                    <span className="admin-db-item-grade" data-grade={item.grade}>
                      {item.grade}
                    </span>
                    <span style={{ color: STAR_COLORS[item.stars] }}>{'★'.repeat(item.stars)}</span>
                    <span className="admin-db-item-stat">
                      {item.mainStat.replace(/_/g, ' ')} +{item.mainStatValue.toFixed(1)}
                    </span>
                    <span className="admin-db-item-level">+{item.level}</span>
                    {item.equippedTo && (
                      <span className="admin-db-item-equipped">
                        Equipped
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

      {/* ── Send Inbox (always visible) ── */}
      <div className="admin-db-section">
        <h2 className="admin-db-section-title">Send Inbox Message</h2>

        <input
          className="admin-search admin-db-inbox-input"
          type="text"
          placeholder="Title"
          value={inboxTitle}
          onChange={e => setInboxTitle(e.target.value)}
          autoComplete="off"
        />
        <textarea
          className="admin-db-inbox-textarea"
          placeholder="Message..."
          value={inboxMessage}
          onChange={e => setInboxMessage(e.target.value)}
        />

        <div className="admin-db-reward-section">
          <span className="admin-db-reward-title">Attached Rewards (optional)</span>
          <div className="admin-db-reward-grid">
            {REWARD_FIELDS.map(f => (
              <div key={f.key} className="admin-db-reward-field">
                <label className="admin-db-reward-label">{f.label}</label>
                <input
                  className="admin-stat-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={inboxReward[f.key] ?? ''}
                  onChange={e => updateRewardField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-db-inbox-actions">
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSendToPlayer}
            disabled={!inboxTitle.trim() || !inboxMessage.trim() || !selectedPlayer}
            title={!selectedPlayer ? 'Select a player first' : undefined}
          >
            Send to {selectedPlayer?.player.trainerName ?? 'Player'}
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={handleBroadcast}
            disabled={!inboxTitle.trim() || !inboxMessage.trim()}
          >
            Send to All
          </button>
          {sendStatus && (
            <span className={`admin-db-send-status ${sendStatus.startsWith('success:') ? 'admin-db-send-success' : sendStatus.startsWith('error:') ? 'admin-db-send-error' : ''}`}>
              {sendStatus.replace(/^(success|error):/, '')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
