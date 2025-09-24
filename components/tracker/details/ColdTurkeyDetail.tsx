import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useElapsedBreakdown } from '@/hooks/useElapsedBreakdown';
import { ColdTurkeyTrackedItem } from '@/types/tracking';
import { calculateDaysTracked, formatDateForDisplay } from '@/utils/date';
import { getColdTurkeyProgress, getTrackerIcon } from '@/utils/tracker';

import { TrackerDetailTemplate } from './TrackerDetailTemplate';

type ColdTurkeyDetailProps = {
  item: ColdTurkeyTrackedItem;
  nameInput: string;
  onNameChange: (value: string) => void;
  startDateDisplay: string;
  disableSave: boolean;
  onSave: () => void;
  onResetDate: () => void;
  onDelete: () => void;
};

export function ColdTurkeyDetail(props: ColdTurkeyDetailProps) {
  return (
    <TrackerDetailTemplate
      {...props}
      renderSummary={(item) => {
        const icon = getTrackerIcon(item.type);
        const daysTracked = calculateDaysTracked(item.startedAt);
        const progress = getColdTurkeyProgress(item.startedAt);
        const progressPercent = progress.next ? progress.progressToNext : 1;
        const nextLabel = progress.next ? `Next milestone: ${progress.next.label}` : 'All milestones achieved';
        const breakdown = useElapsedBreakdown(item.startedAt);
        return (
          <View style={[styles.summaryCard, styles.coldSummary]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{item.name}</Text>
              <View style={[styles.summaryIcon, styles.coldIcon]}>
                <FontAwesome6 color={icon.color} name={icon.name} size={32} />
              </View>
            </View>
            <Text style={styles.summarySubtitle}>Cold turkey commitment</Text>
            <Text style={styles.summaryMeta}>Since {formatDateForDisplay(item.startedAt)}</Text>
            <View style={styles.breakdownStack}>
              {breakdown.map((entry) => (
                <Text key={entry.unit} style={[styles.breakdownRow, styles.coldHighlight]}>
                  {entry.value} {entry.unit}
                </Text>
              ))}
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.round(progressPercent * 100)}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{nextLabel}</Text>
            </View>
            {progress.achieved.length ? (
              <View style={styles.milestonesSection}>
                <Text style={styles.milestonesTitle}>Milestones achieved</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.milestonesList}
                >
                  {progress.achieved.map((milestone) => (
                    <View key={milestone.label} style={styles.milestoneChip}>
                      <Text style={styles.milestoneChipText}>{milestone.label}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#18181f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  coldSummary: {
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.5)',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2f2f3b',
  },
  coldIcon: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  summarySubtitle: {
    color: '#6ee7b7',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryMeta: {
    color: '#bbb',
    marginTop: 6,
    fontSize: 14,
  },
  summaryHighlight: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
  },
  coldHighlight: {
    color: '#34d399',
  },
  breakdownStack: {
    marginTop: 12,
    gap: 4,
  },
  breakdownRow: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 16,
    gap: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  progressLabel: {
    color: '#a7f3d0',
    fontSize: 13,
    fontWeight: '600',
  },
  milestonesSection: {
    marginTop: 18,
    gap: 10,
  },
  milestonesTitle: {
    color: '#6ee7b7',
    fontWeight: '700',
    fontSize: 14,
  },
  milestonesList: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 6,
  },
  milestoneChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  milestoneChipText: {
    color: '#d1fae5',
    fontWeight: '600',
    fontSize: 12,
  },
});
