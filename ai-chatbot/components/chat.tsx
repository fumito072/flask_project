'use client';

import type { Attachment, Message as AIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';

import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import EnvVars from '@/constants/EnvVars';
import { useAuth } from '@/contexts/AuthContext';

interface ChatProps {
  id: string;
  initialMessages: AIMessage[];
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  showVoting?: boolean;
}

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  showVoting = false,
}: ChatProps) {
  const { mutate } = useSWRConfig();
  const { user } = useAuth();

  const {
    messages,
    setMessages: originalSetMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    experimental_prepareRequestBody: ({ messages }) => {
      // e.g. only the text of the last message:
      return {
        userId: user?.id,
        chatId: id,
        messages: messages,
      };
    },
    experimental_throttle: 0,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    api: `${EnvVars.backendUrl}/api/chat`,
    streamProtocol: 'text',
    onFinish: () => {
      console.log('Current messages:', messages);
      mutate('/api/history');
    },
    onError: (error: Error) => {
      console.error('Chat error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      toast.error(`エラーが発生しました: ${error.message || 'Unknown error'}`);
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `${EnvVars.backendUrl}/api/vote?chatId=${id}`,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  const setMessages = (value: any) => {
    originalSetMessages(value as any);
  };

  const appendWithTypeAssertion = (message: any) => {
    append(message as any);
  };

  return (
    <>
      <div className='flex flex-col min-w-0 h-dvh bg-background'>
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          messages={messages as any}
          setMessages={setMessages as any}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className='flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl'>
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages as any}
              setMessages={setMessages as any}
              append={appendWithTypeAssertion as any}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={appendWithTypeAssertion as any}
        messages={messages as any}
        setMessages={setMessages as any}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
