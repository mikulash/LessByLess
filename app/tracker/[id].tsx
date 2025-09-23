import { FontAwesome6 } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import { TRACKER_TYPES } from '@/constants/trackerTypes';
import { useTrackedItems } from '@/contexts/TrackedItemsContext';
import { TrackerType } from '@/enums/TrackerType';
import { TrackedItem } from '@/types/tracking';
import {
  calculateDaysTracked,
  formatDateForDisplay,
  formatDateInput,
  parseDateInput,
} from '@/utils/date';
import { getTrackerIcon } from '@/utils/tracker';

export default function TrackerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, updateItem, removeItem } = useTrackedItems();
  const trackedItem = useMemo(() => items.find((item) => item.id === id), [id, items]);

  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));
  const [selectedType, setSelectedType] = useState<TrackerType>(TrackerType.ColdTurker);

  useEffect(() => {
    if (!trackedItem) {
      return;
    }

    setNameInput(trackedItem.name);
    const parsed = parseDateInput(trackedItem.startedAt);
    setDateInput(parsed ? formatDateInput(parsed) : '');
    setSelectedType(trackedItem.type);
  }, [trackedItem]);

  const daysTracked = trackedItem ? calculateDaysTracked(trackedItem.startedAt) : null;
  const iconConfig = trackedItem ? getTrackerIcon(trackedItem.type) : null;

  const handleSave = () => {
    if (!trackedItem) {
      return;
    }

    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      return;
    }

    const parsedDate = parseDateInput(dateInput) ?? new Date();

    const updated: TrackedItem = {
      ...trackedItem,
      name: trimmedName,
      startedAt: parsedDate.toISOString(),
      type: selectedType,
    };

    updateItem(updated);
  };

  const handleDelete = () => {
    if (!trackedItem) {
      return;
    }

    Alert.alert('Delete tracker', 'Are you sure you want to delete this tracker?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeItem(trackedItem.id);
          router.back();
        },
      },
    ]);
  };

  if (!trackedItem) {
    return (
      <View style={styles.centeredContainer}>
        <Stack.Screen options={{ title: 'Tracker not found' }} />
        <Text style={styles.missingTitle}>Tracker not found</Text>
        <Text style={styles.missingSubtitle}>The tracker you are looking for no longer exists.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Stack.Screen options={{ title: trackedItem.name }} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>{trackedItem.name}</Text>
          {iconConfig ? (
            <View style={styles.summaryIcon}>
              <FontAwesome6 color={iconConfig.color} name={iconConfig.name} size={32} />
            </View>
          ) : null}
        </View>
        <Text style={styles.summarySubtitle}>Started {formatDateForDisplay(trackedItem.startedAt)}</Text>
        {daysTracked !== null ? (
          <Text style={styles.summaryDays}>
            Tracking for {daysTracked} {daysTracked === 1 ? 'day' : 'days'}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit tracker</Text>

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
                <Text style={[styles.typeOptionText, isSelected && styles.typeOptionTextSelected]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionActions}>
          <TouchableOpacity
            style={[styles.primaryButton, !nameInput.trim() && styles.disabledButton]}
            onPress={handleSave}
            disabled={!nameInput.trim()}
          >
            <Text style={styles.primaryButtonText}>Save changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete tracker</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#0b0b0f',
    minHeight: '100%',
  },
  summaryCard: {
    backgroundColor: '#18181f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flexShrink: 1,
    marginRight: 16,
  },
  summaryIcon: {
    backgroundColor: '#2f2f3b',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySubtitle: {
    color: '#bbb',
    fontSize: 16,
  },
  summaryDays: {
    marginTop: 10,
    color: '#4c6ef5',
    fontWeight: '600',
    fontSize: 18,
  },
  section: {
    backgroundColor: '#18181f',
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
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
  sectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#d64545',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  missingSubtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
});
