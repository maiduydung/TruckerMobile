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
    advancePayment: parseNumber(form.advancePayment),

    pickupDate: form.pickupDate.toISOString(),
    pickupLocation: form.pickupLocation,
    pickupWeightKg: parseNumber(form.pickupWeight),
    pickupGps,

    deliveryDate: form.deliveryDate.toISOString(),
    deliveryLocation: form.deliveryLocation,
    deliveryWeightKg: parseNumber(form.deliveryWeight),
    deliveryGps,

    fuelNamPhatVnd: parseNumber(form.fuelNamPhat),
    fuelHnLiters: parseNumber(form.fuelHN),
    loadingFeeVnd: parseNumber(form.loadingFee),
    additionalCosts: form.additionalCosts.map((c) => ({
      name: c.name,
      amountVnd: parseNumber(c.amount),
      note: c.note,
    })),

    notes: form.notes,
    isDraft,
    submittedAt: new Date().toISOString(),
  };
}

// ── API call ──

export async function submitTrip(payload: TripPayload): Promise<Response> {
  const url = `${Config.apiBaseUrl}${Config.endpoint}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
