import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';

// ─── Module mocks ────────────────────────────────────────────────────────────
//
// We mock the modules whose real implementations would touch supabase / make
// real network calls. The point of this test is the FAIL-CLOSED UI — we want
// to be sure that when checkout is unavailable, no checkout call is even
// attempted.

const createBillingCheckoutMock = vi.fn();
const getEntitlementMock = vi.fn();
const getSubscriptionEntitlementMock = vi.fn();
const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  user: null as { id: string } | null,
}));
const checkoutState = vi.hoisted(() => ({
  kind: 'coming_soon' as 'coming_soon' | 'available',
}));
const i18nState = vi.hoisted(() => ({
  language: 'en',
  changeLanguage: vi.fn((code: string) => {
    i18nState.language = code;
    return Promise.resolve();
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      get language() {
        return i18nState.language;
      },
      changeLanguage: i18nState.changeLanguage,
    },
  }),
}));

vi.mock('@/services/billingGateway', () => ({
  createBillingCheckout: (...args: unknown[]) => createBillingCheckoutMock(...args),
  getSubscriptionEntitlement: () => getSubscriptionEntitlementMock(),
}));

vi.mock('@/data/examContent', () => ({
  getEntitlement: (userId: string) => getEntitlementMock(userId),
  getQuotaSnapshot: vi.fn().mockResolvedValue({
    remaining: { aiAdvancedFeedbackPerDay: 0, simItemsPerDay: 0, microLessonsPerDay: 0 },
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/features/marketing/pricingAvailability', () => ({
  getCheckoutStatus: () => ({ kind: checkoutState.kind }),
  isCheckoutAvailable: () => checkoutState.kind === 'available',
}));

// sonner toast is rendered through a portal which needs a Toaster mounted; we
// just stub it.
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import PricingPage from './PricingPage';
import { FREE_JOB, PRO_JOB } from '@/features/marketing/proPackaging';
import { PRO_WAITLIST_STORAGE_KEY } from '@/features/marketing/proWaitlist';
import { toast } from 'sonner';

const renderPricingPage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider defaultTheme="system" storageKey="pricing-test-theme">
        <PricingPage />
      </ThemeProvider>
    </MemoryRouter>,
  );

describe('PricingPage — fail-closed pro checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.className = '';
    i18nState.language = 'en';
    authState.isAuthenticated = false;
    authState.user = null;
    checkoutState.kind = 'coming_soon';
    getEntitlementMock.mockResolvedValue({ plan: 'free' });
    getSubscriptionEntitlementMock.mockResolvedValue({
      subscription: { status: 'inactive', provider: 'manual' },
    });
    createBillingCheckoutMock.mockResolvedValue({
      provider: 'stripe',
      expiresAt: '2026-07-16T12:00:00.000Z',
    });
  });

  it('renders the localized coming-soon banner without mixing Chinese into English mode', async () => {
    const { container } = renderPricingPage();

    expect(screen.getByText(/Pro checkout is not yet open/i)).toBeInTheDocument();
    expect(screen.queryByText('专业版订阅暂未开放')).not.toBeInTheDocument();
    expect(
      container.querySelector('header [data-slot="glass-surface"][data-variant="bar"]'),
    ).toBeInTheDocument();
  });

  it('renders the localized coming-soon banner in Chinese mode', async () => {
    i18nState.language = 'zh';

    renderPricingPage();

    expect(screen.getByText('专业版订阅暂未开放')).toBeInTheDocument();
    expect(screen.queryByText(/Pro checkout is not yet open/i)).not.toBeInTheDocument();
  });

  it('renders a "Coming soon · 暂未开放" card body in the Pro plan column', async () => {
    renderPricingPage();

    const proCard = await screen.findByTestId('pricing-pro-coming-soon');
    expect(proCard).toBeInTheDocument();
    expect(proCard).toHaveTextContent(/Coming soon/i);
    expect(proCard).not.toHaveTextContent('暂未开放');
  });

  it('does NOT render Stripe / Alipay checkout buttons when checkout is unavailable', () => {
    renderPricingPage();

    // The old UI had explicit "Checkout with Stripe / Alipay" buttons. The
    // fail-closed UI must not render those — we don't want users clicking
    // through to a broken flow.
    expect(screen.queryByRole('button', { name: /Checkout with Stripe/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Checkout with Alipay/i })).not.toBeInTheDocument();
    // The generic "Upgrade to Pro" button is also gone in this state.
    expect(screen.queryByRole('button', { name: /^Upgrade to Pro$/ })).not.toBeInTheDocument();
  });

  it('does not offer a fake waitlist, notification request, or checkout while Pro is unavailable', async () => {
    renderPricingPage();

    const proCard = await screen.findByTestId('pricing-pro-coming-soon');
    expect(proCard.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(screen.queryByTestId('pricing-pro-waitlist-button')).not.toBeInTheDocument();
    expect(screen.queryByText(/interest list|you're on the list|notify me/i)).not.toBeInTheDocument();
    expect(proCard).toHaveTextContent(
      'This page cannot create an order, charge, or notification request.',
    );
    expect(localStorage.getItem(PRO_WAITLIST_STORAGE_KEY)).toBeNull();
    expect(createBillingCheckoutMock).not.toHaveBeenCalled();
  });

  it('separates Free and Pro jobs-to-be-done and shows the Pro launch package', async () => {
    renderPricingPage();

    expect(screen.getByText(FREE_JOB.en)).toBeInTheDocument();
    expect(screen.getByText(PRO_JOB.en)).toBeInTheDocument();
    expect(await screen.findByText(/IELTS Writing and Speaking scoring rubrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced analytics: pending reviews, skill trends, mistake patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom wordbook imports plus Anki \/ CSV export/i)).toBeInTheDocument();
    expect(screen.queryByText(/Priority support/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Join the Pro interest list/i)).not.toBeInTheDocument();
  });

  it('starts a real yearly checkout only when checkout is live and the user is authenticated', async () => {
    checkoutState.kind = 'available';
    authState.isAuthenticated = true;
    authState.user = { id: 'user-1' };

    renderPricingPage();

    fireEvent.click(screen.getByRole('switch', { name: 'Toggle yearly pricing' }));
    fireEvent.click(screen.getByRole('button', { name: /Subscribe to Pro/i }));

    await waitFor(() => {
      expect(createBillingCheckoutMock).toHaveBeenCalledWith({
        planId: 'pro_yearly',
        provider: 'stripe',
        successUrl: `${window.location.origin}/pricing?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
      });
    });
    expect(toast.error).toHaveBeenCalledWith(
      'Checkout could not start. No order or charge was created. Please try again later.',
    );
  });

  it('requires a guest to sign in before entering a live checkout flow', () => {
    checkoutState.kind = 'available';

    renderPricingPage();

    expect(screen.getByRole('link', { name: /Sign in to subscribe/i })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fpricing',
    );
    expect(createBillingCheckoutMock).not.toHaveBeenCalled();
  });

  it('keeps the Free plan CTA interactive (sends users to /register when logged out)', async () => {
    renderPricingPage();

    const freeLink = screen
      .getAllByRole('link')
      .find((node) => node.getAttribute('href') === '/register');
    expect(freeLink).toBeTruthy();
  });

  it('never invokes createBillingCheckout (no-op even if user clicks anything)', async () => {
    renderPricingPage();

    // Try clicking everything in the pro plan card. None of these should kick
    // off a real checkout call — the entire button is replaced.
    const proCard = await screen.findByTestId('pricing-plan-pro');
    const clickables = proCard.querySelectorAll('button, a');
    for (const node of Array.from(clickables)) {
      fireEvent.click(node);
    }

    await waitFor(() => {
      expect(createBillingCheckoutMock).not.toHaveBeenCalled();
    });
  });

  it('does not label an unauthenticated guest as having a current plan', () => {
    renderPricingPage();

    expect(screen.queryByText(/Current plan/i)).not.toBeInTheDocument();
  });

  it('surfaces the entitlement-derived "Current plan" tile for an authenticated user', async () => {
    authState.isAuthenticated = true;
    authState.user = { id: 'user-1' };

    renderPricingPage();

    expect(await screen.findByText(/Current plan/i)).toBeInTheDocument();
    expect(screen.queryByText('当前方案')).not.toBeInTheDocument();
    expect(getEntitlementMock).toHaveBeenCalledWith('user-1');
  });

  it('does not query entitlement APIs for an unauthenticated guest', async () => {
    renderPricingPage();

    await waitFor(() => {
      expect(getEntitlementMock).not.toHaveBeenCalled();
      expect(getSubscriptionEntitlementMock).not.toHaveBeenCalled();
    });
  });

  it('puts theme and language controls in the pricing header', async () => {
    renderPricingPage();

    expect(screen.getByRole('button', { name: 'Toggle appearance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();
  });

  it('translates plan features in Chinese mode instead of showing English feature lists', async () => {
    i18nState.language = 'zh';

    renderPricingPage();

    expect(await screen.findByText('每日单词与复习')).toBeInTheDocument();
    expect(screen.queryByText('Daily words and review')).not.toBeInTheDocument();
  });
});
