"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

// Sonner Toaster that respects the current theme (dark/light).
// Loaded via dynamic(ssr:false) in providers.tsx to avoid removeChild errors.
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "light" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
