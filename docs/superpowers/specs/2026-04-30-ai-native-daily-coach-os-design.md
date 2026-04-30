# AI Native Daily Coach OS Design

Date: 2026-04-30
Status: Design ready for review
Owner: Codex

## Product Decision

VocabDaily should move from a feature-rich English app toward an AI-native learning operating system. The first implementation focus is the **Daily Coach Loop**:

1. The learner opens the app.
2. The system explains the single most useful task for today.
3. The learner completes one focused workspace.
4. The task writes durable evidence.
5. The coach turns the result into review, retry, or the next lesson.
6. The learner sees a short recap and a clear next step.

This does not remove the broader ambition of a real dictionary. It changes the sequence: build **Daily Coach OS** first, while introducing a lightweight **Dictionary Kernel** so future coach decisions are grounded in language knowledge rather than loose prompts.

## Approaches Considered

### Option 1: Daily Coach OS + Lightweight Dictionary Kernel

Today becomes the daily operating surface. Coach owns the next-best-action decision, pages become tools, and the dictionary model starts with a small but extensible entry schema.

This is the recommended route because it reduces product clutter quickly while creating a path toward a serious language knowledge base.

### Option 2: Dictionary-First Rebuild

Build a complete dictionary and lexical knowledge system before changing the product loop.

This creates the strongest long-term foundation, but it delays visible product improvement. It also risks producing a great data model that users do not feel in the daily experience.

### Option 3: IELTS-Only Vertical

Narrow the product to IELTS band improvement, with writing, speaking, vocabulary, and score analytics as the only first-class workflows.

This is commercially clear, but it would prematurely reduce VocabDaily from an AI-native English learning system into an exam-prep app. IELTS should remain a strong track inside the system, not the whole system.

## Recommended Design

### Product Architecture

The product should have four first-class layers.

**DailyCoachPlan**

This is the daily decision object. It answers:

- What is the single primary task today?
- Why is this task recommended?
- Which evidence supports the choice?
- Which tool should open when the learner starts?
- What should happen after completion?

It should be generated from existing learner model data, learning profile, due reviews, recent mistakes, coach review queue, active word book, and exam goal.

**Dictionary Kernel**

The current `WordData` model is useful for flashcards, but it is not a real dictionary. The kernel should introduce an extensible `LexicalEntry` concept that can gradually support:

- multiple senses
- CEFR level and IELTS relevance
- frequency and topic tags
- collocations and phrase frames
- bilingual examples
- usage notes
- common learner mistakes
- confusing words
- pronunciation metadata
- training templates

The first implementation should be thin: adapt current word data into a richer read model, then surface it in Today, Coach, and Vocabulary. It should not try to ship a full dictionary corpus in one pass.

**Coach Studio**

Coach Studio should act as the operating system, not a generic chat page. It should expose three clear jobs:

- diagnose the next weakness
- run the focused drill
- review what changed

The coach should be able to start from a `DailyCoachPlan`, use dictionary context, and emit clickable actions that become review items or follow-up tasks.

**Evidence and Review**

Every learning claim must write durable evidence. Existing services such as evidence events, mistake collector, coach review queue, FSRS, and learning events should become the backbone of the daily loop.

The UI should not show "progress" unless a corresponding evidence event exists.

### Information Architecture

The navigation should reflect the operating model:

- **Today**: the daily coach loop and single primary task.
- **Coach**: interactive diagnosis, drill, and recap.
- **Review**: due reviews and coach-generated follow-ups.
- **Lexicon**: dictionary, word books, imports, and lexical search.

The following areas should become tools or secondary surfaces:

- Exam
- Practice
- Reading
- Listening
- Writing
- Grammar
- Pronunciation
- Analytics
- Settings

They can still exist, but they should not compete with the primary loop on the first screen.

### UI Pattern

Core learning pages should share one template:

1. **Coach Brief**: why this task, what evidence supports it, estimated time.
2. **Focused Workspace**: one active exercise, card, writing task, review block, or drill.
3. **Evidence Panel**: recent mistakes, dictionary notes, review pressure, completion outcome.
4. **Coach Recap**: what changed and what happens next.

First screens should follow these density rules:

- one primary CTA
- no more than two secondary actions
- no feature catalog on the main surface
- no nested cards
- no decorative AI-glow visual language
- light and dark themes should share the same hierarchy
- Chinese and English copy should switch cleanly, not appear as mixed duplicates

### Data Flow

Daily flow:

1. `buildDailyCoachPlan(userId, context)` reads learner model, profile, due reviews, active book, recent mistakes, and coach queue.
2. It returns a `DailyCoachPlan` with a primary mission, evidence snapshot, and tool action.
3. Today renders the plan as Coach Brief + Focused Workspace + Evidence Panel.
4. Completing the workspace writes `EvidenceEvent`, `LearningEventRecord`, `MistakeEntry`, or `ReviewQueueItem`.
5. Coach recap reads the new evidence and suggests the next action.
6. Review consumes due FSRS items and coach-generated follow-ups.

Dictionary flow:

1. Current `WordData` is adapted into `LexicalEntry`.
2. Coach and Today request dictionary context by word, topic, weak tag, or exam skill.
3. A dictionary card can show senses, collocations, examples, usage notes, and common mistakes.
4. The user can turn a dictionary insight into a drill or review item.

### Error Handling

The system should fail useful, not fail loud:

- If AI is unavailable, Today still shows a deterministic daily plan from local learner data.
- If dictionary enrichment is missing, fall back to current `WordData`.
- If evidence storage is offline, queue the event locally and show a pending sync state.
- If no learner data exists, the first Today task should be a short diagnostic mission.

### Test Strategy

Unit tests:

- `buildDailyCoachPlan` chooses the right primary action for review pressure, exam target, weak topic, and empty user states.
- `LexicalEntry` adapter preserves existing word fields and handles missing optional fields.
- Coach action routing can create review or retry actions from a daily plan.
- Evidence deduplication prevents repeated task completion events.

Component tests:

- Today renders exactly one primary mission.
- Coach Brief shows the reason and evidence snapshot.
- Lexicon card renders current word data through the new dictionary adapter.
- Theme and language switching do not duplicate mixed copy.

Browser smoke:

- `/dashboard/today` at 375px and desktop.
- `/dashboard/chat` starting from a daily plan.
- `/dashboard/vocabulary` or future `/dashboard/lexicon`.
- Light and dark mode for the core loop.

## First Implementation Slice

The first code slice should be deliberately small:

1. Add `DailyCoachPlan` types and a deterministic plan builder.
2. Add a `LexicalEntry` adapter around current `WordData`.
3. Refactor Today to consume `DailyCoachPlan` for its primary mission and evidence panel.
4. Add a Coach entry action from Today that starts the selected plan in Coach Studio.
5. Rename the product language around Vocabulary toward Lexicon without breaking routes.
6. Add focused tests for the new plan builder and dictionary adapter.

This slice should not attempt to rebuild every practice page.

## Acceptance Criteria

- A new user can open Today and see one clear coach-selected task.
- A returning user sees a task chosen from due review, weak topic, exam goal, or daily word state.
- Today does not read as a feature catalog.
- Coach can receive the daily plan as context.
- Word data can be rendered through `LexicalEntry` without changing the existing database immediately.
- Completion of a task writes or routes durable learning evidence.
- Mobile 375px has no horizontal overflow or compressed side panels.

## Spec Self-Review

- No unresolved placeholders remain.
- Scope is limited to the first Daily Coach OS slice.
- Dictionary work is explicitly a kernel/adaptor, not a full corpus rebuild.
- The design preserves existing routes while changing hierarchy and language.
- The implementation path includes tests and browser smoke.
