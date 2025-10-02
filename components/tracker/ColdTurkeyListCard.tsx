import {FontAwesome6} from '@expo/vector-icons';
import React from 'react';
import {StyleSheet, TouchableOpacity, View, Text as RNText} from 'react-native';

import {Text} from '@/components/Themed';
import {useElapsedBreakdown} from '@/hooks/useElapsedBreakdown';
import {ColdTurkeyTrackedItem} from '@/types/tracking';
import {formatDateForDisplay, formatTimeLeft} from '@/utils/date';
import {
    formatElapsedDurationLabel,
    getColdTurkeyProgress,
    getColdTurkeyStreakTargets,
    getTrackerIcon,
} from '@/utils/tracker';

type Props = {
    item: ColdTurkeyTrackedItem;
    onPress: () => void;
};

export function ColdTurkeyListCard({item, onPress}: Props) {
    const icon = getTrackerIcon(item.type);
    const progress = getColdTurkeyProgress(item.startedAt);
    const breakdown = useElapsedBreakdown(item.startedAt);

    const startedMs = new Date(item.startedAt).getTime();
    const elapsedMs = Math.max(0, Date.now() - startedMs);

    const progressPercent = progress.next ? progress.progressToNext : 1;

    const timeLeft =
        progress.next ? formatTimeLeft(Math.max(0, progress.next.durationMs - elapsedMs)) : null;

    const nextLabel = progress.next
        ? `Next milestone: ${progress.next.label}${timeLeft ? ` (in ${timeLeft})` : ''}`
        : 'All milestones achieved';

    const {last, record} = getColdTurkeyStreakTargets(item.resetHistory);
    const lastDurationMs = last?.durationMs ?? 0;
    const hasLastTarget = lastDurationMs > 0;
    const lastProgress = hasLastTarget ? Math.min(1, elapsedMs / lastDurationMs) : 0;
    const hasGoneLonger = hasLastTarget && elapsedMs >= lastDurationMs;
    const lastRemainingMs = hasLastTarget ? Math.max(0, lastDurationMs - elapsedMs) : 0;
    const lastTimeLeftLabel = hasLastTarget && lastRemainingMs > 0 ? formatTimeLeft(lastRemainingMs) : '';
    const lastDurationLabel = hasLastTarget ? formatElapsedDurationLabel(lastDurationMs) : '';
    const shouldShowLastProgressBar = hasLastTarget && !hasGoneLonger;

    const recordDurationMs = record?.durationMs ?? 0;
    const hasRecordTarget = recordDurationMs > 0;
    const recordProgress = hasRecordTarget ? Math.min(1, elapsedMs / recordDurationMs) : 0;
    const recordRemainingMs = hasRecordTarget ? Math.max(0, recordDurationMs - elapsedMs) : 0;
    const hasHitRecord = hasRecordTarget && elapsedMs >= recordDurationMs;
    const recordTimeLeftLabel = hasRecordTarget && recordRemainingMs > 0 ? formatTimeLeft(recordRemainingMs) : '';
    const recordDurationLabel = hasRecordTarget ? formatElapsedDurationLabel(recordDurationMs) : '';
    const shouldShowRecordProgress = hasRecordTarget && hasGoneLonger;
    const shouldShowRecordProgressBar = shouldShowRecordProgress && !hasHitRecord;

    return (
        <TouchableOpacity
            accessibilityRole="button"
            onPress={onPress}
            style={[styles.card, styles.coldCard]}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={[styles.iconContainer, styles.coldIcon]} accessible={false}>
                    <FontAwesome6 color={icon.color} name={icon.name} size={18}/>
                </View>
            </View>

            <Text style={styles.subtitle}>All-in quit since {formatDateForDisplay(item.startedAt)}</Text>

            <RNText style={styles.breakdownText}>
                {breakdown.map((entry, i) => (
                    <React.Fragment key={`${entry.unit}-${i}`}>
                        <RNText style={styles.breakdownNumber}>{entry.value}</RNText>
                        <RNText>{` ${entry.unit}`}</RNText>
                        {i < breakdown.length - 1 ? <RNText>{' | '}</RNText> : null}
                    </React.Fragment>
                ))}
            </RNText>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: `${Math.round(progressPercent * 100)}%`}]}/>
                </View>
                <Text style={styles.progressLabel}>{nextLabel}</Text>

                {hasLastTarget ? (
                    <View style={styles.streakSection}>
                        {shouldShowLastProgressBar ? (
                            <View style={[styles.progressBar, styles.lastProgressBar]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        styles.lastProgressFill,
                                        {width: `${Math.round(Math.min(1, lastProgress) * 100)}%`},
                                    ]}
                                />
                            </View>
                        ) : null}

                        {/* Label + (conditional) trophy */}
                        <View style={styles.inlineRow}>
                            <Text style={styles.streakLabel}>
                                {hasGoneLonger
                                    ? `Beat last streak (${lastDurationLabel})`
                                    : `Beat last streak (${lastDurationLabel})${
                                        lastTimeLeftLabel ? ` | ${lastTimeLeftLabel} left` : ''
                                    }`}
                            </Text>
                            {hasGoneLonger ? (
                                <FontAwesome6 name="trophy" size={12} color="#facc15"/>
                            ) : null}
                        </View>
                    </View>
                ) : null}

                {shouldShowRecordProgress ? (
                    <View style={styles.streakSection}>
                        {shouldShowRecordProgressBar ? (
                            <View style={[styles.progressBar, styles.recordProgressBar]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        styles.recordProgressFill,
                                        {width: `${Math.round(Math.min(1, recordProgress) * 100)}%`},
                                    ]}
                                />
                            </View>
                        ) : null}

                        {/* Label + (conditional) trophy */}
                        <View style={styles.inlineRow}>
                            <Text style={[styles.streakLabel, styles.recordLabel]}>
                                {hasHitRecord
                                    ? `Record streak (${recordDurationLabel})`
                                    : `Record streak (${recordDurationLabel})${
                                        recordTimeLeftLabel ? ` | ${recordTimeLeftLabel} left` : ''
                                    }`}
                            </Text>
                            {hasHitRecord ? (
                                <FontAwesome6 name="trophy" size={12} color="#fde047"/>
                            ) : null}
                        </View>
                    </View>
                ) : null}
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
    breakdownText: {
        marginTop: 12,
        fontWeight: '600',
        fontSize: 16,
        color: '#fff',
    },
    breakdownNumber: {
        fontWeight: '800',
        fontSize: 18,
        color: '#fff',
    },
    progressContainer: {
        marginTop: 16,
        gap: 10,
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
        color: '#a7f3d0',
        fontSize: 12,
        fontWeight: '600',
    },
    streakSection: {
        gap: 6,
    },
    lastProgressBar: {
        backgroundColor: 'rgba(96, 165, 250, 0.18)',
    },
    lastProgressFill: {
        backgroundColor: '#60a5fa',
    },
    recordProgressBar: {
        backgroundColor: 'rgba(59, 130, 246, 0.18)',
    },
    recordProgressFill: {
        backgroundColor: '#38bdf8',
    },
    streakLabel: {
        color: '#bfdbfe',
        fontSize: 12,
        fontWeight: '600',
    },
    recordLabel: {
        color: '#a5f3fc',
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});
