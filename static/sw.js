const CACHE_NAME = 'tansees-ocr-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/landing.html',
    '/about.html',
    '/privacy.html',
    '/static/style.css', // إذا كان موجوداً
    '/static/site.webmanifest',
    '/static/tansees_logo.svg',
    '/static/tansees_logo.png',
    '/static/icon-192x192.png',
    '/static/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // للطلبات التي تذهب للواجهة البرمجية (API)، لا نستخدم التخزين المؤقت، 
    // نريد طلبها دائماً من الشبكة
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // لباقي الملفات (HTML, CSS, IMAGES) نستخدم التخزين المؤقت أولاً
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // نُرجع النسخة المخبأة إن وُجدت، وإلا نسحبها من الشبكة
                return response || fetch(event.request).then(
                    (fetchResponse) => {
                        // التحقق من صلاحية الاستجابة
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // استنساخ الاستجابة، لأنها تستهلك عند إرجاعها
                        var responseToCache = fetchResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    }
                );
            })
    );
});
