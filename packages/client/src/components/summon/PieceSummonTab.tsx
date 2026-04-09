import { useState } from 'react';
import { useGameStore, type OwnedPokemon } from '../../stores/gameStore';
import { getTemplate, PIECE_COST } from '@gatchamon/shared';
import * as serverApi from '../../services/server-api.service';
import { GameIcon, StarRating } from '../icons';
import { assetUrl } from '../../utils/asset-url';
import { SummonRevealSequence } from './SummonRevealSequence';
import { SummonResult } from './SummonResult';
import './PieceSummonTab.css';

type Phase = 'idle' | 'revealing' | 'done';

export function PieceSummonTab() {
  const { player, loadCollection, refreshPlayer } = useGameStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<OwnedPokemon | null>(null);

  if (!player) return null;

  const pieces = player.mysteryPieces ?? {};
  const entries = Object.entries(pieces)
    .map(([idStr, count]) => {
      const templateId = Number(idStr);
      const template = getTemplate(templateId);
      if (!template || count <= 0) return null;
      const cost = PIECE_COST[template.naturalStars] ?? Infinity;
      return { templateId, template, count, cost, canSummon: count >= cost };
    })
    .filter(Boolean) as Array<{
      templateId: number;
      template: NonNullable<ReturnType<typeof getTemplate>>;
      count: number;
      cost: number;
      canSummon: boolean;
    }>;

  // Sort: summonable first, then by stars desc
  entries.sort((a, b) => {
    if (a.canSummon !== b.canSummon) return a.canSummon ? -1 : 1;
    return b.template.naturalStars - a.template.naturalStars;
  });

  const handleSummon = async (templateId: number) => {
    try {
      const template = getTemplate(templateId);
      if (!template) return;
      const res = await serverApi.summonFromPieces(templateId);
      const owned: OwnedPokemon = { instance: res.instance ?? res, template };
      setResult(owned);
      setPhase('revealing');
      refreshPlayer();
      loadCollection();
    } catch (err: any) {
      console.error('Piece summon failed:', err.message);
    }
  };

  const handleRevealDone = () => {
    setPhase('done');
  };

  const handleDone = () => {
    setPhase('idle');
    setResult(null);
    refreshPlayer();
    loadCollection();
  };

  if (phase === 'revealing' && result) {
    return (
      <div className="piece-summon-reveal">
        <SummonRevealSequence
          results={[result]}
          onAllRevealed={handleRevealDone}
        />
      </div>
    );
  }

  if (phase === 'done' && result) {
    return (
      <div className="piece-summon-reveal">
        <SummonResult results={[result]} onDone={handleDone} />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="piece-summon-empty">
        <GameIcon id="sparkles" size={32} />
        <p>No pieces yet!</p>
        <span>Earn pieces from the Mystery Dungeon to summon Pokemon here.</span>
      </div>
    );
  }

  return (
    <div className="piece-summon-grid">
      {entries.map(entry => {
        const progressPct = Math.min(100, Math.round((entry.count / entry.cost) * 100));
        return (
          <div key={entry.templateId} className={`piece-card ${entry.canSummon ? 'piece-card--ready' : ''}`}>
            <div className="piece-card-sprite">
              <img
                src={assetUrl(entry.template.spriteUrl)}
                alt={entry.template.name}
              />
            </div>
            <div className="piece-card-info">
              <span className="piece-card-name">{entry.template.name}</span>
              <StarRating count={entry.template.naturalStars} size={10} />
              <div className="piece-card-progress">
                <div className="piece-card-bar-bg">
                  <div
                    className="piece-card-bar-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="piece-card-count">{entry.count}/{entry.cost}</span>
              </div>
            </div>
            <button
              className="piece-card-summon-btn"
              disabled={!entry.canSummon}
              onClick={() => handleSummon(entry.templateId)}
            >
              Summon
            </button>
          </div>
        );
      })}
    </div>
  );
}
