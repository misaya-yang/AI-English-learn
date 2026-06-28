# Branch Management Principles

## Core Branch Policy
- Keep only two permanent branches in normal flow: `main` and `dev`.
- All regular development work happens on `dev`.
- User review and acceptance are required before merging `dev` into `main`.

## Complex Feature Branching
- For complex development, start from `dev` and create temporary branches named:
  - `dev_MMDD`
  - `MMDD` is 4 digits for month and day (e.g., `dev_0628`, `dev_0415`).
- These branches are feature/epic temporary tracks and are not permanent.

## Merge and Cleanup Rule
- Merge back to `dev` after completion and local verification.
- After user approves and branch is merged, delete the temporary branch immediately.
- Preserve `main` and `dev` as always-on long-lived branches.

## Safety Rule
- Only delete a branch when no pending work remains and all needed changes are already merged into the target branch.
- Never delete `main` or `dev`.
