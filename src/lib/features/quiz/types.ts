import { Quiz } from '@/types/quiz';

export interface QuizSession {
  quiz: Quiz;
  startTime: Date;
  attempts: number;
  lastHintTime?: Date;
  stats?: {
    totalCorrect: number;
    totalAttempts: number;
    averageResponseTime: number;
    lastResponseTime?: Date;
  };
}

export interface QuizSessionConfig {
  sessionTimeoutMs: number;
  maxAttempts: number;
  hintCooldownMs: number;
}

export const DEFAULT_QUIZ_SESSION_CONFIG: QuizSessionConfig = {
  sessionTimeoutMs: 30 * 60 * 1000, // 30分
  maxAttempts: 3,
  hintCooldownMs: 5 * 60 * 1000, // 5分
};

export interface QuizSessionManager {
  createSession(userId: string, quiz: Quiz): Promise<void>;
  getSession(userId: string): Promise<QuizSession>;
  recordAttempt(userId: string): Promise<void>;
  canShowHint(userId: string): Promise<boolean>;
  recordHintShown(userId: string): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
} 