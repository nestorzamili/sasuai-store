'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ClockIcon, InfoIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateJobConfig } from '../action';
import { SchedulerJobWithStatus, JobConfigUpdate } from '@/lib/types/scheduler';

interface JobConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: SchedulerJobWithStatus | null;
  onSuccess: () => void;
}

export function JobConfigDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: JobConfigDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<
    JobConfigUpdate & { schedule: string }
  >({
    schedule: '',
    description: '',
    isEnabled: true,
  });
  const [scheduleError, setScheduleError] = useState<string>('');

  // Common cron presets
  const cronPresets = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 1 AM', value: '0 1 * * *' },
    { label: 'Daily at 6 AM', value: '0 6 * * *' },
    { label: 'Weekly (Sunday)', value: '0 0 * * 0' },
    { label: 'Monthly (1st)', value: '0 0 1 * *' },
  ];

  // Enhanced validation with more helpful messages
  const validateCronExpression = (cron: string) => {
    if (!cron.trim()) return '';

    const parts = cron.trim().split(/\s+/);

    if (parts.length < 5) {
      return `Need ${5 - parts.length} more field${
        5 - parts.length > 1 ? 's' : ''
      } (${5 - parts.length} of 5 complete)`;
    }

    if (parts.length > 5) {
      return 'Too many fields (max 5 allowed)';
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Enhanced validation with specific error messages
    const validators = [
      {
        field: minute,
        name: 'minute',
        range: '0-59',
        pattern:
          /^(\*|([0-5]?\d)(,([0-5]?\d))*|([0-5]?\d)-([0-5]?\d)|\*\/([1-9]\d*))$/,
      },
      {
        field: hour,
        name: 'hour',
        range: '0-23',
        pattern:
          /^(\*|([01]?\d|2[0-3])(,([01]?\d|2[0-3]))*|([01]?\d|2[0-3])-([01]?\d|2[0-3])|\*\/([1-9]\d*))$/,
      },
      {
        field: dayOfMonth,
        name: 'day',
        range: '1-31',
        pattern:
          /^(\*|([1-9]|[12]\d|3[01])(,([1-9]|[12]\d|3[01]))*|([1-9]|[12]\d|3[01])-([1-9]|[12]\d|3[01])|\*\/([1-9]\d*))$/,
      },
      {
        field: month,
        name: 'month',
        range: '1-12',
        pattern:
          /^(\*|([1-9]|1[012])(,([1-9]|1[012]))*|([1-9]|1[012])-([1-9]|1[012])|\*\/([1-9]\d*))$/,
      },
      {
        field: dayOfWeek,
        name: 'day of week',
        range: '0-7',
        pattern: /^(\*|[0-7](,[0-7])*|[0-7]-[0-7]|\*\/([1-9]\d*))$/,
      },
    ];

    for (const validator of validators) {
      if (!validator.pattern.test(validator.field)) {
        return `Invalid ${validator.name} "${validator.field}" (expected: ${validator.range})`;
      }
    }

    return '';
  };

  // Enhanced human readable parser
  const parseCronToHuman = (cron: string) => {
    try {
      const parts = cron.trim().split(/\s+/);
      if (parts.length !== 5) return '';

      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

      // Common patterns with better descriptions
      const patterns = [
        { cron: '* * * * *', desc: 'Every minute' },
        { cron: '0 * * * *', desc: 'Every hour' },
        { cron: '0 0 * * *', desc: 'Daily at midnight' },
        { cron: '0 6 * * *', desc: 'Daily at 6:00 AM' },
        { cron: '0 12 * * *', desc: 'Daily at noon' },
        { cron: '0 18 * * *', desc: 'Daily at 6:00 PM' },
        { cron: '0 0 * * 0', desc: 'Every Sunday at midnight' },
        { cron: '0 0 * * 1', desc: 'Every Monday at midnight' },
        { cron: '0 0 1 * *', desc: 'First day of every month' },
        { cron: '0 0 1 1 *', desc: 'Every New Year (Jan 1st)' },
      ];

      const exactMatch = patterns.find((p) => p.cron === cron);
      if (exactMatch) return exactMatch.desc;

      // Pattern matching for intervals
      if (
        minute.startsWith('*/') &&
        hour === '*' &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek === '*'
      ) {
        const interval = minute.substring(2);
        return `Every ${interval} minute${interval === '1' ? '' : 's'}`;
      }

      if (
        hour.startsWith('*/') &&
        minute === '0' &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek === '*'
      ) {
        const interval = hour.substring(2);
        return `Every ${interval} hour${interval === '1' ? '' : 's'}`;
      }

      if (
        minute === '0' &&
        hour !== '*' &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek === '*'
      ) {
        const hourNum = parseInt(hour);
        const timeStr =
          hourNum === 0
            ? 'midnight'
            : hourNum === 12
              ? 'noon'
              : hourNum < 12
                ? `${hourNum}:00 AM`
                : `${hourNum - 12}:00 PM`;
        return `Daily at ${timeStr}`;
      }

      if (
        minute === '0' &&
        hour === '0' &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek !== '*'
      ) {
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        if (dayOfWeek.includes(',')) {
          const dayNums = dayOfWeek.split(',').map((d) => parseInt(d));
          const dayNames = dayNums.map((n) => days[n] || `Day ${n}`);
          return `Every ${dayNames.join(', ')} at midnight`;
        } else if (dayOfWeek.includes('-')) {
          return `Weekdays at midnight`;
        } else {
          const dayName = days[parseInt(dayOfWeek)] || `Day ${dayOfWeek}`;
          return `Every ${dayName} at midnight`;
        }
      }

      return 'Custom schedule';
    } catch {
      return '';
    }
  };

  // Smart input handler with better auto-spacing
  const handleScheduleChange = (value: string) => {
    const formatted = value;
    const error = validateCronExpression(formatted);

    setFormData((prev) => ({ ...prev, schedule: formatted }));
    setScheduleError(error);
  };

  // Smart space insertion on specific keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const cursorPos = target.selectionStart || 0;

    // Auto-add space after pressing space or certain keys
    if (e.key === ' ') {
      // Prevent multiple spaces
      const beforeCursor = value.slice(0, cursorPos);
      if (beforeCursor.endsWith(' ')) {
        e.preventDefault();
        return;
      }
    }

    // Auto-space after complete field when typing numbers or *
    if (e.key.match(/[0-9*]/) && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const beforeCursor = value.slice(0, cursorPos);
      const afterCursor = value.slice(cursorPos);
      const parts = beforeCursor.trim().split(/\s+/);

      if (parts.length < 5) {
        const currentPart = parts[parts.length - 1] || '';

        // Auto-add space after complete simple patterns
        if (currentPart === '*' || currentPart.match(/^\d{1,2}$/)) {
          // Check if next character isn't part of a complex pattern
          if (!afterCursor.match(/^[\/\-,]/)) {
            setTimeout(() => {
              const newValue = beforeCursor + e.key + ' ' + afterCursor;
              target.value = newValue;
              target.setSelectionRange(cursorPos + 2, cursorPos + 2);
              handleScheduleChange(newValue);
            }, 0);
            e.preventDefault();
          }
        }
      }
    }
  };

  // Enhanced preset handler
  const handlePresetSelect = (preset: string) => {
    setFormData((prev) => ({ ...prev, schedule: preset }));
    setScheduleError('');

    // Focus back to input for immediate editing
    setTimeout(() => {
      const input = document.getElementById('schedule') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 100);
  };

  // Update form data when job changes
  React.useEffect(() => {
    if (job) {
      const jobSchedule = job.schedule || '';
      setFormData({
        schedule: jobSchedule,
        description: job.description || '',
        isEnabled: job.isEnabled ?? true,
      });
      setScheduleError(validateCronExpression(jobSchedule));
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) return;

    // Validate required fields
    if (!formData.schedule || !formData.schedule.trim()) {
      setScheduleError('Cron schedule is required');
      return;
    }

    if (scheduleError) {
      return;
    }

    startTransition(async () => {
      const result = await updateJobConfig(job.id, formData);

      if (result.success) {
        toast({
          title: 'Job configuration updated',
          description: 'The job has been updated successfully.',
        });
        onSuccess();
      } else {
        toast({
          title: 'Failed to update job',
          description: result.error || 'Failed to update job configuration',
          variant: 'destructive',
        });
      }
    });
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Job</DialogTitle>
          <DialogDescription>
            Update the configuration for {job.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Job description"
            />
          </div>

          {/* Enhanced Cron Schedule Section */}
          <div className="space-y-4">
            <Label
              htmlFor="schedule"
              className="flex items-center gap-2 text-base font-medium"
            >
              <ClockIcon className="h-4 w-4" />
              Cron Schedule
            </Label>

            {/* Input with real-time preview */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => handleScheduleChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="* * * * * (minute hour day month dayofweek)"
                  className={`font-mono text-base pr-32 ${
                    scheduleError
                      ? 'border-red-500 focus:border-red-500'
                      : formData.schedule && !scheduleError
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                  }`}
                  required
                />
                {/* Live preview badge */}
                {formData.schedule && !scheduleError && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 max-w-[120px]">
                    <Badge variant="secondary" className="text-xs truncate">
                      {parseCronToHuman(formData.schedule)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const parts = formData.schedule.trim().split(/\s+/);
                    const isComplete = parts.length > i && parts[i].length > 0;
                    const hasError = scheduleError && parts.length > i;
                    return (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border-2 ${
                          hasError
                            ? 'bg-red-100 border-red-500'
                            : isComplete
                              ? 'bg-green-100 border-green-500'
                              : 'bg-gray-100 border-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-muted-foreground">
                  {Math.min(
                    formData.schedule
                      .trim()
                      .split(/\s+/)
                      .filter((p) => p.length > 0).length,
                    5,
                  )}
                  /5 fields
                </span>
              </div>

              {/* Error message */}
              {scheduleError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <InfoIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <div className="font-medium">Invalid format</div>
                    <div>{scheduleError}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick presets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground bg-background px-2">
                  Quick Presets
                </span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {cronPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset.value)}
                    className="text-xs h-8 justify-start"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.isEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isEnabled: checked,
                }))
              }
            />
            <Label htmlFor="enabled">Enable this job</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending || !!scheduleError || !formData.schedule.trim()
              }
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
