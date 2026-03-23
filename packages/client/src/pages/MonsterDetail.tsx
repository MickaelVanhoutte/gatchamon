import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { computeStats } from '@gatchamon/shared';
import type { BaseStats } from '@gatchamon/shared';
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
  spd: 250,
  critRate: 100,
  critDmg: 300,
  acc: 100,
  res: 100,
};

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fbbf24',
  6: '#ff6b6b',
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
    ? `/monsters/ani-shiny/${template.name.toLowerCase()}.gif`
    : template.spriteUrl;

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
        {isShiny && <span style={{ color: '#ffd700', marginLeft: 6, fontSize: '0.8em' }}>✦</span>}
      </h2>
      <div className="detail-stars" style={{ color: starColor }}>
        {'★'.repeat(instance.stars)}
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
