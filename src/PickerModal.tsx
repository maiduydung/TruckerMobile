import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from './theme';

interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onAdd?: (value: string) => void;
}

export function PickerModal({ visible, onClose, title, options, selected, onSelect, onAdd }: PickerModalProps) {
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    const trimmed = newValue.trim().toUpperCase();
    if (trimmed && !options.includes(trimmed) && onAdd) {
      onAdd(trimmed);
    }
    setNewValue('');
    setAdding(false);
  };

  const handleClose = () => {
    setAdding(false);
    setNewValue('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {onAdd && !adding && (
              <TouchableOpacity style={styles.addButton} onPress={() => setAdding(true)}>
                <MaterialIcons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            )}
          </View>
          {adding && (
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Nhập mã địa điểm..."
                placeholderTextColor={Colors.outline}
                value={newValue}
                onChangeText={setNewValue}
                autoFocus
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.addConfirm} onPress={handleAdd}>
                <Text style={styles.addConfirmText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setAdding(false); setNewValue(''); }}>
                <MaterialIcons name="close" size={20} color={Colors.outline} />
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={options}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, selected === item && styles.optionSelected]}
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.optionText, selected === item && styles.optionTextSelected]}>
                  {item}
                </Text>
                {selected === item && (
                  <MaterialIcons name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
  },
  addConfirm: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slateBorder,
  },
  optionSelected: {
    backgroundColor: Colors.slateLight,
  },
  optionText: {
    fontSize: 15,
    color: Colors.onSurface,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
