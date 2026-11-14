# APOGEE — Game language checklist

**Policy (updated 14 Nov 2026):** English is the default language and the version used for judging. The game also ships a Vietnamese translation behind the **EN / VI** switch on the title screen, the top bar and the in-game HUD. The choice is remembered per browser; `?lang=vi` opens the Vietnamese version directly. Internal team documents may be Vietnamese.

All player-facing text lives in `src/i18n.ts`: every UI key has an English and a Vietnamese value, and engine messages from `src/sim/expedition.ts` are translated through `tm()` when Vietnamese is active. New strings must be added to both dictionaries.

## Audit scope
- Title, mission select, hangar, preflight, deploy, planning, driving, tactical map, garage, debrief.
- Tutorial steps, hints, toasts and the mission log.
- Engine messages: safety stops, boundary, power reserve, scan/analyze/transmit/recharge results, preflight errors, garage reasons.
- Buttons, aria-labels, titles and empty/loading states.

## Test acceptance
1. Play Mission 01 from title to report in **EN**, then again in **VI**, including both transmissions and the tutorial.
2. Trigger a safety stop (light wheels into sand on Mission 02), a blocked action reason and a failed report in both languages.
3. Reload and confirm the language choice persists.
4. Search `src/ui` and `src/scene` for quoted English sentences that bypass `t()` / `m()`.

**Note:** Manual WASD is a teaching simplification, not real-time Earth control of a Mars rover.
