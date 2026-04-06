import type { OwnedPokemon } from '../../stores/gameStore';
import { GameIcon, StarRating } from '../icons';
import { assetUrl } from '../../utils/asset-url';
import './MonsterCard.css';

interface Props {
  owned: OwnedPokemon;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

const STAR_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#a78bfa',
  5: '#f87171',
  6: '#fbbf24',
};

const TYPE_COLORS: Record<string, string> = {
  normal: 'var(--type-normal)', fire: 'var(--type-fire)', water: 'var(--type-water)',
  grass: 'var(--type-grass)', electric: 'var(--type-electric)', ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)', poison: 'var(--type-poison)', ground: 'var(--type-ground)',
  flying: 'var(--type-flying)', psychic: 'var(--type-psychic)', bug: 'var(--type-bug)',
  rock: 'var(--type-rock)', ghost: 'var(--type-ghost)', dragon: 'var(--type-dragon)',
  fairy: 'var(--type-fairy)', dark: 'var(--type-dark)', steel: 'var(--type-steel)',
};

export function MonsterCard({ owned, compact, onClick, selected }: Props) {
  const { instance, template } = owned;
  const starColor = STAR_COLORS[instance.stars] ?? STAR_COLORS[1];
  const isShiny = instance.isShiny ?? false;
  const isHighRarity = instance.stars >= 4;
  const spriteUrl = isShiny
    ? assetUrl(`monsters/ani-shiny/${template.name.toLowerCase()}.gif`)
    : assetUrl(template.spriteUrl);
  const spriteSize = compact ? 44 : 80;

  return (
    <div
      className={`monster-card ${compact ? 'compact' : ''} ${selected ? 'selected' : ''} ${isShiny ? 'shiny' : ''} ${isHighRarity ? 'high-rarity' : ''}`}
      style={{ '--rarity-color': starColor } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="card-sprite" style={{ width: spriteSize, height: spriteSize }}>
        <img
          src={spriteUrl}
          alt={template.name}
        />
        {isShiny && <div className="card-shiny-sparkle" />}
      </div>
      <div className="card-info">
        <span className="card-name">
          {template.name}
          {isShiny && <span className="shiny-icon"><GameIcon id="shiny" size={12} /></span>}
        </span>
        <div className="card-stars" style={{ color: starColor }}>
          <StarRating count={instance.stars} size={10} />
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
