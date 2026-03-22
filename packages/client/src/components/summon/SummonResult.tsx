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
      <div className="result-grid">
        {results.map(mon => (
          <MonsterCard key={mon.instance.instanceId} owned={mon} compact />
        ))}
      </div>
      <button className="done-btn" onClick={onDone}>
        OK
      </button>
    </div>
  );
}
