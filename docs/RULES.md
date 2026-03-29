# AI Instance Governance Rules
### These RULES must be followed at all times.

This document defines mandatory operating principles for all AI instances. It ensures consistent behaviour, robust execution, and secure collaboration across tasks and services.

---

## Code Quality Standards

- All components must implement structured error handling — never let exceptions crash the app silently.
- Every exported function and component must include a concise JSDoc or inline comment explaining its purpose.
- Components must verify props and preconditions before rendering or executing side effects.
- Long-running operations (API calls, async storage) must implement timeout and cancellation mechanisms.
- Prioritize readability — extract complex logic into well-named helper functions.
- No files should be longer than 300 lines. If a file exceeds this, split into smaller components or utility modules.
- Never hardcode API URLs, keys, or credentials. Always load from `config.ts` or environment variables.
- Use TypeScript strict mode — no `any` types unless absolutely unavoidable and documented.
- All currency values are integers in VND — never use floating point for money.
- Use `showAlert`/`showConfirm` from `alert.ts` for cross-platform alerts — never use `Alert.alert` directly (breaks on web).

---

## Documentation Protocols

- Keep documentation simple and easy to understand.
- Only update documentation in `/docs`, `CHANGELOG.md`, or `README.md` in the project root.
- Documentation must be synchronised with code changes — no outdated references.
- Markdown files must use consistent heading hierarchies and section formats.
- Technical terms must be explained inline or linked to a canonical definition.

---

## React Native / Expo Rules

- State management uses `useState`/`useCallback` only — no Redux or external state libraries.
- Navigation uses the state machine in `App.tsx` — no react-navigation library.
- API calls use plain `fetch` — no axios.
- All network requests must handle offline/timeout states gracefully with user-visible feedback.
- Forms must preserve user input on save failure — never clear the form on error.
- Number formatting must use `formatNumber`/`parseNumber` from `utils.ts` — never format manually.
- Respect device memory — avoid loading large datasets into state. Use pagination or lazy loading.

---

## Process Execution Requirements

- All API calls must log errors with enough context to trace the failure (endpoint, status code, payload).
- Any failed operation must show a clear, user-readable error message — never show raw error objects.
- Respect platform constraints — test on both iOS and Android before considering a feature complete.
- Pull-to-refresh and loading states must always reflect the actual async operation state.
- Retry logic for API calls must include backoff and failure limits — never retry infinitely.
