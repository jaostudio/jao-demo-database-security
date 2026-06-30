import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { assertSameOrigin } from '@/lib/security/request-guards'
import { rateLimit } from '@/lib/rate-limit'
import { initSandbox, resetSandbox } from '@/lib/sandbox'

export async function POST() {
  if (process.env.SANDBOX_MODE !== 'true') {
    return NextResponse.json({ error: 'sandbox_disabled' }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const h = await headers()
    assertSameOrigin(h)
  } catch {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const u = session.user as any
  const rl = await rateLimit(`sandbox-reset:${u.id}`, 5, 600000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    await resetSandbox()
    await initSandbox()
  } catch (e) {
    console.error('[sandbox.reset]', e)
    return NextResponse.json({ error: 'reset_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Sandbox data has been reset' })
}

export const runtime = 'nodejs'
