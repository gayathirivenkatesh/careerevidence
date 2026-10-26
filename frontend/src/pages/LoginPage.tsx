import {
  useState,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../auth/AuthContext';


export default function LoginPage() {
  const {
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
): Promise<void> {
  event.preventDefault();

  setError('');
  setSubmitting(true);

  try {
    await login({ email, password });
    navigate('/dashboard');
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Login failed',
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 border rounded-2xl p-8"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2">
            Continue building your
            career evidence.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 p-3 text-red-700">
            {error}
          </div>
        )}

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value,
            )
          }
          className="w-full rounded-lg border p-3"
        />

        <button
          disabled={submitting}
          className="w-full rounded-lg bg-black text-white p-3 disabled:opacity-50"
        >
          {submitting
            ? 'Signing in...'
            : 'Sign in'}
        </button>

        <p className="text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}