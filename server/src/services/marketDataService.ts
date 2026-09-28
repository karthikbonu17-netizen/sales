import db from '../db';

export interface StockQuote {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  prev_close: number;
  vwap: number;
  volume: number;
  turnover: number;
  trades?: number;
  deliverable_volume?: number;
  pct_deliverble?: number;
  change?: number;
  changePct?: number;
}

export interface StockSummary {
  symbol: string;
  totalRecords: number;
  firstDate: string;
  lastDate: string;
  latestQuote: StockQuote;
  allTimeHigh: number;
  allTimeLow: number;
  avgVolume: number;
}

export class MarketDataService {
  /**
   * Search for symbol or company match
   */
  findSymbol(query: string): string | null {
    const clean = query.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const direct = db.prepare('SELECT symbol FROM nifty50_stocks WHERE UPPER(symbol) = ? LIMIT 1').get(clean) as any;
    if (direct) return direct.symbol;

    // Fuzzy mapping for common names
    const mappings: Record<string, string> = {
      'RELIANCE': 'RELIANCE',
      'TATA CONSULTANCY SERVICES': 'TCS',
      'TCS': 'TCS',
      'INFOSYS': 'INFY',
      'INFY': 'INFY',
      'HDFC': 'HDFCBANK',
      'HDFC BANK': 'HDFCBANK',
      'HDFCBANK': 'HDFCBANK',
      'ICICI': 'ICICIBANK',
      'ICICIBANK': 'ICICIBANK',
      'STATE BANK OF INDIA': 'SBIN',
      'SBI': 'SBIN',
      'SBIN': 'SBIN',
      'BHARTI AIRTEL': 'BHARTIARTL',
      'AIRTEL': 'BHARTIARTL',
      'BHARTIARTL': 'BHARTIARTL',
      'ITC': 'ITC',
      'KOTAK': 'KOTAKBANK',
      'KOTAK BANK': 'KOTAKBANK',
      'KOTAKBANK': 'KOTAKBANK',
      'L&T': 'LT',
      'LARSEN': 'LT',
      'LT': 'LT',
      'MARUTI': 'MARUTI',
      'SUZUKI': 'MARUTI',
      'TATA STEEL': 'TATASTEEL',
      'TATASTEEL': 'TATASTEEL',
      'TITAN': 'TITAN',
      'ASIAN PAINTS': 'ASIANPAINT',
      'ASIANPAINT': 'ASIANPAINT',
      'BAJAJ FINANCE': 'BAJFINANCE',
      'BAJFINANCE': 'BAJFINANCE',
      'ADANI': 'ADANIPORTS',
      'ADANI PORTS': 'ADANIPORTS',
      'ADANIPORTS': 'ADANIPORTS',
      'WIPRO': 'WIPRO',
      'HCL': 'HCLTECH',
      'HCLTECH': 'HCLTECH',
      'SUN PHARMA': 'SUNPHARMA',
      'SUNPHARMA': 'SUNPHARMA',
      'NIFTY': 'NIFTY50',
    };

    const qUpper = query.toUpperCase();
    for (const [key, val] of Object.entries(mappings)) {
      if (qUpper.includes(key)) return val;
    }

    return null;
  }

  /**
   * Get the latest verified quote for a symbol
   */
  getLatestQuote(symbol: string): StockQuote | null {
    const row = db.prepare(`
      SELECT * FROM nifty50_stocks
      WHERE symbol = ?
      ORDER BY rowid DESC
      LIMIT 1
    `).get(symbol) as any;

    if (!row) return null;

    const change = row.prev_close ? row.close - row.prev_close : 0;
    const changePct = row.prev_close ? (change / row.prev_close) * 100 : 0;

    return {
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      prev_close: row.prev_close,
      vwap: row.vwap,
      volume: row.volume,
      turnover: row.turnover,
      trades: row.trades,
      deliverable_volume: row.deliverable_volume,
      pct_deliverble: row.pct_deliverble,
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
    };
  }

  /**
   * Get verified historical OHLCV candles
   */
  getHistoricalCandles(symbol: string, limit: number = 30): StockQuote[] {
    const rows = db.prepare(`
      SELECT * FROM nifty50_stocks
      WHERE symbol = ?
      ORDER BY rowid DESC
      LIMIT ?
    `).all(symbol, limit) as any[];

    return rows.reverse().map(row => ({
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      prev_close: row.prev_close,
      vwap: row.vwap,
      volume: row.volume,
      turnover: row.turnover,
      trades: row.trades,
      deliverable_volume: row.deliverable_volume,
      pct_deliverble: row.pct_deliverble,
    }));
  }

  /**
   * Get aggregated statistical summary
   */
  getStockSummary(symbol: string): StockSummary | null {
    const quote = this.getLatestQuote(symbol);
    if (!quote) return null;

    const stats = db.prepare(`
      SELECT 
        count(*) as totalRecords,
        min(date) as firstDate,
        max(date) as lastDate,
        max(high) as allTimeHigh,
        min(low) as allTimeLow,
        avg(volume) as avgVolume
      FROM nifty50_stocks
      WHERE symbol = ?
    `).get(symbol) as any;

    return {
      symbol,
      totalRecords: stats.totalRecords || 0,
      firstDate: stats.firstDate,
      lastDate: stats.lastDate,
      latestQuote: quote,
      allTimeHigh: stats.allTimeHigh,
      allTimeLow: stats.allTimeLow,
      avgVolume: Math.round(stats.avgVolume || 0),
    };
  }

  /**
   * List all unique symbols present in the NIFTY 50 dataset
   */
  getAvailableSymbols(): string[] {
    const rows = db.prepare(`
      SELECT DISTINCT symbol FROM nifty50_stocks ORDER BY symbol ASC
    `).all() as any[];
    return rows.map(r => r.symbol);
  }
}

export const marketDataService = new MarketDataService();
