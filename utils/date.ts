export const formatDateInput = (date: Date): string => date.toISOString().slice(0, 10);

export const parseDateInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const formatDateForDisplay = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const calculateDaysTracked = (value: string): number | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const now = new Date();
  const diff = now.getTime() - parsed.getTime();
  if (diff < 0) {
    return 0;
  }

  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
