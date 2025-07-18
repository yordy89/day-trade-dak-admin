// Payment related types matching the backend schemas

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
  REQUIRES_ACTION = 'requires_action',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_CAPTURE = 'requires_capture'
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  KLARNA = 'klarna',
  AFTERPAY = 'afterpay',
  AFFIRM = 'affirm'
}

export enum BillingCycle {
  ONE_TIME = 'one_time',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum TransactionType {
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  EVENT_PAYMENT = 'event_payment',
  ONE_TIME_PURCHASE = 'one_time_purchase'
}

export enum SubscriptionPlan {
  // Weekly Plans
  LIVE_WEEKLY_MANUAL = 'live_weekly_manual',
  LIVE_WEEKLY_RECURRING = 'live_weekly_recurring',
  
  // Monthly Recurring
  MASTER_CLASES = 'masterclases',
  LIVE_RECORDED = 'liverecorded',
  PSICOTRADING = 'psicotrading',
  
  // One-time Purchases
  CLASES = 'clases',
  CLASSES = 'classes', // Alternative spelling
  PEACE_WITH_MONEY = 'peace_with_money',
  CURSO_OPCIONES = 'curso_opciones',
  
  // Events
  COMMUNITY_EVENT = 'community_event',
  VIP_EVENT = 'vip_event'
}

export interface SubscriptionPlanInfo {
  id: SubscriptionPlan;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  description: string;
  features: string[];
  color: string;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanInfo> = {
  [SubscriptionPlan.LIVE_WEEKLY_MANUAL]: {
    id: SubscriptionPlan.LIVE_WEEKLY_MANUAL,
    name: 'Live Trading Weekly (Manual)',
    price: 199,
    billingCycle: BillingCycle.WEEKLY,
    description: 'Weekly live trading sessions with manual renewal',
    features: ['5 live sessions per week', 'Real-time trading', 'Q&A sessions'],
    color: '#16a34a'
  },
  [SubscriptionPlan.LIVE_WEEKLY_RECURRING]: {
    id: SubscriptionPlan.LIVE_WEEKLY_RECURRING,
    name: 'Live Trading Weekly (Auto)',
    price: 189,
    billingCycle: BillingCycle.WEEKLY,
    description: 'Weekly live trading sessions with automatic renewal',
    features: ['5 live sessions per week', 'Real-time trading', 'Q&A sessions', 'Auto-renewal discount'],
    color: '#16a34a',
    popular: true
  },
  [SubscriptionPlan.MASTER_CLASES]: {
    id: SubscriptionPlan.MASTER_CLASES,
    name: 'Master Classes',
    price: 349,
    billingCycle: BillingCycle.MONTHLY,
    description: 'Monthly master classes on advanced trading strategies',
    features: ['4 master classes per month', 'Advanced strategies', 'Downloadable materials'],
    color: '#0ea5e9'
  },
  [SubscriptionPlan.LIVE_RECORDED]: {
    id: SubscriptionPlan.LIVE_RECORDED,
    name: 'Live Recorded Sessions',
    price: 249,
    billingCycle: BillingCycle.MONTHLY,
    description: 'Access to all recorded live trading sessions',
    features: ['All past recordings', 'New recordings weekly', 'Lifetime access'],
    color: '#8b5cf6'
  },
  [SubscriptionPlan.PSICOTRADING]: {
    id: SubscriptionPlan.PSICOTRADING,
    name: 'PsicoTrading',
    price: 299,
    billingCycle: BillingCycle.MONTHLY,
    description: 'Trading psychology and mindset coaching',
    features: ['Weekly coaching sessions', 'Personal development', 'Trading psychology'],
    color: '#f97316'
  },
  [SubscriptionPlan.CLASES]: {
    id: SubscriptionPlan.CLASES,
    name: 'Trading Classes',
    price: 499,
    billingCycle: BillingCycle.ONE_TIME,
    description: 'Complete trading course for beginners',
    features: ['20+ hours of content', 'Lifetime access', 'Certificate of completion'],
    color: '#06b6d4'
  },
  [SubscriptionPlan.CLASSES]: {
    id: SubscriptionPlan.CLASSES,
    name: 'Classes',
    price: 500,
    billingCycle: BillingCycle.ONE_TIME,
    description: 'Complete trading course package',
    features: ['Lifetime access', 'All course materials', 'Certificate of completion'],
    color: '#06b6d4'
  },
  [SubscriptionPlan.PEACE_WITH_MONEY]: {
    id: SubscriptionPlan.PEACE_WITH_MONEY,
    name: 'Peace with Money',
    price: 299,
    billingCycle: BillingCycle.ONE_TIME,
    description: 'Financial wellness and money mindset course',
    features: ['10 modules', 'Workbooks included', 'Community access'],
    color: '#84cc16'
  },
  [SubscriptionPlan.CURSO_OPCIONES]: {
    id: SubscriptionPlan.CURSO_OPCIONES,
    name: 'Options Trading Course',
    price: 799,
    billingCycle: BillingCycle.ONE_TIME,
    description: 'Advanced options trading strategies',
    features: ['Options fundamentals', 'Advanced strategies', 'Real examples'],
    color: '#a855f7'
  },
  [SubscriptionPlan.COMMUNITY_EVENT]: {
    id: SubscriptionPlan.COMMUNITY_EVENT,
    name: 'Community Event',
    price: 99,
    billingCycle: BillingCycle.ONE_TIME,
    description: 'Special community trading events',
    features: ['Live event access', 'Networking', 'Q&A sessions'],
    color: '#ec4899'
  },
  [SubscriptionPlan.VIP_EVENT]: {
    id: SubscriptionPlan.VIP_EVENT,
    name: 'VIP Event',
    price: 499,
    billingCycle: BillingCycle.ONE_TIME,
    description: 'Exclusive VIP trading events',
    features: ['VIP access', 'One-on-one sessions', 'Premium materials'],
    color: '#f59e0b'
  }
};