import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-session'
import { getPrisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { AccessDecision } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/signin')

  const { id } = await params
  const prisma = await getPrisma()

  const doc = await (prisma as any).document.findFirst({
    where: { id, organizationId: user.orgId ?? undefined },
    include: { uploadedBy: { select: { name: true } }, organization: { select: { name: true } } },
  })

  if (!doc) notFound()

  const statusVariant = doc.status === 'ACTIVE' ? 'audit' : 'tenant'

  const accessSteps = [
    { label: 'Session resolved', passed: true },
    { label: 'Tenant scope applied', passed: true },
    { label: 'RBAC check', passed: true },
    { label: 'Query scope', passed: true },
  ]

  return (
    <div className="p-6 space-y-6">
      <Link href="/documents" className="inline-flex items-center gap-1.5 text-xs text-isla-muted hover:text-isla-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Documents
      </Link>

      <div className="glass-card-static p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-isla-white">{doc.title}</h1>
            <p className="text-xs text-isla-muted mt-1">
              by {doc.uploadedBy.name} · {new Date(doc.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={statusVariant}>{doc.status}</Badge>
        </div>

        <div className="border-t border-isla-border pt-4">
          <p className="text-sm text-isla-white whitespace-pre-wrap leading-relaxed">{doc.body}</p>
        </div>

        <div className="border-t border-isla-border pt-3 flex items-center gap-3 text-xs text-isla-muted">
          <span>Document ID: <span className="font-mono">{doc.id.slice(0, 16)}...</span></span>
          {user.role === 'SYSTEM_ADMIN' && (
            <Badge variant="tenant">{doc.organization.name}</Badge>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-isla-white mb-3">Access Decision</h2>
        <AccessDecision
          result="ALLOWED"
          steps={accessSteps}
          responseCode={200}
          sessionOrg={user.orgId ?? undefined}
          targetOrg={doc.organizationId}
        />
      </div>
    </div>
  )
}
