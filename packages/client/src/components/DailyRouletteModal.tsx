import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ROULETTE_SLOTS } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import * as serverApi from '../services/server-api.service';
import { GameIcon } from './icons';
import { haptic } from '../utils/haptics';
import './DailyRouletteModal.css';

type Phase = 'idle' | 'spinning' | 'result';

// The grid is 4 columns x 3 rows = 12 cells.
// Center cells (row 1, cols 1-2 = indices 5,6) are the spin button.
// The remaining 10 cells hold our 10 reward slots.
// We traverse the perimeter clockwise:
//   top row L→R: 0,1,2,3
//   right col top→bottom: 7
//   bottom row R→L: 11,10,9,8
//   left col bottom→top: 4
// That gives us the order: [0,1,2,3,7,11,10,9,8,4] — 10 perimeter cells.
const GRID_CELLS = 12; // 4x3
const PERIMETER_ORDER = [0, 1, 2, 3, 7, 11, 10, 9, 8, 4];

interface DailyRouletteModalProps {
  onClose: (remainingSpins: number) => void;
}

export function DailyRouletteModal({ onClose }: DailyRouletteModalProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [highlightIdx, setHighlightIdx] = useState<number>(-1);
  const [winSlot, setWinSlot] = useState<typeof ROULETTE_SLOTS[number] | null>(null);
  const [remaining, setRemaining] = useState(0);

  // Load roulette state from server on mount
  useEffect(() => {
    serverApi.getRoulette().then((res: any) => {
      setRemaining(res.remaining ?? 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSpin = useCallback(async () => {
    if (remaining <= 0 || phase !== 'idle') return;

    haptic.medium();
    let slotIndex: number;
    let slot: typeof ROULETTE_SLOTS[number];

    try {
      const res = await serverApi.spinRoulette();
      slotIndex = res.slotIndex ?? 0;
      slot = ROULETTE_SLOTS[slotIndex] ?? ROULETTE_SLOTS[0];
    } catch {
      return;
    }

    setWinSlot(slot);
    setPhase('spinning');

    const totalLoops = 3;
    const totalSteps = totalLoops * PERIMETER_ORDER.length + slotIndex;
    let step = 0;
    let delay = 50;

    const tick = () => {
      setHighlightIdx(step % PERIMETER_ORDER.length);
      step++;

      if (step > totalSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('result');
        haptic.success();
        serverApi.getRoulette().then((res: any) => {
          setRemaining(res.remaining ?? 0);
        }).catch(() => {});
        useGameStore.getState().refreshPlayer();
        setTimeout(() => {
          if (resultRef.current) {
            gsap.fromTo(
              resultRef.current,
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
            );
          }
        }, 50);
        return;
      }

      const stepsLeft = totalSteps - step;
      if (stepsLeft < 15) {
        delay = 50 + (15 - stepsLeft) * 30;
      }

      intervalRef.current = setTimeout(tick, delay) as unknown as ReturnType<typeof setInterval>;
    };

    intervalRef.current = setTimeout(tick, delay) as unknown as ReturnType<typeof setInterval>;
  }, [remaining, phase]);

  const handleSpinAgain = () => {
    setPhase('idle');
    setWinSlot(null);
    setHighlightIdx(-1);
  };

  // Build the grid
  const gridCells: Array<{ type: 'reward'; slotIdx: number } | { type: 'button' }> = [];
  for (let i = 0; i < GRID_CELLS; i++) {
    if (i === 5 || i === 6) {
      gridCells.push({ type: 'button' });
    } else {
      const perimIdx = PERIMETER_ORDER.indexOf(i);
      gridCells.push({ type: 'reward', slotIdx: perimIdx });
    }
  }

  const highlightedCellIdx = highlightIdx >= 0 ? PERIMETER_ORDER[highlightIdx] : -1;
  const canSpin = remaining > 0;

  return (
    <div className="roulette-overlay" onClick={phase === 'result' && !canSpin ? () => onClose(remaining) : undefined}>
      <div className="roulette-modal" onClick={e => e.stopPropagation()}>
        <button className="roulette-close" onClick={() => onClose(remaining)}>
          <GameIcon id="close" size={18} />
        </button>

        <h3 className="roulette-title">Daily Roulette</h3>

        <div className="roulette-grid">
          {gridCells.map((cell, i) => {
            if (cell.type === 'button') {
              if (i === 6) return null;
              return (
                <button
                  key="spin"
                  className={`roulette-spin-cell ${canSpin && phase === 'idle' ? 'roulette-spin-cell--active' : ''}`}
                  onClick={handleSpin}
                  disabled={!canSpin || phase !== 'idle'}
                >
                  <GameIcon id="roulette" size={24} />
                  <span className="roulette-spin-label">
                    {phase === 'idle' && canSpin && `SPIN! (${remaining})`}
                    {phase === 'spinning' && '...'}
                    {phase === 'result' && 'Done!'}
                    {phase === 'idle' && !canSpin && 'Tomorrow'}
                  </span>
                </button>
              );
            }

            const slot = ROULETTE_SLOTS[cell.slotIdx];
            if (!slot) return null;

            const isHighlighted = highlightedCellIdx === i;
            const isWinner = phase === 'result' && winSlot?.id === slot.id;

            return (
              <div
                key={slot.id}
                className={`roulette-cell roulette-cell--${slot.rarity}${isHighlighted ? ' roulette-cell--highlight' : ''}${isWinner ? ' roulette-cell--winner' : ''}`}
              >
                <span className="roulette-cell-icon">
                  <GameIcon id={slot.icon} size={20} />
                </span>
                <span className="roulette-cell-label">{slot.label}</span>
              </div>
            );
          })}
        </div>

        {phase === 'result' && winSlot && (
          <div
            ref={resultRef}
            className={`roulette-result roulette-result--${winSlot.rarity}`}
            style={{ opacity: 0 }}
          >
            <p className="roulette-result-text">
              <GameIcon id={winSlot.icon} size={18} />
              You won: {winSlot.label}!
            </p>
          </div>
        )}

        {phase === 'result' && canSpin && (
          <button className="roulette-again-btn" onClick={handleSpinAgain}>
            Spin again ({remaining} left)
          </button>
        )}

        {phase === 'idle' && !canSpin && (
          <div className="roulette-already-spun">
            Come back tomorrow for another spin!
          </div>
        )}
      </div>
    </div>
  );
}
