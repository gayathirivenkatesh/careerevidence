import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getMe,
  login as loginApi,
  register as registerApi,
} from '../api/auth.api';

import type {
  LoginInput,
  RegisterInput,
  User,
} from '../types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login(
    input: LoginInput,
  ): Promise<void>;
  register(
    input: RegisterInput,
  ): Promise<void>;
  logout(): void;
  refreshUser(): Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

const TOKEN_KEY =
  'careerevidence_access_token';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          TOKEN_KEY,
        ),
    );

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getMe(token)
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem(
          TOKEN_KEY,
        );
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  async function login(
    input: LoginInput,
  ) {
    const response =
      await loginApi(input);

    localStorage.setItem(
      TOKEN_KEY,
      response.data.token,
    );

    setToken(
      response.data.token,
    );

    setUser(
      response.data.user,
    );
  }

  async function register(
    input: RegisterInput,
  ) {
    const response =
      await registerApi(input);

    localStorage.setItem(
      TOKEN_KEY,
      response.data.token,
    );

    setToken(
      response.data.token,
    );

    setUser(
      response.data.user,
    );
  }

  function logout() {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) {
      return;
    }

    const response =
      await getMe(token);

    setUser(response.data);
  }

  const value =
    useMemo(
      () => ({
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }),
      [
        user,
        token,
        loading,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}