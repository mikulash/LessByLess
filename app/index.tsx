import {Feather} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';

import {Text} from '@/components/Themed';
import {ColdTurkeyListCard} from '@/components/tracker/ColdTurkeyListCard';
import {CreateTrackerModal} from '@/components/tracker/CreateTrackerModal';
import {DoseDecreaseListCard} from '@/components/tracker/DoseDecreaseListCard';
import {useTrackedItems} from '@/contexts/TrackedItemsContext';
import {TrackerType} from '@/enums/TrackerType';
import type {TrackerItem} from '@/types/tracking';

export default function HomeScreen() {
    const {items} = useTrackedItems();
    const router = useRouter();
    const [isModalVisible, setModalVisible] = useState(false);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

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
        <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardVerticalOffset}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.heading}>My Tracking</Text>
                        <Text style={styles.subheading}>Stay accountable every day</Text>
                    </View>
                    <TouchableOpacity
                        accessibilityLabel="Add a tracker"
                        accessibilityRole="button"
                        onPress={() => setModalVisible(true)}
                        style={styles.addButton}
                    >
                        <Feather name="plus" size={24} color="#fff"/>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={listEmptyComponent}
                    renderItem={({item}: { item: TrackerItem }) => {
                        const handlePress = () => router.push({pathname: '/tracker/[id]', params: {id: item.id}});
                        if (item.type === TrackerType.ColdTurkey) {
                            return <ColdTurkeyListCard item={item} onPress={handlePress}/>;
                        }
                        return <DoseDecreaseListCard item={item} onPress={handlePress}/>;
                    }}
                />

                <CreateTrackerModal visible={isModalVisible} onClose={() => setModalVisible(false)}/>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoiding: {
        flex: 1,
    },
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