import { type Message } from 'ai';
import { minimumSoftModels, type MinimumSoftLanguageModel, minimumSoftStream } from './minimumsoft';

export type LanguageModel = MinimumSoftLanguageModel;

export const languageModels = [...minimumSoftModels];

export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';

export const myProvider = {
  languageModel: (modelId: string): LanguageModel => {
    const model = languageModels.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    return model;
  },
  createLanguageStream: async (
    model: LanguageModel,
    messages: Message[],
    signal?: AbortSignal,
  ): Promise<Response> => {
    const stream = await minimumSoftStream(messages, signal);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    });
  },
};

export const minimumSoftProvider = {
  languageModel: async (messages: Message[], signal?: AbortSignal): Promise<Response> => {
    const stream = await minimumSoftStream(messages, signal);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    });
  },
}; 