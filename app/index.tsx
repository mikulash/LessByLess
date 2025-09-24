import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Themed';
import { ColdTurkeyListCard } from '@/components/tracker/ColdTurkeyListCard';
import { DoseDecreaseListCard } from '@/components/tracker/DoseDecreaseListCard';
import { CreateTrackerModal } from '@/components/tracker/CreateTrackerModal';
import { TRACKER_TYPES } from '@/constants/trackerTypes';
import { useTrackedItems } from '@/contexts/TrackedItemsContext';
import { TrackerType } from '@/enums/TrackerType';
import type { TrackerItem } from '@/types/tracking';
import { formatDateInput, parseDateInput } from '@/utils/date';

export default function HomeScreen() {
  const { items, addItem } = useTrackedItems();
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));
  const [selectedType, setSelectedType] = useState<TrackerType>(TrackerType.ColdTurker);

  const resetForm = () => {
    setNameInput('');
    setDateInput(formatDateInput(new Date()));
    setSelectedType(TrackerType.ColdTurker);
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

    const baseItem = {
      id: `${Date.now()}`,
      name: trimmedName,
      startedAt: parsedDate.toISOString(),
      notifiedMilestones: [],
    };

    if (selectedType === TrackerType.ColdTurker) {
      addItem({ ...baseItem, type: TrackerType.ColdTurker });
    } else {
      addItem({ ...baseItem, type: TrackerType.SlowLoweringTheDosage });
    }

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={listEmptyComponent}
        renderItem={({ item }: { item: TrackerItem }) => {
          const handlePress = () => router.push({ pathname: '/tracker/[id]', params: { id: item.id } });
          if (item.type === TrackerType.ColdTurker) {
            return <ColdTurkeyListCard item={item} onPress={handlePress} />;
          }

          return <DoseDecreaseListCard item={item} onPress={handlePress} />;
        }}
      />

      <CreateTrackerModal
        visible={isModalVisible}
        name={nameInput}
        onNameChange={setNameInput}
        date={dateInput}
        onDateChange={setDateInput}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onSave={handleCreateTracker}
        onCancel={handleCloseModal}
      />
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
});
