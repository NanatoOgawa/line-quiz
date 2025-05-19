// クイズの難易度
export const QUIZ_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// クイズのカテゴリー
export const QUIZ_CATEGORIES = {
  GENERAL: '一般',
  SCIENCE: '科学',
  HISTORY: '歴史',
  GEOGRAPHY: '地理',
  CULTURE: '文化',
} as const;

// LINE Botの設定
export const LINE_BOT = {
  REPLY_TOKEN_EXPIRY: 30, // 秒
  MAX_REPLY_LENGTH: 1000, // 文字
} as const;

// APIの設定
export const API = {
  RATE_LIMIT: 100, // リクエスト/分
  TIMEOUT: 5000, // ミリ秒
} as const; 