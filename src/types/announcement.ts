export enum AnnouncementType {
  FED_MEETING = 'fed_meeting',
  EARNINGS = 'earnings',
  MARKET_NEWS = 'market_news',
  PLATFORM_UPDATE = 'platform_update',
  WEBINAR = 'webinar',
  COURSE = 'course',
  MENTORSHIP = 'mentorship',
  GENERAL = 'general',
}

export enum DisplayFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ALWAYS = 'always',
}

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  isActive: boolean;
  link?: string;
  linkText?: string;
  icon?: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  startDate: string;
  endDate: string;
  dismissible: boolean;
  dismissDurationHours: number;
  targetAudience?: string[];
  viewCount: number;
  clickCount: number;
  dismissCount: number;
  metadata?: Record<string, any>;
  template?: string;
  customStyles?: {
    headerBg?: string;
    headerText?: string;
    bodyBg?: string;
    bodyText?: string;
    buttonBg?: string;
    buttonText?: string;
    borderColor?: string;
    animation?: string;
  };
  customHtml?: string;
  displayFrequency?: DisplayFrequency;
  imageUrl?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  lastModifiedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  isActive?: boolean;
  link?: string;
  linkText?: string;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  startDate: string;
  endDate: string;
  dismissible?: boolean;
  dismissDurationHours?: number;
  targetAudience?: string[];
  metadata?: Record<string, any>;
  template?: string;
  customStyles?: {
    headerBg?: string;
    headerText?: string;
    bodyBg?: string;
    bodyText?: string;
    buttonBg?: string;
    buttonText?: string;
    borderColor?: string;
    animation?: string;
  };
  customHtml?: string;
  displayFrequency?: DisplayFrequency;
  imageUrl?: string;
}

export interface UpdateAnnouncementDto extends Partial<CreateAnnouncementDto> {}