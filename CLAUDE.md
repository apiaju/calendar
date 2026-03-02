# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # compiles ESM + CJS + .d.ts into dist/
npm test             # runs all tests once
npm run test:watch   # runs tests in watch mode
npm run prepublishOnly  # alias for build, runs automatically before npm publish
```

To run a single test file:

```bash
npx vitest run tests/easter.test.ts
```

## Architecture

The package has zero runtime dependencies. Logic is split into six layers:

| File | Responsibility |
|------|---------------|
| `src/types.ts` | Public types: `Holiday`, `HolidayType`, `HolidayLevel`, `BusinessDayOptions`. |
| `src/easter.ts` | Meeus/Jones/Butcher algorithm — returns `{ month, day }` of Easter for a given year. |
| `src/utils.ts` | `toAracajuDate(date)` converts any `Date` to `{ year, month, day }` in the `America/Maceio` timezone via `Intl.DateTimeFormat`. `makeAracajuDate(y, m, d)` creates a `Date` at 15:00 UTC to ensure it lands on the correct day in Aracaju (UTC-3). `isWeekend(date, saturdayIsBusinessDay?)` checks day-of-week respecting the Saturday option. |
| `src/holidays.ts` | Fixed and movable holiday tables. Holidays with `since` are omitted for years before their effective date. `getHolidaysForYear(year)` returns sorted `Holiday[]`. |
| `src/functions.ts` | Public API: uses `toAracajuDate` to normalize the received date before any comparison. Business day functions (`isBusinessDay`, `countBusinessDays`, `addBusinessDays`) accept an optional `BusinessDayOptions` to configure whether Saturday counts as a business day. |
| `src/index.ts` | Re-exports only the public API and types. |

## Important conventions

**Timezone:** all date comparisons are made after converting to Aracaju time via `toAracajuDate`. Never compare `.getDate()`, `.getMonth()` or `.getFullYear()` directly — those methods use the machine's local timezone.

**Holiday effective dates:** holidays that came into effect in a specific year use the `since?: number` field on the `FixedHoliday` interface (internal to `holidays.ts`). When adding a new holiday with a start year, use that field instead of adding conditional logic in the functions.

**Dual package:** the build produces `dist/index.js` (ESM) and `dist/index.cjs` (CJS) with their respective type declarations. The `exports` field in `package.json` resolves the correct format automatically.
