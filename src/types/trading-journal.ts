export enum MarketType {
  STOCKS = 'stocks',
  OPTIONS = 'options',
  FUTURES = 'futures',
  FOREX = 'forex',
  CRYPTO = 'crypto',
}

export enum TradeDirection {
  LONG = 'long',
  SHORT = 'short',
}

export enum OptionType {
  CALL = 'call',
  PUT = 'put',
}

export enum EmotionType {
  CONFIDENT = 'confident',
  ANXIOUS = 'anxious',
  GREEDY = 'greedy',
  FEARFUL = 'fearful',
  NEUTRAL = 'neutral',
  EXCITED = 'excited',
  FRUSTRATED = 'frustrated',
  CALM = 'calm',
}

export enum ExitReason {
  HIT_STOP_LOSS = 'hit_stop_loss',
  HIT_TAKE_PROFIT = 'hit_take_profit',
  MANUAL_EXIT = 'manual_exit',
  TIME_BASED_EXIT = 'time_based_exit',
  TRAILING_STOP = 'trailing_stop',
  TECHNICAL_SIGNAL = 'technical_signal',
  NEWS_EVENT = 'news_event',
  RISK_MANAGEMENT = 'risk_management',
  // Options-specific
  EXPIRED_WORTHLESS = 'expired_worthless',
  SOLD_FOR_PROFIT = 'sold_for_profit',
  SOLD_FOR_LOSS = 'sold_for_loss',
  EXERCISED = 'exercised',
  ASSIGNED = 'assigned',
  ROLLED_POSITION = 'rolled_position',
}

export enum TimeFilter {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all',
  CUSTOM = 'custom',
}

export enum TradeResult {
  WINNERS = 'winners',
  LOSERS = 'losers',
  BREAKEVEN = 'breakeven',
  ALL = 'all',
}

export enum FeedbackRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export interface Trade {
  _id: string
  userId: string
  tradeDate: Date
  symbol: string
  market: MarketType
  entryTime: Date
  entryPrice: number
  positionSize: number
  direction: TradeDirection
  // Options-specific fields
  optionType?: OptionType
  strikePrice?: number
  expirationDate?: Date
  exitTime?: Date
  exitPrice?: number
  exitReason?: string
  exitReasonType?: ExitReason
  exitReasonNotes?: string
  exitPremium?: number
  underlyingPriceAtExit?: number
  lessonsLearnedOnExit?: string
  wouldRepeatTrade?: boolean
  exitEmotionState?: EmotionType
  stopLoss: number
  takeProfit?: number
  riskAmount: number
  riskPercentage: number
  setup: string
  strategy: string
  timeframe?: string
  confidence: number
  commission: number
  emotionBefore?: EmotionType
  emotionDuring?: EmotionType
  emotionAfter?: EmotionType
  preTradeAnalysis?: string
  postTradeNotes?: string
  lessonsLearned?: string
  mistakes?: string[]
  tags?: string[]
  screenshots?: string[]
  isOpen: boolean
  pnl: number
  netPnl: number
  rMultiple: number
  isWinner: boolean
  holdingTime?: number
  isReviewed: boolean
  reviewedBy?: string
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateTradeDto {
  tradeDate: Date
  symbol: string
  market: MarketType
  entryTime: Date
  entryPrice: number
  positionSize: number
  direction: TradeDirection
  exitTime?: Date
  exitPrice?: number
  exitReason?: string
  exitReasonType?: ExitReason
  exitReasonNotes?: string
  exitPremium?: number
  underlyingPriceAtExit?: number
  lessonsLearnedOnExit?: string
  wouldRepeatTrade?: boolean
  exitEmotionState?: EmotionType
  stopLoss: number
  takeProfit?: number
  riskAmount: number
  riskPercentage: number
  setup: string
  strategy: string
  timeframe?: string
  confidence: number
  commission?: number
  emotionBefore?: EmotionType
  emotionDuring?: EmotionType
  emotionAfter?: EmotionType
  preTradeAnalysis?: string
  postTradeNotes?: string
  lessonsLearned?: string
  mistakes?: string[]
  tags?: string[]
  screenshots?: string[]
}

export interface UpdateTradeDto extends Partial<CreateTradeDto> {}

export interface Feedback {
  _id: string
  tradeId: string
  mentorId: string
  studentId: string
  strengths?: string[]
  improvements?: string[]
  patternsIdentified?: string[]
  entryAnalysis?: string
  exitAnalysis?: string
  riskManagementReview?: string
  psychologyNotes?: string
  setupQualityReview?: string
  recommendations?: string[]
  suggestedResources?: string[]
  actionItems?: string[]
  overallRating: FeedbackRating
  riskManagementRating: FeedbackRating
  executionRating: FeedbackRating
  psychologyRating?: FeedbackRating
  analysisRating?: FeedbackRating
  requiresFollowUp?: boolean
  followUpDate?: Date
  isPinned?: boolean
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateFeedbackDto {
  tradeId: string
  studentId: string
  strengths?: string[]
  improvements?: string[]
  patternsIdentified?: string[]
  entryAnalysis?: string
  exitAnalysis?: string
  riskManagementReview?: string
  psychologyNotes?: string
  setupQualityReview?: string
  recommendations?: string[]
  suggestedResources?: string[]
  actionItems?: string[]
  overallRating: FeedbackRating
  riskManagementRating: FeedbackRating
  executionRating: FeedbackRating
  psychologyRating?: FeedbackRating
  analysisRating?: FeedbackRating
  requiresFollowUp?: boolean
  followUpDate?: Date
  isPinned?: boolean
}

export interface FilterTradesDto {
  page?: number
  limit?: number
  timeFilter?: TimeFilter
  startDate?: Date
  endDate?: Date
  symbol?: string
  market?: MarketType
  direction?: TradeDirection
  strategy?: string
  setup?: string
  result?: TradeResult
  openOnly?: boolean
  reviewedOnly?: boolean
  tags?: string[]
  minRMultiple?: number
  maxRMultiple?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TradeStatistics {
  totalTrades: number
  winners: number
  losers: number
  totalPnl: number
  totalGross: number
  totalCommission: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  avgRMultiple: number
  avgHoldingTime: number
  totalVolume: number
  winRate: number
  profitFactor: number
  expectancy: number
  strategyStats: Array<{
    _id: string
    trades: number
    pnl: number
    winRate: number
  }>
  marketStats: Array<{
    _id: string
    trades: number
    pnl: number
  }>
  optionTypeStats?: Array<{
    _id: string // 'call' or 'put'
    trades: number
    pnl: number
    winRate: number
  }>
}

export interface DailyPnl {
  date: string
  pnl: number
  cumulative: number
  trades: number
  winners: number
}

export interface TradesResponse {
  trades: Trade[]
  total: number
  page: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface StudentWithJournal {
  _id: string
  firstName: string
  lastName: string
  email: string
  totalTrades: number
  winRate: number
  totalPnl: number
  lastTradeDate?: Date
  needsReview: number
}
