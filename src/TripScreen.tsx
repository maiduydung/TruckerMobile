import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from './theme';
import { TripFormData, FIXED_COSTS, PICKUP_LOCATIONS, DELIVERY_LOCATIONS } from './types';
import { formatNumber, parseNumber } from './utils';
import { PickerModal } from './PickerModal';
import { DatePickerModal } from './DatePickerModal';
import { buildPayload, submitTrip, updateTrip, sumFormCosts, TripRecord } from './api';
import { showAlert, showConfirm } from './alert';

export interface TripScreenProps {
  driverName: string;
  editingTrip?: TripRecord | null;
  onBack: () => void;
  onSaved: () => void;
}

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
  onBadgePress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  badge?: string;
  badgeBg?: string;
  badgeText?: string;
  onBadgePress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {badge && (
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: badgeBg }]}
          onPress={onBadgePress}
          disabled={!onBadgePress}
          activeOpacity={onBadgePress ? 0.6 : 1}
        >
          <Text style={[styles.badgeText, { color: badgeText }]}>{badge}</Text>
        </TouchableOpacity>
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

// Map name→key for loading from API
const COST_NAME_TO_KEY: Record<string, keyof TripFormData> = {};
FIXED_COSTS.forEach(c => { COST_NAME_TO_KEY[c.label] = c.key; });

function tripRecordToForm(trip: TripRecord, driverName: string): TripFormData {
  const fmtNum = (n: number) => n ? n.toLocaleString('en-US') : '';
  const fmtVnd = (n: number) => n ? fmtNum(Math.round(n / 1000)) : '';

  let costs: { name: string; amountVnd: number; note: string }[] = [];
  try {
    costs = typeof trip.additional_costs === 'string'
      ? JSON.parse(trip.additional_costs)
      : trip.additional_costs;
  } catch {}

  // Start with empty cost fields
  const costFields: Record<string, string> = {};
  FIXED_COSTS.forEach(c => { costFields[c.key] = ''; });
  let costKhacNote = '';

  // Fill from API data
  if (Array.isArray(costs)) {
    costs.forEach(c => {
      const key = COST_NAME_TO_KEY[c.name];
      if (key) {
        costFields[key as string] = fmtVnd(c.amountVnd);
        if (key === 'costKhac') costKhacNote = c.note || '';
      }
    });
  }

  return {
    driverName,
    advancePayment: fmtVnd(trip.advance_payment),
    openingBalance: fmtVnd(trip.opening_balance),
    pickupDate: new Date(trip.pickup_date),
    pickupLocation: trip.pickup_location || PICKUP_LOCATIONS[0],
    pickupWeight: fmtNum(trip.pickup_weight_kg),
    deliveryDate: new Date(trip.delivery_date),
    deliveryLocation: trip.delivery_location || DELIVERY_LOCATIONS[0],
    deliveryWeight: fmtNum(trip.delivery_weight_kg),
    fuelNamPhat: fmtVnd(trip.fuel_nam_phat_vnd),
    fuelHN: fmtNum(trip.fuel_hn_liters),
    loadingFee: fmtVnd(trip.loading_fee_vnd),
    ...costFields as any,
    costKhacNote,
    notes: trip.notes || '',
  };
}

function defaultForm(driverName: string): TripFormData {
  return {
    driverName,
    advancePayment: '',
    openingBalance: '',
    pickupDate: new Date(),
    pickupLocation: PICKUP_LOCATIONS[0],
    pickupWeight: '',
    deliveryDate: new Date(),
    deliveryLocation: DELIVERY_LOCATIONS[0],
    deliveryWeight: '',
    fuelNamPhat: '',
    fuelHN: '',
    loadingFee: '',
    costXeXuc: '',
    costLoHoi: '',
    costCanXe: '',
    costCom: '',
    costBoiDuongCan: '',
    costBaoVe: '',
    costVaVo: '',
    costRuaXe: '',
    costKhac: '',
    costKhacNote: '',
    notes: '',
  };
}

export default function TripScreen({ driverName, editingTrip, onBack, onSaved }: TripScreenProps) {
  const isEditing = !!editingTrip;
  const [tripId, setTripId] = useState<string | null>(editingTrip?.id ?? null);

  const [form, setForm] = useState<TripFormData>(() =>
    editingTrip ? tripRecordToForm(editingTrip, driverName) : defaultForm(driverName),
  );

  const [showPickupDate, setShowPickupDate] = useState(false);
  const [showDeliveryDate, setShowDeliveryDate] = useState(false);
  const [showPickupLocationPicker, setShowPickupLocationPicker] = useState(false);
  const [showDeliveryLocationPicker, setShowDeliveryLocationPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateForm = useCallback(<K extends keyof TripFormData>(key: K, value: TripFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
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
    if (form.deliveryDate < date) {
      updateForm('deliveryDate', date);
    }
    setShowPickupDate(false);
  };

  const handleDeliveryDateConfirm = (date: Date) => {
    updateForm('deliveryDate', date);
    setShowDeliveryDate(false);
  };

  const saveTrip = async (isDraft: boolean) => {
    setSubmitting(true);
    try {
      const payload = buildPayload(form, isDraft, null, null);
      if (tripId) {
        await updateTrip(tripId, payload);
      } else {
        const result = await submitTrip(payload);
        setTripId(result.tripId);
      }
      return true;
    } catch {
      showAlert('Lỗi', 'Không thể lưu dữ liệu. Vui lòng thử lại.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const ok = await saveTrip(true);
    if (ok) {
      showAlert('Lưu tạm', 'Chuyến đi đã được lưu tạm thành công!', () => onSaved());
    }
  };

  const doComplete = async () => {
    const ok = await saveTrip(false);
    if (ok) {
      showAlert('Hoàn tất', 'Chuyến đi đã được hoàn tất!', () => onSaved());
    }
  };

  const handleComplete = () => {
    const pickupKg = parseNumber(form.pickupWeight);
    const deliveryKg = parseNumber(form.deliveryWeight);
    if (pickupKg > 0 && deliveryKg > 0 && Math.abs(pickupKg - deliveryKg) > 1000) {
      showAlert(
        'Sai số lượng',
        `Chênh lệch giữa lấy (${form.pickupWeight} kg) và giao (${form.deliveryWeight} kg) không được quá 1,000 kg.`
      );
      return;
    }

    showConfirm(
      'Xác nhận hoàn tất chuyến',
      `${form.pickupLocation} → ${form.deliveryLocation}\nBạn chắc chắn muốn hoàn tất chuyến này?`,
      () => doComplete(),
      'Hoàn tất',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Sửa chuyến' : 'Chuyến mới'}</Text>
        <View style={{ width: 40 }} />
      </View>

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
            <View style={[styles.input, { backgroundColor: Colors.slateLight }]}>
              <Text style={styles.inputText}>{driverName}</Text>
            </View>

            <Label text="TIỀN ỨNG TRƯỚC (đơn vị: 1,000 VNĐ)" />
            <Input
              placeholder="0"
              value={form.advancePayment}
              onChangeText={handleAdvancePayment}
              keyboardType="number-pad"
              style={{ color: Colors.primary, fontWeight: '700' }}
            />

            <Label text="DƯ ĐẦU (đơn vị: 1,000 VNĐ)" />
            <Input
              placeholder="0"
              value={form.openingBalance}
              onChangeText={v => updateForm('openingBalance', formatNumber(v))}
              keyboardType="number-pad"
              style={{ color: Colors.tertiary, fontWeight: '700' }}
            />
          </SectionCard>

          {/* Pickup */}
          <SectionCard>
            <SectionHeader
              icon="upload"
              iconColor={Colors.tertiary}
              title="LẤY HÀNG"
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
            <Label text="DẦU NAM PHÁT (đơn vị: 1,000 VNĐ)" />
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

            <Label text="PHÍ BẾN BÃI / BỐC XẾP (đơn vị: 1,000 VNĐ)" />
            <Input
              placeholder="0"
              value={form.loadingFee}
              onChangeText={v => updateForm('loadingFee', formatNumber(v))}
              keyboardType="number-pad"
              style={{ color: Colors.primary, fontWeight: '700' }}
            />
          </SectionCard>

          {/* Fixed Cost Items */}
          <SectionCard>
            <SectionHeader icon="list-alt" iconColor={Colors.secondary} title="CHI PHÍ PHÁT SINH (x1,000đ)" />
            {FIXED_COSTS.map(({ key, label }) => (
              <View key={key} style={{ marginTop: 8 }}>
                <Label text={label.toUpperCase()} />
                <Input
                  placeholder="0"
                  value={form[key] as string}
                  onChangeText={v => updateForm(key, formatNumber(v))}
                  keyboardType="number-pad"
                  style={{ color: Colors.primary, fontWeight: '700' }}
                />
                {key === 'costKhac' && parseNumber(form.costKhac) > 0 && (
                  <>
                    <Label text="GHI CHÚ CHI PHÍ KHÁC" />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mô tả chi phí khác..."
                      placeholderTextColor={Colors.outline}
                      value={form.costKhacNote}
                      onChangeText={v => updateForm('costKhacNote', v)}
                    />
                  </>
                )}
              </View>
            ))}
          </SectionCard>

          {/* Notes */}
          <SectionCard>
            <SectionHeader icon="notes" iconColor={Colors.outline} title="GHI CHÚ" />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Nhập ghi chú chuyến đi..."
              placeholderTextColor={Colors.outline}
              value={form.notes}
              onChangeText={v => updateForm('notes', v)}
              multiline
            />
          </SectionCard>

          {/* Summary */}
          {(() => {
            const totalCost = sumFormCosts(form);
            const closingBalance = parseNumber(form.openingBalance) - totalCost;
            const fmtSigned = (n: number) => {
              const prefix = n < 0 ? '-' : '';
              return prefix + Math.abs(n).toLocaleString('en-US');
            };
            const fuelNP = parseNumber(form.fuelNamPhat);
            const loading = parseNumber(form.loadingFee);
            const items: { label: string; value: number }[] = [];
            if (fuelNP) items.push({ label: 'Dầu Nam Phát', value: fuelNP });
            if (loading) items.push({ label: 'Bến bãi / Bốc xếp', value: loading });
            FIXED_COSTS.forEach(c => {
              const v = parseNumber(form[c.key] as string);
              if (v) items.push({ label: c.label, value: v });
            });
            return (
              <SectionCard>
                <SectionHeader icon="calculate" iconColor={Colors.secondary} title="TỔNG KẾT" />
                {items.map((item, i) => (
                  <View key={i} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownValue}>{item.value.toLocaleString('en-US')}</Text>
                  </View>
                ))}
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: Colors.slateBorder, paddingTop: 8, marginTop: 4 }]}>
                  <Text style={styles.summaryLabel}>TỔNG CHI PHÍ (x1,000đ)</Text>
                  <Text style={styles.summaryValue}>
                    {totalCost.toLocaleString('en-US')}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: Colors.slateBorder, paddingTop: 8 }]}>
                  <Text style={styles.summaryLabel}>DƯ CUỐI (x1,000đ)</Text>
                  <Text style={[styles.summaryValue, {
                    color: closingBalance < 0 ? Colors.error : Colors.tertiary
                  }]}>
                    {fmtSigned(closingBalance)}
                  </Text>
                </View>
              </SectionCard>
            );
          })()}
        </ScrollView>

        {/* Bottom Action Bar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft} activeOpacity={0.7} disabled={submitting}>
            {submitting ? <ActivityIndicator size="small" color={Colors.slateText} /> : <Text style={styles.draftButtonText}>LƯU TẠM</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.7} disabled={submitting}>
            {submitting ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.completeButtonText}>HOÀN TẤT CHUYẾN</Text>}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slateBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
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
    marginBottom: 4,
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
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  breakdownLabel: {
    fontSize: 13,
    color: Colors.outline,
  },
  breakdownValue: {
    fontSize: 13,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
});
