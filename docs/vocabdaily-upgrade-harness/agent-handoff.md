# VocabDaily Upgrade PRD Phase Harness Agent Handoff

**Created:** 2026-06-17

**Harness Folder:** `docs/vocabdaily-upgrade-harness`

## Planner Notes

- Five phases are fixed in `phase-manifest.md`.
- Product Design brief is already known from the user: English learning app, practical learning workbench, no AI-template copy, no glowy dark mode, desktop and mobile validation.
- Product Design user-context preflight found no saved context file, so current screenshots, production pages, and repo source are the source of truth.
- Next target phase is `VD-03 Product UI Redesign`.

## Generator Notes

- Do not use Chrome unless the user explicitly asks for it. Use the in-app browser or CLI/browser test contexts.
- VD-00, VD-01, and VD-02 are complete and should not be reworked unless smoke, auth UI checks, or theme checks regress.
- VD-01 was revisited after a stricter production check. New accounts can complete registration, onboarding, fresh login, and dashboard route checks, but live Supabase still rejects authenticated `public.users` self-upsert with RLS 403 and then `public.profiles` fails with 409. Migration `supabase/migrations/20260617153000_auth_profile_bootstrap_rls.sql` is prepared but not executed. Execute it only after explicit user confirmation, then rerun 2-3 fresh account checks and require no `users/profiles` 403/409.
- VD-02 deployed production `dpl_vNSef9xouqZ7NS5LdEbHfwe4LZZQ`; production smoke passed 8/8 and production logged-in UI regression passed 25/25.
- For VD-03, focus on the actual product UI: layout hierarchy, copy, typography, task clarity, core page ergonomics, and full route visual review.
- Do not treat VD-03 as another token-only pass. The user explicitly rejected the current UI as AI-feeling and poorly laid out.
- Keep test account data synthetic. Do not expose tokens.

## Evaluator Notes

- Reject VD-03 if it only changes the home page or only changes colors.
- Require desktop `1440x960`, mobile `390x844`, and light/dark/system checks across public, dashboard, and learning-module routes.
- Require concrete product copy and visible workflow improvements. Do not accept vague AI-style text.

## Next Handoff

- Active role: generator/evaluator
- Active phase: VD-03
- Active feature-oracle item: VD-F004
- Required evidence before unlock: route inventory, product/UI redesign report, copy audit, desktop/mobile screenshots, light/dark/system checks, repo checks, oracle update, continuity ledger update, and report `reports/vd-03-product-ui-redesign-report.md`.
