'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log(credentialResponse);
      setIsLoading(true);
      setError(null);
      await login(credentialResponse.credential);
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight'>
            AIチャットボットにログイン
          </h2>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        <div className='mt-8 flex flex-col items-center space-y-6'>
          {isLoading ? (
            <div className='text-center'>ログイン中...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError(
                  'Googleログインに失敗しました。もう一度お試しください。'
                );
              }}
              useOneTap
              theme='filled_blue'
              text='continue_with'
              locale='ja'
            />
          )}
        </div>
      </div>
    </div>
  );
}
