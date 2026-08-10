export const normalizeRole = (role: string = '') => {
  const base = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')

  // Handle VPAA/DI variants -> keep the slash
  if (base.includes('vpaa') && base.includes('di')) return 'vpaa/di'

  // Super admin variants -> canonical 'superadmin'
  if (base.startsWith('super') || base.includes('super-administrator') || base.includes('super-administrator')) return 'superadmin'

  // Area in-charge variants -> canonical 'area-incharge'
  if (base.includes('area') && (base.includes('in-charge') || base.includes('incharge') || base.includes('in-charge'))) return 'area-incharge'

  // Program chair normalization
  if (base === 'programchair') return 'program-chair'

  return base
}

export const getRoleRedirectPath = (role: string = '') => {
  const normalizedRole = normalizeRole(role)

  const roleRedirects: Record<string, string> = {
    dean: '/user/dashboard/dean',
    'program-chair': '/user/dashboard/program-chair',
    programchair: '/user/dashboard/program-chair',
    faculty: '/user/dashboard/faculty',
    // When a new user has no group, send them to the dedicated new-user landing page
    'new-user': '/new-user',
    'new-user-no-groups': '/new-user',
    'no-group': '/new-user',
    'no-groups': '/new-user',
    nogroups: '/new-user',
    qa: '/user/dashboard/qa',
    'qa-review': '/user/dashboard/qa',
    'vpaa/di': '/user/dashboard/vpaa',
    vpaa: '/user/dashboard/vpaa',
    'vpaa-di': '/user/dashboard/vpaa',
    superadmin: '/user/dashboard/super-admin',
    'super-admin': '/user/dashboard/super-admin',
    'super-administrator': '/user/dashboard/super-admin',
    admin: '/users',
    staff: '/documents',
    'area-incharge': '/documents',
    'area-in-charge': '/documents',
  }

  return roleRedirects[normalizedRole] || '/user/dashboard'
}
