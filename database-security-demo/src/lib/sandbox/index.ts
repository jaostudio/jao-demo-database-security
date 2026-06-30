import { PrismaClient } from '@prisma/security-client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'
import { SANDBOX_ORGANIZATIONS, sandboxUsers, SANDBOX_DOCUMENTS, SANDBOX_SECURITY_SETTINGS, sandboxDocId, sandboxSettingId, sandboxAuditEvents } from './seed-data'

let sandboxInitPromise: Promise<PrismaClient> | null = null

function sandboxDir(): string {
  return process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.sandbox')
}

function sandboxDbPath(): string {
  return path.join(sandboxDir(), 'sandbox.db')
}

async function ensureSchema(raw: ReturnType<typeof createClient>) {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.sql')
  if (!fs.existsSync(schemaPath)) throw new Error('schema.sql not found at ' + schemaPath)
  const sql = fs.readFileSync(schemaPath, 'utf-8')
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'))
  for (const stmt of statements) {
    await raw.execute(stmt + ';')
  }
}

async function seedSandbox(raw: ReturnType<typeof createClient>) {
  for (const org of SANDBOX_ORGANIZATIONS) {
    await raw.execute({
      sql: 'INSERT OR IGNORE INTO Organization (id, name, slug) VALUES (?, ?, ?)',
      args: [org.id, org.name, org.slug],
    })
  }

  for (const user of sandboxUsers()) {
    await raw.execute({
      sql: 'INSERT OR IGNORE INTO User (id, name, email, password, role, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
      args: [user.id, user.name, user.email, user.password, user.role, user.organizationId],
    })
  }

  for (let i = 0; i < SANDBOX_DOCUMENTS.length; i++) {
    const doc = SANDBOX_DOCUMENTS[i]
    await raw.execute({
      sql: 'INSERT OR IGNORE INTO Document (id, title, body, organizationId, uploadedById, updatedAt) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      args: [sandboxDocId(i), doc.title, doc.body, doc.orgId, doc.uploadedById],
    })
  }

  for (const org of SANDBOX_ORGANIZATIONS) {
    for (const setting of SANDBOX_SECURITY_SETTINGS) {
      await raw.execute({
        sql: 'INSERT OR IGNORE INTO SecuritySetting (id, key, value, organizationId, updatedAt) VALUES (?, ?, ?, ?, datetime(\'now\'))',
        args: [sandboxSettingId(org.id, setting.key), setting.key, setting.value, org.id],
      })
    }
  }
}

async function seedSandboxAuditEvents(client: PrismaClient) {
  const events = sandboxAuditEvents()
  for (const event of events) {
    await (client as any).auditEvent.create({
      data: {
        id: event.id,
        action: event.action,
        outcome: event.outcome,
        entityType: event.entityType,
        entityId: event.entityId,
        userId: event.actorUserId,
        organizationId: event.organizationId,
        metadata: event.metadata,
        ipAddress: event.ipAddress,
        causationId: event.causationId,
        previousHash: event.previousHash,
        eventHash: event.eventHash,
        canonicalPayload: event.canonicalPayload,
        createdAt: event.createdAt,
      },
    })
  }
}

export async function initSandbox(): Promise<PrismaClient> {
  const dbPath = sandboxDbPath()
  if (fs.existsSync(dbPath)) {
    try {
      const raw = createClient({ url: `file:${dbPath}` })
      await raw.execute(`ALTER TABLE "Organization" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`)
      raw.close()
    } catch {
      // column already exists — ignore
    }
  }

  if (sandboxInitPromise) return sandboxInitPromise

  sandboxInitPromise = (async () => {
    const dir = sandboxDir()
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const isFreshDb = !fs.existsSync(dbPath)
    if (isFreshDb) {
      const raw = createClient({ url: `file:${dbPath}` })
      await ensureSchema(raw)
      await seedSandbox(raw)
      raw.close()
    }

    const g = globalThis as unknown as { sandboxPrisma?: PrismaClient }
    const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
    const client = new PrismaClient({ adapter })
    g.sandboxPrisma = client

    if (isFreshDb) {
      await seedSandboxAuditEvents(client)
    }

    return client
  })()

  return sandboxInitPromise
}

export async function resetSandbox(): Promise<void> {
  const g = globalThis as unknown as { sandboxPrisma?: PrismaClient }
  if (g.sandboxPrisma) {
    await g.sandboxPrisma.$disconnect()
    g.sandboxPrisma = undefined
  }
  sandboxInitPromise = null

  const dbPath = sandboxDbPath()
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
}
