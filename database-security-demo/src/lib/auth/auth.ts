import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../prisma'
import { rateLimit } from '@/lib/rate-limit'
import { safeWriteAuditEvent } from '@/lib/audit/writer'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60,
    updateAge: 15 * 60,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/signin' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
          ?? req?.headers?.['x-real-ip']
          ?? 'unknown'
        const rl = await rateLimit(`signin:${ip}:${credentials.email}`, 5, 600000)
        if (!rl.ok) return null

        const db = await getPrisma()
        const user = await (db as any).user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { organization: true },
        })
        if (!user) {
          await safeWriteAuditEvent({
            action: 'auth.login_failed',
            outcome: 'FAILED',
            entityType: 'auth',
            actorUserId: null,
            organizationId: null,
            ipAddress: ip,
            metadata: { attemptedEmail: credentials.email.toLowerCase(), reason: 'invalid_credentials' },
          })
          return null
        }
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          await safeWriteAuditEvent({
            action: 'auth.login_failed',
            outcome: 'FAILED',
            entityType: 'auth',
            actorUserId: user.id,
            organizationId: user.organizationId,
            ipAddress: ip,
            metadata: { reason: 'invalid_credentials' },
          })
          return null
        }

        await safeWriteAuditEvent({
          action: 'auth.login_success',
          outcome: 'SUCCESS',
          entityType: 'auth',
          actorUserId: user.id,
          organizationId: user.organizationId,
          ipAddress: ip,
        })
        return { id: user.id, email: user.email, name: user.name, role: user.role, orgId: user.organizationId, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const t = token as any
        t.id = user.id
        t.role = (user as any).role
        t.orgId = (user as any).orgId
        t.email = user.email

        if (t.orgId) {
          try {
            const db = await getPrisma()
            const org = await (db as any).organization.findUnique({ where: { id: t.orgId as string }, select: { name: true } })
            t.orgName = org?.name ?? null
          } catch {
            t.orgName = null
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any
        const t = token as any
        u.id = t.id
        u.role = t.role
        u.orgId = t.orgId
        u.orgName = t.orgName
        u.email = t.email
        delete u.image
      }
      return session
    },
  },
}
