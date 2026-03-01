import { invokeEdgeFunction } from './aiGateway';
import type { BillingCheckoutRequest, BillingCheckoutResponse, SubscriptionState } from '@/types/examContent';

export interface EntitlementCheckResponse {
  userId: string;
  plan: 'free' | 'pro';
  quota: {
    aiAdvancedFeedbackPerDay: number;
    simItemsPerDay: number;
    microLessonsPerDay: number;
  };
  periodStart: string;
  periodEnd: string;
  provider?: 'edge' | 'fallback';
  subscription?: SubscriptionState;
}

export const createBillingCheckout = async (
  request: BillingCheckoutRequest,
): Promise<BillingCheckoutResponse> => {
  return invokeEdgeFunction<BillingCheckoutResponse>('billing-create-checkout', request);
};

export const getSubscriptionEntitlement = async (): Promise<EntitlementCheckResponse> => {
  return invokeEdgeFunction<EntitlementCheckResponse>('entitlement-check', {});
};
