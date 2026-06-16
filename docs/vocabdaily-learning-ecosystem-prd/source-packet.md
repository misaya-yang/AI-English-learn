# Source Packet

This packet summarizes the execution source for fresh windows.

- Product: VocabDaily, an English learning app moving toward a learner-owned lexicon, Anki-compatible import/export, daily practice routing, AI coaching, and a calm Modern Learning Workbench UI.
- Primary repo surfaces: `src/pages/dashboard/VocabularyBankPage.tsx`, `src/pages/dashboard/PracticePage.tsx`, `src/pages/dashboard/TodayPage.tsx`, `src/pages/dashboard/ReviewPage.tsx`, `src/pages/dashboard/ChatPage.tsx`, `src/features/learning/components/LearningWorkspace.tsx`, `src/components/DashboardSkeleton.tsx`, `src/services/ankiApkgImport.ts`, `src/services/bookImport.ts`, `src/services/learningEvents.ts`, `src/services/evidenceEvents.ts`, `src/features/practice/attemptState.ts`, `scripts/ui-regression.mjs`, `scripts/learning-flow-regression.mjs`.
- Runtime order: read `loop-contract.json`, `loop-state.json`, `feature-oracle.json`, `progress-log.md`, `agent-handoff.md`, `continuity-ledger.md`, then the target phase file.
- Completed evidence: VLE-00 through VLE-06 phase reports, browser evidence, release smoke evidence, and Vercel deployment evidence.
- Active next phase: none. Operational follow-up is Supabase project/network reachability for `zjkbktdmwencnouwfrij.supabase.co`.
