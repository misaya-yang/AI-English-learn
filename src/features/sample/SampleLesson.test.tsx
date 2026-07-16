import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { SampleLesson } from './SampleLesson';

const renderLesson = () =>
  render(
    <MemoryRouter>
      <SampleLesson
        isZh={false}
        continueHref="/register?redirect=%2Fdashboard%2Ftoday"
        requiresSignIn
      />
    </MemoryRouter>,
  );

describe('SampleLesson', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the sample word and recall prompt before feedback', () => {
    renderLesson();

    expect(screen.getByRole('heading', { name: 'Try one word exercise' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'mitigate' })).toBeInTheDocument();
    expect(screen.getByText('Small daily habits can ___ exam stress.')).toBeInTheDocument();
    expect(screen.queryByTestId('sample-feedback')).not.toBeInTheDocument();
    expect(screen.getByText('This public sample does not write to account or local learning progress.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
  });

  it('shows corrective feedback for a wrong recall without a save CTA', () => {
    renderLesson();

    fireEvent.change(screen.getByLabelText('Type the missing word'), { target: { value: 'reduce' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByTestId('sample-feedback')).toHaveTextContent('Close, not quite.');
    expect(screen.getByTestId('sample-feedback')).toHaveAttribute('data-feedback-kind', 'incorrect');
    expect(screen.getByTestId('sample-feedback-icon-incorrect')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /continue/i })).not.toBeInTheDocument();
  });

  it('shows an honest continuation CTA after a correct answer', () => {
    renderLesson();

    fireEvent.change(screen.getByLabelText('Type the missing word'), { target: { value: 'Mitigate' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByTestId('sample-feedback')).toHaveTextContent('Correct.');
    expect(screen.getByTestId('sample-feedback')).toHaveAttribute('data-feedback-kind', 'correct');
    expect(screen.getByTestId('sample-feedback-icon-correct')).toBeInTheDocument();
    expect(screen.getByText('1 sentence completed')).toBeInTheDocument();
    expect(screen.getByText('Feedback checked')).toBeInTheDocument();
    expect(screen.getByText('Ready to continue')).toBeInTheDocument();
    expect(screen.queryByText('Review card prepared')).not.toBeInTheDocument();
    expect(screen.queryByText('Save this progress')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start free and continue/i })).toHaveAttribute(
      'href',
      '/register?redirect=%2Fdashboard%2Ftoday',
    );
  });

  it('does not write anonymous sample progress into persistent app storage', () => {
    renderLesson();

    fireEvent.change(screen.getByLabelText('Type the missing word'), { target: { value: 'mitigate' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(Object.keys(localStorage).filter((key) => key.startsWith('vocabdaily_'))).toEqual([]);
  });
});
