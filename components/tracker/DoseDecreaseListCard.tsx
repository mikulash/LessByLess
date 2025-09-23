import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Themed';
import { DoseDecreaseTrackedItem } from '@/types/tracking';
import { calculateDaysTracked, formatDateForDisplay } from '@/utils/date';
import { getTrackerIcon } from '@/utils/tracker';

type Props = {
  item: DoseDecreaseTrackedItem;
  onPress: () => void;
};

export function DoseDecreaseListCard({ item, onPress }: Props) {
  const daysTracked = calculateDaysTracked(item.startedAt);
  const icon = getTrackerIcon(item.type);

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
    padding: 8,
    borderRadius: 16,
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
});

