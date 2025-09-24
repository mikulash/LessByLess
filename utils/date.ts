
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

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;

export function formatTimeLeft(ms: number): string {
    if (ms <= 0) return 'now';
    if (ms < HOUR_MS) {
        const m = Math.ceil(ms / MINUTE_MS);
        return `${m}m`;
    }
    if (ms < DAY_MS) {
        const h = Math.floor(ms / HOUR_MS);
        const m = Math.floor((ms % HOUR_MS) / MINUTE_MS);
        return m ? `${h}h ${m}m` : `${h}h`;
    }
    if (ms < MONTH_MS) {
        const d = Math.floor(ms / DAY_MS);
        const h = Math.floor((ms % DAY_MS) / HOUR_MS);
        return h ? `${d}d ${h}h` : `${d}d`;
    }
    // Fallback for >= 1 month
    const d = Math.floor(ms / DAY_MS);
    return `${d}d`;
}
