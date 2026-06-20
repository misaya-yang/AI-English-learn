import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GlassSurface } from './glass-surface';

describe('GlassSurface', () => {
  it('renders the requested semantic element and variant class', () => {
    render(
      <GlassSurface as="nav" variant="bar" aria-label="Primary navigation">
        Navigation
      </GlassSurface>,
    );

    const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(nav).toHaveAttribute('data-slot', 'glass-surface');
    expect(nav).toHaveAttribute('data-variant', 'bar');
    expect(nav).toHaveClass('liquid-glass-bar');
  });

  it('adds the interactive class only when requested', () => {
    const { rerender } = render(
      <GlassSurface variant="control">Control</GlassSurface>,
    );

    expect(screen.getByText('Control')).not.toHaveClass('liquid-glass-interactive');

    rerender(
      <GlassSurface variant="control" interactive>
        Control
      </GlassSurface>,
    );

    expect(screen.getByText('Control')).toHaveClass('liquid-glass-interactive');
  });
});
