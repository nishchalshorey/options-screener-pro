'use client';

import { useCallback } from 'react';
import { RawCSVRow } from '@/types';

interface FileUploadProps {
  onFileProcessed: (data: RawCSVRow[], headers: string[]) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onFileProcessed, onError }: FileUploadProps) {
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.csv')) {
        onError('Please upload a CSV file');
        return;
      }

      try {
        const text = await file.text();
        const Papa = (await import('papaparse')).default;
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              onError(`CSV parsing error: ${results.errors[0].message}`);
              return;
            }

            const data = results.data as RawCSVRow[];
            const headers = results.meta.fields || [];

            if (data.length === 0) {
              onError('CSV file is empty');
              return;
            }

            if (headers.length === 0) {
              onError('No headers detected in CSV file');
              return;
            }

            onFileProcessed(data, headers);
          },
          error: (error: Error) => {
            onError(`Failed to parse CSV: ${error.message}`);
          },
        });
      } catch (error) {
        onError('Failed to read file');
      }
    },
    [onFileProcessed, onError]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      
      if (file) {
        const input = document.getElementById('file-input') as HTMLInputElement;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      }
    },
    []
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-primary-500 transition-colors duration-200 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <label htmlFor="file-input" className="cursor-pointer">
              <span className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200">
                Choose CSV File
              </span>
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            or drag and drop your options chain CSV here
          </p>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>• CSV must contain: Strike, Bid, Ask, Expiration</p>
            <p>• Optional: Delta, Open Interest, Volume, IV</p>
          </div>
        </div>
      </div>
    </div>
  );
}
