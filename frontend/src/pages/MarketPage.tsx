import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, Users, Calendar, AlertTriangle, ArrowLeft } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { getMarketAnalytics } from '../api/market.api';
import type { RoleMarketAnalytics } from '../types/market';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function MarketPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const { token } = useAuth();

  const [market, setMarket] = useState<RoleMarketAnalytics | null>(null);
  const [freshnessDays, setFreshnessDays] = useState<number | null>(null);
  const [minimumSampleSize, setMinimumSampleSize] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        setError('Authentication is required.');
        return;
      }

      if (!roleId) {
        setLoading(false);
        setError('Role ID is required.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getMarketAnalytics(token);

        const selectedRole = response.roles.find(
          (role) => role.roleId === roleId,
        );

        if (!selectedRole) {
          setError('Market data for this role was not found in current collected dataset.');
          return;
        }

        setMarket(selectedRole);
        setFreshnessDays(response.freshnessDays);
        setMinimumSampleSize(response.minimumSampleSize);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load market data.',
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, roleId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-3 text-sm text-slate-600">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Market Intelligence Error</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/role-discovery">
            <Button variant="secondary">Back to Roles</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <Card className="py-12 text-center">
        <p className="text-slate-600">No market data available for this role.</p>
        <Link to="/role-discovery" className="mt-4 inline-block">
          <Button variant="secondary">Explore other roles</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/role-discovery"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Role Discovery</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {market.roleName}
            </h1>
            <Badge>{market.sufficientSampleSize ? 'Sufficient Sample' : 'Low Sample'}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Current market demand derived exclusively from collected entry-level postings in India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/gaps">
            <Button variant="secondary">View Skill Gaps</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="h-4 w-4" />
            <p className="text-xs font-medium uppercase tracking-wider">
              Market Sample
            </p>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {market.sampleSize}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            eligible active jobs
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <p className="text-xs font-medium uppercase tracking-wider">
              Minimum Required
            </p>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {minimumSampleSize ?? 15}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            jobs required for statistical confidence
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-4 w-4" />
            <p className="text-xs font-medium uppercase tracking-wider">
              Data Freshness
            </p>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {freshnessDays ?? 30}
            <span className="text-sm font-normal text-slate-500"> days</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            active freshness window
          </p>
        </Card>
      </div>

      {!market.sufficientSampleSize && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice:</span> The current sample size ({market.sampleSize}) is below the minimum threshold ({minimumSampleSize}). Skill demand percentages will populate as additional live job data is collected.
          </div>
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Required Skills & Market Demand
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Frequency and occurrence extracted from classified job postings for this primary role.
          </p>
        </div>

        {market.skills.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No skill demand records identified for this role sample yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-semibold">Skill</th>
                  <th className="py-3 px-4 font-semibold">Postings Mentioning</th>
                  <th className="py-3 px-4 font-semibold">Demand %</th>
                  <th className="py-3 px-4 font-semibold">Market Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {market.skills.map((skill) => (
                  <tr key={skill.skillId} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">
                        {skill.skillName}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {skill.skillCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {skill.jobCount} jobs
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {skill.demandPercentage.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, skill.demandPercentage))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
