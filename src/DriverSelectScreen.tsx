import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from './theme';
import { DRIVERS } from './types';

interface Props {
  onSelect: (driver: string) => void;
}

export default function DriverSelectScreen({ onSelect }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="local-shipping" size={40} color={Colors.primary} />
          <Text style={styles.title}>Chọn tài xế</Text>
          <Text style={styles.subtitle}>Chọn tên của bạn để bắt đầu</Text>
        </View>

        <View style={styles.buttons}>
          {DRIVERS.map((driver) => (
            <TouchableOpacity
              key={driver}
              style={styles.driverButton}
              onPress={() => onSelect(driver)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={24} color={Colors.primary} />
              <Text style={styles.driverText}>{driver}</Text>
              <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.outline,
  },
  buttons: {
    gap: 12,
  },
  driverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  driverText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
});
