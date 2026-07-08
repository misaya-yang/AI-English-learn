# Enterprise P0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first P0 enterprise foundation from the approved Open-Core Enterprise Learning OS spec: typed skill attempts, remediation routing, content-license manifest validation, and server-authoritative enterprise access helpers.

**Architecture:** This plan is intentionally additive. It creates pure TypeScript contracts and deterministic helpers first, then wires later UI, migrations, and Edge Functions to those contracts in follow-up plans. Existing `learning_events`, `evidenceEvents`, route registry, billing functions, and word book data remain public-compatible.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, Supabase-backed app architecture, existing local evidence/event services.

## Global Constraints

- Preserve current public contracts unless a migration explicitly requires a change.
- Prefer additive migrations and adapter layers.
- Keep current route registry as the routing source of truth.
- Do not add dependencies for P0 unless the same result is impractical with current stack.
- Keep personal learning flows working while org scope is introduced.
- Treat billing and entitlements as fail-closed.
- Treat content from imports as untrusted data.
- Do not print or commit secrets.
- This first implementation slice must not add database migrations or change existing dashboard routes.

---

## File Structure

- Create `src/services/skillAttempts.ts`
  - Owns canonical `SkillAttempt`, `SkillMistake`, and `LearningRemediation` contracts.
  - Normalizes existing `EvidenceEvent` and persisted `LearningEventRecord` rows into skill attempts.
  - Produces deterministic remediation candidates from attempts.

- Create `src/services/skillAttempts.test.ts`
  - Proves normalization for vocabulary, practice, review, lesson, persisted learning events, and remediation routing.

- Create `src/services/contentLicensing.ts`
  - Owns content-license and content-manifest contracts for current bundled word books.
  - Builds manifests from `getBuiltInWordBooks`.
  - Blocks unknown/non-commercial licenses for commercial organization assignment.

- Create `src/services/contentLicensing.test.ts`
  - Proves built-in word books have manifest entries, commercial checks fail closed, and unknown-license content is blocked.

- Create `src/services/enterpriseAccess.ts`
  - Owns organization role, entitlement, feature, and scope-aware access decisions as pure functions.
  - This is the frontend/shared policy mirror; later Edge Functions and RLS must enforce the same or stricter rules.

- Create `src/services/enterpriseAccess.test.ts`
  - Proves role hierarchy, membership checks, entitlement fail-closed behavior, and feature access decisions.

- Modify `docs/superpowers/plans/2026-07-08-enterprise-p0-foundation.md`
  - Track execution by checking completed steps as they are done.

---

### Task 1: Save And Verify This P0 Plan

**Files:**
- Create: `docs/superpowers/plans/2026-07-08-enterprise-p0-foundation.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-08-open-core-enterprise-learning-os-design.md`
- Produces: implementation tasks with concrete file targets for this P0 slice.

- [x] **Step 1: Write the implementation plan**

Create this file with the required header, file structure, tasks, verification commands, and self-review checklist.

- [x] **Step 2: Verify the plan has no placeholders**

Run:

```bash
node -e "const fs=require('fs');const p='docs/superpowers/plans/2026-07-08-enterprise-p0-foundation.md';const s=fs.readFileSync(p,'utf8');const bad=['TO'+'DO','T'+'BD','FIX'+'ME','PLACE'+'HOLDER','implement '+'later','fill '+'in'];const hit=bad.find((x)=>s.includes(x));if(hit){console.error(hit);process.exit(1)}"
```

Expected: no output and exit code `0`.

- [x] **Step 3: Verify the plan is the only docs plan addition before code**

Run:

```bash
git status --short
```

Expected: this plan file appears as untracked or modified, and no unrelated files are changed.

---

### Task 2: Add Canonical Skill Attempt And Remediation Contracts

**Files:**
- Create: `src/services/skillAttempts.ts`
- Create: `src/services/skillAttempts.test.ts`

**Interfaces:**
- Consumes: `EvidenceEvent` from `src/services/evidenceEvents.ts`
- Consumes: `LearningEventRecord` from `src/services/learningEvents.ts`
- Produces:
  - `type SkillAttemptScope = 'personal' | 'org'`
  - `type SkillAttemptSurface = 'today' | 'review' | 'practice' | 'coach' | 'reading' | 'listening' | 'writing' | 'pronunciation' | 'grammar' | 'exam' | 'vocabulary'`
  - `type SkillAttemptSkill = 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar' | 'exam_strategy'`
  - `interface SkillAttempt`
  - `interface SkillMistake`
  - `interface LearningRemediation`
  - `function createSkillAttempt(input: SkillAttemptInput): SkillAttempt`
  - `function evidenceEventToSkillAttempt(event: EvidenceEvent, options?: SkillAttemptContext): SkillAttempt`
  - `function learningEventToSkillAttempt(event: LearningEventRecord, options?: SkillAttemptContext): SkillAttempt | null`
  - `function buildRemediationFromAttempt(attempt: SkillAttempt, options?: RemediationBuildOptions): LearningRemediation | null`

- [x] **Step 1: Write failing tests for skill attempt creation**

Add this test block to `src/services/skillAttempts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { createEvidenceEvent } from './evidenceEvents';
import type { LearningEventRecord } from './learningEvents';
import {
  buildRemediationFromAttempt,
  createSkillAttempt,
  evidenceEventToSkillAttempt,
  learningEventToSkillAttempt,
} from './skillAttempts';

const NOW = '2026-07-08T12:00:00.000Z';

const persistedRow = (
  eventName: string,
  payload: Record<string, unknown>,
): LearningEventRecord => ({
  id: `event-${eventName}`,
  userId: 'user-1',
  eventName,
  eventSource: 'web',
  payload,
  createdAt: NOW,
});

describe('createSkillAttempt', () => {
  it('defaults to personal scope and user_action source', () => {
    const attempt = createSkillAttempt({
      userId: 'user-1',
      surface: 'practice',
      skill: 'vocabulary',
      contentRefType: 'word',
      contentRefId: 'word-1',
      durationMs: 1200,
      createdAt: NOW,
    });

    expect(attempt).toMatchObject({
      userId: 'user-1',
      scope: 'personal',
      surface: 'practice',
      skill: 'vocabulary',
      source: 'user_action',
      fallbackUsed: false,
      contentRefType: 'word',
      contentRefId: 'word-1',
    });
    expect(attempt.id).toMatch(/^attempt_/);
  });

  it('requires userId and content reference', () => {
    expect(() =>
      createSkillAttempt({
        userId: '',
        surface: 'practice',
        skill: 'vocabulary',
        contentRefType: 'word',
        contentRefId: 'word-1',
      }),
    ).toThrow('userId');

    expect(() =>
      createSkillAttempt({
        userId: 'user-1',
        surface: 'practice',
        skill: 'vocabulary',
        contentRefType: '',
        contentRefId: 'word-1',
      }),
    ).toThrow('contentRefType');
  });
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/services/skillAttempts.test.ts
```

Expected: FAIL because `src/services/skillAttempts.ts` does not exist yet.

- [x] **Step 3: Implement the minimal skill attempt model**

Create `src/services/skillAttempts.ts` with the exported types and `createSkillAttempt` implementation shown by the tests. Generate IDs with `crypto.randomUUID()` when available, and fall back to a timestamp/random suffix for test safety.

- [x] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npm test -- --run src/services/skillAttempts.test.ts
```

Expected: PASS for the `createSkillAttempt` tests.

- [x] **Step 5: Add failing tests for evidence normalization**

Append tests covering:

```ts
describe('evidenceEventToSkillAttempt', () => {
  it('maps practice.incorrect into a scored vocabulary attempt with mistake tags', () => {
    const event = createEvidenceEvent({
      type: 'practice.incorrect',
      userId: 'user-1',
      wordId: 'word-1',
      mode: 'quiz',
      createdAt: NOW,
    });

    const attempt = evidenceEventToSkillAttempt(event, { durationMs: 9000 });

    expect(attempt).toMatchObject({
      userId: 'user-1',
      surface: 'practice',
      skill: 'vocabulary',
      subskill: 'word_meaning',
      contentRefType: 'word',
      contentRefId: 'word-1',
      score: 0,
      maxScore: 1,
      accuracy: 0,
      durationMs: 9000,
      mistakeTags: ['practice_incorrect', 'mode_quiz'],
    });
  });

  it('preserves org context when supplied by an assignment', () => {
    const event = createEvidenceEvent({
      type: 'review.rated',
      userId: 'user-1',
      wordId: 'word-1',
      rating: 'good',
      createdAt: NOW,
    });

    const attempt = evidenceEventToSkillAttempt(event, {
      orgId: 'org-1',
      cohortId: 'cohort-1',
      assignmentId: 'assignment-1',
      source: 'assignment',
    });

    expect(attempt).toMatchObject({
      scope: 'org',
      orgId: 'org-1',
      cohortId: 'cohort-1',
      assignmentId: 'assignment-1',
      source: 'assignment',
      surface: 'review',
      accuracy: 1,
    });
  });
});
```

- [x] **Step 6: Implement evidence normalization**

Implement `evidenceEventToSkillAttempt` so current evidence events map as:

- `vocab.learned`: surface `today`, skill `vocabulary`, score `1/1`, subskill `word_meaning`
- `vocab.hard`: surface `today`, skill `vocabulary`, score `0/1`, mistake tag `vocab_hard`
- `vocab.bookmarked`: surface `vocabulary`, skill `vocabulary`, score `null`, subskill `word_interest`
- `practice.correct`: surface `practice`, score `1/1`
- `practice.recovered`: surface `practice`, score `0.5/1`, mistake tag `practice_recovered`
- `practice.incorrect`: surface `practice`, score `0/1`, mistake tags `practice_incorrect` and `mode_<mode>`
- `review.rated`: surface `review`, score `1/1` for `good/easy`, `0/1` for `again/hard`
- `review.recovery_marked`: surface `review`, score `1/1` when `outcome=helped`, otherwise `0/1`
- `lesson.completed`: surface `today`, content ref `lesson`, score `1/1`

- [x] **Step 7: Add failing tests for persisted event normalization and remediation**

Append:

```ts
describe('learningEventToSkillAttempt', () => {
  it('maps persisted evidence payloads back to canonical attempts', () => {
    const attempt = learningEventToSkillAttempt(
      persistedRow('evidence.review.rated', {
        wordId: 'word-1',
        rating: 'again',
        evidenceCreatedAt: NOW,
      }),
    );

    expect(attempt).toMatchObject({
      userId: 'user-1',
      surface: 'review',
      skill: 'vocabulary',
      contentRefId: 'word-1',
      score: 0,
      accuracy: 0,
      mistakeTags: ['review_again'],
    });
  });

  it('returns null for non-evidence events', () => {
    expect(learningEventToSkillAttempt(persistedRow('chat.message_sent', {}))).toBeNull();
  });
});

describe('buildRemediationFromAttempt', () => {
  it('creates practice remediation for incorrect vocabulary attempts', () => {
    const attempt = evidenceEventToSkillAttempt(
      createEvidenceEvent({
        type: 'practice.incorrect',
        userId: 'user-1',
        wordId: 'word-1',
        mode: 'quiz',
        createdAt: NOW,
      }),
    );

    const remediation = buildRemediationFromAttempt(attempt, {
      dueAt: '2026-07-09T00:00:00.000Z',
    });

    expect(remediation).toMatchObject({
      userId: 'user-1',
      status: 'open',
      targetSurface: 'practice',
      createdBy: 'system',
      dueAt: '2026-07-09T00:00:00.000Z',
      skill: 'vocabulary',
      contentRefId: 'word-1',
    });
  });

  it('does not create remediation for successful attempts', () => {
    const attempt = evidenceEventToSkillAttempt(
      createEvidenceEvent({
        type: 'review.rated',
        userId: 'user-1',
        wordId: 'word-1',
        rating: 'easy',
        createdAt: NOW,
      }),
    );

    expect(buildRemediationFromAttempt(attempt)).toBeNull();
  });
});
```

- [x] **Step 8: Implement persisted event normalization and remediation**

Implement `learningEventToSkillAttempt` by rehydrating `eventName` values that start with `evidence.`. Implement `buildRemediationFromAttempt` to create remediation only when `accuracy < 0.75` or there are mistake tags. Route target surface to `review` for review failures, `practice` for vocabulary/practice failures, and `coach` for writing/speaking failures.

- [x] **Step 9: Run skill attempt tests**

Run:

```bash
npm test -- --run src/services/skillAttempts.test.ts
```

Expected: PASS.

---

### Task 3: Add Content License Manifest And Commercial Use Gate

**Files:**
- Create: `src/services/contentLicensing.ts`
- Create: `src/services/contentLicensing.test.ts`

**Interfaces:**
- Consumes: `getBuiltInWordBooks` and `WordBook` from `src/data/wordBooks.ts`
- Produces:
  - `type ContentLicenseId`
  - `interface ContentLicense`
  - `interface ContentManifestEntry`
  - `const CONTENT_LICENSES`
  - `function getBuiltInWordBookContentManifest(): ContentManifestEntry[]`
  - `function validateContentManifest(entries: ContentManifestEntry[]): ContentManifestValidationResult`
  - `function canUseContentCommercially(entry: ContentManifestEntry): boolean`

- [x] **Step 1: Write failing content licensing tests**

Create `src/services/contentLicensing.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { BUILT_IN_WORD_BOOK_IDS, getBuiltInWordBooks } from '@/data/wordBooks';
import {
  canUseContentCommercially,
  getBuiltInWordBookContentManifest,
  validateContentManifest,
} from './contentLicensing';

describe('content licensing manifest', () => {
  it('creates one manifest entry for each built-in word book', () => {
    const books = getBuiltInWordBooks();
    const manifest = getBuiltInWordBookContentManifest();

    expect(manifest.map((entry) => entry.contentId).sort()).toEqual(
      books.map((book) => book.id).sort(),
    );
  });

  it('marks built-in IELTS academic and Anki packs commercial-safe', () => {
    const manifest = getBuiltInWordBookContentManifest();
    const ielts = manifest.find((entry) => entry.contentId === BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    const anki = manifest.find((entry) => entry.contentId === BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION);

    expect(ielts).toBeDefined();
    expect(anki).toBeDefined();
    expect(ielts && canUseContentCommercially(ielts)).toBe(true);
    expect(anki && canUseContentCommercially(anki)).toBe(true);
  });

  it('fails closed for unknown licenses', () => {
    const validation = validateContentManifest([
      {
        contentId: 'custom-pack',
        contentType: 'word_book',
        name: 'Custom Pack',
        sourceName: 'Unknown upload',
        licenseId: 'unknown',
        licenseName: 'Unknown',
        version: '1.0.0',
        commercialUseAllowed: false,
        redistributionAllowed: false,
        derivativeAllowed: false,
        provenance: 'user_import',
        warnings: [],
      },
    ]);

    expect(validation.valid).toBe(false);
    expect(validation.blockingIssues[0]).toContain('custom-pack');
  });
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/services/contentLicensing.test.ts
```

Expected: FAIL because `src/services/contentLicensing.ts` does not exist yet.

- [x] **Step 3: Implement content license manifest**

Create `contentLicensing.ts` with deterministic license IDs:

- `project_dataset`
- `mit`
- `original_content`
- `mixed_mit_original_project`
- `unknown`

Map current built-in word books to license IDs by their existing `license` text. Unknown text must become `unknown` and commercial use must be blocked.

- [x] **Step 4: Run content licensing tests**

Run:

```bash
npm test -- --run src/services/contentLicensing.test.ts
```

Expected: PASS.

---

### Task 4: Add Enterprise Access And Entitlement Policy Helpers

**Files:**
- Create: `src/services/enterpriseAccess.ts`
- Create: `src/services/enterpriseAccess.test.ts`

**Interfaces:**
- Produces:
  - `type OrganizationRole = 'owner' | 'admin' | 'teacher' | 'learner'`
  - `type EnterpriseFeature = 'organization' | 'cohorts' | 'assignments' | 'evidence_reports' | 'content_packs' | 'seats' | 'audit' | 'billing' | 'sso' | 'scim'`
  - `interface OrganizationMembership`
  - `interface EntitlementGrant`
  - `function hasOrgRole(membership, roles): boolean`
  - `function canManageMembers(membership): boolean`
  - `function canManageAssignments(membership): boolean`
  - `function canViewCohortEvidence(membership): boolean`
  - `function isEnterpriseFeatureEnabled(feature, grants): boolean`
  - `function requireEnterpriseFeature(feature, grants): EnterpriseAccessDecision`

- [x] **Step 1: Write failing enterprise access tests**

Create `src/services/enterpriseAccess.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  canManageAssignments,
  canManageMembers,
  canViewCohortEvidence,
  hasOrgRole,
  isEnterpriseFeatureEnabled,
  requireEnterpriseFeature,
  type EntitlementGrant,
  type OrganizationMembership,
} from './enterpriseAccess';

const membership = (role: OrganizationMembership['role']): OrganizationMembership => ({
  orgId: 'org-1',
  userId: 'user-1',
  role,
  status: 'active',
});

const grant = (
  feature: EntitlementGrant['feature'],
  active = true,
): EntitlementGrant => ({
  orgId: 'org-1',
  feature,
  active,
  source: 'manual',
  grantedAt: '2026-07-08T00:00:00.000Z',
});

describe('enterprise role helpers', () => {
  it('checks active membership roles only', () => {
    expect(hasOrgRole(membership('owner'), ['owner'])).toBe(true);
    expect(hasOrgRole({ ...membership('owner'), status: 'invited' }, ['owner'])).toBe(false);
    expect(hasOrgRole(null, ['owner'])).toBe(false);
  });

  it('allows owner/admin to manage members and teacher/admin to manage assignments', () => {
    expect(canManageMembers(membership('owner'))).toBe(true);
    expect(canManageMembers(membership('admin'))).toBe(true);
    expect(canManageMembers(membership('teacher'))).toBe(false);
    expect(canManageAssignments(membership('teacher'))).toBe(true);
    expect(canManageAssignments(membership('learner'))).toBe(false);
  });

  it('allows teachers to view cohort evidence but not learners', () => {
    expect(canViewCohortEvidence(membership('teacher'))).toBe(true);
    expect(canViewCohortEvidence(membership('learner'))).toBe(false);
  });
});

describe('enterprise entitlements', () => {
  it('fails closed when a feature has no active grant', () => {
    expect(isEnterpriseFeatureEnabled('assignments', [])).toBe(false);
    expect(isEnterpriseFeatureEnabled('assignments', [grant('assignments', false)])).toBe(false);
  });

  it('allows a feature only with an active matching grant', () => {
    expect(isEnterpriseFeatureEnabled('assignments', [grant('assignments')])).toBe(true);
    expect(isEnterpriseFeatureEnabled('audit', [grant('assignments')])).toBe(false);
  });

  it('returns a readable denial reason for locked features', () => {
    expect(requireEnterpriseFeature('sso', [])).toEqual({
      allowed: false,
      reason: 'missing_entitlement',
      feature: 'sso',
    });
  });
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/services/enterpriseAccess.test.ts
```

Expected: FAIL because `src/services/enterpriseAccess.ts` does not exist yet.

- [x] **Step 3: Implement enterprise access helpers**

Create the pure helper module. Every entitlement check must fail closed when grants are empty, missing, inactive, expired, or mismatched.

- [x] **Step 4: Run enterprise access tests**

Run:

```bash
npm test -- --run src/services/enterpriseAccess.test.ts
```

Expected: PASS.

---

### Task 5: Run Slice Verification And Commit

**Files:**
- All files from Tasks 1-4.

**Interfaces:**
- Consumes: all new services and tests.
- Produces: a committed first P0 foundation slice.

- [x] **Step 1: Run focused tests**

Run:

```bash
npm test -- --run src/services/skillAttempts.test.ts src/services/contentLicensing.test.ts src/services/enterpriseAccess.test.ts
```

Expected: all focused tests pass.

- [x] **Step 2: Run project checks**

Run:

```bash
npm run lint
npm run check:i18n
npm test -- --run
npm run build
```

Expected: all pass. A Browserslist age warning is acceptable if the build exits 0.

- [x] **Step 3: Review diff**

Run:

```bash
git diff --stat
git diff --check
```

Expected: only planned files changed; `git diff --check` exits 0.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-07-08-enterprise-p0-foundation.md src/services/skillAttempts.ts src/services/skillAttempts.test.ts src/services/contentLicensing.ts src/services/contentLicensing.test.ts src/services/enterpriseAccess.ts src/services/enterpriseAccess.test.ts
git commit -m "feat: add enterprise p0 foundation contracts"
```

Expected: commit succeeds on `dev`.

---

## Self-Review

Spec coverage:

- Covers P0 `skill_attempt` normalization layer.
- Covers remediation model and router as a pure deterministic first step.
- Covers content license manifest and unknown-license commercial blocking.
- Covers enterprise entitlement fail-closed helpers.
- Covers organization role semantics as shared frontend/Edge policy foundation.
- Does not yet implement DB migrations, RLS policies, Organization shell UI, Evidence page, or Vocabulary virtualization. Those remain follow-up P0 plans because they are independent subsystems with their own test cycles.

Placeholder scan:

- This plan intentionally contains no unresolved marker terms.

Type consistency:

- `SkillAttempt`, `LearningRemediation`, `ContentManifestEntry`, `OrganizationMembership`, and `EntitlementGrant` are introduced once and reused by later tests.
- Enterprise feature names are stable across tests and helper signatures.
