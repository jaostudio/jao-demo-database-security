'use client'

import { motion } from 'framer-motion'
import { KeyRound, ShieldCheck, Network, Database, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { label: 'Auth Session', desc: 'JWT validated', icon: KeyRound },
  { label: 'RBAC Guard', desc: 'Role checked', icon: ShieldCheck },
  { label: 'Tenant Scope', desc: 'orgId resolved', icon: Network },
  { label: 'Turso Query', desc: 'SQL executed', icon: Database },
  { label: 'Audit Event', desc: 'Action logged', icon: ClipboardCheck },
]

export function DatabasePipeline() {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          className="flex items-center gap-4 py-3"
        >
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            'bg-isla-glass border border-isla-border',
          )}>
            <step.icon className="w-4 h-4 text-isla-violet" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-isla-white">{step.label}</div>
            <div className="text-xs text-isla-muted">{step.desc}</div>
          </div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: 24 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 + 0.2, duration: 0.3 }}
              className="w-px bg-isla-border mx-auto"
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
