"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        return (
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    ref={ref}
                    checked={checked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <div
                    className={cn(
                        "h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-400 peer-focus:ring-offset-2 peer-checked:bg-black dark:bg-slate-700 dark:peer-focus:ring-slate-800",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span
                        className={cn(
                            "absolute left-0.5 top-0.5 z-10 block h-5 w-5 rounded-full bg-white shadow transition-transform",
                            checked ? "translate-x-5" : "translate-x-0"
                        )}
                    />
                </div>
            </div>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
