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
  dean: '/user/dashboard/dean',
  'program-chair': '/user/dashboard/program-chair',
  faculty: '/user/dashboard/faculty',
  'new-user': '/new-user',
  'new-user-no-groups': '/new-user',
  'no-group': '/new-user',
  'no-groups': '/new-user',
  nogroups: '/new-user',
  qa: '/user/dashboard/qa',
  vpaa: '/user/dashboard/vpaa',
  'vpaa-di': '/user/dashboard/vpaa',
  'super-admin': '/superadmin',
  admin: '/superadmin',
  staff: '/documents',
  'area-in-charge': '/user/dashboard/area-incharge',
}
