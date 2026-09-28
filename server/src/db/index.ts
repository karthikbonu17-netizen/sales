import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config';
import { SCHEMA_SQL } from './schema';

const dbDir = path.dirname(CONFIG.DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(CONFIG.DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(SCHEMA_SQL);
}

export default db;
