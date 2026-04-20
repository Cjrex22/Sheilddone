import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import { api } from './api';
import toast from 'react-hot-toast';

let tokenRegistered = false;

export async function registerFcmToken(): Promise<void> {
  try {
    if (tokenRegistered) return;
    if (!('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] VITE_FIREBASE_VAPID_KEY is not set. Notifications will not work.');
      return;
    }

    const token = await getToken(messaging!, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    if (!token) return;

    await api.post('/settings/fcm-token', { token });
    tokenRegistered = true;

  } catch (err: any) {
    console.error('[FCM] Registration failed:', err?.message || err);
  }
}

export function setupForegroundNotifications(): void {
  try {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'SHEild Alert';
      const body = payload.notification?.body || '';
      toast(body || title, {
        icon: '🛡️',
        duration: 6000,
      });
    });
  } catch (err) {
    console.error('[FCM] Foreground listener failed:', err);
  }
}
