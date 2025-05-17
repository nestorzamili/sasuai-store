/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date to a readable date string (e.g., "1 Jan 2023")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date to a readable date and time string (e.g., "1 Jan 2023, 12.00")
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date to a time only string (e.g., "12.00")
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date to "DD/MM/YYYY"
 */
export function formatDateShort(date: Date | string | number): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a date to ISO date string (YYYY-MM-DD)
 */
export function formatISODate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Get start of day for a given date
 */
export function startOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day for a given date
 */
export function endOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month for a given date
 */
export function startOfMonth(date: Date | string | number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of month for a given date
 */
export function endOfMonth(date: Date | string | number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | number): boolean {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Calculate the difference between two dates in days
 */
export function daysDiff(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (Math.abs(diffDay) > 30) {
    return formatDate(d);
  } else if (diffDay > 1) {
    return `in ${diffDay} days`;
  } else if (diffDay === 1) {
    return 'tomorrow';
  } else if (diffHour > 0) {
    return `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`;
  } else if (diffMin > 0) {
    return `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  } else if (diffSec > 0) {
    return `in ${diffSec} second${diffSec > 1 ? 's' : ''}`;
  } else if (diffDay < -1) {
    return `${Math.abs(diffDay)} days ago`;
  } else if (diffDay === -1) {
    return 'yesterday';
  } else if (diffHour < 0) {
    return `${Math.abs(diffHour)} hour${Math.abs(diffHour) > 1 ? 's' : ''} ago`;
  } else if (diffMin < 0) {
    return `${Math.abs(diffMin)} minute${Math.abs(diffMin) > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}
/**
 * Subtract days from a date
 */
export function subDays(date: Date | string | number, days: number): Date {
  return addDays(date, -days);
}

/**
 * Subtract months from a date
 */
export function subMonths(date: Date | string | number, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

/**
 * Calculate date ranges for comparison with optional custom comparison range
 * @param startDate - Start date of the date range
 * @param endDate - End date of the date range
 * @param compareStartDate - Optional custom comparison start date
 * @param compareEndDate - Optional custom comparison end date
 */
export function dateToCompare(
  startDate: string | Date,
  endDate: string | Date,
  compareStartDate?: string | Date,
  compareEndDate?: string | Date
) {
  let prevStartDate, prevEndDate;

  // Convert input dates to Date objects with start/end of day
  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));

  if (compareStartDate && compareEndDate) {
    // Use specified comparison date range if provided exactly as entered
    prevStartDate = startOfDay(new Date(compareStartDate));
    prevEndDate = endOfDay(new Date(compareEndDate));
  } else {
    // Calculate previous period with same duration automatically
    const startMs = start.getTime();
    const endMs = end.getTime();
    const durationMs = endMs - startMs + 24 * 60 * 60 * 1000; // Include both start and end days
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Calculate previous period starting from the day before the current start date
    prevEndDate = startOfDay(subDays(start, 1)); // The day before start date
    prevStartDate = startOfDay(subDays(prevEndDate, durationDays - 1)); // Full duration before
  }

  // Return the calculated date ranges
  return {
    current: {
      startDate: start,
      endDate: end,
    },
    previous: {
      startDate: prevStartDate,
      endDate: prevEndDate,
    },
  };
}
