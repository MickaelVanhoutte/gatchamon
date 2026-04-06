import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { computeStats } from '@gatchamon/shared';
import type { BaseStats } from '@gatchamon/shared';
import { GameIcon, StarRating } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import './MonsterDetail.css';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  spd: 'SPD',
  critRate: 'CRIT%',
  critDmg: 'CDMG%',
  acc: 'ACC',
  res: 'RES',
};

const STAT_MAX: Record<keyof BaseStats, number> = {
  hp: 2000,
  atk: 300,
  def: 250,
  spd: 150,
  critRate: 100,
  critDmg: 300,
  acc: 100,
  res: 100,
};

const STAR_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#fbbf24',
  5: '#f87171',
  6: '#fbbf24',
};

export function MonsterDetail() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const { collection } = useGameStore();

  const owned = collection.find(m => m.instance.instanceId === instanceId);
  if (!owned) {
    return (
      <div className="page">
        <p>Monster not found</p>
        <button onClick={() => navigate('/collection')}>Back</button>
      </div>
    );
  }

  const { instance, template } = owned;
  const stats = computeStats(template, instance.level, instance.stars);
  const starColor = STAR_COLORS[instance.stars] ?? STAR_COLORS[1];
  const isShiny = instance.isShiny ?? false;
  const spriteUrl = isShiny
    ? assetUrl(`monsters/ani-shiny/${template.name.toLowerCase()}.gif`)
    : assetUrl(template.spriteUrl);

  return (
    <div className="page detail-page">
      <button className="back-btn" onClick={() => navigate('/collection')}>
        ← Back
      </button>

      <div className={`detail-sprite ${isShiny ? 'shiny' : ''}`}>
        <img
          src={spriteUrl}
          alt={template.name}
          style={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain' }}
        />
      </div>

      <h2 className="detail-name">
        {template.name}
        {isShiny && <GameIcon id="shiny" size={14} color="#ffd700" />}
      </h2>
      <div className="detail-stars" style={{ color: starColor }}>
        <StarRating count={instance.stars} size={10} />
      </div>
      <div className="detail-level">Level {instance.level}</div>

      <div className="detail-types">
        {template.types.map(t => (
          <span key={t} className="type-badge" style={{ background: `var(--type-${t})` }}>
            {t}
          </span>
        ))}
      </div>

      <div className="detail-stats">
        {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => (
          <div key={key} className="stat-row">
            <span className="stat-label">{STAT_LABELS[key]}</span>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.min(100, (stats[key] / STAT_MAX[key]) * 100)}%` }}
              />
            </div>
            <span className="stat-value">{stats[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
