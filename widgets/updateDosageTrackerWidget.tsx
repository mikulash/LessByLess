import { Platform } from 'react-native';
import {
  FlexWidget,
  TextWidget,
  requestWidgetUpdate,
} from 'react-native-android-widget';

import { TrackerType } from '@/enums/TrackerType';
import type { DoseDecreaseTrackedItem, TrackerItem } from '@/types/tracking';
import { calculateDaysTracked } from '@/utils/date';
import { getTodaysDoseTotal } from '@/utils/tracker';

export const DOSAGE_WIDGET_NAME = 'DosageTrackerWidget';

export async function updateDosageTrackerWidget(
  trackerId: string | null,
  items: TrackerItem[]
): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await requestWidgetUpdate({
      widgetName: DOSAGE_WIDGET_NAME,
      renderWidget: async () => {
        if (!trackerId) {
          return renderEmptyWidget('Choose a dosage tracker from LessByLess');
        }

        const tracker = items.find(
          (item) =>
            item.id === trackerId &&
            item.type === TrackerType.SlowLoweringTheDosage
        ) as DoseDecreaseTrackedItem | undefined;

        if (!tracker) {
          return renderEmptyWidget('The selected tracker is no longer available');
        }

        return renderTrackerWidget(tracker);
      },
    });
  } catch (error) {
    console.warn('Failed to update dosage widget', error);
  }
}

export function renderTrackerWidget(item: DoseDecreaseTrackedItem) {
  const total = getTodaysDoseTotal(item);
  const formattedTotal = Number.isInteger(total.value)
    ? `${total.value}`
    : total.value.toFixed(2);

  const daysTracked = calculateDaysTracked(item.startedAt);
  const daysLabel = daysTracked === null ? null : `${daysTracked} day${
    daysTracked === 1 ? '' : 's'
  } of progress`;

  const lastLog = (item.doseLogs ?? [])
    .slice()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];

  const lastLogLabel = lastLog
    ? `Last logged ${formatRelativeTime(new Date(lastLog.at))}`
    : 'No entries logged today';

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        padding: 16,
        borderRadius: 16,
        backgroundGradient: {
          from: '#1f1b2e',
          to: '#0f0a1c',
          orientation: 'TL_BR',
        },
      }}
    >
      <FlexWidget
        style={{ flex: 1, justifyContent: 'space-between', flexGap: 12 }}
      >
        <TextWidget
          text="Dosage focus"
          style={{ color: '#c084fc', fontSize: 12, letterSpacing: 0.5 }}
        />
        <TextWidget
          text={item.name}
          maxLines={2}
          style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}
        />
        <TextWidget
          text={`Today's total`}
          style={{ color: '#b3b3c6', fontSize: 12 }}
        />
        <TextWidget
          text={`${formattedTotal} ${total.unit}`}
          style={{ color: '#fb923c', fontSize: 28, fontWeight: '700' }}
        />
        <TextWidget
          text={lastLogLabel}
          maxLines={2}
          style={{ color: '#d1d1dd', fontSize: 12 }}
        />
        {daysLabel ? (
          <TextWidget
            text={daysLabel}
            style={{ color: '#9ca3af', fontSize: 12 }}
          />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}

export function renderEmptyWidget(message: string) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#1f1b2e',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <TextWidget
        text="Dosage widget"
        style={{ color: '#c084fc', fontSize: 12, marginBottom: 8 }}
      />
      <TextWidget
        text={message}
        maxLines={3}
        style={{ color: '#f4f4ff', fontSize: 16, fontWeight: '600' }}
      />
    </FlexWidget>
  );
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff <= 0) {
    return 'just now';
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'moments ago';
  }

  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(diff / day);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
