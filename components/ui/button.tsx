import * as React from 'react'
import { ShinyButton } from './shiny-button'
import { cn } from '@/lib/utils'

// Button wrapper component that accepts all ShinyButton props
// plus legacy variant/size props for compatibility (though they're ignored)
type ButtonProps = React.ComponentProps<typeof ShinyButton> & {
  variant?: string;
  size?: string;
  asChild?: boolean; // Accept but ignore for now
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    // Ignore variant, size, asChild props - ShinyButton has its own styling
    return (
      <ShinyButton
        ref={ref}
        className={cn(className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

// Legacy export for compatibility
const buttonVariants = () => ''

export { Button, buttonVariants }
