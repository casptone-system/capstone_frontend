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
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return normalizeRoleValue(record.slug ?? record.name ?? record.role)
  }

  const role = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '-')

  const aliases: Record<string, AppRole> = {
    'super-admin': 'superadmin',
    'super-administrator': 'superadmin',
    superadministrator: 'superadmin',
    superadmin: 'superadmin',
    admin: 'admin',
    vpaa: 'vpaa',
    'vpaa-di': 'vpaa',
    'vpaa/di': 'vpaa',
    vpaadi: 'vpaa',
    qa: 'qa',
    dean: 'dean',
    'program-chair': 'program-chair',
    programchair: 'program-chair',
    'area-incharge': 'area-in-charge',
    'area-in-charge': 'area-in-charge',
    areaincharge: 'area-in-charge',
    'area-chair': 'area-in-charge',
    areachair: 'area-in-charge',
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

  const candidates = Array.from(
    new Set(
      rawValues
        .filter((value) => value !== null && value !== undefined && value !== '')
        .map((value) => normalizeRoleValue(value))
        .filter(Boolean) as AppRole[],
    ),
  )

  if (candidates.length === 0) {
    const hasProgram = Boolean(
      (user as any).programId ||
      (user as any).program_id ||
      (user as any).program?.id,
    )
    if (hasProgram) {
      return ['faculty']
    }
  }

  return candidates
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
    'accreditor',
    'vpaa',
    'superadmin',
    'admin',
  ]

  return preferredOrder.find((role) => candidates.includes(role)) ?? candidates[0]
}

export const resolveAppRole = (
  roleValue: unknown,
  user?: User | null,
): AppRole => {
  return normalizeRoleValue(roleValue) || roleFromUser(user)
}

export const getDashboardPathForRole = (role: AppRole): string => {
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
      return '/user/dashboard/faculty'

    case 'qa':
      return '/user/dashboard/qa'

    case 'accreditor':
      return '/user/dashboard/accreditor'

    case 'vpaa':
      return '/user/dashboard/vpaa'

    default:
      return '/user/dashboard/faculty'
  }
}

export const getRoleRedirectPath = (
  roleValue: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept so login/router call sites stay unchanged
  hasGroup = false,
  user?: User | null,
): string => {
  const role = resolveAppRole(roleValue, user)
  return getDashboardPathForRole(role)
}

export const dashboardSegmentToRole = (segment: string): AppRole => {
  if (segment === 'area-incharge' || segment === 'area-in-charge') {
    return 'area-in-charge'
  }
  return normalizeRoleValue(segment)
}

export const canAccessDashboardRole = (
  currentRole: AppRole,
  requestedRole: AppRole,
  availableViews: AppRole[] = [],
): boolean => {
  if (!requestedRole) {
    return true
  }

  if (currentRole === requestedRole) {
    return true
  }

  if (availableViews.includes(requestedRole)) {
    return true
  }

  // Area Chair and Faculty share the same workspace.
  if (
    (requestedRole === 'faculty' || requestedRole === 'area-in-charge') &&
    (currentRole === 'faculty' || currentRole === 'area-in-charge' || availableViews.includes('faculty'))
  ) {
    return true
  }

  return false
}
