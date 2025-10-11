'use server';
import {
  getStoreSettings,
  updateStoreSettings,
  getStoreField,
} from '@/lib/services/setting.service';
import { StoreFormType } from '@/lib/types/store';
export async function getStore() {
  const store = await getStoreSettings();
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
