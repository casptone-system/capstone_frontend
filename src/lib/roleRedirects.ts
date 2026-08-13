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

const roleFromUser = (
  user: User | null | undefined,
): AppRole => {
  if (!user) {
    return ''
  }

  return normalizeRoleValue(
    user.role_slug ||
      (user as any).role?.slug ||
      (user as any).role?.name ||
      (user as any).role_name ||
      (user as any).role,
  )
}

export const getRoleRedirectPath = (
  roleValue: unknown,
  hasGroup = false,
  user?: User | null,
): string => {
  const role =
    roleFromUser(user) ||
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