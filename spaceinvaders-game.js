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
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector('#spaceInvadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = windowElement.querySelector('#spaceInvadersScore');
        this.levelElement = windowElement.querySelector('#spaceInvadersLevel');
        this.livesElement = windowElement.querySelector('#spaceInvadersLives');
        this.statusElement = windowElement.querySelector('#spaceInvadersStatus');

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
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.isRunning) {
                this.start();
                e.preventDefault();
                return;
            }

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;

            if (x < rect.width / 3) {
                this.keys['ArrowLeft'] = true;
            } else if (x > (rect.width * 2) / 3) {
                this.keys['ArrowRight'] = true;
            } else {
                this.shoot();
            }
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
            e.preventDefault();
        }, { passive: false });
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
        if (this.bullets.length < 5) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 7
            });
        }
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
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

        // Random invader shoot
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
        // Player bullets vs Invaders
        this.bullets.forEach(b => {
            this.invaders.forEach(i => {
                if (i.alive && b.x < i.x + i.width && b.x + b.width > i.x && b.y < i.y + i.height && b.y + b.height > i.y) {
                    i.alive = false;
                    b.y = -100; // Remove bullet
                    this.score += 100;
                }
            });
        });

        // Invader bullets vs Player
        this.invaderBullets.forEach(b => {
            if (b.x < this.player.x + this.player.width && b.x + b.width > this.player.x && b.y < this.player.y + this.player.height && b.y + b.height > this.player.y) {
                this.lives--;
                b.y = this.canvas.height + 100; // Remove bullet
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
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

