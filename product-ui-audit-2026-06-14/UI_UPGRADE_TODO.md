# VocabDaily UI Upgrade Todo - 2026-06-14

## Goal

Bring the whole English-learning app to the same premium, focused-study quality now visible on Home and Today, while keeping routes functional and adding UI regression evidence for every upgrade wave.

## Regression Gate

Every implementation wave must pass:

- `npm run lint`
- `npm run build`
- UI screenshot regression for desktop `1440x960` and mobile `390x844`
- No horizontal overflow in captured routes
- No unauthenticated dashboard redirect during demo capture
- No visible mixed-language labels in Chinese-mode target screens

## P0 - Coherence And Trust

### P0-01 Route-Level UI Contract

- Status: done for captured route contract in Wave 4; deeper product redesign remains iterative
- Scope: Dashboard layout, Today, Review, Practice, Coach, Exam, Vocabulary, Analytics, Memory, Settings, Profile, skill pages
- Fix:
  - Classify every route as one of `daily cockpit`, `active drill`, or `management console`.
  - Use shared `premium-panel`, `premium-panel-soft`, `premium-action-bar`, and learning shell patterns.
  - Keep controls, cards, metrics, and empty states consistent.
- Acceptance:
  - Contact sheet no longer shows obvious jumps between premium cockpit screens and flat MVP pages.
  - Wave 4 regression covers public, auth, dashboard, and secondary learning routes in desktop/mobile.

### P0-02 Mixed-Language Copy Cleanup

- Status: Wave 1 done for Settings, Practice, Profile; Wave 2 done for Coach, Vocabulary, Review, Exam first view; Wave 3 done for specialty first views
- Scope: Settings, Practice, Profile, Pricing, Exam, skill pages
- Fix:
  - Replace English labels in Chinese mode.
  - Keep English names only for intentional exam/product terms.
  - Remove raw emoji from serious app state text.
- Acceptance:
  - Chinese-mode screenshots do not show `Save Changes`, `Multiple Choice`, `Fill in the Blank`, `Listening Quiz`, `Writing Practice`, `Theme`, `Font Size`, or raw status emoji in target screens.

### P0-03 Empty State Trust Upgrade

- Status: Wave 1 done for Analytics and Memory; Wave 2 done for Review
- Scope: Analytics, Memory, Review, Profile
- Fix:
  - Replace bare zero-data panels with useful learner guidance.
  - Add one primary next action, one reassurance line, and one useful preview.
- Acceptance:
  - Empty states feel intentional, not broken or unavailable.

### P0-04 Visual Token Migration

- Status: Wave 1 done for Settings, Practice, Analytics, Memory, Profile; Wave 2 done for Review, Coach, Vocabulary, Exam first view; Wave 3 done for specialty first views
- Scope: Practice, Review, Analytics, Memory, Profile, Settings, specialty pages
- Fix:
  - Replace high-radius and flat card stacks with approved premium surfaces.
  - Normalize radius to `rounded-lg` or `rounded-md` unless component semantics require otherwise.
- Acceptance:
  - Main user-facing panels in target routes use premium utilities or the shared Card component.

## P1 - Learning Flow Quality

### P1-01 Practice Mode Picker Upgrade

- Status: done in Wave 1
- Scope: Practice
- Fix:
  - Localize mode names.
  - Make recommendation visually explicit.
  - Reduce plain list feeling.
  - Remove raw combo emoji.
- Acceptance:
  - Mobile first viewport clearly says which practice mode is recommended and why.

### P1-02 Coach Mobile Simplification

- Status: done in Wave 2
- Scope: Chat / Coach
- Fix:
  - Compress `Coach Brief`.
  - Reduce prompt card competition.
  - Make input dock and recommended prompt the center.
- Acceptance:
  - Mobile first viewport has one clear suggested action and the composer is not visually fighting the prompt list.

### P1-03 Exam Sprint Flow

- Status: done in Wave 2
- Scope: Exam Prep
- Fix:
  - Turn scattered panels into an IELTS sprint sequence: diagnose, choose route, simulate/write, review, retry.
- Acceptance:
  - Desktop first viewport reads as a guided sprint, not a dashboard of unrelated panels.

### P1-04 Vocabulary Editorialization

- Status: done in Wave 2
- Scope: Vocabulary Bank
- Fix:
  - Add a featured word/detail preview.
  - Make word book management feel like learning assets, not database rows.
- Acceptance:
  - First viewport has a meaningful learning preview, not only administration controls.

## P2 - Premium Learning Emotion

### P2-01 Skill Page Signature Moments

- Status: done in Wave 3
- Scope: Reading, Listening, Grammar, Pronunciation, Writing
- Fix:
  - Reading: passage preview and question mix.
  - Listening: audio player/waveform feel.
  - Grammar: mistake pattern card and active drill preview.
  - Pronunciation: score ring / phoneme / waveform expectation.
  - Writing: rubric bands and revision loop.
- Acceptance:
  - Each specialty route has a distinct first-viewport learning artifact.

### P2-02 Session Completion System

- Status: done in Wave 5 for Practice, Reading, Listening, Grammar, Pronunciation, and Writing
- Scope: Practice, Reading, Listening, Grammar, Pronunciation, Writing
- Fix:
  - Standardize completion state: result, what improved, what to review, next action.
- Acceptance:
  - Completing a drill produces a consistent premium recap.
  - Automated completion scenarios verify Reading, Listening, Grammar, Pronunciation, and Writing on desktop/mobile.

### P2-03 Desktop Space Utilization

- Status: done for current upgrade baseline in Wave 5
- Scope: Practice, Analytics, Pronunciation, Writing, Reading, Listening
- Fix:
  - Add useful right rails or contextual previews where desktop is sparse.
- Acceptance:
  - Desktop pages no longer look centered and under-designed.
  - Long listening review now uses a contextual desktop rail instead of a narrow single-column layout.

## Wave 1 Implementation Scope

This wave fixes the highest-signal issues that are cheap enough to land safely:

- Settings localization and premium surface cleanup
- Practice mode localization, recommendation treatment, and raw emoji cleanup
- Analytics zero-data trust panel
- Memory empty state trust panel
- Profile learner identity polish
- UI regression capture script and evidence for changed target routes

Status: implemented and verified in `product-ui-audit-2026-06-14/regression-wave1/`.

## Wave 2 Implementation Scope

- Review empty-state redesign
- Coach mobile simplification
- Vocabulary first-viewport editorial word preview
- Exam sprint flow hierarchy

Status: implemented and verified in `product-ui-audit-2026-06-14/regression-wave2/`.

Validation:

- `npm run lint`
- `npm run build`
- `BASE_URL=http://127.0.0.1:5174 npm run test:ui-regression`
- 22/22 route captures passed across desktop `1440x1000` and mobile `390x844`
- Manual screenshot spot-check: mobile Coach, Vocabulary, Review, Exam

## Wave 3 Implementation Scope

- Reading, Listening, Grammar, Pronunciation, Writing signature moments
- Shared active-drill layout
- Full route-level template contract enforcement

Status: first-viewport signature moments implemented and verified in `product-ui-audit-2026-06-14/regression-wave3/`.

Implemented:

- Reading: recommended IELTS passage preview, question mix, and evidence-location flow
- Listening: featured audio clip, waveform panel, and listen-answer-review flow
- Grammar: recommended rule, fill-in preview, and rule/category metrics
- Pronunciation: target sound panel, model-audio action, waveform feedback preview, and progress metrics
- Writing: prompt/workbench panel, word target, rubric preview, and revision-loop panel

Validation:

- `npm run lint`
- `npm run build`
- `BASE_URL=http://127.0.0.1:5174 npm run test:ui-regression`
- 32/32 route captures passed across desktop `1440x960` and mobile `390x844`
- Manual screenshot spot-check: mobile Reading, Listening, Grammar, Pronunciation, Writing

Follow-up opportunities:

- Real-device microphone permission QA for Pronunciation on Chrome, Safari, and Edge.
- Additional contextual rails can be explored for Analytics and advanced Practice sessions after product metrics clarify which panels matter most.

## Wave 4 Implementation Scope

- Full route-level UI regression across public, auth, onboarding, dashboard, and secondary learning routes
- Shared completion-state recap wired into Reading, Listening, Grammar, Writing, and Pronunciation
- Writing completion recap moved above the editor so mobile users see the result first after submit
- Mobile toast behavior adjusted to avoid covering the bottom navigation and completion CTAs
- UI regression script hardened with route/scenario failure capture, navigation retry, content-agnostic drill completion, and clean completion screenshots

Status: implemented and verified in `product-ui-audit-2026-06-14/regression-wave4/`.

Validation:

- `npm run lint`
- `npm run build`
- `BASE_URL=http://127.0.0.1:5174 npm run test:ui-regression`
- 54/54 route captures passed across desktop `1440x960` and mobile `390x844`
- 8/8 interactive completion scenarios passed: Reading, Listening, Grammar, Writing on desktop/mobile
- No horizontal overflow, no error boundary, no unintended dashboard login redirects
- Manual screenshot spot-check: mobile Reading, Listening, Grammar, Writing completion states

Wave 4 note:

- Superseded by Wave 5 for automated Pronunciation completion-state coverage and Listening desktop rail polish.

## Wave 5 Implementation Scope

- Pronunciation completion state added to UI regression with a mocked SpeechRecognition API in the test browser
- Pronunciation recap moved above the practice workbench so completion is result-first on mobile and desktop
- Listening questions/review moved to a wider desktop layout with a contextual support rail
- UI regression output moved to `product-ui-audit-2026-06-14/regression-wave5/`

Status: implemented and verified in `product-ui-audit-2026-06-14/regression-wave5/`.

Validation:

- `npm run lint`
- `npm run build`
- `BASE_URL=http://127.0.0.1:5173 npm run test:ui-regression`
- 54/54 route captures passed across desktop `1440x960` and mobile `390x844`
- 10/10 interactive completion scenarios passed: Reading, Listening, Grammar, Writing, Pronunciation on desktop/mobile
- No horizontal overflow, no error boundary, no unintended dashboard login redirects
- Manual screenshot spot-check: desktop Listening completion rail, mobile Pronunciation completion, desktop Pronunciation completion

Future QA:

- Pronunciation real microphone capture should still be checked manually on physical browsers because automated UI regression mocks the speech-recognition API.
