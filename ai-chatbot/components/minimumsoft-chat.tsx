'use client';

import { useState, FormEvent, useRef } from 'react';
import { FaLink, FaBook } from 'react-icons/fa';
import EnvVars from '@/constants/EnvVars';

const ReferenceLink = ({ url }: { url: string }) => {
  const generateTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const decodedPath = decodeURIComponent(urlObj.pathname);

      switch (urlObj.hostname) {
        case 'kotobank.jp':
          return `コトバンク - ${
            decodedPath.split('/').pop()?.replace(/-/g, ' ') || '用語解説'
          }`;
        case 'wikipedia.org':
          return `Wikipedia - ${
            decodedPath.split('/').pop()?.replace(/_/g, ' ') || 'ページ'
          }`;
        case 'github.com':
          return `GitHub - ${decodedPath.split('/').slice(-2).join('/')}`;
        case 'developer.mozilla.org':
          return `MDN - ${
            decodedPath.split('/').pop()?.replace(/-/g, ' ') || 'Web Docs'
          }`;
        default:
          const pathEnd = decodedPath.split('/').pop() || '';
          return `${urlObj.hostname} - ${pathEnd.replace(/-|_/g, ' ')}`;
      }
    } catch {
      return '参考文献';
    }
  };

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors'
    >
      <FaLink className='w-4 h-4' />
      <span className='underline'>{generateTitle(url)}</span>
    </a>
  );
};

export function MinimumSoftChat() {
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    abortControllerRef.current = new AbortController();

    console.log('start submit');
    try {
      const response = await fetch(`${EnvVars.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
        credentials: 'same-origin',
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is null');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.choices && data.choices[0].delta.content) {
                setResponse((prev) => prev + data.choices[0].delta.content);
              }
            } catch (e) {
              console.error('Failed to parse JSON:', e);
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('リクエストがキャンセルされました');
      } else {
        console.error('Error:', error);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const extractReferences = (
    text: string
  ): { content: string; references: string[] } => {
    const parts = text.split('参照元：');
    const references = parts[1]
      ? parts[1]
          .split('\n')
          .filter((line) => line.trim().startsWith('-'))
          .map((line) => line.trim().substring(2))
      : [];

    return {
      content: parts[0],
      references: references,
    };
  };

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>AIチャット</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='w-full p-2 border rounded text-black'
          rows={4}
          placeholder='メッセージを入力してください...'
        />

        <div className='flex gap-2'>
          <button
            type='submit'
            disabled={loading}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            {loading ? '送信中...' : '送信'}
          </button>

          {loading && (
            <button
              type='button'
              onClick={handleCancel}
              className='bg-red-500 text-white px-4 py-2 rounded'
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      {response && (
        <div className='mt-4 p-4 bg-gray-100 rounded'>
          <h2 className='font-bold text-black'>回答:</h2>
          <div className='text-black whitespace-pre-wrap'>
            {extractReferences(response).content}
          </div>

          {extractReferences(response).references.length > 0 && (
            <div className='mt-4 border-t pt-4'>
              <h3 className='font-bold text-black flex items-center gap-2'>
                <FaBook className='w-4 h-4' />
                参照元一覧:
              </h3>
              <ul className='mt-2 space-y-2'>
                {extractReferences(response).references.map((ref, index) => (
                  <li key={index}>
                    <ReferenceLink url={ref} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
