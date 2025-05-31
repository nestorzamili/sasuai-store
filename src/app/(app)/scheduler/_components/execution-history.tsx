'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SchedulerJobLog, JobStatus } from '@/lib/types/scheduler';

interface ExecutionHistoryProps {
  logs: SchedulerJobLog[];
}

export function ExecutionHistory({ logs }: ExecutionHistoryProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const formatDuration = (durationMs: number | null | undefined) => {
    if (!durationMs || durationMs === null || durationMs === undefined) {
      return '-';
    }

    // For durations less than 1 second, just show milliseconds
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }

    // Calculate human-readable format
    const seconds = Math.floor(durationMs / 1000);
    const remainingMs = durationMs % 1000;

    if (seconds < 60) {
      // Show seconds with decimal if there are remaining milliseconds
      if (remainingMs > 0) {
        const decimal = Math.floor(remainingMs / 100);
        return `${seconds}.${decimal}s (${durationMs}ms)`;
      }
      return `${seconds}s (${durationMs}ms)`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      if (remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s (${durationMs}ms)`;
      }
      return `${minutes}m (${durationMs}ms)`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m (${durationMs}ms)`;
    }
    return `${hours}h (${durationMs}ms)`;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
        <CardDescription>
          Recent job execution logs across all jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No execution history available
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">
                      {log.job?.description || log.jobId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="text-sm">{log.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(log.startTime)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(log.endTime)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">
                      {formatDuration(log.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.records !== null && log.records !== undefined
                        ? log.records
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-md truncate">
                      {log.message || log.error || '-'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
