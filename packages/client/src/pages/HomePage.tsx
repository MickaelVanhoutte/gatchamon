import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { IslandScene } from '../components/island/IslandScene';
import './HomePage.css';

export function HomePage() {
  const { player, collection, loadCollection } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (player) loadCollection();
  }, [player, loadCollection]);

  const topMonsters = useMemo(() => {
    return [...collection]
      .sort((a, b) => {
        if (b.instance.stars !== a.instance.stars) return b.instance.stars - a.instance.stars;
        return b.instance.level - a.instance.level;
      })
      .slice(0, 6);
  }, [collection]);

  if (!player) return null;

  return (
    <div className="page island-page">
      <IslandScene
        monsters={topMonsters}
        onNavigate={navigate}
      />
    </div>
  );
}
