// Service Worker básico para cache
const CACHE_NAME = 'audio-player-v2';

self.addEventListener('install', event => {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    './',
                    './index.html',
                    './player.css',
                    './player.js'
                ]);
            })
    );
});

self.addEventListener('fetch', event => {
    // Para arquivos de áudio, sempre buscar da rede
    if (event.request.url.match(/\.(mp3|ogg|wav)$/)) {
        return fetch(event.request);
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
