import type { Access, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export type Role = 'admin' | 'editor' | 'business'

// Admin passes every check
export const hasRole = (user: User | null | undefined, ...roles: Role[]): boolean => {
  if (!user?.roles) return false
  if (user.roles.includes('admin')) return true
  return roles.some((role) => user.roles?.includes(role))
}

// Has any role, giving access to admin panel
export const hasAnyRole: Access = ({ req: { user } }) => Boolean(user?.roles?.length)

// Admin access
export const isAdmin = ({ req: { user } }: { req: PayloadRequest }): boolean =>
  hasRole(user, 'admin')

// Admin or self access
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, 'admin')) return true
  return { id: { equals: user.id } }
}
