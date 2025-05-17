'use server';

import {
  getPointRuleSettings,
  setPointRuleSettings,
} from '@/lib/services/setting.service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Point rule settings schema for validation
const pointRuleSettingsSchema = z.object({
  enabled: z.boolean(),
  baseAmount: z.number().int().min(1, 'Base amount must be at least 1'),
  pointMultiplier: z.number().min(0.1, 'Multiplier must be at least 0.1'),
});

/**
 * Fetch the current point rule settings
 */
export async function fetchPointRuleSettings() {
  try {
    const settings = await getPointRuleSettings();

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error('Error fetching point rule settings:', error);
    return {
      success: false,
      error: 'Failed to fetch point rule settings',
    };
  }
}

/**
 * Update the point rule settings
 */
export async function updatePointRuleSettings(data: {
  enabled: boolean;
  baseAmount: number;
  pointMultiplier: number;
}) {
  try {
    // Validate the data
    const validatedData = pointRuleSettingsSchema.parse(data);

    // Update settings with explicit type assertion if needed
    await setPointRuleSettings(
      validatedData as {
        enabled: boolean;
        baseAmount: number;
        pointMultiplier: number;
      }
    );

    // Revalidate relevant paths
    revalidatePath('/members');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating point rule settings:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to update point rule settings',
    };
  }
}
