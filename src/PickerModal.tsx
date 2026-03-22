import React from 'react';
import {
  View,
  Text,
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
}

export function PickerModal({ visible, onClose, title, options, selected, onSelect }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    paddingHorizontal: 20,
    marginBottom: 8,
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
