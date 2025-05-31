// Job status enum
export type JobStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// Base scheduler job interface
export interface SchedulerJob {
  id: string;
  name: string;
  description: string;
  tableName: string;
  handler: string;
  schedule: string;
  isEnabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
}

// Job with status information
export interface SchedulerJobWithStatus extends SchedulerJob {
  logs: SchedulerJobLog[];
  lastLog?: SchedulerJobLog | null;
  scheduled: boolean;
}

// Job log interface
export interface SchedulerJobLog {
  id: string;
  jobId: string;
  status: JobStatus;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  records?: number | null;
  message?: string | null;
  error?: string | null;
  createdAt: string;
  job?: {
    name: string;
    description: string;
  };
}

// Job action result
export interface JobActionResult {
  success: boolean;
  count?: number;
  error?: string;
}

// Job configuration update
export interface JobConfigUpdate {
  schedule?: string;
  description?: string;
  isEnabled?: boolean;
}

// Job configuration update with required schedule for form
export interface JobConfigFormData extends JobConfigUpdate {
  schedule: string;
}

// Job configuration result
export interface JobConfigResult {
  success: boolean;
  job?: SchedulerJob;
  error?: string;
}

// Job status summary
export interface JobStatusSummary {
  totalJobs: number;
  activeJobs: number;
  disabledJobs: number;
  successJobs: number;
  failedJobs: number;
}

// Job handler type
export type JobHandler = {
  [key: string]: () => Promise<number>;
};
