# CLAUDE.md — LLM Context for NhuTin Trucker Mobile

## What is this project?

A React Native (Expo) mobile app for truck drivers at a Vietnamese logistics SME (Nhu Tin). Drivers use it to log trip details — pickup/delivery locations, weights, fuel costs, and incidental expenses. The app talks to an Azure Function App backend backed by PostgreSQL.

## Tech stack

- **Framework:** Expo SDK 54, React Native 0.77
- **Language:** TypeScript (strict mode)
- **Navigation:** State machine in App.tsx (no react-navigation library)
- **API:** Plain fetch — no axios
- **State:** React useState/useCallback — no Redux or external state management

## Key files

| File | What it does |
|------|-------------|
| `App.tsx` | Root — 3-screen state machine: driver-select → trip-list → trip-form |
| `src/DriverSelectScreen.tsx` | Screen 1: big buttons to pick driver name |
| `src/TripListScreen.tsx` | Screen 2: recent trips, pull-to-refresh, edit/delete/new |
| `src/TripScreen.tsx` | Screen 3: the main trip form (create + edit mode) |
| `src/api.ts` | All API calls + TripPayload/TripRecord types |
| `src/alert.ts` | Cross-platform alert/confirm (native Alert vs window.confirm on web) |
| `src/types.ts` | TripFormData interface, DRIVERS list, location code arrays |
| `src/utils.ts` | formatNumber, parseNumber, generateId |
| `src/config.ts` | API base URL (dev vs prod) |
| `src/theme.ts` | Color palette |

## Domain context

- **Trip** = one pickup→delivery journey (e.g., TPG → TBS). Multiple per driver per day.
- **Drivers:** NPHau, HVTan, NHThanh (hardcoded in `types.ts`).
- **Locations:** Pickup codes (TPG, HL, KG, DQ, TLLT, TLTB, YP, X) and delivery codes (TBS, LHH, HT, NQ, TPH, DTT, BSLA, X, VTL, TDL).
- **Currency:** All VND, integers only, displayed with comma separators (e.g., "2,000,000").
- **Additional costs** ("chi phí phát sinh") are dynamic rows — fines, tolls, medical bills, etc. Each has name, amount, note.

## App flow

1. Driver opens app → picks their name (DriverSelectScreen)
2. Sees their trips from last 2 days (TripListScreen)
3. Taps "Chuyến mới" for new trip, or taps existing trip to edit
4. TripScreen: "Lưu tạm" = save draft, "Hoàn tất chuyến" = confirm + finalize
5. New trips → POST, existing trips → PUT (same form, different API call)
6. After save, navigates back to trip list (refreshes automatically)

## Important patterns

- **No driver picker in the form** — driver name comes from the "session" (props). It's read-only in TripScreen.
- **`tripId` state** tracks whether we POST (new) or PUT (edit). Set on first save.
- **`tripRecordToForm()`** converts backend snake_case TripRecord → form state. `buildPayload()` converts form state → camelCase API payload.
- **Cross-platform alerts** — must use `showAlert`/`showConfirm` from `alert.ts`, NOT `Alert.alert` directly (it's a no-op on web).

## Companion repos

- **TruckerMobileBackend** — Azure Function App REST API (Python, PostgreSQL)
- **TruckerDashboard** — Svelte SPA for the owner to view trips, export Excel/PDF/CSV. Deployed on Azure Static Web Apps.
