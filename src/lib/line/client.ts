import { Client } from '@line/bot-sdk';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const channelSecret = process.env.LINE_CHANNEL_SECRET;

if (!channelAccessToken || !channelSecret) {
  throw new Error('Missing LINE Bot environment variables');
}

export const lineClient = new Client({
  channelAccessToken,
  channelSecret,
}); 