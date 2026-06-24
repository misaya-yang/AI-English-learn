import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[background-color,border-color,color,box-shadow,opacity] duration-180 active:opacity-90 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-primary text-primary-foreground shadow-none hover:border-primary/24 hover:bg-primary/94",
        glass:
          "liquid-glass-control liquid-glass-interactive rounded-lg border-transparent border bg-transparent text-foreground hover:text-foreground",
        glassPrimary:
          "liquid-glass-control liquid-glass-interactive rounded-lg border-transparent border bg-primary/10 text-primary hover:text-primary",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground hover:border-destructive/24 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/72",
        outline:
          "border border-transparent bg-[hsl(var(--surface-raised)/0.58)] text-foreground hover:border-[hsl(var(--border-strong)/0.5)] hover:bg-muted/70 dark:bg-card/55 dark:hover:bg-muted/80",
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
