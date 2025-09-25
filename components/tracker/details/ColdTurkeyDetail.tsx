import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useElapsedBreakdown } from '@/hooks/useElapsedBreakdown';
import { ColdTurkeyTrackedItem } from '@/types/tracking';
import { formatDateForDisplay } from '@/utils/date';
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
  const { item } = props;
  const breakdown = useElapsedBreakdown(item.startedAt);
  const progress = getColdTurkeyProgress(item.startedAt);
  const progressPercent = progress.next ? progress.progressToNext : 1;
  const nextLabel = progress.next ? `Next milestone: ${progress.next.label}` : 'All milestones achieved';

  // Distinct milestone colors (avoid green and orange)
  const MILESTONE_COLORS = [
    { border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.16)', iconBg: 'rgba(96, 165, 250, 0.22)', text: '#dbeafe' }, // blue
    { border: '#818cf8', bg: 'rgba(129, 140, 248, 0.16)', iconBg: 'rgba(129, 140, 248, 0.22)', text: '#e0e7ff' }, // indigo
    { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.16)', iconBg: 'rgba(139, 92, 246, 0.22)', text: '#ede9fe' }, // violet
    { border: '#a78bfa', bg: 'rgba(167, 139, 250, 0.16)', iconBg: 'rgba(167, 139, 250, 0.22)', text: '#ede9fe' }, // purple
    { border: '#e879f9', bg: 'rgba(232, 121, 249, 0.16)', iconBg: 'rgba(232, 121, 249, 0.22)', text: '#f5d0fe' }, // fuchsia
    { border: '#f472b6', bg: 'rgba(244, 114, 182, 0.16)', iconBg: 'rgba(244, 114, 182, 0.22)', text: '#fbcfe8' }, // pink
    { border: '#fb7185', bg: 'rgba(251, 113, 133, 0.16)', iconBg: 'rgba(251, 113, 133, 0.22)', text: '#ffe4e6' }, // rose
    { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.16)', iconBg: 'rgba(239, 68, 68, 0.22)', text: '#fecaca' }, // red
    { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.16)', iconBg: 'rgba(56, 189, 248, 0.22)', text: '#cffafe' }, // sky
    { border: '#22d3ee', bg: 'rgba(34, 211, 238, 0.16)', iconBg: 'rgba(34, 211, 238, 0.22)', text: '#a5f3fc' }, // cyan
  ];

  return (
    <TrackerDetailTemplate
      {...props}
      renderSummary={(item) => {
        const icon = getTrackerIcon(item.type);
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
              {breakdown.map((entry, index) => (
                <Text
                  key={`${entry.unit}-${index}`}
                  style={[styles.breakdownRow, styles.coldHighlight]}
                >
                  {entry.value} {entry.unit}
                </Text>
              ))}
            </View>
            {/* Stepper-style progress (green + shows fill progress) */}
            <View style={styles.stepperContainer} accessibilityLabel="Progress timeline">
              <View style={styles.stepperLine} />
              <View style={[styles.stepperFillLine, { width: `${Math.round(progressPercent * 100)}%` }]} />
              <View style={[styles.stepperDot, styles.stepperDotLeft]}>
                <View style={styles.stepperDotInner} />
              </View>
              <View style={[styles.stepperDot, styles.stepperDotRight]}>
                <View style={styles.stepperDotInner} />
              </View>
            </View>
            <View style={styles.stepperLabels}>
              <Text style={styles.stepperLabel}>{formatDateForDisplay(item.startedAt)}</Text>
              <Text style={[styles.stepperLabel, styles.stepperLabelRight]}>
                {progress.next ? progress.next.label : 'All milestones achieved'}
              </Text>
            </View>
            {progress.achieved.length ? (
              <View style={styles.milestonesSection}>
                <View style={styles.milestonesTitleRow}>
                  <Text style={styles.milestonesTitle}>Milestones achieved</Text>
                  <FontAwesome6 name="trophy" size={14} color="#60a5fa" />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.milestonesList}
                >
                  {progress.achieved.map((milestone, idx) => {
                    const isLatest = idx === progress.achieved.length - 1;
                    const c = MILESTONE_COLORS[idx % MILESTONE_COLORS.length];
                    return (
                      <View
                        key={milestone.label}
                        style={[
                          styles.milestoneChip,
                          isLatest && styles.milestoneChipLatest,
                          { backgroundColor: c.bg, borderColor: c.border, shadowColor: c.border },
                        ]}
                        accessibilityLabel={`Achieved milestone: ${milestone.label}`}
                      >
                        <View style={[styles.milestoneIconWrap, { backgroundColor: c.iconBg, borderColor: c.border }]}>
                          <FontAwesome6 name="trophy" size={12} color={c.border} />
                        </View>
                        <Text style={[styles.milestoneChipText, { color: c.text }]}>{milestone.label}</Text>
                      </View>
                    );
                  })}
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
  // Stepper styles
  stepperContainer: {
    marginTop: 16,
    height: 38,
    justifyContent: 'center',
  },
  stepperLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 18,
    height: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.25)', // green track
    borderRadius: 2,
  },
  stepperFillLine: {
    position: 'absolute',
    left: 0,
    top: 18,
    height: 4,
    backgroundColor: '#34d399', // green fill
    borderRadius: 2,
  },
  stepperDot: {
    position: 'absolute',
    top: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#34d399',
    backgroundColor: '#18181f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  stepperDotLeft: {
    left: 0,
  },
  stepperDotRight: {
    right: 0,
  },
  stepperLabels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepperLabel: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '700',
  },
  stepperLabelRight: {
    textAlign: 'right',
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
  milestonesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestonesList: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 6,
  },
  milestoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    // subtle glow (color applied inline per milestone)
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  milestoneChipLatest: {
    borderWidth: 1.5,
    shadowRadius: 8,
  },
  milestoneIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    // colors applied inline per milestone
  },
  milestoneChipText: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: 13,
  },
});
