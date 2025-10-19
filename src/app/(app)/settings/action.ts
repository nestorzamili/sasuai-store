'use server';
import {
  getStoreSettings,
  updateStoreSettings,
  getStoreField,
} from '@/lib/services/setting.service';
import { StoreFormType } from '@/lib/types/store';
import { SettingPrefix } from '@/lib/types/settings';
import { addToQueue } from '@/lib/services/notification.service';
import { NotificationPayload } from '@/lib/types/notification';
export async function getStore(SettingPrefix: SettingPrefix) {
  const store = await getStoreSettings(SettingPrefix);
  return {
    success: true,
    data: store,
  };
}
export async function updateStore(data: StoreFormType) {
  const store = await updateStoreSettings(data);
  return {
    success: true,
    data: store,
  };
}
export async function getSettingFields(field: string) {
  const store = await getStoreField(field);
  return {
    success: true,
    data: store,
  };
}
const template = `✅ Connection established using the new credential. Test completed without errors.`;
export async function testNotification() {
  const payload: NotificationPayload = {
    numbers: ['082169072681'],
    content: template,
  };
  const queue = await addToQueue(payload);
  return {
    success: true,
    data: queue,
  };
}
