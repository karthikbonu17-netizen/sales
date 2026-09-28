import Database from 'better-sqlite3';
import fs from 'fs';
import readline from 'readline';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../../salesmind.db');
const csvPath = path.resolve(__dirname, '../../../data/NIFTY50_all.csv');

console.log(`Connecting to database at: ${dbPath}`);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Create Table & Indexes
db.exec(`
  CREATE TABLE IF NOT EXISTS nifty50_stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    date TEXT NOT NULL,
    series TEXT,
    prev_close REAL,
    open REAL,
    high REAL,
    low REAL,
    last REAL,
    close REAL,
    vwap REAL,
    volume INTEGER,
    turnover REAL,
    trades INTEGER,
    deliverable_volume INTEGER,
    pct_deliverble REAL
  );

  CREATE INDEX IF NOT EXISTS idx_nifty_symbol ON nifty50_stocks(symbol);
  CREATE INDEX IF NOT EXISTS idx_nifty_symbol_date ON nifty50_stocks(symbol, date);
  CREATE INDEX IF NOT EXISTS idx_nifty_date ON nifty50_stocks(date);
`);

console.log('Ingesting NIFTY50 CSV data into SQLite...');

async function ingest() {
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const insertStmt = db.prepare(`
    INSERT INTO nifty50_stocks (
      date, symbol, series, prev_close, open, high, low, last, close, vwap, volume, turnover, trades, deliverable_volume, pct_deliverble
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  let batch: any[][] = [];
  const BATCH_SIZE = 10000;

  const insertMany = db.transaction((rows: any[][]) => {
    for (const r of rows) {
      insertStmt.run(...r);
    }
  });

  // Clear existing to avoid duplicate ingestion
  db.exec('DELETE FROM nifty50_stocks');

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    if (parts.length < 9) continue;

    // Check if line is a header like Date,Symbol...
    if (parts[0].toLowerCase() === 'date' || parts[1].toLowerCase() === 'symbol') {
      continue;
    }

    const date = parts[0].trim();
    const symbol = parts[1].trim();
    const series = parts[2] ? parts[2].trim() : 'EQ';
    const prev_close = parseFloat(parts[3]) || null;
    const open = parseFloat(parts[4]) || null;
    const high = parseFloat(parts[5]) || null;
    const low = parseFloat(parts[6]) || null;
    const last = parseFloat(parts[7]) || null;
    const close = parseFloat(parts[8]) || null;
    const vwap = parseFloat(parts[9]) || null;
    const volume = parseInt(parts[10], 10) || null;
    const turnover = parseFloat(parts[11]) || null;
    const trades = parts[12] ? parseInt(parts[12], 10) || null : null;
    const deliverable_volume = parts[13] ? parseInt(parts[13], 10) || null : null;
    const pct_deliverble = parts[14] ? parseFloat(parts[14]) || null : null;

    batch.push([
      date, symbol, series, prev_close, open, high, low, last, close, vwap, volume, turnover, trades, deliverable_volume, pct_deliverble
    ]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      process.stdout.write(`\rInserted ${count.toLocaleString()} rows...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  console.log(`\n✓ Ingestion complete! Total ${count.toLocaleString()} NIFTY 50 stock records stored in database.`);

  // Sample query
  const sample = db.prepare(`
    SELECT symbol, count(*) as count, min(date) as min_date, max(date) as max_date, avg(close) as avg_close
    FROM nifty50_stocks
    WHERE symbol IN ('RELIANCE', 'TCS', 'INFY', 'HDFCBANK')
    GROUP BY symbol
  `).all();
  console.log('Sample Nifty 50 verification:', sample);
}

ingest().catch(err => {
  console.error('Error during ingestion:', err);
  process.exit(1);
});
