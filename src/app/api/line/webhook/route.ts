import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line/client';
import { WebhookRequestBody, MessageEvent, TextMessage, validateSignature } from '@line/bot-sdk';

export async function POST(req: NextRequest) {
  try {
    const body: WebhookRequestBody = await req.json();
    
    // 署名検証
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const rawBody = await req.text();
    if (!validateSignature(rawBody, process.env.LINE_CHANNEL_SECRET || '', signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // イベントの処理
    const results = await Promise.allSettled(
      body.events.map(async (event) => {
        try {
          if (event.type === 'message' && event.message.type === 'text') {
            const messageEvent = event as MessageEvent & { message: TextMessage };
            if ('replyToken' in messageEvent) {
              await lineClient.replyMessage(
                messageEvent.replyToken,
                [
                  {
                    type: 'text',
                    text: `受信したメッセージ: ${messageEvent.message.text}`,
                  },
                ]
              );
            }
          }
        } catch (error) {
          console.error(`Error processing event:`, error);
          // エラーが発生しても他のイベントの処理は継続
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