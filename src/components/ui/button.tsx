import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-180 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-primary/20 bg-primary text-primary-foreground shadow-[0_1px_1px_hsl(var(--shadow-studio)/0.08),0_8px_18px_-18px_hsl(var(--shadow-studio)/0.32)] hover:bg-primary/94 hover:shadow-[0_1px_1px_hsl(var(--shadow-studio)/0.08),0_10px_20px_-18px_hsl(var(--shadow-studio)/0.36)]",
        glass:
          "liquid-glass-control liquid-glass-interactive rounded-lg border-transparent bg-transparent text-foreground hover:text-foreground",
        glassPrimary:
          "liquid-glass-control liquid-glass-interactive rounded-lg border-primary/25 bg-primary/10 text-primary hover:text-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/72",
        outline:
          "border border-border bg-[hsl(var(--surface-raised))] text-foreground shadow-[0_1px_1px_hsl(var(--shadow-studio)/0.035)] hover:border-[hsl(var(--border-strong))] hover:bg-muted/70 dark:bg-card dark:hover:bg-muted/80",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/78",
        ghost:
          "hover:bg-muted/72 hover:text-foreground dark:hover:bg-muted/70",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
