import { RawCSVRow, ColumnMapping, ParsedOption } from '@/types';
import { parseDate } from './dateUtils';

export function parseCSVRow(row: RawCSVRow, mapping: ColumnMapping): ParsedOption | null {
  try {
    const strike = parseFloat(row[mapping.strike!] || '');
    const bid = parseFloat(row[mapping.bid!] || '');
    const ask = parseFloat(row[mapping.ask!] || '');
    const expiration = parseDate(row[mapping.expiration!] || '');

    if (isNaN(strike) || isNaN(bid) || isNaN(ask) || !expiration) {
      return null;
    }

    const option: ParsedOption = {
      strike,
      bid,
      ask,
      expiration,
    };

    // Optional fields
    if (mapping.ticker && row[mapping.ticker]) {
      option.ticker = row[mapping.ticker];
    }

    if (mapping.delta && row[mapping.delta]) {
      const delta = parseFloat(row[mapping.delta]);
      if (!isNaN(delta)) option.delta = delta;
    }

    if (mapping.open_interest && row[mapping.open_interest]) {
      const oi = parseFloat(row[mapping.open_interest]);
      if (!isNaN(oi)) option.open_interest = oi;
    }

    if (mapping.volume && row[mapping.volume]) {
      const vol = parseFloat(row[mapping.volume]);
      if (!isNaN(vol)) option.volume = vol;
    }

    if (mapping.implied_volatility && row[mapping.implied_volatility]) {
      const iv = parseFloat(row[mapping.implied_volatility]);
      if (!isNaN(iv)) option.implied_volatility = iv;
    }

    if (mapping.theta && row[mapping.theta]) {
      const theta = parseFloat(row[mapping.theta]);
      if (!isNaN(theta)) option.theta = theta;
    }

    if (mapping.vega && row[mapping.vega]) {
      const vega = parseFloat(row[mapping.vega]);
      if (!isNaN(vega)) option.vega = vega;
    }

    if (mapping.earnings_date && row[mapping.earnings_date]) {
      const ed = parseDate(row[mapping.earnings_date]);
      if (ed) option.earnings_date = ed;
    }

    if (mapping.ex_dividend_date && row[mapping.ex_dividend_date]) {
      const exd = parseDate(row[mapping.ex_dividend_date]);
      if (exd) option.ex_dividend_date = exd;
    }

    return option;
  } catch (error) {
    return null;
  }
}

export function parseAllRows(rawData: RawCSVRow[], mapping: ColumnMapping): ParsedOption[] {
  const parsed: ParsedOption[] = [];
  
  for (const row of rawData) {
    const option = parseCSVRow(row, mapping);
    if (option) {
      parsed.push(option);
    }
  }

  return parsed;
}
