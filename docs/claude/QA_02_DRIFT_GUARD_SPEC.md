# QA-02 Coach Policy Drift Guard — Spec

Audience: the Dev agent who will implement the test.
Last updated: 2026-04-25.

## The contract

`src/features/coach/coachingPolicy.ts` (Vite/Node, ESM) and
`supabase/functions/_shared/coaching-policy.ts` (Deno, ESM) MUST be
**byte-identical**. The module already documents this in its header
("A byte-identical copy lives at supabase/functions/_shared/...").

Why byte-identity rather than AST equivalence:

- The two runtimes have no shared toolchain, so the simplest provable
  invariant is that the file contents themselves match.
- Any change to one copy must be mirrored to the other. The test failing
  is the signal a developer needs, not an auto-fixer.
- Whitespace differences (trailing newline, BOM, line endings) are real
  drift in a copy-paste contract and should fail the test loudly.

Note for whoever edits the policy: if the two files ever legitimately
need to diverge (e.g., a runtime-specific shim), the whole drift-guard
strategy must be revisited and this spec rewritten — do not silently
relax the test to make a half-mirror compile.

## Test placement

- Path: `src/features/coach/coachingPolicy.drift.test.ts`
- Picked up by `vitest.config.ts` (globs `src/**/*.test.{ts,tsx}`).
- Uses Node `fs/promises` + `path` from `node:` namespace. No new deps.

## Required assertions

1. Read both files as raw `Buffer`s using `fs.readFile(absPath)` with no
   encoding argument. Resolve paths from `process.cwd()` so the test
   works whether vitest is invoked from the repo root or via
   `--config`.
2. Assert `client.equals(edge)` — `Buffer.prototype.equals` returns
   `true` only if every byte matches.
3. On failure, the assertion message must include both file paths AND
   the byte length of each, so the diff is obvious without re-reading.
   Suggested implementation:
   ```ts
   expect(
     client.equals(edge),
     `coaching-policy drift detected:\n` +
       `  ${clientPath} (${client.length} bytes)\n` +
       `  ${edgePath} (${edge.length} bytes)\n` +
       `Run a manual diff to find the offending lines.`,
   ).toBe(true);
   ```
4. Add a second sanity assertion that both files are non-empty
   (`client.length > 0`) so a future accidental empty-file truncation
   produces a clear failure rather than two empty buffers comparing
   equal.

## What NOT to do

- Do not `import` the modules — the Deno copy uses `Deno`-flavoured
  imports in a way Vitest cannot resolve, and importing would defeat
  the byte-equality goal anyway.
- Do not normalise line endings, BOMs, or whitespace before comparing.
  Drift in those bytes is real drift.
- Do not add a watcher / pre-commit auto-copy. The intent is a hard
  failure that forces the developer to update both copies deliberately.
- Do not move the byte comparison into a script outside vitest. The
  test must run in `npm test` so CI catches drift on every change.

## Acceptance check the Test agent will run

```bash
npx vitest run src/features/coach/coachingPolicy.drift.test.ts
```

Must pass on `main` today (the two files are already byte-identical).
The same command must fail if a developer edits one copy without the
other — the Dev agent should manually validate this by temporarily
appending a single space to one file and confirming the test fails.
