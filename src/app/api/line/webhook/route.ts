import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line/client';
import { WebhookRequestBody, MessageEvent, TextMessage, validateSignature } from '@line/bot-sdk';
import { createQuizCard } from '@/lib/line/templates/quiz-card';
import { quizRepository } from '@/lib/features/quiz/service';
import { quizSessionManager } from '@/lib/features/quiz/session';
import { AppError, ErrorCodes, handleError } from '@/types/error';

type PostbackAction = 'answer' | 'hint';
type PostbackData = {
  action: PostbackAction;
  quizId: string;
  answerIndex?: string;
};

function parsePostbackData(data: string): PostbackData {
  const [action, quizId, answerIndex] = data.split(':');
  if (action !== 'answer' && action !== 'hint') {
    throw new AppError('Invalid postback action', ErrorCodes.INVALID_POSTBACK);
  }
  return { action, quizId, answerIndex };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      throw new AppError('No signature', ErrorCodes.INVALID_SIGNATURE);
    }

    if (!validateSignature(rawBody, process.env.LINE_CHANNEL_SECRET || '', signature)) {
      throw new AppError('Invalid signature', ErrorCodes.INVALID_SIGNATURE);
    }

    const body: WebhookRequestBody = JSON.parse(rawBody);

    const results = await Promise.allSettled(
      body.events.map(async (event) => {
        try {
          if (event.type === 'message' && event.message.type === 'text') {
            const messageEvent = event as MessageEvent & { message: TextMessage };
            if (!('replyToken' in messageEvent) || !messageEvent.source.userId) {
              return;
            }

            const message = messageEvent.message.text.toLowerCase();
            
            if (message === 'クイズ') {
              const quiz = await quizRepository.findRandom();
              if (!quiz) {
                await lineClient.replyMessage(
                  messageEvent.replyToken,
                  [{
                    type: 'text',
                    text: '申し訳ありません。現在クイズがありません。',
                  }]
                );
                return;
              }

              await quizSessionManager.createSession(messageEvent.source.userId, quiz);
              await lineClient.replyMessage(
                messageEvent.replyToken,
                [createQuizCard(quiz)]
              );
            } else {
              await lineClient.replyMessage(
                messageEvent.replyToken,
                [{
                  type: 'text',
                  text: '「クイズ」と送信すると、クイズが始まります！',
                }]
              );
            }
          }

          if (event.type === 'postback' && 'replyToken' in event && event.source.userId) {
            const userId = event.source.userId;
            const { action, answerIndex } = parsePostbackData(event.postback.data);
            
            if (action === 'answer') {
              try {
                const session = await quizSessionManager.getSession(userId);
                await quizSessionManager.recordAttempt(userId);
                
                const startTime = session.startTime.getTime();
                const now = new Date().getTime();
                const responseTime = now - startTime;
                
                const isCorrect = parseInt(answerIndex || '') === session.quiz.correct_answer;
                await quizSessionManager.updateSessionStats(userId, isCorrect, responseTime);
                
                await lineClient.replyMessage(
                  event.replyToken,
                  [{
                    type: 'text',
                    text: isCorrect 
                      ? `正解です！🎉\n${session.quiz.explanation || ''}`
                      : `残念、不正解です。\n${session.quiz.explanation || ''}`
                  }]
                );
                await quizSessionManager.deleteSession(userId);
              } catch (error) {
                if (error instanceof AppError) {
                  await lineClient.replyMessage(
                    event.replyToken,
                    [{ type: 'text', text: error.message }]
                  );
                } else {
                  throw error;
                }
              }
            } else if (action === 'hint') {
              try {
                const session = await quizSessionManager.getSession(userId);
                if (!await quizSessionManager.canShowHint(userId)) {
                  await lineClient.replyMessage(
                    event.replyToken,
                    [{
                      type: 'text',
                      text: 'ヒントは5分に1回しか表示できません。しばらく待ってから再度お試しください。'
                    }]
                  );
                  return;
                }

                await quizSessionManager.recordHintShown(userId);
                await lineClient.replyMessage(
                  event.replyToken,
                  [{
                    type: 'text',
                    text: `ヒント: このクイズは${session.quiz.category}に関する問題です。`
                  }]
                );
              } catch (error) {
                if (error instanceof AppError) {
                  await lineClient.replyMessage(
                    event.replyToken,
                    [{ type: 'text', text: error.message }]
                  );
                } else {
                  throw error;
                }
              }
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
    const errorResponse = handleError(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === ErrorCodes.INVALID_SIGNATURE ? 401 : 500 }
    );
  }
} 