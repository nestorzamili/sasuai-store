import prisma from '@/lib/prisma';
import {
  PointRuleSettings,
  SettingKey,
  DEFAULT_POINT_RULE,
} from '@/lib/types/settings';
import { MemberWithTier } from '@/lib/types/member';
import { StoreFormType } from '../types/store';
import { SettingPrefix } from '@/lib/types/settings';
/**
 * Get a setting value by key
 */
export async function getSetting(key: SettingKey): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key },
  });

  return setting?.value || null;
}

/**
 * Set a setting value
 */
export async function setSetting(
  key: SettingKey,
  value: string | null
): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Get point rule settings
 */
export async function getPointRuleSettings(): Promise<PointRuleSettings> {
  const [enabled, baseAmount, pointMultiplier] = await Promise.all([
    getSetting('pointRule.enabled'),
    getSetting('pointRule.baseAmount'),
    getSetting('pointRule.pointMultiplier'),
  ]);

  return {
    enabled: enabled === 'true',
    baseAmount: baseAmount
      ? parseInt(baseAmount)
      : DEFAULT_POINT_RULE.baseAmount,
    pointMultiplier: pointMultiplier
      ? parseFloat(pointMultiplier)
      : DEFAULT_POINT_RULE.pointMultiplier,
  };
}

/**
 * Set point rule settings
 */
export async function setPointRuleSettings(
  settings: PointRuleSettings
): Promise<void> {
  await Promise.all([
    setSetting('pointRule.enabled', settings.enabled.toString()),
    setSetting('pointRule.baseAmount', settings.baseAmount.toString()),
    setSetting(
      'pointRule.pointMultiplier',
      settings.pointMultiplier.toString()
    ),
  ]);
}

/**
 * Calculate points that a member would earn for a given transaction amount
 */
export async function calculateMemberPoints(
  amount: number,
  member: MemberWithTier | null
): Promise<number> {
  if (!member) return 0;

  const pointRules = await getPointRuleSettings();

  if (!pointRules.enabled) return 0;

  // Base calculation using the configured base amount
  const basePoints = Math.floor(amount / pointRules.baseAmount);

  // Apply tier multiplier if available
  const tierMultiplier = member.tier?.multiplier || 1;

  // Apply both the global point multiplier and the tier-specific multiplier
  const totalMultiplier = pointRules.pointMultiplier * tierMultiplier;

  // Calculate and round down to nearest integer
  return Math.floor(basePoints * totalMultiplier);
}

/**
 * Format member name with points display
 */
export function formatMemberInfo(
  member: MemberWithTier | null,
  includePoints: boolean = true
): string {
  if (!member) return 'Guest';

  if (includePoints) {
    return `${member.name} (${member.totalPoints} pts)`;
  }

  return member.name;
}

export async function getStoreSettings(
  SettingPrefix: SettingPrefix = 'store.'
) {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        startsWith: SettingPrefix,
      },
    },
  });
  const storeData = settings.reduce((acc: StoreFormType, item) => {
    const key = item.key.replace(SettingPrefix, ''); // hapus prefix
    acc[key] = item.value;
    return acc;
  }, {} as StoreFormType);
  return storeData;
}
export async function updateStoreSettings(data: StoreFormType) {
  const entries = Object.entries(data).map(([key, value]) => ({
    key: `store.${key}`,
    value: value ?? null,
  }));

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.setting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      })
    )
  );
}
export async function getStoreField(field: string) {
  const key = `store.${field}`;
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value || null;
}
