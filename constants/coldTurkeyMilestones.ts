export type ColdTurkeyMilestone = {
  label: string;
  durationMs: number;
};

const hours = (value: number) => value * 60 * 60 * 1000;
const days = (value: number) => value * 24 * 60 * 60 * 1000;

export const COLD_TURKEY_MILESTONES: ColdTurkeyMilestone[] = [
  { label: '12 hours', durationMs: hours(12) },
  { label: '1 day', durationMs: days(1) },
  { label: '2 days', durationMs: days(2) },
  { label: '3 days', durationMs: days(3) },
  { label: '5 days', durationMs: days(5) },
  { label: '1 week', durationMs: days(7) },
  { label: '2 weeks', durationMs: days(14) },
  { label: '1 month', durationMs: days(30) },
  { label: '2 months', durationMs: days(60) },
  { label: '3 months', durationMs: days(90) },
  { label: '1 year', durationMs: days(365) },
];
