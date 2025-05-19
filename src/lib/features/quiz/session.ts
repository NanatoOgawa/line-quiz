import { AppError, ErrorCodes } from '@/types/error';
import { Quiz } from '@/types/quiz';
import {
  QuizSession,
  QuizSessionConfig,
  QuizSessionManager,
  DEFAULT_QUIZ_SESSION_CONFIG,
  QuizSessionStats
} from './types';

export class InMemoryQuizSessionManager implements QuizSessionManager {
  private sessions: Map<string, QuizSession>;
  private config: QuizSessionConfig;

  constructor(config: QuizSessionConfig = DEFAULT_QUIZ_SESSION_CONFIG) {
    this.sessions = new Map();
    this.config = config;
  }

  async createSession(userId: string, quiz: Quiz): Promise<void> {
    this.sessions.set(userId, {
      quiz,
      startTime: new Date(),
      attempts: 0,
      stats: {
        totalCorrect: 0,
        totalAttempts: 0,
        averageResponseTime: 0
      }
    });
  }

  async getSession(userId: string): Promise<QuizSession> {
    const session = this.sessions.get(userId);
    if (!session) {
      throw new AppError(
        'クイズのセッションが切れました。「クイズ」と送信して新しいクイズを開始してください。',
        ErrorCodes.SESSION_EXPIRED
      );
    }

    if (this.isSessionExpired(session)) {
      await this.deleteSession(userId);
      throw new AppError(
        'セッションの有効期限が切れました。「クイズ」と送信して新しいクイズを開始してください。',
        ErrorCodes.SESSION_EXPIRED
      );
    }

    return session;
  }

  async recordAttempt(userId: string): Promise<void> {
    const session = await this.getSession(userId);
    session.attempts++;
    session.stats!.totalAttempts++;

    if (session.attempts >= this.config.maxAttempts) {
      await this.deleteSession(userId);
      throw new AppError(
        '回答回数の上限に達しました。「クイズ」と送信して新しいクイズを開始してください。',
        ErrorCodes.SESSION_EXPIRED
      );
    }
  }

  async canShowHint(userId: string): Promise<boolean> {
    const session = await this.getSession(userId);
    if (!session.lastHintTime) return true;

    const now = new Date();
    return now.getTime() - session.lastHintTime.getTime() >= this.config.hintCooldownMs;
  }

  async recordHintShown(userId: string): Promise<void> {
    const session = await this.getSession(userId);
    session.lastHintTime = new Date();
  }

  async deleteSession(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [userId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        await this.deleteSession(userId);
      }
    }
  }

  private isSessionExpired(session: QuizSession): boolean {
    const now = new Date();
    return now.getTime() - session.startTime.getTime() > this.config.sessionTimeoutMs;
  }

  // 将来的な拡張のためのメソッド
  async updateSessionStats(userId: string, isCorrect: boolean, responseTime: number): Promise<void> {
    const session = await this.getSession(userId);
    if (!session.stats) {
      session.stats = {
        totalCorrect: 0,
        totalAttempts: 0,
        averageResponseTime: 0
      };
    }

    session.stats.totalCorrect += isCorrect ? 1 : 0;
    session.stats.lastResponseTime = new Date();
    
    // 平均応答時間の更新
    const totalTime = session.stats.averageResponseTime * session.stats.totalAttempts;
    session.stats.totalAttempts++;
    session.stats.averageResponseTime = (totalTime + responseTime) / session.stats.totalAttempts;
  }
}

// シングルトンインスタンスのエクスポート
export const quizSessionManager = new InMemoryQuizSessionManager(); 