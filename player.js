// Arquivo principal - inicializa todos os módulos
document.addEventListener('DOMContentLoaded', () => {
    Utils.log('Winamp Player iniciando...');
    
    // Inicializar módulos
    AudioPlayer.init();
    VUMeter.init();
    BackgroundService.init();
    UIController.init();
    
    // Configurar comunicação entre módulos
    setupModuleCommunication();
    
    // Adicionar controles de debug
    setupDebugControls();
    
    Utils.log('Winamp Player pronto!');
});

// Configurar comunicação entre módulos
function setupModuleCommunication() {
    // Quando o tempo do áudio atualizar, atualizar também o VU Meter
    const originalTimeUpdate = AudioPlayer.onTimeUpdate;
    AudioPlayer.onTimeUpdate = function() {
        originalTimeUpdate.call(this);
        // O VU Meter já se atualiza via requestAnimationFrame
    };
    
    // Quando os metadados carregarem
    const originalLoadedMetadata = AudioPlayer.onLoadedMetadata;
    AudioPlayer.onLoadedMetadata = function() {
        originalLoadedMetadata.call(this);
        UIController.updateTotalTime();
    };
}

// Controles de debug
function setupDebugControls() {
    window.debugPlayer = {
        getState: () => ({
            audio: {
                playing: AudioPlayer.isPlaying,
                looping: AudioPlayer.isLooping,
                volume: AudioPlayer.getVolume(),
                currentTime: AudioPlayer.getCurrentTime(),
                duration: AudioPlayer.getDuration(),
                progress: AudioPlayer.getProgress()
            },
            ui: {
                userInteracted: UIController.userInteracted,
                shouldAutoplay: UIController.shouldAutoplay
            },
            background: {
                isBackground: BackgroundService.isBackground,
                wakeLock: BackgroundService.wakeLock !== null
            },
            device: {
                isIOS: Utils.isIOS,
                isAndroid: Utils.isAndroid,
                isMobile: Utils.isMobile()
            }
        }),
        play: () => AudioPlayer.play(),
        pause: () => AudioPlayer.pause(),
        toggle: () => AudioPlayer.togglePlay(),
        setVolume: (vol) => {
            AudioPlayer.setVolume(vol);
            UIController.updateVolumeDisplay(vol);
        },
        loadDemo: () => UIController.loadDemoTrack()
    };
}

// Limpar recursos ao sair
window.addEventListener('beforeunload', () => {
    BackgroundService.cleanup();
    VUMeter.stop();
    AudioPlayer.pause();
});
