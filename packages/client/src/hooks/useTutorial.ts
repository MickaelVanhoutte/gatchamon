import { useTutorialStore } from '../stores/tutorialStore';
import { useGameStore } from '../stores/gameStore';

const TUTORIAL_DIALOG: Record<number, string[]> = {
  1: [
    'Welcome to the world of Gatchamon, {name}!',
    "I'm Professor Oak. I study these incredible creatures.",
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
  8: ['Time for your first adventure! Tap Pewter Passage!'],
  9: ['Tap GO to enter your first battle!'],
  10: ["I've selected your monsters for you! Tap GO to fight!"],
  12: [
    'Congratulations on your first victory, {name}!',
    'Did you notice the held item you found? Held items boost your monsters\' stats!',
    'Each monster has 6 equipment slots. Items come in sets that grant bonus effects when combined!',
    'Let me show you how to equip and upgrade them. Go to your Collection!',
  ],
  13: [
    'Here is your Collection! Each monster can be equipped with held items.',
    'Select your monster to see its details!',
  ],
  14: [
    'Now let\'s manage this monster\'s equipment.',
    'Tap the Items tab to see its equipment slots!',
  ],
  15: [
    'Each slot can hold one item. Let\'s equip the item you just found!',
    'Tap the first slot to open the equipment menu!',
  ],
  16: [
    'Well done! Your monster is now stronger with that item equipped!',
    'Items can be upgraded to increase their stats. Tap the item to upgrade it!',
  ],
  17: [
    'Excellent work, {name}! You\'ve learned the basics of held items!',
    'Keep battling to find more items, and upgrade them to make your team unstoppable!',
    'You\'re ready to explore the world and become a Pokémon Champion! Good luck!',
  ],
};

const STEP_HIGHLIGHT: Record<number, string> = {
  2: 'nav-toggle',
  3: 'nav-summon',
  4: 'summon-btn-single',
  5: 'summon-btn-single',
  7: 'nav-story',
  8: 'story-region-1',
  9: 'story-floor-go',
  10: 'team-select-go',
  12: 'nav-collection',
  13: 'collection-first-mon',
  14: 'collection-tab-items',
  15: 'held-item-slot-1',
  16: 'held-item-slot-1',
};

export function useTutorial() {
  const step = useTutorialStore(s => s.step);
  const advanceStep = useTutorialStore(s => s.advanceStep);
  const setStep = useTutorialStore(s => s.setStep);
  const completeTutorial = useTutorialStore(s => s.completeTutorial);
  const playerName = useGameStore(s => s.player?.name ?? 'Trainer');

  const isActive = step > 0 && step < 18 && step !== 11;

  // On the manage page during step 15/16, show contextual dialog
  const onManagePage = window.location.hash.includes('/items/');
  let rawLines = TUTORIAL_DIALOG[step] ?? [];
  if (step === 15 && onManagePage) {
    rawLines = ['Select an item from the list, then tap Equip!'];
  } else if (step === 16 && onManagePage) {
    rawLines = ['Now tap Upgrade to power up this item!'];
  }

  const dialogLines = rawLines.map(line =>
    line.replace('{name}', playerName),
  );

  const highlightTarget = STEP_HIGHLIGHT[step] ?? null;

  function shouldHighlight(id: string): boolean {
    return highlightTarget === id;
  }

  return { step, isActive, advanceStep, setStep, completeTutorial, dialogLines, highlightTarget, shouldHighlight };
}
