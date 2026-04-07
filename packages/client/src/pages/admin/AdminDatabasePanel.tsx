import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { MissionReward } from '@gatchamon/shared';

interface DashboardStats {
  totalPlayers: number;
  totalPokemon: number;
  recentPlayers: { id: string; trainer_name: string; trainer_level: number; created_at: string }[];
}

interface PlayerSearchResult {
  id: string;
  trainer_name: string;
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

interface PlayerDetail {
  player: {
    id: string;
    trainerName: string;
    trainerLevel: number;
    trainerExp: number;
    energy: number;
    stardust: number;
    pokedollars: number;
    regularPokeballs: number;
    premiumPokeballs: number;
    legendaryPokeballs: number;
    glowingPokeballs: number;
    createdAt: string;
  };
  pokemonCount: number;
  inboxCount: number;
}

const REWARD_FIELDS: { key: keyof MissionReward; label: string; placeholder: string }[] = [
  { key: 'regularPokeballs', label: 'Pokeballs', placeholder: '0' },
  { key: 'premiumPokeballs', label: 'Premium', placeholder: '0' },
  { key: 'legendaryPokeballs', label: 'Legendary', placeholder: '0' },
  { key: 'glowingPokeballs', label: 'Glowing', placeholder: '0' },
  { key: 'energy', label: 'Energy', placeholder: '0' },
  { key: 'stardust', label: 'Stardust', placeholder: '0' },
  { key: 'pokedollars', label: 'Pokedollars', placeholder: '0' },
];

export function AdminDatabasePanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inbox form
  const [inboxTitle, setInboxTitle] = useState('');
  const [inboxMessage, setInboxMessage] = useState('');
  const [inboxReward, setInboxReward] = useState<Record<string, number>>({});
  const [sendStatus, setSendStatus] = useState('');
  const [broadcastMode, setBroadcastMode] = useState(false);

  // Load stats on mount
  useEffect(() => {
    api.get<DashboardStats>('/admin/stats').then(setStats).catch(() => {});
  }, []);

  // Search debounce
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await api.get<{ players: PlayerSearchResult[] }>(`/admin/players/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.players);
    } catch { setSearchResults([]); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  async function selectPlayer(id: string) {
    setLoading(true);
    setError('');
    try {
      const detail = await api.get<PlayerDetail>(`/admin/players/${id}`);
      setSelectedPlayer(detail);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

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

  async function handleSendInbox() {
    if (!inboxTitle.trim() || !inboxMessage.trim()) {
      setSendStatus('Title and message are required');
      return;
    }

    const reward = Object.keys(inboxReward).length > 0 ? inboxReward : undefined;
    setSendStatus('Sending...');

    try {
      if (broadcastMode) {
        const res = await api.post<{ ok: boolean; sent: number }>('/admin/inbox/broadcast', {
          title: inboxTitle, message: inboxMessage, reward,
        });
        setSendStatus(`Broadcast sent to ${res.sent} players`);
      } else {
        if (!selectedPlayer) { setSendStatus('Select a player first'); return; }
        await api.post('/admin/inbox/send', {
          playerId: selectedPlayer.player.id,
          title: inboxTitle, message: inboxMessage, reward,
        });
        setSendStatus(`Sent to ${selectedPlayer.player.trainerName}`);
      }
      // Reset form
      setInboxTitle('');
      setInboxMessage('');
      setInboxReward({});
    } catch (e: any) {
      setSendStatus(`Error: ${e.message}`);
    }
  }

  return (
    <div className="admin-db-panel">
      {/* ── Stats Overview ── */}
      <div className="admin-db-section">
        <h2 className="admin-db-section-title">Dashboard</h2>
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
        ) : (
          <div className="admin-db-loading">Loading stats...</div>
        )}
      </div>

      {/* ── Player Search ── */}
      <div className="admin-db-section">
        <h2 className="admin-db-section-title">Search Players</h2>
        <input
          className="admin-search admin-db-search-input"
          type="search"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoComplete="off"
        />

        {searchResults.length > 0 && (
          <div className="admin-db-results">
            {searchResults.map(p => (
              <div
                key={p.id}
                className={`admin-db-result-row ${selectedPlayer?.player.id === p.id ? 'admin-db-result-row--selected' : ''}`}
                onClick={() => selectPlayer(p.id)}
              >
                <div className="admin-db-result-name">
                  {p.trainer_name || 'Unknown'}
                  <span className="admin-db-result-level">Lv.{p.trainer_level}</span>
                </div>
                <div className="admin-db-result-id">{p.id.slice(0, 8)}...</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Selected Player Detail ── */}
      {loading && <div className="admin-db-loading">Loading player...</div>}
      {error && <div className="admin-db-error">{error}</div>}
      {selectedPlayer && !loading && (
        <div className="admin-db-section">
          <h2 className="admin-db-section-title">
            {selectedPlayer.player.trainerName || 'Unknown'}
            <span className="admin-db-player-id">{selectedPlayer.player.id}</span>
          </h2>
          <div className="admin-db-player-grid">
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Level</span>
              <span className="admin-db-field-value">{selectedPlayer.player.trainerLevel}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Energy</span>
              <span className="admin-db-field-value">{selectedPlayer.player.energy}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Stardust</span>
              <span className="admin-db-field-value">{selectedPlayer.player.stardust}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Pokedollars</span>
              <span className="admin-db-field-value">{selectedPlayer.player.pokedollars}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Pokeballs</span>
              <span className="admin-db-field-value">{selectedPlayer.player.regularPokeballs}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Premium</span>
              <span className="admin-db-field-value">{selectedPlayer.player.premiumPokeballs}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Legendary</span>
              <span className="admin-db-field-value">{selectedPlayer.player.legendaryPokeballs}</span>
            </div>
            <div className="admin-db-player-field">
              <span className="admin-db-field-label">Glowing</span>
              <span className="admin-db-field-value">{selectedPlayer.player.glowingPokeballs}</span>
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
      )}

      {/* ── Send Inbox ── */}
      <div className="admin-db-section">
        <h2 className="admin-db-section-title">Send Inbox Message</h2>

        <div className="admin-db-inbox-mode">
          <label className="admin-toggle">
            <input type="checkbox" checked={broadcastMode} onChange={e => setBroadcastMode(e.target.checked)} />
            Broadcast to all players
          </label>
          {!broadcastMode && !selectedPlayer && (
            <span className="admin-db-hint">Select a player above first</span>
          )}
          {!broadcastMode && selectedPlayer && (
            <span className="admin-db-hint">Sending to: {selectedPlayer.player.trainerName}</span>
          )}
        </div>

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
                  placeholder={f.placeholder}
                  value={inboxReward[f.key] ?? ''}
                  onChange={e => updateRewardField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-db-inbox-actions">
          <button
            className={`admin-btn ${broadcastMode ? 'admin-btn--danger' : 'admin-btn--primary'}`}
            onClick={handleSendInbox}
            disabled={!inboxTitle.trim() || !inboxMessage.trim() || (!broadcastMode && !selectedPlayer)}
          >
            {broadcastMode ? 'Broadcast to All' : 'Send to Player'}
          </button>
          {sendStatus && <span className="admin-db-send-status">{sendStatus}</span>}
        </div>
      </div>
    </div>
  );
}
