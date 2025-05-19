import { supabase } from './client';
import { Quiz, CreateQuizInput, UpdateQuizInput } from '@/types/quiz';

// データベースから取得したデータをQuiz型に変換する関数
function transformQuizData(data: {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  category: string;
  difficulty: string;
  created_at: string;
  updated_at: string;
}): Quiz {
  return {
    ...data,
    difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
  };
}

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }

  return data.map(transformQuizData);
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }

  return data ? transformQuizData(data) : null;
}

export async function createQuiz(quiz: CreateQuizInput): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quiz)
    .select()
    .single();

  if (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }

  return transformQuizData(data);
}

export async function updateQuiz(id: string, quiz: UpdateQuizInput): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .update(quiz)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }

  return transformQuizData(data);
}

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
}

export async function getQuizzesByCategory(category: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes by category:', error);
    throw error;
  }

  return data.map(transformQuizData);
}

export async function getQuizzesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes by difficulty:', error);
    throw error;
  }

  return data.map(transformQuizData);
}

export async function searchQuizzes(searchTerm: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .ilike('question', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching quizzes:', error);
    throw error;
  }

  return data.map(transformQuizData);
}

export async function getRandomQuiz(): Promise<Quiz | null> {
  // まず、クイズの総数を取得
  const { count, error: countError } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting quizzes:', countError);
    throw countError;
  }

  if (!count || count === 0) {
    return null;
  }

  // ランダムなオフセットを生成
  const randomOffset = Math.floor(Math.random() * count);

  // オフセットを使用してランダムなクイズを取得
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .range(randomOffset, randomOffset)
    .single();

  if (error) {
    console.error('Error fetching random quiz:', error);
    throw error;
  }

  return data ? transformQuizData(data) : null;
}

export async function getQuizzesByDateRange(startDate: string, endDate: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes by date range:', error);
    throw error;
  }

  return data.map(transformQuizData);
} 