import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type GlassSurfaceVariant = 'bar' | 'panel' | 'control';

type GlassSurfaceProps<T extends ElementType = 'div'> = {
  as?: T;
  variant?: GlassSurfaceVariant;
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

const variantClass: Record<GlassSurfaceVariant, string> = {
  bar: 'liquid-glass-bar',
  panel: 'liquid-glass-panel',
  control: 'liquid-glass-control',
};

export function GlassSurface<T extends ElementType = 'div'>({
  as,
  variant = 'panel',
  interactive = false,
  className,
  children,
  ...props
}: GlassSurfaceProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      data-slot="glass-surface"
      data-variant={variant}
      className={cn(
        variantClass[variant],
        interactive && 'liquid-glass-interactive',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
