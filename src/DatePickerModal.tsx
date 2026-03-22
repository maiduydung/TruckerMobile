import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors } from './theme';

// Only import native picker on non-web platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title: string;
}

function formatDateInput(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function DatePickerModal({ visible, value, minimumDate, onConfirm, onCancel, title }: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState(value);

  React.useEffect(() => {
    if (visible) setTempDate(value);
  }, [visible, value]);

  // ── Web: HTML date input in a modal ──
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => onConfirm(tempDate)}>
                <Text style={styles.doneText}>Xong</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.webInputContainer}>
              <TextInput
                style={styles.webDateInput}
                value={formatDateInput(tempDate)}
                onChangeText={(text) => {
                  const parsed = new Date(text + 'T00:00:00');
                  if (!isNaN(parsed.getTime())) setTempDate(parsed);
                }}
                // @ts-ignore – web-only props
                type="date"
                min={minimumDate ? formatDateInput(minimumDate) : undefined}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  // ── Android: native dialog ──
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        minimumDate={minimumDate}
        onChange={(_event: any, selectedDate?: Date) => {
          if (_event.type === 'dismissed') {
            onCancel();
          } else if (selectedDate) {
            onConfirm(selectedDate);
          }
        }}
      />
    );
  }

  // ── iOS: spinner in bottom sheet ──
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={styles.sheet}>
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
            onChange={(_event: any, selectedDate?: Date) => {
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
  webInputContainer: {
    padding: 20,
    alignItems: 'center',
  },
  webDateInput: {
    fontSize: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',
  },
});
