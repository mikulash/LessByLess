import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/components/Themed';

const STORAGE_KEY = 'tracked-items';

const TRACKER_TYPES = [
  { value: 'ColdTurker', label: 'ColdTurker' },
  { value: 'Slow lowering the dosage', label: 'Slow lowering the dosage' },
] as const;

type TrackerType = (typeof TRACKER_TYPES)[number]['value'];

type TrackedItem = {
  id: string;
  name: string;
  startedAt: string;
  type: TrackerType;
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const parseDateInput = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatDateForDisplay = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const calculateDaysTracked = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const now = new Date();
  const diff = now.getTime() - parsed.getTime();
  if (diff < 0) {
    return 0;
  }

  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export default function TabOneScreen() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));
  const [selectedType, setSelectedType] = useState<TrackerType>('ColdTurker');
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: TrackedItem[] = JSON.parse(stored);
          setItems(parsed);
        }
      } catch (error) {
        console.warn('Failed to load tracked items', error);
      } finally {
        setLoading(false);
      }
    };

    void loadItems();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.warn('Failed to persist tracked items', error);
      }
    };

    void persist();
  }, [items, isLoading]);

  const resetForm = () => {
    setNameInput('');
    setDateInput(formatDateInput(new Date()));
    setSelectedType('ColdTurker');
  };

  const handleOpenModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCreateTracker = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      return;
    }

    const parsedDate = parseDateInput(dateInput) ?? new Date();

    const newItem: TrackedItem = {
      id: `${Date.now()}`,
      name: trimmedName,
      startedAt: parsedDate.toISOString(),
      type: selectedType,
    };

    setItems((previous) => [...previous, newItem]);
    setModalVisible(false);
  };

  const listEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No tracked items yet</Text>
        <Text style={styles.emptySubtitle}>Tap the plus icon to start tracking.</Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>My Tracking</Text>
          <Text style={styles.subheading}>Stay accountable every day</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Add a tracker"
          accessibilityRole="button"
          onPress={handleOpenModal}
          style={styles.addButton}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={listEmptyComponent}
        renderItem={({ item }) => {
          const daysTracked = calculateDaysTracked(item.startedAt);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>Tracking since {formatDateForDisplay(item.startedAt)}</Text>
              {daysTracked !== null ? (
                <Text style={styles.cardDuration}>
                  {daysTracked} {daysTracked === 1 ? 'day' : 'days'}
                </Text>
              ) : null}
            </View>
          );
        }}
      />

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a tracker</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="What are you tracking?"
              placeholderTextColor="#888"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Start date</Text>
            <TextInput
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {TRACKER_TYPES.map((type, index) => {
                const isSelected = selectedType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setSelectedType(type.value)}
                    style={[
                      styles.typeOption,
                      index === TRACKER_TYPES.length - 1 && styles.typeOptionLast,
                      isSelected && styles.typeOptionSelected,
                    ]}
                  >
                    <Text
                      style={[styles.typeOptionText, isSelected && styles.typeOptionTextSelected]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCloseModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, !nameInput.trim() && styles.disabledButton]}
                onPress={handleCreateTracker}
                disabled={!nameInput.trim()}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#0b0b0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  subheading: {
    marginTop: 4,
    fontSize: 14,
    color: '#ccc',
  },
  addButton: {
    backgroundColor: '#4c6ef5',
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 30,
    paddingRight: 20,
  },
  card: {
    backgroundColor: '#18181f',
    padding: 18,
    borderRadius: 20,
    marginRight: 16,
    width: 240,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flexShrink: 1,
    marginRight: 10,
  },
  cardSubtitle: {
    color: '#bbb',
    fontSize: 14,
  },
  cardDuration: {
    marginTop: 12,
    color: '#4c6ef5',
    fontWeight: '600',
    fontSize: 16,
  },
  typeBadge: {
    backgroundColor: '#2f2f3b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#a5b4fc',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    width: 260,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  emptySubtitle: {
    marginTop: 8,
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1f1f29',
    borderRadius: 20,
    width: '100%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2a2a35',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a35',
    alignItems: 'center',
  },
  typeOptionLast: {
    marginRight: 0,
  },
  typeOptionSelected: {
    backgroundColor: '#4c6ef5',
  },
  typeOptionText: {
    color: '#ccc',
    fontWeight: '600',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#2a2a35',
  },
  saveButton: {
    backgroundColor: '#4c6ef5',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
  },
});
