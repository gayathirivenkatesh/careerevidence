import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import { Calendar, Trash2, Plus, AlertCircle } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

import {
  createAcademicEvent,
  deleteAcademicEvent,
  getAcademicEvents,
} from '../api/academic.api';

import type {
  AcademicEvent,
  AcademicEventType,
  AcademicWorkload,
} from '../types/academic';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function AcademicPage() {
  const { token } = useAuth();

  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AcademicEventType>('EXAM');
  const [workload, setWorkload] = useState<AcademicWorkload>('MEDIUM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (): Promise<void> => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getAcademicEvents(token);
      setEvents(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load academic events.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!token) return;

    try {
      setSubmitting(true);
      setError('');

      await createAcademicEvent(token, {
        title: title.trim(),
        description: '',
        type,
        workload,
        startDate,
        endDate,
      });

      setTitle('');
      setStartDate('');
      setEndDate('');

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create academic event.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string): Promise<void> {
    if (!token) return;

    try {
      await deleteAcademicEvent(token, id);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete academic event.',
      );
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Calendar className="h-4 w-4" />
          <span>Workload Intelligence</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Academic Constraints
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Register exams, project reviews, and academic deadlines so action plans adapt to your realistic workload.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Academic Event</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Specify dates and workload intensity to calibrate weekly career hours.
          </p>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Event Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Examinations or Semester Project Submission"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as AcademicEventType)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-slate-900 focus:outline-none"
              >
                <option value="EXAM">Exam</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="PROJECT_REVIEW">Project Review</option>
                <option value="INTERNAL_ASSESSMENT">Internal Assessment</option>
                <option value="DEADLINE">Deadline</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Workload Impact
              </label>
              <select
                value={workload}
                onChange={(e) =>
                  setWorkload(e.target.value as AcademicWorkload)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-slate-900 focus:outline-none"
              >
                <option value="LOW">Low Workload</option>
                <option value="MEDIUM">Medium Workload</option>
                <option value="HIGH">High Workload</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Start Date
              </label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                End Date
              </label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving Event...' : 'Add Academic Event'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Scheduled Academic Events ({events.length})
        </h2>

        {loading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              <p className="mt-2 text-xs text-slate-500">Loading academic events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <Card className="py-8 text-center text-slate-500 text-sm">
            No academic events registered. Action plans will use standard weekly career hours.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((ev) => (
              <Card key={ev.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{ev.title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge>{ev.type}</Badge>
                        <Badge>{ev.workload} workload</Badge>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void remove(ev.id)}
                      title="Delete event"
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono">
                  {ev.startDate} to {ev.endDate}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}