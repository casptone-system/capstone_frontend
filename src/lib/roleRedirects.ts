import type { User } from '@/types'

export type AppRole =
  | 'superadmin'
  | 'admin'
  | 'vpaa'
  | 'qa'
  | 'dean'
  | 'program-chair'
  | 'area-in-charge'
  | 'faculty'
  | 'accreditor'
  | ''

const normalizeRoleValue = (value: unknown): AppRole => {
  const role = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')

  const aliases: Record<string, AppRole> = {
    'super-admin': 'superadmin',
    'super-administrator': 'superadmin',
    superadministrator: 'superadmin',
    superadmin: 'superadmin',
    admin: 'admin',
    vpaa: 'vpaa',
    'vpaa-di': 'vpaa',
    'vpaa/di': 'vpaa',
    qa: 'qa',
    dean: 'dean',
    'program-chair': 'program-chair',
    programchair: 'program-chair',
    'area-incharge': 'area-in-charge',
    'area-in-charge': 'area-in-charge',
    areaincharge: 'area-in-charge',
    faculty: 'faculty',
    accreditor: 'accreditor',
  }

  return aliases[role] ?? ''
}

export const normalizeRole = (value: unknown): AppRole => {
  return normalizeRoleValue(value)
}

const getUserRoleCandidates = (user: User | null | undefined): AppRole[] => {
  if (!user) {
    return []
  }

  const rawValues = [
    user.role_slug,
    (user as any).role?.slug,
    (user as any).role?.name,
    (user as any).role_name,
    (user as any).role,
    ...(Array.isArray((user as any).roles) ? (user as any).roles : []),
  ]

  return Array.from(
    new Set(
      rawValues
        .filter((value) => value !== null && value !== undefined && value !== '')
        .map((value) => normalizeRoleValue(value))
        .filter(Boolean) as AppRole[],
    ),
  )
}

const roleFromUser = (
  user: User | null | undefined,
): AppRole => {
  const candidates = getUserRoleCandidates(user)

  if (candidates.length === 0) {
    return ''
  }

  const preferredOrder: AppRole[] = [
    'dean',
    'program-chair',
    'area-in-charge',
    'faculty',
    'qa',
    'vpaa',
    'superadmin',
    'admin',
  ]

  return preferredOrder.find((role) => candidates.includes(role)) ?? candidates[0]
}

export const getRoleRedirectPath = (
  roleValue: unknown,
  hasGroup = false,
  user?: User | null,
): string => {
  const userRoles = getUserRoleCandidates(user)
  const role =
    (userRoles.length > 0 ? roleFromUser(user) : '') ||
    normalizeRoleValue(roleValue)

  switch (role) {
    case 'superadmin':
    case 'admin':
      return '/superadmin'

    case 'dean':
      return '/user/dashboard/dean'

    case 'program-chair':
      return '/user/dashboard/program-chair'

    case 'area-in-charge':
      return '/user/dashboard/area-incharge'

    case 'faculty':
      return hasGroup
        ? '/user/dashboard/faculty'
        : '/join-team'

    case 'qa':
      return '/user/dashboard/qa'

    case 'vpaa':
      return '/user/dashboard/vpaa'

    default:
      return '/user/dashboard'
  }
}