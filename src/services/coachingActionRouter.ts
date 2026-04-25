// Routes coaching actions emitted by the AI coach into concrete side-effects.
//
// Today the only side-effect is "persist scheduleable actions into the
// coach review queue" — i.e. the `schedule_review` and `retry_with_hint`
// types from the COACHING_POLICY contract. Everything else (Socratic
// questions, micro tasks, celebration, reflection prompts) is purely UI
// surface and is handled in the chat reply rendering path.
//
// Keeping the router separate from the policy module lets us unit-test
// the persistence logic without coupling the policy to a storage layer.

import {
  toReviewQueueItems,
  type CoachingAction,
  type ReviewQueueItem,
} from '@/features/coach/coachingPolicy';
import { addCoachReviewItems } from './coachReviewQueue';

export interface ApplyCoachingActionsResult {
  reviewItems: ReviewQueueItem[];
  persisted: number;
}

export async function applyCoachingActions(
  userId: string,
  actions: CoachingAction[] | undefined,
  opts: { userInputRef?: string; now?: Date } = {},
): Promise<ApplyCoachingActionsResult> {
  if (!Array.isArray(actions) || actions.length === 0) {
    return { reviewItems: [], persisted: 0 };
  }

  const reviewItems = toReviewQueueItems(actions, opts);
  if (reviewItems.length > 0) {
    await addCoachReviewItems(userId, reviewItems);
  }

  return {
    reviewItems,
    persisted: reviewItems.length,
  };
}
