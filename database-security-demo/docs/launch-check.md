# IslaVault — Launch Check

## Metadata

| Field | Value |
|-------|-------|
| Date | 2026-06-30 |
| Commit | `3a6d556` |
| Production URL | https://jao-demo-security.vercel.app |
| Root directory | `database-security-demo` |

## Gate results

| Check | Status |
|-------|--------|
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 errors (81 pre-existing `any` warnings) |
| `npm run test` | 126/126 passed (14 files) |
| `prisma generate` | Generated `@prisma/security-client` v7.8.0 |

## Scanners

| Check | Status |
|-------|--------|
| `npm run scan:headers` | All 9 required headers present |
| `npm run scan:secrets` | Clean for `database-security-demo/` |
| `npm run audit:deps` | 0 moderate/high direct vulns |

## Changes in this commit (`3a6d556`)

1. **clearAuditLogs disabled** — throws "disabled in demo mode" to prevent global delete risk
2. **src/lib/rbac.ts** — centralized permission matrix (14 permissions, 3 roles)
3. **RBAC wired** — `assertCan()` enforced in all 7 server mutation actions
4. **vitest** — added as local devDependency (no hoisting dependency)
5. **no-global-prisma-import.test.ts** — broad static scan across `src/app`, `src/lib/auth`, `src/lib/actions`, `src/lib/audit`
6. **database-pipeline.tsx** — emoji replaced with Lucide icons (brand compliance)
7. **SANDOX_ → SANDBOX_** — rename across seed-data, index, seed, sandbox test (cosmetic)
8. **.env.example** — all vars have placeholder values
9. **prisma/seed.ts** — documents use `upsert` (idempotent re-seed)

## Prior fixes

| Commit | Fix |
|--------|-----|
| `240a41d` | Sandbox cache staleness — ALTER TABLE before cache guard |
| `188f3da` | FK constraints, safeWriteAuditEvent, jwt try/catch, null orgId guards |
| `b232fd4` | createdAt column on Organization + migration |
| `032bb4a` | auth uses getPrisma(); quarantine realPrisma; static regression tests |

## Known tradeoffs

- CSP uses `'unsafe-inline'` for scripts and styles (Next.js + Tailwind requirement). Nonce-based CSP deferred as production hardening upgrade.
- Audit verification checks single events, not full-chain traversal. Sufficient for demo badge; full chain available as upgrade.
- `deleteDocument` passes `user.orgId ?? undefined` for SYSTEM_ADMIN (un-scoped). Acceptable — SYSTEM_ADMIN requires cross-org access by design.
- 81 `@typescript-eslint/no-explicit-any` warnings — pre-existing, not introduced by this work.

## Manual verification checklist

- [ ] Sign out fully, reset sandbox
- [ ] Sign in as Jao — Documents show Luntian docs
- [ ] Security Lab Full Attack Suite — no HTTP 500
- [ ] Audit — shows new events with VERIFIED badges
- [ ] Sign in as Gina — TalaPay documents only
- [ ] Sign in as Kiko — Bayani documents; Settings/Admin blocked or hidden
- [ ] Sign in as Grace — Admin Users loads, Admin Organizations loads
- [ ] Grace can see Documents and Audit without crashes
- [ ] Footer shows JAOstudio branding
- [ ] /privacy, /terms, /disclaimer, /security-policy all load
