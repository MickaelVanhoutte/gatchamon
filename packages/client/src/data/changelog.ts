export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// Newest first. Only the first entry is shown on the loading screen.
export const changelog: ChangelogEntry[] = [
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
