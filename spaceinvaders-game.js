class SpaceInvadersGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.rect = null;

        this.score = 0;
        this.level = 1;
        this.lives = 3;

        this.isRunning = false;
        this.isPaused = false;

        this.gameLoop = null;
        this.autoFireInterval = null;

        this.player = {
            x: 0,
            y: 0,
            width: 40,
            height: 20,
            speed: 5
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.invaders = [];
        this.invaderDirection = 1;
        this.invaderSpeed = 1;
        this.invaderStepDown = 15;

        this.keys = {};
        this.touchZones = { left: false, center: false, right: false };

        this.statusElement = null;
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector("#spaceInvadersCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.statusElement = windowElement.querySelector("#spaceInvadersStatus");

        this.player.x = this.canvas.width / 2 - 20;
        this.player.y = this.canvas.height - 40;

        this.setupControls();
        this.resizeCanvas();
        this.start();
    }

    setupControls() {
        // Remove old listeners if any (though usually not an issue with window-based apps)
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            this.keys[e.code] = true;
            if (e.code === 'Space') this.shoot();
            if (e.code === 'KeyP') this.togglePause();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e, true));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e, true));
        this.canvas.addEventListener('touchend', (e) => this.handleTouch(e, false));

        this.canvas.addEventListener('click', (e) => {
            if (!this.isRunning) return;
            const x = e.clientX - this.rect.left;
            if (x < this.canvas.width / 3) this.player.x -= 20;
            else if (x > this.canvas.width * 2 / 3) this.player.x += 20;
            else this.shoot();
        });
    }

    handleTouch(e, isDown) {
        if (!this.isRunning) return;
        e.preventDefault();
        this.rect = this.canvas.getBoundingClientRect();

        Array.from(e.changedTouches).forEach(touch => {
            const x = touch.clientX - this.rect.left;
            const zoneWidth = this.canvas.width / 3;

            if (x < zoneWidth) this.touchZones.left = isDown;
            else if (x < zoneWidth * 2) {
                this.touchZones.center = isDown;
                if (isDown) this.shoot();
            } else {
                this.touchZones.right = isDown;
            }
        });
    }

    resizeCanvas() {
        if (this.canvas) {
            this.rect = this.canvas.getBoundingClientRect();
        }
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.bullets = [];
        this.enemyBullets = [];
        this.invaderSpeed = 1;
        this.initInvaders();
        this.statusElement.textContent = "Defend Earth! Score: 0";

        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.autoFireInterval) clearInterval(this.autoFireInterval);

        this.gameLoop = setInterval(() => this.update(), 1000 / 60);

        this.autoFireInterval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                this.shoot();
            }
        }, 200);
    }

    initInvaders() {
        this.invaders = [];
        const rows = 4;
        const cols = 8;
        const padding = 10;
        const width = 30;
        const height = 20;
        const offsetX = 50;
        const offsetY = 50;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.invaders.push({
                    x: offsetX + c * (width + padding),
                    y: offsetY + r * (height + padding),
                    width: width,
                    height: height,
                    points: (rows - r) * 10
                });
            }
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused
            ? "Paused (P to resume)"
            : `Defend Earth! Score: ${this.score}`;
    }

    shoot() {
        if (this.isPaused || !this.isRunning) return;
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }

    enemyFire() {
        if (Math.random() < 0.02 + (this.level * 0.005)) {
            const shooter = this.invaders[Math.floor(Math.random() * this.invaders.length)];
            if (shooter) {
                this.enemyBullets.push({
                    x: shooter.x + shooter.width / 2 - 2,
                    y: shooter.y + shooter.height,
                    width: 4,
                    height: 10,
                    speed: 3 + this.level
                });
            }
        }
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // Player Movement
        if (this.keys['ArrowLeft'] || this.touchZones.left) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.touchZones.right) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }

        this.updateBullets();
        this.moveInvaders();
        this.enemyFire();
        this.checkCollisions();

        if (this.invaders.length === 0) {
            this.nextLevel();
        }

        this.draw();
    }

    updateBullets() {
        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > -10);

        this.enemyBullets.forEach(b => b.y += b.speed);
        this.enemyBullets = this.enemyBullets.filter(b => b.y < this.canvas.height + 10);
    }

    moveInvaders() {
        let hitEdge = false;
        this.invaders.forEach(inv => {
            inv.x += this.invaderDirection * this.invaderSpeed;
            if (inv.x <= 0 || inv.x + inv.width >= this.canvas.width) {
                hitEdge = true;
            }
        });

        if (hitEdge) {
            this.invaderDirection *= -1;
            this.invaders.forEach(inv => {
                inv.y += this.invaderStepDown;
                if (inv.y + inv.height >= this.player.y) {
                    this.gameOver();
                }
            });
        }
    }

    checkCollisions() {
        // Player bullets vs Invaders
        this.bullets.forEach((b, bi) => {
            this.invaders.forEach((inv, ii) => {
                if (b.x < inv.x + inv.width &&
                    b.x + b.width > inv.x &&
                    b.y < inv.y + inv.height &&
                    b.y + b.height > inv.y) {
                    this.score += inv.points;
                    this.invaders.splice(ii, 1);
                    this.bullets.splice(bi, 1);
                    this.statusElement.textContent = `Defend Earth! Score: ${this.score}`;
                }
            });
        });

        // Enemy bullets vs Player
        this.enemyBullets.forEach((b, bi) => {
            if (b.x < this.player.x + this.player.width &&
                b.x + b.width > this.player.x &&
                b.y < this.player.y + this.player.height &&
                b.y + b.height > this.player.y) {
                this.enemyBullets.splice(bi, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    nextLevel() {
        this.level++;
        this.invaderSpeed += 0.5;
        this.initInvaders();
        this.bullets = [];
        this.enemyBullets = [];
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Player
        this.ctx.fillStyle = "lime";
        this.ctx.shadowColor = "lime";
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw Invaders
        this.ctx.fillStyle = "#ff00ff";
        this.ctx.shadowColor = "#ff00ff";
        this.ctx.shadowBlur = 5;
        this.invaders.forEach(inv => {
            this.ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
        });

        // Draw Player Bullets
        this.ctx.fillStyle = "cyan";
        this.ctx.shadowColor = "cyan";
        this.ctx.shadowBlur = 5;
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Draw Enemy Bullets
        this.ctx.fillStyle = "red";
        this.ctx.shadowColor = "red";
        this.ctx.shadowBlur = 5;
        this.enemyBullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        this.ctx.shadowBlur = 0;
        this.drawUI();
    }

    drawUI() {
        this.ctx.fillStyle = "#0f0";
        this.ctx.font = "14px monospace";
        this.ctx.fillText(`Score: ${this.score} | Lvl: ${this.level} | Lives: ${this.lives}`, 10, 20);

        // Draw touch zones indicators (subtle)
        this.ctx.strokeStyle = "rgba(0,255,0,0.05)";
        this.ctx.lineWidth = 1;
        const zoneWidth = this.canvas.width / 3;
        this.ctx.beginPath();
        this.ctx.moveTo(zoneWidth, 0);
        this.ctx.lineTo(zoneWidth, this.canvas.height);
        this.ctx.moveTo(zoneWidth * 2, 0);
        this.ctx.lineTo(zoneWidth * 2, this.canvas.height);
        this.ctx.stroke();
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        clearInterval(this.autoFireInterval);
        this.statusElement.textContent = `Game Over! Final Score: ${this.score}`;
    }
}

window.spaceInvadersGame = new SpaceInvadersGame();
