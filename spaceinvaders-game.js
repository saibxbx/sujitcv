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
        this.statusElement.textContent = "Defend Earth! Score: 0";

        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.autoFireInterval) clearInterval(this.autoFireInterval);

        this.gameLoop = setInterval(() => this.update(), 1000 / 60);

        this.autoFireInterval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                this.shoot();
            }
        }, 150);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused
            ? "Paused (P to resume)"
            : `Defend Earth! Score: ${this.score}`;
    }

    shoot() {
        if (this.isPaused) return;
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

        if (this.keys['ArrowLeft'] || this.touchZones.left) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.touchZones.right) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateBullets();
        this.drawPlayer();
        this.drawBullets();
        this.drawUI();
    }

    updateBullets() {
        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > -10);
    }

    drawPlayer() {
        this.ctx.fillStyle = "lime";
        this.ctx.shadowColor = "lime";
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
    }

    drawBullets() {
        this.ctx.fillStyle = "cyan";
        this.ctx.shadowColor = "cyan";
        this.ctx.shadowBlur = 5;
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });
        this.ctx.shadowBlur = 0;
    }

    drawUI() {
        this.ctx.fillStyle = "#0f0";
        this.ctx.font = "16px monospace";
        this.ctx.fillText(`Score: ${this.score} | Lvl: ${this.level} | Lives: ${this.lives}`, 10, 20);

        this.ctx.strokeStyle = "rgba(0,255,0,0.1)";
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

