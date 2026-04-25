import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { LearningCockpitShell } from './LearningCockpitShell';

const renderShell = (props: Partial<React.ComponentProps<typeof LearningCockpitShell>> = {}) =>
  render(
    <MemoryRouter>
      <LearningCockpitShell
        eyebrow="Today mission"
        mission={{
          title: 'Pick the highest-impact next step',
          description: 'Why this is the best mission for today.',
          estimatedMinutes: 12,
          primaryAction: { label: 'Continue', href: '/dashboard/today' },
          ...((props.mission ?? {}) as object),
        }}
        language={props.language ?? 'en'}
        {...props}
      >
        <div data-testid="page-body">page body</div>
      </LearningCockpitShell>
    </MemoryRouter>,
  );

describe('LearningCockpitShell', () => {
  it('renders the cockpit container with the mission title and body', () => {
    renderShell();
    const cockpit = screen.getByTestId('learning-cockpit');
    expect(cockpit).toBeInTheDocument();
    expect(within(cockpit).getByText('Pick the highest-impact next step')).toBeInTheDocument();
    expect(screen.getByTestId('page-body')).toBeInTheDocument();
  });

  it('renders the eyebrow and the why-paragraph as the hero description', () => {
    renderShell();
    expect(screen.getByText('Today mission')).toBeInTheDocument();
    expect(screen.getByText('Why this is the best mission for today.')).toBeInTheDocument();
  });

  it('falls back to an estimated-time chip when no metrics are supplied', () => {
    renderShell();
    expect(screen.getByText('Estimated time')).toBeInTheDocument();
    expect(screen.getByText('12 min')).toBeInTheDocument();
  });

  it('uses Chinese fallback chip label on zh-* learners', () => {
    renderShell({ language: 'zh-CN' });
    expect(screen.getByText('预计用时')).toBeInTheDocument();
  });

  it('renders the primary action as a router Link when href is supplied', () => {
    renderShell();
    const link = screen.getByRole('link', { name: 'Continue' });
    expect(link).toHaveAttribute('href', '/dashboard/today');
  });

  it('renders the primary action as a button when only onClick is supplied', () => {
    const onClick = vi.fn();
    renderShell({
      mission: {
        title: 'Restart this round',
        primaryAction: { label: 'Restart', onClick, testId: 'restart-cta' },
      },
    });
    const cta = screen.getByTestId('restart-cta');
    fireEvent.click(cta);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('caps secondary actions at 2 to keep the hero focused', () => {
    renderShell({
      mission: {
        title: 'Open dashboard',
        primaryAction: { label: 'Primary', href: '/dashboard/today' },
        secondaryActions: [
          { label: 'Second', href: '/dashboard/review' },
          { label: 'Third', href: '/dashboard/practice' },
          { label: 'Fourth', href: '/dashboard/chat' },
        ],
      },
    });
    expect(screen.queryByRole('link', { name: 'Fourth' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Second' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Third' })).toBeInTheDocument();
  });

  it('renders the why-badge above the hero when whyBadge is supplied', () => {
    renderShell({
      mission: {
        title: 'Reduce backlog with a lighter review block',
        primaryAction: { label: 'Open review', href: '/dashboard/review' },
        why: { reason: 'recovery_mode' },
      },
    });
    expect(screen.getByTestId('mission-why-badge')).toBeInTheDocument();
  });

  it('does not render the why-badge when whyBadge is omitted', () => {
    renderShell();
    expect(screen.queryByTestId('mission-why-badge')).toBeNull();
  });

  it('forces recovery framing on the why-badge when burnoutRisk is critical', () => {
    renderShell({
      mission: {
        title: 'Stable run',
        primaryAction: { label: 'Continue', href: '/dashboard/today' },
        why: { reason: 'today_words', burnoutRisk: 0.9 },
      },
    });
    expect(screen.getByTestId('mission-why-badge').getAttribute('data-variant')).toBe('recovery');
  });

  it('renders progress when supplied', () => {
    renderShell({ progress: 42, progressLabel: 'Round progress' });
    expect(screen.getByText('Round progress')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('omits actions when neither primary nor secondary actions are present', () => {
    renderShell({
      mission: {
        title: 'Read-only summary',
      },
    });
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
