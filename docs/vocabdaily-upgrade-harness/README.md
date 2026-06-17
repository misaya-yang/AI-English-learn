# VocabDaily Upgrade PRD Phase Harness

**Date:** 2026-06-17

**Owner:** Product/Engineering

**Purpose:** Execute the five-task VocabDaily recovery and product upgrade sequentially with durable evidence before each next phase unlocks.

## Harness Intent

This harness turns the user's five concerns into executable phases. It is not a brainstorm doc. A future agent should be able to open this folder, identify the active phase, execute exactly that phase, verify it, record evidence, and only then unlock the next phase.

## Coding Agent Loading Protocol

When assigned a phase goal:

1. Open this `README.md`.
2. Open `phase-manifest.md`.
3. Open `loop-contract.json`, `loop-state.json`, `feature-oracle.json`, `progress-log.md`, `agent-handoff.md`, `continuity-ledger.md`, and `next-window-prompt.md`.
4. Locate the target with:

```bash
rg -n "PHASE_ID: <ID>|GOAL_PROMPT|VALIDATION_COMMANDS|ACCEPTANCE_GATES" docs/vocabdaily-upgrade-harness
```

5. Open only the target phase file and files listed in that phase's `PRIMARY_CONTEXT`.
6. Create a plan before editing.
7. Treat `LIKELY_EDIT_PATHS` as the intended write boundary.
8. Complete validation, browser/runtime checks, regression scope, compliance gates, rollback notes, evidence output, and acceptance gates before claiming completion.
9. Summarize code facts and boundary decisions back into `source-packet.md` and `continuity-ledger.md`.
10. Update `progress-log.md`, `agent-handoff.md`, the phase report, and only the relevant feature `status`, `evidence`, and `notes` fields in `feature-oracle.json`.
11. Move to the next phase only after dependency gates are met or explicitly waived in a report.

## Long-Running Runtime Protocol

- Follow `loop-contract.json`: observe, select, execute, verify, record, decide.
- Work on one phase and one feature-oracle item at a time.
- If validation fails outside the active phase, document a blocker instead of drifting.
- If external service access, schema migration, payment change, data deletion, or production dashboard mutation is required, stop unless the phase contract and user approval cover it.
- For UI phases, use Product Design context in playback mode: English learning app, practical workbench, no AI-template copy, no glowy dark mode, full shipped interactivity.

## Source Packet

Read `source-packet.md` for current repo facts, Supabase recovery evidence, product intent, risk tags, and approval boundaries.

## Runtime Artifacts

| Artifact | Purpose |
| --- | --- |
| `loop-contract.json` | The control loop: observe, select, execute, verify, record, decide. |
| `loop-state.json` | Current phase, feature, iteration, status, last decision, and next action. |
| `feature-oracle.json` | End-to-end acceptance cases. Agents may update evidence and status, not delete cases. |
| `progress-log.md` | Chronological progress, current blocker, and restart notes. |
| `agent-handoff.md` | Planner, generator, and evaluator handoff packet. |
| `continuity-ledger.md` | Cross-phase dependencies and code-summary writeback. |
| `next-window-prompt.md` | Copy-ready prompt for a fresh agent window. |

## Current System Shape

VocabDaily is a Vite/React/TypeScript app deployed on Vercel. Supabase provides Auth, data, and Edge Functions through a same-origin Vercel proxy at `/api/supabase`. The active production domain is `https://www.uuedu.online`.

## Assumptions and Decisions

- Keep existing Supabase project `zjkbktdmwencnouwfrij` because it was recoverable.
- Use the in-app browser for authenticated provider checks unless the user explicitly requests Chrome.
- Do not start UI work until real registration/login has UI-level evidence.
- Do not start IELTS Anki work until core UI and auth are stable.
- Default UI direction is a restrained English learning workbench, not an AI cockpit.

## Phase Order

| Phase | Name | Core Outcome | Report |
| --- | --- | --- | --- |
| VD-00 | Supabase Database Recovery | Production Supabase and proxy are reachable, readable, and deployed. | `reports/vd-00-supabase-database-recovery-report.md` |
| VD-01 | Registration and Login Recovery | Real registration/login UI flow works without relying on the demo account. | `reports/vd-01-registration-and-login-recovery-report.md` |
| VD-02 | Dark Mode Repair | Dark mode is readable, restrained, and does not flash black blocks. | `reports/vd-02-dark-mode-repair-report.md` |
| VD-03 | Product UI Redesign | Core screens become practical, clear, and free of AI-template copy/layout. | `reports/vd-03-product-ui-redesign-report.md` |
| VD-04 | IELTS Anki Card Foundation | A first IELTS Anki-style deck/schema is available in the learning flow. | `reports/vd-04-ielts-anki-card-foundation-report.md` |

## Roadmap Cohesion

The chain is:

```text
VD-00 -> VD-01 -> VD-02 -> VD-03 -> VD-04
```

Do not skip ahead. Each phase must write evidence before the next phase is executable.

## Shared Harness Rules

- Stay inside phase boundaries.
- Plan before editing.
- Do not claim completion without durable evidence.
- Document blockers and user waivers explicitly.
- Keep secrets out of docs, commits, terminal summaries, and screenshots.

## Global Non-Goals

- No payment semantics changes.
- No production schema migration unless the active phase explicitly requires and gates it.
- No broad rewrite of unrelated modules.
- No new UI library unless a phase report explains why existing patterns cannot support the fix.

## Global Compliance Gates

- Auth and session behavior must fail closed.
- Test accounts must not expose real personal data.
- Dark and light modes must remain WCAG-readable for primary UI text and controls.
- UI copy must be concrete and task-focused.
- Any generated or seeded learning content must be inspectable and not falsely attributed.

## Standard Verification Commands

```bash
npm run lint
npm run check:i18n
npm run build
npm test -- --run
npm run smoke:prod
```

## Required Browser or Runtime Checks

- Auth phases: `/register`, `/login`, `/dashboard/today` in a fresh context.
- UI phases: public routes plus dashboard routes at desktop `1440x960` and mobile `390x844`.
- Theme phases: light, dark, and system modes with route switching.

## External Inputs and Approvals

- Supabase and Vercel are external services. Use them only when the active phase requires provider evidence.
- Production deployment is allowed only when the phase is release blocking and smoke will run immediately after.
- Destructive commands, force pushes, production migrations, DNS/provider changes, and payment changes require explicit approval.

## New Window Prompt

Use `next-window-prompt.md`. The current target after VD-00 is `VD-01 Registration and Login Recovery`.
