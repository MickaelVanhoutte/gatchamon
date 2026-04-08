export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// Newest first.
export const changelog: ChangelogEntry[] = [
  {
    version: '0.6.1',
    date: '2026-04-08',
    changes: [
      'Fix: auto-repeat dungeons now works in server mode (was reading stale energy from local storage)',
      'Fix: foraging (pokemon home screen items) now works regardless of server/offline mode',
    ],
  },
  {
    version: '0.6.0',
    date: '2026-04-08',
    changes: [
      'Shiny: dual passive ability — shiny monsters can now choose between two passive abilities via the skill tab',
      'Shiny: golden sparkle burst effect when a shiny monster enters the battlefield',
      'Shiny: alternate passives generated for all monsters across all generations',
    ],
  },
  {
    version: '0.5.4',
    date: '2026-04-08',
    changes: [
      'Arena: battles now cost 1 arena ticket (max 10, regenerates 10 per 24 hours)',
      'Arena: win reward changed to 10 stardust (from 50-150)',
      'Shop: added Arena Tickets pack (10 tickets for 100 stardust)',
      'Fix: disabled double-tap zoom and scroll bounce on mobile PWA',
    ],
  },
  {
    version: '0.5.3',
    date: '2026-04-08',
    changes: [
      'Fix: battle — monsters no longer attack dead targets (confusion fallthrough & multi-hit guard)',
      'Fix: missions now progress on server (summons, battles, merges, evolutions tracked server-side)',
      'Fix: trophies now correctly award rewards when tier is claimed',
      'Fix: trophy progress updates from lifetime stats (battles, summons, merges, etc.)',
      'Fix: admin inbox send/broadcast now surfaces actual error messages instead of generic "Session expired"',
      'Fix: daily login bonus now sends a notification to the inbox',
      'Fix: daily roulette badge now correctly hides after all spins are used',
      'Inbox: added refresh button and auto-polling every 30 seconds in server mode',
      'Leader skills are now displayed in the skill tab of Collection, PC Box, and Pokedex pages',
      'Team setup: drag-and-drop reordering of team slots',
    ],
  },
  {
    version: '0.5.2',
    date: '2026-04-08',
    changes: [
      'Fix: shiny pokemon now display their shiny sprites in battle (front and back)',
      'Fix: repeat battle button is now disabled when you don\'t have enough energy for all runs',
    ],
  },
  {
    version: '0.5.1',
    date: '2026-04-08',
    changes: [
      'Leader Skills: every 3-star+ monster now has a leader skill — a passive stat bonus applied to all team members when placed in the first team slot',
      'Leader Skills: higher rarity monsters have stronger or more universal bonuses; lower rarity monsters have element-restricted bonuses',
      'Leader Skills: visible on monster detail, team select screen, and in battle with a crown icon on the leader',
      'Leader Skills: leader buffs cannot be stripped, cleansed, or stolen — they persist for the entire battle',
      'Leader Skills: enemy teams also benefit from their leader\'s skill',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-04-08',
    changes: [
      'Arena: PvP arena with ELO-based matchmaking — set a defense team and battle other players\' defenses',
      'Arena: Gym leader rivals — battle familiar faces once per day for arena coins and stardust',
      'Arena: Attack history — see who attacked your defense team and the results',
      'Arena: New currency — Arena Coins earned from PvP and rival battles',
      'Arena: Rival battles also available in offline mode',
      'Reset Account now fully deletes your account — you will need to re-register and replay the tutorial',
      'Tutorial: first 2 summons are now always fixed (Growlithe + Eevee) for everyone, even in server mode',
      'UI: redesigned player name screen with background art, glass panel, particles, and polished styling',
      'Fix: tutorial held item step no longer blocks interaction — dialog collapses on tap or after 3s',
      'Fix: tutorial item upgrade step now properly advances in server mode',
      'Fix: tutorial spotlight overlay no longer persists when navigating to item manage page',
    ],
  },
  {
    version: '0.4.1',
    date: '2026-04-08',
    changes: [
      'Server: battles (story, dungeon, tower, mystery dungeon) now fully resolved server-side — energy, rewards, XP, loot all persisted',
      'Server: daily missions, trophies, inbox, shop, roulette, login calendar, and foraging all wired to server in online mode',
      'Server: repeat/auto-battle now uses server API for battle resolution',
      'Server: badge counts (missions, inbox) refresh from server data instead of localStorage',
      'Server: dungeon records load from server in online mode',
      'No more progress loss on page reload when playing in server mode',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-04-08',
    changes: [
      'Auth: Google Sign-In required to play in server mode — accounts are linked to Google for cross-device access',
      'Auth: all API routes now require a valid JWT token; auth routes are public',
      'Auth: sign out button and Google email display on Trainer page',
      'Auth: admin panel restricted to authorized Google account only',
      'Server: tutorial first battle now drops a held item (was missing in server mode)',
      'Server: all game operations (summon, battle rewards, merge, evolve, held items, transfers) now persist to database in server mode',
    ],
  },
  {
    version: '0.3.9',
    date: '2026-04-07',
    changes: [
      'Admin: new Database tab with account count, player search, and inbox message sender',
      'Admin: broadcast inbox messages to all players with optional reward attachments',
    ],
  },
  {
    version: '0.3.8',
    date: '2026-04-07',
    changes: [
      'Tutorial: first battle now features only 2 enemies (Oddish + Rattata) for an easier intro',
      'Tutorial: fixed held item management steps getting stuck — overlay no longer blocks item grid and equip/upgrade buttons',
    ],
  },
  {
    version: '0.3.7',
    date: '2026-04-07',
    changes: [
      'Server: daily missions, trophies, inbox, login calendar, roulette, foraging, shop, mystery summon, dungeon records endpoints',
      'Server: daily route registered at /api/daily with full CRUD for all progression systems',
      'Fixed type mismatches between server daily service and shared type definitions',
    ],
  },
  {
    version: '0.3.6',
    date: '2026-04-07',
    changes: [
      'Faster app loading: code splitting, reduced loading screen timer, and non-blocking service worker',
      'Fixed merge bug with incorrect splice logic',
      'Fixed empty summon pool crash guard',
      'Added unit tests for game formulas',
    ],
  },
  {
    version: '0.3.5',
    date: '2026-04-07',
    changes: [
      'Pokémon on the home screen now forage for items! Every 15 minutes of playtime, one of your Pokémon will find an item — tap them to collect it',
      'Foraging loot includes Pokédollars, Stardust, Pokéballs (all rarities), and Essences',
    ],
  },
  {
    version: '0.3.4',
    date: '2026-04-06',
    changes: [
      'Added falling leaves particles to home screen and story map for extra atmosphere',
    ],
  },
  {
    version: '0.3.3',
    date: '2026-04-06',
    changes: [
      'Fixed healing floating numbers not appearing on allies when healed by offensive skills (e.g. self-heal on attack, heal-all-allies on AoE)',
    ],
  },
  {
    version: '0.3.2',
    date: '2026-04-06',
    changes: [
      'All city buildings now have cinematic zoom + fade-to-black transition when entering',
    ],
  },
  {
    version: '0.3.1',
    date: '2026-04-06',
    changes: [
      'New home screen: scrollable illustrated city street replaces the old meadow scene',
      'Each building in the city maps to a menu entry (Summon Lab, PokéMart, PC Center, Route Gate, etc.)',
      'Tap a building sign to navigate — center alley leads to Story mode',
      'Pokémon hang out on the street foreground with idle breathing animations',
      'Atmospheric overlays: vignette and light rays',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-04-06',
    changes: [
      'PC Box: new storage system for bulk monster management — accessible from Collection page',
      'Monsters in PC are stacked by species/stars/shiny with x count badges',
      'Transfer monsters between Collection and PC Box freely',
      'Bulk Store mode in Collection: multi-select monsters to send to PC at once',
      'Auto PC toggle on Summon page: automatically sends 1-3 star summons to PC',
      'Power-Up Circle now shows PC monsters as fodder (toggle "+ PC" in header)',
      'Quick "★1-3→PC" button in Collection: one-click stores all Lv.1 ★1-3 monsters without held items',
      'Fodder XP significantly buffed: base multiplier 50 → 150, star multipliers increased (1★ lv1 = 150 XP, 3★ lv1 = 600 XP)',
    ],
  },
  {
    version: '0.2.21',
    date: '2026-04-06',
    changes: [
      'Healing numbers now show actual values (+96) instead of generic "+Heal" text',
      'Turn-start heals (Recovery buff, Sleep heal, Leftovers) now display floating green numbers on the healed Pokemon',
      'Skill-based heals (e.g. Starmie Psychic) now show heal amounts on each healed ally',
    ],
  },
  {
    version: '0.2.20',
    date: '2026-04-06',
    changes: [
      'Increased locked tower floor text opacity from 0.4 to 0.6 for readability',
      'Removed inline background color override on mystery dungeon Go button so it uses default yellow CSS styling',
      'Added flex-shrink: 0 to dungeon enter button to prevent squishing',
      'Added padding-bottom to mystery dungeon panel to prevent Go button cutoff',
    ],
  },
  {
    version: '0.2.19',
    date: '2026-04-06',
    changes: [
      'Removed border-radius from collection header (.box-header)',
      'Removed border-radius from pokedex filter bar (.pdex-filters)',
      'Removed border-radius and borders from dungeon section tab buttons for flat tab segment look',
      'Brightened --text-secondary to #d8efe8 and --text-muted to #8fb8cc for better readability on blue backgrounds',
    ],
  },
  {
    version: '0.2.18',
    date: '2026-04-06',
    changes: [
      'Increased bottom nav expanded bar opacity from 0.10 to solid teal frosted glass (0.75)',
      'Fixed skip button and progress counter visibility on summon reveal sequence with white text and teal background',
      'Added mobile scroll support to shop page with overflow-y and bottom nav padding offset',
    ],
  },
  {
    version: '0.2.17',
    date: '2026-04-06',
    changes: [
      'Restyled dungeon navigation tabs as pill-shaped buttons with accent active state',
      'Made dungeon floor selector buttons circular with inset shadow and golden glow when active',
      'Redesigned dungeon enter button with gold gradient, sparkle sweep animation, and dark text',
      'Updated bottom nav expanded bar to painterly frosted glass background',
      'Replaced bottom nav active tab bar indicator with radial sun-spot glow pulse',
      'Updated collapsed FAB button to use accent gold background',
    ],
  },
  {
    version: '0.2.16',
    date: '2026-04-06',
    changes: [
      'Restyled Collection page grid cells with glassmorphism blur and larger border-radius',
      'Rewrote selected-cell pulse animation to a wider yellow aura glow',
      'Added star bloom drop-shadow effect to rarity stars in grid and detail panel',
      'Applied glassmorphism border-radius to detail panel, header, and merge dialog',
      'Updated MonsterCard border, name text-shadow, and star bloom to match Forge design system',
    ],
  },
  {
    version: '0.2.15',
    date: '2026-04-06',
    changes: [
      'Replaced awkward Pokémon roaming with gentle idle breathing animations and responsive shadows',
      'Added atmospheric overlays to home screen: vignette, firefly particles, fog wisps, light rays, canopy gradients',
      'Added organic noise texture to ground SVG on both home and story screens',
      'Added atmospheric overlays to story map: vignette, fireflies, fog patches, canopy edge gradients',
      'Improved story path with shadow and glow effect, added ground shadows under zone markers',
    ],
  },
  {
    version: '0.2.14',
    date: '2026-04-06',
    changes: [
      'Added more padding to pokeball selector buttons in summon screen',
      'Flattened UI design: removed heavy gold glows and shadows from buttons, HUD, and nav bar',
    ],
  },
  {
    version: '0.2.13',
    date: '2026-04-06',
    changes: [
      'Decluttered header bar: resources (Pokedollars, Stardust, Pokeballs) now grouped in a bag dropdown',
      'Energy remains visible directly in the header for quick access',
      'Increased spacing between header elements for better readability',
    ],
  },
  {
    version: '0.2.12',
    date: '2026-04-06',
    changes: [
      'Unified held item management into one full-screen page (equip, upgrade, sell all in one place)',
      'Tapping any item slot now navigates to dedicated manage page instead of tiny modal',
      'Made back button more visible on item manage page',
      'Removed redundant held item modals for cleaner UX',
    ],
  },
  {
    version: '0.2.11',
    date: '2026-04-06',
    changes: [
      'Fixed static sprites for mega & alternate forms (Starmie-Mega, Clefable-Mega, etc.)',
      'Held item panel now scrollable in collection detail view',
      'Added Upgrade button in held item selection for equipped items',
      'Enlarged pokeball type selector buttons on summon screen',
      'Changelog button always visible on loading screen',
    ],
  },
  {
    version: '0.2.10',
    date: '2026-04-06',
    changes: [
      'Fixed held item set filter row not scrollable on mobile',
      'Fixed upgrade button unreachable for equipped held items — tap an equipped slot to upgrade, tap an empty slot to equip',
    ],
  },
  {
    version: '0.2.9',
    date: '2026-04-06',
    changes: [
      'Skill ups now matter for passives: +5% effect proc chance per level',
      'Active skill (S2) at max level (Lv.5) reduces its cooldown by 1 turn',
      'Skill cards now display passive trigger conditions (On Hit, Start of Turn, etc.)',
    ],
  },
  {
    version: '0.2.8',
    date: '2026-04-06',
    changes: [
      'Collection & Pokedex: grid cells now use static PNG sprites instead of animated GIFs for much better performance',
    ],
  },
  {
    version: '0.2.7',
    date: '2026-04-06',
    changes: [
      'Collection: added Shiny filter alongside grade and type filters',
      'Pokedex: effect filter is now instant (no more 3s lag)',
      'Summoning: Glowing pokeball now supports x10 summon',
      'Summoning: portal animation uses matching pokeball colors (legendary/glowing)',
      'Loading screen: changelog modal is now scrollable on all devices',
    ],
  },
  {
    version: '0.2.6',
    date: '2026-04-06',
    changes: [
      'Shiny Transfer: feeding a shiny monster from the same evolution line transfers its shiny status to the base monster',
      'Power-Up Circle: shiny-transferable monsters now show a "Shiny" badge on their card, and the preview panel shows a "Shiny Transfer" line',
    ],
  },
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
