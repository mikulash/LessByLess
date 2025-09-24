import {
  COLD_TURKEY_MILESTONES,
  type ColdTurkeyMilestone,
} from '@/constants/coldTurkeyMilestones';
import { TrackerType } from '@/enums/TrackerType';

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
