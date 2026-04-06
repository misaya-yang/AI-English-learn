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

// ─── S24 – Billing / Subscription ────────────────────────────────────────────

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'team';
  name: string;
  nameZh: string;
  price: string; // e.g. "$0"
  priceZh: string;
  period: string;
  features: string[];
  featuresZh: string[];
  limits: {
    dailyWords: number; // -1 = unlimited
    aiChats: number;    // -1 = unlimited
    exports: boolean;
  };
}

export interface SubscriptionStatus {
  planId: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string; // ISO date string
  cancelAtPeriodEnd: boolean;
}

const SUBSCRIPTION_STATUS_KEY = 'vocabdaily_subscription_status';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameZh: '免费版',
    price: '$0',
    priceZh: '¥0',
    period: 'forever',
    features: [
      '10 words per day',
      'Basic review mode',
      '5 AI chats per day',
      'Community support',
    ],
    featuresZh: [
      '每日10个单词',
      '基础复习模式',
      '每日5次AI对话',
      '社区支持',
    ],
    limits: { dailyWords: 10, aiChats: 5, exports: false },
  },
  {
    id: 'pro',
    name: 'Pro',
    nameZh: '专业版',
    price: '$9.99',
    priceZh: '¥68',
    period: 'per month',
    features: [
      'Unlimited words per day',
      'Unlimited AI chats',
      'Advanced AI feedback',
      'Export to CSV / Anki',
      'Priority support',
    ],
    featuresZh: [
      '每日无限单词',
      '无限AI对话',
      '高级AI反馈',
      '导出 CSV / Anki',
      '优先客服支持',
    ],
    limits: { dailyWords: -1, aiChats: -1, exports: true },
  },
  {
    id: 'team',
    name: 'Team',
    nameZh: '团队版',
    price: '$29.99',
    priceZh: '¥199',
    period: 'per month',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Team progress dashboard',
      'Dedicated account manager',
    ],
    featuresZh: [
      '包含专业版所有功能',
      '最多10名团队成员',
      '团队进度仪表盘',
      '专属客户经理',
    ],
    limits: { dailyWords: -1, aiChats: -1, exports: true },
  },
];

/** Returns the current subscription status from localStorage, defaulting to the free plan. */
export function getCurrentSubscription(): SubscriptionStatus {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_STATUS_KEY);
    if (raw) return JSON.parse(raw) as SubscriptionStatus;
  } catch {
    // ignore
  }
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return {
    planId: 'free',
    status: 'active',
    currentPeriodEnd: nextYear.toISOString().slice(0, 10),
    cancelAtPeriodEnd: false,
  };
}

/**
 * Checks whether the current subscription allows a given feature/limit.
 *
 * @param feature - One of 'exports', 'dailyWords', 'aiChats'
 * @param value   - For numeric limits: the amount to check against
 */
export function canAccessFeature(feature: 'exports' | 'dailyWords' | 'aiChats', value?: number): boolean {
  const status = getCurrentSubscription();
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === status.planId) ?? SUBSCRIPTION_PLANS[0];

  if (feature === 'exports') return plan.limits.exports;
  if (feature === 'dailyWords') {
    if (plan.limits.dailyWords === -1) return true;
    return (value ?? 0) <= plan.limits.dailyWords;
  }
  if (feature === 'aiChats') {
    if (plan.limits.aiChats === -1) return true;
    return (value ?? 0) <= plan.limits.aiChats;
  }
  return false;
}

/**
 * Returns true when a feature requires a paid plan that the user does not have.
 */
export function isPaywalled(feature: 'exports' | 'dailyWords' | 'aiChats', value?: number): boolean {
  return !canAccessFeature(feature, value);
}

/**
 * Mock checkout – in production this would redirect to Stripe / WeChat Pay.
 * Returns a URL string.
 */
export async function createCheckoutSession(planId: 'pro' | 'team'): Promise<string> {
  return `https://checkout.vocabdaily.ai/session?plan=${planId}&ts=${Date.now()}`;
}

/**
 * Mock cancel subscription – persists a canceled status to localStorage.
 */
export async function cancelSubscription(): Promise<SubscriptionStatus> {
  const current = getCurrentSubscription();
  const updated: SubscriptionStatus = { ...current, cancelAtPeriodEnd: true, status: 'canceled' };
  localStorage.setItem(SUBSCRIPTION_STATUS_KEY, JSON.stringify(updated));
  return updated;
}
