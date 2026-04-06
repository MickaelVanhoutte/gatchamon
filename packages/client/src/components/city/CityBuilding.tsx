import { GameIcon } from '../icons';
import './CityBuilding.css';

interface BuildingDef {
  id: string;
  label: string;
  icon: string;
  path: string;
  xPct: number;
}

interface CityBuildingProps {
  building: BuildingDef;
  badgeCount: number;
  onNavigate: (path: string) => void;
}

export function CityBuilding({ building, badgeCount, onNavigate }: CityBuildingProps) {
  return (
    <button
      className="city-building-btn"
      style={{ left: `${building.xPct}%` }}
      onClick={() => onNavigate(building.path)}
    >
      <span className="city-building-sign">
        <GameIcon id={building.icon} size={18} />
        <span className="city-building-label">{building.label}</span>
        {badgeCount > 0 && (
          <span className="city-building-badge">{badgeCount}</span>
        )}
      </span>
    </button>
  );
}
