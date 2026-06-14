# VocabDaily UI Audit - 2026-06-14

## Scope

- Product: VocabDaily English learning app.
- Mode: Product, UX, visual, and screenshot-based accessibility audit.
- Evidence captured in this run only.
- Viewports: desktop `1440x960`, mobile `390x844`.
- Screens captured: 27 routes x 2 viewports = 54 screenshots.

## Evidence

- Desktop contact sheet: `screenshots/contact-sheet-desktop-view.png`
- Mobile contact sheet: `screenshots/contact-sheet-mobile-view.png`
- Raw screenshots: `screenshots/01-home-desktop.png` through `screenshots/27-profile-mobile.png`
- Capture metadata: `screenshots/capture-results.json`

Automated screenshot metadata found no horizontal overflow in the 54 captured states. Accessibility notes below are screenshot-based risks only, not a full WCAG claim.

## Overall Diagnosis

The app is now visibly more premium on Home, Today, shared Card surfaces, and the learning shell. The remaining issue is unevenness: some pages feel like a polished learning cockpit, while others still feel like admin forms, raw MVP lists, or old card stacks.

The strongest direction is clear: VocabDaily should feel like a focused daily learning workbench. The next upgrade should spread that design language across Practice, Coach, Exam, specialty skill pages, Settings/Profile, and empty states.

## Cross-App Strengths

- Navigation is broad but functional across desktop and mobile.
- Mobile screenshots show no horizontal overflow.
- Today has the clearest premium learning direction: mission, evidence chips, primary CTA, word workspace, and bottom nav.
- Home now gives a credible first impression and explains the product without feeling like a generic AI landing page.
- Auth screens are clean and understandable.

## Biggest UX Risks

1. Inconsistent visual maturity across pages.
   Today/Home feel like the upgraded product. Reading, Listening, Grammar, Writing, Pronunciation, Settings, Profile, Analytics, and Memory still look closer to standard form/list screens.

2. Dashboard information architecture is too wide.
   The app exposes Today, Review, Practice, Chat, Exam, Vocabulary, Analytics, Memory, Reading, Listening, Grammar, Pronunciation, Writing, Learning Path, Leaderboard, Settings, Profile. This makes the product feel feature-heavy instead of guided.

3. Mobile first action varies by screen.
   Today now shows the word workspace in the first viewport. Practice and Review are understandable. Chat, Exam, and the specialty skill pages still compete for attention with too many panels or list items.

4. Empty and zero-data states feel low-trust.
   Analytics has many zero cards. Memory shows a warning plus empty state. Review empty state is functional but oversized. These moments should explain what the learner can do next and why the app still has value.

5. Locale consistency is weak.
   Several captured screens mix Chinese and English in user-facing controls: Settings has `设定 • Customize your learning experience`, `Theme`, `Font Size`, `Save Changes`; Practice uses `Multiple Choice`, `Fill in the Blank`, `Listening Quiz`, `Writing Practice`; pricing uses FREE/PRO labels. This directly reduces polish.

6. Legacy styling remains widespread.
   Code scan found many `rounded-xl/rounded-2xl`, raw old `bg-card` surfaces, raw emoji in serious UI states, and old MVP card patterns. These make the app feel like multiple products stitched together.

## Accessibility Risks From Screenshots

- Muted grey body copy is sometimes small and low contrast, especially in sidebar descriptions, legal pages, list metadata, and secondary hints.
- Icon-only controls in headers need confirmed labels and focus states. Screenshots cannot prove this.
- Bottom nav targets look reasonable, but the More route could hide important learning actions from screen reader and keyboard users if not labeled clearly.
- Some pages rely heavily on color chips for status. Status text should remain explicit.
- Empty states with sparse content may be semantically fine, but the next action is not always obvious.

## Priority Todo List

### P0 - Make The Product Feel Coherent

1. Define a route-level UI contract.
   Every dashboard screen should use one of three templates: daily cockpit, active drill, or management console. Do not let each page invent its own hero/card/list language.

2. Finish visual token migration.
   Replace legacy page-level `rounded-xl/2xl`, raw `bg-card`, and ad hoc shadows with the new premium panel utilities or a small set of approved surfaces.

3. Fix mixed-language UI copy.
   Settings, Profile, Practice, Pricing, Exam, and specialty skill pages need full zh/en copy paths. No `Save Changes`, `Multiple Choice`, or FREE/PRO labels in Chinese mode unless intentionally branded.

4. Redesign empty and zero-data states.
   Analytics, Memory, Review, Profile, and Leaderboard need guidance-rich empty states with a primary next action, one reason, and one useful preview.

### P1 - Improve Learning Flow

5. Collapse specialty routes into Practice modes.
   Reading, Listening, Grammar, Pronunciation, Writing should feel like modes under Practice, not separate product pillars competing with Today and Review.

6. Make Chat feel like a coach session, not a messaging utility.
   Mobile Chat has too many visible panels before the learner asks anything. Move diagnosis cards into a compact session brief and make the input plus suggested next prompt the center.

7. Make Exam Prep more guided.
   It has useful parts, but desktop has several competing panels. Turn it into a step-by-step IELTS sprint: diagnose, choose band target, write/simulate, review, retry.

8. Make Vocabulary less admin-like.
   The current page is functional but looks like a database manager. Add a featured word entry preview, mastery lanes, and a more editorial dictionary feel.

### P2 - Add Premium Learning Emotion

9. Give skill pages a signature visual moment.
   Reading can show passage preview and question mix. Listening can show audio waveform/session player. Pronunciation can show phoneme score/waveform. Writing can show rubric bands and revision loop.

10. Add session completion moments.
   Practice, Reading, Listening, Grammar, Pronunciation, and Writing need consistent completion states with what improved, what to review, and what to do next.

11. Use better progress language.
   Replace generic zeros with warmer learning states: `尚未开始`, `今天第一步`, `需要一次练习生成图谱`, etc.

12. Make desktop use space better.
   Many desktop pages are centered and sparse. Add right rails with context, next action, or coach notes only when useful.

## Per-Screen Audit

| Step | Screen | Health | Notes |
| --- | --- | --- | --- |
| 01 | Home | Good | Stronger than before. Clear product story and useful preview. Still could use richer real learning proof below the fold. |
| 02 | Word of the Day | Good / needs polish | Focused, calm, readable. Card feels slightly static; could add practice outcome, save/share confidence, and richer example treatment. |
| 03 | Sample Lesson | Needs polish | The learning loop is understandable, but the page feels like a small form plus card. Needs stronger sense of progression and reward. |
| 04 | Pricing | Needs polish | Clear enough, but mobile is long and the Pro unavailable warning can feel negative. Needs more trust and less administrative copy. |
| 05 | Terms | Serviceable | Clean legal layout. Low priority, but body text density and contrast should be checked. |
| 06 | Privacy | Serviceable | Same as Terms. Functional but plain. |
| 07 | Login | Good | Clear and compact on mobile. Desktop has a lot of blank space but overall healthy. |
| 08 | Register | Needs polish | Form is understandable but dense. Password rules and fields create a heavy first impression. |
| 09 | Magic Link | Good / thin | Clean, but lacks reassurance about email delivery, expiry, and fallback. |
| 10 | Onboarding | Risk | Captured route redirected to login when unauthenticated, so the real onboarding flow was not visible in this audit state. This is a product-flow risk if users cannot easily resume onboarding. |
| 11 | Today | Good | Best expression of the upgraded product. Mobile still has a long mission block, but the word workspace appears in the first viewport. |
| 12 | Review | Good / empty-state risk | Empty state is understandable. It should feel more like memory training and less like a big blank success panel. |
| 13 | Practice | Needs polish | Mode picker is clear, but English labels in Chinese mode and large plain cards reduce polish. Needs stronger recommendation logic presentation. |
| 14 | Coach / Chat | Needs work | Powerful but crowded on mobile. Header, coach brief, prompt cards, chips, and input compete. Needs a tighter session-first layout. |
| 15 | Exam Prep | Good / dense | Useful and credible. Desktop has too many adjacent panels; mobile is clearer. Needs stronger guided sprint flow. |
| 16 | Vocabulary | Needs polish | Functional dictionary management, but visually admin-like. Needs a richer word/detail preview and less database-page feeling. |
| 17 | Analytics | Risk | Zero-data state dominates. It says the app has no evidence yet but does not create confidence or guide the next action strongly enough. |
| 18 | Memory | Risk | Warning plus empty state can feel broken or alarming. Needs softer trust-building explanation and setup action. |
| 19 | Reading | Needs polish | Content cards are usable. Page lacks a premium learning moment or active reading preview. |
| 20 | Listening | Needs polish | Cards are clear, but no audio-first feel in the list state. Needs player/waveform/session affordance. |
| 21 | Grammar | Needs polish | Useful categories, but looks like a list of lessons. Needs examples, common mistakes, and active drill preview in first viewport. |
| 22 | Leaderboard | Good / generic | Visually more engaging than most utility pages. Needs clearer weekly challenge and relevance to personal learning. |
| 23 | Pronunciation | Needs polish | Clean and focused, but desktop has too much empty space and lacks waveform/score expectation. |
| 24 | Writing | Needs work | Functional form, but too plain for a high-value AI feedback feature. Needs rubric, revision loop, and feedback preview. |
| 25 | Learning Path | Good | Good narrative and direction. Needs stronger progress visualization and next lesson framing. |
| 26 | Settings | Needs work | Layout is fine, but mixed English/Chinese labels make it feel unfinished. Needs localized controls and grouped hierarchy. |
| 27 | Profile | Needs polish | Clean, but generic account/dashboard card language. Needs learner identity, goals, streak, and progress story. |

## Recommended Upgrade Sequence

1. Copy and localization pass across Settings, Practice, Pricing, Profile, Exam, and specialty pages.
2. Apply premium surface system to Practice, Review, Chat, Exam, Vocabulary, Analytics, Memory, and skill pages.
3. Redesign empty states for Analytics, Memory, Review, and Profile.
4. Reframe Reading, Listening, Grammar, Pronunciation, and Writing as Practice modes with shared active-session layout.
5. Redesign Chat as a guided coaching room with a compact brief, one recommended prompt, and a calmer input dock.
6. Add visual learning assets: audio waveform, pronunciation score ring, writing rubric band, reading passage preview, grammar mistake pattern card.

## Evidence Limits

- This audit used demo/local app state. Real returning-user data may change dashboard density and empty states.
- Screenshots cannot prove keyboard access, screen reader labels, live focus order, color contrast ratios, or reduced-motion behavior.
- Onboarding was not visible in the unauthenticated capture and should be re-audited through the actual first-run path.
