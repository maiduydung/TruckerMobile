export interface AdditionalCost {
  id: string;
  name: string;
  amount: string;
  note: string;
}

export interface TripFormData {
  driverName: string;
  advancePayment: string;
  pickupDate: Date;
  pickupLocation: string;
  pickupWeight: string;
  deliveryDate: Date;
  deliveryLocation: string;
  deliveryWeight: string;
  openingBalance: string;
  fuelNamPhat: string;
  fuelHN: string;
  loadingFee: string;
  additionalCosts: AdditionalCost[];
  notes: string;
}

export const DRIVERS = [
  'NPHau',
  'HVTan',
  'NHThanh',
];

export const PICKUP_LOCATIONS = ['TPG', 'HL', 'KG', 'DQ', 'TLLT', 'TLTB', 'YP', 'X'];

export const DELIVERY_LOCATIONS = ['TBS', 'LHH', 'HT', 'NQ', 'TPH', 'DTT', 'BSLA', 'X', 'VTL', 'TDL'];

export const COST_CATEGORIES = [
  'Xe xúc',
  'Lò hơi',
  'Cân xe',
  'Bồi dưỡng cân',
  'Bảo vệ',
  'Vá vỏ',
  'Rửa xe',
  'Khác',
];
