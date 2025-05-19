import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line/client';
import { WebhookRequestBody, MessageEvent, TextMessage, validateSignature } from '@line/bot-sdk';
import { createQuizCard } from '@/lib/line/templates/quiz-card';
import { Quiz } from '@/types/quiz';
import { getRandomQuiz } from '@/lib/supabase/quiz';

// クイズセッションを管理するMap（実際の運用ではRedisなどを使用することを推奨）
const quizSessions = new Map<string, Quiz>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!validateSignature(rawBody, process.env.LINE_CHANNEL_SECRET || '', signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body: WebhookRequestBody = JSON.parse(rawBody);

    const results = await Promise.allSettled(
      body.events.map(async (event) => {
        try {
          if (event.type === 'message' && event.message.type === 'text') {
            const messageEvent = event as MessageEvent & { message: TextMessage };
            if ('replyToken' in messageEvent) {
              const message = messageEvent.message.text.toLowerCase();
              
              if (message === 'クイズ') {
                // データベースからランダムなクイズを取得
                const quiz = await getRandomQuiz();
                if (!quiz) {
                  await lineClient.replyMessage(
                    messageEvent.replyToken,
                    [
                      {
                        type: 'text',
                        text: '申し訳ありません。現在クイズがありません。',
                      },
                    ]
                  );
                  return;
                }

                // クイズセッションに保存（userIdが存在することを確認）
                if (messageEvent.source.userId) {
                  quizSessions.set(messageEvent.source.userId, quiz);
                }

                // クイズカードを送信
                await lineClient.replyMessage(
                  messageEvent.replyToken,
                  [createQuizCard(quiz)]
                );
              } else {
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
          }
          // ポストバックイベントの処理（クイズの回答など）
          if (event.type === 'postback' && 'replyToken' in event && event.source.userId) {
            const userId = event.source.userId;
            const quiz = quizSessions.get(userId);
            
            if (!quiz) {
              await lineClient.replyMessage(
                event.replyToken,
                [
                  {
                    type: 'text',
                    text: 'クイズのセッションが切れました。「クイズ」と送信して新しいクイズを開始してください。',
                  },
                ]
              );
              return;
            }

            const [action, , answerIndex] = event.postback.data.split(':');
            
            if (action === 'answer') {
              const isCorrect = parseInt(answerIndex) === quiz.correct_answer;
              await lineClient.replyMessage(
                event.replyToken,
                [
                  {
                    type: 'text',
                    text: isCorrect 
                      ? `正解です！🎉\n${quiz.explanation || ''}`
                      : `残念、不正解です。\n${quiz.explanation || ''}`
                  }
                ]
              );
              // セッションをクリア
              quizSessions.delete(userId);
            } else if (action === 'hint') {
              await lineClient.replyMessage(
                event.replyToken,
                [
                  {
                    type: 'text',
                    text: `ヒント: このクイズは${quiz.category}に関する問題です。`
                  }
                ]
              );
            }
          }
        } catch (error) {
          console.error(`Error processing event:`, error);
          throw error;
        }
      })
    );

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