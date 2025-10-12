'use server';
import {
  getStoreSettings,
  updateStoreSettings,
  getStoreField,
} from '@/lib/services/setting.service';
import { StoreFormType } from '@/lib/types/store';
import { SettingPrefix } from '@/lib/types/settings';
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
