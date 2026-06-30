'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { getPrisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { AuditActions } from '@/lib/audit-actions'
import { documentCreateSchema, adminCreateUserSchema, adminCreateOrgSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'
import { assertSameOrigin, getClientIp } from '@/lib/security/request-guards'
import { assertSystemAdmin, assertCanDeleteUser, assertCanDeleteOrganization } from '@/lib/security/admin-guards'
import { safeWriteAuditEvent } from '@/lib/audit/writer'

async function getAuthUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
  const u = session.user as any
  return { id: u.id, role: u.role, orgId: u.orgId }
}

async function guardMutation(user: { id: string }, namespace: string, limit: number, windowMs: number): Promise<string> {
  const h = await headers()
  try { assertSameOrigin(h) } catch { throw new Error('Invalid request origin') }
  const ip = getClientIp(h)
  const rl = await rateLimit(`${namespace}:${user.id}:${ip}`, limit, windowMs)
  if (!rl.ok) throw new Error('Too many requests')
  return ip
}



// ── Organization ──

export async function createOrganization(formData: FormData) {
  const user = await getAuthUser()
  const ip = await guardMutation(user, 'admin-org', 20, 600000)
  assertSystemAdmin(user.role as any)
  const prisma = await getPrisma()

  const parsed = adminCreateOrgSchema.safeParse({ name: formData.get('name') ?? '' })
  if (!parsed.success) throw new Error('Validation failed')

  const { name } = parsed.data
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'org'
  const org = await (prisma as any).organization.create({ data: { name, slug } })
  await safeWriteAuditEvent({
    action: AuditActions.ADMIN_ORGANIZATION_CREATED,
    outcome: 'SUCCESS',
    entityType: 'organization',
    entityId: org.id,
    actorUserId: user.id,
    organizationId: org.id,
    ipAddress: ip,
    metadata: { name },
  })
  revalidatePath('/admin/organizations')
}

export async function deleteOrganization(orgId: string) {
  const user = await getAuthUser()
  const ip = await guardMutation(user, 'admin-org', 20, 600000)
  assertSystemAdmin(user.role as any)
  const prisma = await getPrisma()

  const userCount = await (prisma as any).user.count({ where: { organizationId: orgId } })
  const docCount = await (prisma as any).document.count({ where: { organizationId: orgId } })

  try {
    assertCanDeleteOrganization({ userCount, documentCount: docCount })
  } catch (e) {
    await safeWriteAuditEvent({
      action: AuditActions.ADMIN_ACTION_DENIED,
      outcome: 'DENIED',
      entityType: 'organization',
      entityId: orgId,
      actorUserId: user.id,
      organizationId: orgId,
      ipAddress: ip,
      metadata: { reason: (e as Error).message, userCount, docCount },
    })
    throw e
  }

  await safeWriteAuditEvent({
    action: AuditActions.ADMIN_ORGANIZATION_DELETED,
    outcome: 'SUCCESS',
    entityType: 'organization',
    entityId: orgId,
    actorUserId: user.id,
    organizationId: orgId,
    ipAddress: ip,
  })
  await (prisma as any).organization.delete({ where: { id: orgId } })
  revalidatePath('/admin/organizations')
}

// ── Document ──

export async function createDocument(formData: FormData) {
  const user = await getAuthUser()
  const ip = await guardMutation(user, 'doc-write', 30, 600000)
  if (!user.orgId) throw new Error('No organization scope')
  const prisma = await getPrisma()

  const parsed = documentCreateSchema.safeParse({ title: formData.get('title') ?? '', body: formData.get('body') ?? '' })
  if (!parsed.success) throw new Error('Validation failed')
  const { title, body } = parsed.data

  const doc = await (prisma as any).document.create({
    data: { title, body, organizationId: user.orgId, uploadedById: user.id },
  })
  await safeWriteAuditEvent({
    action: AuditActions.DOCUMENT_CREATED,
    outcome: 'SUCCESS',
    entityType: 'document',
    entityId: doc.id,
    actorUserId: user.id,
    organizationId: user.orgId,
    ipAddress: ip,
    metadata: { title },
  })
  revalidatePath('/documents')
}

export async function deleteDocument(docId: string) {
  const user = await getAuthUser()
  const ip = await guardMutation(user, 'doc-write', 30, 600000)
  const prisma = await getPrisma()

  const doc = await (prisma as any).document.findFirst({
    where: { id: docId, organizationId: user.orgId ?? undefined },
  })
  if (!doc) {
    await safeWriteAuditEvent({
      action: AuditActions.DOCUMENT_CROSS_TENANT_DENIED,
      outcome: 'DENIED',
      entityType: 'document',
      entityId: docId,
      actorUserId: user.id,
      organizationId: user.orgId,
      ipAddress: ip,
    })
    throw new Error('Not found')
  }

  await safeWriteAuditEvent({
    action: AuditActions.DOCUMENT_DELETED,
    outcome: 'SUCCESS',
    entityType: 'document',
    entityId: docId,
    actorUserId: user.id,
    organizationId: user.orgId,
    ipAddress: ip,
    metadata: { title: doc.title },
  })
  await (prisma as any).document.delete({ where: { id: docId } })
  revalidatePath('/documents')
}

// ── Audit ──

export async function clearAuditLogs() {
  const user = await getAuthUser()
  await guardMutation(user, 'admin-audit', 10, 600000)
  assertSystemAdmin(user.role as any)
  const prisma = await getPrisma()
  await (prisma as any).auditEvent.deleteMany({ where: { organizationId: user.orgId ?? undefined } })
  revalidatePath('/audit')
}

// ── User management ──

export async function createOrgUser(formData: FormData) {
  const user = await getAuthUser()
  const ip = await guardMutation(user, 'admin-user', 20, 600000)
  assertSystemAdmin(user.role as any)
  const prisma = await getPrisma()

  const parsed = adminCreateUserSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    role: formData.get('role') ?? '',
    orgId: formData.get('orgId') ?? null,
  })
  if (!parsed.success) throw new Error('Validation failed')
  const { name, email, role, orgId } = parsed.data

  const existing = await (prisma as any).user.findUnique({ where: { email } })
  if (existing) throw new Error('Email exists')

  const password = await bcrypt.hash('password123', 10)

  const newUser = await (prisma as any).user.create({
    data: { name, email, password, role, organizationId: orgId || null },
  })
  await safeWriteAuditEvent({
    action: AuditActions.ADMIN_USER_CREATED,
    outcome: 'SUCCESS',
    entityType: 'user',
    entityId: newUser.id,
    actorUserId: user.id,
    organizationId: orgId || null,
    ipAddress: ip,
    metadata: { email, role },
  })
  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  const user = await getAuthUser()
  const ip = await guardMutation(user, 'admin-user', 20, 600000)
  assertSystemAdmin(user.role as any)
  const prisma = await getPrisma()

  const targetUser = await (prisma as any).user.findUnique({ where: { id: userId } })
  if (!targetUser) throw new Error('User not found')

  const adminCount = await (prisma as any).user.count({ where: { role: 'SYSTEM_ADMIN' } })

  try {
    assertCanDeleteUser({
      currentUserId: user.id,
      targetUserId: userId,
      targetRole: targetUser.role,
      systemAdminCount: adminCount,
    })
  } catch (e) {
    await safeWriteAuditEvent({
      action: AuditActions.ADMIN_ACTION_DENIED,
      outcome: 'DENIED',
      entityType: 'user',
      entityId: userId,
      actorUserId: user.id,
      organizationId: user.orgId,
      ipAddress: ip,
      metadata: { reason: (e as Error).message },
    })
    throw e
  }

  await (prisma as any).user.delete({ where: { id: userId } })
  await safeWriteAuditEvent({
    action: AuditActions.ADMIN_USER_DELETED,
    outcome: 'SUCCESS',
    entityType: 'user',
    entityId: userId,
    actorUserId: user.id,
    organizationId: user.orgId,
    ipAddress: ip,
    metadata: { deletedEmail: targetUser.email },
  })
  revalidatePath('/admin/users')
}
