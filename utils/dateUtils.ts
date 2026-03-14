export function parseDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }

  // Try standard formats
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try MM/DD/YYYY
  const mmddyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    return new Date(parseInt(mmddyyyy[3]), parseInt(mmddyyyy[1]) - 1, parseInt(mmddyyyy[2]));
  }

  // Try YYYY-MM-DD
  const yyyymmdd = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmdd) {
    return new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]));
  }

  return null;
}

export function getDaysToExpiration(expiration: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiration);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
