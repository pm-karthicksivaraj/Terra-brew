"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

// No useTheme() — we removed ThemeProvider to prevent hydration errors.
// Theme is hardcoded to "light". Toaster is loaded via dynamic(ssr:false)
// in providers.tsx so it won't cause removeChild errors.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
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
