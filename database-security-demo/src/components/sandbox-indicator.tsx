'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'

export function SandboxIndicator() {
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    if (!window.confirm('Reset all demo data to its initial state?')) return
    setResetting(true)
    try {
      const res = await fetch('/api/sandbox/reset', { method: 'POST' })
      if (!res.ok) { console.warn('Reset returned', res.status); setResetting(false); return }
      window.location.reload()
    } catch {
      setResetting(false)
    }
  }

  return (
    <>
      <Badge variant="warning">Sandbox</Badge>
      <button
        onClick={handleReset}
        disabled={resetting}
        className="flex items-center gap-1.5 rounded-lg bg-isla-warning/10 px-3 py-1.5 text-xs font-medium text-isla-warning hover:bg-isla-warning/20 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
        {resetting ? 'Resetting...' : 'Reset Data'}
      </button>
    </>
  )
}
