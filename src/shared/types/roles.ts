export type AppRole =
  | 'super-admin'
  | 'vpaa'
  | 'vpaa-di'
  | 'qa'
  | 'dean'
  | 'program-chair'
  | 'area-in-charge'
  | 'faculty'
  | 'admin'
  | 'staff'
  | 'new-user'
  | 'new-user-no-groups'
  | 'no-group'
  | 'no-groups'
  | 'nogroups'
  | string

export const roleLabels: Record<string, string> = {
  'super-admin': 'Super Admin',
  vpaa: 'VPAA/DI',
  'vpaa-di': 'VPAA/DI',
  qa: 'QA',
  dean: 'Dean',
  'program-chair': 'Program Chair',
  'area-in-charge': 'Area In-Charge',
  faculty: 'Faculty',
  admin: 'Admin',
  staff: 'Staff',
  'new-user': 'New User',
  'new-user-no-groups': 'New User',
  'no-group': 'New User',
  'no-groups': 'New User',
  nogroups: 'New User',
}

export const roleHomePaths: Record<string, string> = {
  dean: '/dashboard',
  'program-chair': '/dashboard',
  faculty: '/documents',
  'new-user': '/new-user',
  'new-user-no-groups': '/new-user',
  'no-group': '/new-user',
  'no-groups': '/new-user',
  nogroups: '/new-user',
  qa: '/qa-review',
  vpaa: '/reports',
  'vpaa-di': '/reports',
  'super-admin': '/users',
  admin: '/users',
  staff: '/documents',
  'area-in-charge': '/documents',
}
