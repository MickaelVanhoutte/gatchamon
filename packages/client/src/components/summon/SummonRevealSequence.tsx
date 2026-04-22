import { useState, useCallback, useEffect } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { SummonLightning } from './SummonLightning';
import { SummonReveal } from './SummonReveal';
import { haptic } from '../../utils/haptics';
import './SummonRevealSequence.css';

interface Props {
  results: OwnedPokemon[];
  onAllRevealed: () => void;
}

type SubPhase = 'lightning' | 'reveal' | 'waiting';

function isSpecialPull(pokemon: OwnedPokemon): boolean {
  return pokemon.instance.stars >= 3 || (pokemon.instance.isShiny ?? false);
}

/** 4★+ or shiny — these always show animations even when skipping */
function isHighRarity(pokemon: OwnedPokemon): boolean {
  return pokemon.instance.stars >= 4 || (pokemon.instance.isShiny ?? false);
}

export function SummonRevealSequence({ results, onAllRevealed }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>('lightning');
  const [skipping, setSkipping] = useState(false);

  // When skipping, auto-advance past non-high-rarity pulls
  useEffect(() => {
    if (!skipping) return;
    const current = results[currentIndex];
    if (!current || isHighRarity(current)) return;

    // Find next high-rarity pull, or jump to the end
    let nextIndex = currentIndex + 1;
    while (nextIndex < results.length && !isHighRarity(results[nextIndex])) {
      nextIndex++;
    }

    if (nextIndex < results.length) {
      setCurrentIndex(nextIndex);
      setSubPhase('lightning');
    } else {
      onAllRevealed();
    }
  }, [skipping, currentIndex, results, onAllRevealed]);

  const handleLightningComplete = useCallback(() => {
    setSubPhase('reveal');
  }, []);

  const handleRevealComplete = useCallback(() => {
    const current = results[currentIndex];
    if (current) {
      // Heavier haptic for high-rarity / shiny reveals, light tick otherwise.
      if (isHighRarity(current)) haptic.impact();
      else if (isSpecialPull(current)) haptic.double();
      else haptic.tap();
    }
    // If this is a special pull in multi-summon, pause and wait for tap
    if (current && isSpecialPull(current) && results.length > 1) {
      setSubPhase('waiting');
      return;
    }
    // Otherwise advance normally
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSubPhase('lightning');
    } else {
      onAllRevealed();
    }
  }, [currentIndex, results, onAllRevealed]);

  const handleTapToContinue = useCallback(() => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSubPhase('lightning');
    } else {
      onAllRevealed();
    }
  }, [currentIndex, results.length, onAllRevealed]);

  const handleSkip = useCallback(() => {
    setSkipping(true);
  }, []);

  const current = results[currentIndex];
  if (!current) return null;

  const special = isSpecialPull(current);
  // During skip, only render animations for high-rarity pulls (effect auto-advances the rest)
  const showAnimation = !skipping || isHighRarity(current);

  return (
    <div className="reveal-sequence">
      {/* Progress indicator for multi-summon */}
      {results.length > 1 && (
        <div className="reveal-progress">
          {currentIndex + 1} / {results.length}
        </div>
      )}

      {/* Skip button for multi-summon (hidden once skipping is active) */}
      {results.length > 1 && !skipping && (
        <button className="reveal-skip-btn" onClick={handleSkip}>
          Skip ▸▸
        </button>
      )}

      {/* Current reveal phase */}
      {showAnimation && subPhase === 'lightning' && (
        <SummonLightning
          key={`lightning-${currentIndex}`}
          stars={current.instance.stars}
          isShiny={current.instance.isShiny ?? false}
          onComplete={handleLightningComplete}
        />
      )}

      {showAnimation && (subPhase === 'reveal' || subPhase === 'waiting') && (
        <SummonReveal
          key={`reveal-${currentIndex}`}
          pokemon={current}
          isSpecial={special}
          onComplete={handleRevealComplete}
        />
      )}

      {/* Tap to continue overlay for special pulls */}
      {showAnimation && subPhase === 'waiting' && (
        <div className="tap-to-continue-overlay" onClick={handleTapToContinue}>
          <div className="tap-to-continue-text">Tap to continue</div>
        </div>
      )}
    </div>
  );
}
