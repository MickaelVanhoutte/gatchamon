import './IslandBuilding.css';

interface IslandBuildingProps {
  type: 'portal' | 'arena' | 'storage';
  position: { x: number; y: number };
  label: string;
  onClick: () => void;
}

export function IslandBuilding({ type, position, label, onClick }: IslandBuildingProps) {
  return (
    <div
      className="island-building"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
    >
      <div className={`building-shape ${type}`} />
      <span className="building-label">{label}</span>
    </div>
  );
}
