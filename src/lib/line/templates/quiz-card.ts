import { Quiz } from '@/types/quiz';
import { FlexMessage } from '@line/bot-sdk';

export function createQuizCard(quiz: Quiz): FlexMessage {
  return {
    type: 'flex',
    altText: `クイズ: ${quiz.question}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'クイズ',
            weight: 'bold',
            color: '#ffffff',
            size: 'xl'
          }
        ],
        backgroundColor: '#27AE60',
        paddingAll: '20px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: quiz.question,
            weight: 'bold',
            size: 'xl',
            wrap: true,
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: quiz.options.map((option, index) => ({
              type: 'button',
              action: {
                type: 'postback',
                label: `${String.fromCharCode(65 + index)}. ${option}`,
                data: `answer:${quiz.id}:${index}`,
                displayText: `${String.fromCharCode(65 + index)}. ${option}`
              },
              style: 'primary',
              margin: 'md',
              color: '#27AE60'
            })),
            margin: 'xl'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: `難易度: ${quiz.difficulty}`,
                size: 'sm',
                color: '#8C8C8C',
                flex: 0
              },
              {
                type: 'text',
                text: `カテゴリ: ${quiz.category}`,
                size: 'sm',
                color: '#8C8C8C',
                align: 'end'
              }
            ],
            margin: 'md'
          }
        ],
        spacing: 'md',
        paddingAll: '20px'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: 'ヒントを見る',
              data: `hint:${quiz.id}`,
              displayText: 'ヒントを表示します'
            },
            style: 'secondary',
            margin: 'md'
          }
        ],
        paddingAll: '20px'
      },
      styles: {
        header: {
          separator: true
        },
        footer: {
          separator: true
        }
      }
    }
  };
} 