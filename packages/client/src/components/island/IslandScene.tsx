import type { OwnedPokemon } from '../../stores/gameStore';
import { IslandBuilding } from './IslandBuilding';
import { IslandMonster } from './IslandMonster';
import './IslandScene.css';

interface IslandSceneProps {
  monsters: OwnedPokemon[];
  onNavigate: (path: string) => void;
}

export function IslandScene({ monsters, onNavigate }: IslandSceneProps) {
  return (
    <div className="island-scene">
      {/* Sky stars */}
      <div className="island-stars">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="island-star" />
        ))}
      </div>

      {/* Water waves */}
      <div className="island-water-waves">
        <div className="island-wave" />
        <div className="island-wave" />
      </div>

      {/* Island */}
      <div className="island-landmass">
        <div className="island-beach" />
        <div className="island-terrain">
          <div className="island-rock" />
          <div className="island-pond" />
          <div className="island-path" />
          <div className="island-tree tree-1" />
          <div className="island-tree tree-2" />
          <div className="island-tree tree-3" />
          <div className="island-tree tree-4" />
        </div>

        {/* Buildings */}
        <div className="island-buildings">
          <IslandBuilding
            type="portal"
            position={{ x: 28, y: 45 }}
            label="Summon"
            onClick={() => onNavigate('/summon')}
          />
          <IslandBuilding
            type="arena"
            position={{ x: 72, y: 32 }}
            label="Battle"
            onClick={() => onNavigate('/story')}
          />
          <IslandBuilding
            type="storage"
            position={{ x: 52, y: 72 }}
            label="Monster Box"
            onClick={() => onNavigate('/collection')}
          />
        </div>

        {/* Monsters */}
        <div className="island-monsters">
          {monsters.map((mon, i) => (
            <IslandMonster
              key={mon.instance.instanceId}
              owned={mon}
              positionIndex={i}
            />
          ))}
          {monsters.length === 0 && (
            <div className="island-empty-prompt">
              Tap Summon to get your first monster!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
