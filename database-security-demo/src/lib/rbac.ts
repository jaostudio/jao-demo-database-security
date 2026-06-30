import type { Role } from '@/lib/types/session'

export type Permission =
  | 'document:read'
  | 'document:create'
  | 'document:delete'
  | 'audit:read'
  | 'settings:read'
  | 'settings:update'
  | 'security_lab:run'
  | 'admin:users:read'
  | 'admin:users:create'
  | 'admin:users:delete'
  | 'admin:organizations:read'
  | 'admin:organizations:create'
  | 'admin:organizations:delete'

const PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  ORG_USER: new Set([
    'document:read',
    'audit:read',
    'security_lab:run',
  ]),
  ORG_ADMIN: new Set([
    'document:read',
    'document:create',
    'document:delete',
    'audit:read',
    'settings:read',
    'settings:update',
    'security_lab:run',
  ]),
  SYSTEM_ADMIN: new Set([
    'document:read',
    'document:create',
    'document:delete',
    'audit:read',
    'settings:read',
    'security_lab:run',
    'admin:users:read',
    'admin:users:create',
    'admin:users:delete',
    'admin:organizations:read',
    'admin:organizations:create',
    'admin:organizations:delete',
  ]),
}

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role]?.has(permission) ?? false
}

export function assertCan(role: Role, permission: Permission): void {
  if (!can(role, permission)) throw new Error('Forbidden')
}
