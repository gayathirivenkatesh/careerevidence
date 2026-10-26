import { useEffect, useState } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import {
  getCollectionRuns,
  runCollection,
  type CollectionRun,
} from '../api/admin.api';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function AdminCollectionPage() {
  const [runs, setRuns] = useState<CollectionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function loadRuns() {
    try {
      setLoading(true);
      setError('');
      const result = await getCollectionRuns();
      setRuns(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load collection runs.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRuns();
  }, []);

  async function handleRunCollection() {
    try {
      setRunning(true);
      setError('');

      await runCollection();
      await loadRuns();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Collection failed.',
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Database className="h-4 w-4" />
            <span>Admin Data Pipeline</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Job Collection Runs
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Inspect external provider job collection ingestion history and triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => void loadRuns()}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => void handleRunCollection()}
            disabled={running}
            className="flex items-center gap-1.5"
          >
            <Database className="h-4 w-4" />
            <span>{running ? 'Running Collection...' : 'Trigger Collection Now'}</span>
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
            <p className="mt-3 text-sm text-slate-600">Loading collection runs...</p>
          </div>
        </div>
      ) : runs.length === 0 ? (
        <Card className="py-12 text-center text-slate-600 text-sm">
          No collection runs recorded yet. Click "Trigger Collection Now" to begin first ingestion.
        </Card>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <Card key={run.id} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{run.provider.toUpperCase()}</span>
                  <Badge>{run.status}</Badge>
                  {run.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Started: {new Date(run.startedAt).toLocaleString()}
                  {run.finishedAt && ` · Finished: ${new Date(run.finishedAt).toLocaleString()}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                <Metric label="Queries" value={run.queriesExecuted} />
                <Metric label="Received" value={run.jobsReceived} />
                <Metric label="New" value={run.jobsNew} />
                <Metric label="Updated" value={run.jobsUpdated} />
                <Metric label="Accepted" value={run.jobsAccepted} />
                <Metric label="Rejected" value={run.jobsRejected} />
                <Metric label="Errors" value={run.errors} />
              </div>

              {run.errorSummary && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  <span className="font-semibold">Error Summary:</span> {run.errorSummary}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}