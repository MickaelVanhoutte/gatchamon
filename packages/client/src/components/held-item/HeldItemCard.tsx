import type { HeldItemInstance } from '@gatchamon/shared';
import { getItemSet, GRADE_COLORS, STAT_TYPE_LABELS } from '@gatchamon/shared';
import { GameIcon, StarRating } from '../icons';
import './HeldItemCard.css';

interface HeldItemCardProps {
  item: HeldItemInstance;
  compact?: boolean;
  selected?: boolean;
  equippedPokemonName?: string | null;
  className?: string;
  onClick?: () => void;
}

export function HeldItemCard({ item, compact, selected, equippedPokemonName, className, onClick }: HeldItemCardProps) {
  const setDef = getItemSet(item.setId);
  const gradeColor = GRADE_COLORS[item.grade];

  if (compact) {
    return (
      <div
        className={`held-item-card held-item-card--compact ${selected ? 'held-item-card--selected' : ''}`}
        style={{ borderColor: gradeColor }}
        onClick={onClick}
      >
        <div className="held-item-card-icon"><GameIcon id={setDef?.icon} size={14} /></div>
        <div className="held-item-card-stars" style={{ color: gradeColor }}>
          <StarRating count={item.stars} size={10} />
        </div>
        <div className="held-item-card-level">+{item.level}</div>
      </div>
    );
  }

  return (
    <div
      className={`held-item-card ${selected ? 'held-item-card--selected' : ''} ${className ?? ''}`}
      style={{ borderColor: gradeColor }}
      onClick={onClick}
    >
      <div className="held-item-card-header">
        <span className="held-item-card-icon"><GameIcon id={setDef?.icon} size={14} /></span>
        <span className="held-item-card-set-name">{setDef?.name ?? item.setId}</span>
        <span className="held-item-card-slot">S{item.slot}</span>
      </div>
      <div className="held-item-card-stars-row">
        <span className="held-item-card-stars" style={{ color: gradeColor }}>
          <StarRating count={item.stars} size={10} />
        </span>
        <span className="held-item-card-grade" style={{ color: gradeColor }}>
          {item.grade}
        </span>
        <span className="held-item-card-level">+{item.level}</span>
      </div>
      <div className="held-item-card-main-stat">
        <span>{STAT_TYPE_LABELS[item.mainStat]}</span>
        <span className="held-item-card-main-value">+{item.mainStatValue}{item.mainStat.includes('pct') || ['critRate', 'critDmg', 'acc', 'res'].includes(item.mainStat) ? '%' : ''}</span>
      </div>
      {item.subStats.length > 0 && (
        <div className="held-item-card-subs">
          {item.subStats.map((sub, i) => (
            <div key={i} className="held-item-card-sub">
              <span>{STAT_TYPE_LABELS[sub.type]}</span>
              <span>+{sub.value}{sub.type.includes('pct') || ['critRate', 'critDmg', 'acc', 'res'].includes(sub.type) ? '%' : ''}</span>
            </div>
          ))}
        </div>
      )}
      {equippedPokemonName && (
        <div className="held-item-card-equipped">
          Equipped: {equippedPokemonName}
        </div>
      )}
    </div>
  );
}
