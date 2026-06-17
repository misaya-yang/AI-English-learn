# Phase 01 - Registration and Login Recovery

> For agentic workers: execute this phase next. Do not work on dark mode, full UI redesign, or IELTS Anki cards until this phase passes or is blocked with evidence.

**Goal:** Prove and repair the real registration/login UI flow so users are not limited to the demo account.

**Architecture:** Auth UI calls `src/lib/supabase-auth.ts`, which uses Supabase Auth through the same-origin proxy configured in `src/lib/supabase.ts`.

**Tech Stack:** React auth pages, AuthContext, Supabase Auth, Vercel proxy, Playwright/browser smoke, Vitest.

## Machine Contract

```json
{
  "schema_version": "prd-phase-harness/v3",
  "harness_role": "execution",
  "phase": {
    "id": "VD-01",
    "number": "01",
    "title": "Registration and Login Recovery",
    "status": "passed",
    "type": "implementation",
    "repo_path": "/Users/yang/projects/app",
    "docs_path": "docs/vocabdaily-upgrade-harness",
    "phase_file": "docs/vocabdaily-upgrade-harness/phase-01-registration-and-login-recovery.md",
    "depends_on": ["VD-00"],
    "unlocks": ["VD-02"]
  },
  "goal": {
    "target": "Prove and repair the real registration/login UI flow so users are not limited to the demo account.",
    "prompt": "Complete VD-01 Registration and Login Recovery by following docs/vocabdaily-upgrade-harness/phase-01-registration-and-login-recovery.md; use VD-F002; prove UI registration, UI password login, reload persistence, and no Supabase refresh storm before unlocking VD-02.",
    "plan_required": true,
    "plan_output": "docs/vocabdaily-upgrade-harness/reports/vd-01-registration-and-login-recovery-plan.md",
    "completion_report": "docs/vocabdaily-upgrade-harness/reports/vd-01-registration-and-login-recovery-report.md"
  },
  "runtime": {
    "feature_oracle": "docs/vocabdaily-upgrade-harness/feature-oracle.json",
    "loop_contract": "docs/vocabdaily-upgrade-harness/loop-contract.json",
    "loop_state": "docs/vocabdaily-upgrade-harness/loop-state.json",
    "progress_log": "docs/vocabdaily-upgrade-harness/progress-log.md",
    "handoff": "docs/vocabdaily-upgrade-harness/agent-handoff.md",
    "continuity_ledger": "docs/vocabdaily-upgrade-harness/continuity-ledger.md",
    "next_window_prompt": "docs/vocabdaily-upgrade-harness/next-window-prompt.md",
    "session_boot": {"read_progress": true, "run_baseline_check": true, "update_progress_before_exit": true},
    "agent_roles": ["planner", "generator", "evaluator"]
  },
  "context": {
    "read_first": ["docs/vocabdaily-upgrade-harness/README.md", "docs/vocabdaily-upgrade-harness/phase-manifest.md", "docs/vocabdaily-upgrade-harness/source-packet.md", "docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-report.md"],
    "primary_context": ["src/lib/supabase.ts", "src/lib/supabase-auth.ts", "src/contexts/AuthContext.tsx", "src/pages/auth/LoginPage.tsx", "src/pages/auth/RegisterPage.tsx", "src/pages/auth/AuthCallbackPage.tsx", "scripts/e2e-smoke.mjs", "scripts/functional-check-real-auth.mjs"],
    "context_budget": "focused",
    "do_not_load_unless": ["Supabase dashboard auth settings", "production database schema", "billing functions"]
  },
  "boundaries": {
    "likely_edit_paths": ["src/lib/supabase-auth.ts", "src/contexts/AuthContext.tsx", "src/pages/auth/**", "scripts/*auth*.mjs", "scripts/e2e-smoke.mjs", "src/**/*.test.ts", "src/**/*.test.tsx", "docs/vocabdaily-upgrade-harness/**"],
    "do_not_edit": ["theme redesign files unless needed for auth readability", "supabase/migrations/** unless a blocked report names schema need", "billing/payment files", "PracticePage UI"],
    "external_inputs": ["production Supabase Auth", "production Vercel app"],
    "secrets_required": ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]
  },
  "tool_policy": {
    "allowed_tools": ["repo search", "shell validation", "in-app browser", "Playwright/browser smoke"],
    "approval_required": ["Supabase dashboard auth policy changes", "schema migration", "production deployment", "new provider project"],
    "dangerous_commands": ["git reset --hard", "rm -rf", "production migration", "force push"]
  },
  "risk": {
    "tags": ["auth", "security", "frontend", "browser", "release"],
    "data_mutation": true,
    "migration_required": "unknown",
    "browser_required": true,
    "ai_eval_required": false,
    "external_service_required": true,
    "release_blocking": true
  },
  "validation": {
    "commands": [
      {"id": "lint", "cwd": "/Users/yang/projects/app", "command": "npm run lint", "expected": "exit 0", "required": true},
      {"id": "i18n", "cwd": "/Users/yang/projects/app", "command": "npm run check:i18n", "expected": "exit 0", "required": true},
      {"id": "build", "cwd": "/Users/yang/projects/app", "command": "npm run build", "expected": "exit 0", "required": true},
      {"id": "tests", "cwd": "/Users/yang/projects/app", "command": "npm test -- --run", "expected": "exit 0", "required": true},
      {"id": "prod-smoke", "cwd": "/Users/yang/projects/app", "command": "npm run smoke:prod", "expected": "0 failed", "required": true}
    ],
    "browser_checks": ["Production /register creates a synthetic account in a fresh context", "Production /login accepts that account in a fresh context", "Reload after login remains on dashboard", "Console/network has no repeated Supabase refresh storm", "Invalid credentials show readable failure and do not navigate to dashboard"],
    "regression_scope": ["demo account still works if intentionally supported", "logout still clears session", "public routes remain accessible", "protected dashboard still redirects logged-out users"],
    "compliance_gates": ["synthetic test account only", "no tokens in logs", "no user enumeration copy", "fail closed on invalid session", "no local fallback masking production failure"],
    "acceptance_gates": ["VD-F002 passing evidence is recorded", "phase report exists", "browser UI evidence covers register, login, reload, invalid credentials", "repo checks pass"],
    "rollback_plan": ["revert auth changes", "keep VD-00 proxy fix intact", "document Supabase policy blocker if provider settings stop UI signup"]
  },
  "evidence": {
    "outputs": ["docs/vocabdaily-upgrade-harness/reports/vd-01-registration-and-login-recovery-report.md"],
    "required_artifacts": ["browser auth report", "validation command summary", "oracle update", "continuity ledger update"],
    "waiver_policy": "Any skipped browser check must be explicitly blocked or waived with reason and residual risk.",
    "next_phase_handoff": "Unlock VD-02 only after real account UI auth passes."
  },
  "stop_conditions": ["email confirmation policy prevents immediate login", "RLS/schema failure requires migration", "dashboard/provider setting change requires approval", "production deployment needed but validation is not ready"]
}
```

## Coding Agent Contract

- PHASE_ID: VD-01
- GOAL_TARGET: Prove and repair the real registration/login UI flow so users are not limited to the demo account.
- GOAL_PROMPT: Complete VD-01 Registration and Login Recovery by following `docs/vocabdaily-upgrade-harness/phase-01-registration-and-login-recovery.md`; use VD-F002; prove UI registration, UI password login, reload persistence, and no Supabase refresh storm before unlocking VD-02.
- DEPENDS_ON: VD-00
- READ_FIRST: `docs/vocabdaily-upgrade-harness/README.md`, `docs/vocabdaily-upgrade-harness/phase-manifest.md`, this file, `docs/vocabdaily-upgrade-harness/reports/vd-00-supabase-database-recovery-report.md`
- PRIMARY_CONTEXT: `src/lib/supabase.ts`, `src/lib/supabase-auth.ts`, `src/contexts/AuthContext.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/RegisterPage.tsx`, `src/pages/auth/AuthCallbackPage.tsx`, `scripts/e2e-smoke.mjs`
- LIKELY_EDIT_PATHS: `src/lib/supabase-auth.ts`, `src/contexts/AuthContext.tsx`, `src/pages/auth/**`, `scripts/*auth*.mjs`, `scripts/e2e-smoke.mjs`, auth tests, harness docs
- DO_NOT_EDIT: full theme redesign, `supabase/migrations/**` without blocker/approval, billing/payment files, practice UI
- EXECUTION_MODE: plan-first; implement stepwise; verify before completion; write evidence before handoff
- VALIDATION_COMMANDS: `npm run lint`; `npm run check:i18n`; `npm run build`; `npm test -- --run`; `npm run smoke:prod`
- BROWSER_CHECKS: production register, production login, reload persistence, invalid credentials, no refresh storm
- REGRESSION_SCOPE: demo path, logout, public routes, protected route redirects
- COMPLIANCE_GATES: synthetic test account only; no tokens in logs; fail closed; no local fallback masking production failure
- ROLLBACK_PLAN: revert auth changes; preserve VD-00 proxy fix; document provider blocker
- ACCEPTANCE_GATES: browser UI evidence for real account flow; repo checks pass; report and oracle update exist
- EVIDENCE_OUTPUT: `docs/vocabdaily-upgrade-harness/reports/vd-01-registration-and-login-recovery-report.md`
- STOP_CONDITIONS: email confirmation/provider policy blocks flow; migration required; dashboard setting change requires approval

## Task Spec

Prove the production UI can create and authenticate real accounts. This phase is complete after 3 synthetic accounts register, log in from fresh contexts, and retain the session after reload.

## Problem Boundary

In scope: `/register`, `/login`, dashboard redirect after auth, reload persistence, invalid credentials, and Supabase refresh behavior. Out of scope: dark mode styling, complete UI redesign, Anki card content, provider schema changes unless a blocker proves they are necessary.

## Context Policy

Use production UI and synthetic test accounts. Do not print account emails, passwords, access tokens, refresh tokens, or Supabase secrets. Use the in-app browser or headless browser contexts rather than Chrome unless the user explicitly requests Chrome.

## Requirements

### R1 New Account Creation

At least 2 new accounts, preferably 3, must register successfully through the production `/register` form.

### R2 Password Login

Each newly created account must log in through `/login` from a fresh browser context.

### R3 Session Persistence

Reload after login must keep the user in the dashboard instead of returning to login or an endless confirming state.

### R4 Invalid Credential Failure

Invalid credentials must stay on `/login` and show a readable error.

## Test and Regression Requirements

- Production UI register check for 3 synthetic accounts.
- Production UI login check for those 3 synthetic accounts.
- Reload persistence check for each account.
- Invalid credential check.
- `npm run smoke:prod` remains passing from VD-00.

## Compliance and Safety Requirements

- Use synthetic accounts only.
- Do not expose credentials or tokens.
- Do not change provider settings or schema without a blocker and approval.
- Do not let local/demo fallback mask production Auth failure.

## Rollback and Recovery

No code changed in the passing verification. If future auth UI changes regress the flow, revert only those auth changes and keep the VD-00 proxy fix.

## Execution Capture

See `reports/vd-01-registration-and-login-recovery-report.md`. The report records 3 successful production UI registrations, 3 successful fresh-context logins, reload persistence, and invalid-credential behavior.

## Evaluator Protocol

Reject the phase if evidence comes only from API calls or demo login. Accept only production UI evidence for multiple new accounts and fresh login contexts.

## Acceptance Criteria

- 3 synthetic production accounts register successfully.
- 3 synthetic production accounts log in successfully.
- Reload keeps each account in `/dashboard/today`.
- Invalid credentials stay on `/login` with readable error.
- No Supabase refresh storm or body decoding failure blocks auth.

## Risks

- Synthetic accounts remain in production Auth unless cleaned up through provider tools later.
- `profiles` requests may abort during route transitions; this is acceptable only when auth and session persistence still pass.
- Future Supabase email confirmation settings could change immediate login behavior.
