import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Themed';
import { ColdTurkeyTrackedItem } from '@/types/tracking';
import { formatDateForDisplay } from '@/utils/date';
import { useElapsedBreakdown } from '@/hooks/useElapsedBreakdown';
import { getColdTurkeyProgress, getTrackerIcon } from '@/utils/tracker';

type Props = {
  item: ColdTurkeyTrackedItem;
  onPress: () => void;
};

export function ColdTurkeyListCard({ item, onPress }: Props) {
  const icon = getTrackerIcon(item.type);
  const progress = getColdTurkeyProgress(item.startedAt);
  const breakdown = useElapsedBreakdown(item.startedAt);
  const progressPercent = progress.next ? progress.progressToNext : 1;
  const nextLabel = progress.next ? `Next milestone: ${progress.next.label}` : 'All milestones achieved';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, styles.coldCard]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={[styles.iconContainer, styles.coldIcon]} accessible={false}>
          <FontAwesome6 color={icon.color} name={icon.name} size={18} />
        </View>
      </View>
      <Text style={styles.subtitle}>All-in quit since {formatDateForDisplay(item.startedAt)}</Text>
      <Text style={[styles.metaText, styles.coldMetaText]}>
        {breakdown.map((entry) => `${entry.value} ${entry.unit}`).join(' • ')}
      </Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(progressPercent * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{nextLabel}</Text>
      </View>
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
  coldCard: {
    borderWidth: 1,
    borderColor: '#34d399',
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
  coldIcon: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
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
  coldMetaText: {
    color: '#34d399',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  progressLabel: {
    marginTop: 8,
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
  },
});
