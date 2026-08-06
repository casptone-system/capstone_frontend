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
    dean: '/dashboard/dean',
    'program-chair': '/dashboard/program-chair',
    programchair: '/dashboard/program-chair',
    faculty: '/dashboard/faculty',
    // When a new user has no group, send them to the dedicated new-user landing page
    'new-user': '/new-user',
    'new-user-no-groups': '/new-user',
    'no-group': '/new-user',
    'no-groups': '/new-user',
    nogroups: '/new-user',
    qa: '/dashboard/qa',
    'qa-review': '/dashboard/qa',
    vpaa: '/dashboard/vpaa',
    'vpaa-di': '/dashboard/vpaa',
    'super-admin': '/dashboard/super-admin',
    'super-administrator': '/dashboard/super-admin',
    superadmin: '/dashboard/super-admin',
    admin: '/users',
    staff: '/documents',
    'area-in-charge': '/documents',
  }

  return roleRedirects[normalizedRole] || '/dashboard'
}
