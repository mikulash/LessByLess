import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { ColdTurkeyTrackedItem } from '@/types/tracking';
import { calculateDaysTracked, formatDateForDisplay } from '@/utils/date';
import { getTrackerIcon } from '@/utils/tracker';

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
            {daysTracked !== null ? (
              <Text style={[styles.summaryHighlight, styles.coldHighlight]}>
                {daysTracked} {daysTracked === 1 ? 'day' : 'days'} completely clean
              </Text>
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
});
