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
    dean: '/dashboard',
    'program-chair': '/dashboard',
    programchair: '/dashboard',
    faculty: '/documents',
    'new-user': '/join-team',
    'new-user-no-groups': '/join-team',
    'no-group': '/join-team',
    'no-groups': '/join-team',
    nogroups: '/join-team',
    qa: '/qa-review',
    'qa-review': '/qa-review',
    vpaa: '/reports',
    'vpaa-di': '/reports',
    'super-admin': '/users',
    superadmin: '/users',
    admin: '/users',
    staff: '/documents',
    'area-in-charge': '/documents',
  }

  return roleRedirects[normalizedRole] || '/dashboard'
}
