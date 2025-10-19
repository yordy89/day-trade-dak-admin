export interface PermissionSet {
  dashboard: boolean
  users: boolean
  subscriptions: boolean
  payments: boolean
  meetings: boolean
  events: boolean
  emailMarketing: boolean // Email Marketing
  financing: boolean // Financing
  affiliates: boolean // Afiliados
  messages: boolean // Contact Messages
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
  modulePermissions: boolean // Permisos de Módulos
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
  emailMarketing?: boolean
  financing?: boolean
  affiliates?: boolean
  messages?: boolean
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
}

export const DEFAULT_ADMIN_PERMISSIONS: PermissionSet = {
  dashboard: true,
  users: true,
  subscriptions: false,
  payments: false,
  meetings: false,
  events: false,
  emailMarketing: false,
  financing: false,
  affiliates: false,
  messages: true,
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
}

export const SUPER_ADMIN_PERMISSIONS: PermissionSet = {
  dashboard: true,
  users: true,
  subscriptions: true,
  payments: true,
  meetings: true,
  events: true,
  emailMarketing: true,
  financing: true,
  affiliates: true,
  messages: true,
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
}