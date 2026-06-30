import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demo-accounts'
import { AuditActions } from '@/lib/audit-actions'
import { stableJson } from '@/lib/audit/stable-json'

export const SEED_IDS = {
  orgs: {
    luntian: 'org_luntian',
    talapay: 'org_talapay',
    bayani: 'org_bayani',
    pulodata: 'org_pulodata',
  },
  users: {
    jao: 'user_jao',
    gina: 'user_gina',
    kiko: 'user_kiko',
    grace: 'user_grace',
  },
} as const

export const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10)

export const SANDBOX_ORGANIZATIONS = [
  { id: SEED_IDS.orgs.luntian, name: 'Luntian Health', slug: 'luntian-health' },
  { id: SEED_IDS.orgs.talapay, name: 'TalaPay', slug: 'talapay-cooperative' },
  { id: SEED_IDS.orgs.bayani, name: 'Bayani Freight', slug: 'bayani-freight' },
  { id: SEED_IDS.orgs.pulodata, name: 'Pulo Data Registry', slug: 'pulo-data-registry' },
] as const

export function sandboxUsers() {
  return [
    { id: SEED_IDS.users.jao, name: DEMO_ACCOUNTS[0].name, email: DEMO_ACCOUNTS[0].email, password: PASSWORD_HASH, role: DEMO_ACCOUNTS[0].role, organizationId: SEED_IDS.orgs.luntian },
    { id: SEED_IDS.users.gina, name: DEMO_ACCOUNTS[1].name, email: DEMO_ACCOUNTS[1].email, password: PASSWORD_HASH, role: DEMO_ACCOUNTS[1].role, organizationId: SEED_IDS.orgs.talapay },
    { id: SEED_IDS.users.kiko, name: DEMO_ACCOUNTS[2].name, email: DEMO_ACCOUNTS[2].email, password: PASSWORD_HASH, role: DEMO_ACCOUNTS[2].role, organizationId: SEED_IDS.orgs.bayani },
    { id: SEED_IDS.users.grace, name: DEMO_ACCOUNTS[3].name, email: DEMO_ACCOUNTS[3].email, password: PASSWORD_HASH, role: DEMO_ACCOUNTS[3].role, organizationId: SEED_IDS.orgs.pulodata },
  ]
}

export function sandboxDocId(idx: number): string {
  return `doc_sandbox_${idx}`
}

export const SANDBOX_DOCUMENTS = [
  { title: 'Regional Clinic Access Matrix', body: 'Access permissions and security clearances for all regional clinics under Luntian Health Network. Updated Q2 2026.', orgId: SEED_IDS.orgs.luntian, uploadedById: SEED_IDS.users.jao },
  { title: 'Vendor Security Assessment', body: 'Third-party security audit results for clinical software vendors. Includes risk ratings and remediation timelines.', orgId: SEED_IDS.orgs.luntian, uploadedById: SEED_IDS.users.jao },
  { title: 'Incident Response Checklist', body: 'Step-by-step incident response procedures for data breaches, system outages, and unauthorized access events.', orgId: SEED_IDS.orgs.luntian, uploadedById: SEED_IDS.users.jao },
  { title: 'Confidential Operations Memo', body: 'Internal memorandum regarding patient data handling protocols and updated privacy safeguards.', orgId: SEED_IDS.orgs.luntian, uploadedById: SEED_IDS.users.jao },
  { title: 'Patient Data Handling Protocol', body: 'Standard operating procedure for collecting, storing, and sharing patient health information across departments.', orgId: SEED_IDS.orgs.luntian, uploadedById: SEED_IDS.users.jao },
  { title: 'Member Data Handling Policy', body: 'Policies governing the collection, storage, and sharing of cooperative member personal and financial data.', orgId: SEED_IDS.orgs.talapay, uploadedById: SEED_IDS.users.jao },
  { title: 'Loan Review Board Notes', body: 'Minutes and decisions from the Loan Review Board meetings for Q1 and Q2 2026.', orgId: SEED_IDS.orgs.talapay, uploadedById: SEED_IDS.users.jao },
  { title: 'Branch Cash Audit Summary', body: 'Quarterly cash audit results across all TalaPay branches. All branches passed with no material findings.', orgId: SEED_IDS.orgs.talapay, uploadedById: SEED_IDS.users.jao },
  { title: 'Partner API Access Request', body: 'Access request and security review for third-party payment gateway integration.', orgId: SEED_IDS.orgs.talapay, uploadedById: SEED_IDS.users.jao },
  { title: 'Port Clearance Procedures', body: 'Documented procedures for obtaining port clearance for international and domestic shipments.', orgId: SEED_IDS.orgs.bayani, uploadedById: SEED_IDS.users.jao },
  { title: 'Vendor Contract Database', body: 'Master register of all active vendor contracts, renewal dates, and security review status.', orgId: SEED_IDS.orgs.bayani, uploadedById: SEED_IDS.users.jao },
  { title: 'Fleet Security Assessment', body: 'Annual security assessment of fleet tracking systems, driver verification, and cargo integrity protocols.', orgId: SEED_IDS.orgs.bayani, uploadedById: SEED_IDS.users.jao },
  { title: 'Cargo Manifest Review', body: 'Q2 cargo manifest reconciliation report. Discrepancy rate below 0.3%.', orgId: SEED_IDS.orgs.bayani, uploadedById: SEED_IDS.users.jao },
  { title: 'Citizen Record Schema', body: 'Master schema definition for citizen identity records, including encryption-at-rest requirements.', orgId: SEED_IDS.orgs.pulodata, uploadedById: SEED_IDS.users.jao },
  { title: 'Data Sharing MOA', body: 'Memorandum of agreement governing cross-agency data sharing and access controls.', orgId: SEED_IDS.orgs.pulodata, uploadedById: SEED_IDS.users.jao },
  { title: 'Registry Audit Log', body: 'System-level audit log for registry access events. Append-only with tamper detection.', orgId: SEED_IDS.orgs.pulodata, uploadedById: SEED_IDS.users.jao },
  { title: 'Access Control Policy', body: 'Policies defining role-based access tiers for registry data consumer applications.', orgId: SEED_IDS.orgs.pulodata, uploadedById: SEED_IDS.users.jao },
]

export function sandboxSettingId(orgId: string, key: string): string {
  return `setting_${orgId}_${key}`
}

export const SANDBOX_SECURITY_SETTINGS = [
  { key: 'mfa_enabled', value: 'true' },
  { key: 'session_timeout_minutes', value: '60' },
]

export type SeedAuditEvent = {
  id: string
  action: string
  outcome: string
  entityType: string
  entityId: string
  actorUserId: string | null
  organizationId: string
  ipAddress: string | null
  metadata: string
  causationId: string | null
  previousHash: string | null
  eventHash: string
  canonicalPayload: string
  createdAt: Date
}

export function sandboxAuditEventId(orgId: string, idx: number): string {
  return `audit_seed_${orgId}_${idx}`
}

export function sandboxAuditEvents(): SeedAuditEvent[] {
  const raw: {
    action: string
    outcome: string
    entityType: string
    entityId: string
    actorUserId: string | null
    organizationId: string
    ipAddress: string | null
    metadata: Record<string, unknown>
    causationId: string | null
  }[] = [
    {
      action: AuditActions.AUTH_LOGIN_SUCCESS,
      outcome: 'SUCCESS',
      entityType: 'auth',
      entityId: '',
      actorUserId: SEED_IDS.users.jao,
      organizationId: SEED_IDS.orgs.luntian,
      ipAddress: '127.0.0.1',
      metadata: { reason: 'seed_data_initialized', source: 'sandbox' },
      causationId: 'seed_causation_luntian',
    },
    {
      action: AuditActions.SECURITY_SETTINGS_UPDATED,
      outcome: 'SUCCESS',
      entityType: 'security_setting',
      entityId: '',
      actorUserId: SEED_IDS.users.gina,
      organizationId: SEED_IDS.orgs.talapay,
      ipAddress: '127.0.0.1',
      metadata: { setting: 'mfa_enabled', action: 'seed_data_initialized', source: 'sandbox' },
      causationId: 'seed_causation_talapay',
    },
    {
      action: AuditActions.DOCUMENT_CREATED,
      outcome: 'SUCCESS',
      entityType: 'document',
      entityId: sandboxDocId(0),
      actorUserId: SEED_IDS.users.kiko,
      organizationId: SEED_IDS.orgs.bayani,
      ipAddress: '127.0.0.1',
      metadata: { title: SANDBOX_DOCUMENTS[0].title, source: 'seed_data' },
      causationId: 'seed_causation_bayani',
    },
    {
      action: AuditActions.ADMIN_USER_CREATED,
      outcome: 'SUCCESS',
      entityType: 'user',
      entityId: SEED_IDS.users.grace,
      actorUserId: SEED_IDS.users.grace,
      organizationId: SEED_IDS.orgs.pulodata,
      ipAddress: '127.0.0.1',
      metadata: { email: DEMO_ACCOUNTS[3].email, role: 'SYSTEM_ADMIN', source: 'seed_data' },
      causationId: 'seed_causation_pulodata',
    },
  ]

  const createdAt = new Date('2025-01-01T00:00:00Z')
  let previousHash: string | null = null
  let eventHash = ''

  return raw.map((e) => {
    const canonicalPayload = stableJson({
      action: e.action,
      outcome: e.outcome,
      entityType: e.entityType,
      entityId: e.entityId ?? null,
      actorUserId: e.actorUserId ?? null,
      organizationId: e.organizationId,
      requestId: null,
      causationId: e.causationId ?? null,
      ipAddress: e.ipAddress ?? null,
      userAgent: null,
      metadata: e.metadata,
      createdAt: createdAt.toISOString(),
    })
    previousHash = eventHash || null
    eventHash = createHash('sha256').update(`${previousHash ?? ''}${canonicalPayload}`).digest('hex')
    return {
      id: sandboxAuditEventId(e.organizationId, 0),
      action: e.action,
      outcome: e.outcome,
      entityType: e.entityType,
      entityId: e.entityId,
      actorUserId: e.actorUserId,
      organizationId: e.organizationId,
      ipAddress: e.ipAddress,
      metadata: JSON.stringify(e.metadata),
      causationId: e.causationId,
      previousHash,
      eventHash,
      canonicalPayload,
      createdAt: new Date(createdAt),
    }
  })
}
