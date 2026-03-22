import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from './theme';
import { TripFormData, AdditionalCost, DRIVERS, PICKUP_LOCATIONS, DELIVERY_LOCATIONS } from './types';
import { formatNumber, parseNumber, generateId } from './utils';
import { PickerModal } from './PickerModal';
import { DatePickerModal } from './DatePickerModal';

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SectionHeader({
  icon,
  iconColor,
  title,
  badge,
  badgeBg,
  badgeText,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  badge?: string;
  badgeBg?: string;
  badgeText?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeText }]}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Input({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  style,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
  style?: object;
}) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      placeholderTextColor={Colors.outline}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  );
}

export default function TripScreen() {
  const [form, setForm] = useState<TripFormData>({
    driverName: '',
    advancePayment: '2,000,000',
    pickupDate: new Date(),
    pickupLocation: PICKUP_LOCATIONS[0],
    pickupWeight: '',
    deliveryDate: new Date(),
    deliveryLocation: DELIVERY_LOCATIONS[0],
    deliveryWeight: '',
    fuelNamPhat: '',
    fuelHN: '',
    loadingFee: '',
    additionalCosts: [{ id: generateId(), name: '', amount: '', note: '' }],
    notes: '',
  });

  const [showPickupDate, setShowPickupDate] = useState(false);
  const [showDeliveryDate, setShowDeliveryDate] = useState(false);
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [showPickupLocationPicker, setShowPickupLocationPicker] = useState(false);
  const [showDeliveryLocationPicker, setShowDeliveryLocationPicker] = useState(false);

  const updateForm = useCallback(<K extends keyof TripFormData>(key: K, value: TripFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateAdditionalCost = useCallback((id: string, field: keyof AdditionalCost, value: string) => {
    setForm(prev => ({
      ...prev,
      additionalCosts: prev.additionalCosts.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  }, []);

  const addAdditionalCost = useCallback(() => {
    setForm(prev => ({
      ...prev,
      additionalCosts: [...prev.additionalCosts, { id: generateId(), name: '', amount: '', note: '' }],
    }));
  }, []);

  const removeAdditionalCost = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      additionalCosts: prev.additionalCosts.filter(c => c.id !== id),
    }));
  }, []);

  const handleAdvancePayment = (text: string) => {
    updateForm('advancePayment', formatNumber(text));
  };

  const formatDate = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const handlePickupDateConfirm = (date: Date) => {
    updateForm('pickupDate', date);
    // If delivery date is before new pickup date, bump it
    if (form.deliveryDate < date) {
      updateForm('deliveryDate', date);
    }
    setShowPickupDate(false);
  };

  const handleDeliveryDateConfirm = (date: Date) => {
    updateForm('deliveryDate', date);
    setShowDeliveryDate(false);
  };

  const handleSaveDraft = () => {
    Alert.alert('Lưu tạm', 'Chuyến đi đã được lưu tạm thành công!');
  };

  const handleComplete = () => {
    if (!form.driverName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn tài xế.');
      return;
    }
    const pickup = parseNumber(form.pickupWeight);
    const delivery = parseNumber(form.deliveryWeight);
    if (pickup > 0 && delivery > 0 && Math.abs(pickup - delivery) > 1000) {
      Alert.alert(
        'Sai số lượng',
        `Chênh lệch giữa lấy (${form.pickupWeight} kg) và giao (${form.deliveryWeight} kg) không được quá 1,000 kg.`
      );
      return;
    }
    Alert.alert('Hoàn tất', 'Chuyến đi đã được hoàn tất!');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Driver Info */}
          <SectionCard>
            <SectionHeader icon="person" iconColor={Colors.primary} title="Thông tin tài xế" />
            <Label text="TÊN TÀI XẾ" />
            <TouchableOpacity style={styles.input} onPress={() => setShowDriverPicker(true)}>
              <Text style={form.driverName ? styles.inputText : styles.placeholderText}>
                {form.driverName || 'Chọn tài xế...'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.outline} />
            </TouchableOpacity>

            <Label text="TIỀN ỨNG TRƯỚC (VNĐ)" />
            <Input
              placeholder="0"
              value={form.advancePayment}
              onChangeText={handleAdvancePayment}
              keyboardType="number-pad"
              style={{ color: Colors.primary, fontWeight: '700' }}
            />
          </SectionCard>

          {/* Pickup */}
          <SectionCard>
            <SectionHeader
              icon="upload"
              iconColor={Colors.tertiary}
              title="LẤY HÀNG"
              badge="BẮT ĐẦU"
              badgeBg={Colors.tertiaryFixedBg}
              badgeText={Colors.tertiaryFixedText}
            />
            <Label text="NGÀY LẤY" />
            <TouchableOpacity style={styles.input} onPress={() => setShowPickupDate(true)}>
              <Text style={styles.inputText}>{formatDate(form.pickupDate)}</Text>
              <MaterialIcons name="calendar-today" size={18} color={Colors.outline} />
            </TouchableOpacity>

            <Label text="NƠI LẤY" />
            <TouchableOpacity style={styles.input} onPress={() => setShowPickupLocationPicker(true)}>
              <Text style={styles.inputText}>{form.pickupLocation}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.outline} />
            </TouchableOpacity>

            <Label text="SỐ LƯỢNG LẤY (KG)" />
            <Input
              placeholder="Nhập khối lượng..."
              value={form.pickupWeight}
              onChangeText={v => updateForm('pickupWeight', formatNumber(v))}
              keyboardType="number-pad"
            />
          </SectionCard>

          {/* Delivery */}
          <SectionCard>
            <SectionHeader
              icon="download"
              iconColor={Colors.primary}
              title="GIAO HÀNG"
              badge="KẾT THÚC"
              badgeBg={Colors.primaryFixedBg}
              badgeText={Colors.primaryFixedText}
            />
            <Label text="NGÀY GIAO" />
            <TouchableOpacity style={styles.input} onPress={() => setShowDeliveryDate(true)}>
              <Text style={styles.inputText}>{formatDate(form.deliveryDate)}</Text>
              <MaterialIcons name="calendar-today" size={18} color={Colors.outline} />
            </TouchableOpacity>

            <Label text="NƠI GIAO" />
            <TouchableOpacity style={styles.input} onPress={() => setShowDeliveryLocationPicker(true)}>
              <Text style={styles.inputText}>{form.deliveryLocation}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.outline} />
            </TouchableOpacity>

            <Label text="SỐ LƯỢNG GIAO (KG)" />
            <Input
              placeholder="Nhập khối lượng..."
              value={form.deliveryWeight}
              onChangeText={v => updateForm('deliveryWeight', formatNumber(v))}
              keyboardType="number-pad"
            />
          </SectionCard>

          {/* Costs & Fuel */}
          <SectionCard>
            <SectionHeader icon="receipt-long" iconColor={Colors.secondary} title="CHI PHÍ & DẦU" />
            <Label text="DẦU NAM PHÁT (VNĐ)" />
            <Input
              placeholder="0"
              value={form.fuelNamPhat}
              onChangeText={v => updateForm('fuelNamPhat', formatNumber(v))}
              keyboardType="number-pad"
              style={{ color: Colors.primary, fontWeight: '700' }}
            />

            <Label text="DẦU HN (LÍT)" />
            <Input
              placeholder="0"
              value={form.fuelHN}
              onChangeText={v => updateForm('fuelHN', formatNumber(v))}
              keyboardType="number-pad"
            />

            <Label text="PHÍ BẾN BÃI / BỐC XẾP (VNĐ)" />
            <Input
              placeholder="0"
              value={form.loadingFee}
              onChangeText={v => updateForm('loadingFee', formatNumber(v))}
              keyboardType="number-pad"
              style={{ color: Colors.primary, fontWeight: '700' }}
            />

            {/* Additional Costs */}
            <View style={styles.additionalCostsHeader}>
              <Text style={styles.additionalCostsTitle}>CHI PHÍ PHÁT SINH</Text>
              <TouchableOpacity style={styles.addButton} onPress={addAdditionalCost}>
                <MaterialIcons name="add-circle" size={16} color={Colors.primary} />
                <Text style={styles.addButtonText}>Thêm chi phí</Text>
              </TouchableOpacity>
            </View>

            {form.additionalCosts.map((cost) => (
              <View key={cost.id} style={styles.additionalCostCard}>
                {form.additionalCosts.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeCostButton}
                    onPress={() => removeAdditionalCost(cost.id)}
                  >
                    <MaterialIcons name="close" size={16} color={Colors.error} />
                  </TouchableOpacity>
                )}
                <View style={styles.additionalCostRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.smallLabel}>TÊN CHI PHÍ</Text>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="Ví dụ: Cầu đường"
                      placeholderTextColor={Colors.outline}
                      value={cost.name}
                      onChangeText={v => updateAdditionalCost(cost.id, 'name', v)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.smallLabel}>SỐ TIỀN (VNĐ)</Text>
                    <TextInput
                      style={[styles.smallInput, { color: Colors.primary, fontWeight: '700' }]}
                      placeholder="0"
                      placeholderTextColor={Colors.outline}
                      value={cost.amount}
                      onChangeText={v => updateAdditionalCost(cost.id, 'amount', formatNumber(v))}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <Text style={styles.smallLabel}>GHI CHÚ PHÍ</Text>
                <TextInput
                  style={styles.smallInput}
                  placeholder="Nhập ghi chú cho khoản phí này..."
                  placeholderTextColor={Colors.outline}
                  value={cost.note}
                  onChangeText={v => updateAdditionalCost(cost.id, 'note', v)}
                />
              </View>
            ))}

            {/* Notes */}
            <Label text="GHI CHÚ" />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Nhập ghi chú chuyến đi..."
              placeholderTextColor={Colors.outline}
              value={form.notes}
              onChangeText={v => updateForm('notes', v)}
              multiline
            />
          </SectionCard>
        </ScrollView>

        {/* Bottom Action Bar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft} activeOpacity={0.7}>
            <Text style={styles.draftButtonText}>LƯU TẠM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.7}>
            <Text style={styles.completeButtonText}>HOÀN TẤT CHUYẾN</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showPickupDate}
        value={form.pickupDate}
        title="Ngày lấy"
        onConfirm={handlePickupDateConfirm}
        onCancel={() => setShowPickupDate(false)}
      />
      <DatePickerModal
        visible={showDeliveryDate}
        value={form.deliveryDate}
        title="Ngày giao"
        minimumDate={form.pickupDate}
        onConfirm={handleDeliveryDateConfirm}
        onCancel={() => setShowDeliveryDate(false)}
      />

      {/* Picker Modals */}
      <PickerModal
        visible={showDriverPicker}
        onClose={() => setShowDriverPicker(false)}
        title="Chọn tài xế"
        options={DRIVERS}
        selected={form.driverName}
        onSelect={v => { updateForm('driverName', v); setShowDriverPicker(false); }}
      />
      <PickerModal
        visible={showPickupLocationPicker}
        onClose={() => setShowPickupLocationPicker(false)}
        title="Nơi lấy"
        options={PICKUP_LOCATIONS}
        selected={form.pickupLocation}
        onSelect={v => { updateForm('pickupLocation', v); setShowPickupLocationPicker(false); }}
      />
      <PickerModal
        visible={showDeliveryLocationPicker}
        onClose={() => setShowDeliveryLocationPicker(false)}
        title="Nơi giao"
        options={DELIVERY_LOCATIONS}
        selected={form.deliveryLocation}
        onSelect={v => { updateForm('deliveryLocation', v); setShowDeliveryLocationPicker(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.onSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 15,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.outline,
    fontWeight: '600',
  },
  additionalCostsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.slateBorder,
  },
  additionalCostsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  additionalCostCard: {
    backgroundColor: Colors.slateLight,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.slateBorder,
  },
  removeCostButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  additionalCostRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.slateBorder,
  },
  draftButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.slateLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slateText,
  },
  completeButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
