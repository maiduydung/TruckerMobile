import Config from './config';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export async function captureGps(): Promise<GpsCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not available');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.warn('GPS error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: Config.gps.enableHighAccuracy,
        timeout: Config.gps.timeoutMs,
        maximumAge: Config.gps.maxAgeMs,
      },
    );
  });
}
