const CACHE_NAME = "rumbo-cache-v18";
const APP_SHELL = [
  "./rumbo.html",
  "./manifest.json",
  "./cursos.json",
  "./icon-192.png",
  "./icon-512.png",
  "./react.production.min.js",
  "./react-dom.production.min.js",
  "./tailwind.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Descargas externas (modelo de voz, Firebase, fuentes): las maneja el navegador, sin pasar por la cachÃ© de la app.
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Notificaciones push (avisos de objetivos pendientes y resumen semanal).
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: "Rumbo", body: event.data && event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || "Rumbo", {
      body: data.body || "",
      tag: data.tag || "rumbo",
      icon: "icon-192.png",
      badge: "icon-192.png",
      data: { url: data.url || "./rumbo.html" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./rumbo.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow(url);
    })
  );
});
