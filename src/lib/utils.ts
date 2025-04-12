import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format remaining time for expiry date countdown
 */
export function formatRemainingTime(expiryDate: Date): string {
  const now = new Date();
  const expiry = new Date(expiryDate);

  if (now >= expiry) {
    return 'Expired';
  }

  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ${diffSeconds}s`;
  } else {
    return `${diffSeconds}s`;
  }
}
