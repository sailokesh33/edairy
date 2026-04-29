messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'medication-reminder',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],  // buzz pattern
    silent: false,                         // use system sound
  })
})