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

export default function RegisterPage() {
  const {
    register,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    name,
    setName,
  ] = useState('');

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
      await register({
        name,
        email,
        password,
      });

      navigate('/onboarding');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed',
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
        <h1 className="text-3xl font-bold">
          Create your account
        </h1>

        {error && (
          <div className="rounded-lg border border-red-300 p-3 text-red-700">
            {error}
          </div>
        )}

        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />

        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />

        <input
          required
          minLength={8}
          type="password"
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
          className="w-full rounded-lg bg-black text-white p-3"
        >
          {submitting
            ? 'Creating...'
            : 'Create account'}
        </button>

        <p className="text-sm">
          Already registered?{' '}
          <Link
            to="/login"
            className="underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}