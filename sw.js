/**
 * 위드모아 서비스 워커 — 푸시 알림만 담당한다.
 *
 * 오프라인 캐시는 일부러 넣지 않았다. 이 앱은 "지금 뭐가 터졌나"를 보는 앱이라
 * 옛 화면을 캐시에서 꺼내 보여 주는 게 도움이 안 된다. 오히려 낡은 시세·뉴스를
 * 새 것처럼 보여줘서 해롭다.
 *
 * Firebase 를 쓰지 않는다. 표준 Web Push(VAPID)라 계정도 콘솔도 필요 없다.
 * 스토어용 네이티브 빌드로 갈 때 FCM/APNs 가 필요해지면 그때 얹는다.
 */

self.addEventListener("install", () => {
  // 새 워커가 바로 일하도록. 안 그러면 탭을 다 닫아야 갱신된다.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "위드모아", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "위드모아";
  const options = {
    body: payload.body || "",
    icon: "./icons/withmoa-rounded-192.png",
    badge: "./icons/withmoa-rounded-192.png",
    // 같은 급변으로 알림이 여러 개 쌓이지 않게 한다. 뒤엣것이 앞엣것을 덮어쓴다.
    tag: payload.tag || "withmoa",
    renotify: true,
    data: { url: payload.url || "./" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.location.href).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // 이미 열려 있는 창이 있으면 새로 열지 않고 그쪽을 앞으로 가져온다.
    for (const client of windows) {
      if (client.url.startsWith(self.registration.scope) && "focus" in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});
