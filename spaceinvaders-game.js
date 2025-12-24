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
        this.enemies = [];
        this.enemySpeed = 0.5;

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
        document.addEventListener("keydown", e => {
            if (!this.isRunning) return;
            this.keys[e.code] = true;
            if (e.code === "Space") this.shoot();
            if (e.code === "KeyP") this.togglePause();
        });

        document.addEventListener("keyup", e => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener("click", e => {
            const x = e.clientX - this.rect.left;
            if (x < this.canvas.width / 3) this.player.x -= 20;
            else if (x > this.canvas.width * 2 / 3) this.player.x += 20;
            else this.shoot();
        });
    }

    resizeCanvas() {
        this.rect = this.canvas.getBoundingClientRect();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.bullets = [];
        this.createEnemies();

        this.statusElement.textContent = "Defend Earth!";

        clearInterval(this.gameLoop);
        clearInterval(this.autoFireInterval);

        this.gameLoop = setInterval(() => this.update(), 1000 / 60);

        this.autoFireInterval = setInterval(() => {
            if (!this.isPaused) this.shoot();
        }, 200);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused
            ? "Paused"
            : "Defend Earth!";
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

    createEnemies() {
        this.enemies = [];
        const rows = 3;
        const cols = 8;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: 50 + c * 60,
                    y: 40 + r * 40,
                    width: 40,
                    height: 20,
                    alive: true
                });
            }
        }
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        if (this.keys["ArrowLeft"])
            this.player.x = Math.max(0, this.player.x - this.player.speed);

        if (this.keys["ArrowRight"])
            this.player.x = Math.min(
                this.canvas.width - this.player.width,
                this.player.x + this.player.speed
            );

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateBullets();
        this.updateEnemies();

        this.drawEnemies();
        this.drawPlayer();
        this.drawBullets();
        this.drawUI();
    }

    updateBullets() {
        this.bullets.forEach(b => (b.y -= b.speed));
        this.bullets = this.bullets.filter(b => b.y > -10);
    }

    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            enemy.y += this.enemySpeed;

            if (
                enemy.x < this.player.x + this.player.width &&
                enemy.x + enemy.width > this.player.x &&
                enemy.y < this.player.y + this.player.height &&
                enemy.y + enemy.height > this.player.y
            ) {
                enemy.alive = false;
                this.lives--;
                if (this.lives <= 0) this.gameOver();
            }

            this.bullets.forEach(b => {
                if (
                    b.x < enemy.x + enemy.width &&
                    b.x + b.width > enemy.x &&
                    b.y < enemy.y + enemy.height &&
                    b.y + b.height > enemy.y
                ) {
                    enemy.alive = false;
                    b.y = -20;
                    this.score += 10;
                }
            });
        });

        this.enemies = this.enemies.filter(e => e.alive);

        if (this.enemies.length === 0) {
            this.level++;
            this.enemySpeed += 0.3;
            this.createEnemies();
        }
    }

    drawPlayer() {
        this.ctx.fillStyle = "lime";
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
    }

    drawBullets() {
        this.ctx.fillStyle = "cyan";
        this.bullets.forEach(b =>
            this.ctx.fillRect(b.x, b.y, b.width, b.height)
        );
    }

    drawEnemies() {
        this.ctx.fillStyle = "red";
        this.enemies.forEach(e => {
            if (e.alive)
                this.ctx.fillRect(e.x, e.y, e.width, e.height);
        });
    }

    drawUI() {
        this.ctx.fillStyle = "#0f0";
        this.ctx.font = "16px monospace";
        this.ctx.fillText(
            `Score: ${this.score}  Level: ${this.level}  Lives: ${this.lives}`,
            10,
            20
        );
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        clearInterval(this.autoFireInterval);
        this.statusElement.textContent = `Game Over! Score: ${this.score}`;
    }
}

window.spaceInvadersGame = new SpaceInvadersGame();
