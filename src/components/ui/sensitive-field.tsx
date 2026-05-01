'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SensitiveFieldProps {
  value: string | number | null | undefined
  label?: string
  maskChar?: string
}

export function SensitiveField({ value, label, maskChar = '\u2022' }: SensitiveFieldProps) {
  const [visible, setVisible] = useState(false)

  if (value === null || value === undefined) {
    return <span className="text-sm text-foreground font-medium">-</span>
  }

  const strValue = String(value)
  const masked = maskChar.repeat(Math.min(strValue.length, 8))

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground font-medium font-mono">
        {visible ? strValue : masked}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide sensitive data' : 'Show sensitive data'}
      >
        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </Button>
    </div>
  )
}
