import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../gatchamon.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDb(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pokeballs INTEGER NOT NULL DEFAULT 50,
      energy INTEGER NOT NULL DEFAULT 100,
      story_progress TEXT NOT NULL DEFAULT '{"difficulty":"normal","level":1,"floor":1}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pokemon_instances (
      instance_id TEXT PRIMARY KEY,
      template_id INTEGER NOT NULL,
      owner_id TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      stars INTEGER NOT NULL,
      exp INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (owner_id) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_pokemon_owner ON pokemon_instances(owner_id);
  `);

  console.log('Database initialized');
}
