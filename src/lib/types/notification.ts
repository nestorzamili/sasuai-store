export type NotificationSettings = {
  is_active: boolean | false;
  api_key: string | '';
};
export type NotificationPayload = {
  numbers: string[];
  content: string;
  api_key?: string;
};
