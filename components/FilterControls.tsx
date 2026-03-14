'use client';

import { useState } from 'react';
import { FilterSettings, Strategy } from '@/types';

interface FilterControlsProps {
  initialFilters: FilterSettings;
  onAnalyze: (filters: FilterSettings) => void;
  onBack: () => void;
}

export default function FilterControls({ initialFilters, onAnalyze, onBack }: FilterControlsProps) {
  const [filters, setFilters] = useState<FilterSettings>(initialFilters);

  const handleChange = <K extends keyof FilterSettings>(
    field: K,
    value: FilterSettings[K]
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Analysis Filters
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Configure your screening criteria
        </p>

        <div className="space-y-6">
          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Strategy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange('strategy', 'cash-secured-put')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  filters.strategy === 'cash-secured-put'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Cash Secured Put
              </button>
              <button
                onClick={() => handleChange('strategy', 'covered-call')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  filters.strategy === 'covered-call'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Covered Call
              </button>
            </div>
          </div>

          {/* Stock Price (for Covered Call) */}
          {filters.strategy === 'covered-call' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Stock Price (for ROC calculation)
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.stock_price || ''}
                onChange={(e) => handleChange('stock_price', parseFloat(e.target.value) || undefined)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter stock price"
              />
            </div>
          )}

          {/* DTE Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min DTE
              </label>
              <input
                type="number"
                value={filters.min_dte}
                onChange={(e) => handleChange('min_dte', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max DTE
              </label>
              <input
                type="number"
                value={filters.max_dte}
                onChange={(e) => handleChange('max_dte', parseInt(e.target.value) || 365)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Delta Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Delta (abs)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={filters.min_delta}
                onChange={(e) => handleChange('min_delta', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Delta (abs)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={filters.max_delta}
                onChange={(e) => handleChange('max_delta', parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Liquidity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Open Interest
              </label>
              <input
                type="number"
                value={filters.min_open_interest}
                onChange={(e) => handleChange('min_open_interest', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Volume
              </label>
              <input
                type="number"
                value={filters.min_volume}
                onChange={(e) => handleChange('min_volume', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Spread */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Spread % (e.g., 0.10 = 10%)
            </label>
            <input
              type="number"
              step="0.01"
              value={filters.max_spread_percent}
              onChange={(e) => handleChange('max_spread_percent', parseFloat(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Event Risk */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.exclude_earnings}
                onChange={(e) => handleChange('exclude_earnings', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Exclude options with earnings before expiration
              </span>
            </label>
            
            {filters.strategy === 'covered-call' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.exclude_ex_dividend}
                  onChange={(e) => handleChange('exclude_ex_dividend', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exclude options with ex-dividend before expiration
                </span>
              </label>
            )}
          </div>

          {/* Top N */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show Top N Results
            </label>
            <input
              type="number"
              value={filters.top_n}
              onChange={(e) => handleChange('top_n', parseInt(e.target.value) || 50)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back
          </button>
          <button
            onClick={() => onAnalyze(filters)}
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
          >
            Analyze Options
          </button>
        </div>
      </div>
    </div>
  );
}
