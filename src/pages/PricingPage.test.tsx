import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Module mocks ────────────────────────────────────────────────────────────
//
// We mock the modules whose real implementations would touch supabase / make
// real network calls. The point of this test is the FAIL-CLOSED UI — we want
// to be sure that when checkout is unavailable, no checkout call is even
// attempted.

const createBillingCheckoutMock = vi.fn();
const getEntitlementMock = vi.fn();
const getSubscriptionEntitlementMock = vi.fn();

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
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

vi.mock('@/features/marketing/pricingAvailability', () => ({
  // Force fail-closed for these tests — this is the production env today.
  getCheckoutStatus: () => ({ kind: 'coming_soon', supportEmail: 'support@vocabdaily.ai' }),
  isCheckoutAvailable: () => false,
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

describe('PricingPage — fail-closed pro checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEntitlementMock.mockResolvedValue({ plan: 'free' });
    getSubscriptionEntitlementMock.mockResolvedValue({
      subscription: { status: 'inactive', provider: 'manual' },
    });
  });

  it('renders the "暂未开放 / Coming soon" banner at the top of the page', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Pro checkout is not yet open/i)).toBeInTheDocument();
    expect(screen.getByText('Pro 订阅暂未开放')).toBeInTheDocument();
  });

  it('renders a "Coming soon · 暂未开放" card body in the Pro plan column', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    const proCard = await screen.findByTestId('pricing-pro-coming-soon');
    expect(proCard).toBeInTheDocument();
    expect(proCard).toHaveTextContent(/Coming soon/i);
    expect(proCard).toHaveTextContent('暂未开放');
  });

  it('does NOT render Stripe / Alipay checkout buttons when checkout is unavailable', () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    // The old UI had explicit "Checkout with Stripe / Alipay" buttons. The
    // fail-closed UI must not render those — we don't want users clicking
    // through to a broken flow.
    expect(screen.queryByRole('button', { name: /Checkout with Stripe/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Checkout with Alipay/i })).not.toBeInTheDocument();
    // The generic "Upgrade to Pro" button is also gone in this state.
    expect(screen.queryByRole('button', { name: /^Upgrade to Pro$/ })).not.toBeInTheDocument();
  });

  it('exposes a mailto link so the user can opt in for launch notification', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    const link = await screen.findByRole('link', { name: /Notify me when it launches/i });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:support@vocabdaily.ai'),
    );
  });

  it('keeps the Free plan CTA interactive (sends users to /register when logged out)', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    const freeLink = screen
      .getAllByRole('link')
      .find((node) => node.getAttribute('href') === '/register');
    expect(freeLink).toBeTruthy();
  });

  it('never invokes createBillingCheckout (no-op even if user clicks anything)', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

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

  it('still surfaces the entitlement-derived "Current plan" tile', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Current plan/i)).toBeInTheDocument();
    expect(screen.getByText('当前方案')).toBeInTheDocument();
  });

  it('does not query entitlement APIs for an unauthenticated guest', async () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getEntitlementMock).not.toHaveBeenCalled();
      expect(getSubscriptionEntitlementMock).not.toHaveBeenCalled();
    });
  });
});
