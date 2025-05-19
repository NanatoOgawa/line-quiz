import { Quiz } from '@/types/quiz';
import { AppError, ErrorCodes } from '@/types/error';

export interface QuizSession {
  quiz: Quiz;
  startTime: Date;
  attempts: number;
  lastHintTime?: Date;
}

export class QuizSessionManager {
  private static readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30分
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly HINT_COOLDOWN_MS = 5 * 60 * 1000; // 5分

  private sessions = new Map<string, QuizSession>();

  createSession(userId: string, quiz: Quiz): void {
    this.sessions.set(userId, {
      quiz,
      startTime: new Date(),
      attempts: 0
    });
  }

  getSession(userId: string): QuizSession {
    const session = this.sessions.get(userId);
    if (!session) {
      throw new AppError(
        'クイズのセッションが切れました。「クイズ」と送信して新しいクイズを開始してください。',
        ErrorCodes.SESSION_EXPIRED
      );
    }

    if (this.isSessionExpired(session)) {
      this.sessions.delete(userId);
      throw new AppError(
        'セッションの有効期限が切れました。「クイズ」と送信して新しいクイズを開始してください。',
        ErrorCodes.SESSION_EXPIRED
      );
    }

    return session;
  }

  recordAttempt(userId: string): void {
    const session = this.getSession(userId);
    session.attempts++;

    if (session.attempts >= QuizSessionManager.MAX_ATTEMPTS) {
      this.sessions.delete(userId);
      throw new AppError(
        '回答回数の上限に達しました。「クイズ」と送信して新しいクイズを開始してください。',
        ErrorCodes.SESSION_EXPIRED
      );
    }
  }

  canShowHint(userId: string): boolean {
    const session = this.getSession(userId);
    if (!session.lastHintTime) return true;

    const now = new Date();
    return now.getTime() - session.lastHintTime.getTime() >= QuizSessionManager.HINT_COOLDOWN_MS;
  }

  recordHintShown(userId: string): void {
    const session = this.getSession(userId);
    session.lastHintTime = new Date();
  }

  deleteSession(userId: string): void {
    this.sessions.delete(userId);
  }

  private isSessionExpired(session: QuizSession): boolean {
    const now = new Date();
    return now.getTime() - session.startTime.getTime() > QuizSessionManager.SESSION_TIMEOUT_MS;
  }
}

export const quizSessionManager = new QuizSessionManager(); 