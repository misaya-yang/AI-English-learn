"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-transparent bg-transparent shadow-xs transition-all outline-none before:absolute before:left-1/2 before:top-1/2 before:h-[1.15rem] before:w-8 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-input before:transition-colors before:content-[''] data-[state=checked]:before:bg-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:before:bg-input/80 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none relative z-10 block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-1.5 data-[state=unchecked]:-translate-x-1.5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
