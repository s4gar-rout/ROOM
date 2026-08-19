import api from "@/lib/axios";

/**
 * Utility: Convert a URL-safe base64 string to a Uint8Array for applicationServerKey
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the current browser environment supports Push Notifications
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Register or get existing Service Worker registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

/**
 * Get current PushSubscription if any
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Error checking push subscription:", error);
    return null;
  }
}

/**
 * Detect if current browser is Brave
 */
export async function isBraveBrowser(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & {
    brave?: { isBrave?: () => Promise<boolean> };
  };
  if (nav.brave && typeof nav.brave.isBrave === "function") {
    try {
      return await nav.brave.isBrave();
    } catch {
      return false;
    }
  }
  return false;
}

export interface SubscribePushResult {
  success: boolean;
  subscription: PushSubscription | null;
  error?: string;
  isBraveError?: boolean;
}

/**
 * Request notification permission and subscribe to browser push notifications
 */
export async function subscribeToPush(): Promise<SubscribePushResult> {
  if (!isPushSupported()) {
    return {
      success: false,
      subscription: null,
      error: "Push notifications are not supported in this browser.",
    };
  }

  try {
    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return {
        success: false,
        subscription: null,
        error: permission === "denied"
          ? "Notification permission was blocked in browser settings."
          : "Notification permission was not granted.",
      };
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      return {
        success: false,
        subscription: null,
        error: "Failed to register Service Worker.",
      };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn(
        "NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined in environment variables"
      );
      return {
        success: false,
        subscription: null,
        error: "VAPID Public Key is missing in environment.",
      };
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        });
      } catch (subErr: unknown) {
        const err = subErr as Error;
        const isBrave = await isBraveBrowser();

        if (
          isBrave ||
          err.name === "AbortError" ||
          err.message?.includes("push service error")
        ) {
          const braveMsg =
            "Brave blocks push messaging by default. Go to brave://settings/privacy and enable 'Use Google services for push messaging', then restart Brave.";
          console.warn(braveMsg, err);
          return {
            success: false,
            subscription: null,
            error: isBrave ? braveMsg : `Push service error: ${err.message}`,
            isBraveError: isBrave,
          };
        }

        throw err;
      }
    }

    // Synchronize subscription with the backend for the authenticated user
    const subJSON = subscription.toJSON();
    if (subJSON.endpoint && subJSON.keys) {
      await api.post("/notifications/push/subscribe", {
        endpoint: subJSON.endpoint,
        keys: {
          p256dh: subJSON.keys.p256dh,
          auth: subJSON.keys.auth,
        },
      });
    }

    return {
      success: true,
      subscription,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Failed to subscribe to push notifications:", err);
    return {
      success: false,
      subscription: null,
      error: err.message || "Failed to subscribe to push notifications.",
    };
  }
}

/**
 * Unsubscribe current browser device from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      try {
        await api.delete("/notifications/push/unsubscribe", {
          data: { endpoint },
        });
      } catch (err) {
        console.error("Failed to notify backend about unsubscription:", err);
      }
    }

    return true;
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return false;
  }
}

/**
 * Background subscription sync for returning/logged-in users.
 * ONLY runs when permission is already 'granted' (never prompts).
 */
export async function syncPushSubscriptionOnLogin(): Promise<void> {
  if (!isPushSupported()) return;

  if (Notification.permission === "granted") {
    try {
      const registration = await registerServiceWorker();
      if (!registration) return;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) return;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        });
      }

      const subJSON = subscription.toJSON();
      if (subJSON.endpoint && subJSON.keys) {
        await api.post("/notifications/push/subscribe", {
          endpoint: subJSON.endpoint,
          keys: {
            p256dh: subJSON.keys.p256dh,
            auth: subJSON.keys.auth,
          },
        });
      }
    } catch (err) {
      console.error("Failed to sync push subscription on login:", err);
    }
  }
}

/**
 * Trigger a test push notification to user's registered devices
 */
export async function sendTestPushNotification(): Promise<boolean> {
  try {
    const res = await api.post("/notifications/push/test");
    return res.data?.success || false;
  } catch (error) {
    console.error("Failed to send test push notification:", error);
    return false;
  }
}
