import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`
    const errorId = error ? `${checkboxId}-error` : undefined
    const helperId = helperText ? `${checkboxId}-helper` : undefined

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <div className="relative">
            <input
              type="checkbox"
              id={checkboxId}
              className={cn(
                "peer h-4 w-4 shrink-0 rounded-sm border border-input shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary sr-only",
                error && "border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                className
              )}
              ref={ref}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={cn(
                errorId && errorId,
                helperId && helperId
              ).trim() || undefined}
              {...props}
            />
            <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-input bg-background shadow peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground peer-focus-visible:ring-1 peer-focus-visible:ring-ring">
              <Check className="h-3 w-3 opacity-0 peer-checked:opacity-100" />
            </div>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {props.required && (
                <span className="text-destructive ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>
          )}
        </div>
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
