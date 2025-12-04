// Utilitários gerais
const Utils = {
    // Detectar dispositivo
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isMobile: function() {
        return this.isIOS || this.isAndroid;
    },
    
    // Validar URL
    isValidUrl: function(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },
    
    // Formatar tempo (segundos para mm:ss)
    formatTime: function(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    
    // Imagem padrão do álbum
    getDefaultAlbumArt: function() {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2300c853'/%3E%3Cstop offset='100%25' stop-color='%234caf50'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23a)'/%3E%3Cpath d='M100,60 A40,40 0 1,1 100,140 A40,40 0 1,1 100,60' fill='none' stroke='white' stroke-width='8'/%3E%3Ccircle cx='100' cy='100' r='15' fill='white'/%3E%3C/svg%3E";
    },
    
    // Atualizar meta tags Open Graph
    updateOgTags: function(title, imageUrl) {
        const ogImage = document.getElementById('ogImage');
        const ogUrl = document.getElementById('ogUrl');
        
        if (ogUrl) ogUrl.content = window.location.href;
        if (ogImage && imageUrl) ogImage.content = imageUrl;
        
        if (title) {
            document.title = title;
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = title;
        }
    },
    
    // Verificar parâmetros da URL
    getUrlParams: function() {
        const params = new URLSearchParams(window.location.search);
        return {
            audio: params.get('audio'),
            track: params.get('track') || 'Música Desconhecida',
            artist: params.get('artist') || 'Artista Desconhecido',
            cover: params.get('cover'),
            autoplay: params.get('autoplay') === 'true'
        };
    },
    
    // Log com timestamp
    log: function(message, data = null) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`[${timestamp}] ${message}`);
        if (data) console.log(data);
    }
};
