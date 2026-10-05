/**
 * Flappy Bird Deluxe - Complete Game Engine
 * Featuring Custom Bird Skins, Dynamic Day/Sunset/Night Cycles, Difficulty Presets,
 * Web Audio API Sound Effects, High-DPI Canvas Rendering & Medal Rewards.
 * Developed through Pritam
 */

(function () {
    'use strict';

    // Game Virtual Dimensions
    const VIRTUAL_WIDTH = 400;
    const VIRTUAL_HEIGHT = 650;
    const GROUND_HEIGHT = 90;
    const PLAYABLE_HEIGHT = VIRTUAL_HEIGHT - GROUND_HEIGHT;

    // Canvas & Context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('gameContainer');

    // UI Elements
    const hudScore = document.getElementById('hudScore');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const finalScoreEl = document.getElementById('finalScore');
    const bestScoreEl = document.getElementById('bestScore');
    const newBestBadge = document.getElementById('newBestBadge');
    const encouragementMsg = document.getElementById('encouragementMsg');
    const medalBadge = document.getElementById('medalBadge');
    const medalIcon = document.getElementById('medalIcon');
    const medalText = document.getElementById('medalText');

    // Controls
    const soundBtn = document.getElementById('soundBtn');
    const soundIconOn = document.getElementById('soundIconOn');
    const soundIconOff = document.getElementById('soundIconOff');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const skinPicker = document.getElementById('skinPicker');
    const difficultyPicker = document.getElementById('difficultyPicker');

    // SVG Bird Elements for live preview
    const svgBirdBody = document.getElementById('svgBirdBody');
    const svgBirdBelly = document.getElementById('svgBirdBelly');
    const svgBirdBeak = document.getElementById('svgBirdBeak');
    const svgBirdWingIn = document.getElementById('svgBirdWingIn');

    // High-DPI Scaling Setup
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = VIRTUAL_WIDTH * dpr;
        canvas.height = VIRTUAL_HEIGHT * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ==========================================================================
    // Skins Configuration
    // ==========================================================================
    const SKINS = {
        classic: {
            id: 'classic',
            name: 'Gold',
            body0: '#fef08a',
            body1: '#facc15',
            body2: '#eab308',
            belly: '#fef9c3',
            beak: '#f97316',
            wing0: '#ffffff',
            wing1: '#fde047',
            svgBody: '#FACC15',
            svgBelly: '#FEF08A',
            svgBeak: '#F97316',
            svgWing: '#FDE047'
        },
        blue: {
            id: 'blue',
            name: 'Blue Jay',
            body0: '#bae6fd',
            body1: '#38bdf8',
            body2: '#0284c7',
            belly: '#e0f2fe',
            beak: '#f97316',
            wing0: '#ffffff',
            wing1: '#7dd3fc',
            svgBody: '#38BDF8',
            svgBelly: '#BAE6FD',
            svgBeak: '#F97316',
            svgWing: '#7DD3FC'
        },
        phoenix: {
            id: 'phoenix',
            name: 'Phoenix',
            body0: '#fca5a5',
            body1: '#ef4444',
            body2: '#b91c1c',
            belly: '#ffedd5',
            beak: '#facc15',
            wing0: '#fef08a',
            wing1: '#f87171',
            svgBody: '#EF4444',
            svgBelly: '#FFEDD5',
            svgBeak: '#FACC15',
            svgWing: '#F87171'
        },
        cyber: {
            id: 'cyber',
            name: 'Cyber',
            body0: '#d8b4fe',
            body1: '#8b5cf6',
            body2: '#6d28d9',
            belly: '#a7f3d0',
            beak: '#34d399',
            wing0: '#6ee7b7',
            wing1: '#c084fc',
            svgBody: '#8B5CF6',
            svgBelly: '#A7F3D0',
            svgBeak: '#34D399',
            svgWing: '#C084FC'
        }
    };

    let currentSkin = SKINS[localStorage.getItem('flappy_skin') || 'classic'] || SKINS.classic;

    function applySkin(skinKey) {
        if (!SKINS[skinKey]) return;
        currentSkin = SKINS[skinKey];
        localStorage.setItem('flappy_skin', skinKey);

        // Update UI buttons
        const skinButtons = skinPicker.querySelectorAll('.skin-btn');
        skinButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-skin') === skinKey);
        });

        // Update Start Screen SVG preview
        if (svgBirdBody) svgBirdBody.setAttribute('fill', currentSkin.svgBody);
        if (svgBirdBelly) svgBirdBelly.setAttribute('fill', currentSkin.svgBelly);
        if (svgBirdBeak) svgBirdBeak.setAttribute('fill', currentSkin.svgBeak);
        if (svgBirdWingIn) svgBirdWingIn.setAttribute('fill', currentSkin.svgWing);
    }

    // ==========================================================================
    // Difficulty Settings
    // ==========================================================================
    const DIFFICULTIES = {
        easy: {
            baseGap: 155,
            baseSpeed: 2.0,
            gravity: 0.34,
            jumpStrength: -6.8,
            minGap: 135
        },
        normal: {
            baseGap: 138,
            baseSpeed: 2.4,
            gravity: 0.38,
            jumpStrength: -7.2,
            minGap: 120
        },
        hardcore: {
            baseGap: 122,
            baseSpeed: 2.8,
            gravity: 0.42,
            jumpStrength: -7.6,
            minGap: 108
        }
    };

    let currentDiffKey = localStorage.getItem('flappy_difficulty') || 'normal';
    let currentDiff = DIFFICULTIES[currentDiffKey] || DIFFICULTIES.normal;

    function applyDifficulty(diffKey) {
        if (!DIFFICULTIES[diffKey]) return;
        currentDiffKey = diffKey;
        currentDiff = DIFFICULTIES[diffKey];
        localStorage.setItem('flappy_difficulty', diffKey);

        const diffButtons = difficultyPicker.querySelectorAll('.diff-tab');
        diffButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-diff') === diffKey);
        });
    }

    // ==========================================================================
    // Day / Sunset / Night Theme
    // ==========================================================================
    const THEMES = ['auto', 'day', 'sunset', 'night'];
    let themeModeIndex = parseInt(localStorage.getItem('flappy_theme_mode') || '0', 10);

    const THEME_ICONS = {
        auto: '✨',
        day: '☀️',
        sunset: '🌅',
        night: '🌙'
    };

    function getActiveTheme() {
        const mode = THEMES[themeModeIndex % THEMES.length];
        if (mode !== 'auto') return mode;

        // Auto mode: transitions based on score
        if (score < 10) return 'day';
        if (score < 22) return 'sunset';
        return 'night';
    }

    function cycleTheme() {
        themeModeIndex = (themeModeIndex + 1) % THEMES.length;
        localStorage.setItem('flappy_theme_mode', themeModeIndex.toString());
        updateThemeUI();
    }

    function updateThemeUI() {
        const mode = THEMES[themeModeIndex % THEMES.length];
        themeIcon.textContent = THEME_ICONS[mode];
        themeToggleBtn.title = `Theme: ${mode.toUpperCase()} (Click to change)`;
    }

    // Stars for night sky
    const stars = [];
    for (let i = 0; i < 35; i++) {
        stars.push({
            x: Math.random() * VIRTUAL_WIDTH,
            y: Math.random() * (PLAYABLE_HEIGHT - 60),
            size: Math.random() * 2 + 0.8,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }

    // ==========================================================================
    // Game State & Core Variables
    // ==========================================================================
    const STATE = {
        START: 'START',
        PLAYING: 'PLAYING',
        GAMEOVER: 'GAMEOVER'
    };

    let currentState = STATE.START;
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('flappy_best_score') || '0', 10);
    let lastTime = 0;
    let screenShake = 0;
    let groundX = 0;
    let hillX = 0;

    // Moving Clouds
    const clouds = [
        { x: 50, y: 70, scale: 0.9, speed: 0.22 },
        { x: 210, y: 120, scale: 1.25, speed: 0.32 },
        { x: 350, y: 60, scale: 0.8, speed: 0.18 }
    ];

    // Particles
    const particles = [];

    function spawnFeather(x, y) {
        for (let i = 0; i < 3; i++) {
            particles.push({
                type: 'feather',
                x: x - 10 + (Math.random() * 8 - 4),
                y: y + 4 + (Math.random() * 8 - 4),
                vx: -Math.random() * 1.5 - 0.5,
                vy: Math.random() * 1.5 - 0.5,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                size: 4 + Math.random() * 4,
                alpha: 1,
                color: Math.random() > 0.4 ? '#ffffff' : currentSkin.body0
            });
        }
    }

    function spawnScoreSparkles(x, y) {
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 1.5;
            particles.push({
                type: 'sparkle',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3.5,
                alpha: 1,
                color: ['#fbbf24', '#f59e0b', '#38bdf8', '#ffffff', '#a855f7'][Math.floor(Math.random() * 5)]
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.type === 'feather') {
                p.vy += 0.05;
                p.rotation += p.rotSpeed;
                p.alpha -= 0.025;
            } else if (p.type === 'sparkle') {
                p.vy += 0.08;
                p.alpha -= 0.035;
                p.size *= 0.96;
            }

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function drawParticles() {
        for (const p of particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            if (p.type === 'feather') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // ==========================================================================
    // Bird Entity
    // ==========================================================================
    const bird = {
        x: 95,
        y: 280,
        radius: 14, // Fair circular hitbox
        velocity: 0,
        rotation: 0,
        wingAngle: 0,

        reset() {
            this.x = 95;
            this.y = 280;
            this.velocity = 0;
            this.rotation = 0;
            this.wingAngle = 0;
        },

        flap() {
            this.velocity = currentDiff.jumpStrength;
            this.wingAngle = 1;
            spawnFeather(this.x, this.y);
            window.soundManager.playFlap();
        },

        update(deltaTimeFactor) {
            if (currentState === STATE.START) {
                this.y = 280 + Math.sin(Date.now() * 0.005) * 8;
                this.rotation = 0;
                this.wingAngle = Math.sin(Date.now() * 0.012) * 0.8;
                return;
            }

            // Gravity & velocity
            this.velocity += currentDiff.gravity * deltaTimeFactor;
            if (this.velocity > 10.5) this.velocity = 10.5;
            this.y += this.velocity * deltaTimeFactor;

            // Smooth rotation
            let targetRotation = 0;
            if (this.velocity < 0) {
                targetRotation = -0.42;
            } else {
                targetRotation = Math.min(1.4, (this.velocity / 10.5) * 1.4);
            }
            this.rotation += (targetRotation - this.rotation) * 0.18;

            this.wingAngle = Math.sin(Date.now() * 0.02) * 0.7;
        },

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Shadow beneath bird
            ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
            ctx.beginPath();
            ctx.ellipse(0, 16, 16, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Main body gradient (Uses active skin)
            const bodyGrad = ctx.createLinearGradient(-18, -14, 18, 14);
            bodyGrad.addColorStop(0, currentSkin.body0);
            bodyGrad.addColorStop(0.3, currentSkin.body1);
            bodyGrad.addColorStop(1, currentSkin.body2);

            ctx.fillStyle = bodyGrad;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Belly patch
            ctx.fillStyle = currentSkin.belly;
            ctx.beginPath();
            ctx.ellipse(-3, 4, 11, 7, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Rosy cheek blush
            ctx.fillStyle = 'rgba(248, 113, 113, 0.55)';
            ctx.beginPath();
            ctx.arc(3, 3, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(8, -4, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pupil & Catchlight
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(10, -4, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(9, -5.5, 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = currentSkin.beak;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(13, -1);
            ctx.lineTo(24, 2);
            ctx.lineTo(13, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Beak crease
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(13, 2.5);
            ctx.lineTo(22, 2.5);
            ctx.stroke();

            // Wing
            ctx.save();
            ctx.translate(-7, 0);
            ctx.rotate(this.wingAngle);

            const wingGrad = ctx.createLinearGradient(-10, -5, 10, 5);
            wingGrad.addColorStop(0, currentSkin.wing0);
            wingGrad.addColorStop(1, currentSkin.wing1);

            ctx.fillStyle = wingGrad;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, 9, 6, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }
    };

    // ==========================================================================
    // Pipe Obstacle Management
    // ==========================================================================
    const pipes = [];
    const PIPE_WIDTH = 58;
    const PIPE_LIP_HEIGHT = 24;
    const PIPE_LIP_OVERHANG = 4;
    let pipeSpawnTimer = 0;
    const PIPE_SPAWN_INTERVAL = 112;

    function spawnPipe() {
        const speed = Math.min(3.9, currentDiff.baseSpeed + Math.floor(score / 5) * 0.12);
        const currentGap = Math.max(currentDiff.minGap, currentDiff.baseGap - Math.floor(score / 8) * 3);

        const minTopHeight = 65;
        const maxTopHeight = PLAYABLE_HEIGHT - currentGap - 65;
        const topHeight = Math.floor(minTopHeight + Math.random() * (maxTopHeight - minTopHeight));
        const bottomY = topHeight + currentGap;
        const bottomHeight = PLAYABLE_HEIGHT - bottomY;

        pipes.push({
            x: VIRTUAL_WIDTH + 10,
            topHeight: topHeight,
            bottomY: bottomY,
            bottomHeight: bottomHeight,
            gap: currentGap,
            passed: false,
            speed: speed
        });
    }

    function updatePipes(deltaTimeFactor) {
        pipeSpawnTimer += deltaTimeFactor;
        if (pipeSpawnTimer >= PIPE_SPAWN_INTERVAL) {
            pipeSpawnTimer = 0;
            spawnPipe();
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= p.speed * deltaTimeFactor;

            // Score Detection
            if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
                p.passed = true;
                score++;
                updateScoreUI();
                spawnScoreSparkles(bird.x, p.topHeight + p.gap / 2);
                window.soundManager.playScore();
            }

            // Remove off-screen pipes
            if (p.x + PIPE_WIDTH < -30) {
                pipes.splice(i, 1);
            }
        }
    }

    function drawPipeSingle(x, y, width, height, isTop) {
        ctx.save();

        // 3D Cylindrical arcade pipe
        const bodyGrad = ctx.createLinearGradient(x, 0, x + width, 0);
        bodyGrad.addColorStop(0, '#4ade80');
        bodyGrad.addColorStop(0.2, '#86efac');
        bodyGrad.addColorStop(0.55, '#22c55e');
        bodyGrad.addColorStop(0.85, '#15803d');
        bodyGrad.addColorStop(1, '#14532d');

        ctx.fillStyle = bodyGrad;
        ctx.fillRect(x, y, width, height);

        // Outlines
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();

        // Pipe Lip / Cap
        const lipX = x - PIPE_LIP_OVERHANG;
        const lipWidth = width + PIPE_LIP_OVERHANG * 2;
        const lipY = isTop ? y + height - PIPE_LIP_HEIGHT : y;

        const lipGrad = ctx.createLinearGradient(lipX, 0, lipX + lipWidth, 0);
        lipGrad.addColorStop(0, '#86efac');
        lipGrad.addColorStop(0.25, '#bbf7d0');
        lipGrad.addColorStop(0.6, '#22c55e');
        lipGrad.addColorStop(0.9, '#15803d');
        lipGrad.addColorStop(1, '#052e16');

        ctx.fillStyle = lipGrad;
        ctx.fillRect(lipX, lipY, lipWidth, PIPE_LIP_HEIGHT);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeRect(lipX, lipY, lipWidth, PIPE_LIP_HEIGHT);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lipX + 2, isTop ? lipY + 2 : lipY + 2);
        ctx.lineTo(lipX + lipWidth - 2, isTop ? lipY + 2 : lipY + 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawPipes() {
        for (const p of pipes) {
            drawPipeSingle(p.x, 0, PIPE_WIDTH, p.topHeight, true);
            drawPipeSingle(p.x, p.bottomY, PIPE_WIDTH, p.bottomHeight, false);
        }
    }

    // ==========================================================================
    // Background Scenery (Sky, Sun/Moon, Hills & Ground)
    // ==========================================================================
    function drawSky() {
        const theme = getActiveTheme();
        const skyGrad = ctx.createLinearGradient(0, 0, 0, PLAYABLE_HEIGHT);

        if (theme === 'sunset') {
            skyGrad.addColorStop(0, '#f97316');
            skyGrad.addColorStop(0.4, '#fb7185');
            skyGrad.addColorStop(0.8, '#fdba74');
            skyGrad.addColorStop(1, '#fef08a');
        } else if (theme === 'night') {
            skyGrad.addColorStop(0, '#090d16');
            skyGrad.addColorStop(0.5, '#1e1b4b');
            skyGrad.addColorStop(1, '#312e81');
        } else {
            // Day
            skyGrad.addColorStop(0, '#38bdf8');
            skyGrad.addColorStop(0.5, '#7dd3fc');
            skyGrad.addColorStop(1, '#bae6fd');
        }

        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, PLAYABLE_HEIGHT);

        // Stars at night
        if (theme === 'night') {
            ctx.save();
            const time = Date.now() * 0.003;
            for (const s of stars) {
                const alpha = 0.4 + Math.sin(time + s.twinkleOffset) * 0.4;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Celestial Body: Sun or Moon
        if (theme === 'night') {
            // Crescent Moon
            ctx.save();
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = 'rgba(254, 240, 138, 0.7)';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(320, 80, 24, 0, Math.PI * 2);
            ctx.fill();

            // Moon shadow cutout
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.arc(310, 76, 21, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Glowing Sun
            const sunY = theme === 'sunset' ? 120 : 80;
            const sunColor0 = theme === 'sunset' ? 'rgba(255, 237, 213, 0.95)' : 'rgba(254, 240, 138, 0.95)';
            const sunColor1 = theme === 'sunset' ? 'rgba(251, 146, 60, 0.4)' : 'rgba(254, 240, 138, 0.4)';

            const sunGrad = ctx.createRadialGradient(310, sunY, 5, 310, sunY, 55);
            sunGrad.addColorStop(0, sunColor0);
            sunGrad.addColorStop(0.4, sunColor1);
            sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = sunGrad;
            ctx.beginPath();
            ctx.arc(310, sunY, 55, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawCloud(x, y, scale) {
        const theme = getActiveTheme();
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        if (theme === 'night') {
            ctx.fillStyle = 'rgba(224, 231, 255, 0.35)';
        } else if (theme === 'sunset') {
            ctx.fillStyle = 'rgba(255, 237, 213, 0.75)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        }

        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.arc(16, -8, 22, 0, Math.PI * 2);
        ctx.arc(36, -2, 17, 0, Math.PI * 2);
        ctx.arc(20, 10, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function updateAndDrawClouds(deltaTimeFactor) {
        for (const c of clouds) {
            c.x -= c.speed * deltaTimeFactor;
            if (c.x < -60) {
                c.x = VIRTUAL_WIDTH + 40;
            }
            drawCloud(c.x, c.y, c.scale);
        }
    }

    function drawHills(deltaTimeFactor) {
        if (currentState === STATE.PLAYING) {
            hillX = (hillX - 0.45 * deltaTimeFactor) % 200;
        }

        const theme = getActiveTheme();
        ctx.save();

        if (theme === 'night') {
            ctx.fillStyle = '#1e293b';
        } else if (theme === 'sunset') {
            ctx.fillStyle = '#9a3412';
        } else {
            ctx.fillStyle = '#86efac';
        }

        ctx.beginPath();
        ctx.moveTo(0, PLAYABLE_HEIGHT);
        for (let x = -200; x <= VIRTUAL_WIDTH + 200; x += 200) {
            const hx = x + hillX;
            ctx.quadraticCurveTo(hx + 100, PLAYABLE_HEIGHT - 45, hx + 200, PLAYABLE_HEIGHT);
        }
        ctx.lineTo(VIRTUAL_WIDTH, PLAYABLE_HEIGHT);
        ctx.lineTo(0, PLAYABLE_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawGround(deltaTimeFactor) {
        if (currentState === STATE.PLAYING) {
            const speed = Math.min(3.9, currentDiff.baseSpeed + Math.floor(score / 5) * 0.12);
            groundX = (groundX - speed * deltaTimeFactor) % 24;
        }

        const y = PLAYABLE_HEIGHT;
        const height = GROUND_HEIGHT;

        // 1. Lush Grass Top Band
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(0, y, VIRTUAL_WIDTH, 14);

        // Jagged Grass Edge Pattern
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        for (let gx = -24; gx <= VIRTUAL_WIDTH + 24; gx += 16) {
            const curX = gx + (groundX % 16);
            ctx.moveTo(curX, y + 14);
            ctx.lineTo(curX + 8, y + 20);
            ctx.lineTo(curX + 16, y + 14);
        }
        ctx.fill();

        // 2. Earth / Dirt Base
        const dirtGrad = ctx.createLinearGradient(0, y + 14, 0, VIRTUAL_HEIGHT);
        dirtGrad.addColorStop(0, '#e5d799');
        dirtGrad.addColorStop(0.3, '#d4c278');
        dirtGrad.addColorStop(1, '#bfa855');
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(0, y + 14, VIRTUAL_WIDTH, height - 14);

        // Diagonal Striping Conveyor
        ctx.strokeStyle = 'rgba(180, 150, 70, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let gx = -40; gx <= VIRTUAL_WIDTH + 40; gx += 20) {
            const curX = gx + groundX;
            ctx.moveTo(curX, y + 16);
            ctx.lineTo(curX - 18, VIRTUAL_HEIGHT);
        }
        ctx.stroke();

        // Border Line
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VIRTUAL_WIDTH, y);
        ctx.stroke();
    }

    // ==========================================================================
    // Collision Detection
    // ==========================================================================
    function checkCollisions() {
        if (bird.y + bird.radius >= PLAYABLE_HEIGHT) {
            bird.y = PLAYABLE_HEIGHT - bird.radius;
            triggerGameOver();
            return;
        }

        if (bird.y - bird.radius <= 0) {
            bird.y = bird.radius;
            triggerGameOver();
            return;
        }

        for (const p of pipes) {
            const lipX = p.x - PIPE_LIP_OVERHANG;
            const lipWidth = PIPE_WIDTH + PIPE_LIP_OVERHANG * 2;

            if (circleIntersectsRect(bird.x, bird.y, bird.radius, p.x, 0, PIPE_WIDTH, p.topHeight - PIPE_LIP_HEIGHT) ||
                circleIntersectsRect(bird.x, bird.y, bird.radius, lipX, p.topHeight - PIPE_LIP_HEIGHT, lipWidth, PIPE_LIP_HEIGHT)) {
                triggerGameOver();
                return;
            }

            if (circleIntersectsRect(bird.x, bird.y, bird.radius, lipX, p.bottomY, lipWidth, PIPE_LIP_HEIGHT) ||
                circleIntersectsRect(bird.x, bird.y, bird.radius, p.x, p.bottomY + PIPE_LIP_HEIGHT, PIPE_WIDTH, p.bottomHeight - PIPE_LIP_HEIGHT)) {
                triggerGameOver();
                return;
            }
        }
    }

    function circleIntersectsRect(cx, cy, radius, rx, ry, rw, rh) {
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        const distanceX = cx - closestX;
        const distanceY = cy - closestY;
        return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
    }

    // ==========================================================================
    // Medals & Game Over Rewards
    // ==========================================================================
    function updateMedalReward(finalScore) {
        medalBadge.className = 'medal-badge';

        if (finalScore >= 50) {
            medalBadge.classList.add('platinum');
            medalIcon.textContent = '💎';
            medalText.textContent = 'Platinum';
            encouragementMsg.textContent = 'Flappy Master Champion!';
            window.soundManager.playMedal();
        } else if (finalScore >= 30) {
            medalBadge.classList.add('gold');
            medalIcon.textContent = '🥇';
            medalText.textContent = 'Gold';
            encouragementMsg.textContent = 'Spectacular Flight!';
            window.soundManager.playMedal();
        } else if (finalScore >= 15) {
            medalBadge.classList.add('silver');
            medalIcon.textContent = '🥈';
            medalText.textContent = 'Silver';
            encouragementMsg.textContent = 'Great Job! So Close to Gold!';
            window.soundManager.playMedal();
        } else if (finalScore >= 5) {
            medalBadge.classList.add('bronze');
            medalIcon.textContent = '🥉';
            medalText.textContent = 'Bronze';
            encouragementMsg.textContent = 'Nice Effort! Onward to Silver!';
            window.soundManager.playMedal();
        } else {
            medalIcon.textContent = '🐣';
            medalText.textContent = 'Novice';
            encouragementMsg.textContent = 'Better Luck Next Time!';
        }
    }

    // ==========================================================================
    // Game Flow & State Management
    // ==========================================================================
    function startGame() {
        window.soundManager.init();
        window.soundManager.playClick();

        currentState = STATE.PLAYING;
        score = 0;
        updateScoreUI();
        hudScore.style.display = 'block';

        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        pipes.length = 0;
        particles.length = 0;
        pipeSpawnTimer = 40;
        bird.reset();
        bird.flap();
    }

    function triggerGameOver() {
        if (currentState === STATE.GAMEOVER) return;

        currentState = STATE.GAMEOVER;
        window.soundManager.playHit();
        screenShake = 16;

        let isNewBest = false;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('flappy_best_score', bestScore.toString());
            isNewBest = true;
        }

        finalScoreEl.textContent = score.toString();
        bestScoreEl.textContent = bestScore.toString();
        if (isNewBest && score > 0) {
            newBestBadge.classList.add('visible');
        } else {
            newBestBadge.classList.remove('visible');
        }

        updateMedalReward(score);
        hudScore.style.display = 'none';

        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 250);
    }

    function updateScoreUI() {
        hudScore.textContent = score.toString();
        hudScore.classList.add('pop');
        setTimeout(() => hudScore.classList.remove('pop'), 150);
    }

    function updateSoundIcons() {
        if (window.soundManager.isMuted) {
            soundIconOn.style.display = 'none';
            soundIconOff.style.display = 'block';
        } else {
            soundIconOn.style.display = 'block';
            soundIconOff.style.display = 'none';
        }
    }

    // ==========================================================================
    // Input Handling
    // ==========================================================================
    function handleFlapInput(e) {
        if (e) {
            if (e.target.closest('button')) {
                return;
            }
            if (e.type === 'keydown' && e.code !== 'Space') {
                return;
            }
            e.preventDefault();
        }

        window.soundManager.init();

        if (currentState === STATE.START) {
            startGame();
        } else if (currentState === STATE.PLAYING) {
            bird.flap();
        } else if (currentState === STATE.GAMEOVER && !gameOverScreen.classList.contains('hidden')) {
            if (e && e.type === 'keydown' && e.code === 'Space') {
                startGame();
            }
        }
    }

    // Event Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleFlapInput(e);
        }
    });

    gameContainer.addEventListener('pointerdown', (e) => {
        handleFlapInput(e);
    });

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });

    restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });

    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.soundManager.init();
        window.soundManager.toggleMute();
        updateSoundIcons();
        window.soundManager.playClick();
    });

    themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.soundManager.init();
        window.soundManager.playClick();
        cycleTheme();
    });

    // Skin Picker
    skinPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.skin-btn');
        if (!btn) return;
        e.stopPropagation();
        window.soundManager.init();
        window.soundManager.playClick();
        applySkin(btn.getAttribute('data-skin'));
    });

    // Difficulty Picker
    difficultyPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.diff-tab');
        if (!btn) return;
        e.stopPropagation();
        window.soundManager.init();
        window.soundManager.playClick();
        applyDifficulty(btn.getAttribute('data-diff'));
    });

    // ==========================================================================
    // Main Game Loop
    // ==========================================================================
    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;
        lastTime = timestamp;

        const deltaTimeFactor = Math.min(2.5, elapsed / 16.666) || 1;

        ctx.save();

        if (screenShake > 0) {
            const offsetX = (Math.random() - 0.5) * screenShake;
            const offsetY = (Math.random() - 0.5) * screenShake;
            ctx.translate(offsetX, offsetY);
            screenShake *= 0.85;
            if (screenShake < 0.5) screenShake = 0;
        }

        // Draw World
        ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        drawSky();
        updateAndDrawClouds(deltaTimeFactor);
        drawHills(deltaTimeFactor);

        // State Updates
        if (currentState === STATE.PLAYING) {
            updatePipes(deltaTimeFactor);
            bird.update(deltaTimeFactor);
            checkCollisions();
        } else if (currentState === STATE.START) {
            bird.update(deltaTimeFactor);
        } else if (currentState === STATE.GAMEOVER) {
            if (bird.y + bird.radius < PLAYABLE_HEIGHT) {
                bird.velocity += currentDiff.gravity * deltaTimeFactor;
                bird.y += bird.velocity * deltaTimeFactor;
                bird.rotation = Math.min(1.5, bird.rotation + 0.08);
            }
        }

        // Draw Entities
        drawPipes();
        drawGround(deltaTimeFactor);
        updateParticles();
        drawParticles();
        bird.draw();

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    // Initialization
    applySkin(localStorage.getItem('flappy_skin') || 'classic');
    applyDifficulty(currentDiffKey);
    updateThemeUI();
    updateSoundIcons();
    bestScoreEl.textContent = bestScore.toString();
    hudScore.style.display = 'none';

    requestAnimationFrame(gameLoop);

})();
