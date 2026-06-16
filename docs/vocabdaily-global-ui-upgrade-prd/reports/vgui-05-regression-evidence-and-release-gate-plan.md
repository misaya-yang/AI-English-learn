# VGUI-05 Execution Plan

**Phase:** VGUI-05 Regression Evidence And Release Gate

**Date:** 2026-06-17

## Goal

Prove the VocabDaily global UI upgrade is releasable, then commit, push, deploy to Vercel, and smoke the production URL.

## Steps

1. Re-run the full local validation command set:
   - `npm run lint`
   - `npm run check:i18n`
   - `npm run build`
   - `npm test -- --run`
2. Regenerate final browser evidence:
   - full UI regression with contact sheets
   - learning-flow regression with light/dark/system, desktop/mobile, route switching, Practice retry/reveal, and listening retry/reveal
3. Investigate production Supabase refresh-token risk:
   - verify current auth code still avoids refresh storms
   - run production smoke before and after deployment with explicit Supabase env
   - capture any blocker if provider reachability fails
4. Update VGUI-05 report, oracle, progress log, source packet, continuity ledger, handoff, and next-window prompt.
5. Stage reviewed files, commit on `codex/ai-ielts-coach-studio`, push, deploy to Vercel, and run production smoke against the deployed URL.

## Acceptance Criteria

- Full local validation passes.
- Final UI and learning-flow regression pass with evidence under `product-audit-2026-06-17/global-ui/`.
- Production smoke has no hard failures, or any external-provider failure is documented as a release blocker before deploy completion is claimed.
- Git commit and push succeed.
- Vercel deployment succeeds and the final URL is smoke-tested.

