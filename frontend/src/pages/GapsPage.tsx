import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Compass } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { getRoleGaps } from '../api/alignment.api';
import type { GapResponse, SkillGap } from '../types/alignment';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function GapsPage() {
  const { user, token } = useAuth();

  const [result, setResult] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const targetRoleId = user?.targetRoleId ?? user?.targetRole?.id;

  useEffect(() => {
    async function load() {
      if (!token || !targetRoleId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getRoleGaps(token, targetRoleId);
        setResult(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load skill gaps.',
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, targetRoleId]);

  if (!targetRoleId) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-800">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Target Role Not Set
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          To perform a skill gap analysis, select your target role in Onboarding or explore roles in Role Discovery.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/role-discovery">
            <Button>Discover Roles</Button>
          </Link>
          <Link to="/onboarding">
            <Button variant="secondary">Go to Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-3 text-sm text-slate-600">Analyzing your skill gaps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Skill Gap Analysis Error</h2>
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
          <AlertCircle className="h-4 w-4" />
          <span>Skill Gap Intelligence</span>
        </div>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Target Role Skill Gaps
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Skills where your current knowledge, demonstrated ability, or verified evidence lags market demand.
            </p>
          </div>
          <Link to="/action-plan">
            <Button className="flex items-center gap-1.5">
              <span>View Action Plan</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {!result || result.gaps.length === 0 ? (
        <Card className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No current skill gaps</h2>
          <p className="mt-2 text-sm text-slate-600">
            All required skills for your target role currently meet ability and evidence standards.
          </p>
          <div className="mt-6">
            <Link to="/projects">
              <Button variant="secondary">Add More Project Evidence</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {result.gaps.map((gap) => (
            <GapCard key={gap.skillId} gap={gap} />
          ))}
        </div>
      )}
    </div>
  );
}

function GapCard({ gap }: { gap: SkillGap }) {
  return (
    <Card className="flex flex-col justify-between hover:border-slate-300 transition-shadow hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-base text-slate-900">
            {gap.skillName}
          </h2>
          <Badge>{formatCategory(gap.category)}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Market
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-900">
              {gap.marketDemandPercentage.toFixed(0)}%
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ability
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-900">
              {gap.currentAbilityScore.toFixed(0)}
              <span className="text-[10px] font-normal text-slate-400">/100</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Evidence
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-900">
              {gap.evidenceScore.toFixed(0)}
              <span className="text-[10px] font-normal text-slate-400">/100</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
          {gap.explanation}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/projects"
          className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
        >
          <span>Add Project Evidence</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function formatCategory(category: SkillGap['category']): string {
  switch (category) {
    case 'MISSING_SKILL':
      return 'Missing Skill';
    case 'WEAK_ABILITY':
      return 'Weak Ability';
    case 'MISSING_EVIDENCE':
      return 'Missing Evidence';
    default:
      return category;
  }
}
