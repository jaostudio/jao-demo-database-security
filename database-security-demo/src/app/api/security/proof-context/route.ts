import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const prisma = await getPrisma()

    const u = session.user as any

    const latestAuditEvent = u.orgId
      ? await (prisma as any).auditEvent.findFirst({
          where: { organizationId: u.orgId },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        })
      : null

    return NextResponse.json({
      user: {
        name: u.name ?? null,
        email: u.email ?? null,
        role: u.role ?? null,
        orgId: u.orgId ?? null,
        orgName: u.orgName ?? null,
      },
      latestAuditEvent: latestAuditEvent
        ? {
            id: latestAuditEvent.id,
            action: latestAuditEvent.action,
            createdAt: latestAuditEvent.createdAt,
            user: latestAuditEvent.user?.name ?? 'system',
          }
        : null,
      sessionSource: 'Server-derived (JWT)',
      database: 'Turso/libSQL',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'proof_failed' }, { status: 500 })
  }
}
