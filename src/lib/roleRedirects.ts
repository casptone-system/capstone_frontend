export const normalizeRole = (role: string = '') => {
  return String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
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
    vpaa: '/user/dashboard/vpaa',
    'vpaa-di': '/user/dashboard/vpaa',
    'super-admin': '/user/dashboard/super-admin',
    'super-administrator': '/user/dashboard/super-admin',
    superadmin: '/user/dashboard/super-admin',
    admin: '/users',
    staff: '/documents',
    'area-in-charge': '/documents',
  }

  return roleRedirects[normalizedRole] || '/user/dashboard'
}
