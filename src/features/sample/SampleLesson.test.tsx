import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { SampleLesson } from './SampleLesson';

const renderLesson = () =>
  render(
    <MemoryRouter>
      <SampleLesson isZh={false} saveProgressHref="/register?redirect=%2Fdashboard%2Ftoday" />
    </MemoryRouter>,
  );

describe('SampleLesson', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the sample word and recall prompt before feedback', () => {
    renderLesson();

    expect(screen.getByRole('heading', { name: 'Try one real learning loop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'mitigate' })).toBeInTheDocument();
    expect(screen.getByText('Small daily habits can ___ exam stress.')).toBeInTheDocument();
    expect(screen.queryByTestId('sample-feedback')).not.toBeInTheDocument();
  });

  it('shows corrective feedback for a wrong recall without a save CTA', () => {
    renderLesson();

    fireEvent.change(screen.getByLabelText('Type the missing word'), { target: { value: 'reduce' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByTestId('sample-feedback')).toHaveTextContent('Close, not quite.');
    expect(screen.queryByRole('link', { name: /Save this progress/i })).not.toBeInTheDocument();
  });

  it('shows the product loop and contextual save CTA after a correct recall', () => {
    renderLesson();

    fireEvent.change(screen.getByLabelText('Type the missing word'), { target: { value: 'Mitigate' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByTestId('sample-feedback')).toHaveTextContent('Correct. The learning loop is complete.');
    expect(screen.getByText('1 recall')).toBeInTheDocument();
    expect(screen.getByText('Feedback generated')).toBeInTheDocument();
    expect(screen.getByText('Review card prepared')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Save this progress/i })).toHaveAttribute(
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
