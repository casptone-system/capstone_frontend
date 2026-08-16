import type { User } from '@/types'

export type AppRole =
  | 'superadmin'
  | 'admin'
  | 'vpaa/di'
  | 'qa'
  | 'dean'
  | 'program-chair'
  | 'area-incharge'
  | 'faculty'
  | ''

const normalizeRoleValue = (value: unknown): AppRole => {
  const role = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')

  const aliases: Record<string, AppRole> = {
    // Super Admin
    'super-admin': 'superadmin',
    'super-administrator': 'superadmin',
    superadministrator: 'superadmin',
    superadmin: 'superadmin',

    // Admin
    admin: 'admin',

    // VPAA
    vpaa: 'vpaa/di',
    'vpaa-di': 'vpaa/di',
    'vpaa/di': 'vpaa/di',

    // QA
    qa: 'qa',

    // Dean
    dean: 'dean',

    // Program Chair
    'program-chair': 'program-chair',
    programchair: 'program-chair',

    // Area In-Charge
    'area-incharge': 'area-incharge',
    'area-in-charge': 'area-incharge',
    areaincharge: 'area-incharge',

    // Faculty
    faculty: 'faculty',
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
    'area-incharge',
    'faculty',
    'qa',
    'vpaa/di',
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

    case 'area-incharge':
      return '/user/dashboard/area-incharge'

    case 'faculty':
      return hasGroup
        ? '/user/dashboard/faculty'
        : '/join-team'

    case 'qa':
      return '/user/dashboard/qa'

    case 'vpaa/di':
      return '/user/dashboard/vpaa'

    default:
      return '/user/dashboard'
  }
}