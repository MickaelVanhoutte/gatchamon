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
