import { ColumnMapping } from '@/types';

const HEADER_PATTERNS: Record<keyof ColumnMapping, string[]> = {
  strike: ['strike', 'strike price', 'strikeprice', 'strike_price'],
  bid: ['bid', 'bid price', 'bidprice', 'bid_price'],
  ask: ['ask', 'ask price', 'askprice', 'ask_price'],
  expiration: ['expiration', 'expiry', 'expiration date', 'expirationdate', 'expiration_date', 'exp', 'expire'],
  delta: ['delta'],
  open_interest: ['open interest', 'openinterest', 'open_interest', 'oi'],
  volume: ['volume', 'vol'],
  implied_volatility: ['implied volatility', 'impliedvolatility', 'implied_volatility', 'iv', 'vol'],
  theta: ['theta'],
  vega: ['vega'],
  earnings_date: ['earnings', 'earnings date', 'earningsdate', 'earnings_date'],
  ex_dividend_date: ['ex dividend', 'ex-dividend', 'exdividend', 'ex_dividend_date', 'ex_div'],
  ticker: ['ticker', 'symbol', 'underlying'],
};

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    strike: null,
    bid: null,
    ask: null,
    expiration: null,
  };

  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  for (const [field, patterns] of Object.entries(HEADER_PATTERNS)) {
    for (let i = 0; i < normalizedHeaders.length; i++) {
      const header = normalizedHeaders[i];
      if (patterns.some(pattern => header === pattern || header.includes(pattern))) {
        (mapping as any)[field] = headers[i];
        break;
      }
    }
  }

  return mapping;
}

export function validateMapping(mapping: ColumnMapping): { isValid: boolean; missingFields: string[] } {
  const requiredFields: (keyof ColumnMapping)[] = ['strike', 'bid', 'ask', 'expiration'];
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!mapping[field]) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
