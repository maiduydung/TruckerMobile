import type { GpsCoordinates } from './gps';

export interface Stop {
  seq: number;
  type: 'pickup' | 'delivery';
  location: string;
  date: Date;
  weight: string;
  gps: GpsCoordinates | null;
}

export interface TripFormData {
  driverName: string;
  advancePayment: string;
  openingBalance: string;
  stops: Stop[];
  fuelNamPhat: string;
  fuelHN: string;
  loadingFee: string;
  costXeXuc: string;
  costLoHoi: string;
  costCanXe: string;
  costCom: string;
  costBoiDuongCan: string;
  costBaoVe: string;
  costVaVo: string;
  costRuaXe: string;
  costKhac: string;
  costKhacNote: string;
  notes: string;
}

export const FIXED_COSTS: { key: keyof TripFormData; label: string }[] = [
  { key: 'costXeXuc', label: 'Xe xúc' },
  { key: 'costLoHoi', label: 'Lò hơi' },
  { key: 'costCanXe', label: 'Cân xe' },
  { key: 'costCom', label: 'Cơm' },
  { key: 'costBoiDuongCan', label: 'Bồi dưỡng cân' },
  { key: 'costBaoVe', label: 'Bảo vệ' },
  { key: 'costVaVo', label: 'Vá vỏ' },
  { key: 'costRuaXe', label: 'Rửa xe' },
  { key: 'costKhac', label: 'Khác' },
];

export const DRIVERS = [
  'NPHau',
  'HVTan',
  'NHThanh',
];

export const PICKUP_LOCATIONS = ['TPG', 'HL', 'KG', 'DQ', 'TLLT', 'TLTB', 'YP', 'X'];

export const DELIVERY_LOCATIONS = ['TBS', 'LHH', 'HT', 'NQ', 'TPH', 'DTT', 'BSLA', 'X', 'VTL', 'TDL'];
