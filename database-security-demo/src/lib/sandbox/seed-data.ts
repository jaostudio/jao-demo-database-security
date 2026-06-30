import bcrypt from 'bcryptjs'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demo-accounts'

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
