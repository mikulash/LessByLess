import React from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import { TRACKER_TYPES } from '@/constants/trackerTypes';
import { TrackerType } from '@/enums/TrackerType';

type CreateTrackerModalProps = {
  visible: boolean;
  name: string;
  onNameChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  selectedType: TrackerType;
  onSelectType: (type: TrackerType) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CreateTrackerModal({
  visible,
  name,
  onNameChange,
  date,
  onDateChange,
  selectedType,
  onSelectType,
  onSave,
  onCancel,
}: CreateTrackerModalProps) {
  const isSaveDisabled = !name.trim();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create a tracker</Text>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder="What are you tracking?"
            placeholderTextColor="#888"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Start date</Text>
          <TextInput
            value={date}
            onChangeText={onDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#888"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeSelector}>
            {TRACKER_TYPES.map((type, index) => {
              const isSelected = selectedType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => onSelectType(type.value)}
                  style={[
                    styles.typeOption,
                    index === TRACKER_TYPES.length - 1 && styles.typeOptionLast,
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

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, isSaveDisabled && styles.disabledButton]}
              onPress={onSave}
              disabled={isSaveDisabled}
            >
              <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1f1f29',
    borderRadius: 20,
    width: '100%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#2a2a35',
  },
  saveButton: {
    backgroundColor: '#4c6ef5',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
  },
});

