import { Quiz, CreateQuizInput, UpdateQuizInput } from '@/types/quiz';
import { supabase } from '@/lib/supabase/client';
import { AppError, ErrorCodes } from '@/types/error';

export interface QuizRepository {
  findAll(): Promise<Quiz[]>;
  findById(id: string): Promise<Quiz | null>;
  findRandom(): Promise<Quiz | null>;
  findByCategory(category: string): Promise<Quiz[]>;
  findByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Quiz[]>;
  search(searchTerm: string): Promise<Quiz[]>;
  create(quiz: CreateQuizInput): Promise<Quiz>;
  update(id: string, quiz: UpdateQuizInput): Promise<Quiz>;
  delete(id: string): Promise<void>;
}

export class SupabaseQuizRepository implements QuizRepository {
  private transformQuizData(data: any): Quiz {
    return {
      ...data,
      difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
    };
  }

  async findAll(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes:', error);
      throw new AppError('Failed to fetch quizzes', ErrorCodes.INTERNAL_ERROR, error);
    }

    return data.map(this.transformQuizData);
  }

  async findById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quiz:', error);
      throw new AppError('Failed to fetch quiz', ErrorCodes.INTERNAL_ERROR, error);
    }

    return data ? this.transformQuizData(data) : null;
  }

  async findRandom(): Promise<Quiz | null> {
    const { count, error: countError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting quizzes:', countError);
      throw new AppError('Failed to count quizzes', ErrorCodes.INTERNAL_ERROR, countError);
    }

    if (!count || count === 0) {
      return null;
    }

    const randomOffset = Math.floor(Math.random() * count);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error('Error fetching random quiz:', error);
      throw new AppError('Failed to fetch random quiz', ErrorCodes.INTERNAL_ERROR, error);
    }

    return data ? this.transformQuizData(data) : null;
  }

  async findByCategory(category: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes by category:', error);
      throw new AppError('Failed to fetch quizzes by category', ErrorCodes.INTERNAL_ERROR, error);
    }

    return data.map(this.transformQuizData);
  }

  async findByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes by difficulty:', error);
      throw new AppError('Failed to fetch quizzes by difficulty', ErrorCodes.INTERNAL_ERROR, error);
    }

    return data.map(this.transformQuizData);
  }

  async search(searchTerm: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .ilike('question', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching quizzes:', error);
      throw new AppError('Failed to search quizzes', ErrorCodes.INTERNAL_ERROR, error);
    }

    return data.map(this.transformQuizData);
  }

  async create(quiz: CreateQuizInput): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      throw new AppError('Failed to create quiz', ErrorCodes.INTERNAL_ERROR, error);
    }

    return this.transformQuizData(data);
  }

  async update(id: string, quiz: UpdateQuizInput): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(quiz)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz:', error);
      throw new AppError('Failed to update quiz', ErrorCodes.INTERNAL_ERROR, error);
    }

    return this.transformQuizData(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quiz:', error);
      throw new AppError('Failed to delete quiz', ErrorCodes.INTERNAL_ERROR, error);
    }
  }
}

// シングルトンインスタンスのエクスポート
export const quizRepository = new SupabaseQuizRepository(); 