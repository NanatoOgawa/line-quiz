export type Quiz = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // 正解の選択肢のインデックス（0-based）
  explanation: string | null; // 解説（null許容）
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
};

export type CreateQuizInput = Omit<Quiz, 'id' | 'created_at' | 'updated_at'>;
export type UpdateQuizInput = Partial<CreateQuizInput>;

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
