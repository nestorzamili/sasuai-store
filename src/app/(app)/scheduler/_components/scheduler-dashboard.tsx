'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlayIcon,
  Square,
  RefreshCwIcon,
  SettingsIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { runJob, getSchedulerStats } from '../action';
import { JobConfigDialog } from './job-config-dialog';
import { ExecutionHistory } from './execution-history';
import {
  SchedulerJobWithStatus,
  JobStatus,
  JobStatusSummary,
  SchedulerJobLog,
} from '@/lib/types/scheduler';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SchedulerDashboardProps {
  initialJobs: SchedulerJobWithStatus[];
  initialLogs?: SchedulerJobLog[];
}

export function SchedulerDashboard({
  initialJobs,
  initialLogs = [],
}: SchedulerDashboardProps) {
  const [jobs] = useState<SchedulerJobWithStatus[]>(initialJobs);
  const [logs] = useState<SchedulerJobLog[]>(initialLogs);
  const [isPending, startTransition] = useTransition();
  const [selectedJob, setSelectedJob] = useState<SchedulerJobWithStatus | null>(
    null,
  );
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [summary, setSummary] = useState<JobStatusSummary>({
    totalJobs: 0,
    activeJobs: 0,
    disabledJobs: 0,
    successJobs: 0,
    failedJobs: 0,
  });

  // Load statistics on component mount
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getSchedulerStats();
      setSummary(stats);
    };
    loadStats();
  }, []);

  const handleRunJob = (jobName: string) => {
    startTransition(async () => {
      const result = await runJob(jobName);

      if (result.success) {
        toast({
          title: 'Job completed successfully',
          description: `Updated ${result.count} records.`,
        });
        // Refresh job data
        window.location.reload();
      } else {
        toast({
          title: 'Failed to run job',
          description: result.error || 'Failed to run job',
          variant: 'destructive',
        });
      }
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'RUNNING':
        return <RefreshCwIcon className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const openConfigDialog = (job: SchedulerJobWithStatus) => {
    setSelectedJob(job);
    setConfigDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Scheduled Jobs
            </CardTitle>
            <PlayIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.activeJobs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Successful Jobs
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {summary.successJobs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.failedJobs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled Jobs</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {summary.disabledJobs}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Jobs</CardTitle>
          <CardDescription>Manage and monitor scheduled jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Last Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  className={!job.isEnabled ? 'opacity-60' : ''}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{job.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Table: {job.tableName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {job.schedule}
                    </code>
                  </TableCell>
                  <TableCell>
                    {job.lastLog?.status === 'RUNNING' ? (
                      <Badge variant="secondary" className="animate-pulse">
                        Executing
                      </Badge>
                    ) : !job.isEnabled ? (
                      <Badge variant="destructive">Disabled</Badge>
                    ) : job.scheduled ? (
                      <Badge variant="default">Scheduled</Badge>
                    ) : (
                      <Badge variant="outline">Not Scheduled</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(job.lastRun)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(job.nextRun)}</div>
                  </TableCell>
                  <TableCell>
                    {job.lastLog && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.lastLog.status)}
                        <div className="text-sm">
                          {job.lastLog.status}
                          {job.lastLog.records !== null &&
                            job.lastLog.records !== undefined &&
                            ` (${job.lastLog.records})`}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunJob(job.name)}
                        disabled={
                          isPending || job.lastLog?.status === 'RUNNING'
                        }
                        title="Execute job immediately"
                      >
                        <RefreshCwIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfigDialog(job)}
                        title="Configure job"
                      >
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Execution History */}
      <ExecutionHistory logs={logs} />

      {/* Config Dialog Only */}
      <JobConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        job={selectedJob}
        onSuccess={() => {
          setConfigDialogOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
