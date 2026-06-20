import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';

describe('Button liquid glass variants', () => {
  it('keeps the glass variant additive', () => {
    render(<Button variant="glass">Glass action</Button>);

    const button = screen.getByRole('button', { name: 'Glass action' });
    expect(button).toHaveClass('liquid-glass-control');
    expect(button).toHaveClass('liquid-glass-interactive');
  });

  it('keeps the glassPrimary variant readable and interactive', () => {
    render(<Button variant="glassPrimary">Primary glass action</Button>);

    const button = screen.getByRole('button', { name: 'Primary glass action' });
    expect(button).toHaveClass('liquid-glass-control');
    expect(button).toHaveClass('text-primary');
  });
});
