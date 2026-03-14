'use client';

import { useState } from 'react';
import { ColumnMapping } from '@/types';

interface ColumnMappingProps {
  detectedHeaders: string[];
  autoMapping: ColumnMapping;
  onConfirm: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  strike: 'Strike Price',
  bid: 'Bid Price',
  ask: 'Ask Price',
  expiration: 'Expiration Date',
  delta: 'Delta (Optional)',
  open_interest: 'Open Interest (Optional)',
  volume: 'Volume (Optional)',
  implied_volatility: 'Implied Volatility (Optional)',
  theta: 'Theta (Optional)',
  vega: 'Vega (Optional)',
  earnings_date: 'Earnings Date (Optional)',
  ex_dividend_date: 'Ex-Dividend Date (Optional)',
  ticker: 'Ticker/Symbol (Optional)',
};

export default function ColumnMappingComponent({
  detectedHeaders,
  autoMapping,
  onConfirm,
  onBack,
}: ColumnMappingProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(autoMapping);

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  const isValid = mapping.strike && mapping.bid && mapping.ask && mapping.expiration;

  const requiredFields: (keyof ColumnMapping)[] = ['strike', 'bid', 'ask', 'expiration'];
  const optionalFields: (keyof ColumnMapping)[] = [
    'delta',
    'open_interest',
    'volume',
    'implied_volatility',
    'theta',
    'vega',
    'earnings_date',
    'ex_dividend_date',
    'ticker',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Confirm Column Mapping
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Verify the detected columns or adjust them manually
        </p>

        <div className="space-y-6">
          {/* Required Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Required Fields
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {requiredFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {FIELD_LABELS[field]}
                  </label>
                  <select
                    value={mapping[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">-- Select Column --</option>
                    {detectedHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Optional Fields
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {optionalFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {FIELD_LABELS[field]}
                  </label>
                  <select
                    value={mapping[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">-- Not Available --</option>
                    {detectedHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isValid && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">
              ⚠️ All required fields must be mapped to continue
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            disabled={!isValid}
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Continue to Filters
          </button>
        </div>
      </div>
    </div>
  );
}
