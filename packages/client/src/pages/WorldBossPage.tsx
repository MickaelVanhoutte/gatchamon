import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import * as serverApi from '../services/server-api.service';
import type { WorldBossStatusResponse, WorldBossTier, MissionReward } from '@gatchamon/shared';
import {
  WORLD_BOSS_CONFIG,
  WORLD_BOSS_TIER_LABELS,
  WORLD_BOSS_TIER_REWARDS,
  getTemplate,
} from '@gatchamon/shared';
import { GameIcon } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import { reportError } from '../utils/report-error';
import { haptic } from '../utils/haptics';
import './WorldBossPage.css';

const TIER_ORDER: WorldBossTier[] = ['top1', 'top10', 'top25', 'top50', 'participant'];

function useCountdown(targetIso: string | undefined): string {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!targetIso) return '—';
  const ms = Math.max(0, new Date(targetIso).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatReward(r: MissionReward): string[] {
  const parts: string[] = [];
  if (r.legendaryPokeballs) parts.push(`×${r.legendaryPokeballs} Legendary Balls`);
  if (r.glowingPokeballs) parts.push(`×${r.glowingPokeballs} Glowing Balls`);
  if (r.premiumPokeballs) parts.push(`×${r.premiumPokeballs} Premium Balls`);
  if (r.regularPokeballs) parts.push(`×${r.regularPokeballs} Poké Balls`);
  if (r.stardust) parts.push(`${r.stardust.toLocaleString()} Stardust`);
  if (r.pokedollars) parts.push(`₽${r.pokedollars.toLocaleString()}`);
  if (r.essences) {
    for (const [k, v] of Object.entries(r.essences)) parts.push(`×${v} ${k.replace('_', ' ')}`);
  }
  return parts;
}

export function WorldBossPage() {
  const navigate = useNavigate();
  const { player } = useGameStore();
  const [status, setStatus] = useState<WorldBossStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await serverApi.getWorldBossStatus();
      setStatus(s);
    } catch (err) {
      reportError('WorldBossPage.getStatus', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const bossTemplate = useMemo(
    () => getTemplate(WORLD_BOSS_CONFIG.templateId),
    [],
  );

  const countdown = useCountdown(status?.boss.weekEnd);

  if (!player) return null;
  if (!status) return <div className="page world-boss-page"><p className="wb-loading">Summoning Eternatus…</p></div>;

  const { boss, player: myStats, topEntries, totalParticipants } = status;
  const hpPct = boss.maxHp > 0 ? Math.max(0, Math.min(100, (boss.currentHp / boss.maxHp) * 100)) : 0;
  const tierLabel = myStats.tier ? WORLD_BOSS_TIER_LABELS[myStats.tier] : 'Unranked';

  const goAttack = () => {
    if (!myStats.canAttackToday) return;
    haptic.tap();
    navigate('/world-boss/team');
  };

  return (
    <div className="page world-boss-page">
      <header className="wb-header">
        <h1 className="wb-title">World Boss</h1>
        <div className="wb-countdown">
          {boss.defeated ? 'Defeated — awaiting next week' : `Next reset in ${countdown}`}
        </div>
      </header>

      <section className="wb-boss-card">
        <div className="wb-boss-portrait">
          <img
            src={assetUrl(bossTemplate?.spriteUrl ?? 'monsters/ani/eternatus.gif')}
            alt={bossTemplate?.name ?? 'Eternatus'}
            className="wb-boss-sprite"
          />
          <div className="wb-boss-aura" />
        </div>
        <div className="wb-boss-info">
          <div className="wb-boss-name">{bossTemplate?.name ?? 'Eternatus'}</div>
          <div className="wb-boss-types">
            {bossTemplate?.types.map(t => (
              <span key={t} className={`wb-type wb-type-${t}`}><GameIcon id={t} size={14} /> {t}</span>
            ))}
          </div>
          <div className="wb-hp-row">
            <div className="wb-hp-bar">
              <div className="wb-hp-fill" style={{ width: `${hpPct}%` }} />
            </div>
            <div className="wb-hp-numbers">
              {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()}
            </div>
          </div>
          <div className="wb-boss-participants">
            {totalParticipants} trainers have joined the hunt
          </div>
        </div>
      </section>

      <section className="wb-my-stats">
        <div className="wb-stat-cell">
          <span className="wb-stat-label">Your damage</span>
          <span className="wb-stat-value">{myStats.totalDamage.toLocaleString()}</span>
        </div>
        <div className="wb-stat-cell">
          <span className="wb-stat-label">Rank</span>
          <span className="wb-stat-value">{myStats.rank ? `#${myStats.rank}` : '—'}</span>
        </div>
        <div className={`wb-stat-cell wb-tier-${myStats.tier ?? 'none'}`}>
          <span className="wb-stat-label">Tier</span>
          <span className="wb-stat-value">{tierLabel}</span>
        </div>
      </section>

      <button
        className={`wb-attack-btn ${(!myStats.canAttackToday || boss.defeated) ? 'wb-attack-disabled' : ''}`}
        onClick={goAttack}
        disabled={!myStats.canAttackToday || boss.defeated || loading}
      >
        {boss.defeated
          ? 'Eternatus is down — await next week'
          : myStats.canAttackToday
            ? `Strike! (${WORLD_BOSS_CONFIG.teamSize} mons)`
            : 'Already attacked today'}
      </button>

      <section className="wb-ladder-preview">
        <h2 className="wb-section-title">Top Damage Dealers</h2>
        {topEntries.length === 0 ? (
          <p className="wb-empty">No one has attacked yet. Be the first!</p>
        ) : (
          <ol className="wb-ladder">
            {topEntries.map(e => (
              <li key={e.playerId} className={`wb-ladder-row wb-tier-${e.tier}`}>
                <span className="wb-rank">#{e.rank}</span>
                <span className="wb-player">{e.playerName}</span>
                <span className="wb-tier-badge">{WORLD_BOSS_TIER_LABELS[e.tier]}</span>
                <span className="wb-damage">{e.totalDamage.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="wb-rewards-panel">
        <button
          className="wb-rewards-toggle"
          onClick={() => setShowRewards(v => !v)}
        >
          <GameIcon id="gift" size={16} /> Reward tiers {showRewards ? '▲' : '▼'}
        </button>
        {showRewards && (
          <div className="wb-rewards-list">
            {TIER_ORDER.map(tier => (
              <div key={tier} className={`wb-reward-row wb-tier-${tier}`}>
                <span className="wb-reward-tier">{WORLD_BOSS_TIER_LABELS[tier]}</span>
                <span className="wb-reward-items">
                  {formatReward(WORLD_BOSS_TIER_REWARDS[tier]).join(' • ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
