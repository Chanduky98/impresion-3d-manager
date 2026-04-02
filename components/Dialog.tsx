"use client"

import { ReactNode, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./Button"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer && <div className="p-6 border-t border-border flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

interface DialogTriggerProps {
  asChild?: boolean
  children: ReactNode
  onClick?: () => void
}

export function DialogTrigger({ children, onClick }: DialogTriggerProps) {
  return <div onClick={onClick}>{children}</div>
}
