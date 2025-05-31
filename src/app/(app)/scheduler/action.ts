'use server';

import { SchedulerService } from '@/lib/services/scheduler.service';
import { revalidatePath } from 'next/cache';
import {
  JobActionResult,
  JobConfigResult,
  JobConfigUpdate,
  JobStatusSummary,
  SchedulerJobWithStatus,
  SchedulerJobLog,
} from '@/lib/types/scheduler';

/**
 * Run a specific job manually
 */
export async function runJob(jobName: string): Promise<JobActionResult> {
  try {
    const count = await SchedulerService.runJob(jobName);
    revalidatePath('/scheduler');
    return { success: true, count };
  } catch (error) {
    console.error(`Error running job ${jobName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update job configuration
 */
export async function updateJobConfig(
  jobId: string,
  updates: JobConfigUpdate,
): Promise<JobConfigResult> {
  try {
    const job = await SchedulerService.updateJobConfig(jobId, updates);
    revalidatePath('/scheduler');
    return { success: true, job };
  } catch (error) {
    console.error('Error updating job config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get scheduler statistics
 */
export async function getSchedulerStats(): Promise<JobStatusSummary> {
  try {
    return await SchedulerService.getSchedulerStats();
  } catch (error) {
    console.error('Error getting scheduler stats:', error);
    return {
      totalJobs: 0,
      activeJobs: 0,
      disabledJobs: 0,
      successJobs: 0,
      failedJobs: 0,
    };
  }
}

/**
 * Get all scheduler jobs with their status
 */
export async function getSchedulerJobsWithStatus(): Promise<{
  success: boolean;
  data?: SchedulerJobWithStatus[];
  error?: string;
}> {
  try {
    const jobs = await SchedulerService.getAllJobsWithStatus();
    return { success: true, data: jobs };
  } catch (error) {
    console.error('Error getting scheduler jobs:', error);
    return { success: false, error: 'Failed to get scheduler jobs' };
  }
}

/**
 * Get scheduler logs with pagination
 */
export async function getSchedulerLogs(params: {
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: SchedulerJobLog[];
  error?: string;
}> {
  try {
    const logs = await SchedulerService.getLogs(params);
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error getting scheduler logs:', error);
    return { success: false, error: 'Failed to get scheduler logs' };
  }
}
