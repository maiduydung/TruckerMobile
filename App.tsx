import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DriverSelectScreen from './src/DriverSelectScreen';
import TripListScreen from './src/TripListScreen';
import TripScreen from './src/TripScreen';
import { TripRecord } from './src/api';

type Screen =
  | { name: 'driver-select' }
  | { name: 'trip-list'; driver: string }
  | { name: 'trip-form'; driver: string; editingTrip?: TripRecord | null; lastClosingBalance?: number };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'driver-select' });
  // Bump this to force TripListScreen to refetch
  const [listKey, setListKey] = useState(0);

  const goToDriverSelect = useCallback(() => {
    setScreen({ name: 'driver-select' });
  }, []);

  const goToTripList = useCallback((driver: string) => {
    setScreen({ name: 'trip-list', driver });
  }, []);

  const goToTripForm = useCallback((driver: string, editingTrip?: TripRecord | null, lastClosingBalance?: number) => {
    setScreen({ name: 'trip-form', driver, editingTrip, lastClosingBalance });
  }, []);

  const handleSaved = useCallback(() => {
    if (screen.name === 'trip-form') {
      setListKey(k => k + 1);
      goToTripList(screen.driver);
    }
  }, [screen, goToTripList]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen.name === 'driver-select' && (
        <DriverSelectScreen onSelect={(driver) => goToTripList(driver)} />
      )}
      {screen.name === 'trip-list' && (
        <TripListScreen
          key={listKey}
          driver={screen.driver}
          onBack={goToDriverSelect}
          onNewTrip={(lastClosingBalance) => goToTripForm(screen.driver, null, lastClosingBalance)}
          onEditTrip={(trip) => goToTripForm(screen.driver, trip)}
        />
      )}
      {screen.name === 'trip-form' && (
        <TripScreen
          driverName={screen.driver}
          editingTrip={screen.editingTrip}
          lastClosingBalance={screen.lastClosingBalance}
          onBack={() => goToTripList(screen.driver)}
          onSaved={handleSaved}
        />
      )}
    </SafeAreaProvider>
  );
}
