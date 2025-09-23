import { TrackerType } from '@/enums/TrackerType';

export type TrackerTypeOption = {
  value: TrackerType;
  label: string;
};

export type TrackedItem = {
  id: string;
  name: string;
  startedAt: string;
  type: TrackerType;
};
