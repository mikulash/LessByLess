import { Feather, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import { TrackerType } from '@/enums/TrackerType';
import { TrackedItem, TrackerTypeOption } from '@/types/tracking';
import {
  calculateDaysTracked,
  formatDateForDisplay,
  formatDateInput,
  parseDateInput,
} from '@/utils/date';

const STORAGE_KEY = 'tracked-items';

const TRACKER_TYPES: TrackerTypeOption[] = [
  { value: TrackerType.ColdTurker, label: 'ColdTurker' },
  { value: TrackerType.SlowLoweringTheDosage, label: 'Slow lowering the dosage' },
];

const getTrackerIcon = (type: TrackerType) => {
  if (type === TrackerType.SlowLoweringTheDosage) {
    return { name: 'arrow-trend-down' as const, color: '#fb923c' };
  }

  return { name: 'xmark' as const, color: '#f87171' };
};

export default function TabOneScreen() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<TrackedItem | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));
  const [selectedType, setSelectedType] = useState<TrackerType>(TrackerType.ColdTurker);
  const [isLoading, setLoading] = useState(true);
  const detailDaysTracked = selectedItem ? calculateDaysTracked(selectedItem.startedAt) : null;

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
    setSelectedType(TrackerType.ColdTurker);
  };

  const handleOpenModal = () => {
    setModalMode('create');
    setSelectedItem(null);
    resetForm();
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleOpenDetailModal = (item: TrackedItem) => {
    setModalMode('edit');
    setSelectedItem(item);
    setNameInput(item.name);
    setSelectedType(item.type);

    const parsedDate = parseDateInput(item.startedAt);
    setDateInput(parsedDate ? formatDateInput(parsedDate) : '');

    setModalVisible(true);
  };

  const handleSaveTracker = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      return;
    }

    const parsedDate = parseDateInput(dateInput) ?? new Date();

    if (modalMode === 'create') {
      const newItem: TrackedItem = {
        id: `${Date.now()}`,
        name: trimmedName,
        startedAt: parsedDate.toISOString(),
        type: selectedType,
      };

      setItems((previous) => [...previous, newItem]);
    } else if (selectedItem) {
      const updatedItem: TrackedItem = {
        ...selectedItem,
        name: trimmedName,
        startedAt: parsedDate.toISOString(),
        type: selectedType,
      };

      setItems((previous) =>
        previous.map((item) => (item.id === selectedItem.id ? updatedItem : item))
      );
      setSelectedItem(updatedItem);
    }

    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleDeleteTracker = () => {
    if (!selectedItem) {
      return;
    }

    setItems((previous) => previous.filter((item) => item.id !== selectedItem.id));
    setModalVisible(false);
    setSelectedItem(null);
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={listEmptyComponent}
        renderItem={({ item }) => {
          const daysTracked = calculateDaysTracked(item.startedAt);
          const iconConfig = getTrackerIcon(item.type);
          return (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => handleOpenDetailModal(item)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.typeIconContainer} accessible={false}>
                  <FontAwesome6
                    color={iconConfig.color}
                    name={iconConfig.name}
                    size={18}
                  />
                </View>
              </View>
              <Text style={styles.cardSubtitle}>Tracking since {formatDateForDisplay(item.startedAt)}</Text>
              {daysTracked !== null ? (
                <Text style={styles.cardDuration}>
                  {daysTracked} {daysTracked === 1 ? 'day' : 'days'}
                </Text>
              ) : null}
            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>
              {modalMode === 'create' ? 'Create a tracker' : 'Tracker details'}
            </Text>

            {modalMode === 'edit' && selectedItem ? (
              <View style={styles.detailSummary}>
                <Text style={styles.detailSummaryText}>
                  Started {formatDateForDisplay(selectedItem.startedAt)}
                </Text>
                <Text style={[styles.detailSummaryText, styles.detailSummaryTextLast]}>
                  Tracking for {detailDaysTracked ?? 0}{' '}
                  {detailDaysTracked === 1 ? 'day' : 'days'}
                </Text>
              </View>
            ) : null}

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
                onPress={handleSaveTracker}
                disabled={!nameInput.trim()}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                  {modalMode === 'create' ? 'Save' : 'Save changes'}
                </Text>
              </TouchableOpacity>
            </View>

            {modalMode === 'edit' ? (
              <TouchableOpacity
                onPress={handleDeleteTracker}
                style={[styles.modalButton, styles.deleteButton]}
                accessibilityLabel="Delete tracker"
                accessibilityRole="button"
              >
                <Text style={[styles.modalButtonText, styles.deleteButtonText]}>Delete tracker</Text>
              </TouchableOpacity>
            ) : null}
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#18181f',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    width: '100%',
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
  typeIconContainer: {
    backgroundColor: '#2f2f3b',
    padding: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  detailSummary: {
    backgroundColor: '#262635',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  detailSummaryText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  detailSummaryTextLast: {
    marginBottom: 0,
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
  deleteButton: {
    backgroundColor: '#d64545',
    marginLeft: 0,
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
