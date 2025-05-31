import * as cron from 'node-cron';
import prisma from '@/lib/prisma';
import {
  SchedulerJob,
  SchedulerJobWithStatus,
  JobHandler,
  JobConfigUpdate,
  SchedulerJobLog,
} from '@/lib/types/scheduler';

export class SchedulerService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();
  private static isInitialized = false;

  // Job handlers registry
  private static handlers: JobHandler = {
    'update-expired-rewards': SchedulerService.updateExpiredRewards,
    'update-expired-discounts': SchedulerService.updateExpiredDiscounts,
  };

  /**
   * Initialize scheduler from database configuration
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      await this.ensureDefaultJobs();

      const jobConfigs = await prisma.schedulerJob.findMany({
        where: { isEnabled: true },
      });

      for (const config of jobConfigs) {
        const schedulerJob: SchedulerJob = {
          id: config.id,
          name: config.name,
          description: config.description,
          tableName: config.tableName,
          handler: config.handler,
          schedule: config.schedule,
          isEnabled: config.isEnabled,
          lastRun: config.lastRun?.toISOString() || null,
          nextRun: config.nextRun?.toISOString() || null,
          createdAt: config.createdAt.toISOString(),
          updatedAt: config.updatedAt.toISOString(),
        };

        await this.scheduleJobFromConfig(schedulerJob);
      }

      this.isInitialized = true;
      console.log(
        `Scheduler service initialized with ${jobConfigs.length} jobs`,
      );
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }

  /**
   * Ensure default jobs exist in database
   */
  private static async ensureDefaultJobs() {
    const defaultJobs = [
      {
        name: 'update-expired-rewards',
        description: 'Update expired rewards to inactive',
        tableName: 'rewards',
        handler: 'update-expired-rewards',
        schedule: '0 1 * * *', // Daily at 1 AM
      },
      {
        name: 'update-expired-discounts',
        description: 'Update expired discounts to inactive',
        tableName: 'discounts',
        handler: 'update-expired-discounts',
        schedule: '0 2 * * *', // Daily at 2 AM
      },
    ];

    for (const job of defaultJobs) {
      await prisma.schedulerJob.upsert({
        where: { name: job.name },
        update: {}, // Don't update existing jobs
        create: job,
      });
    }
  }

  /**
   * Schedule a job from database configuration
   */
  private static async scheduleJobFromConfig(config: SchedulerJob) {
    const handler = this.handlers[config.handler];
    if (!handler) {
      console.error(`Handler not found: ${config.handler}`);
      return;
    }

    try {
      // Validate cron expression
      if (!cron.validate(config.schedule)) {
        console.error(
          `Invalid cron expression for job ${config.name}: ${config.schedule}`,
        );
        return;
      }

      const task = cron.schedule(
        config.schedule,
        async () => {
          await this.executeJobWithLogging(config.id, config.name, handler);
        },
        {
          timezone: 'Asia/Jakarta',
        },
      );

      task.start();
      this.jobs.set(config.name, task);

      // Update next run time with proper calculation
      await this.updateNextRunTime(config.id);

      console.log(`Job scheduled: ${config.name} (${config.schedule})`);
    } catch (error) {
      console.error(`Failed to schedule job: ${config.name}`, error);
    }
  }

  /**
   * Execute job with comprehensive logging
   */
  private static async executeJobWithLogging(
    jobId: string,
    jobName: string,
    handler: () => Promise<number>,
  ) {
    const startTime = new Date();
    let logId: string | undefined;

    try {
      // Create initial log entry
      const log = await prisma.schedulerJobLog.create({
        data: {
          jobId,
          status: 'RUNNING',
          startTime,
          endTime: startTime, // Required field, will be updated later
        },
      });
      logId = log.id;

      console.log(`Running job: ${jobName}`);

      // Execute the job
      const recordsAffected = await handler();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Update log with success
      await prisma.schedulerJobLog.update({
        where: { id: logId },
        data: {
          status: 'SUCCESS',
          endTime,
          duration,
          records: recordsAffected,
          message: `Successfully processed ${recordsAffected} records`,
        },
      });

      // Update job's last run time and next run time
      await this.updateJobTimings(jobId, startTime);

      console.log(
        `Job completed: ${jobName} - Updated ${recordsAffected} records in ${duration}ms`,
      );
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);

      console.error(`Job failed: ${jobName}`, error);

      // Update log with failure
      if (logId) {
        await prisma.schedulerJobLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            endTime,
            duration,
            message: errorMessage,
            error: errorStack,
          },
        });
      }
    }
  }

  /**
   * Update job last run and calculate next run time
   */
  private static async updateJobTimings(jobId: string, lastRun: Date) {
    try {
      const job = await prisma.schedulerJob.findUnique({
        where: { id: jobId },
        select: { schedule: true },
      });

      if (!job) return;

      // Calculate next run time based on cron expression
      const nextRun = this.calculateNextRun(job.schedule, lastRun);

      await prisma.schedulerJob.update({
        where: { id: jobId },
        data: {
          lastRun,
          nextRun,
        },
      });
    } catch (error) {
      console.error('Failed to update job timings:', error);
    }
  }

  private static updateNextRunTime(jobId: string) {
    return this.updateJobTimings(jobId, new Date());
  }

  /**
   * Calculate next run time from cron expression
   */
  private static calculateNextRun(
    schedule: string,
    fromDate: Date = new Date(),
  ): Date {
    const parts = schedule.split(' ');
    if (parts.length !== 5) {
      // Default to 24 hours later if invalid format
      return new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
    }

    const [minute, hour] = parts;
    const nextRun = new Date(fromDate);

    // Handle daily jobs (most common case)
    if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      if (minute !== '*' && hour !== '*') {
        nextRun.setHours(parseInt(hour), parseInt(minute), 0, 0);

        // If the time has passed today, schedule for tomorrow
        if (nextRun <= fromDate) {
          nextRun.setDate(nextRun.getDate() + 1);
        }

        return nextRun;
      }
    }

    // Default fallback: 24 hours later
    return new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Update expired rewards
   */
  private static async updateExpiredRewards(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await prisma.reward.updateMany({
      where: {
        isActive: true,
        expiryDate: {
          not: null,
          lt: today,
        },
      },
      data: {
        isActive: false,
      },
    });

    return count;
  }

  /**
   * Update expired discounts
   */
  private static async updateExpiredDiscounts(): Promise<number> {
    const now = new Date();

    const { count } = await prisma.discount.updateMany({
      where: {
        isActive: true,
        endDate: {
          lt: now,
        },
      },
      data: {
        isActive: false,
      },
    });

    return count;
  }

  /**
   * Run specific job manually with logging
   */
  static async runJob(jobName: string): Promise<number> {
    const job = await prisma.schedulerJob.findUnique({
      where: { name: jobName },
    });

    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    const handler = this.handlers[job.handler];
    if (!handler) {
      throw new Error(`Handler not found: ${job.handler}`);
    }

    const startTime = new Date();
    const log = await prisma.schedulerJobLog.create({
      data: {
        jobId: job.id,
        status: 'RUNNING',
        startTime,
        endTime: startTime, // Required field, will be updated
      },
    });

    try {
      const recordsAffected = await handler();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      await prisma.schedulerJobLog.update({
        where: { id: log.id },
        data: {
          status: 'SUCCESS',
          endTime,
          duration,
          records: recordsAffected,
          message: `Manual execution: Successfully processed ${recordsAffected} records`,
        },
      });

      return recordsAffected;
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await prisma.schedulerJobLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          endTime,
          duration,
          message: errorMessage,
          error: error instanceof Error ? error.stack : String(error),
        },
      });

      throw error;
    }
  }

  /**
   * Update job configuration
   */
  static async updateJobConfig(
    jobId: string,
    updates: JobConfigUpdate,
  ): Promise<SchedulerJob> {
    // Validate cron expression if provided
    if (updates.schedule && !cron.validate(updates.schedule)) {
      throw new Error(`Invalid cron expression: ${updates.schedule}`);
    }

    const job = await prisma.schedulerJob.update({
      where: { id: jobId },
      data: updates,
    });

    // Convert to SchedulerJob type
    const schedulerJob: SchedulerJob = {
      id: job.id,
      name: job.name,
      description: job.description,
      tableName: job.tableName,
      handler: job.handler,
      schedule: job.schedule,
      isEnabled: job.isEnabled,
      lastRun: job.lastRun?.toISOString() || null,
      nextRun: job.nextRun?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };

    // Restart the job with new configuration if it's enabled
    if (updates.isEnabled !== false) {
      await this.restartJob(job.name);
    } else if (updates.isEnabled === false) {
      this.stopJob(job.name);
    }

    return schedulerJob;
  }

  /**
   * Restart a job with updated configuration
   */
  static async restartJob(jobName: string) {
    // Stop existing job
    this.stopJob(jobName);

    // Reload configuration and restart
    const jobConfig = await prisma.schedulerJob.findUnique({
      where: { name: jobName },
    });

    if (jobConfig && jobConfig.isEnabled) {
      const schedulerJob: SchedulerJob = {
        id: jobConfig.id,
        name: jobConfig.name,
        description: jobConfig.description,
        tableName: jobConfig.tableName,
        handler: jobConfig.handler,
        schedule: jobConfig.schedule,
        isEnabled: jobConfig.isEnabled,
        lastRun: jobConfig.lastRun?.toISOString() || null,
        nextRun: jobConfig.nextRun?.toISOString() || null,
        createdAt: jobConfig.createdAt.toISOString(),
        updatedAt: jobConfig.updatedAt.toISOString(),
      };

      await this.scheduleJobFromConfig(schedulerJob);
    }
  }

  /**
   * Stop specific job
   */
  static stopJob(jobName: string): boolean {
    const task = this.jobs.get(jobName);
    if (task) {
      task.stop();
      return true;
    }
    return false;
  }

  /**
   * Stop all jobs
   */
  static stopAll() {
    this.jobs.forEach((task, name) => {
      task.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
    this.isInitialized = false;
  }

  /**
   * Get all jobs with their status and last log
   */
  static async getAllJobsWithStatus(): Promise<SchedulerJobWithStatus[]> {
    try {
      const jobs = await prisma.schedulerJob.findMany({
        include: {
          logs: {
            orderBy: { startTime: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      });

      return jobs.map((job) => ({
        id: job.id,
        name: job.name,
        description: job.description,
        tableName: job.tableName,
        handler: job.handler,
        schedule: job.schedule,
        isEnabled: job.isEnabled,
        lastRun: job.lastRun?.toISOString() || null,
        nextRun: job.nextRun?.toISOString() || null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        logs: job.logs.map((log) => ({
          id: log.id,
          jobId: log.jobId,
          status: log.status,
          startTime: log.startTime.toISOString(),
          endTime: log.endTime?.toISOString() || null,
          duration: log.duration,
          records: log.records,
          message: log.message,
          error: log.error,
          createdAt: log.createdAt.toISOString(),
        })),
        lastLog: job.logs[0]
          ? {
              id: job.logs[0].id,
              jobId: job.logs[0].jobId,
              status: job.logs[0].status,
              startTime: job.logs[0].startTime.toISOString(),
              endTime: job.logs[0].endTime?.toISOString() || null,
              duration: job.logs[0].duration,
              records: job.logs[0].records,
              message: job.logs[0].message,
              error: job.logs[0].error,
              createdAt: job.logs[0].createdAt.toISOString(),
            }
          : null,
        scheduled: job.isEnabled && !!job.nextRun,
      }));
    } catch (error) {
      console.error('Error getting jobs with status:', error);
      throw error;
    }
  }

  /**
   * Get scheduler statistics
   */
  static async getSchedulerStats() {
    try {
      const [totalJobs, activeJobs, disabledJobs, successCount, failedCount] =
        await Promise.all([
          prisma.schedulerJob.count(),
          prisma.schedulerJob.count({ where: { isEnabled: true } }),
          prisma.schedulerJob.count({ where: { isEnabled: false } }),
          prisma.schedulerJobLog.count({ where: { status: 'SUCCESS' } }),
          prisma.schedulerJobLog.count({ where: { status: 'FAILED' } }),
        ]);

      return {
        totalJobs,
        activeJobs,
        disabledJobs,
        successJobs: successCount,
        failedJobs: failedCount,
      };
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
   * Get scheduler logs
   */
  static async getLogs(
    params: { limit?: number; offset?: number } = {},
  ): Promise<SchedulerJobLog[]> {
    const { limit = 50, offset = 0 } = params;

    try {
      const logs = await prisma.schedulerJobLog.findMany({
        include: {
          job: {
            select: {
              name: true,
              description: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset,
      });

      return logs.map((log) => ({
        id: log.id,
        jobId: log.jobId,
        status: log.status,
        startTime: log.startTime.toISOString(),
        endTime: log.endTime?.toISOString() || null,
        duration: log.duration,
        records: log.records,
        message: log.message,
        error: log.error,
        createdAt: log.createdAt.toISOString(),
        job: log.job,
      }));
    } catch (error) {
      console.error('Error getting scheduler logs:', error);
      throw error;
    }
  }
}
