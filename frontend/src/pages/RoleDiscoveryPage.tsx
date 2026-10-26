import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, ShieldAlert } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { getRoleDiscovery } from '../api/alignment.api';
import type { RoleAlignment } from '../types/alignment';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function RoleDiscoveryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [roles, setRoles] = useState<RoleAlignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        setError('Authentication is required.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getRoleDiscovery(token);
        setRoles(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load roles.',
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-3 text-sm text-slate-600">Analyzing role discovery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Failed to load roles</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <div className="mt-6">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Compass className="h-4 w-4" />
          <span>Role Discovery</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Supported Junior Software Roles
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Compare your current skills, ability, and evidence against the five supported roles.
        </p>
      </header>

      {roles.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-slate-600">No role analysis available yet.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {roles.map((role) => (
            <Card
              key={role.roleId}
              className="flex flex-col justify-between hover:border-slate-300 transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {role.roleName}
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {role.roleCode}
                    </p>
                  </div>
                  <Badge>{role.alignment}</Badge>
                </div>

                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Alignment Score
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {role.alignmentScore.toFixed(1)}
                      <span className="text-xs font-normal text-slate-500"> / 100</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {role.explanation}
                  </p>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Core Skills Covered</span>
                    <span className="font-semibold text-slate-800">
                      {role.coreSkillsCovered} / {role.coreSkills}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.skills.slice(0, 8).map((skill) => (
                      <span
                        key={skill.skillId}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {skill.skillName}
                      </span>
                    ))}
                    {role.skills.length > 8 && (
                      <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
                        +{role.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  onClick={() => navigate(`/market/${role.roleId}`)}
                  className="flex items-center gap-1.5 w-full justify-center sm:w-auto"
                >
                  <span>View Role Market Intelligence</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}