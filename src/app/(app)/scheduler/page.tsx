import { SchedulerDashboard } from './_components/scheduler-dashboard';
import { getSchedulerJobsWithStatus, getSchedulerLogs } from './action';
import { SchedulerJobLog } from '@/lib/types/scheduler';

export default async function SchedulerPage() {
  const [jobsResult, logsResult] = await Promise.all([
    getSchedulerJobsWithStatus(),
    getSchedulerLogs({ limit: 100 }), // Increase limit for better history view
  ]);

  if (!jobsResult.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium">Error loading scheduler jobs</h3>
          <p className="text-muted-foreground">{jobsResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduler</h1>
        <p className="text-muted-foreground">
          Manage and monitor scheduled jobs
        </p>
      </div>

      <SchedulerDashboard
        initialJobs={jobsResult.data || []}
        initialLogs={
          (logsResult.success ? logsResult.data || [] : []) as SchedulerJobLog[]
        }
      />
    </div>
  );
}
