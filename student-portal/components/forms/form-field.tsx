import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, name, type = "text", placeholder, error, required, className, inputProps, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          error={error}
          ref={ref}
          {...inputProps}
          {...props}
        />
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }
