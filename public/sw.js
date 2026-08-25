// ProducerToy - Auto Unregister Legacy Service Workers from localhost
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister()
  )
})
