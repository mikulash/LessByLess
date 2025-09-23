import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import { TrackerType } from '@/enums/TrackerType';
import { TrackerTypeOption } from '@/types/tracking';

type TrackerDetailTemplateProps<ItemType> = {
  item: ItemType;
  nameInput: string;
  onNameChange: (value: string) => void;
  dateInput: string;
  onDateChange: (value: string) => void;
  selectedType: TrackerType;
  onSelectType: (type: TrackerType) => void;
  onSave: () => void;
  onDelete: () => void;
  disableSave: boolean;
  typeOptions: TrackerTypeOption[];
  renderSummary: (item: ItemType) => ReactNode;
  saveLabel?: string;
};

export function TrackerDetailTemplate<ItemType>({
  item,
  nameInput,
  onNameChange,
  dateInput,
  onDateChange,
  selectedType,
  onSelectType,
  onSave,
  onDelete,
  disableSave,
  typeOptions,
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

        <Text style={styles.inputLabel}>Start date</Text>
        <TextInput
          value={dateInput}
          onChangeText={onDateChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888"
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Type</Text>
        <View style={styles.typeSelector}>
          {typeOptions.map((type, index) => {
            const isSelected = selectedType === type.value;
            return (
              <TouchableOpacity
                key={type.value}
                onPress={() => onSelectType(type.value)}
                style={[
                  styles.typeOption,
                  index === typeOptions.length - 1 && styles.typeOptionLast,
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
            style={[styles.primaryButton, disableSave && styles.disabledButton]}
            onPress={onSave}
            disabled={disableSave}
          >
            <Text style={styles.primaryButtonText}>{saveLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
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
});

