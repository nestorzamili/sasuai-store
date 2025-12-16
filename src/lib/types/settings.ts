export type SettingKey =
  | 'pointRule.enabled'
  | 'pointRule.baseAmount'
  | 'pointRule.pointMultiplier'
  | 'maintenance.enabled'
  | 'maintenance.message'
  | string;

export interface Setting {
  id: string;
  key: SettingKey;
  value: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointRuleSettings {
  enabled: boolean;
  baseAmount: number; // Amount required for 1 point
  pointMultiplier: number; // Global multiplier applied to all points
}

export const DEFAULT_POINT_RULE: PointRuleSettings = {
  enabled: true,
  baseAmount: 1000, // 1 point per 1000 amount
  pointMultiplier: 1,
};
export type SettingPrefix = 'store.' | 'pointRule.' | 'notification.';
