export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// Newest first.
export const changelog: ChangelogEntry[] = [
  {
    version: '0.2.5',
    date: '2026-04-06',
    changes: [
      'Gym leaders, Elite Four, Champions, and Professor now show official portrait artwork in dialogs instead of emojis',
    ],
  },
  {
    version: '0.2.4',
    date: '2026-04-06',
    changes: [
      'Stardust can now drop from Essence Dungeons (floors 8-10, higher floors = better drops)',
      'Held Item Dungeon stardust drops start earlier (floor 7+) with increased amounts',
      'Battle Tower stardust milestones boosted (F30: 75, F50: 150, F75: 100 NEW, F80: 300, F100: 500)',
      'Daily Roulette stardust reward increased from 50 to 75',
    ],
  },
  {
    version: '0.2.3',
    date: '2026-04-06',
    changes: [
      'Changelog now opens in a modal instead of inline on the loading screen (fixes mobile overlap)',
    ],
  },
  {
    version: '0.2.2',
    date: '2026-04-06',
    changes: [
      'Added Glowing Pack to Shop: 3 Glowing Pokeballs (guaranteed shiny, 3-5★) for 500 Stardust',
    ],
  },
  {
    version: '0.2.1',
    date: '2026-04-06',
    changes: [
      'Battle recap now shows time to beat the floor',
      'Added Dungeon Records on Trainer page (best floor & time per dungeon)',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-04-06',
    changes: [
      'Added changelog on loading screen after updates',
    ],
  },
];
