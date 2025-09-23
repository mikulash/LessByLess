import { TrackerType } from '@/enums/TrackerType';
import { TrackerTypeOption } from '@/types/tracking';

export const TRACKER_TYPES: TrackerTypeOption[] = [
  { value: TrackerType.ColdTurker, label: 'ColdTurker' },
  { value: TrackerType.SlowLoweringTheDosage, label: 'Slow lowering the dosage' },
];
