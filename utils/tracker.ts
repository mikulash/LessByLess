import {
  COLD_TURKEY_MILESTONES,
  type ColdTurkeyMilestone,
} from '@/constants/coldTurkeyMilestones';
import { TrackerType } from '@/enums/TrackerType';

type TimeUnit = {
  label: string;
  shortLabel: string;
  durationMs: number;
};

const TIME_UNITS: TimeUnit[] = [
  { label: 'year', shortLabel: 'y', durationMs: 1000 * 60 * 60 * 24 * 365 },
  { label: 'month', shortLabel: 'mo', durationMs: 1000 * 60 * 60 * 24 * 30 },
  { label: 'week', shortLabel: 'w', durationMs: 1000 * 60 * 60 * 24 * 7 },
  { label: 'day', shortLabel: 'd', durationMs: 1000 * 60 * 60 * 24 },
  { label: 'hour', shortLabel: 'h', durationMs: 1000 * 60 * 60 },
  { label: 'minute', shortLabel: 'm', durationMs: 1000 * 60 },
  { label: 'second', shortLabel: 's', durationMs: 1000 },
];

export const getTrackerIcon = (type: TrackerType) => {
  if (type === TrackerType.SlowLoweringTheDosage) {
    return { name: 'arrow-trend-down' as const, color: '#fb923c' };
  }

  return { name: 'hand-back-fist' as const, color: '#34d399' };
};

export type ColdTurkeyProgress = {
  achieved: ColdTurkeyMilestone[];
  elapsedMs: number;
  next: ColdTurkeyMilestone | null;
  progressToNext: number;
  previousDurationMs: number;
};

export const getColdTurkeyProgress = (startedAt: string): ColdTurkeyProgress => {
  const now = Date.now();
  const started = new Date(startedAt).getTime();
  const elapsedMs = Math.max(0, now - started);

  const achieved = COLD_TURKEY_MILESTONES.filter((milestone) => elapsedMs >= milestone.durationMs);
  const next = COLD_TURKEY_MILESTONES.find((milestone) => elapsedMs < milestone.durationMs) ?? null;
  const previousDurationMs = achieved.length ? achieved[achieved.length - 1].durationMs : 0;

  const progressToNext = next ? Math.min(1, Math.max(0, elapsedMs / next.durationMs)) : 1;

  return {
    achieved,
    elapsedMs,
    next,
    progressToNext,
    previousDurationMs,
  };
};

export type ElapsedBreakdownEntry = {
  value: number;
  unit: string;
};

export const getElapsedBreakdown = (elapsedMs: number, parts: number = 3): ElapsedBreakdownEntry[] => {
  const result: ElapsedBreakdownEntry[] = [];
  let remainder = elapsedMs;

  for (const unit of TIME_UNITS) {
    if (result.length >= parts) {
      break;
    }

    const unitCount = Math.floor(remainder / unit.durationMs);
    if (unitCount > 0 || (result.length === 0 && unit.label === 'second')) {
      result.push({ value: unitCount, unit: unitCount === 1 ? unit.label : `${unit.label}s` });
      remainder -= unitCount * unit.durationMs;
    }
  }

  while (result.length < parts) {
    const unit = TIME_UNITS[TIME_UNITS.length - 1];
    result.push({ value: 0, unit: `${unit.label}s` });
  }

  return result;
};
