export type Strategy = 'cash-secured-put' | 'covered-call';

export interface RawCSVRow {
  [key: string]: string;
}

export interface ColumnMapping {
  strike: string | null;
  bid: string | null;
  ask: string | null;
  expiration: string | null;
  delta?: string | null;
  open_interest?: string | null;
  volume?: string | null;
  implied_volatility?: string | null;
  theta?: string | null;
  vega?: string | null;
  earnings_date?: string | null;
  ex_dividend_date?: string | null;
  ticker?: string | null;
}

export interface ParsedOption {
  ticker?: string;
  strike: number;
  bid: number;
  ask: number;
  expiration: Date;
  delta?: number;
  open_interest?: number;
  volume?: number;
  implied_volatility?: number;
  theta?: number;
  vega?: number;
  earnings_date?: Date;
  ex_dividend_date?: Date;
}

export interface CalculatedMetrics {
  mid: number;
  spread: number;
  spread_percent: number;
  estimated_fill: number;
  premium_dollars: number;
  dte: number;
  probability_of_profit: number;
  breakeven?: number;
  call_away_price?: number;
  premium_cushion?: number;
  capital_required?: number;
  capital_reference?: number;
  roc: number;
  annualized_roc: number;
}

export interface ScoringComponents {
  spread_penalty: number;
  liquidity_penalty: number;
  delta_penalty: number;
  event_penalty: number;
  volatility_penalty: number;
  base_score: number;
  final_score: number;
}

export interface AnalyzedOption extends ParsedOption, CalculatedMetrics, ScoringComponents {
  strategy: Strategy;
  stock_price?: number;
}

export interface FilterSettings {
  strategy: Strategy;
  min_dte: number;
  max_dte: number;
  min_delta: number;
  max_delta: number;
  min_open_interest: number;
  min_volume: number;
  max_spread_percent: number;
  exclude_earnings: boolean;
  exclude_ex_dividend: boolean;
  top_n: number;
  stock_price?: number;
}

export interface UploadState {
  stage: 'upload' | 'mapping' | 'filters' | 'results';
  rawData: RawCSVRow[];
  detectedHeaders: string[];
  columnMapping: ColumnMapping | null;
  parsedOptions: ParsedOption[];
  analyzedOptions: AnalyzedOption[];
  filters: FilterSettings;
}
