class SpaceInvadersGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;

        this.player = {
            x: 0,
            y: 0,
            width: 40,
            height: 20,
            speed: 5
        };

        this.bullets = [];
        this.invaderBullets = [];
        this.invaders = [];
        this.invaderDirection = 1;
        this.invaderStep = 10;
        this.invaderMoveCounter = 0;
        this.invaderMoveDelay = 40;

        this.keys = {};
        this.lastShotTime = 0; // Rate limiting for shooting
        this.touchingLeft = false;
        this.touchingRight = false;
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector('#spaceInvadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = windowElement.querySelector('#spaceInvadersScore');
        this.levelElement = windowElement.querySelector('#spaceInvadersLevel');
        this.livesElement = windowElement.querySelector('#spaceInvadersLives');
        this.statusElement = windowElement.querySelector('#spaceInvadersStatus');

        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }

        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - 40;

        this.setupControls();
        this.setupMobileControls();
        this.reset();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.canvas) return;
            this.keys[e.code] = true;

            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                } else if (!this.isPaused) {
                    this.shoot();
                }
            }

            if (e.code === 'KeyP' && this.isRunning) {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupMobileControls() {
        // Touch events with proper preventDefault and passive: false
        const handleTouchStart = (e) => {
            e.preventDefault();
            this.handleTouch(e);
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            this.handleTouch(e);
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            this.touchingLeft = false;
            this.touchingRight = false;
        };

        this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        // Also handle mouse for hybrid PC/touch testing
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleMouse(e);
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left button held
                e.preventDefault();
                this.handleMouse(e);
            }
        });
        this.canvas.addEventListener('mouseup', () => {
            this.touchingLeft = false;
            this.touchingRight = false;
        });
    }

    handleTouch(e) {
        if (!this.isRunning || this.isPaused) {
            if (e.touches.length === 1) this.start(); // Single tap to start
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);

        const third = this.canvas.width / 3;
        this.touchingLeft = x < third;
        this.touchingRight = x > (2 * third);
    }

    handleMouse(e) {
        if (!this.isRunning || this.isPaused) {
            this.start();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);

        const third = this.canvas.width / 3;
        this.touchingLeft = x < third;
        this.touchingRight = x > (2 * third);
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isRunning = false;
        this.isPaused = false;
        this.bullets = [];
        this.invaderBullets = [];
        this.createInvaders();
        this.updateUI();
        this.draw();
    }

    createInvaders() {
        this.invaders = [];
        const rows = 3 + Math.min(this.level, 3);
        const cols = 8;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.invaders.push({
                    x: 50 + x * 45,
                    y: 50 + y * 30,
                    width: 30,
                    height: 20,
                    alive: true
                });
            }
        }
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.statusElement.textContent = "Defend Earth!";
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused ? "Paused" : "Defend Earth!";
    }

    shoot() {
        if (!this.isRunning || this.isPaused) return;
        const now = Date.now();
        if (now - this.lastShotTime < 200 || this.bullets.length >= 5) return; // Rate limit
        this.lastShotTime = now;

        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // Player movement - hybrid keyboard + touch
        if (this.keys['ArrowLeft'] || this.touchingLeft) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.touchingRight) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }

        // Auto-shoot on center touch (mobile)
        if (this.isRunning && !this.isPaused && (this.keys['Space'] || (this.touchingLeft === false && this.touchingRight === false && Date.now() - this.lastShotTime > 300))) {
            this.shoot();
        }

        this.updateBullets();
        this.updateInvaders();
        this.checkCollisions();
        this.draw();
        this.updateUI();

        if (this.invaders.every(i => !i.alive)) {
            this.nextLevel();
        }
    }

    updateBullets() {
        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > 0);

        this.invaderBullets.forEach(b => b.y += b.speed);
        this.invaderBullets = this.invaderBullets.filter(b => b.y < this.canvas.height);

        if (Math.random() < 0.02 + (this.level * 0.01)) {
            const aliveInvaders = this.invaders.filter(i => i.alive);
            if (aliveInvaders.length > 0) {
                const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
                this.invaderBullets.push({
                    x: shooter.x + shooter.width / 2,
                    y: shooter.y + shooter.height,
                    width: 4,
                    height: 10,
                    speed: 3 + this.level
                });
            }
        }
    }

    updateInvaders() {
        this.invaderMoveCounter++;
        if (this.invaderMoveCounter >= Math.max(10, this.invaderMoveDelay - (this.level * 5))) {
            this.invaderMoveCounter = 0;
            let edgeReached = false;

            this.invaders.forEach(i => {
                if (i.alive) {
                    i.x += this.invaderDirection * this.invaderStep;
                    if (i.x <= 0 || i.x >= this.canvas.width - i.width) {
                        edgeReached = true;
                    }
                }
            });

            if (edgeReached) {
                this.invaderDirection *= -1;
                this.invaders.forEach(i => {
                    i.y += 20;
                    if (i.y + i.height >= this.player.y && i.alive) {
                        this.gameOver();
                    }
                });
            }
        }
    }

    checkCollisions() {
        this.bullets.forEach((b, bIndex) => {
            this.invaders.forEach(i => {
                if (i.alive &&
                    b.x < i.x + i.width &&
                    b.x + b.width > i.x &&
                    b.y < i.y + i.height &&
                    b.y + b.height > i.y) {
                    i.alive = false;
                    this.bullets[bIndex] = null; // Mark for removal
                    this.score += 100;
                }
            });
        });
        this.bullets = this.bullets.filter(b => b !== null);

        this.invaderBullets.forEach((b, bIndex) => {
            if (b.x < this.player.x + this.player.width &&
                b.x + b.width > this.player.x &&
                b.y < this.player.y + this.player.height &&
                b.y + b.height > this.player.y) {
                this.lives--;
                this.invaderBullets[bIndex] = null;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        this.invaderBullets = this.invaderBullets.filter(b => b !== null);
    }

    nextLevel() {
        this.level++;
        this.bullets = [];
        this.invaderBullets = [];
        this.createInvaders();
        this.statusElement.textContent = "Level Up!";
        this.invaderMoveDelay = Math.max(10, this.invaderMoveDelay - 5);
    }

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Player
        this.ctx.fillStyle = "lime";
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Invaders
        this.ctx.fillStyle = "white";
        this.invaders.forEach(i => {
            if (i.alive) {
                this.ctx.fillRect(i.x, i.y, i.width, i.height);
            }
        });

        // Bullets
        this.ctx.fillStyle = "yellow";
        this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));

        this.ctx.fillStyle = "red";
        this.invaderBullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));

        // Touch zone feedback (debug - remove in production)
        if (this.touchingLeft) {
            this.ctx.fillStyle = "rgba(0,255,0,0.2)";
            this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width / 3, 60);
        }
        if (this.touchingRight) {
            this.ctx.fillStyle = "rgba(255,0,0,0.2)";
            this.ctx.fillRect(2 * this.canvas.width / 3, this.canvas.height - 60, this.canvas.width / 3, 60);
        }
    }

    updateUI() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.levelElement) this.levelElement.textContent = this.level;
        if (this.livesElement) this.livesElement.textContent = this.lives;
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.statusElement.textContent = "Game Over! Final Score: " + this.score;
    }
}

window.spaceInvadersGame = new SpaceInvadersGame();
