import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line/client';
import { WebhookRequestBody, MessageEvent, TextMessage, validateSignature } from '@line/bot-sdk';
import { createQuizCard } from '@/lib/line/templates/quiz-card';
import { supabase } from '@/lib/supabase/client';
import { Quiz } from '@/types/quiz';

// テスト用のクイズデータ
const sampleQuiz: Quiz = {
  id: '1',
  question: 'Next.jsの最新バージョンは？',
  options: ['13.0.0', '14.0.0', '15.0.0', '16.0.0'],
  correct_answer: 2,
  explanation: 'Next.js 15.0.0が最新バージョンです。',
  category: 'Web開発',
  difficulty: 'easy' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export async function POST(req: NextRequest) {
  try {
    // リクエストボディを1回だけ読み取る
    const rawBody = await req.text();
    
    // 署名検証
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!validateSignature(rawBody, process.env.LINE_CHANNEL_SECRET || '', signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 署名検証後にJSONパース
    const body: WebhookRequestBody = JSON.parse(rawBody);

    // イベントの処理
    const results = await Promise.allSettled(
      body.events.map(async (event) => {
        try {
          if (event.type === 'message' && event.message.type === 'text') {
            const messageEvent = event as MessageEvent & { message: TextMessage };
            if ('replyToken' in messageEvent) {
              const message = messageEvent.message.text.toLowerCase();
              
              if (message === 'クイズ') {
                // クイズカードを送信
                await lineClient.replyMessage(
                  messageEvent.replyToken,
                  [createQuizCard(sampleQuiz)]
                );
              } else {
                // 通常のテキストメッセージの応答
                await lineClient.replyMessage(
                  messageEvent.replyToken,
                  [
                    {
                      type: 'text',
                      text: '「クイズ」と送信すると、クイズが始まります！',
                    },
                  ]
                );
              }
            }
          } else if (event.type === 'postback') {
            // ポストバックイベントの処理（クイズの回答など）
            if ('replyToken' in event) {
              const [action, quizId, answerIndex] = event.postback.data.split(':');
              
              if (action === 'answer') {
                const isCorrect = parseInt(answerIndex) === sampleQuiz.correct_answer;
                await lineClient.replyMessage(
                  event.replyToken,
                  [
                    {
                      type: 'text',
                      text: isCorrect 
                        ? '正解です！🎉\n' + sampleQuiz.explanation
                        : '残念、不正解です。\n' + sampleQuiz.explanation
                    }
                  ]
                );
              } else if (action === 'hint') {
                await lineClient.replyMessage(
                  event.replyToken,
                  [
                    {
                      type: 'text',
                      text: 'ヒント: このクイズはWeb開発に関する問題です。'
                    }
                  ]
                );
              }
            }
          }
        } catch (error) {
          console.error(`Error processing event:`, error);
          throw error;
        }
      })
    );

    // 処理結果の確認
    const hasErrors = results.some(result => result.status === 'rejected');
    if (hasErrors) {
      console.error('Some events failed to process:', results);
      return NextResponse.json(
        { message: 'OK', note: 'Some events failed to process' },
        { status: 207 }
      );
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 