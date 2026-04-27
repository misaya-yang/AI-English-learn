# VocabDaily UI Modernization Brief

> Date: 2026-04-25
> Source: live browser audit of `https://www.uuedu.online/`
> Audience: Claude Code, product engineers, UI reviewers

## 1. Situation

The current UI is functional, but the visual language reads like a generic AI SaaS template rather than a serious English learning product.

The issue is systemic, not isolated to one component. Public pages, auth pages, and learning entry surfaces share the same visual defaults:

- deep black background
- emerald highlight everywhere
- grid overlays
- glass panels
- very large rounded corners
- glow / blur / translucent borders
- bilingual copy stacked as secondary text

This makes the product feel heavy, cold, and template-generated. It also weakens the learning promise: learners should feel clarity, progress, and guidance, not that they are inside a generic "AI cockpit" demo.

## 2. Browser Audit Notes

Routes checked:

- `/`
- `/pricing`
- `/login`
- `/register`
- `/word-of-the-day`

Observed problems:

1. Homepage mobile first screen is dominated by black grid, green highlight, pill nav, oversized CTA buttons, and a clipped AI Coach demo card. The page communicates "AI SaaS landing page" before it communicates "English learning".
2. Scrolling the homepage reveals repeated rounded glass cards with similar density and similar icon treatment. The sections do not create a strong learning narrative.
3. Auth pages use the same dark grid and glass-card treatment. Login and register look visually polished but emotionally cold; they do not reduce anxiety or feel learner-friendly.
4. Pricing is clearer than the homepage, but it still relies heavily on green, rounded cards, and SaaS plan-table rhythm.
5. Word of the Day has a different surface treatment, but it still sits inside the same dark/green palette and generic card system.
6. Route loading frequently pauses on a dark loading splash before content appears. Even when this resolves, the first impression is slow and heavy.

## 3. New Visual Direction

Recommended direction: **Modern Learning Workbench**.

It should feel:

- calm, useful, and learner-centered
- more like a focused study desk than an AI product launch page
- warm enough for repeated daily use
- structured enough for exam preparation and professional learners
- specific to English learning, not generic productivity software

The design should borrow more from:

- editorial learning apps
- high-quality education dashboards
- quiet productivity tools
- printed study material and annotated notebooks

It should borrow less from:

- Apple glassmorphism
- Vercel-style black grid landing pages
- generic AI SaaS hero pages
- neon "AI assistant" dashboards

## 4. Design Principles

### 4.1 Content First

The first three seconds should answer:

- what can I learn here?
- what should I do today?
- how does this system help me improve?

Do not lead with abstract AI claims. Lead with learning outcomes, examples, and concrete workflows.

### 4.2 Light Mode First

Build the core public and auth surfaces from a light foundation. Dark mode can exist, but it should not define the brand.

Suggested foundation:

- warm white / paper background
- ink-like foreground
- muted sage as brand support
- blue for practice / coach intelligence
- amber for exam / streak / review urgency
- rose only for errors or friction

### 4.3 Use Green Sparingly

Emerald should not be the default color for every badge, button, chart, and icon.

Use semantic color:

- memory / retention: sage or green
- practice / drills: blue
- AI coach: indigo or cyan
- exam prep: amber
- errors / risk: rose
- neutral system state: slate / zinc

### 4.4 Reduce Decorative Effects

Remove or heavily reduce:

- grid overlays
- ambient glow
- bokeh / blob / spotlight effects
- glass panels
- excessive backdrop blur
- glow shadows
- hover lift on every card

Use simple surfaces:

- flat fills
- restrained borders
- subtle dividers
- shadows only where hierarchy needs depth

### 4.5 Reset Geometry

Current UI overuses `rounded-3xl`, `rounded-full`, and `rounded-[28px]`.

Use a smaller radius scale:

- controls: 8-10px
- panels/cards: 10-14px
- hero or large media surfaces: 16px max
- pills only for true pills such as tags and compact status chips

### 4.6 Typography Should Feel Less Mechanical

Current `Manrope + Noto Sans SC` feels cold and "AI dashboard" oriented. If adding remote font loading is not desired, improve through token changes:

- reduce overuse of `font-bold`, `font-semibold`, uppercase labels, and wide letter spacing
- avoid giant display type on compact mobile pages
- treat Chinese copy as first-class content, not a grey subtitle after English
- use clearer type roles: display, section heading, body, meta, label

## 5. Concrete First Scope

Do not redesign the whole app in one commit. Start with a public/auth vertical slice:

1. `src/index.css`
   - introduce new design tokens for the Modern Learning Workbench direction
   - reduce or deprecate glass/glow/grid utilities
   - avoid breaking dashboard pages abruptly

2. `src/pages/Home.tsx`
   - replace the black grid landing hero with a learning-first homepage
   - first viewport should show a real learning scenario, not an abstract AI pitch
   - include a compact "today plan" preview, word/review/practice examples, and a clear CTA

3. `src/features/marketing/AuthShell.tsx`
   - redesign login/register shell on light-first surfaces
   - remove ambient glow/grid/glass panel default
   - keep forms fast, accessible, and calm

4. `src/pages/PricingPage.tsx`
   - keep fail-closed billing honesty
   - simplify comparison so it reads less like a SaaS checkout page

5. `src/pages/WordOfTheDayPage.tsx`
   - make it feel like a daily study artifact: word, example, usage, save action, previous words
   - reduce heavy dark card styling

## 6. Non-Goals

Do not:

- change billing semantics
- make checkout appear live without provider secrets
- rebuild the entire dashboard in the first slice
- add a new UI library
- add decorative SVG hero illustrations
- hide loading problems behind longer animations
- introduce fake metrics or fake testimonials
- remove i18n support

## 7. Verification

For each UI loop:

1. Run relevant tests if touched logic has tests.
2. Run `npm run build`.
3. Start local dev server.
4. Browser-smoke desktop and mobile widths for:
   - `/`
   - `/login`
   - `/register`
   - `/pricing`
   - `/word-of-the-day`
5. Confirm:
   - no horizontal overflow at 375px
   - text does not overlap or clip
   - CTA labels fit
   - loading state is not visually dominant
   - the page does not read as black/green/glass template

## 8. Review Rubric

A change is successful when:

- the homepage reads as an English learning product before it reads as an AI product
- public pages no longer rely on black grid + emerald glow as their identity
- auth pages feel calm, trustworthy, and fast
- components have clear hierarchy without all being rounded glass cards
- Chinese and English copy feel intentionally composed
- mobile first viewport looks complete, not clipped

