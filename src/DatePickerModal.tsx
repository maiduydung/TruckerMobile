import React, { useState, createElement } from 'react';
import {
  View,
  Text,
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

  // ── Web: pure HTML elements to avoid RN Web swallowing clicks ──
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return createElement('div', {
      onClick: (e: any) => { if (e.target === e.currentTarget) onCancel(); },
      style: {
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 9999,
      },
    },
      createElement('div', {
        onClick: (e: any) => e.stopPropagation(),
        style: {
          width: '100%',
          backgroundColor: Colors.white,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 40,
        },
      },
        // Header row
        createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${Colors.slateBorder}`,
          },
        },
          createElement('span', {
            onClick: onCancel,
            style: { fontSize: 15, color: Colors.slateText, cursor: 'pointer' },
          }, 'Huỷ'),
          createElement('span', {
            style: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
          }, title),
          createElement('span', {
            onClick: () => onConfirm(tempDate),
            style: { fontSize: 15, fontWeight: '700', color: Colors.primary, cursor: 'pointer' },
          }, 'Xong'),
        ),
        // Date input
        createElement('div', {
          style: { padding: 20, display: 'flex', justifyContent: 'center' },
        },
          createElement('input', {
            type: 'date',
            value: formatDateInput(tempDate),
            min: minimumDate ? formatDateInput(minimumDate) : undefined,
            onChange: (e: any) => {
              const parsed = new Date(e.target.value + 'T00:00:00');
              if (!isNaN(parsed.getTime())) setTempDate(parsed);
            },
            style: {
              fontSize: 18,
              padding: 12,
              border: `1px solid ${Colors.outlineVariant}`,
              borderRadius: 10,
              width: '100%',
              textAlign: 'center' as const,
            },
          }),
        ),
      ),
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
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
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
});
