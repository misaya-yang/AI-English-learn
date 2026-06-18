# VGUI-06 Typography, Dark Theme, and Copy Refresh

## Scope

This slice responds to the product review that the app still felt like an AI-generated template: overly bright dark mode, generic system typography, and explanatory copy that repeated what the UI already showed.

## Changes

- Replaced the UI font stack with a warmer humanist stack led by Avenir Next and Nunito Sans, with Chinese fallbacks kept explicit.
- Rebuilt dark theme tokens around true charcoal-gray surfaces instead of the previous high-luminance gray range.
- Split learning surfaces into background, raised, elevated, and sunken layers so Today and Practice no longer read as one mass of same-weight boxes.
- Reduced filled active states in the dashboard sidebar; active navigation now uses a quiet line, border, and muted icon color.
- Shortened visible learning copy in Today and Practice:
  - removed template-like labels such as "Why now", "Lexicon focus", "7-day spark", and "Deep practice";
  - kept concrete labels such as "今天练什么", "内容", "用时", "今日数据", and "需要多练".

## Acceptance Checks

- Dark mode should look like a restrained gray learning workspace, not a pure black cockpit and not a washed-out bright gray UI.
- Public Home, Today, and Practice should remain immediately understandable without long teaching prompts.
- Sidebar and metric panels should support the main task instead of competing with it.
- Light mode remains the default for new or migrated users.

## Files

- `src/index.css`
- `tailwind.config.js`
- `src/features/learning/components/LearningWorkspace.tsx`
- `src/layouts/DashboardLayout.tsx`
- `src/pages/dashboard/TodayPage.tsx`
- `src/pages/dashboard/PracticePage.tsx`
