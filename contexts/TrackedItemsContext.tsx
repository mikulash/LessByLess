import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { TRACKED_ITEMS_STORAGE_KEY } from '@/constants/storage';
import { TrackerType } from '@/enums/TrackerType';
import { getColdTurkeyProgress } from '@/utils/tracker';
import { TrackerItem } from '@/types/tracking';

type TrackedItemsContextValue = {
  items: TrackerItem[];
  isLoading: boolean;
  addItem: (item: TrackerItem) => void;
  updateItem: (item: TrackerItem) => void;
  removeItem: (id: string) => void;
  refresh: () => Promise<void>;
};

const TrackedItemsContext = createContext<TrackedItemsContextValue | undefined>(undefined);

export function TrackedItemsProvider({ children }: PropsWithChildren) {
  const isWeb = Platform.select({ web: true, default: false });
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(TRACKED_ITEMS_STORAGE_KEY);
      if (stored) {
        const parsed: TrackerItem[] = JSON.parse(stored).map((item: TrackerItem) =>
          item.type === TrackerType.ColdTurkey
            ? { ...item, notifiedMilestones: item.notifiedMilestones ?? [] }
            : item
        );
        setItems(parsed);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.warn('Failed to load tracked items', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.setItem(TRACKED_ITEMS_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.warn('Failed to persist tracked items', error);
      }
    };

    void persist();
  }, [items, isLoading]);

  const addItem = useCallback((item: TrackerItem) => {
    setItems((previous) => [...previous, item]);
  }, []);

  const updateItem = useCallback((item: TrackerItem) => {
    setItems((previous) => previous.map((existing) => (existing.id === item.id ? item : existing)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, isLoading, addItem, updateItem, removeItem, refresh: loadItems }),
    [addItem, isLoading, items, loadItems, removeItem, updateItem]
  );

  useEffect(() => {
    if (isWeb) {
      setHasNotificationPermission(false);
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const requestPermission = async () => {
      try {
        const existing = await Notifications.getPermissionsAsync();
        let granted = existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
        if (!granted) {
          const request = await Notifications.requestPermissionsAsync();
          granted = request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
        }
        setHasNotificationPermission(granted ?? false);
      } catch (error) {
        console.warn('Failed to request notification permissions', error);
        setHasNotificationPermission(false);
      }
    };

    void requestPermission();
  }, []);

  const checkMilestoneNotifications = useCallback(async () => {
    if (!hasNotificationPermission || isWeb) {
      return;
    }

    const notifications: { title: string; body: string }[] = [];

    setItems((previous) => {
      let changed = false;
      const updated = previous.map((item) => {
        if (item.type !== TrackerType.ColdTurkey) {
          return item;
        }

        const notified = item.notifiedMilestones ?? [];
        const progress = getColdTurkeyProgress(item.startedAt);
        const newMilestones = progress.achieved.filter(
          (milestone) => !notified.includes(milestone.durationMs)
        );

        if (!newMilestones.length) {
          if (notified !== item.notifiedMilestones) {
            return { ...item, notifiedMilestones: notified };
          }
          return item;
        }

        changed = true;
        newMilestones.forEach((milestone) => {
          notifications.push({
            title: 'Milestone achieved!',
            body: `${item.name} reached ${milestone.label}. Keep going!`,
          });
        });

        return {
          ...item,
          notifiedMilestones: [...notified, ...newMilestones.map((milestone) => milestone.durationMs)],
        };
      });

      return changed ? updated : previous;
    });

    if (!isWeb) {
      for (const notification of notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
          },
          trigger: null,
        });
      }
    }
  }, [hasNotificationPermission, isWeb]);

  useEffect(() => {
    if (!hasNotificationPermission) {
      return;
    }

    void checkMilestoneNotifications();
    const interval = setInterval(() => {
      void checkMilestoneNotifications();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [checkMilestoneNotifications, hasNotificationPermission]);

  return <TrackedItemsContext.Provider value={value}>{children}</TrackedItemsContext.Provider>;
}

export function useTrackedItems() {
  const context = useContext(TrackedItemsContext);
  if (!context) {
    throw new Error('useTrackedItems must be used within a TrackedItemsProvider');
  }

  return context;
}
