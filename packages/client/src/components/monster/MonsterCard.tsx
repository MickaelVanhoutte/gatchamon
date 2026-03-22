import type { OwnedPokemon } from '../../stores/gameStore';
import './MonsterCard.css';

interface Props {
  owned: OwnedPokemon;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fbbf24',
};

const TYPE_COLORS: Record<string, string> = {
  normal: 'var(--type-normal)', fire: 'var(--type-fire)', water: 'var(--type-water)',
  grass: 'var(--type-grass)', electric: 'var(--type-electric)', ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)', poison: 'var(--type-poison)', ground: 'var(--type-ground)',
  flying: 'var(--type-flying)', psychic: 'var(--type-psychic)', bug: 'var(--type-bug)',
  rock: 'var(--type-rock)', ghost: 'var(--type-ghost)', dragon: 'var(--type-dragon)',
};

export function MonsterCard({ owned, compact, onClick, selected }: Props) {
  const { instance, template } = owned;
  const starColor = STAR_COLORS[instance.stars] ?? STAR_COLORS[1];

  return (
    <div
      className={`monster-card ${compact ? 'compact' : ''} ${selected ? 'selected' : ''}`}
      style={{ borderColor: starColor }}
      onClick={onClick}
    >
      <div className="card-sprite">
        <img
          src={template.spriteUrl}
          alt={template.name}
          width={compact ? 64 : 80}
          height={compact ? 64 : 80}
        />
      </div>
      <div className="card-info">
        <span className="card-name">{template.name}</span>
        <div className="card-stars" style={{ color: starColor }}>
          {'★'.repeat(instance.stars)}
        </div>
        {!compact && (
          <div className="card-meta">
            <span className="card-level">Lv.{instance.level}</span>
            <div className="card-types">
              {template.types.map(t => (
                <span key={t} className="type-pill" style={{ background: TYPE_COLORS[t] }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
