import EnvVars from '@/constants/EnvVars';
import { type Message } from 'ai';

export interface MinimumSoftLanguageModel {
  id: string;
  name: string;
  description?: string;
  type: 'minimumsoft';
}

export const minimumSoftModels: MinimumSoftLanguageModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'MinimumSoft GPT-4',
    description: 'MinimumSoftのカスタムモデル',
    type: 'minimumsoft',
  },
];

export async function minimumSoftStream(
  messages: Message[],
  signal?: AbortSignal
): Promise<ReadableStream> {
  console.log('start streaming');
  const response = await fetch(EnvVars.backendUrl + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: messages[messages.length - 1].content,
    }),
    signal,
  });

  console.log(response);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.body as ReadableStream;
}
