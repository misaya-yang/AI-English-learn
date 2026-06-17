# VD-02 Dark Mode Repair Report

## Status

passing

## Scope

Repair shared dark-mode behavior without doing the broader VD-03 UI redesign.

## Actions

- Replaced muddy/black-feeling dark tokens with a restrained graphite study palette.
- Bumped the theme preference version so stale stored dark preferences migrate to light.
- Aligned `index.html`, `ThemeContext`, and the learning-flow regression script on the same theme version.
- Updated dark metadata theme color so pre-paint browser chrome no longer starts from the old gray/black value.
- Softened legacy dark `premium-*` and `glow-*` shadows.
- Extended the learning-flow regression to fail dark pages whose full-page background is near black.
- Added a focused test that stale dark preferences migrate back to light.

## Validation Evidence

| Check | Command | Result |
| --- | --- | --- |
| Focused theme migration test | `npm test -- src/components/ThemeToggle.test.tsx --run` | passed, 2 tests |
| Lint | `npm run lint` | passed |
| i18n | `npm run check:i18n` | passed |
| Build | `npm run build` | passed |
| Full tests | `npm test -- --run` | passed, 104 files / 817 tests |
| Local browser regression | `BASE_URL=http://127.0.0.1:4174 LEARNING_FLOW_OUT_DIR=product-audit-2026-06-17/vd-02-dark-mode npm run test:learning-flow-regression` | passed, 142 checks |
| Stale dark preference probe | Playwright against local preview `/` | passed, old `dark` migrated to `light` before render |
| Vercel production deploy | `npx vercel --prod --yes` | passed, `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`, aliased to `https://www.uuedu.online` |
| Vercel inspect | `npx vercel inspect https://www.uuedu.online --timeout 10s` | Ready |
| Production smoke | `set -a; source .env; set +a; npm run smoke:prod` | passed, 8/8 |
| Production logged-in browser check | Playwright against `https://www.uuedu.online` with a newly registered synthetic account | passed, 25/25 |

## Browser Evidence

- Output folder: `product-audit-2026-06-17/vd-02-dark-mode`
- Screenshot count: 142.
- Viewports: desktop `1440x960`, mobile `390x844`.
- Themes: light, dark, system.
- Dark sample backgrounds:
  - Desktop dark home: `rgb(63, 67, 75)`, brightness 67, overflow 0.
  - Desktop dark today: `rgb(63, 67, 75)`, brightness 67, overflow 0.
  - Desktop dark practice: `rgb(63, 67, 75)`, brightness 67, overflow 0.
  - Desktop dark route switch: `rgb(63, 67, 75)`, brightness 67, overflow 0.
  - Mobile dark home/today/practice/route switch: same background and no overflow.
- Stale preference probe:
  - Input localStorage: `vocabdaily-theme=dark`, stale version.
  - Result: `htmlClass=light`, `storedTheme=light`, background `rgb(246, 247, 249)`, H1 `今天练什么`.
- Production output folder: `product-audit-2026-06-17/vd-02-production-online`
- Production logged-in checks:
  - Created one synthetic account through production `/register`.
  - Logged into production `/login` for each viewport/theme context.
  - Checked `/`, `/dashboard/today`, `/dashboard/practice`, and fast dashboard route switching.
  - Viewports: desktop `1440x960`, mobile `390x844`.
  - Themes: light, dark, system.
  - Total: 25 checks, 0 failures.
  - Desktop/mobile dark home, Today, Practice, and fast route switching all used `rgb(63, 67, 75)`, brightness 67, overflow 0.
  - Production stale-dark migration ended with `htmlClass=light`, `storedTheme=light`, background `rgb(246, 247, 249)`, H1 `今天练什么`.

## Visual Review

- The dark mode is no longer pure black or glow-heavy.
- Public home, Today, Practice, and fast route switching screenshots are readable at desktop and mobile sizes.
- The screenshots still show product-layout and typography weaknesses. Those belong to VD-03 Product UI Redesign and should not be hidden inside this token-only phase.

## Files Changed

- `src/index.css`
- `src/contexts/ThemeContext.tsx`
- `src/components/ThemeToggle.test.tsx`
- `scripts/learning-flow-regression.mjs`
- `index.html`
- `docs/vocabdaily-upgrade-harness/reports/vd-02-dark-mode-repair-plan.md`

## Compliance Gates

- No UI library added.
- No auth, billing, database, or Supabase provider semantics changed.
- No user Chrome was controlled.
- No secrets, emails, passwords, or tokens are included.

## Production Result

VD-02 is deployed to `https://www.uuedu.online` and production-verified. The remaining visual weaknesses are not dark-mode regressions; they are the broader product layout, copy, and typography issues scheduled for VD-03.
