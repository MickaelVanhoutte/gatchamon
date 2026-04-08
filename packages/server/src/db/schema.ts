import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../gatchamon.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

const DEFAULT_STORY_PROGRESS = '{"normal":{"1":1},"hard":{},"hell":{}}';

export function initDb(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pokeballs INTEGER NOT NULL DEFAULT 50,
      energy INTEGER NOT NULL DEFAULT 100,
      story_progress TEXT NOT NULL DEFAULT '${DEFAULT_STORY_PROGRESS}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pokemon_instances (
      instance_id TEXT PRIMARY KEY,
      template_id INTEGER NOT NULL,
      owner_id TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      stars INTEGER NOT NULL,
      exp INTEGER NOT NULL DEFAULT 0,
      is_shiny INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (owner_id) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_pokemon_owner ON pokemon_instances(owner_id);
  `);

  // Migrate old story_progress format to new region-based format
  migrateStoryProgress(database);

  // Add is_shiny column to existing databases
  migrateAddShiny(database);

  // Split pokeballs into regular/premium
  migratePokeballSplit(database);

  // Add skill_levels column
  migrateAddSkillLevels(database);

  // Add legendary pokeballs and tower progress
  migrateLegendaryAndTower(database);

  // Add all remaining player fields (currencies, trainer, pity, energy, pc)
  migratePlayerFullFields(database);

  // Add location column to pokemon_instances (collection vs pc)
  migratePokemonLocation(database);

  // Create new tables for game systems
  migrateCreateHeldItems(database);
  migrateCreateRewardState(database);
  migrateCreateInbox(database);
  migrateCreateLoginCalendar(database);
  migrateCreateDailyRoulette(database);
  migrateCreateGrantedFlags(database);
  migrateCreateDungeonRecords(database);
  migrateCreateForagingState(database);
  migrateGoogleAuth(database);
  migrateArena(database);
  migrateChat(database);

  console.log('Database initialized');
}

function migrateAddShiny(database: Database.Database): void {
  try {
    database.exec('ALTER TABLE pokemon_instances ADD COLUMN is_shiny INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists
  }
}

function migratePokeballSplit(database: Database.Database): void {
  try {
    database.exec('ALTER TABLE players ADD COLUMN regular_pokeballs INTEGER NOT NULL DEFAULT 50');
    database.exec('ALTER TABLE players ADD COLUMN premium_pokeballs INTEGER NOT NULL DEFAULT 0');
    // Migrate existing pokeballs to regular
    database.exec('UPDATE players SET regular_pokeballs = pokeballs');
  } catch {
    // Columns already exist
  }
}

function migrateAddSkillLevels(database: Database.Database): void {
  try {
    database.exec("ALTER TABLE pokemon_instances ADD COLUMN skill_levels TEXT NOT NULL DEFAULT '[1,1,1]'");
  } catch {
    // Column already exists
  }
}

function migrateLegendaryAndTower(database: Database.Database): void {
  try {
    database.exec('ALTER TABLE players ADD COLUMN legendary_pokeballs INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists
  }
  try {
    database.exec('ALTER TABLE players ADD COLUMN tower_progress INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists
  }
}

function migratePlayerFullFields(database: Database.Database): void {
  const cols: [string, string][] = [
    ['glowing_pokeballs', 'INTEGER NOT NULL DEFAULT 0'],
    ['stardust', 'INTEGER NOT NULL DEFAULT 0'],
    ['pokedollars', 'INTEGER NOT NULL DEFAULT 0'],
    ['materials', "TEXT NOT NULL DEFAULT '{}'"],
    ['mystery_pieces', "TEXT NOT NULL DEFAULT '{}'"],
    ['trainer_level', 'INTEGER NOT NULL DEFAULT 1'],
    ['trainer_exp', 'INTEGER NOT NULL DEFAULT 0'],
    ['trainer_skill_points', 'INTEGER NOT NULL DEFAULT 0'],
    ['trainer_skills', `TEXT NOT NULL DEFAULT '${JSON.stringify({
      energyRegenSpeed: 0, maxEnergyPool: 0,
      globalAtkBonus: 0, globalDefBonus: 0, globalHpBonus: 0, globalSpdBonus: 0,
      pokedollarBonus: 0, xpBonus: 0, pokeballBonus: 0, essenceBonus: 0,
    })}'`],
    ['premium_pity_counter', 'INTEGER NOT NULL DEFAULT 0'],
    ['last_energy_update', "TEXT NOT NULL DEFAULT (datetime('now'))"],
    ['pc_auto_send', 'INTEGER NOT NULL DEFAULT 0'],
    ['tower_reset_date', "TEXT"],
  ];
  for (const [name, def] of cols) {
    try {
      database.exec(`ALTER TABLE players ADD COLUMN ${name} ${def}`);
    } catch {
      // Column already exists
    }
  }
}

function migratePokemonLocation(database: Database.Database): void {
  try {
    database.exec("ALTER TABLE pokemon_instances ADD COLUMN location TEXT NOT NULL DEFAULT 'collection'");
  } catch {
    // Column already exists
  }
}

function migrateCreateHeldItems(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS held_items (
      item_id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      set_id TEXT NOT NULL,
      slot INTEGER NOT NULL,
      stars INTEGER NOT NULL,
      grade TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 0,
      main_stat TEXT NOT NULL,
      main_stat_value REAL NOT NULL,
      sub_stats TEXT NOT NULL DEFAULT '[]',
      equipped_to TEXT,
      FOREIGN KEY (owner_id) REFERENCES players(id),
      FOREIGN KEY (equipped_to) REFERENCES pokemon_instances(instance_id)
    );
    CREATE INDEX IF NOT EXISTS idx_items_owner ON held_items(owner_id);
    CREATE INDEX IF NOT EXISTS idx_items_equipped ON held_items(equipped_to);
  `);
}

function migrateCreateRewardState(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS reward_state (
      player_id TEXT PRIMARY KEY,
      daily_missions TEXT NOT NULL DEFAULT '{}',
      trophy_progress TEXT NOT NULL DEFAULT '[]',
      first_clears TEXT NOT NULL DEFAULT '{}',
      stats TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateCreateInbox(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS inbox (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reward TEXT,
      special_item TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      claimed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
    CREATE INDEX IF NOT EXISTS idx_inbox_player ON inbox(player_id);
  `);
}

function migrateCreateLoginCalendar(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS login_calendar (
      player_id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      claimed_days TEXT NOT NULL DEFAULT '[]',
      last_claim_date TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateCreateDailyRoulette(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS daily_roulette (
      player_id TEXT PRIMARY KEY,
      last_spin_date TEXT NOT NULL DEFAULT '',
      spins_today INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateCreateGrantedFlags(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS granted_flags (
      player_id TEXT NOT NULL,
      flag TEXT NOT NULL,
      PRIMARY KEY (player_id, flag),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateCreateDungeonRecords(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS dungeon_records (
      player_id TEXT NOT NULL,
      dungeon_key TEXT NOT NULL,
      max_floor INTEGER NOT NULL DEFAULT 0,
      best_time_sec REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (player_id, dungeon_key),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateCreateForagingState(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS foraging_state (
      player_id TEXT PRIMARY KEY,
      accumulated_ms INTEGER NOT NULL DEFAULT 0,
      pending_finds TEXT NOT NULL DEFAULT '{}',
      last_save_ts INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateGoogleAuth(database: Database.Database): void {
  try {
    database.exec('ALTER TABLE players ADD COLUMN google_id TEXT');
  } catch {
    // Column already exists
  }
  try {
    database.exec('ALTER TABLE players ADD COLUMN google_email TEXT');
  } catch {
    // Column already exists
  }
  try {
    database.exec('CREATE UNIQUE INDEX idx_players_google_id ON players(google_id) WHERE google_id IS NOT NULL');
  } catch {
    // Index already exists
  }
}

function migrateArena(database: Database.Database): void {
  // Player columns
  try { database.exec('ALTER TABLE players ADD COLUMN arena_elo INTEGER NOT NULL DEFAULT 1000'); } catch { /* exists */ }
  try { database.exec('ALTER TABLE players ADD COLUMN arena_coins INTEGER NOT NULL DEFAULT 0'); } catch { /* exists */ }

  // Defense team table
  database.exec(`
    CREATE TABLE IF NOT EXISTS arena_defense (
      player_id TEXT PRIMARY KEY,
      team_instance_ids TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);

  // Battle history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS arena_history (
      id TEXT PRIMARY KEY,
      attacker_id TEXT NOT NULL,
      defender_id TEXT NOT NULL,
      attacker_won INTEGER NOT NULL,
      attacker_team TEXT NOT NULL DEFAULT '[]',
      defender_team TEXT NOT NULL DEFAULT '[]',
      attacker_elo_change INTEGER NOT NULL DEFAULT 0,
      defender_elo_change INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (attacker_id) REFERENCES players(id),
      FOREIGN KEY (defender_id) REFERENCES players(id)
    );
    CREATE INDEX IF NOT EXISTS idx_arena_history_defender ON arena_history(defender_id);
    CREATE INDEX IF NOT EXISTS idx_arena_history_attacker ON arena_history(attacker_id);
  `);

  // Rival cooldowns
  database.exec(`
    CREATE TABLE IF NOT EXISTS arena_rival_cooldowns (
      player_id TEXT NOT NULL,
      rival_id TEXT NOT NULL,
      last_battle_date TEXT NOT NULL,
      PRIMARY KEY (player_id, rival_id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);
}

function migrateChat(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      player_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);
  `);
}

function migrateStoryProgress(database: Database.Database): void {
  const rows = database.prepare('SELECT id, story_progress FROM players').all() as Array<{ id: string; story_progress: string }>;

  for (const row of rows) {
    try {
      const progress = JSON.parse(row.story_progress);
      // Detect old format: has 'difficulty' key at top level
      if (progress.difficulty !== undefined) {
        const oldFloor = progress.floor ?? 1;
        // Build new format preserving the floor the player was on
        const regionProgress: Record<number, number> = {};
        // Figure out which region they were in (old system was flat 1-10 floors = region 1)
        regionProgress[1] = Math.min(oldFloor, 11);
        // If they completed region 1, unlock region 2
        if (oldFloor > 10) {
          regionProgress[1] = 11;
          regionProgress[2] = 1;
        }

        const newProgress = { normal: regionProgress, hard: {}, hell: {} };
        database.prepare('UPDATE players SET story_progress = ? WHERE id = ?')
          .run(JSON.stringify(newProgress), row.id);
      }
    } catch {
      // If parsing fails, reset to default
      database.prepare('UPDATE players SET story_progress = ? WHERE id = ?')
        .run(DEFAULT_STORY_PROGRESS, row.id);
    }
  }
}
