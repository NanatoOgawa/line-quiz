import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line/client';
import { WebhookRequestBody } from '@line/bot-sdk';

export async function POST(req: NextRequest) {
  try {
    const body: WebhookRequestBody = await req.json();
    
    // 署名検証
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // イベントの処理
    await Promise.all(
      body.events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          // テキストメッセージの処理
          await lineClient.replyMessage(
            event.replyToken,
            [
              {
                type: 'text',
                text: `受信したメッセージ: ${event.message.text}`,
              },
            ]
          );
        }
      })
    );

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 