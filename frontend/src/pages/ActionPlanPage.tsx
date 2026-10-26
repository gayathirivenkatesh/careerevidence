import {
  useEffect,
  useState,
} from 'react';
import { ListTodo, Sparkles, CheckCircle, XCircle, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

import {
  completeRecommendation,
  dismissRecommendation,
  generateTargetRecommendations,
  getRecommendations,
} from '../api/recommendations.api';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import type { Recommendation } from '../types/recommendation';

export default function ActionPlanPage() {
  const { token, user } = useAuth();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getRecommendations(token);
      setRecommendations(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load action plan recommendations.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function generate() {
    if (!token) return;

    try {
      setGenerating(true);
      setError('');
      await generateTargetRecommendations(token);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to recalculate recommendations.',
      );
    } finally {
      setGenerating(false);
    }
  }

  async function complete(id: string) {
    if (!token) return;

    try {
      setActionInProgress(id);
      await completeRecommendation(token, id);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to mark recommendation complete.',
      );
    } finally {
      setActionInProgress(null);
    }
  }

  async function dismiss(id: string) {
    if (!token) return;

    try {
      setActionInProgress(id);
      await dismissRecommendation(token, id);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to dismiss recommendation.',
      );
    } finally {
      setActionInProgress(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <ListTodo className="h-4 w-4" />
            <span>Action Plan</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Prioritized Recommendations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Actionable steps calibrated against current market demand, your skill gaps, and academic deadlines.
          </p>
        </div>

        <div>
          <Button
            onClick={() => void generate()}
            disabled={generating || loading}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{generating ? 'Recalculating...' : 'Recalculate Plan'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-3 text-sm text-slate-600">Loading recommendations...</p>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ListTodo className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No active recommendations</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-slate-600">
            {user?.targetRoleId
              ? 'Click "Recalculate Plan" to generate targeted next actions based on your current profile.'
              : 'Please set your target role first to generate targeted recommendations.'}
          </p>
          <div className="mt-6">
            <Button onClick={() => void generate()} disabled={generating}>
              Generate Plan Now
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {recommendation.what}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Estimated effort: {recommendation.effortHours} hours</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge>Priority {recommendation.priorityScore.toFixed(0)}</Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Why This Matters
                  </h3>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {recommendation.why}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    How To Execute
                  </h3>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {recommendation.how}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="flex items-start gap-2 rounded-lg border border-slate-100 p-3">
                  <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Verification Proof:</span>{' '}
                    <span className="text-slate-600">{recommendation.proof}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-slate-100 p-3">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Target Timing:</span>{' '}
                    <span className="text-slate-600">{recommendation.when}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => void complete(recommendation.id)}
                  disabled={actionInProgress === recommendation.id}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {actionInProgress === recommendation.id ? 'Updating...' : 'Mark Complete'}
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => void dismiss(recommendation.id)}
                  disabled={actionInProgress === recommendation.id}
                  className="flex items-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Dismiss</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}