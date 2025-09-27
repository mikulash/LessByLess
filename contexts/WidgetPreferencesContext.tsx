import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { SELECTED_WIDGET_TRACKER_STORAGE_KEY } from '@/constants/storage';
import { TrackerType } from '@/enums/TrackerType';
import type { TrackerItem } from '@/types/tracking';
import { useTrackedItems } from '@/contexts/TrackedItemsContext';
import { updateDosageTrackerWidget } from '@/widgets/updateDosageTrackerWidget';

type WidgetPreferencesContextValue = {
  selectedTrackerId: string | null;
  isLoading: boolean;
  setSelectedTrackerId: (trackerId: string | null) => Promise<void>;
};

const WidgetPreferencesContext =
  createContext<WidgetPreferencesContextValue | undefined>(undefined);

async function readPersistedTrackerId(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(
      SELECTED_WIDGET_TRACKER_STORAGE_KEY
    );
    return stored ?? null;
  } catch (error) {
    console.warn('Failed to read widget tracker preference', error);
    return null;
  }
}

async function persistTrackerId(value: string | null): Promise<void> {
  try {
    if (value) {
      await AsyncStorage.setItem(
        SELECTED_WIDGET_TRACKER_STORAGE_KEY,
        value
      );
    } else {
      await AsyncStorage.removeItem(SELECTED_WIDGET_TRACKER_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to persist widget tracker preference', error);
  }
}

export function WidgetPreferencesProvider({
  children,
}: PropsWithChildren): React.ReactElement {
  const { items } = useTrackedItems();
  const [selectedTrackerId, setSelectedTrackerIdState] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await readPersistedTrackerId();
      setSelectedTrackerIdState(stored);
      setIsLoading(false);
    };

    void load();
  }, []);

  const setSelectedTrackerId = useCallback(
    async (trackerId: string | null) => {
      setSelectedTrackerIdState(trackerId);
      await persistTrackerId(trackerId);
      await updateDosageTrackerWidget(trackerId, items);
    },
    [items]
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    void updateDosageTrackerWidget(selectedTrackerId, items);
  }, [isLoading, items, selectedTrackerId]);

  useEffect(() => {
    if (!selectedTrackerId) {
      return;
    }

    const hasSelected = items.some(
      (item) =>
        item.id === selectedTrackerId &&
        item.type === TrackerType.SlowLoweringTheDosage
    );

    if (!hasSelected) {
      void setSelectedTrackerId(null);
    }
  }, [items, selectedTrackerId, setSelectedTrackerId]);

  const value = useMemo<WidgetPreferencesContextValue>(
    () => ({ selectedTrackerId, isLoading, setSelectedTrackerId }),
    [isLoading, selectedTrackerId, setSelectedTrackerId]
  );

  return (
    <WidgetPreferencesContext.Provider value={value}>
      {children}
    </WidgetPreferencesContext.Provider>
  );
}

export function useWidgetPreferences(): WidgetPreferencesContextValue {
  const context = useContext(WidgetPreferencesContext);
  if (!context) {
    throw new Error(
      'useWidgetPreferences must be used within a WidgetPreferencesProvider'
    );
  }

  return context;
}
