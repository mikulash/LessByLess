import { TrackerType } from '@/enums/TrackerType';

export const getTrackerIcon = (type: TrackerType) => {
  if (type === TrackerType.SlowLoweringTheDosage) {
    return { name: 'arrow-trend-down' as const, color: '#fb923c' };
  }

  return { name: 'stop' as const, color: '#34d399' };
};
