import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Trash2,
  AlertCircle,
  Code2,
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

import {
  createProject,
  deleteProject,
  getProjects,
} from '../api/projects.api';

import type {
  CreateProjectRequest,
  Project,
} from '../types/project';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const emptyForm: CreateProjectRequest = {
  title: '',
  description: '',
  features: '',
  githubUrl: '',
  liveUrl: '',
  implementationNotes: '',
};

export default function ProjectsPage() {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<CreateProjectRequest>(emptyForm);
  const [showAddForm, setShowAddForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function loadProjects(): Promise<void> {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await getProjects(token);
      setProjects(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load projects.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, [token]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!token) {
      setError('You must be logged in.');
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.features.trim()
    ) {
      setError(
        'Project title, description, and features are required.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createProject(token, {
        title: form.title.trim(),
        description: form.description.trim(),
        features: form.features.trim(),
        githubUrl: form.githubUrl?.trim() || undefined,
        liveUrl: form.liveUrl?.trim() || undefined,
        implementationNotes: form.implementationNotes?.trim() || undefined,
      });

      setForm(emptyForm);
      setShowAddForm(false);
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create project.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(projectId: string): Promise<void> {
    if (!token) return;

    const confirmed = window.confirm(
      'Delete this project evidence record?',
    );

    if (!confirmed) return;

    try {
      setDeletingId(projectId);
      await deleteProject(token, projectId);
      setProjects((current) =>
        current.filter((project) => project.id !== projectId),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete project.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FolderGit2 className="h-4 w-4" />
            <span>Evidence Portfolio</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Projects & Evidence
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Demonstrate verified ability with verifiable code repositories, live deployments, and skill mappings.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? 'Close Form' : 'Add New Project'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {showAddForm && (
        <Card className="border-slate-300 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Add Evidence Project
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Provide project details and evidence links to back your demonstrated skills.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Project Title *
              </label>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                placeholder="e.g. Distributed Task Queue or Full-Stack E-Commerce"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Project Problem / Description *
              </label>
              <textarea
                required
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                placeholder="What real problem does this project solve? What architecture was used?"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Key Features *
              </label>
              <textarea
                required
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                placeholder="List major features and technical achievements."
                value={form.features}
                onChange={(event) =>
                  setForm({ ...form, features: event.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="https://github.com/username/project"
                  value={form.githubUrl}
                  onChange={(event) =>
                    setForm({ ...form, githubUrl: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Live Deployment URL
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="https://myproject.demo.app"
                  value={form.liveUrl}
                  onChange={(event) =>
                    setForm({ ...form, liveUrl: event.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Implementation Notes
              </label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                placeholder="Testing methodology, deployment setup, or technical challenges overcome."
                value={form.implementationNotes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    implementationNotes: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving Project...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Recorded Projects ({projects.length})
        </h2>

        {loading ? (
          <div className="flex min-h-[25vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              <p className="mt-3 text-sm text-slate-600">Loading project evidence...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No evidence projects added yet
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              Add your software projects to provide verified evidence for skill alignment and action planning.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowAddForm(true)}>
                Add First Project
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5">
            {projects.map((project) => (
              <Card key={project.id} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      disabled={deletingId === project.id}
                      onClick={() => void handleDelete(project.id)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{deletingId === project.id ? 'Deleting...' : 'Delete'}</span>
                    </Button>
                  </div>
                </div>

                {project.features && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Features:</span>{' '}
                    {project.features}
                  </div>
                )}

                {project.implementationNotes && (
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Notes:</span>{' '}
                    {project.implementationNotes}
                  </div>
                )}

                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.skills.map((projectSkill) => (
                      <Badge key={projectSkill.id}>
                        {projectSkill.skill?.name ?? projectSkill.skillId} · {projectSkill.evidenceLevel}
                      </Badge>
                    ))}
                  </div>
                )}

                {(project.githubUrl || project.liveUrl) && (
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-black transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>GitHub Repository</span>
                      </a>
                    )}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-black transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Live Deployment</span>
                      </a>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}