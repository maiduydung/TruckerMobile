import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from './theme';
import { getTrips, deleteTrip, TripRecord } from './api';
import { showAlert, showConfirm } from './alert';

interface Props {
  driver: string;
  onBack: () => void;
  onNewTrip: () => void;
  onEditTrip: (trip: TripRecord) => void;
}

export default function TripListScreen({ driver, onBack, onNewTrip, onEditTrip }: Props) {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      const data = await getTrips(driver);
      setTrips(data);
    } catch {
      showAlert('Lỗi', 'Không thể tải danh sách chuyến.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driver]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const handleDelete = (trip: TripRecord) => {
    showConfirm(
      'Xóa chuyến',
      `Xóa chuyến ${trip.pickup_location} → ${trip.delivery_location}?`,
      async () => {
        try {
          await deleteTrip(trip.id);
          setTrips(prev => prev.filter(t => t.id !== trip.id));
        } catch {
          showAlert('Lỗi', 'Không thể xóa chuyến.');
        }
      },
      'Xóa',
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${hh}:${mm} - ${dd}/${mo}`;
  };

  const formatVnd = (amount: number) => {
    if (!amount) return '';
    return amount.toLocaleString('en-US') + 'đ';
  };

  const renderTrip = ({ item }: { item: TripRecord }) => {
    // Parse additional_costs total
    let additionalTotal = 0;
    try {
      const costs = typeof item.additional_costs === 'string'
        ? JSON.parse(item.additional_costs)
        : item.additional_costs;
      if (Array.isArray(costs)) {
        additionalTotal = costs.reduce((sum: number, c: any) => sum + (c.amountVnd || 0), 0);
      }
    } catch {}

    const totalCosts = item.fuel_nam_phat_vnd + item.loading_fee_vnd + additionalTotal;

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => onEditTrip(item)}
        activeOpacity={0.7}
      >
        <View style={styles.tripHeader}>
          <View style={styles.route}>
            <Text style={styles.routeText}>{item.pickup_location}</Text>
            <MaterialIcons name="arrow-forward" size={16} color={Colors.outline} />
            <Text style={styles.routeText}>{item.delivery_location}</Text>
          </View>
          <View style={[styles.statusBadge, item.is_draft ? styles.draftBadge : styles.doneBadge]}>
            <Text style={[styles.statusText, item.is_draft ? styles.draftText : styles.doneText]}>
              {item.is_draft ? 'Nháp' : 'Xong'}
            </Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <Text style={styles.detailText}>
            {formatTime(item.submitted_at)} | {item.pickup_weight_kg}kg → {item.delivery_weight_kg}kg
          </Text>
          {totalCosts > 0 && (
            <Text style={styles.costText}>Chi phí: {formatVnd(totalCosts)}</Text>
          )}
        </View>

        <View style={styles.tripActions}>
          <TouchableOpacity
            style={styles.editHint}
            onPress={() => onEditTrip(item)}
          >
            <MaterialIcons name="edit" size={16} color={Colors.primary} />
            <Text style={styles.editHintText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteHint}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{driver}</Text>
          <Text style={styles.headerSubtitle}>Chuyến gần đây</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Trip List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={renderTrip}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialIcons name="inbox" size={48} color={Colors.outline} />
              <Text style={styles.emptyText}>Chưa có chuyến nào</Text>
            </View>
          }
        />
      )}

      {/* New Trip Button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <TouchableOpacity style={styles.newTripButton} onPress={onNewTrip} activeOpacity={0.7}>
          <MaterialIcons name="add" size={20} color={Colors.white} />
          <Text style={styles.newTripText}>CHUYẾN MỚI</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.outline,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.outline,
  },
  tripCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  draftBadge: {
    backgroundColor: '#fff3cd',
  },
  doneBadge: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  draftText: {
    color: '#856404',
  },
  doneText: {
    color: '#155724',
  },
  tripDetails: {
    gap: 2,
  },
  detailText: {
    fontSize: 13,
    color: Colors.outline,
  },
  costText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  tripActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editHintText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  deleteHint: {
    padding: 4,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.slateBorder,
  },
  newTripButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newTripText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
