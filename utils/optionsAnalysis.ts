import { ParsedOption, AnalyzedOption, FilterSettings, Strategy, CalculatedMetrics, ScoringComponents } from '@/types';
import { getDaysToExpiration } from './dateUtils';

export function calculateMetrics(
  option: ParsedOption,
  strategy: Strategy,
  stockPrice?: number
): CalculatedMetrics {
  const mid = (option.bid + option.ask) / 2;
  const spread = option.ask - option.bid;
  const spread_percent = mid > 0 ? spread / mid : 0;
  const estimated_fill = Math.max(0, mid - 0.25 * spread);
  const premium_dollars = estimated_fill * 100;
  const dte = getDaysToExpiration(option.expiration);
  const probability_of_profit = option.delta !== undefined ? 1 - Math.abs(option.delta) : 0.5;

  let breakeven: number | undefined;
  let call_away_price: number | undefined;
  let premium_cushion: number | undefined;
  let capital_required: number | undefined;
  let capital_reference: number | undefined;
  let roc = 0;
  let annualized_roc = 0;

  if (strategy === 'cash-secured-put') {
    capital_required = option.strike * 100;
    breakeven = option.strike - estimated_fill;
    roc = capital_required > 0 ? premium_dollars / capital_required : 0;
    annualized_roc = dte > 0 ? roc * (365 / dte) : 0;
  } else if (strategy === 'covered-call') {
    const price = stockPrice || option.strike;
    capital_reference = price * 100;
    call_away_price = option.strike + estimated_fill;
    premium_cushion = estimated_fill;
    roc = capital_reference > 0 ? premium_dollars / capital_reference : 0;
    annualized_roc = dte > 0 ? roc * (365 / dte) : 0;
  }

  return {
    mid,
    spread,
    spread_percent,
    estimated_fill,
    premium_dollars,
    dte,
    probability_of_profit,
    breakeven,
    call_away_price,
    premium_cushion,
    capital_required,
    capital_reference,
    roc,
    annualized_roc,
  };
}

export function calculateScore(
  option: ParsedOption,
  metrics: CalculatedMetrics,
  strategy: Strategy,
  allOptions: ParsedOption[]
): ScoringComponents {
  // Spread penalty
  const spread_penalty = metrics.spread_percent * 100;

  // Liquidity penalty
  let liquidity_penalty = 0;
  if (option.open_interest !== undefined && option.open_interest < 1000) {
    liquidity_penalty += 5;
  }
  if (option.volume !== undefined && option.volume < 100) {
    liquidity_penalty += 5;
  }

  // Delta penalty
  let delta_penalty = 0;
  if (option.delta !== undefined) {
    const absDelta = Math.abs(option.delta);
    if (absDelta > 0.30) {
      delta_penalty = (absDelta - 0.30) * 50;
    }
  }

  // Event penalty
  let event_penalty = 0;
  if (option.earnings_date && option.earnings_date < option.expiration) {
    event_penalty += 25;
  }
  if (strategy === 'covered-call' && option.ex_dividend_date && option.ex_dividend_date < option.expiration) {
    event_penalty += 25;
  }

  // Volatility penalty
  let volatility_penalty = 0;
  if (option.implied_volatility !== undefined) {
    const ivValues = allOptions
      .map(o => o.implied_volatility)
      .filter((iv): iv is number => iv !== undefined)
      .sort((a, b) => a - b);
    
    if (ivValues.length > 0) {
      const medianIV = ivValues[Math.floor(ivValues.length / 2)];
      if (option.implied_volatility > medianIV * 1.75) {
        volatility_penalty = 10;
      }
    }
  }

  // Base score
  const base_score = metrics.annualized_roc * 100 * metrics.probability_of_profit;

  // Final score
  const final_score = base_score - spread_penalty - liquidity_penalty - delta_penalty - event_penalty - volatility_penalty;

  return {
    spread_penalty,
    liquidity_penalty,
    delta_penalty,
    event_penalty,
    volatility_penalty,
    base_score,
    final_score,
  };
}

export function applyFilters(option: ParsedOption, metrics: CalculatedMetrics, filters: FilterSettings): boolean {
  // Basic liquidity
  if (option.bid <= 0 || option.ask <= option.bid) {
    return false;
  }

  // Expired options
  if (metrics.dte < 0) {
    return false;
  }

  // DTE range
  if (metrics.dte < filters.min_dte || metrics.dte > filters.max_dte) {
    return false;
  }

  // Delta range
  if (option.delta !== undefined) {
    const absDelta = Math.abs(option.delta);
    if (absDelta < filters.min_delta || absDelta > filters.max_delta) {
      return false;
    }
  }

  // Open interest
  if (option.open_interest !== undefined && option.open_interest < filters.min_open_interest) {
    return false;
  }

  // Volume
  if (option.volume !== undefined && option.volume < filters.min_volume) {
    return false;
  }

  // Spread percentage
  if (metrics.spread_percent > filters.max_spread_percent) {
    return false;
  }

  // Earnings
  if (filters.exclude_earnings && option.earnings_date && option.earnings_date < option.expiration) {
    return false;
  }

  // Ex-dividend
  if (filters.exclude_ex_dividend && filters.strategy === 'covered-call' && 
      option.ex_dividend_date && option.ex_dividend_date < option.expiration) {
    return false;
  }

  return true;
}

export function analyzeOptions(
  parsedOptions: ParsedOption[],
  filters: FilterSettings
): AnalyzedOption[] {
  const analyzed: AnalyzedOption[] = [];

  for (const option of parsedOptions) {
    const metrics = calculateMetrics(option, filters.strategy, filters.stock_price);
    
    if (!applyFilters(option, metrics, filters)) {
      continue;
    }

    const scoring = calculateScore(option, metrics, filters.strategy, parsedOptions);

    const analyzedOption: AnalyzedOption = {
      ...option,
      ...metrics,
      ...scoring,
      strategy: filters.strategy,
      stock_price: filters.stock_price,
    };

    analyzed.push(analyzedOption);
  }

  // Sort by score descending
  analyzed.sort((a, b) => b.final_score - a.final_score);

  // Return top N
  return analyzed.slice(0, filters.top_n);
}
