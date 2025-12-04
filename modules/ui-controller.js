// Controlador da interface do usuário
const UIController = {
    elements: {},
    userInteracted: false,
    shouldAutoplay: false,
    
    // Inicializar
    init: function() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupMobileActivation();
        
        // Verificar parâmetros da URL
        this.checkUrlParams();
        
        Utils.log('UI Controller inicializado');
        return this;
    },
    
    // Cache de elementos DOM
    cacheElements: function() {
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            playIcon: document.getElementById('playIcon'),
            progressBar: document.getElementById('progressBar'),
            progressFill: document.getElementById('progressFill'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeFill: document.getElementById('volumeFill'),
            trackTitle: document.getElementById('trackTitle'),
            trackArtist: document.getElementById('trackArtist'),
            albumArt: document.getElementById('albumArt'),
            loopBtn: document.getElementById('loopBtn'),
            loopIcon: document.getElementById('loopIcon'),
            vuModeBtn: document.getElementById('vuModeBtn')
        };
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botão play/pause
        this.elements.playBtn.addEventListener('click', () => {
            if (Utils.isMobile() && !this.userInteracted) {
                alert('Toque primeiro em qualquer lugar da tela para ativar o áudio.');
                return;
            }
            AudioPlayer.togglePlay();
        });
        
        // Botão loop
        this.elements.loopBtn.addEventListener('click', () => {
            AudioPlayer.setLoop(!AudioPlayer.isLooping);
            this.updateLoopButton();
        });
        
        // Botão modo VU
        this.elements.vuModeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            VUMeter.toggleMode();
        });
        
        // Barra de progresso
        this.elements.progressBar.addEventListener('click', (e) => {
            const rect = this.elements.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const duration = AudioPlayer.getDuration();
            if (duration) {
                AudioPlayer.setCurrentTime(percent * duration);
            }
        });
        
        // Controle de volume
        this.elements.volumeSlider.addEventListener('click', (e) => {
            const rect = this.elements.volumeSlider.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            AudioPlayer.setVolume(percent);
            this.updateVolumeDisplay(percent);
        });
        
        // Eventos do player
        AudioPlayer.audio.addEventListener('play', () => this.onAudioPlay());
        AudioPlayer.audio.addEventListener('pause', () => this.onAudioPause());
        AudioPlayer.audio.addEventListener('timeupdate', () => this.updateProgress());
        AudioPlayer.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
        AudioPlayer.audio.addEventListener('volumechange', () => {
            this.updateVolumeDisplay(AudioPlayer.getVolume());
        });
    },
    
    // Configurar ativação mobile
    setupMobileActivation: function() {
        if (!Utils.isMobile()) {
            this.userInteracted = true;
            return;
        }
        
        const unlockAudio = () => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                Utils.log('Áudio destravado pelo toque do usuário');
                
                // Para iOS, técnica de destravamento
                if (Utils.isIOS) {
                    // Tocar áudio silencioso para destravar
                    const silentAudio = new Audio();
                    silentAudio.volume = 0.001;
                    silentAudio.play().then(() => {
                        silentAudio.pause();
                    }).catch(() => {});
                }
                
                // Remover listeners
                document.removeEventListener('touchstart', unlockAudio);
                document.removeEventListener('click', unlockAudio);
                
                // Se autoplay estiver ativado, tentar tocar
                if (this.shouldAutoplay && !AudioPlayer.isPlaying) {
                    setTimeout(() => {
                        AudioPlayer.play();
                    }, 500);
                }
            }
        };
        
        // Destravar com primeiro toque
        document.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('click', unlockAudio, { passive: true });
    },
    
    // Verificar parâmetros da URL
    checkUrlParams: function() {
        const params = Utils.getUrlParams();
        
        // Atualizar interface
        this.updateTrackInfo(params.track, params.artist);
        
        if (params.cover && Utils.isValidUrl(params.cover)) {
            this.elements.albumArt.src = decodeURIComponent(params.cover);
            Utils.updateOgTags(`${params.artist} - ${params.track}`, params.cover);
        } else {
            this.elements.albumArt.src = Utils.getDefaultAlbumArt();
        }
        
        if (params.audio && Utils.isValidUrl(params.audio)) {
            AudioPlayer.loadTrack(
                decodeURIComponent(params.audio),
                {
                    track: params.track,
                    artist: params.artist,
                    cover: params.cover
                }
            );
            
            this.shouldAutoplay = params.autoplay;
        } else {
            // Carregar demo
            this.loadDemoTrack();
        }
    },
    
    // Carregar track demo
    loadDemoTrack: function() {
        const demoUrl = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';
        AudioPlayer.loadTrack(demoUrl, {
            track: 'Tech House Vibes',
            artist: 'Mixkit',
            cover: null
        });
        
        this.updateTrackInfo('Tech House Vibes', 'Mixkit');
        this.elements.albumArt.src = Utils.getDefaultAlbumArt();
    },
    
    // Atualizar informações da track
    updateTrackInfo: function(track, artist) {
        if (this.elements.trackTitle) {
            this.elements.trackTitle.textContent = track;
        }
        if (this.elements.trackArtist) {
            this.elements.trackArtist.textContent = artist;
        }
        document.title = `${track} - ${artist}`;
    },
    
    // Evento: áudio começou a tocar
    onAudioPlay: function() {
        this.elements.playIcon.className = 'fas fa-pause';
        this.elements.albumArt.classList.add('rotating');
        this.elements.albumArt.classList.remove('paused');
        
        VUMeter.start();
        
        // Ativar background service
        BackgroundService.onEnterBackground();
    },
    
    // Evento: áudio pausado
    onAudioPause: function() {
        this.elements.playIcon.className = 'fas fa-play';
        this.elements.albumArt.classList.remove('rotating');
        this.elements.albumArt.classList.add('paused');
        
        VUMeter.stop();
        
        // Desativar background service se não estiver em background
        if (!BackgroundService.isBackground) {
            BackgroundService.onEnterForeground();
        }
    },
    
    // Atualizar progresso
    updateProgress: function() {
        const progress = AudioPlayer.getProgress();
        const currentTime = AudioPlayer.getCurrentTime();
        
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.currentTime.textContent = Utils.formatTime(currentTime);
    },
    
    // Atualizar tempo total
    updateTotalTime: function() {
        const duration = AudioPlayer.getDuration();
        if (duration && !isNaN(duration)) {
            this.elements.totalTime.textContent = Utils.formatTime(duration);
        }
    },
    
    // Atualizar display do volume
    updateVolumeDisplay: function(volume) {
        this.elements.volumeFill.style.width = `${volume * 100}%`;
    },
    
    // Atualizar botão de loop
    updateLoopButton: function() {
        const isLooping = AudioPlayer.isLooping;
        this.elements.loopBtn.classList.toggle('active', isLooping);
        this.elements.loopIcon.style.transform = isLooping ? 'scale(1.1)' : 'scale(1)';
    }
};
