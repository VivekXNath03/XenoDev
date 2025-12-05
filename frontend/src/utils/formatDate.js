import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const getDateRangePresets = () => {
  const today = new Date();
  
  return {
    today: {
      label: 'Today',
      start: startOfDay(today),
      end: endOfDay(today),
    },
    last7Days: {
      label: 'Last 7 Days',
      start: startOfDay(subDays(today, 7)),
      end: endOfDay(today),
    },
    last30Days: {
      label: 'Last 30 Days',
      start: startOfDay(subDays(today, 30)),
      end: endOfDay(today),
    },
    last90Days: {
      label: 'Last 90 Days',
      start: startOfDay(subDays(today, 90)),
      end: endOfDay(today),
    },
  };
};

export const formatApiDate = (date) => {
  if (!date) return null;
  return format(date, 'yyyy-MM-dd');
};
