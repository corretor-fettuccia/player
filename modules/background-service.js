// Serviço para funcionamento em background
const BackgroundService = {
    wakeLock: null,
    keepAliveInterval: null,
    isBackground: false,
    
    // Inicializar
    init: function() {
        this.setupVisibilityEvents();
        Utils.log('Background Service inicializado');
        return this;
    },
    
    // Configurar eventos de visibilidade
    setupVisibilityEvents: function() {
        document.addEventListener('visibilitychange', () => {
            this.isBackground = document.hidden;
            
            if (document.hidden) {
                this.onEnterBackground();
            } else {
                this.onEnterForeground();
            }
        });
    },
    
    // Quando entra em background
    onEnterBackground: function() {
        Utils.log('Entrando em background');
        
        if (AudioPlayer.isPlaying) {
            this.activateWakeLock();
            this.startKeepAlive();
            
            // Para iOS, técnica especial
            if (Utils.isIOS) {
                this.setupiOSBackground();
            }
        }
    },
    
    // Quando volta ao foreground
    onEnterForeground: function() {
        Utils.log('Voltando ao foreground');
        
        this.releaseWakeLock();
        this.stopKeepAlive();
        
        // Para iOS
        if (Utils.isIOS) {
            this.cleanupiOSBackground();
        }
    },
    
    // Ativar Wake Lock (Android)
    activateWakeLock: function() {
        if ('wakeLock' in navigator && !this.wakeLock && Utils.isAndroid) {
            navigator.wakeLock.request('screen').then(wl => {
                this.wakeLock = wl;
                Utils.log('Wake Lock ativado');
                
                wl.addEventListener('release', () => {
                    Utils.log('Wake Lock liberado');
                    this.wakeLock = null;
                });
            }).catch(error => {
                Utils.log('Wake Lock não disponível:', error);
            });
        }
    },
    
    // Liberar Wake Lock
    releaseWakeLock: function() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            Utils.log('Wake Lock liberado');
        }
    },
    
    // Iniciar keep-alive
    startKeepAlive: function() {
        if (this.keepAliveInterval) return;
        
        this.keepAliveInterval = setInterval(() => {
            if (AudioPlayer.isPlaying && this.isBackground) {
                // Atualizar Media Session periodicamente
                if (AudioPlayer.mediaSession) {
                    try {
                        AudioPlayer.mediaSession.setPositionState({
                            duration: AudioPlayer.getDuration() || 0,
                            playbackRate: 1,
                            position: AudioPlayer.getCurrentTime() || 0
                        });
                    } catch (e) {
                        // Ignorar erros
                    }
                }
                
                // Verificar se o áudio ainda está tocando
                if (AudioPlayer.audio.paused) {
                    Utils.log('Áudio pausado em background, tentando retomar...');
                    AudioPlayer.audio.play().catch(() => {
                        // Ignorar erros
                    });
                }
            }
        }, 2000); // Verificar a cada 2 segundos
        
        Utils.log('Keep-alive iniciado');
    },
    
    // Parar keep-alive
    stopKeepAlive: function() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
            Utils.log('Keep-alive parado');
        }
    },
    
    // Configurações específicas para iOS
    setupiOSBackground: function() {
        // iOS requer que o áudio seja tocado dentro de um gesto de usuário
        // Já fazemos isso no setupMobileActivation
        Utils.log('Configuração iOS background ativada');
    },
    
    // Limpar configurações iOS
    cleanupiOSBackground: function() {
        // Nada específico para limpar
    },
    
    // Limpar recursos
    cleanup: function() {
        this.releaseWakeLock();
        this.stopKeepAlive();
        Utils.log('Background Service limpo');
    }
};
