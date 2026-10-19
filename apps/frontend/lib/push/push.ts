import { apiFetch } from '@/lib/api';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEBPUSH_PUBLIC_KEY ?? '';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  Notification.permission !== 'denied' &&
  Boolean(VAPID_PUBLIC_KEY);

const SW_READY_TIMEOUT_MS = 5_000;

const waitForServiceWorker =
  async (): Promise<ServiceWorkerRegistration> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Service worker registration timed out')),
        SW_READY_TIMEOUT_MS,
      ),
    );

    return Promise.race([navigator.serviceWorker.ready, timeout]);
  };

export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return (await registration?.pushManager.getSubscription()) ?? null;
  } catch {
    return null;
  }
};

export const subscribeToPush = async (): Promise<void> => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted');
  }

  const registration = await waitForServiceWorker();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      VAPID_PUBLIC_KEY,
    ) as unknown as BufferSource,
  });

  const { endpoint, keys } = subscription.toJSON();

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    await subscription.unsubscribe();
    throw new Error('Failed to create push subscription');
  }

  try {
    await apiFetch('/push/subscribe', {
      method: 'POST',
      body: {
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        userAgent: navigator.userAgent,
      },
    });
  } catch (error) {
    await subscription.unsubscribe();
    throw error;
  }
};

export const unsubscribeFromPush = async (): Promise<void> => {
  const subscription = await getPushSubscription();
  if (!subscription) return;

  await apiFetch('/push/subscribe', {
    method: 'DELETE',
    body: { endpoint: subscription.endpoint },
  });
  await subscription.unsubscribe();
};
