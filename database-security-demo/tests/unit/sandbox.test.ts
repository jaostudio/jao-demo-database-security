import { describe, it, expect } from 'vitest'
import { SANDBOX_ORGANIZATIONS, sandboxUsers, SANDBOX_DOCUMENTS, SANDBOX_SECURITY_SETTINGS, SEED_IDS, sandboxDocId, sandboxSettingId } from '@/lib/sandbox/seed-data'

describe('sandbox seed data', () => {
  it('exports deterministic SEED_IDS', () => {
    expect(SEED_IDS.orgs.luntian).toBe('org_luntian')
    expect(SEED_IDS.orgs.talapay).toBe('org_talapay')
    expect(SEED_IDS.orgs.bayani).toBe('org_bayani')
    expect(SEED_IDS.orgs.pulodata).toBe('org_pulodata')
    expect(SEED_IDS.users.jao).toBe('user_jao')
    expect(SEED_IDS.users.gina).toBe('user_gina')
    expect(SEED_IDS.users.kiko).toBe('user_kiko')
    expect(SEED_IDS.users.grace).toBe('user_grace')
  })

  it('has 4 organizations', () => {
    expect(SANDBOX_ORGANIZATIONS).toHaveLength(4)
  })

  it('has 4 users', () => {
    expect(sandboxUsers()).toHaveLength(4)
  })

  it('has 17 documents', () => {
    expect(SANDBOX_DOCUMENTS).toHaveLength(17)
  })

  it('has 2 security setting types', () => {
    expect(SANDBOX_SECURITY_SETTINGS).toHaveLength(2)
  })

  it('generates deterministic document IDs', () => {
    expect(sandboxDocId(0)).toBe('doc_sandbox_0')
    expect(sandboxDocId(16)).toBe('doc_sandbox_16')
  })

  it('generates deterministic setting IDs', () => {
    expect(sandboxSettingId('org_luntian', 'mfa_enabled')).toBe('setting_org_luntian_mfa_enabled')
  })

  it('users have deterministic IDs matching SEED_IDS', () => {
    const users = sandboxUsers()
    expect(users[0].id).toBe(SEED_IDS.users.jao)
    expect(users[1].id).toBe(SEED_IDS.users.gina)
    expect(users[2].id).toBe(SEED_IDS.users.kiko)
    expect(users[3].id).toBe(SEED_IDS.users.grace)
  })

  it('documents reference existing org IDs', () => {
    const orgIds = SANDBOX_ORGANIZATIONS.map(o => o.id)
    for (const doc of SANDBOX_DOCUMENTS) {
      expect(orgIds).toContain(doc.orgId)
    }
  })

  it('sandboxUsers produces deterministic password hashes', () => {
    const users1 = sandboxUsers()
    const users2 = sandboxUsers()
    expect(users1[0].password).toBe(users2[0].password)
  })
})
