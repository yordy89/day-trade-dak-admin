export enum ModuleType {
  CLASSES = 'classes',
  MASTER_CLASSES = 'masterClasses',
  LIVE_RECORDED = 'liveRecorded',
  PSICOTRADING = 'psicotrading',
  PEACE_WITH_MONEY = 'peaceWithMoney',
  LIVE_WEEKLY = 'liveWeekly',
  COMMUNITY_EVENTS = 'communityEvents',
  VIP_EVENTS = 'vipEvents',
  MASTER_COURSE = 'masterCourse',
  STOCKS = 'stocks',
}

export interface ModulePermission {
  _id: string
  userId: string
  moduleType: ModuleType
  hasAccess: boolean
  expiresAt?: Date
  grantedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  reason?: string
  isActive: boolean
  fromSubscription: boolean
  subscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateModulePermissionDto {
  userId: string
  moduleType: ModuleType
  hasAccess?: boolean
  expiresAt?: string
  reason?: string
}

export interface UpdateModulePermissionDto {
  hasAccess?: boolean
  expiresAt?: string
  reason?: string
}

export interface UserWithModuleAccess {
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profileImage?: string
  }
  permission: {
    expiresAt?: Date
    grantedAt: Date
    reason?: string
  }
}

export const MODULE_DISPLAY_NAMES: Record<ModuleType, { es: string; en: string }> = {
  [ModuleType.CLASSES]: { es: 'Clases', en: 'Classes' },
  [ModuleType.MASTER_CLASSES]: { es: 'Masterclass', en: 'Master Classes' },
  [ModuleType.LIVE_RECORDED]: { es: 'Live Grabados', en: 'Live Recorded' },
  [ModuleType.PSICOTRADING]: { es: 'Psicotrading', en: 'Psicotrading' },
  [ModuleType.PEACE_WITH_MONEY]: { es: 'Paz con el Dinero', en: 'Peace with Money' },
  [ModuleType.LIVE_WEEKLY]: { es: 'Live Semanal', en: 'Live Weekly' },
  [ModuleType.COMMUNITY_EVENTS]: { es: 'Eventos Comunitarios', en: 'Community Events' },
  [ModuleType.VIP_EVENTS]: { es: 'Eventos VIP', en: 'VIP Events' },
  [ModuleType.MASTER_COURSE]: { es: 'Master Course', en: 'Master Course' },
  [ModuleType.STOCKS]: { es: 'Acciones', en: 'Stocks' },
}