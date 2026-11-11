import type { Access, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export type Role = 'admin' | 'editor' | 'business'

// Returns whether the user has a given role for permission checking.
// If the user is an admin, they pass every check.
export const hasRole = (user: User | null | undefined, ...roles: Role[]): boolean => {
  if (!user?.roles) return false
  if (user.roles.includes('admin')) return true
  return roles.some((role) => user.roles?.includes(role))
}

//Returns whether the user has a role, giving access to admin panel
export const hasAnyRole = ({ req: { user } }: { req: PayloadRequest }): boolean =>
  Boolean(user?.roles?.length)

// Returns whether the user is an admin.
export const isAdmin = ({ req: { user } }: { req: PayloadRequest }): boolean =>
  hasRole(user, 'admin')

// Returns whether the user is an admin or is the owner of the document.
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, 'admin')) return true
  return { id: { equals: user.id } }
}
