import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { MonsterCard } from '../components/monster/MonsterCard';
import type { PokemonType } from '@gatchamon/shared';
import './CollectionPage.css';

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon',
];

type SortBy = 'stars' | 'level' | 'name';

export function CollectionPage() {
  const { collection, loadCollection } = useGameStore();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('stars');

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const filtered = collection
    .filter(mon => !typeFilter || mon.template.types.includes(typeFilter))
    .sort((a, b) => {
      if (sortBy === 'stars') return b.instance.stars - a.instance.stars;
      if (sortBy === 'level') return b.instance.level - a.instance.level;
      return a.template.name.localeCompare(b.template.name);
    });

  return (
    <div className="page collection-page">
      <div className="collection-header">
        <h2>Monster Box</h2>
        <span className="collection-count">{collection.length}</span>
      </div>

      <div className="collection-controls">
        <div className="type-filters">
          <button
            className={`filter-pill ${typeFilter === null ? 'active' : ''}`}
            onClick={() => setTypeFilter(null)}
          >
            All
          </button>
          {ALL_TYPES.map(type => (
            <button
              key={type}
              className={`filter-pill ${typeFilter === type ? 'active' : ''}`}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
              style={typeFilter === type ? { background: `var(--type-${type})` } : {}}
            >
              {type}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
        >
          <option value="stars">Stars</option>
          <option value="level">Level</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="collection-grid">
        {filtered.map(mon => (
          <MonsterCard
            key={mon.instance.instanceId}
            owned={mon}
            onClick={() => navigate(`/collection/${mon.instance.instanceId}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-msg">No monsters found. Go summon some!</p>
      )}
    </div>
  );
}
