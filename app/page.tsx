'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ColumnMappingComponent from '@/components/ColumnMapping';
import FilterControls from '@/components/FilterControls';
import ResultsTable from '@/components/ResultsTable';
import { RawCSVRow, ColumnMapping, ParsedOption, AnalyzedOption, FilterSettings, UploadState } from '@/types';
import { detectColumnMapping, validateMapping } from '@/utils/columnDetection';
import { parseAllRows } from '@/utils/csvParser';
import { analyzeOptions } from '@/utils/optionsAnalysis';

export default function Home() {
  const [state, setState] = useState<UploadState>({
    stage: 'upload',
    rawData: [],
    detectedHeaders: [],
    columnMapping: null,
    parsedOptions: [],
    analyzedOptions: [],
    filters: {
      strategy: 'cash-secured-put',
      min_dte: 7,
      max_dte: 60,
      min_delta: 0,
      max_delta: 1,
      min_open_interest: 100,
      min_volume: 10,
      max_spread_percent: 0.15,
      exclude_earnings: false,
      exclude_ex_dividend: false,
      top_n: 50,
    },
  });

  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = (data: RawCSVRow[], headers: string[]) => {
    const mapping = detectColumnMapping(headers);
    const validation = validateMapping(mapping);

    if (!validation.isValid) {
      setState({
        ...state,
        stage: 'mapping',
        rawData: data,
        detectedHeaders: headers,
        columnMapping: mapping,
      });
    } else {
      setState({
        ...state,
        stage: 'mapping',
        rawData: data,
        detectedHeaders: headers,
        columnMapping: mapping,
      });
    }
    setError(null);
  };

  const handleMappingConfirm = (mapping: ColumnMapping) => {
    const validation = validateMapping(mapping);
    
    if (!validation.isValid) {
      setError(`Missing required fields: ${validation.missingFields.join(', ')}`);
      return;
    }

    const parsed = parseAllRows(state.rawData, mapping);
    
    if (parsed.length === 0) {
      setError('No valid options could be parsed from the CSV');
      return;
    }

    setState({
      ...state,
      stage: 'filters',
      columnMapping: mapping,
      parsedOptions: parsed,
    });
    setError(null);
  };

  const handleAnalyze = (filters: FilterSettings) => {
    const analyzed = analyzeOptions(state.parsedOptions, filters);
    
    setState({
      ...state,
      stage: 'results',
      filters,
      analyzedOptions: analyzed,
    });
  };

  const handleReset = () => {
    setState({
      stage: 'upload',
      rawData: [],
      detectedHeaders: [],
      columnMapping: null,
      parsedOptions: [],
      analyzedOptions: [],
      filters: state.filters,
    });
    setError(null);
  };

  const handleBackToMapping = () => {
    setState({ ...state, stage: 'mapping' });
  };

  const handleBackToFilters = () => {
    setState({ ...state, stage: 'filters' });
  };

  return (
    <main className="min-h-screen py-8 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center animate-fade-in">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Options Income Screener
          <span className="block text-primary-600 dark:text-primary-400 text-3xl md:text-4xl lg:text-5xl mt-2">
            Pro
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Analyze and rank the best income-generating options from your CSV data
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {['Upload', 'Mapping', 'Filters', 'Results'].map((step, index) => {
              const stageOrder = ['upload', 'mapping', 'filters', 'results'];
              const currentIndex = stageOrder.indexOf(state.stage);
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-primary-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div
                      className={`text-xs mt-2 font-medium ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-1 flex-1 transition-all duration-300 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300 font-medium">
              ⚠️ {error}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="animate-slide-up">
        {state.stage === 'upload' && (
          <FileUpload onFileProcessed={handleFileProcessed} onError={setError} />
        )}

        {state.stage === 'mapping' && state.columnMapping && (
          <ColumnMappingComponent
            detectedHeaders={state.detectedHeaders}
            autoMapping={state.columnMapping}
            onConfirm={handleMappingConfirm}
            onBack={handleReset}
          />
        )}

        {state.stage === 'filters' && (
          <FilterControls
            initialFilters={state.filters}
            onAnalyze={handleAnalyze}
            onBack={handleBackToMapping}
          />
        )}

        {state.stage === 'results' && (
          <ResultsTable options={state.analyzedOptions} onReset={handleBackToFilters} />
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
            ⚠️ <strong>Disclaimer:</strong> Options involve risk and are not suitable for all investors. 
            This tool is for research and educational purposes only and does not constitute investment advice.
          </p>
        </div>
      </div>

      {/* Info Panel */}
      <div className="max-w-4xl mx-auto mt-12">
        <details className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white text-lg">
            📊 How the Scoring Works
          </summary>
          <div className="mt-4 space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Base Score</h4>
              <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                Annualized ROC × 100 × Probability of Profit
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Penalties</h4>
              <ul className="space-y-2 ml-4">
                <li>• <strong>Spread:</strong> Spread % × 100</li>
                <li>• <strong>Liquidity:</strong> +5 if OI &lt; 1000, +5 if Volume &lt; 100</li>
                <li>• <strong>Delta:</strong> (|Delta| - 0.30) × 50 if |Delta| &gt; 0.30</li>
                <li>• <strong>Events:</strong> +25 for earnings, +25 for ex-dividend (covered calls)</li>
                <li>• <strong>Volatility:</strong> +10 if IV &gt; 1.75× median IV</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Final Score</h4>
              <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                Base Score - Spread Penalty - Liquidity Penalty - Delta Penalty - Event Penalty - Volatility Penalty
              </p>
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}
