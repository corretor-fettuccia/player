// Player de áudio principal
const AudioPlayer = {
    audio: null,
    isPlaying: false,
    isLooping: false,
    currentTrack: null,
    mediaSession: null,
    
    // Inicializar
    init: function() {
        this.audio = document.getElementById('audioElement');
        this.setupAudio();
        this.setupMediaSession();
        
        Utils.log('AudioPlayer inicializado');
        return this;
    },
    
    // Configurar elemento de áudio
    setupAudio: function() {
        this.audio.setAttribute('playsinline', 'true');
        this.audio.setAttribute('webkit-playsinline', 'true');
        this.audio.setAttribute('preload', 'auto');
        this.audio.volume = 0.7;
        
        // Eventos
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('error', (e) => this.onError(e));
    },
    
    // Configurar Media Session
    setupMediaSession: function() {
        if ('mediaSession' in navigator) {
            this.mediaSession = navigator.mediaSession;
            
            this.mediaSession.setActionHandler('play', () => this.play());
            this.mediaSession.setActionHandler('pause', () => this.pause());
            this.mediaSession.setActionHandler('seekbackward', (details) => {
                this.seek(-(details.seekOffset || 10));
            });
            this.mediaSession.setActionHandler('seekforward', (details) => {
                this.seek(details.seekOffset || 10);
            });
            
            Utils.log('Media Session configurado');
        }
    },
    
    // Carregar track
    loadTrack: function(url, trackInfo) {
        if (!Utils.isValidUrl(url)) {
            Utils.log('URL inválida:', url);
            return false;
        }
        
        this.currentTrack = trackInfo;
        this.audio.src = url;
        this.audio.load();
        
        // Atualizar Media Session
        this.updateMediaMetadata();
        
        Utils.log('Track carregada:', trackInfo.track);
        return true;
    },
    
    // Atualizar metadados do Media Session
    updateMediaMetadata: function() {
        if (!this.mediaSession || !this.currentTrack) return;
        
        const artwork = [];
        if (this.currentTrack.cover && Utils.isValidUrl(this.currentTrack.cover)) {
            artwork.push({ src: this.currentTrack.cover, sizes: '512x512', type: 'image/jpeg' });
        } else {
            artwork.push({ src: Utils.getDefaultAlbumArt(), sizes: '512x512', type: 'image/svg+xml' });
        }
        
        this.mediaSession.metadata = new MediaMetadata({
            title: this.currentTrack.track,
            artist: this.currentTrack.artist,
            artwork: artwork
        });
    },
    
    // Play
    play: function() {
        if (!this.audio.src) return false;
        
        return this.audio.play().then(() => {
            this.isPlaying = true;
            if (this.mediaSession) {
                this.mediaSession.playbackState = 'playing';
            }
            Utils.log('Áudio tocando');
            return true;
        }).catch(error => {
            Utils.log('Erro ao tocar:', error);
            return false;
        });
    },
    
    // Pause
    pause: function() {
        this.audio.pause();
        this.isPlaying = false;
        
        if (this.mediaSession) {
            this.mediaSession.playbackState = 'paused';
        }
        
        Utils.log('Áudio pausado');
    },
    
    // Toggle play/pause
    togglePlay: function() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },
    
    // Seek (avançar/retroceder segundos)
    seek: function(seconds) {
        const newTime = this.audio.currentTime + seconds;
        this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, newTime));
    },
    
    // Definir volume (0-1)
    setVolume: function(volume) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
    },
    
    // Definir loop
    setLoop: function(loop) {
        this.isLooping = loop;
        this.audio.loop = loop;
    },
    
    // Event handlers
    onTimeUpdate: function() {
        // Disparado pelo player.js principal
    },
    
    onLoadedMetadata: function() {
        // Disparado pelo player.js principal
    },
    
    onEnded: function() {
        if (!this.isLooping) {
            this.pause();
        } else {
            this.audio.currentTime = 0;
            this.play();
        }
    },
    
    onError: function(e) {
        Utils.log('Erro no áudio:', this.audio.error);
    },
    
    // Getters
    getDuration: function() {
        return this.audio.duration;
    },
    
    getCurrentTime: function() {
        return this.audio.currentTime;
    },
    
    getProgress: function() {
        if (!this.audio.duration) return 0;
        return (this.audio.currentTime / this.audio.duration) * 100;
    },
    
    getVolume: function() {
        return this.audio.volume;
    },
    
    // Setters
    setCurrentTime: function(time) {
        if (this.audio.duration) {
            this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, time));
        }
    }
};
