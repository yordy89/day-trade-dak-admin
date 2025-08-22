export interface PermissionSet {
  dashboard: boolean
  users: boolean
  subscriptions: boolean
  payments: boolean
  meetings: boolean
  events: boolean
  content: boolean
  courses: boolean
  announcements: boolean
  analytics: boolean
  transactions: boolean
  reports: boolean
  settings: boolean
  auditLogs: boolean
  permissions?: boolean // Only visible for super_admin
  contactMessages: boolean
  modulePermissions: boolean // New: Permisos de Módulos
  affiliates: boolean // New: Afiliados
}

export interface AdminUserWithPermissions {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'super_admin'
  status: string
  permissions: PermissionSet
}

export interface UpdatePermissionsRequest {
  dashboard?: boolean
  users?: boolean
  subscriptions?: boolean
  payments?: boolean
  meetings?: boolean
  events?: boolean
  content?: boolean
  courses?: boolean
  announcements?: boolean
  analytics?: boolean
  transactions?: boolean
  reports?: boolean
  settings?: boolean
  auditLogs?: boolean
  permissions?: boolean
  contactMessages?: boolean
  modulePermissions?: boolean
  affiliates?: boolean
}

export const DEFAULT_ADMIN_PERMISSIONS: PermissionSet = {
  dashboard: true,
  users: true,
  subscriptions: false,
  payments: false,
  meetings: false,
  events: false,
  content: false,
  courses: false,
  announcements: false,
  analytics: true,
  transactions: false,
  reports: true,
  settings: true,
  auditLogs: false,
  permissions: false,
  contactMessages: true,
  modulePermissions: false, // Admins don't get module permissions by default
  affiliates: false, // Admins don't get affiliates permission by default
}

export const SUPER_ADMIN_PERMISSIONS: PermissionSet = {
  dashboard: true,
  users: true,
  subscriptions: true,
  payments: true,
  meetings: true,
  events: true,
  content: true,
  courses: true,
  announcements: true,
  analytics: true,
  transactions: true,
  reports: true,
  settings: true,
  auditLogs: true,
  permissions: true,
  contactMessages: true,
  modulePermissions: true, // Super admins have module permissions
  affiliates: true, // Super admins have affiliates permission
}