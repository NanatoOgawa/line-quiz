import { Message } from '@line/bot-sdk';

export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface QuizMessage extends Message {
  type: 'text';
  text: string;
  quickReply?: {
    items: {
      type: 'action';
      action: {
        type: 'postback';
        label: string;
        data: string;
      };
    }[];
  };
}

export interface QuizState {
  userId: string;
  currentQuizId?: string;
  sessionId?: string;
  state: 'idle' | 'answering' | 'explanation';
  score: number;
  totalQuestions: number;
  currentQuestion: number;
}
