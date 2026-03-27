import { useTutorialStore } from '../stores/tutorialStore';
import { useGameStore } from '../stores/gameStore';

const TUTORIAL_DIALOG: Record<number, string[]> = {
  1: [
    'Welcome to the world of Gatchamon, {name}!',
    "I'm Professor Cypress. I study these incredible creatures.",
    'Your journey as a trainer begins today!',
    "First, let me show you how to summon your first companion.",
  ],
  2: ['Tap the menu button to open navigation!'],
  3: ['Now tap the Summon icon to visit the summoning portal!'],
  4: ['Try your first summon! Tap "Summon x1" to catch a monster.'],
  5: ['Excellent catch! Now let\'s try a Premium summon for a stronger monster!'],
  7: [
    'Outstanding, {name}! You\'ve summoned your first companions!',
    "Now it's time for adventure. Tap the Story icon to begin your journey!",
  ],
};

const STEP_HIGHLIGHT: Record<number, string> = {
  2: 'nav-toggle',
  3: 'nav-summon',
  4: 'summon-btn-single',
  5: 'summon-btn-single',
  7: 'nav-story',
};

export function useTutorial() {
  const step = useTutorialStore(s => s.step);
  const advanceStep = useTutorialStore(s => s.advanceStep);
  const completeTutorial = useTutorialStore(s => s.completeTutorial);
  const playerName = useGameStore(s => s.player?.name ?? 'Trainer');

  const isActive = step > 0 && step < 8;

  const dialogLines = (TUTORIAL_DIALOG[step] ?? []).map(line =>
    line.replace('{name}', playerName),
  );

  const highlightTarget = STEP_HIGHLIGHT[step] ?? null;

  function shouldHighlight(id: string): boolean {
    return highlightTarget === id;
  }

  return { step, isActive, advanceStep, completeTutorial, dialogLines, highlightTarget, shouldHighlight };
}
