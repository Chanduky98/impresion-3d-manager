import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
    outline: "border border-border text-foreground hover:bg-muted focus:ring-primary",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className, {
        "opacity-50 cursor-not-allowed": disabled || isLoading,
      })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="spinner">●●●</span> : children}
    </button>
  )
}
