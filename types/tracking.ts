import { TrackerType } from '@/enums/TrackerType';

export type TrackerTypeOption = {
  value: TrackerType;
  label: string;
};

export interface TrackedItem {
  id: string;
  name: string;
  startedAt: string;
  type: TrackerType;
  notifiedMilestones?: number[];
}

export interface ColdTurkeyTrackedItem extends TrackedItem {
  type: TrackerType.ColdTurkey;
}

export type DosageUnit = 'mg' | 'g';

export interface DoseDecreaseTrackedItem extends TrackedItem {
  type: TrackerType.SlowLoweringTheDosage;
  currentUsageValue: number;
  currentUsageUnit: DosageUnit;
}

export type TrackerItem = ColdTurkeyTrackedItem | DoseDecreaseTrackedItem;
