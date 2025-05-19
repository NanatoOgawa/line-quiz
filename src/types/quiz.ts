export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface QuizResponse {
  quiz: Quiz;
  user_answer?: number;
  is_correct?: boolean;
}

export interface QuizSession {
  id: string;
  user_id: string;
  quiz_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  answers: {
    quiz_id: string;
    user_answer: number;
    is_correct: boolean;
  }[];
}
