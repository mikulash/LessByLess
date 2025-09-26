import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Themed';

type TrackerDetailTemplateProps<ItemType> = {
  item: ItemType;
  nameInput: string;
  onNameChange: (value: string) => void;
  startDateDisplay: string;
  onSave: () => void;
  onResetDate: () => void;
  onDelete: () => void;
  disableSave: boolean;
  renderSummary: (item: ItemType) => ReactNode;
  saveLabel?: string;
};

export function TrackerDetailTemplate<ItemType>({
  item,
  nameInput,
  onNameChange,
  startDateDisplay,
  onSave,
  onResetDate,
  onDelete,
  disableSave,
  renderSummary,
  saveLabel = 'Save changes',
}: TrackerDetailTemplateProps<ItemType>) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {renderSummary(item)}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit tracker</Text>

        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          value={nameInput}
          onChangeText={onNameChange}
          placeholder="What are you tracking?"
          placeholderTextColor="#888"
          style={styles.input}
        />


        <View style={styles.sectionActions}>
          <TouchableOpacity
            style={[styles.primaryButton, disableSave && styles.disabledButton]}
            onPress={onSave}
            disabled={disableSave}
          >
            <Text style={styles.primaryButtonText}>{saveLabel}</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.resetButton} onPress={onResetDate}>
              <Text style={styles.secondaryButtonText}>Reset start date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.secondaryButtonText}>Delete tracker</Text>
            </TouchableOpacity>
          </View>
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
  section: {
    backgroundColor: '#18181f',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#2a2a35',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readonlyField: {
    backgroundColor: '#2a2a35',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readonlyText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionActions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#fa834cff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#d64545',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

