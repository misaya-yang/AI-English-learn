# Agent Runtime Rules (for Codex context)

## 1) Branch Topology (hard constraint)
- MUST keep only two long-lived branches in normal flow: `main` and `dev`.
- MUST do regular development on `dev`.
- MUST NOT commit directly to `main` unless explicitly requested by the user.

## 2) Complex Development Branches
- For complex or high-risk work, MUST branch from `dev`.
- Temporary branch names MUST follow: `dev_MMDD`
  - `MMDD` is 4-digit month/day, e.g., `dev_0628`, `dev_0415`.
- Temporary branches are not long-lived and MUST follow strict cleanup discipline.

## 3) Merge Flow and Approval
- MUST run local verification before merging any temporary branch back to `dev` (scope-appropriate checks; run project checks explicitly if requested).
- MUST merge temporary branch → `dev` first.
- User review and confirmation MUST happen before `dev` is merged into `main`.
- Only `Merge commit` or `squash merge` is acceptable when cleanup is required; avoid leaving dangling WIP merges on `main`.

## 4) Branch Cleanup
- Temporary branches MUST be deleted immediately after successful merge and user confirmation.
- MUST NEVER delete `main` or `dev`.
- MUST only delete a branch when no pending work remains.

## 5) Workspace Hygiene (start and end of every task)
- Before every task, MUST ensure:
  - current branch is `dev`
  - `git status` is clean
  - `main` is synced with `origin/main`.
- After task completion, MUST leave the workspace clean (`git status` no uncommitted changes) unless user explicitly asks to keep draft changes.

## 6) Safety Baseline
- MUST NOT perform force-pushes, `git reset --hard`, or destructive bulk deletes without explicit user confirmation.
- For destructive cleanup in a locked environment, coordinate with the user before force actions unless it is a routine local cleanup already requested.
- If uncertain, ask for clarification before changing workflow structure.
