import Config from './config';
import { GpsCoordinates } from './gps';
import { parseNumber } from './utils';
import { TripFormData, FIXED_COSTS, Stop, PICKUP_LOCATIONS, DELIVERY_LOCATIONS } from './types';

// ── Stop payload (sent to API) ──

export interface StopPayload {
  seq: number;
  type: 'pickup' | 'delivery';
  location: string;
  date: string;           // ISO 8601
  weightKg: number;
  gps: GpsCoordinates | null;
}

// ── Payload sent to Azure Function / Container App ──

export interface TripPayload {
  driverName: string;
  advancePayment: number;
  openingBalance: number;
  stops: StopPayload[];

  // Costs
  fuelNamPhatVnd: number;
  fuelHnLiters: number;
  loadingFeeVnd: number;
  additionalCosts: {
    name: string;
    amountVnd: number;
    note: string;
  }[];
  totalCost: number;
  closingBalance: number;

  // Meta
  notes: string;
  isDraft: boolean;
  submittedAt: string;     // ISO 8601
}

// ── Helper: sum all costs from form (in 1000 VND units) ──

export function sumFormCosts(form: TripFormData): number {
  const fuel = parseNumber(form.fuelNamPhat);
  const loading = parseNumber(form.loadingFee);
  const additional = FIXED_COSTS.reduce((s, c) => s + parseNumber(form[c.key] as string), 0);
  return fuel + loading + additional;
}

// ── Build payload from form state ──

export function buildPayload(
  form: TripFormData,
  isDraft: boolean,
): TripPayload {
  const totalCost = sumFormCosts(form) * 1000;
  const openingBalance = parseNumber(form.openingBalance) * 1000;
  const advancePayment = parseNumber(form.advancePayment) * 1000;
  const fuelNamPhatVnd = parseNumber(form.fuelNamPhat) * 1000;

  return {
    driverName: form.driverName,
    advancePayment,
    openingBalance,

    stops: form.stops.map(s => ({
      seq: s.seq,
      type: s.type,
      location: s.location,
      date: s.date.toISOString(),
      weightKg: parseNumber(s.weight),
      gps: s.gps,
    })),

    fuelNamPhatVnd,
    fuelHnLiters: parseNumber(form.fuelHN),
    loadingFeeVnd: parseNumber(form.loadingFee) * 1000,
    additionalCosts: FIXED_COSTS
      .map(c => ({
        name: c.label,
        amountVnd: parseNumber(form[c.key] as string) * 1000,
        note: c.key === 'costKhac' ? form.costKhacNote : '',
      }))
      .filter(c => c.amountVnd > 0),
    totalCost,
    closingBalance: openingBalance + advancePayment - (totalCost - fuelNamPhatVnd),

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

// ── Stop record from backend (snake_case JSONB) ──

export interface StopRecord {
  seq: number;
  type: 'pickup' | 'delivery';
  location: string;
  date: string;
  weightKg: number;
  gps: GpsCoordinates | null;
}

// ── Trip record from backend ──

export interface TripRecord {
  id: string;
  driver_name: string;
  advance_payment: number;
  stops: string | StopRecord[];
  fuel_nam_phat_vnd: number;
  fuel_hn_liters: number;
  loading_fee_vnd: number;
  additional_costs: string | { name: string; amountVnd: number; note: string }[];
  opening_balance: number;
  total_cost: number;
  closing_balance: number;
  notes: string;
  is_draft: boolean;
  submitted_at: string;
}

// ── Helpers for parsing stops from TripRecord ──

export function parseStops(raw: string | StopRecord[]): StopRecord[] {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function stopsToFormStops(records: StopRecord[]): Stop[] {
  const fmtNum = (n: number) => n ? n.toLocaleString('en-US') : '';
  return records.map(r => ({
    seq: r.seq,
    type: r.type,
    location: r.location || (r.type === 'pickup' ? PICKUP_LOCATIONS[0] : DELIVERY_LOCATIONS[0]),
    date: new Date(r.date),
    weight: fmtNum(r.weightKg),
    gps: r.gps,
  }));
}

export function stopsRouteSummary(raw: string | StopRecord[]): { pickups: string; deliveries: string; totalPickupKg: number; totalDeliveryKg: number } {
  const stops = parseStops(raw);
  const pickupStops = stops.filter(s => s.type === 'pickup');
  const deliveryStops = stops.filter(s => s.type === 'delivery');
  return {
    pickups: pickupStops.map(s => s.location).join(', '),
    deliveries: deliveryStops.map(s => s.location).join(', '),
    totalPickupKg: pickupStops.reduce((sum, s) => sum + (s.weightKg || 0), 0),
    totalDeliveryKg: deliveryStops.reduce((sum, s) => sum + (s.weightKg || 0), 0),
  };
}
