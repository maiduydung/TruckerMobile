# Changelog

All notable changes to the NhuTin Trucker Mobile app.

## [0.3.1] - 2026-03-27

### Fixed
- **Date picker unusable on Web** — replaced React Native `Modal`/`TextInput` with pure HTML elements so the native browser date picker actually works on Chrome/mobile browsers.
- **Date picker dismissing on iOS** — touches on the spinner were bubbling up to the overlay and closing the modal before the user could pick a date.

## [0.3.0] - 2026-03-26

### Added
- **Driver selection screen** — pick your name first, then see your trips. Replaces the in-form driver picker.
- **Trip list screen** — view recent trips (last 2 days) with draft/complete status badges, pull-to-refresh, edit and delete actions.
- **In-place trip editing** — tap a trip to load it into the form; saves via PUT instead of creating duplicates.
- **Confirmation popup** on "Hoàn tất chuyến" — prevents accidental finalization.
- **Cross-platform alert system** (`src/alert.ts`) — uses native `Alert.alert` on iOS/Android, `window.confirm`/`window.alert` on Web.
- **Trip deletion** — remove junk drafts or wrong-driver submissions from the trip list.
- API client functions: `updateTrip()`, `getTrips()`, `deleteTrip()` in `src/api.ts`.

### Changed
- **App navigation** — moved from single-screen to 3-screen state machine (driver select → trip list → trip form). No new dependencies.
- **TripScreen** now accepts `driverName` and optional `editingTrip` props. Driver name is read-only (set from session).
- Save handlers return to trip list after user acknowledges success alert.
- Removed driver picker modal from trip form.

### Fixed
- `Alert.alert` silent failure on Web platform — replaced with cross-platform helper.

## [0.2.0] - 2026-03-22

### Changed
- Switched backend target from Cosmos DB to PostgreSQL.
- Updated API endpoint configuration.

## [0.1.0] - 2026-03-20

### Added
- Initial trip form with driver selection, pickup/delivery logging, cost tracking.
- Dynamic additional costs (add/remove rows).
- Weight validation (max 1,000 KG difference).
- Date validation (delivery >= pickup).
- Draft and complete submission modes.
- VND comma formatting for all currency fields.
