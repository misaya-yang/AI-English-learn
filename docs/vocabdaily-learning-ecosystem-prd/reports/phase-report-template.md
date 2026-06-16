# Phase Report Template

Use this report shape for every VLE phase. Save the completed report at the `EVIDENCE_OUTPUT` path named by the phase file.

## Phase Summary

- PHASE_ID:
- Phase file:
- Executor:
- Date:
- Status: passed | blocked | waived

## Scope Executed

- Planned work:
- Actual work:
- Scope expansions:
- Scope not executed:

## Evidence Inventory

| Evidence | Path or command | Result |
| --- | --- | --- |
| Plan |  |  |
| Tests |  |  |
| Browser screenshots |  |  |
| Eval traces |  |  |
| Logs or smoke output |  |  |

## Validation Results

| Gate | Command or check | Result | Notes |
| --- | --- | --- | --- |
| Lint | `npm run lint` |  |  |
| i18n | `npm run check:i18n` |  |  |
| Build | `npm run build` |  |  |
| Unit tests | `npm test -- --run` |  |  |
| Browser |  |  |  |

## Acceptance Gate Results

| Acceptance gate | Result | Evidence |
| --- | --- | --- |
|  |  |  |

## Compliance Gate Results

| Compliance gate | Result | Evidence |
| --- | --- | --- |
| Import safety |  |  |
| Privacy |  |  |
| Auth |  |  |
| Accessibility |  |  |
| Licensing |  |  |
| Data retention |  |  |

## Rollback and Recovery

- Rollback path:
- Feature flags or toggles:
- Data cleanup:
- Remaining release risk:

## User Waivers

- Waived gate:
- Waived by:
- Reason:
- Remaining risk:
- Dependent phases may proceed: yes | no

## Next Phase Handoff

- Dependency unlocked:
- Important files changed:
- Known blockers:
- Recommended next phase:
