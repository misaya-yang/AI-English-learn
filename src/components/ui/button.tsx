import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold shadow-none transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-180 ease-out active:scale-[0.985] active:opacity-95 disabled:pointer-events-none disabled:scale-100 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-primary text-primary-foreground hover:border-primary/24 hover:bg-primary/94",
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
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-lg px-7 has-[>svg]:px-5",
        icon: "h-10 w-10 min-w-10 p-0",
        "icon-sm": "h-9 w-9 min-w-9 p-0",
        "icon-lg": "h-11 w-11 min-w-11 p-0",
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
