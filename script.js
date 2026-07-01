/**
 * Roanoke: The 101 - Core Game Engine
 * Act as Expert Frontend Developer & Game Designer.
 * Vanilla JavaScript (ES6), HTML5 Canvas.
 */

// --- 1. HISTORICAL 17th CENTURY PURITAN/ROANOKE NAMES ---
const COLONIST_NAMES = [
    "John White", "Eleanor Dare", "Ananias Dare", "Virginia Dare", "Manteo", "Wanchese",
    "Thomas Stevens", "John Sampson", "Roger Prat", "George Howe", "Simon Fernando",
    "Agnes Wood", "William Wythers", "Alice Charman", "Elizabeth Glane", "Roger Baily",
    "Prudence Cooper", "Deliverance Martyn", "Increase Mather", "Cotton Haines",
    "Humility Cooper", "Silas Titus", "Remember Allerton", "Constance Hopkins",
    "Bartholomew Gosnold", "Christopher Jones", "Myles Standish", "Peregrine White",
    "Love Brewster", "Wrestling Brewster", "Resolved White", "Oceanus Hopkins",
    "Jane Jones", "Richard Dare", "Margery Harvie", "George Howe Jr.", "Thomas Humfrey",
    "Thomas Harris", "John Chapman", "William Sole", "John Gyles", "Thomas Ellis",
    "John Costonet", "Humphrey Newton", "Thomas Archard", "Thomas Warner", "John Dutton",
    "Maurice Hyde", "John Wright", "William Dutton", "Richard Wildye", "Lewes Wotton",
    "John Hemmings", "Henry Johnson", "John Burden", "James Lasie",
    "John Snellying", "John Bright", "Richard Arthur", "William Green",
    "Peter Coleman", "James Hynde", "Thomas Payne", "Richard Kemme", "John Spendlove",
    "Thomas Butler", "Edward Harrison", "John Burdon", "John Smart",
    "John Browne", "Richard Shabedge", "Thomas Wotton", "William Taylor",
    "Richard Phillipps", "Henry Mylton", "Henry Payne", "William Nichols",
    "Thomas Phevens", "John Brooke", "John Martin", "John Gibbes", "John Stilman",
    "John Taylor", "John Roper", "John Lovelace", "John Pavey", "John Nicholas",
    "Nicholas Johnson", "Clement Taylor", "William Chapman", "Jane Dare",
    "Elizabeth Cooper", "Mary Manteo", "Prudence Smith", "Sarah Payne",
    "Rebekah White", "Charity Dare", "Mercy Gosnold", "Faith Standish", "Grace Brewster"
];

// --- 2. SOUND CONTROLLER (WEB AUDIO API SYNTHESIZER) ---
class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientOsc = null;
        this.ambientGain = null;
        this.ambientFilter = null;
    }

    // Initialize audio context on first user interaction
    init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.startAmbient();
        } catch (e) {
            console.warn("Web Audio API is not supported or failed to initialize", e);
        }
    }

    startAmbient() {
        if (!this.ctx || this.muted) return;
        try {
            // Low wind/drone oscillator
            this.ambientOsc = this.ctx.createOscillator();
            this.ambientGain = this.ctx.createGain();
            this.ambientFilter = this.ctx.createBiquadFilter();

            this.ambientOsc.type = 'sawtooth';
            this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 pitch

            this.ambientFilter.type = 'lowpass';
            this.ambientFilter.frequency.setValueAtTime(110, this.ctx.currentTime);

            // Soft ambient volume
            this.ambientGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

            this.ambientOsc.connect(this.ambientFilter);
            this.ambientFilter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            this.ambientOsc.start();
        } catch (e) {
            console.error("Ambient audio start failed", e);
        }
    }

    stopAmbient() {
        try {
            if (this.ambientOsc) {
                this.ambientOsc.stop();
                this.ambientOsc.disconnect();
                this.ambientOsc = null;
            }
        } catch (e) {
            console.error("Ambient audio stop failed", e);
        }
    }

    // Pitch & volume shift on Day/Night transition
    setNightAmbient(isNight) {
        if (!this.ctx || this.muted || !this.ambientOsc) return;
        
        const now = this.ctx.currentTime;
        const targetFreq = isNight ? 41.20 : 55; // Lower Pitch at Night (E1 vs A1)
        const targetGain = isNight ? 0.06 : 0.03; // Louder/more oppressive at night
        const targetFilter = isNight ? 75 : 110;  // Muffled filter at night
        
        this.ambientOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + 3.0);
        this.ambientFilter.frequency.exponentialRampToValueAtTime(targetFilter, now + 3.0);
        this.ambientGain.gain.linearRampToValueAtTime(targetGain, now + 3.0);
    }

    playClick() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(700, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playChop() {
        if (!this.ctx || this.muted) return;
        // Woodcutting clicky snap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }

    playSplash() {
        if (!this.ctx || this.muted) return;
        // Soft white-noise hiss simulation for splashing water
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.08);
    }

    playRecall() {
        if (!this.ctx || this.muted) return;
        // Warning horn: Low double-pitched saw blast
        const now = this.ctx.currentTime;
        [160, 200].forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);
            osc.frequency.linearRampToValueAtTime(f - 15, now + 0.7);

            gain.gain.setValueAtTime(0.06, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.7);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.7);
        });
    }

    playTaken() {
        if (!this.ctx || this.muted) return;
        // Spooky sub-bass sweep & screech
        const now = this.ctx.currentTime;
        
        // Bass sweep
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(80, now);
        bassOsc.frequency.exponentialRampToValueAtTime(25, now + 1.2);
        bassGain.gain.setValueAtTime(0.25, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 1.2);

        // Screeching high note
        const screechOsc = this.ctx.createOscillator();
        const screechGain = this.ctx.createGain();
        screechOsc.type = 'sawtooth';
        screechOsc.frequency.setValueAtTime(400, now);
        screechOsc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
        screechGain.gain.setValueAtTime(0.02, now);
        screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        screechOsc.connect(screechGain);
        screechGain.connect(this.ctx.destination);
        screechOsc.start(now);
        screechOsc.stop(now + 0.4);
    }

    playDaybreak() {
        if (!this.ctx || this.muted) return;
        // Warm major swell chord (chime)
        const now = this.ctx.currentTime;
        [220, 277.18, 329.63, 440].forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 1.6);
        });
    }

    playGameOver() {
        if (!this.ctx || this.muted) return;
        // Ominous dissonant low cluster chord
        const now = this.ctx.currentTime;
        [50, 58, 62].forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 2.5);
        });
    }
}

const soundController = new SoundController();

// --- 3. COLONIST CLASS (SWARM AI & STEERING BEHAVIOR) ---
class Colonist {
    constructor(id, name, width, height) {
        this.id = id;
        this.name = name;
        
        // Start clustered at the Fort center with a small scatter offset
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 20;
        this.x = width * 0.5 + Math.cos(angle) * dist;
        this.y = height * 0.55 + Math.sin(angle) * dist;

        this.vx = 0;
        this.vy = 0;

        this.state = 'idle'; // 'idle', 'woodcutter', 'fisher'
        this.speed = 1.2 + Math.random() * 0.8; // Individual speed factor
        this.scatterOffset = { x: 0, y: 0 };
        this.setJob('idle');

        this.wobbleTime = Math.random() * 100;
        this.opacity = 1.0;
        this.isDying = false;
    }

    // Set job state and generate individual scatter offset within zone target
    setJob(state) {
        this.state = state;
        let radius = 25;
        if (state === 'woodcutter') radius = 35;
        if (state === 'fisher') radius = 35;

        // Generate circular scatter coordinates
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * radius; // Uniform disk sampling
        this.scatterOffset = {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist
        };
    }

    // Swarm Flocking Logic update
    update(deltaTime, zones, colonists, logicalWidth, logicalHeight) {
        if (this.isDying) {
            this.opacity -= deltaTime * 2;
            if (this.opacity < 0) this.opacity = 0;
            return;
        }

        // Determine destination zone coordinates
        let destX, destY;
        if (this.state === 'woodcutter') {
            destX = zones.forest.x + this.scatterOffset.x;
            destY = zones.forest.y + this.scatterOffset.y;
        } else if (this.state === 'fisher') {
            destX = zones.coast.x + this.scatterOffset.x;
            destY = zones.coast.y + this.scatterOffset.y;
        } else {
            destX = zones.fort.x + this.scatterOffset.x;
            destY = zones.fort.y + this.scatterOffset.y;
        }

        // 1. Steering Force towards target destination
        const dx = destX - this.x;
        const dy = destY - this.y;
        const distToTarget = Math.sqrt(dx*dx + dy*dy);
        
        let attractionX = 0;
        let attractionY = 0;

        if (distToTarget > 2) {
            // Apply stronger pull the further away they are, capped
            const speedScale = Math.min(distToTarget * 0.05, 1);
            attractionX = (dx / distToTarget) * this.speed * speedScale * 0.12;
            attractionY = (dy / distToTarget) * this.speed * speedScale * 0.12;
        }

        // 2. Separation Force (Boids avoidance behavior to prevent clipping)
        let separationX = 0;
        let separationY = 0;
        let neighbors = 0;
        const minDistance = 7; // Separation bubble radius

        for (let i = 0; i < colonists.length; i++) {
            const other = colonists[i];
            if (other.id === this.id || other.isDying) continue;

            const diffX = this.x - other.x;
            const diffY = this.y - other.y;
            const distSq = diffX*diffX + diffY*diffY;

            if (distSq < minDistance * minDistance && distSq > 0) {
                const dist = Math.sqrt(distSq);
                separationX += diffX / dist;
                separationY += diffY / dist;
                neighbors++;
            }
        }

        if (neighbors > 0) {
            separationX = (separationX / neighbors) * 0.14;
            separationY = (separationY / neighbors) * 0.14;
        }

        // 3. Ambient Worker Wobble (Visual feedback that they are chopping/fishing/gathering)
        let wobbleX = 0;
        let wobbleY = 0;
        this.wobbleTime += 0.15;
        if (distToTarget < 12) {
            // Wobble dynamically when in zone
            wobbleX = Math.sin(this.wobbleTime) * 0.08;
            wobbleY = Math.cos(this.wobbleTime * 0.8) * 0.08;
        }

        // Integrate forces
        this.vx += attractionX + separationX + wobbleX;
        this.vy += attractionY + separationY + wobbleY;

        // Apply friction/drag
        this.vx *= 0.88;
        this.vy *= 0.88;

        // Limit velocity to maximum speed
        const currentSpeed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (currentSpeed > this.speed) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }

        // Update Position
        this.x += this.vx;
        this.y += this.vy;

        // Bound checks (stay within physical screen space)
        if (this.x < 6) { this.x = 6; this.vx *= -1; }
        if (this.x > logicalWidth - 6) { this.x = logicalWidth - 6; this.vx *= -1; }
        if (this.y < 6) { this.y = 6; this.vy *= -1; }
        if (this.y > logicalHeight - 6) { this.y = logicalHeight - 6; this.vy *= -1; }
    }

    draw(ctx, isNight, safeRadius, fortCenter) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Color coding by state/job
        let color = '#e6e8e7'; // Idle: Parchment
        if (this.state === 'woodcutter') color = '#bf9850'; // Woodcutter: Brass/Gold
        if (this.state === 'fisher') color = '#4dc3ff';     // Fisher: Sea blue

        ctx.fillStyle = color;

        // Threat highlight (flash warning red if outside fort at night)
        let isVulnerable = false;
        if (isNight) {
            const dx = this.x - fortCenter.x;
            const dy = this.y - fortCenter.y;
            const distToFort = Math.sqrt(dx*dx + dy*dy);
            if (distToFort > safeRadius) {
                isVulnerable = true;
            }
        }

        if (isVulnerable && !this.isDying) {
            // Draw dynamic pulsating warning halo at night
            const pulseScale = 1 + Math.sin(Date.now() * 0.015) * 0.4;
            ctx.strokeStyle = 'rgba(255, 51, 51, 0.7)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4 * pulseScale, 0, Math.PI * 2);
            ctx.stroke();

            // Override color to look panic-red
            ctx.fillStyle = '#ff6666';
        }

        // Draw dot representing the colonist
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = this.isDying ? 10 : 3;
        
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);

        ctx.restore();
    }
}

// --- 4. MAIN GAME STATE ENGINE ---
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('game-container');
        this.canvasContainer = document.getElementById('canvas-container');

        // Logic coordinate bounds
        this.logicalWidth = 0;
        this.logicalHeight = 0;

        // Resource & Balance values
        this.food = 250;
        this.wood = 0;
        this.population = 101;
        this.day = 1;
        this.timeOfDay = 0; // 0 to 45 seconds (0-30 Day, 30-45 Night)
        this.maxWoodStored = 0;

        this.colonists = [];
        this.zones = {
            fort: { x: 0, y: 0, radius: 40, safeRadius: 60, color: '#8c7853' },
            forest: { x: 0, y: 0, radius: 45, color: '#1e3a27' },
            coast: { x: 0, y: 0, radius: 45, color: '#1b363c' }
        };

        this.isRunning = false;
        this.gameOverState = false;
        this.lastTime = 0;
        this.threatTickTimer = 0;
        this.screenShake = 0;

        // Event spam preventer
        this.lastResourceLog = 0;

        // Cache DOM elements
        this.valDay = document.getElementById('val-day');
        this.valPopulation = document.getElementById('val-population');
        this.valFood = document.getElementById('val-food');
        this.valWood = document.getElementById('val-wood');
        this.countWoodcutters = document.getElementById('count-woodcutters');
        this.countFishers = document.getElementById('count-fishers');
        
        this.timePhase = document.getElementById('time-phase');
        this.timeBarInner = document.getElementById('time-bar-inner');
        this.eventFeed = document.getElementById('event-feed');

        // Screens/Buttons
        this.startOverlay = document.getElementById('start-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.btnStart = document.getElementById('btn-start');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnRecall = document.getElementById('btn-recall');

        // Setup Event Handlers
        this.setupHandlers();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    // Dynamic High-DPI canvas scaler
    resize() {
        const rect = this.canvasContainer.getBoundingClientRect();
        this.logicalWidth = rect.width;
        this.logicalHeight = rect.height;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.logicalWidth * dpr;
        this.canvas.height = this.logicalHeight * dpr;
        this.ctx.scale(dpr, dpr);

        this.updateZonePositions();
    }

    updateZonePositions() {
        this.zones.fort.x = this.logicalWidth * 0.5;
        this.zones.fort.y = this.logicalHeight * 0.55;

        this.zones.forest.x = this.logicalWidth * 0.22;
        this.zones.forest.y = this.logicalHeight * 0.28;

        this.zones.coast.x = this.logicalWidth * 0.78;
        this.zones.coast.y = this.logicalHeight * 0.72;
    }

    setupHandlers() {
        // Start Expedition
        this.btnStart.addEventListener('click', () => {
            soundController.init();
            soundController.playClick();
            this.startOverlay.classList.remove('active');
            this.initGame();
        });

        // Restart Expedition
        this.btnRestart.addEventListener('click', () => {
            soundController.playClick();
            this.gameOverOverlay.classList.remove('active');
            this.initGame();
        });

        // Task Assignments Woodcutters
        document.getElementById('btn-woodcutters-plus').addEventListener('click', () => this.assignJob('woodcutter', 10));
        document.getElementById('btn-woodcutters-minus').addEventListener('click', () => this.assignJob('woodcutter', -10));

        // Task Assignments Fishers
        document.getElementById('btn-fishers-plus').addEventListener('click', () => this.assignJob('fisher', 10));
        document.getElementById('btn-fishers-minus').addEventListener('click', () => this.assignJob('fisher', -10));

        // Emergency Recall
        this.btnRecall.addEventListener('click', () => this.recallAll());

        // Mute Audio Toggle
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                soundController.muted = !soundController.muted;
                muteBtn.textContent = soundController.muted ? '🔇' : '🔊';
                soundController.playClick();
                if (soundController.muted) {
                    soundController.stopAmbient();
                } else {
                    soundController.init();
                    soundController.startAmbient();
                }
            });
        }
    }

    initGame() {
        this.food = 250;
        this.wood = 0;
        this.population = 101;
        this.day = 1;
        this.timeOfDay = 0;
        this.maxWoodStored = 0;
        this.threatTickTimer = 0;
        this.screenShake = 0;
        this.gameOverState = false;
        this.lastResourceLog = 0;

        // Clear feed
        this.eventFeed.innerHTML = '';
        this.logEvent("101 settlers have established Roanoke Fort. Keep them fed and safe.", "system");

        // Shuffle historic name list
        const names = [...COLONIST_NAMES];
        for (let i = names.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [names[i], names[j]] = [names[j], names[i]];
        }

        // Initialize exactly 101 colonists
        this.colonists = [];
        for (let i = 0; i < 101; i++) {
            const name = names[i % names.length] || `Colonist #${i + 1}`;
            this.colonists.push(new Colonist(i, name, this.logicalWidth, this.logicalHeight));
        }

        this.updateZonePositions();
        this.updateUI();

        this.container.classList.remove('night');
        soundController.setNightAmbient(false);

        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    // Assign or recall workers in bulks of 10
    assignJob(job, amount) {
        if (!this.isRunning || this.gameOverState) return;

        soundController.init(); // Fallback focus initialization

        if (amount > 0) {
            // Assign from Idle colonists
            let assignedCount = 0;
            const idleColonists = this.colonists.filter(c => c.state === 'idle' && !c.isDying);
            
            const toAssign = Math.min(amount, idleColonists.length);
            for (let i = 0; i < toAssign; i++) {
                idleColonists[i].setJob(job);
                assignedCount++;
            }

            if (assignedCount > 0) {
                if (job === 'woodcutter') {
                    soundController.playChop();
                    this.logEvent(`Assigned ${assignedCount} colonists to woodcutting.`, "system");
                } else {
                    soundController.playSplash();
                    this.logEvent(`Assigned ${assignedCount} colonists to fishing.`, "system");
                }
            }
        } else {
            // Remove from active job back to Idle
            let recalledCount = 0;
            const workers = this.colonists.filter(c => c.state === job && !c.isDying);
            const toRecall = Math.min(Math.abs(amount), workers.length);

            for (let i = 0; i < toRecall; i++) {
                workers[i].setJob('idle');
                recalledCount++;
            }

            if (recalledCount > 0) {
                soundController.playClick();
                this.logEvent(`Recalled ${recalledCount} ${job === 'woodcutter' ? 'woodcutters' : 'fishers'} to Idle status.`, "system");
            }
        }
        this.updateUI();
    }

    // Emergency Recall Button action
    recallAll() {
        if (!this.isRunning || this.gameOverState) return;
        soundController.init();

        let woodcutters = 0;
        let fishers = 0;

        this.colonists.forEach(c => {
            if (!c.isDying) {
                if (c.state === 'woodcutter') woodcutters++;
                if (c.state === 'fisher') fishers++;
                c.setJob('idle');
            }
        });

        const totalRecalled = woodcutters + fishers;
        if (totalRecalled > 0) {
            soundController.playRecall();
            this.logEvent(`EMERGENCY: All ${totalRecalled} workers recalled to Fort.`, "warning");
        } else {
            soundController.playClick();
        }
        this.updateUI();
    }

    // Add log feed message
    logEvent(message, type = '') {
        const item = document.createElement('div');
        item.className = `feed-item ${type}`;
        item.innerText = `[${this.formatTimeOfLog()}] ${message}`;
        this.eventFeed.appendChild(item);

        // Limit feed size
        while (this.eventFeed.childNodes.length > 25) {
            this.eventFeed.removeChild(this.eventFeed.firstChild);
        }

        // Scroll to bottom
        this.eventFeed.scrollTop = this.eventFeed.scrollHeight;
    }

    formatTimeOfLog() {
        const minutes = Math.floor(this.timeOfDay / 60);
        const seconds = Math.floor(this.timeOfDay % 60);
        return `${seconds.toString().padStart(2, '0')}s`;
    }

    // Update Stats text
    updateUI() {
        this.valDay.innerText = this.day;
        this.valPopulation.innerText = this.population;
        this.valFood.innerText = Math.floor(this.food);
        this.valWood.innerText = Math.floor(this.wood);

        // Highlight food danger
        if (this.food < 50) {
            document.getElementById('stat-food').classList.add('danger');
            this.valFood.classList.add('danger');
        } else {
            document.getElementById('stat-food').classList.remove('danger');
            this.valFood.classList.remove('danger');
        }

        const countWood = this.colonists.filter(c => c.state === 'woodcutter' && !c.isDying).length;
        const countFish = this.colonists.filter(c => c.state === 'fisher' && !c.isDying).length;

        this.countWoodcutters.innerText = countWood;
        this.countFishers.innerText = countFish;
    }

    // Core Game Loop
    loop(timestamp) {
        if (!this.isRunning || this.gameOverState) return;

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap spikes
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(deltaTime) {
        // Handle screen shake decay
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime * 15;
            if (this.screenShake < 0) this.screenShake = 0;
        }

        // Progress Time of Day (Day: 30s, Night: 15s)
        const oldTime = this.timeOfDay;
        this.timeOfDay += deltaTime;
        const isNight = this.timeOfDay >= 30;

        // Visual Vignette transition class
        if (isNight && oldTime < 30) {
            this.container.classList.add('night');
            this.logEvent("🌙 Night falls. A thick fog gathers outside the palisade!", "warning");
            soundController.setNightAmbient(true);
            soundController.playRecall();
        }

        // Night phase end (Day breaks)
        if (this.timeOfDay >= 45) {
            this.timeOfDay = 0;
            this.day++;
            this.container.classList.remove('night');
            this.logEvent(`☀️ Day ${this.day} begins. The morning sun clears the fog.`, "system");
            soundController.setNightAmbient(false);
            soundController.playDaybreak();
        }

        // Update time display HUD
        if (isNight) {
            this.timePhase.innerHTML = "🌙 NIGHT";
            const nightLeft = 45 - this.timeOfDay;
            const pct = (nightLeft / 15) * 100;
            this.timeBarInner.style.width = `${pct}%`;
        } else {
            this.timePhase.innerHTML = "☀️ DAY";
            const dayLeft = 30 - this.timeOfDay;
            const pct = (dayLeft / 30) * 100;
            this.timeBarInner.style.width = `${pct}%`;
        }

        // Get count values
        const countWood = this.colonists.filter(c => c.state === 'woodcutter' && !c.isDying).length;
        const countFish = this.colonists.filter(c => c.state === 'fisher' && !c.isDying).length;
        const countIdle = this.colonists.filter(c => c.state === 'idle' && !c.isDying).length;

        // Resource Harvesting Generation
        const woodRate = 0.25; // wood per second per woodcutter
        const foodRate = 0.45; // food per second per fisher
        const idleConsumption = 0.18; // food consumed per second per idle colonist

        this.wood += countWood * woodRate * deltaTime;
        this.food += countFish * foodRate * deltaTime;
        this.food -= countIdle * idleConsumption * deltaTime;

        if (this.wood > this.maxWoodStored) {
            this.maxWoodStored = this.wood;
        }

        // Log resource alert ticks
        this.lastResourceLog += deltaTime;
        if (this.lastResourceLog >= 10.0) {
            this.lastResourceLog = 0;
            if (this.food < 70) {
                this.logEvent("Rations are running dangerously low!", "danger");
            }
        }

        // Death checks
        if (this.food <= 0) {
            this.food = 0;
            this.triggerGameOver("Famine took the remaining colonists. The settlement lay silent.");
            return;
        }

        // Night Threat (Check for vanishings)
        if (isNight) {
            this.threatTickTimer += deltaTime;
            if (this.threatTickTimer >= 1.0) {
                this.threatTickTimer = 0;
                this.checkThreatVanishings();
            }
        }

        // Update Colonists physics
        for (let i = this.colonists.length - 1; i >= 0; i--) {
            const colonist = this.colonists[i];
            colonist.update(deltaTime, this.zones, this.colonists, this.logicalWidth, this.logicalHeight);

            // Clean up fading dead colonists
            if (colonist.isDying && colonist.opacity <= 0) {
                this.colonists.splice(i, 1);
            }
        }

        this.updateUI();
    }

    // Calculate vulnerability and pick random victims left outside during the night
    checkThreatVanishings() {
        const vulnerable = [];
        this.colonists.forEach(c => {
            if (c.isDying) return;
            
            // Calculate distance to Fort center
            const dx = c.x - this.zones.fort.x;
            const dy = c.y - this.zones.fort.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist > this.zones.fort.safeRadius) {
                vulnerable.push(c);
            }
        });

        if (vulnerable.length > 0) {
            // Collective probability: individual 2.8% check per tick
            vulnerable.forEach(victim => {
                if (Math.random() < 0.028 && !victim.isDying) {
                    victim.isDying = true;
                    this.population--;
                    this.screenShake = 8;
                    soundController.playTaken();
                    this.logEvent(`${victim.name} vanished into the dark woods...`, "danger");

                    if (this.population <= 0) {
                        this.population = 0;
                        this.triggerGameOver("The colony is empty. Only the word 'CROATAN' carved on a post remains.");
                    }
                }
            });
        }
    }

    // Trigger game over screen
    triggerGameOver(causeText) {
        this.isRunning = false;
        this.gameOverState = true;

        soundController.playGameOver();
        soundController.stopAmbient();

        // Render stats on report screen
        document.getElementById('stat-days-survived').innerText = this.day;
        document.getElementById('stat-max-wood').innerText = Math.floor(this.maxWoodStored);
        document.getElementById('stat-final-pop').innerText = this.population;
        document.getElementById('stat-cause').innerText = causeText;

        this.gameOverOverlay.classList.add('active');
    }

    // Canvas Renderer
    draw() {
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

        // Screen shake transform
        this.ctx.save();
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }

        // Draw Map Zones
        this.drawZone(this.zones.forest, "THE FOREST", "🌲 Harvesting Wood");
        this.drawZone(this.zones.coast, "THE COAST", "🐟 Catching Fish");
        this.drawFortZone(this.zones.fort);

        // Draw Colonists
        const isNight = this.timeOfDay >= 30;
        this.colonists.forEach(c => {
            c.draw(this.ctx, isNight, this.zones.fort.safeRadius, this.zones.fort);
        });

        // Screen shake restore
        this.ctx.restore();

        // Draw Ambient Night Fog Overlay on Canvas
        this.drawNightFog();
    }

    // Render resources zones (Forest, Coast)
    drawZone(zone, label, subtitle) {
        // Soft outer radial gradient glow
        const grad = this.ctx.createRadialGradient(
            zone.x, zone.y, zone.radius * 0.2,
            zone.x, zone.y, zone.radius * 1.5
        );
        
        if (zone.color === '#1e3a27') {
            // Forest Greens
            grad.addColorStop(0, 'rgba(30, 58, 39, 0.45)');
            grad.addColorStop(0.5, 'rgba(20, 38, 26, 0.2)');
            grad.addColorStop(1, 'rgba(12, 14, 13, 0)');
        } else {
            // Coast Blues
            grad.addColorStop(0, 'rgba(27, 54, 60, 0.45)');
            grad.addColorStop(0.5, 'rgba(20, 40, 45, 0.2)');
            grad.addColorStop(1, 'rgba(12, 14, 13, 0)');
        }

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, zone.radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Thin border boundary
        this.ctx.strokeStyle = 'rgba(140, 120, 83, 0.12)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw stylized elements
        if (zone.color === '#1e3a27') {
            // Trees
            this.ctx.fillStyle = 'rgba(20, 45, 28, 0.3)';
            this.drawTree(zone.x - 20, zone.y - 10);
            this.drawTree(zone.x, zone.y + 10);
            this.drawTree(zone.x + 18, zone.y - 12);
        } else {
            // Waves
            this.ctx.strokeStyle = 'rgba(77, 195, 255, 0.15)';
            this.ctx.lineWidth = 1.5;
            this.drawWave(zone.x - 15, zone.y - 5);
            this.drawWave(zone.x + 5, zone.y + 10);
        }

        // Zone text labels
        this.ctx.fillStyle = 'rgba(230, 232, 231, 0.45)';
        this.ctx.font = '700 9px "Cinzel", serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, zone.x, zone.y - 28);

        this.ctx.fillStyle = 'rgba(143, 160, 149, 0.35)';
        this.ctx.font = '300 7px "Outfit", sans-serif';
        this.ctx.fillText(subtitle, zone.x, zone.y + 32);
    }

    drawTree(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 10);
        this.ctx.lineTo(x - 6, y + 2);
        this.ctx.lineTo(x + 6, y + 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillRect(x - 1.5, y + 2, 3, 3);
    }

    drawWave(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.quadraticCurveTo(x + 4, y - 3, x + 8, y);
        this.ctx.quadraticCurveTo(x + 12, y - 3, x + 16, y);
        this.ctx.stroke();
    }

    // Render Palisade Fort & Firelight Glow
    drawFortZone(zone) {
        const now = Date.now();
        
        // 1. Warm firelight glow pulsing in safe zone
        const pulse = Math.sin(now * 0.005) * 0.04;
        const grad = this.ctx.createRadialGradient(
            zone.x, zone.y, 10,
            zone.x, zone.y, zone.safeRadius
        );
        grad.addColorStop(0, 'rgba(140, 120, 83, 0.22)');
        grad.addColorStop(0.4 + pulse, 'rgba(140, 120, 83, 0.12)');
        grad.addColorStop(1, 'rgba(12, 14, 13, 0)');

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, zone.safeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Safe zone glowing golden border
        this.ctx.strokeStyle = 'rgba(140, 120, 83, 0.25)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, zone.safeRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // 3. Palisade Palisade wooden logs
        this.ctx.strokeStyle = '#8c7853';
        this.ctx.lineWidth = 2.5;
        this.ctx.setLineDash([4, 6]); // Gives appearance of logs
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset dash

        // 4. Center Campfire star
        const fireSize = 3 + Math.sin(now * 0.02) * 1.5;
        this.ctx.fillStyle = '#ffaa33';
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, fireSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Text
        this.ctx.fillStyle = '#bf9850';
        this.ctx.font = '900 10px "Cinzel", serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("ROANOKE FORT", zone.x, zone.y - 12);
        
        this.ctx.fillStyle = 'rgba(143, 160, 149, 0.45)';
        this.ctx.font = '300 7px "Outfit", sans-serif';
        this.ctx.fillText("SAFE ZONE", zone.x, zone.y + 12);
    }

    // Dynamic radial darkness fog centered around the firelit Fort
    drawNightFog() {
        const isNight = this.timeOfDay >= 30;
        let nightOpacity = 0;

        if (isNight) {
            // Fade-in night fog between 30s and 33s
            if (this.timeOfDay < 33) {
                nightOpacity = (this.timeOfDay - 30) / 3;
            } 
            // Fade-out night fog between 43s and 45s
            else if (this.timeOfDay > 43) {
                nightOpacity = (45 - this.timeOfDay) / 2;
            } 
            // Flat night fog in between
            else {
                nightOpacity = 1.0;
            }
        }

        if (nightOpacity > 0) {
            const fortX = this.zones.fort.x;
            const fortY = this.zones.fort.y;
            const safeRadius = this.zones.fort.safeRadius;

            this.ctx.save();

            // Dark radial shroud leaving only the Fort illuminated
            const shroud = this.ctx.createRadialGradient(
                fortX, fortY, safeRadius * 0.7,
                fortX, fortY, Math.max(this.logicalWidth, this.logicalHeight) * 0.68
            );
            
            shroud.addColorStop(0, 'rgba(5, 7, 6, 0)');
            shroud.addColorStop(0.25, `rgba(5, 7, 6, ${nightOpacity * 0.65})`);
            shroud.addColorStop(1, `rgba(5, 7, 6, ${nightOpacity * 0.96})`);

            this.ctx.fillStyle = shroud;
            this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

            this.ctx.restore();
        }
    }
}

// --- 5. INITIALIZE APPLICATION ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
    // Launch game
    window.game = new GameEngine();
});
