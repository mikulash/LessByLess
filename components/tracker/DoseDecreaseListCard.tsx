import { FontAwesome6 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';

import { Text } from '@/components/Themed';
import { DoseDecreaseTrackedItem } from '@/types/tracking';
import { calculateDaysTracked, formatDateForDisplay } from '@/utils/date';
import { getTodaysDoseTotal, getTrackerIcon } from '@/utils/tracker';
import { useTrackedItems } from '@/contexts/TrackedItemsContext';

type Props = {
  item: DoseDecreaseTrackedItem;
  onPress: () => void;
};

export function DoseDecreaseListCard({ item, onPress }: Props) {
  const { updateItem } = useTrackedItems();
  const [doseInput, setDoseInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const daysTracked = calculateDaysTracked(item.startedAt);
  const icon = getTrackerIcon(item.type);
  const todayTotal = getTodaysDoseTotal(item);
  const formattedTotal = Number.isInteger(todayTotal.value)
    ? todayTotal.value.toString()
    : todayTotal.value.toFixed(2);

  const canLog = doseInput.trim().length > 0 && !Number.isNaN(Number(doseInput));

  const handleLogDose = () => {
    if (!canLog) return;
    const amount = parseFloat(doseInput);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const trimmedNote = noteInput.trim();

    const next = {
      ...item,
      doseLogs: [
        ...(item.doseLogs ?? []),
        {
          at: new Date().toISOString(),
          value: amount,
          unit: item.currentUsageUnit,
          ...(trimmedNote ? { note: trimmedNote } : {}),
        },
      ],
    } as DoseDecreaseTrackedItem;
    updateItem(next);
    setDoseInput('');
    setNoteInput('');
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, styles.doseCard]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={[styles.iconContainer, styles.doseIcon]} accessible={false}>
          <FontAwesome6 color={icon.color} name={icon.name} size={18} />
        </View>
      </View>
      <Text style={styles.subtitle}>Gradually reducing since {formatDateForDisplay(item.startedAt)}</Text>
      <Text style={[styles.metaText, styles.doseMetaText]}>
        {`Today's total: ${formattedTotal} ${todayTotal.unit}`}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={doseInput}
          onChangeText={setDoseInput}
          placeholder={`Amount (${item.currentUsageUnit})`}
          placeholderTextColor="#888"
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          keyboardType="decimal-pad"
          inputMode="decimal"
          accessibilityLabel="Dose amount"
        />
        <TouchableOpacity
          onPress={handleLogDose}
          style={[styles.logButton, !canLog && styles.disabledButton]}
          disabled={!canLog}
          accessibilityRole="button"
          accessibilityLabel={`Log dose in ${item.currentUsageUnit}`}
        >
          <Text style={styles.logButtonText}>Log</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        value={noteInput}
        onChangeText={setNoteInput}
        placeholder="Note (optional)"
        placeholderTextColor="#888"
        style={[styles.input, { marginTop: 10 }]}
        accessibilityLabel="Optional note for this dose"
        returnKeyType="done"
      />
      {daysTracked !== null ? (
        <Text style={[styles.metaText, styles.doseMetaText]}>
          {daysTracked} {daysTracked === 1 ? 'day' : 'days'} of progress
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181f',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  doseCard: {
    borderWidth: 1,
    borderColor: '#fb923c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flexShrink: 1,
    marginRight: 16,
  },
  iconContainer: {
    backgroundColor: '#2f2f3b',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseIcon: {
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
  },
  subtitle: {
    color: '#bbb',
    fontSize: 14,
  },
  metaText: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  doseMetaText: {
    color: '#fb923c',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2a2a35',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logButton: {
    backgroundColor: '#fb923c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    color: '#1f1f29',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
