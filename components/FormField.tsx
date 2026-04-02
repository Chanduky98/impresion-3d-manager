import { ReactNode } from "react"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, error, required = false, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
        error ? "border-destructive" : "border-input"
      } ${className}`}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
        error ? "border-destructive" : "border-input"
      } ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ error, options, className, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
        error ? "border-destructive" : "border-input"
      } ${className}`}
      {...props}
    >
      <option value="">Seleccionar...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
