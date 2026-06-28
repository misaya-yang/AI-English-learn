# Agent Handoff

## Planner Message

- Built from repository evidence only.
- Target docs path: `docs/english-web-optimization-harness`.
- Start with EN-01 because Vocabulary supplies lexicon and word-progress context used by Speaking, Listening, Reading, and Learning Center.
- Preserve public route contracts and existing local/demo regression path.
- Repaired after subagent and in-app browser recheck. Do not assume `/dashboard/speaking` or `/dashboard/learning-center` exists.
- Browser baseline evidence lives in `product-audit-2026-06-28/english-web-harness-recheck/` and `product-audit-2026-06-28/english-web-harness-recheck-en/`.
- Latest critique-driven evidence lives in `product-audit-2026-06-28/english-web-harness-recheck-current/` after subagents Heisenberg, Chandrasekhar, and Hooke reviewed UI/routes, function/test commands, and harness compliance.
- Key source constraints: Listening/Reading use inline page seed content; roleplay exists but is not proven as Chat's visible route contract; local/demo auth does not prove remote Supabase sync; clear-data and Today hard/due-queue semantics need EN-05 verification.

## Generator Message

- Load `context-profile.json`, `loop-state.json`, and the target phase file first.
- Open only the phase `PRIMARY_CONTEXT` before planning.
- Run the phase's required validation commands plus `git diff --check`; start `npm run dev -- --host 127.0.0.1 --port 5173` before 5173 browser checks and record the server precheck.
- Update `source-packet.md`, `continuity-ledger.md`, `progress-log.md`, `feature-oracle.json`, and a phase report before exit.
- Classify English-mode Chinese as intentional learner content or accidental UI chrome with route, snippet, and source evidence.

## Critic Message

- Review from a separate context.
- Required review inputs: target phase file, actor report, changed-file diff, command evidence, screenshot or runtime evidence, oracle status.
- Verdict values: `approved`, `changes_requested`, `blocked`, or `waived`.
- A waiver must name who/what waived the gate, why, remaining risk, and whether dependent phases may proceed.
- Reject claims that rely on demo/local browser state as production Supabase, provider, billing, or deployment proof.

## Next Target

| Field | Value |
|---|---|
| Target phase | none |
| Target phase file | none |
| Target feature | none |
| Report path | all five phase reports created |
| Critic path | all five critic artifacts created after final EN-05 approval |

## Completed Phase Notes

| Phase | Result | Evidence | Carry-forward |
|---|---|---|---|
| EN-01 | passed | `docs/english-web-optimization-harness/reports/en-01-vocabulary-report.md`; `docs/english-web-optimization-harness/reports/en-01-vocabulary-critic.md`; `product-audit-2026-06-28/en-01-vocabulary/` | Preserve Vocabulary route contracts, import/export behavior, English chrome, and learner-content Chinese classification. Do not rework Vocabulary during EN-02 unless Speaking finds a documented blocker. |
| EN-02 | passed | `docs/english-web-optimization-harness/reports/en-02-speaking-report.md`; `docs/english-web-optimization-harness/reports/en-02-speaking-critic.md`; `product-audit-2026-06-28/en-02-speaking/` | Preserve speech no-result settlement, Pronunciation fallback to Chat, local-only scoring disclosure, and Chat roleplay shell. Do not assume speaking records are persisted. |
| EN-03 | passed | `docs/english-web-optimization-harness/reports/en-03-listening-report.md`; `docs/english-web-optimization-harness/reports/en-03-listening-critic.md`; `product-audit-2026-06-28/en-03-listening/` | Preserve transcript fallback labeling/event evidence, normalized listening scoring, non-zero estimated duration, and no listening-question review-count inflation. EN-04 should check Reading for matching honesty risks. |
| EN-04 | passed | `docs/english-web-optimization-harness/reports/en-04-reading-report.md`; `docs/english-web-optimization-harness/reports/en-04-reading-critic.md`; `product-audit-2026-06-28/en-04-reading/` | Preserve honest built-in practice variation copy, all-answer gating, normalized Reading scoring, evidence-note review coverage, non-zero estimated duration, and no reading-question review-count inflation. EN-05 should treat Reading evidence as local/demo proof only. |
| EN-05 | passed | `docs/english-web-optimization-harness/reports/en-05-learning-center-report.md`; `docs/english-web-optimization-harness/reports/en-05-learning-center-critic.md`; `product-audit-2026-06-28/en-05-learning-center/`; `product-audit-2026-06-28/en-05-learning-flow/` | Learning-center chrome, Today hard/streak copy, Settings reminder gating, Settings clear-data call path, and whole-demand regression are complete. Local/demo evidence still does not prove production Supabase sync; real IndexedDB deletion is not integration-tested because confirmation is destructive. |

## Final Handoff

- Five module phases EN-01 through EN-05 are implemented and validated.
- Do not rely on the upstream `validate_harness_prd.py --strict` command until it supports the requested `phase-EN-01.md` through `phase-EN-05.md` filenames; use the custom contract audit in `next-window-prompt.md` first.
- For any future production release claim, add an approved production smoke pass; this harness intentionally stops at local/demo UI and local-state evidence.
