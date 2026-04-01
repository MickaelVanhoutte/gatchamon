import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getMaxEnergy, ACTIVE_POKEDEX } from '@gatchamon/shared';
import type { PokemonInstance } from '@gatchamon/shared';
import { updatePlayer, earnStardust, earnPokedollars } from '../../services/player.service';
import { addToCollection } from '../../services/storage';
import './CheatBubble.css';

interface Feedback {
  message: string;
  success: boolean;
}

function executeCheat(command: string): Feedback {
  const player = useGameStore.getState().player;
  if (!player) return { message: 'No player', success: false };

  switch (command.trim().toLowerCase()) {
    case '/energy': {
      const maxEnergy = getMaxEnergy(player.trainerSkills);
      updatePlayer({ energy: maxEnergy, lastEnergyUpdate: new Date().toISOString() });
      return { message: `Energy restored to ${maxEnergy}!`, success: true };
    }
    case '/stardust': {
      earnStardust(500);
      return { message: '+500 Stardust!', success: true };
    }
    case '/pokedollars': {
      earnPokedollars(200_000);
      return { message: '+200,000 Pokedollars!', success: true };
    }
    case '/valousuce': {
      updatePlayer({ premiumPokeballs: player.premiumPokeballs + 10 });
      return { message: '+10 Premium Pokeballs!', success: true };
    }
    case '/allmons': {
      const instances: PokemonInstance[] = ACTIVE_POKEDEX.map(t => ({
        instanceId: crypto.randomUUID(),
        templateId: t.id,
        ownerId: player.id,
        level: 1,
        stars: t.naturalStars,
        exp: 0,
        isShiny: false,
        skillLevels: [1, 1, 1] as [number, number, number],
      }));
      addToCollection(instances);
      return { message: `+${instances.length} Pokémon added!`, success: true };
    }
    default:
      return { message: 'Unknown code', success: false };
  }
}

export function CheatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshPlayer = useGameStore(s => s.refreshPlayer);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !input.trim()) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const result = executeCheat(input);
    refreshPlayer();
    setFeedback(result);
    setInput('');

    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      if (result.success) setIsOpen(false);
    }, 1500);
  }, [input, refreshPlayer]);

  if (!isOpen) {
    return (
      <button className="cheat-bubble-btn" onClick={() => setIsOpen(true)}>
        {'>_'}
      </button>
    );
  }

  return (
    <div className="cheat-panel">
      <input
        ref={inputRef}
        type="text"
        className="cheat-panel-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleSubmit}
        placeholder="Type a code..."
        enterKeyHint="send"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {feedback && (
        <div className={`cheat-feedback ${feedback.success ? 'cheat-feedback--success' : 'cheat-feedback--error'}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
}
