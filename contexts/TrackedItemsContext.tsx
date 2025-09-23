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

import { TRACKED_ITEMS_STORAGE_KEY } from '@/constants/storage';
import { TrackedItem } from '@/types/tracking';

type TrackedItemsContextValue = {
  items: TrackedItem[];
  isLoading: boolean;
  addItem: (item: TrackedItem) => void;
  updateItem: (item: TrackedItem) => void;
  removeItem: (id: string) => void;
  refresh: () => Promise<void>;
};

const TrackedItemsContext = createContext<TrackedItemsContextValue | undefined>(undefined);

export function TrackedItemsProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(TRACKED_ITEMS_STORAGE_KEY);
      if (stored) {
        const parsed: TrackedItem[] = JSON.parse(stored);
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

  const addItem = useCallback((item: TrackedItem) => {
    setItems((previous) => [...previous, item]);
  }, []);

  const updateItem = useCallback((item: TrackedItem) => {
    setItems((previous) => previous.map((existing) => (existing.id === item.id ? item : existing)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, isLoading, addItem, updateItem, removeItem, refresh: loadItems }),
    [addItem, isLoading, items, loadItems, removeItem, updateItem]
  );

  return <TrackedItemsContext.Provider value={value}>{children}</TrackedItemsContext.Provider>;
}

export function useTrackedItems() {
  const context = useContext(TrackedItemsContext);
  if (!context) {
    throw new Error('useTrackedItems must be used within a TrackedItemsProvider');
  }

  return context;
}
