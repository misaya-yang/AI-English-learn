# VGUI-08 Liquid Glass Research Baseline And Route Plan Report

Date: 2026-06-20
Status: passed
Feature oracle item: VGUI-F008

## Summary

Reopened the completed global UI harness for the new 2026-06-20 Apple-inspired Liquid Glass full-site objective. The previous VGUI-00 through VGUI-07 evidence remains historical baseline only; it is not proof that the new objective is complete.

The new active chain is:

```text
VGUI-08 -> VGUI-09 -> VGUI-10 -> VGUI-11 -> VGUI-12 -> VGUI-13
```

## Research Evidence

Sources used:

- Apple Liquid Glass: https://developer.apple.com/documentation/technologyoverviews/liquid-glass
- Apple Adopting Liquid Glass: https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
- Apple HIG Materials: https://developer.apple.com/design/human-interface-guidelines/materials
- MDN backdrop-filter: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- MDN prefers-reduced-transparency: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-transparency
- Chrome prefers-reduced-transparency: https://developer.chrome.com/blog/css-prefers-reduced-transparency
- web.dev high-performance CSS animations: https://web.dev/articles/animations-guide
- MDN CSS performance optimization: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS

Implementation conclusions:

- Web work must be described as an approximation, not official Apple Liquid Glass.
- `backdrop-filter` needs transparent or partially transparent surfaces and must account for backdrop roots.
- Reduced transparency should make glass layers near-solid or relocate overlay text.
- Motion should prefer `transform` and `opacity`; layout/paint-triggering animation is a risk.
- `will-change` is not a blanket optimization and should be used sparingly.

## Route Inventory

Public/auth/legal/entry routes:

- `/`
- `/word-of-the-day`
- `/demo`
- `/pricing`
- `/terms`
- `/privacy`
- `/login`
- `/register`
- `/magic-link`
- `/auth/callback`
- `/onboarding`

Authenticated dashboard routes:

- `/dashboard/today`
- `/dashboard/review`
- `/dashboard/practice`
- `/dashboard/exam`
- `/dashboard/vocabulary`
- `/dashboard/analytics`
- `/dashboard/chat`
- `/dashboard/memory`
- `/dashboard/reading`
- `/dashboard/listening`
- `/dashboard/grammar`
- `/dashboard/leaderboard`
- `/dashboard/pronunciation`
- `/dashboard/writing`
- `/dashboard/learning-path`
- `/dashboard/settings`
- `/dashboard/profile`

Redirect route:

- `/dashboard` redirects to `/dashboard/today` and must be verified as routing behavior.

## Effect Inventory

The reopened objective covers:

- glass shell and nav layers
- glass control layers
- solid learning/content surfaces
- route reveals
- hover and press states
- active navigation indicators
- skeleton/loading states
- keyboard focus states
- reduced motion
- reduced transparency
- light and dark themes
- mobile touch targets
- overflow and text clipping
- learning retry/reveal correctness
- auth/payment/legal preservation

## Files Changed

Added:

- `phase-08-liquid-glass-research-baseline-and-route-plan.md`
- `phase-09-liquid-glass-tokens-motion-and-shell.md`
- `phase-10-liquid-glass-public-auth-and-entry-surfaces.md`
- `phase-11-liquid-glass-dashboard-core-learning.md`
- `phase-12-liquid-glass-specialist-modules-and-account.md`
- `phase-13-liquid-glass-regression-accessibility-performance-release.md`
- `reports/vgui-08-liquid-glass-research-baseline-and-route-plan-plan.md`
- `reports/vgui-08-liquid-glass-research-baseline-and-route-plan-report.md`

Updated:

- `README.md`
- `phase-manifest.md`
- `source-packet.md`
- `feature-oracle.json`
- `loop-state.json`
- `progress-log.md`
- `agent-handoff.md`
- `continuity-ledger.md`
- `next-window-prompt.md`

## Validation

Passed:

```bash
git diff --check
```

Passed:

```bash
python3 /Users/yang/.codex/skills/prd-phase-harness/scripts/validate_harness_prd.py docs/vocabdaily-global-ui-upgrade-prd --strict --quality-score
```

Output:

```text
Harness validation passed
Quality score: 100 (excellent)
```

## Acceptance Gate Status

- Source packet records current research and route/effect inventory: passed.
- Phase manifest lists VGUI-08 through VGUI-13: passed.
- Feature oracle includes VGUI-F008 through VGUI-F013: passed.
- Loop state points to VGUI-09: passed.
- VGUI-08 report records validation evidence: passed.

## Next Phase

Execute VGUI-09 Liquid Glass Tokens Motion And Shell.

Target feature-oracle item: VGUI-F009.

Primary rule for VGUI-09: shared glass CSS must not break fixed/sticky positioning, must include reduced-preference fallbacks, and must keep dense content on solid readable surfaces.

## Residual Risk

The codebase currently contains a first verified Liquid Glass slice, but many route bodies and effect states are still outside full-route/full-effect verification. Do not claim the full objective complete until VGUI-F009 through VGUI-F013 have evidence.
