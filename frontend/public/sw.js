// ROOM Service Worker - Web Push Notifications

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ==========================================
// PUSH EVENT LISTENER
// ==========================================
self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { message: event.data.text() };
    }
  }

  const title = data.title || "ROOM";
  const body = data.message || "You have a new notification from ROOM.";
  const type = data.type || "ROOM_NOTIFICATION";

  // Determine target URL for click routing
  let targetUrl = "/";
  if (data.conversationId) {
    targetUrl = `/messages?conversation=${data.conversationId}`;
  } else if (data.roomId) {
    targetUrl = `/rentals/${data.roomId}`;
  } else if (data.url) {
    targetUrl = data.url;
  }

  const options = {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.conversationId
      ? `room-conv-${data.conversationId}`
      : data.notificationId
      ? `room-notif-${data.notificationId}`
      : "room-notification",
    renotify: true,
    data: {
      url: targetUrl,
      notificationId: data.notificationId,
      conversationId: data.conversationId,
      roomId: data.roomId,
      type,
      timestamp: data.timestamp || Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ==========================================
// NOTIFICATION CLICK LISTENER
// ==========================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || "/";
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an existing ROOM window/tab is open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
