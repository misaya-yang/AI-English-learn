# Enterprise P0 UI Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add feature-gated Evidence and Organization dashboard shells that expose the enterprise P0 foundation without requiring deployed organization data.

**Architecture:** This slice keeps the current route registry as the dashboard metadata source, adds two lazy routes, and builds read-only pages from existing local evidence/contracts. Evidence derives from `learning_events` and `skillAttempts`; Organization shows the operational shell and fail-closed enterprise feature state. No database writes, migrations, or remote calls are added.

**Tech Stack:** React 19, React Router, TypeScript, Vitest, Testing Library, existing Tailwind/Radix/lucide primitives.

## Global Constraints

- Preserve current public contracts unless a migration explicitly requires a change.
- Prefer additive migrations and adapter layers.
- Keep current route registry as the routing source of truth.
- Do not add dependencies for P0 unless the same result is impractical with current stack.
- Keep personal learning flows working while org scope is introduced.
- Treat billing and entitlements as fail-closed.
- Treat content from imports as untrusted data.
- Do not print or commit secrets.
- UI direction: calm enterprise workbench, restrained color, stable grid, no generic SaaS hero, no nested card layout.

---

## File Structure

- Create `src/features/enterprise/enterpriseUi.ts`
  - Owns the dashboard UI feature flag and small helpers for route visibility.

- Create `src/features/enterprise/enterpriseUi.test.ts`
  - Proves default UI preview behavior and explicit disabled/enabled env parsing.

- Modify `src/features/learning/routeRegistry.ts`
  - Add `evidence` and `organization` route IDs.
  - Add `enterpriseOnly?: boolean` metadata.
  - Add optional `enterpriseEnabled` filtering to grouped/mobile route helpers.

- Modify `src/features/learning/routeRegistry.test.ts`
  - Prove App routes stay covered.
  - Prove enterprise routes are hidden from visible grouped nav when disabled and visible when enabled.

- Modify `src/App.tsx`
  - Add lazy imports and dashboard routes for `/dashboard/evidence` and `/dashboard/organization`.

- Modify `src/layouts/DashboardLayout.tsx`
  - Pass feature-gated route filtering into nav groups.
  - Add Organization to admin tool nav alongside Settings.

- Create `src/pages/dashboard/EvidencePage.tsx`
  - Read `getLearningEvents(user.id)` and derive canonical attempts/remediations.
  - Render learner evidence summary, weak signals, remediation queue, and organization-ready copy.

- Create `src/pages/dashboard/EvidencePage.test.tsx`
  - Mock learning events and assert empty and populated states.

- Create `src/pages/dashboard/OrganizationPage.tsx`
  - Render organization operational shell: Members, Cohorts, Assignments, Content Packs, Audit.
  - Display fail-closed feature states using `enterpriseAccess`.
  - Display commercial-safe content pack count using `contentLicensing`.

- Create `src/pages/dashboard/OrganizationPage.test.tsx`
  - Assert feature-gated shell copy, locked entitlements, and content pack provenance summary.

---

### Task 1: Save And Verify This UI Plan

**Files:**
- Create: `docs/superpowers/plans/2026-07-08-enterprise-p0-ui-shell.md`

**Interfaces:**
- Consumes: approved enterprise spec and previous P0 contracts.
- Produces: implementation checklist for this UI slice.

- [x] **Step 1: Write this implementation plan**

Create this file with exact file targets, tests, and verification commands.

- [x] **Step 2: Verify the plan has no unresolved markers**

Run:

```bash
node -e "const fs=require('fs');const p='docs/superpowers/plans/2026-07-08-enterprise-p0-ui-shell.md';const s=fs.readFileSync(p,'utf8');const bad=['TO'+'DO','T'+'BD','FIX'+'ME','PLACE'+'HOLDER','implement '+'later','fill '+'in'];const hit=bad.find((x)=>s.includes(x));if(hit){console.error(hit);process.exit(1)}"
```

Expected: no output and exit code `0`.

---

### Task 2: Add Enterprise UI Feature Flag

**Files:**
- Create: `src/features/enterprise/enterpriseUi.ts`
- Create: `src/features/enterprise/enterpriseUi.test.ts`

**Interfaces:**
- Produces:
  - `type EnterpriseUiEnv = { VITE_ENTERPRISE_UI_ENABLED?: string | boolean | undefined }`
  - `function isEnterpriseUiEnabled(env?: EnterpriseUiEnv): boolean`
  - `function readEnterpriseUiEnv(): EnterpriseUiEnv`

- [x] **Step 1: Write failing feature flag tests**

Create tests that assert:

- default is enabled for local preview,
- string `false`, `0`, `off`, and `no` disable,
- boolean false disables,
- string `true` enables.

- [x] **Step 2: Run focused test and verify it fails**

Run:

```bash
npm test -- --run src/features/enterprise/enterpriseUi.test.ts
```

Expected: FAIL because the module does not exist.

- [x] **Step 3: Implement feature flag helper**

Create the helper. Use `import.meta.env` only inside `readEnterpriseUiEnv`; keep `isEnterpriseUiEnabled` pure for tests.

- [x] **Step 4: Run focused test**

Run:

```bash
npm test -- --run src/features/enterprise/enterpriseUi.test.ts
```

Expected: PASS.

---

### Task 3: Register Evidence And Organization Routes

**Files:**
- Modify: `src/features/learning/routeRegistry.ts`
- Modify: `src/features/learning/routeRegistry.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/layouts/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `isEnterpriseUiEnabled`
- Produces route IDs:
  - `evidence`
  - `organization`

- [x] **Step 1: Write failing route registry tests**

Add assertions that:

- `getDashboardRoute('evidence').path` is `/dashboard/evidence`,
- `getDashboardRoute('organization').path` is `/dashboard/organization`,
- `getRoutesByGroup('tools', { enterpriseEnabled: false })` does not include `evidence`,
- `getRoutesByGroup('tools', { enterpriseEnabled: true })` includes `evidence`,
- `getRoutesByGroup('admin', { enterpriseEnabled: true })` includes `organization`.

- [x] **Step 2: Run route registry test and verify it fails**

Run:

```bash
npm test -- --run src/features/learning/routeRegistry.test.ts
```

Expected: FAIL until route metadata and helper signatures are updated.

- [x] **Step 3: Implement route registry entries and filtering**

Add metadata for both routes using lucide icons already available from `lucide-react`. Preserve existing mobile top-four ordering.

- [x] **Step 4: Add lazy App routes**

Add lazy imports for `EvidencePage` and `OrganizationPage`, then dashboard routes for `evidence` and `organization`.

- [x] **Step 5: Update DashboardLayout nav filtering**

Use `isEnterpriseUiEnabled()` and pass `{ enterpriseEnabled }` to route group helpers. Include `organization` in standard admin tool nav when visible.

- [x] **Step 6: Run route registry test**

Run:

```bash
npm test -- --run src/features/learning/routeRegistry.test.ts
```

Expected: PASS.

---

### Task 4: Add Evidence Dashboard Page

**Files:**
- Create: `src/pages/dashboard/EvidencePage.tsx`
- Create: `src/pages/dashboard/EvidencePage.test.tsx`

**Interfaces:**
- Consumes: `useAuth()`
- Consumes: `getLearningEvents(userId)`
- Consumes: `learningEventToSkillAttempt`
- Consumes: `buildRemediationFromAttempt`

- [x] **Step 1: Write failing Evidence page tests**

Tests should assert:

- empty state says no evidence yet and links to Today,
- populated state reports attempt count, weak signal count, and remediation count from mocked learning events,
- English copy renders when `i18n.language` is English.

- [x] **Step 2: Run focused test and verify it fails**

Run:

```bash
npm test -- --run src/pages/dashboard/EvidencePage.test.tsx
```

Expected: FAIL because page does not exist.

- [x] **Step 3: Implement Evidence page**

Build a calm workbench layout with:

- title and short operational summary,
- four metric tiles,
- remediation list,
- recent attempts table/list,
- empty state with Today/Review links.

- [x] **Step 4: Run focused test**

Run:

```bash
npm test -- --run src/pages/dashboard/EvidencePage.test.tsx
```

Expected: PASS.

---

### Task 5: Add Organization Dashboard Page

**Files:**
- Create: `src/pages/dashboard/OrganizationPage.tsx`
- Create: `src/pages/dashboard/OrganizationPage.test.tsx`

**Interfaces:**
- Consumes: `requireEnterpriseFeature`
- Consumes: `getBuiltInWordBookContentManifest`
- Consumes: `canUseContentCommercially`
- Consumes: `isEnterpriseUiEnabled`

- [x] **Step 1: Write failing Organization page tests**

Tests should assert:

- page renders Members, Cohorts, Assignments, Content Packs, Audit,
- enterprise features display locked state with `missing_entitlement`,
- content pack summary uses real manifest counts,
- disabled feature flag renders a locked preview message.

- [x] **Step 2: Run focused test and verify it fails**

Run:

```bash
npm test -- --run src/pages/dashboard/OrganizationPage.test.tsx
```

Expected: FAIL because page does not exist.

- [x] **Step 3: Implement Organization page**

Build a workbench shell with no fake org data:

- feature flag status,
- operational tabs/sections,
- locked enterprise features,
- content provenance summary,
- next implementation checklist.

- [x] **Step 4: Run focused test**

Run:

```bash
npm test -- --run src/pages/dashboard/OrganizationPage.test.tsx
```

Expected: PASS.

---

### Task 6: Verify And Commit UI Shell Slice

**Files:**
- All files from Tasks 1-5.

**Interfaces:**
- Produces a committed Organization/Evidence UI shell slice.

- [x] **Step 1: Run focused tests**

Run:

```bash
npm test -- --run src/features/enterprise/enterpriseUi.test.ts src/features/learning/routeRegistry.test.ts src/pages/dashboard/EvidencePage.test.tsx src/pages/dashboard/OrganizationPage.test.tsx
```

Expected: PASS.

- [x] **Step 2: Run project checks**

Run:

```bash
npm run lint
npm run check:i18n
npm test -- --run
npm run build
```

Expected: all pass. A Browserslist age warning is acceptable if build exits 0.

- [x] **Step 3: Review diff**

Run:

```bash
git diff --check
git status --short
```

Expected: only planned files changed; whitespace check exits 0.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-07-08-enterprise-p0-ui-shell.md src/features/enterprise/enterpriseUi.ts src/features/enterprise/enterpriseUi.test.ts src/features/learning/routeRegistry.ts src/features/learning/routeRegistry.test.ts src/App.tsx src/layouts/DashboardLayout.tsx src/pages/dashboard/EvidencePage.tsx src/pages/dashboard/EvidencePage.test.tsx src/pages/dashboard/OrganizationPage.tsx src/pages/dashboard/OrganizationPage.test.tsx
git commit -m "feat: add enterprise evidence organization shell"
```

Expected: commit succeeds on `dev`.

---

## Self-Review

Spec coverage:

- Covers Organization shell UI behind a feature gate.
- Covers Evidence page v1 for learner and org-ready evidence.
- Preserves current personal routes and learning flows.
- Does not implement remote org CRUD, Edge Functions, deployed RLS, or Vocabulary virtualization.

Marker scan:

- This plan intentionally contains no unresolved marker terms.

Type consistency:

- Route IDs are `evidence` and `organization`.
- Feature flag helper is `isEnterpriseUiEnabled`.
- Route filtering option is `{ enterpriseEnabled: boolean }`.
