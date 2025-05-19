import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    // クイズの取得
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // クイズの作成
    const { data, error } = await supabase
      .from('quizzes')
      .insert([body])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ quiz: data[0] });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 