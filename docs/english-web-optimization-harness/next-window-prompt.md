# Next Window Prompt

Use the `prd-phase-harness` skill.

Repo: `/Users/yang/projects/app`

Harness path: `docs/english-web-optimization-harness`

Context profile: `docs/english-web-optimization-harness/context-profile.json`

Target phase: EN-05, verified terminal phase

Target phase file: `docs/english-web-optimization-harness/phase-EN-05.md`

Target feature-oracle item: EN-F005

Status: five-module English Web harness completed for EN-01 Vocabulary, EN-02 Speaking, EN-03 Listening, EN-04 Reading, and EN-05 Learning Center.

## Loading Order

1. Run `pwd` and confirm `/Users/yang/projects/app`.
2. Read `docs/english-web-optimization-harness/context-profile.json`.
3. Read `docs/english-web-optimization-harness/loop-state.json`.
4. Read `docs/english-web-optimization-harness/feature-oracle.json`.
5. Read `docs/english-web-optimization-harness/reports/en-05-learning-center-report.md`.
6. Read `docs/english-web-optimization-harness/reports/en-05-learning-center-critic.md`.

## Execution Rule

Execute one phase and feature-oracle item only if validation fails: EN-05 and EN-F005. Use the loop cycle `observe, select, execute, verify, record, decide`.

Edit boundaries: this prompt is for a completion audit. Stay inside docs/harness artifacts unless a validator names a code line; if code must change, stay inside EN-05 `LIKELY_EDIT_PATHS`.

Validation: run the custom contract audit below before making new claims. Preserve evidence paths and do not replace existing phase reports unless a gate fails.

Continuity ledger: if a fix is required, update `docs/english-web-optimization-harness/continuity-ledger.md`.

Code summary writeback: if code changes are required, update the EN-05 writeback in the source packet at `docs/english-web-optimization-harness/source-packet.md`.

Progressive disclosure: do not load broader repo files unless a validation error or fresh finding names them.

Stop conditions: stop and document if production credentials, deployment, Supabase migration, provider dashboard mutation, package-lock changes, secrets, or destructive clear-data confirmation are required.

## First Executable Instruction

Run a completion audit, not a new implementation phase:

```bash
pwd
python3 - <<'PY'
import json
import pathlib
import re
import sys

root = pathlib.Path("docs/english-web-optimization-harness")
required_root = [
    "phase-manifest.md",
    "source-packet.md",
    "context-profile.json",
    "loop-contract.json",
    "loop-state.json",
    "feature-oracle.json",
    "progress-log.md",
    "continuity-ledger.md",
    "agent-handoff.md",
    "next-window-prompt.md",
]
anchors = [
    "PHASE_ID",
    "GOAL_TARGET",
    "GOAL_PROMPT",
    "DEPENDS_ON",
    "READ_FIRST",
    "PRIMARY_CONTEXT",
    "LIKELY_EDIT_PATHS",
    "DO_NOT_EDIT",
    "EXECUTION_MODE",
    "VALIDATION_COMMANDS",
    "BROWSER_CHECKS",
    "REGRESSION_SCOPE",
    "COMPLIANCE_GATES",
    "ROLLBACK_PLAN",
    "ACCEPTANCE_GATES",
    "EVIDENCE_OUTPUT",
    "STOP_CONDITIONS",
]
failures = []

for name in required_root:
    if not (root / name).exists():
        failures.append(f"missing root file: {name}")

phase_files = sorted(root.glob("phase-EN-0[1-5].md"))
expected = [root / f"phase-EN-{idx:02d}.md" for idx in range(1, 6)]
if phase_files != expected:
    failures.append(f"phase files must be exactly {[p.name for p in expected]}, got {[p.name for p in phase_files]}")

numeric_phase_files = [
    p.name for p in root.glob("phase-*.md")
    if p.name != "phase-manifest.md" and not re.fullmatch(r"phase-EN-0[1-5]\.md", p.name)
]
if numeric_phase_files:
    failures.append(f"unexpected phase files: {numeric_phase_files}")

for phase_file in expected:
    text = phase_file.read_text()
    if "## Machine Contract" not in text:
        failures.append(f"{phase_file.name}: missing Machine Contract")
        continue
    if "## Coding Agent Contract" not in text:
        failures.append(f"{phase_file.name}: missing Coding Agent Contract")
    for anchor in anchors:
        if f"- {anchor}:" not in text:
            failures.append(f"{phase_file.name}: missing anchor {anchor}")
    match = re.search(r"## Machine Contract\s*```json\s*(\{.*?\})\s*```", text, re.S)
    if not match:
        failures.append(f"{phase_file.name}: missing parseable Machine Contract JSON")
        continue
    contract = json.loads(match.group(1))
    phase = contract.get("phase", {})
    validation = contract.get("validation", {})
    if phase.get("phase_file") != str(phase_file):
        failures.append(f"{phase_file.name}: phase_file mismatch {phase.get('phase_file')!r}")
    if phase.get("status") != "passed":
        failures.append(f"{phase_file.name}: phase.status must be passed after completion")
    if len(validation.get("commands", [])) < 3:
        failures.append(f"{phase_file.name}: fewer than 3 validation commands")
    if not validation.get("browser_checks"):
        failures.append(f"{phase_file.name}: missing browser checks")
    if "Coding Agent Contract" not in text:
        failures.append(f"{phase_file.name}: missing Coding Agent Contract marker")

combined = "\n".join(p.read_text(errors="ignore") for p in root.rglob("*") if p.is_file())
for bad in ["待" + "完善", "T" + "BD", "{" + "{"]:
    if bad in combined:
        failures.append(f"placeholder marker present: {bad}")

if failures:
    print("CONTRACT AUDIT FAILED")
    for item in failures:
        print(f"- {item}")
    sys.exit(1)

print("CONTRACT AUDIT PASSED: requested phase-EN file contract, anchors, machine contracts, and root files are valid")
PY
```

Then read `docs/english-web-optimization-harness/feature-oracle.json`, `docs/english-web-optimization-harness/loop-state.json`, and `docs/english-web-optimization-harness/reports/en-05-learning-center-critic.md`. Do not modify code unless the audit or those artifacts fail with a concrete finding.

## Evidence Index

| Phase | Actor report | Critic artifact | Browser evidence |
|---|---|---|---|
| EN-01 | `reports/en-01-vocabulary-report.md` | `reports/en-01-vocabulary-critic.md` | `product-audit-2026-06-28/en-01-vocabulary/` |
| EN-02 | `reports/en-02-speaking-report.md` | `reports/en-02-speaking-critic.md` | `product-audit-2026-06-28/en-02-speaking/` |
| EN-03 | `reports/en-03-listening-report.md` | `reports/en-03-listening-critic.md` | `product-audit-2026-06-28/en-03-listening/` |
| EN-04 | `reports/en-04-reading-report.md` | `reports/en-04-reading-critic.md` | `product-audit-2026-06-28/en-04-reading/` |
| EN-05 | `reports/en-05-learning-center-report.md` | `reports/en-05-learning-center-critic.md` | `product-audit-2026-06-28/en-05-learning-center/`, `product-audit-2026-06-28/en-05-learning-flow/` |

## Blocking Items and Alternate Paths

| Blocking item | Alternate path |
|---|---|
| Upstream `validate_harness_prd.py --strict` fails with `Missing numbered phase files matching phase-XX-<slug>.md` | This is a known tooling mismatch with the requested `phase-EN-xx` filenames. Use the custom contract audit above, or patch the upstream validator to accept `phase-EN-\\d{2}.md` before treating it as a real harness failure. |
| Custom contract audit fails | Fix only the named artifact or source line; rerun the exact failing command. |
| A future request asks for production Supabase sync proof | Stop and request approval for production smoke credentials and scope; local/demo evidence in this harness is not production sync proof. |
| A future request asks to verify clear-data by confirming the destructive browser dialog | Do not run destructive confirmation without explicit approval; use unit call-path evidence or an isolated disposable browser profile. |
| A future request asks for deployment | Stop and request deployment approval; this harness intentionally did not deploy. |
| A future request asks to edit Supabase schema/functions, billing, provider config, Vercel config, package lock, or secrets | Treat it as outside the completed module harness and require a new scoped task. |
