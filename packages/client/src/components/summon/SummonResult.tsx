import type { OwnedPokemon } from '../../stores/gameStore';
import { MonsterCard } from '../monster/MonsterCard';
import './SummonResult.css';

interface Props {
  results: OwnedPokemon[];
  onDone: () => void;
}

export function SummonResult({ results, onDone }: Props) {
  return (
    <div className="summon-result">
      <h3 className="result-title">
        {results.length === 1 ? 'You summoned!' : `${results.length} new monsters!`}
      </h3>
      <div className={`result-grid ${results.length > 1 ? 'multi' : ''}`}>
        {results.map((mon, i) => (
          <div
            key={mon.instance.instanceId}
            className="result-card-wrapper"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <MonsterCard owned={mon} compact />
          </div>
        ))}
      </div>
      <button className="done-btn" onClick={onDone}>
        OK
      </button>
    </div>
  );
}
