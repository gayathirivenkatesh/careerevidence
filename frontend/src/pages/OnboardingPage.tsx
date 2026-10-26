import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  getRoles,
} from '../api/roles.api';

import {
  updateProfile,
} from '../api/profile.api';

import {
  useAuth,
} from '../auth/AuthContext';

import type {
  Role,
} from '../types/role';

export default function OnboardingPage() {
  const {
    token,
    refreshUser,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    selectedRole,
    setSelectedRole,
  ] = useState('');

  const [
    careerHours,
    setCareerHours,
  ] = useState(14);

  const [
    mode,
    setMode,
  ] = useState<
    'target' | 'discover' | null
  >(null);

useEffect(() => {
  getRoles()
    .then((roles) => {
      setRoles(roles);
    })
    .catch(() => {
      setRoles([]);
    });
}, []);

  async function continueFlow() {
    if (!token || !mode) {
      return;
    }

    if (
      mode === 'target' &&
      !selectedRole
    ) {
      return;
    }

    await updateProfile(
      token,
      {
        ...(mode === 'target'
          ? {
              targetRoleId:
                selectedRole,
            }
          : {}),
        careerHoursPerWeek:
          careerHours,
      },
    );

    await refreshUser();

    if (mode === 'discover') {
      navigate(
        '/role-discovery',
      );
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="max-w-3xl">
        <p className="text-sm text-gray-500">
          Step 1
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Let's understand your direction
        </h1>

        <p className="mt-3 text-gray-600">
          CareerEvidence can work with
          a role you already want or
          help you explore the five
          supported entry-level roles.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-10">
        <button
          onClick={() =>
            setMode('target')
          }
          className={`text-left border rounded-2xl p-6 ${
            mode === 'target'
              ? 'border-black'
              : ''
          }`}
        >
          <h2 className="text-xl font-semibold">
            I know my target role
          </h2>

          <p className="mt-2 text-gray-600">
            Select the role you are
            currently targeting.
          </p>
        </button>

        <button
          onClick={() =>
            setMode('discover')
          }
          className={`text-left border rounded-2xl p-6 ${
            mode === 'discover'
              ? 'border-black'
              : ''
          }`}
        >
          <h2 className="text-xl font-semibold">
            Help me discover
          </h2>

          <p className="mt-2 text-gray-600">
            Compare your current
            profile against the
            supported roles.
          </p>
        </button>
      </div>

      {mode === 'target' && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Choose your role
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() =>
                  setSelectedRole(
                    role.id,
                  )
                }
                className={`text-left border rounded-xl p-5 ${
                  selectedRole ===
                  role.id
                    ? 'border-black'
                    : ''
                }`}
              >
                <h3 className="font-semibold">
                  {role.name}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  {role.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {mode && (
        <section className="mt-8">
          <label className="font-medium">
            Career hours available
            per week
          </label>

          <input
            type="number"
            min={1}
            max={168}
            value={careerHours}
            onChange={(e) =>
              setCareerHours(
                Number(
                  e.target.value,
                ),
              )
            }
            className="block mt-2 border rounded-lg p-3"
          />

          <button
            onClick={continueFlow}
            className="mt-6 rounded-lg bg-black text-white px-6 py-3"
          >
            Continue
          </button>
        </section>
      )}
    </main>
  );
}