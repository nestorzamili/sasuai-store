import {
  format,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachHourOfInterval,
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';

export type DateRange = {
  start: Date;
  end: Date;
};

export type DateMapping = {
  label: string;
  start: Date;
  end: Date;
};

/**
 * Creates date mappings based on the given date range
 * @param startDate - The start date of the range in format YYYY-MM-DD
 * @param endDate - The end date of the range in format YYYY-MM-DD
 * @returns Array of date mappings
 */
export function createDateMappings(
  startDate: string,
  endDate: string
): DateMapping[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const daysDifference = differenceInDays(end, start);

  // Case 1: If only one day, map per hour (24 hours)
  if (daysDifference === 0) {
    return createHourlyMapping(start, end);
  }

  // Case 2: If less than 2 weeks, map per day
  if (daysDifference < 14) {
    return createDailyMapping(start, end);
  }

  // Case 3: If less than 1 month (approx. 30 days), map per week
  if (daysDifference < 30) {
    return createWeeklyMapping(start, end);
  }

  // Case 4: If more than 1 month, map per month
  return createMonthlyMapping(start, end);
}

function createHourlyMapping(start: Date, end: Date): DateMapping[] {
  const hours = eachHourOfInterval({ start, end });

  return hours.map((hour, index) => {
    const nextHour = new Date(hour);
    nextHour.setHours(hour.getHours() + 1);

    return {
      label: format(hour, 'HH:mm'),
      start: hour,
      end: index === hours.length - 1 ? end : nextHour,
    };
  });
}

function createDailyMapping(start: Date, end: Date): DateMapping[] {
  const days = eachDayOfInterval({ start, end });

  return days.map((day, index) => {
    const nextDay = addDays(day, 1);

    return {
      label: format(day, 'dd MMM'),
      start: day,
      end: index === days.length - 1 ? end : nextDay,
    };
  });
}

function createWeeklyMapping(start: Date, end: Date): DateMapping[] {
  const weeks = eachWeekOfInterval({ start, end });

  return weeks.map((week, index) => {
    const weekStart = index === 0 ? start : startOfWeek(week);
    const weekEnd = index === weeks.length - 1 ? end : endOfWeek(week);

    return {
      label: `${format(weekStart, 'dd MMM')} - ${format(
        weekEnd,
        'dd MMM yyyy'
      )}`,
      start: weekStart,
      end: weekEnd,
    };
  });
}

function createMonthlyMapping(start: Date, end: Date): DateMapping[] {
  const months = eachMonthOfInterval({ start, end });

  return months.map((month, index) => {
    const monthStart = index === 0 ? start : startOfMonth(month);
    const monthEnd = index === months.length - 1 ? end : endOfMonth(month);

    return {
      label: format(month, 'MMMM yyyy'),
      start: monthStart,
      end: monthEnd,
    };
  });
}
