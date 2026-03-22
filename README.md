# Nhu Tin Trucker

Mobile app for truckers to log trip details and manage fees. Built with Expo (React Native), targeting iOS and Android.

## Features

- Single-screen trip form — no auth, no friction
- Driver selection, advance payment tracking
- Pickup & delivery logging (date, location, weight in KG)
- Fuel costs (Nam Phat in VND, HN in liters)
- Loading/unloading fees, dynamic additional costs
- Delivery date cannot be earlier than pickup date
- Pickup/delivery weight difference capped at 1,000 KG
- All currency fields formatted with comma separators (VND, integers only)
- Save draft or complete trip

## Architecture

```
[ Mobile App (this repo) ]
   ↓
[ API - FastAPI / Azure Function ]
   ↓
[ Postgres / Cosmos ]
   ↓
[ Blob Storage (images) ]
```

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Tech Stack

- Expo SDK 54
- React Native 0.77
- TypeScript
- @react-native-community/datetimepicker
- react-native-safe-area-context
