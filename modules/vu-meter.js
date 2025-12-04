// VU Meter
const VUMeter = {
    vuBars: null,
    vuWave: null,
    waveBars: [],
    vuMode: 'bars',
    animationId: null,
    analyser: null,
    dataArray: null,
    
    // Inicializar
    init: function() {
        this.vuBars = document.getElementById('vuBars');
        this.vuWave = document.getElementById('vuWave');
        
        this.createBars();
        this.setMode('bars');
        
        Utils.log('VU Meter inicializado');
        return this;
    },
    
    // Criar barras
    createBars: function() {
        // Limpar
        this.vuBars.innerHTML = '';
        this.vuWave.innerHTML = '';
        this.waveBars = [];
        
        // Barras para modo espectro (40 barras)
        for (let i = 0; i < 40; i++) {
            const bar = document.createElement('div');
            bar.className = 'vu-bar';
            bar.style.height = '5px';
            bar.style.backgroundColor = 'var(--primary)';
            this.vuBars.appendChild(bar);
        }
        
        // Barras para modo onda (60 barras)
        for (let i = 0; i < 60; i++) {
            const waveBar = document.createElement('div');
            waveBar.className = 'wave-bar';
            waveBar.style.height = '5px';
            waveBar.style.backgroundColor = 'var(--primary)';
            this.vuWave.appendChild(waveBar);
            this.waveBars.push(waveBar);
        }
    },
    
    // Definir modo (bars ou wave)
    setMode: function(mode) {
        this.vuMode = mode;
        const vuContent = document.getElementById('vuContent');
        const vuModeText = document.getElementById('vuModeText');
        
        if (vuContent) {
            vuContent.className = 'vu-content';
            vuContent.classList.add(`vu-${mode}-mode`);
        }
        
        if (vuModeText) {
            vuModeText.textContent = mode === 'bars' ? 'Onda' : 'Barras';
        }
        
        Utils.log('Modo VU alterado para:', mode);
    },
    
    // Alternar modo
    toggleMode: function() {
        this.setMode(this.vuMode === 'bars' ? 'wave' : 'bars');
    },
    
    // Iniciar animação
    start: function() {
        if (this.animationId) return;
        
        const animate = () => {
            if (!AudioPlayer.isPlaying) {
                this.stop();
                return;
            }
            
            this.update();
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
        Utils.log('VU Meter iniciado');
    },
    
    // Parar animação
    stop: function() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Resetar barras
        this.resetBars();
        Utils.log('VU Meter parado');
    },
    
    // Atualizar visualização
    update: function() {
        // Gerar valor simulado baseado no volume e tempo
        const time = Date.now() * 0.003;
        const volume = AudioPlayer.getVolume();
        let value = 0.3 + Math.sin(time) * 0.15;
        value = Math.max(0.1, Math.min(0.9, value * volume));
        
        if (this.vuMode === 'bars') {
            this.updateBars(value);
        } else {
            this.updateWave(value);
        }
    },
    
    // Atualizar modo barras
    updateBars: function(value) {
        const bars = this.vuBars.querySelectorAll('.vu-bar');
        const now = Date.now();
        
        bars.forEach((bar, index) => {
            const frequency = index * 0.15;
            const timeFactor = now * 0.005;
            let height = 0.1 + (Math.sin(timeFactor + frequency) * 0.12 + 0.08);
            height = Math.max(0.05, Math.min(0.95, height * value));
            
            bar.style.height = `${height * 100}%`;
            bar.style.opacity = Math.max(0.3, height);
            
            // Cor dinâmica
            const intensity = height;
            const hue = 120 + intensity * 30;
            bar.style.backgroundColor = `hsl(${hue}, 80%, ${40 + intensity * 30}%)`;
        });
    },
    
    // Atualizar modo onda
    updateWave: function(value) {
        const now = Date.now();
        
        this.waveBars.forEach((bar, index) => {
            const frequency = index * 0.1;
            let height = Math.sin(now * 0.002 + frequency) * 0.2 + 0.3;
            height = Math.max(0.05, Math.min(0.95, height * value));
            
            bar.style.height = `${height * 100}%`;
            bar.style.opacity = Math.max(0.4, height);
            
            // Cor dinâmica
            const intensity = height;
            const hue = 120 + Math.sin(now * 0.001 + index * 0.3) * 40;
            bar.style.backgroundColor = `hsl(${hue}, 100%, ${30 + intensity * 50}%)`;
        });
        
        // Controlar animação da onda
        const waveAnimation = document.getElementById('waveAnimation');
        if (waveAnimation) {
            if (value > 0.15) {
                waveAnimation.style.opacity = '0.6';
                waveAnimation.style.animationPlayState = 'running';
            } else {
                waveAnimation.style.opacity = '0.2';
                waveAnimation.style.animationPlayState = 'paused';
            }
        }
    },
    
    // Resetar barras
    resetBars: function() {
        const bars = this.vuBars.querySelectorAll('.vu-bar');
        bars.forEach(bar => {
            bar.style.height = '5px';
            bar.style.opacity = '0.2';
            bar.style.backgroundColor = 'var(--primary)';
        });
        
        this.waveBars.forEach(bar => {
            bar.style.height = '5px';
            bar.style.opacity = '0.2';
            bar.style.backgroundColor = 'var(--primary)';
        });
        
        const waveAnimation = document.getElementById('waveAnimation');
        if (waveAnimation) {
            waveAnimation.style.opacity = '0.2';
            waveAnimation.style.animationPlayState = 'paused';
        }
    }
};
