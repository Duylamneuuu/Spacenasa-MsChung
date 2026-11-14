# MS Chung — GitHub collaboration

> **Status — 14 Nov 2026:** Plan & Drive is implemented and live at **https://apogee-mars-rover.vercel.app/** (built from `main`). English is the default and judged language; an **EN / VI** switch adds Vietnamese. Mission 01 includes a step-by-step tutorial. Code lives in `src/sim/expedition.ts`, `src/types/expedition.ts`, `src/scene/ExpeditionScene.tsx`, `src/ui/` and `src/i18n.ts`.

## Workflow
```bash
git clone https://github.com/Duylamneuuu/Spacenasa-MsChung.git
cd Spacenasa-MsChung
npm ci
npm run dev      # http://localhost:5173
npm test
npm run build
```

1. Branch from `main` and open a small PR with screenshots or a short clip.
2. Never force-push or reset someone else's branch. Fetch `main` before you start.
3. Simulation owns state; the scene draws it; the UI displays it and sends actions.
4. Every new player-facing string goes into `src/i18n.ts` in English and Vietnamese.
5. Label balance values as game values; cite NASA numbers with a link and the rule they affect.
6. Merging to `main` redeploys https://apogee-mars-rover.vercel.app/ automatically.

Ownership is in [TEAM_PLAN](TEAM_PLAN.md). [Issues](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues) · [PRs](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls) · [Actions](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions)
