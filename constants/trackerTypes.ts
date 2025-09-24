import { TrackerType } from '@/enums/TrackerType';
import { TrackerTypeOption } from '@/types/tracking';

export const TRACKER_TYPES: TrackerTypeOption[] = [
  { value: TrackerType.ColdTurkey, label: 'ColdTurker' },
  { value: TrackerType.SlowLoweringTheDosage, label: 'Dosage lowering' },
];
