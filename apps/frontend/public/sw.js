self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Crypto Pulse', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Crypto Pulse', {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: data.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((client) => 'focus' in client);
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
