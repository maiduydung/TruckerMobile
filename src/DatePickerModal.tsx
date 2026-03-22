import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from './theme';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title: string;
}

export function DatePickerModal({ visible, value, minimumDate, onConfirm, onCancel, title }: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState(value);

  // Sync tempDate when modal opens with a new value
  React.useEffect(() => {
    if (visible) setTempDate(value);
  }, [visible, value]);

  if (Platform.OS === 'android') {
    // Android shows its own native dialog, no modal wrapper needed
    if (!visible) return null;
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        minimumDate={minimumDate}
        onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (_event.type === 'dismissed') {
            onCancel();
          } else if (selectedDate) {
            onConfirm(selectedDate);
          }
        }}
      />
    );
  }

  // iOS: wrap in a bottom sheet modal with Done/Cancel
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={styles.sheet}>
          {/* Header with Cancel / Title / Done */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Huỷ</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={styles.doneText}>Xong</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            minimumDate={minimumDate}
            onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
              if (selectedDate) setTempDate(selectedDate);
            }}
            style={{ height: 200 }}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slateBorder,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.slateText,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
