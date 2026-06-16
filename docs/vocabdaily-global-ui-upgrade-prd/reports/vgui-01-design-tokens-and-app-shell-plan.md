# VGUI-01 Plan - Design Tokens And App Shell

Status: in progress
Date: 2026-06-17
Feature oracle: VGUI-F002

## Design Read

Reading this as: English learning product UI for daily learners, with a calm study-workbench language, using the existing Tailwind and shadcn-style component system.

Dial values:

- Design variance: 4. The app should feel structured and predictable.
- Motion intensity: 2. Route and state transitions should be quiet and functional.
- Visual density: 6. Dashboard surfaces need useful information without looking like a cockpit.

## Plan

| Requirement | Files | Validation |
| --- | --- | --- |
| R1 light-first tokens | `src/index.css`, `index.html` | lint, build, desktop and mobile screenshots for public and dashboard routes |
| R2 readable dark mode | `src/index.css`, `ThemeContext` | light/dark/system screenshot matrix, computed background checks |
| R3 shell and skeleton rules | `index.html`, `DashboardSkeleton`, `App`, dashboard shell | focused skeleton/theme tests, route switch screenshot checks |
| R4 shared component rules | `src/index.css`, `LearningWorkspace`, phase report | screenshot review and report writeback |

## Browser Matrix

Routes:

- `/`
- `/login`
- `/dashboard/today`
- `/dashboard/practice`
- `/dashboard/settings`

Themes:

- light
- dark
- system

Viewports:

- desktop 1440x960
- mobile 390x844

## Acceptance Notes

- No pure black or near-black full-screen surfaces.
- No emerald as default product accent in app shell.
- Public and dashboard fallbacks use learning-task copy, not generic spinner copy.
- Theme initialization key stays aligned between `index.html` and `ThemeProvider`.
- VGUI-F002 is not passing until command evidence and screenshot summary exist.
