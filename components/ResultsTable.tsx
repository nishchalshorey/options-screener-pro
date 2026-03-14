'use client';

import { useState, useMemo } from 'react';
import { AnalyzedOption } from '@/types';
import { formatCurrency, formatPercent, formatNumber, getScoreColor, getScoreBadge, getLiquidityColor, getSpreadColor, getDeltaColor } from '@/utils/formatting';
import { formatDate } from '@/utils/dateUtils';

interface ResultsTableProps {
  options: AnalyzedOption[];
  onReset: () => void;
}

type SortField = keyof AnalyzedOption;
type SortDirection = 'asc' | 'desc';

export default function ResultsTable({ options, onReset }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('final_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOption, setSelectedOption] = useState<AnalyzedOption | null>(null);

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [options, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return <span className="text-primary-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (options.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No options matched your filter criteria
          </p>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Adjust Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {options.length} option{options.length !== 1 ? 's' : ''} matched your criteria
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          New Analysis
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {sortedOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => setSelectedOption(option)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.ticker || 'N/A'}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ${formatNumber(option.strike)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(option.expiration)} • {option.dte} DTE
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(option.final_score)}`}>
                  {formatNumber(option.final_score, 1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getScoreBadge(option.final_score)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Premium</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(option.premium_dollars)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Ann. ROC</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatPercent(option.annualized_roc)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Delta</div>
                <div className={`font-semibold ${getDeltaColor(option.delta)}`}>
                  {option.delta !== undefined ? formatNumber(option.delta) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Spread</div>
                <div className={`font-semibold ${getSpreadColor(option.spread_percent)}`}>
                  {formatPercent(option.spread_percent)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  onClick={() => handleSort('final_score')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Score <SortIcon field="final_score" />
                </th>
                <th
                  onClick={() => handleSort('ticker')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Ticker <SortIcon field="ticker" />
                </th>
                <th
                  onClick={() => handleSort('expiration')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Expiration <SortIcon field="expiration" />
                </th>
                <th
                  onClick={() => handleSort('dte')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  DTE <SortIcon field="dte" />
                </th>
                <th
                  onClick={() => handleSort('strike')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Strike <SortIcon field="strike" />
                </th>
                <th
                  onClick={() => handleSort('premium_dollars')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Premium <SortIcon field="premium_dollars" />
                </th>
                <th
                  onClick={() => handleSort('annualized_roc')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Ann. ROC <SortIcon field="annualized_roc" />
                </th>
                <th
                  onClick={() => handleSort('delta')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Delta <SortIcon field="delta" />
                </th>
                <th
                  onClick={() => handleSort('spread_percent')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Spread <SortIcon field="spread_percent" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedOptions.map((option, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getScoreColor(option.final_score)}`}>
                      {formatNumber(option.final_score, 1)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getScoreBadge(option.final_score)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {option.ticker || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(option.expiration)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {option.dte}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                    ${formatNumber(option.strike)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(option.premium_dollars)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatPercent(option.annualized_roc)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getDeltaColor(option.delta)}`}>
                    {option.delta !== undefined ? formatNumber(option.delta) : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getSpreadColor(option.spread_percent)}`}>
                    {formatPercent(option.spread_percent)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedOption(option)}
                      className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOption && (
        <OptionDetailsModal
          option={selectedOption}
          onClose={() => setSelectedOption(null)}
        />
      )}
    </div>
  );
}

function OptionDetailsModal({ option, onClose }: { option: AnalyzedOption; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {option.ticker || 'N/A'} ${formatNumber(option.strike)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {formatDate(option.expiration)} • {option.dte} DTE
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Breakdown */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Score Breakdown
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base Score (ROC × PoP):</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  +{formatNumber(option.base_score, 2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Spread Penalty:</span>
                <span className="font-semibold text-red-600">
                  -{formatNumber(option.spread_penalty, 2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Liquidity Penalty:</span>
                <span className="font-semibold text-red-600">
                  -{formatNumber(option.liquidity_penalty, 2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Delta Penalty:</span>
                <span className="font-semibold text-red-600">
                  -{formatNumber(option.delta_penalty, 2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Event Penalty:</span>
                <span className="font-semibold text-red-600">
                  -{formatNumber(option.event_penalty, 2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Volatility Penalty:</span>
                <span className="font-semibold text-red-600">
                  -{formatNumber(option.volatility_penalty, 2)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-300 dark:border-gray-600 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Final Score:</span>
                <span className={`text-xl font-bold ${getScoreColor(option.final_score)}`}>
                  {formatNumber(option.final_score, 1)}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Pricing Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Bid</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${formatNumber(option.bid)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Ask</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${formatNumber(option.ask)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Mid</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${formatNumber(option.mid)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Est. Fill</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${formatNumber(option.estimated_fill)}
                </div>
              </div>
            </div>
          </div>

          {/* Greeks & Liquidity */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Greeks & Liquidity
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Delta</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {option.delta !== undefined ? formatNumber(option.delta) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Prob. of Profit</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatPercent(option.probability_of_profit)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Open Interest</div>
                <div className={`font-semibold ${getLiquidityColor(option.open_interest, option.volume)}`}>
                  {option.open_interest !== undefined ? formatNumber(option.open_interest, 0) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Volume</div>
                <div className={`font-semibold ${getLiquidityColor(option.open_interest, option.volume)}`}>
                  {option.volume !== undefined ? formatNumber(option.volume, 0) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">IV</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {option.implied_volatility !== undefined ? formatPercent(option.implied_volatility) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Metrics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Strategy Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Premium</div>
                <div className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(option.premium_dollars)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">ROC</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatPercent(option.roc)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500 dark:text-gray-400">Annualized ROC</div>
                <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                  {formatPercent(option.annualized_roc)}
                </div>
              </div>
              {option.breakeven !== undefined && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Breakeven</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${formatNumber(option.breakeven)}
                  </div>
                </div>
              )}
              {option.call_away_price !== undefined && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Call Away Price</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${formatNumber(option.call_away_price)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
