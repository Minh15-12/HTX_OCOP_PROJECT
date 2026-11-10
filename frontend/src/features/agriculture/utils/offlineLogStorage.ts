import { FarmingLogPayload } from '@/types/agriculture';
import { batchSyncFarmingLogs } from '@/services/farmingLogApi';

const OFFLINE_QUEUE_KEY = 'htx_ocop_offline_log_queue';

export function getOfflineQueue(): FarmingLogPayload[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOfflineLog(payload: FarmingLogPayload): void {
  try {
    const queue = getOfflineQueue();
    // Gán client_uuid nếu chưa có
    const item: FarmingLogPayload = {
      ...payload,
      client_uuid: payload.client_uuid || `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Không thể lưu bộ nhớ tạm ngoại tuyến:', err);
  }
}

export function removeOfflineItem(clientUuid: string): void {
  try {
    const queue = getOfflineQueue().filter((item) => item.client_uuid !== clientUuid);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch {}
}

export async function syncOfflineQueue(
  onSuccess?: (count: number) => void,
  onError?: (err: any) => void
): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  try {
    const results = await batchSyncFarmingLogs(queue);
    clearOfflineQueue();
    if (onSuccess) onSuccess(results.length);
    return results.length;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}
