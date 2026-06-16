# VLE-06 Regression Eval And Release Plan

## Objective

Complete release validation for the VocabDaily learning ecosystem upgrade, then commit, push, and deploy only after the release gates either pass or have explicit blocker evidence.

## Execution Steps

1. Confirm VLE-00 through VLE-05 are passed and read release scripts/runbooks.
2. Run local release gates:
   - `npm run lint`
   - `npm run check:i18n`
   - `npm run build`
   - `npm test -- --run`
   - UI regression against local preview
   - learning-flow regression against local preview
3. Run smoke checks:
   - `npm run smoke:prod`
   - browser smoke against production if credentials/env allow
   - bad-token dashboard scenario to confirm no refresh storm
4. Classify any failure:
   - code regression
   - provider reachability
   - missing credentials
   - production configuration
5. Write release report, rollback checklist, monitoring notes, and evidence index.
6. If gates pass or only documented non-code blockers remain, stage, commit, push, and deploy to Vercel.
7. Run post-deploy smoke against the deployed URL and update the release report.

## Edit Boundaries

In scope:

- VLE-06 report and release evidence
- ops runbook notes when release evidence requires clarification
- smoke/regression scripts only if a release-blocking script defect is found

Out of scope unless a release blocker requires a focused fix:

- product feature files
- billing fail-closed semantics
- production env values
- secrets files
- production database migrations

## Acceptance Criteria

- Full local validation is green.
- Production smoke is green or has precise provider/config blocker evidence.
- Rollback target and rollback actions are named.
- Git commit, push, and Vercel deployment are completed or blocked with concrete evidence.
- Final report says `ship`, `do not ship`, or `blocked`.

## Rollback Plan

- Frontend rollback: redeploy previous Vercel deployment or revert this release commit and redeploy.
- Supabase functions: redeploy previous known-good function bundles only after approval.
- Database: no migrations are planned in this phase; if later required, use a forward revert migration after backup confirmation.
- Feature rollback: hide new route entry points or revert the release commit.
