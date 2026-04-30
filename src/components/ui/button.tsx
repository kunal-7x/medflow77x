import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow font-semibold",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25",
        outline:
          "border border-border/50 bg-transparent hover:bg-secondary/50 hover:border-primary/20 text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        medical: "bg-primary/12 text-primary border border-primary/20 hover:bg-primary/20 font-semibold",
        success: "bg-[hsl(160,50%,42%)]/12 text-[hsl(160,50%,42%)] border border-[hsl(160,50%,42%)]/20 hover:bg-[hsl(160,50%,42%)]/20",
        warning: "bg-warning/12 text-warning border border-warning/20 hover:bg-warning/20",
        emergency: "bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 animate-pulse-glow",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-xl px-3.5 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
        xl: "h-12 rounded-2xl px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
