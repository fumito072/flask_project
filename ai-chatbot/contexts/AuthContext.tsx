'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

import EnvVars from '@/constants/EnvVars';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ユーザー情報の初期化
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log(token);
        if (token) {
          // APIを呼び出してトークンの有効性を確認
          const response = await fetch(
            `${EnvVars.backendUrl}/api/auth/validate-token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Origin': '*',
              },
            }
          );

          console.log(response);

          if (response.ok) {
            const userData = await response.json();
            console.log(userData);
            setUser(userData);
            router.push('/');
          } else {
            // トークンが無効な場合はログアウト
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('認証エラー:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ログイン処理
  const login = async (token: string) => {
    try {
      setIsLoading(true);

      // APIにトークンを送信して認証
      const response = await fetch(`${EnvVars.backendUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('認証に失敗しました');
      }

      const data = await response.json();

      // トークンを保存
      localStorage.setItem('auth_token', data.token);

      // ユーザー情報を設定
      setUser(data.user);

      // チャットページにリダイレクト
      router.push('/');
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
