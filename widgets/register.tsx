import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { registerWidgetConfigurationScreen, registerWidgetTaskHandler } from 'react-native-android-widget';

import {
  SELECTED_WIDGET_TRACKER_STORAGE_KEY,
  TRACKED_ITEMS_STORAGE_KEY,
} from '@/constants/storage';
import { TrackerType } from '@/enums/TrackerType';
import type { DoseDecreaseTrackedItem, TrackerItem } from '@/types/tracking';
import { Text } from '@/components/Themed';
import { formatDateForDisplay } from '@/utils/date';
import { renderEmptyWidget, renderTrackerWidget } from '@/widgets/updateDosageTrackerWidget';

async function readTrackedItems(): Promise<TrackerItem[]> {
  try {
    const stored = await AsyncStorage.getItem(TRACKED_ITEMS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as TrackerItem[];
  } catch (error) {
    console.warn('Failed to load tracked items for widget', error);
    return [];
  }
}

async function readSelectedTrackerId(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(SELECTED_WIDGET_TRACKER_STORAGE_KEY)) ?? null;
  } catch (error) {
    console.warn('Failed to read selected widget tracker', error);
    return null;
  }
}

async function persistSelectedTrackerId(id: string | null): Promise<void> {
  try {
    if (id) {
      await AsyncStorage.setItem(SELECTED_WIDGET_TRACKER_STORAGE_KEY, id);
    } else {
      await AsyncStorage.removeItem(SELECTED_WIDGET_TRACKER_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to persist selected widget tracker', error);
  }
}

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(async ({ renderWidget }) => {
    const [items, selectedId] = await Promise.all([
      readTrackedItems(),
      readSelectedTrackerId(),
    ]);

    const tracker = items.find(
      (item) =>
        item.id === selectedId &&
        item.type === TrackerType.SlowLoweringTheDosage
    ) as DoseDecreaseTrackedItem | undefined;

    renderWidget(
      tracker ? renderTrackerWidget(tracker) : renderEmptyWidget('Select a dosage tracker in LessByLess')
    );
  });

  registerWidgetConfigurationScreen(({ renderWidget, setResult }) => {
    return (
      <WidgetConfigurationScreen
        renderWidget={renderWidget}
        setResult={setResult}
      />
    );
  });
}

type ConfigurationScreenProps = {
  renderWidget: (widget: React.JSX.Element) => void;
  setResult: (result: 'ok' | 'cancel') => void;
};

function WidgetConfigurationScreen({
  renderWidget,
  setResult,
}: ConfigurationScreenProps) {
  const [items, setItems] = useState<DoseDecreaseTrackedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialId, setInitialId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [trackedItems, storedSelected] = await Promise.all([
        readTrackedItems(),
        readSelectedTrackerId(),
      ]);

      const dosageItems = trackedItems.filter(
        (item): item is DoseDecreaseTrackedItem =>
          item.type === TrackerType.SlowLoweringTheDosage
      );

      setItems(dosageItems);
      setSelectedId(storedSelected);
      setInitialId(storedSelected);
    };

    void load();
  }, []);

  useEffect(() => {
    const tracker = items.find((item) => item.id === selectedId);
    renderWidget(
      tracker
        ? renderTrackerWidget(tracker)
        : renderEmptyWidget('Pick a dosage tracker to pin here')
    );
  }, [items, renderWidget, selectedId]);

  const hasChanges = selectedId !== initialId;

  const confirmSelection = async () => {
    await persistSelectedTrackerId(selectedId);
    setResult('ok');
  };

  const cancelSelection = () => {
    setResult(initialId ? 'ok' : 'cancel');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose dosage tracker</Text>
      <Text style={styles.subtitle}>
        Select which tracker should appear on the Android home screen widget.
      </Text>
      <View style={styles.listContainer}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>
            Create a dosage tracker in LessByLess to pin it to your home screen.
          </Text>
        ) : (
          items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                style={[styles.row, isSelected && styles.rowSelected]}
              >
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowSubtitle}>
                    Tracking since {formatDateForDisplay(item.startedAt)}
                  </Text>
                </View>
                <View style={styles.selector}>
                  <View style={[styles.selectorInner, isSelected && styles.selectorInnerActive]} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, (!selectedId || !hasChanges) && styles.buttonDisabled]}
          disabled={!selectedId || !hasChanges}
          onPress={confirmSelection}
        >
          <Text style={styles.primaryButtonText}>Pin this tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={cancelSelection}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: '#0b0b0f',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    marginTop: 8,
    color: '#b0b0c5',
    fontSize: 14,
  },
  listContainer: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#18181f',
    paddingVertical: 8,
  },
  emptyText: {
    color: '#cbd5f5',
    padding: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a35',
  },
  rowSelected: {
    backgroundColor: 'rgba(251, 146, 60, 0.12)',
  },
  rowContent: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  rowSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#b3b3c6',
  },
  selector: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fb923c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  selectorInnerActive: {
    backgroundColor: '#fb923c',
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#fb923c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1f1f29',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f2f3b',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#d1d1dd',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
