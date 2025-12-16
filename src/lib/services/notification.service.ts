'use server';
import { NotificationPayload } from '@/lib/types/notification';
import { pushToWhatsappQueue } from '../rabbitmq';
import prisma from '@/lib/prisma';
export async function addToQueue(payload: NotificationPayload) {
  const api_key = await prisma.setting.findUnique({
    where: { key: 'store.notification_blastify_api' },
  });
  const status = await prisma.setting.findUnique({
    where: { key: 'store.notification_status' },
  });
  if (status?.value !== 'true') {
    return;
  }
  if (api_key?.value == '' || api_key?.value == null) {
    return;
  }
  const data: NotificationPayload = {
    ...payload,
    api_key: api_key?.value || '',
  };
  const queue = await pushToWhatsappQueue(data);
  return queue;
}
