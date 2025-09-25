export type ColdTurkeyMilestone = {
  label: string;
  durationMs: number;
  color: {
    border: string;
    bg: string;
    iconBg: string;
    text: string;
  };
};

const hours = (value: number) => value * 60 * 60 * 1000;
const days = (value: number) => value * 24 * 60 * 60 * 1000;

export const COLD_TURKEY_MILESTONES: ColdTurkeyMilestone[] = [
  { label: '12 hours', durationMs: hours(12), color: { border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.16)', iconBg: 'rgba(96, 165, 250, 0.22)', text: '#dbeafe' } }, // blue
  { label: '1 day', durationMs: days(1), color: { border: '#818cf8', bg: 'rgba(129, 140, 248, 0.16)', iconBg: 'rgba(129, 140, 248, 0.22)', text: '#e0e7ff' } }, // indigo
  { label: '2 days', durationMs: days(2), color: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.16)', iconBg: 'rgba(139, 92, 246, 0.22)', text: '#ede9fe' } }, // violet
  { label: '3 days', durationMs: days(3), color: { border: '#a78bfa', bg: 'rgba(167, 139, 250, 0.16)', iconBg: 'rgba(167, 139, 250, 0.22)', text: '#ede9fe' } }, // purple
  { label: '5 days', durationMs: days(5), color: { border: '#e879f9', bg: 'rgba(232, 121, 249, 0.16)', iconBg: 'rgba(232, 121, 249, 0.22)', text: '#f5d0fe' } }, // fuchsia
  { label: '1 week', durationMs: days(7), color: { border: '#f472b6', bg: 'rgba(244, 114, 182, 0.16)', iconBg: 'rgba(244, 114, 182, 0.22)', text: '#fbcfe8' } }, // pink
  { label: '2 weeks', durationMs: days(14), color: { border: '#fb7185', bg: 'rgba(251, 113, 133, 0.16)', iconBg: 'rgba(251, 113, 133, 0.22)', text: '#ffe4e6' } }, // rose
  { label: '1 month', durationMs: days(30), color: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.16)', iconBg: 'rgba(239, 68, 68, 0.22)', text: '#fecaca' } }, // red
  { label: '2 months', durationMs: days(60), color: { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.16)', iconBg: 'rgba(56, 189, 248, 0.22)', text: '#cffafe' } }, // sky
  { label: '3 months', durationMs: days(90), color: { border: '#22d3ee', bg: 'rgba(34, 211, 238, 0.16)', iconBg: 'rgba(34, 211, 238, 0.22)', text: '#a5f3fc' } }, // cyan
  { label: '1 year', durationMs: days(365), color: { border: '#facc15', bg: 'rgba(250, 204, 21, 0.16)', iconBg: 'rgba(250, 204, 21, 0.22)', text: '#fef9c3' } }, // yellow
];
