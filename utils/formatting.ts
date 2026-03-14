export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function getScoreColor(score: number): string {
  if (score >= 15) return 'text-green-600 dark:text-green-400';
  if (score >= 10) return 'text-blue-600 dark:text-blue-400';
  if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getScoreBadge(score: number): string {
  if (score >= 15) return 'Excellent';
  if (score >= 10) return 'Good';
  if (score >= 5) return 'Fair';
  return 'Poor';
}

export function getLiquidityColor(openInterest?: number, volume?: number): string {
  if (openInterest === undefined || volume === undefined) return 'text-gray-500';
  if (openInterest >= 1000 && volume >= 100) return 'text-green-600';
  if (openInterest >= 500 || volume >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export function getSpreadColor(spreadPercent: number): string {
  if (spreadPercent <= 0.05) return 'text-green-600';
  if (spreadPercent <= 0.10) return 'text-yellow-600';
  return 'text-red-600';
}

export function getDeltaColor(delta?: number): string {
  if (delta === undefined) return 'text-gray-500';
  const absDelta = Math.abs(delta);
  if (absDelta <= 0.30) return 'text-green-600';
  if (absDelta <= 0.50) return 'text-yellow-600';
  return 'text-red-600';
}
