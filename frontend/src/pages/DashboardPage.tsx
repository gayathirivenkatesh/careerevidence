import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  ListTodo,
  FolderGit2,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import Card from '../components/ui/Card';

export default function DashboardPage() {
  const { user } = useAuth();

  const targetRoleId = user?.targetRoleId ?? user?.targetRole?.id;
  const marketPath = targetRoleId
    ? `/market/${targetRoleId}`
    : '/role-discovery';

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Career Intelligence Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Welcome back, {user?.name || 'Student'}
        </h1>

        <p className="mt-2 max-w-2xl text-base text-slate-600">
          Turn current entry-level software market requirements into demonstrable,
          verified evidence you can build.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          to={marketPath}
          icon={TrendingUp}
          title="Market Intelligence"
          description={
            user?.targetRoleId
              ? 'View real market demand and required skills for your target role.'
              : 'Choose or explore a target role to view live market analytics.'
          }
          actionText={user?.targetRoleId ? 'View Role Demand' : 'Explore Roles'}
        />

        <DashboardCard
          to="/gaps"
          icon={AlertCircle}
          title="Skill Gaps"
          description="Understand missing skills and where your ability or evidence needs improvement."
          actionText="Analyze Gaps"
        />

        <DashboardCard
          to="/action-plan"
          icon={ListTodo}
          title="Action Plan"
          description="High-priority, actionable next steps aligned with your workload and market demand."
          actionText="View Actions"
        />

        <DashboardCard
          to="/projects"
          icon={FolderGit2}
          title="Projects & Evidence"
          description="Record verifiable projects, repository links, and skill evidence levels."
          actionText="Manage Evidence"
        />

        <DashboardCard
          to="/academic"
          icon={Calendar}
          title="Academic Constraints"
          description="Track exams and deadlines so career action scopes adapt to your actual workload."
          actionText="Update Schedule"
        />

        <DashboardCard
          to="/role-discovery"
          icon={Compass}
          title="Role Discovery"
          description="Compare your current profile against all five supported junior software roles."
          actionText="Discover Roles"
        />
      </div>
    </div>
  );
}

interface DashboardCardProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText: string;
}

function DashboardCard({
  to,
  icon: Icon,
  title,
  description,
  actionText,
}: DashboardCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-md">
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-slate-700"
        >
          <span>{actionText}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}