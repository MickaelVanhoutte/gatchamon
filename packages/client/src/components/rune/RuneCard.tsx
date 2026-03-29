import type { HeldItemInstance } from '@gatchamon/shared';
import { getItemSet, GRADE_COLORS, STAT_TYPE_LABELS } from '@gatchamon/shared';
import { GameIcon, StarRating } from '../icons';
import './RuneCard.css';

interface RuneCardProps {
  item: HeldItemInstance;
  compact?: boolean;
  selected?: boolean;
  equippedPokemonName?: string | null;
  className?: string;
  onClick?: () => void;
}

export function RuneCard({ item, compact, selected, equippedPokemonName, className, onClick }: RuneCardProps) {
  const setDef = getItemSet(item.setId);
  const gradeColor = GRADE_COLORS[item.grade];

  if (compact) {
    return (
      <div
        className={`rune-card rune-card--compact ${selected ? 'rune-card--selected' : ''}`}
        style={{ borderColor: gradeColor }}
        onClick={onClick}
      >
        <div className="rune-card-icon"><GameIcon id={setDef?.icon} size={14} /></div>
        <div className="rune-card-stars" style={{ color: gradeColor }}>
          <StarRating count={item.stars} size={10} />
        </div>
        <div className="rune-card-level">+{item.level}</div>
      </div>
    );
  }

  return (
    <div
      className={`rune-card ${selected ? 'rune-card--selected' : ''} ${className ?? ''}`}
      style={{ borderColor: gradeColor }}
      onClick={onClick}
    >
      <div className="rune-card-header">
        <span className="rune-card-icon"><GameIcon id={setDef?.icon} size={14} /></span>
        <span className="rune-card-set-name">{setDef?.name ?? item.setId}</span>
        <span className="rune-card-slot">S{item.slot}</span>
      </div>
      <div className="rune-card-stars-row">
        <span className="rune-card-stars" style={{ color: gradeColor }}>
          <StarRating count={item.stars} size={10} />
        </span>
        <span className="rune-card-grade" style={{ color: gradeColor }}>
          {item.grade}
        </span>
        <span className="rune-card-level">+{item.level}</span>
      </div>
      <div className="rune-card-main-stat">
        <span>{STAT_TYPE_LABELS[item.mainStat]}</span>
        <span className="rune-card-main-value">+{item.mainStatValue}{item.mainStat.includes('pct') || ['critRate', 'critDmg', 'acc', 'res'].includes(item.mainStat) ? '%' : ''}</span>
      </div>
      {item.subStats.length > 0 && (
        <div className="rune-card-subs">
          {item.subStats.map((sub, i) => (
            <div key={i} className="rune-card-sub">
              <span>{STAT_TYPE_LABELS[sub.type]}</span>
              <span>+{sub.value}{sub.type.includes('pct') || ['critRate', 'critDmg', 'acc', 'res'].includes(sub.type) ? '%' : ''}</span>
            </div>
          ))}
        </div>
      )}
      {equippedPokemonName && (
        <div className="rune-card-equipped">
          Equipped: {equippedPokemonName}
        </div>
      )}
    </div>
  );
}
