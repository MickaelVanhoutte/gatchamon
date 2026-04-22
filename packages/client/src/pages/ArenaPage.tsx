import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { getTemplate, MAX_ARENA_TICKETS } from '@gatchamon/shared';
import type { ArenaOpponent, ArenaHistoryEntry, ArenaRival, ArenaDefensePreview } from '@gatchamon/shared';
import * as serverApi from '../services/server-api.service';
import { GameIcon } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import { reportError } from '../utils/report-error';
import './ArenaPage.css';

type ArenaTab = 'duel' | 'rivals' | 'history';

export function ArenaPage() {
  const navigate = useNavigate();
  const { player, loadCollection } = useGameStore();
  const [tab, setTab] = useState<ArenaTab>('duel');

  // Defense preview (read-only on this page)
  const [defenseTeam, setDefenseTeam] = useState<ArenaDefensePreview[]>([]);

  // Duel state
  const [opponents, setOpponents] = useState<ArenaOpponent[]>([]);
  const [loadingOpponents, setLoadingOpponents] = useState(false);

  // Rivals state
  const [rivals, setRivals] = useState<ArenaRival[]>([]);

  // History state
  const [history, setHistory] = useState<ArenaHistoryEntry[]>([]);

  useEffect(() => { loadCollection(); }, [loadCollection]);

  // Load defense on mount (re-fetches when returning from the editor)
  useEffect(() => {
    serverApi.getArenaDefense().then(res => {
      if (res.defense) setDefenseTeam(res.defense.team);
      else setDefenseTeam([]);
    }).catch(err => reportError('ArenaPage.getArenaDefense', err));
  }, []);

  const refreshOpponents = useCallback(async () => {
    setLoadingOpponents(true);
    try {
      const res = await serverApi.getArenaOpponents();
      setOpponents(res.opponents ?? []);
    } catch (err) {
      reportError('ArenaPage.getArenaOpponents', err);
    }
    setLoadingOpponents(false);
  }, []);

  const refreshRivals = useCallback(async () => {
    try {
      const res = await serverApi.getArenaRivals();
      setRivals(res.rivals ?? []);
    } catch (err) {
      reportError('ArenaPage.getArenaRivals', err);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await serverApi.getArenaHistory();
      setHistory(res.history ?? []);
    } catch (err) {
      reportError('ArenaPage.getArenaHistory', err);
    }
  }, []);

  useEffect(() => {
    if (tab === 'duel' && opponents.length === 0) refreshOpponents();
    if (tab === 'rivals' && rivals.length === 0) refreshRivals();
    if (tab === 'history' && history.length === 0) refreshHistory();
  }, [tab]);

  const hasDefense = defenseTeam.length > 0;
  const openDefenseEditor = () => navigate('/arena/defense');

  if (!player) return null;

  return (
    <div className="arena-page">
      {/* Header */}
      <div className="arena-header">
        <div className="arena-header-info">
          <h2 className="arena-title">Arena</h2>
          <div className="arena-stats">
            <span className="arena-elo">
              <GameIcon id="swords" size={16} /> {player.arenaElo ?? 1000} ELO
            </span>
            <span className="arena-coins">
              <span className="arena-coin-icon">🪙</span> {player.arenaCoins ?? 0}
            </span>
            <span className="arena-tickets">
              🎟️ {player.arenaTickets ?? 0}/{MAX_ARENA_TICKETS}
            </span>
            <button
              type="button"
              className={`arena-defense-btn ${!hasDefense ? 'arena-defense-btn--empty' : ''}`}
              onClick={openDefenseEditor}
              aria-label={hasDefense ? 'Edit defense team' : 'Set defense team'}
            >
              <span className="arena-defense-btn-icon">🛡️</span>
              {hasDefense ? (
                <span className="arena-defense-btn-sprites">
                  {defenseTeam.slice(0, 4).map((mon, i) => {
                    const tmpl = getTemplate(mon.templateId);
                    return tmpl ? (
                      <img
                        key={i}
                        src={assetUrl(tmpl.spriteUrl)}
                        alt=""
                        className="arena-defense-btn-sprite"
                      />
                    ) : null;
                  })}
                </span>
              ) : (
                <span className="arena-defense-btn-label">Set defense</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="arena-tab-toggle">
        {(['duel', 'rivals', 'history'] as ArenaTab[]).map(t => (
          <button
            key={t}
            className={`arena-tab-btn ${tab === t ? 'arena-tab-btn--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'duel' ? 'Duel' : t === 'rivals' ? 'Rivals' : 'History'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="arena-content">
        {tab === 'duel' && (
          <DuelTab
            opponents={opponents}
            loading={loadingOpponents}
            onRefresh={refreshOpponents}
            hasDefense={hasDefense}
            hasTickets={(player.arenaTickets ?? 0) > 0}
            onOpenDefense={openDefenseEditor}
            navigate={navigate}
          />
        )}
        {tab === 'rivals' && (
          <RivalsTab rivals={rivals} hasTickets={(player.arenaTickets ?? 0) > 0} navigate={navigate} />
        )}
        {tab === 'history' && (
          <HistoryTab history={history} playerId={player.id} />
        )}
      </div>
    </div>
  );
}

// ── Duel Tab ─────────────────────────────────────────────────────────────

function DuelTab({ opponents, loading, onRefresh, hasDefense, hasTickets, onOpenDefense, navigate }: {
  opponents: ArenaOpponent[];
  loading: boolean;
  onRefresh: () => void;
  hasDefense: boolean;
  hasTickets: boolean;
  onOpenDefense: () => void;
  navigate: (path: string) => void;
}) {
  return (
    <div className="arena-duel-tab">
      <div className="arena-duel-header">
        <button className="arena-btn-small" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh List'}
        </button>
      </div>
      {!hasDefense && (
        <button type="button" className="arena-warning arena-warning--action" onClick={onOpenDefense}>
          Set a defense team before dueling →
        </button>
      )}
      {!hasTickets && (
        <div className="arena-warning">No arena tickets! Buy more in the Shop or wait for regeneration.</div>
      )}
      {opponents.length === 0 && !loading && (
        <div className="arena-empty">No opponents found. Try refreshing!</div>
      )}
      {opponents.map(opp => (
        <div key={opp.playerId} className="arena-opponent-row">
          <div className="arena-opponent-info">
            <span className="arena-opponent-name">
              Lv.{opp.trainerLevel} {opp.playerName}
            </span>
            <span className="arena-opponent-elo">
              <GameIcon id="swords" size={12} /> {opp.arenaElo}
            </span>
          </div>
          <div className="arena-opponent-team">
            {opp.defenseTeam.map((mon, i) => {
              const tmpl = getTemplate(mon.templateId);
              return (
                <img
                  key={i}
                  src={assetUrl(tmpl?.spriteUrl ?? '')}
                  alt={tmpl?.name}
                  className="arena-opponent-sprite"
                />
              );
            })}
          </div>
          <button
            className="arena-btn-fight"
            disabled={!hasDefense || !hasTickets}
            onClick={() => {
              const enemyData = encodeURIComponent(JSON.stringify(opp.defenseTeam));
              navigate(`/battle/team-select?mode=arena&defenderId=${opp.playerId}&defenderName=${encodeURIComponent(opp.playerName)}&enemies=${enemyData}`);
            }}
          >
            Combat
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Rivals Tab ───────────────────────────────────────────────────────────

function RivalsTab({ rivals, hasTickets, navigate }: {
  rivals: ArenaRival[];
  hasTickets: boolean;
  navigate: (path: string) => void;
}) {
  return (
    <div className="arena-rivals-tab">
      {rivals.map(rival => {
        const enemyData = encodeURIComponent(JSON.stringify(rival.team));
        return (
          <div key={rival.rivalId} className="arena-rival-row">
            <img
              src={assetUrl(`portraits/${rival.icon}`)}
              alt={rival.name}
              className="arena-rival-icon"
            />
            <div className="arena-rival-info">
              <span className="arena-rival-name">{rival.name}</span>
              <div className="arena-rival-team">
                {rival.team.map((mon, i) => {
                  const tmpl = getTemplate(mon.templateId);
                  return (
                    <img
                      key={i}
                      src={assetUrl(tmpl?.spriteUrl ?? '')}
                      alt={tmpl?.name}
                      className="arena-rival-sprite"
                    />
                  );
                })}
              </div>
            </div>
            <button
              className={`arena-btn-fight ${!rival.cooldownExpired ? 'arena-btn-cooldown' : ''}`}
              disabled={!rival.cooldownExpired || !hasTickets}
              onClick={() => navigate(`/battle/team-select?mode=arena-rival&rivalId=${rival.rivalId}&rivalName=${encodeURIComponent(rival.name)}&enemies=${enemyData}`)}
            >
              {rival.cooldownExpired ? 'Battle' : 'Done'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── History Tab ──────────────────────────────────────────────────────────

function HistoryTab({ history, playerId }: {
  history: ArenaHistoryEntry[];
  playerId: string;
}) {
  if (history.length === 0) {
    return <div className="arena-empty">No arena battles yet.</div>;
  }

  return (
    <div className="arena-history-tab">
      {history.map(entry => {
        const wasAttacker = entry.attackerId === playerId;
        const won = wasAttacker ? entry.attackerWon : !entry.attackerWon;
        const eloChange = wasAttacker ? entry.attackerEloChange : entry.defenderEloChange;
        const opponentName = wasAttacker ? entry.defenderName : entry.attackerName;
        const opponentTeam = wasAttacker ? entry.defenderTeam : entry.attackerTeam;

        return (
          <div key={entry.id} className={`arena-history-row ${won ? 'arena-history--win' : 'arena-history--loss'}`}>
            <div className="arena-history-result">
              <span className={`arena-result-badge ${won ? 'arena-badge--win' : 'arena-badge--loss'}`}>
                {won ? 'WIN' : 'LOSS'}
              </span>
              <span className={`arena-elo-change ${eloChange >= 0 ? 'arena-elo--pos' : 'arena-elo--neg'}`}>
                {eloChange >= 0 ? '+' : ''}{eloChange}
              </span>
            </div>
            <div className="arena-history-info">
              <span className="arena-history-opponent">
                {wasAttacker ? 'vs' : 'by'} {opponentName}
              </span>
              <div className="arena-history-team">
                {(opponentTeam ?? []).map((mon, i) => {
                  const tmpl = getTemplate(mon.templateId);
                  return tmpl ? (
                    <img
                      key={i}
                      src={assetUrl(tmpl.spriteUrl)}
                      alt={tmpl.name}
                      className="arena-history-sprite"
                    />
                  ) : null;
                })}
              </div>
            </div>
            <span className="arena-history-time">
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ArenaPage;
