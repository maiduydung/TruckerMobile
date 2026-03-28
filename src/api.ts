import Config from './config';
import { GpsCoordinates } from './gps';
import { parseNumber } from './utils';

// ── Payload sent to Azure Function / Container App ──

export interface TripPayload {
  // Driver
  driverName: string;
  advancePayment: number;

  // Pickup
  pickupDate: string;          // ISO 8601
  pickupLocation: string;
  pickupWeightKg: number;
  pickupGps: GpsCoordinates | null;

  // Delivery
  deliveryDate: string;        // ISO 8601
  deliveryLocation: string;
  deliveryWeightKg: number;
  deliveryGps: GpsCoordinates | null;

  // Costs
  fuelNamPhatVnd: number;
  fuelHnLiters: number;
  loadingFeeVnd: number;
  additionalCosts: {
    name: string;
    amountVnd: number;
    note: string;
  }[];

  // Meta
  notes: string;
  isDraft: boolean;
  submittedAt: string;         // ISO 8601
}

// ── Build payload from form state ──

export function buildPayload(
  form: {
    driverName: string;
    advancePayment: string;
    pickupDate: Date;
    pickupLocation: string;
    pickupWeight: string;
    deliveryDate: Date;
    deliveryLocation: string;
    deliveryWeight: string;
    fuelNamPhat: string;
    fuelHN: string;
    loadingFee: string;
    additionalCosts: { name: string; amount: string; note: string }[];
    notes: string;
  },
  isDraft: boolean,
  pickupGps: GpsCoordinates | null,
  deliveryGps: GpsCoordinates | null,
): TripPayload {
  return {
    driverName: form.driverName,
    advancePayment: parseNumber(form.advancePayment) * 1000,

    pickupDate: form.pickupDate.toISOString(),
    pickupLocation: form.pickupLocation,
    pickupWeightKg: parseNumber(form.pickupWeight),
    pickupGps,

    deliveryDate: form.deliveryDate.toISOString(),
    deliveryLocation: form.deliveryLocation,
    deliveryWeightKg: parseNumber(form.deliveryWeight),
    deliveryGps,

    fuelNamPhatVnd: parseNumber(form.fuelNamPhat) * 1000,
    fuelHnLiters: parseNumber(form.fuelHN),
    loadingFeeVnd: parseNumber(form.loadingFee) * 1000,
    additionalCosts: form.additionalCosts.map((c) => ({
      name: c.name,
      amountVnd: parseNumber(c.amount) * 1000,
      note: c.note,
    })),

    notes: form.notes,
    isDraft,
    submittedAt: new Date().toISOString(),
  };
}

// ── API calls ──

export async function submitTrip(payload: TripPayload): Promise<{ tripId: string }> {
  const url = `${Config.apiBaseUrl}${Config.endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  return res.json();
}

export async function updateTrip(tripId: string, payload: TripPayload): Promise<void> {
  const url = `${Config.apiBaseUrl}${Config.endpoint}/${tripId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
}

export async function getTrips(driver: string, sinceDays: number = 2): Promise<TripRecord[]> {
  const params = new URLSearchParams({
    driver,
    includeDrafts: 'true',
    sinceDays: String(sinceDays),
  });
  const url = `${Config.apiBaseUrl}${Config.endpoint}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  const data = await res.json();
  return data.trips;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const url = `${Config.apiBaseUrl}${Config.endpoint}/${tripId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
}

// ── Trip record from backend ──

export interface TripRecord {
  id: string;
  driver_name: string;
  advance_payment: number;
  pickup_date: string;
  pickup_location: string;
  pickup_weight_kg: number;
  delivery_date: string;
  delivery_location: string;
  delivery_weight_kg: number;
  fuel_nam_phat_vnd: number;
  fuel_hn_liters: number;
  loading_fee_vnd: number;
  additional_costs: string | { name: string; amountVnd: number; note: string }[];
  notes: string;
  is_draft: boolean;
  submitted_at: string;
}
