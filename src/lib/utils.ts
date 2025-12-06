import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format as dateFnsFormat, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a date string without timezone conversion issues.
 * This ensures dates like "2025-12-15" or "2025-12-15T00:00:00.000Z"
 * are always displayed as December 15, regardless of the user's timezone.
 *
 * The issue: When dates are stored as ISO strings in UTC (e.g., "2025-12-15T00:00:00.000Z"),
 * and displayed in a timezone west of UTC (like New York at UTC-5), JavaScript's Date constructor
 * interprets the UTC time and converts it to local time, causing dates to "shift back" by a day.
 *
 * @param dateStr - ISO date string, date-only string, or Date object
 * @returns Date object set to noon on the specified date (to avoid edge cases)
 */
export function parseDateSafe(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date()

  // If it's already a Date object, convert to ISO string first
  const dateString = dateStr instanceof Date ? dateStr.toISOString() : dateStr

  // Extract just the date part (YYYY-MM-DD)
  const dateOnly = dateString.split('T')[0]

  // Parse as local date by appending time as noon to avoid timezone edge cases
  // Using noon (12:00) ensures the date won't flip to the previous/next day
  // regardless of the user's timezone
  return new Date(dateOnly + 'T12:00:00')
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(value: number): string {
  // If value is already a percentage (e.g., 3.5 for 3.5%), don't multiply by 100
  const isPercentage = value < 1
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(isPercentage ? value : value / 100)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  try {
    const dateObj = new Date(date)
    if (!isValid(dateObj)) {
      return '-'
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  } catch (error) {
    return '-'
  }
}

export function formatDateTime(date: Date | string, formatStr?: string): string {
  const dateObj = new Date(date)
  
  if (!isValid(dateObj)) {
    return '-'
  }
  
  if (formatStr) {
    return dateFnsFormat(dateObj, formatStr)
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return '0 min'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins} min`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}min`
  }
}