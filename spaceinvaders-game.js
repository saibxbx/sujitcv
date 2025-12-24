class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.score = 0;
        this.level = 1;
        this.lives = 3;

        this.isRunning = false;
        this.isPaused = false;

        this.gameLoop = null;
        this.autoFireInterval = null;

        this.player = {
            x: this.canvas.width / 2 - 20,
            y: this.canvas.height - 40,
            width: 40,
            height: 20,
            speed: 5
        };

        this.bullets = [];

        this.statusElement = document.getElementById("status");

        this.start();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.statusElement.textContent = "Defend Earth!";

        this.gameLoop = setInterval(() => this.update(), 1000 / 60);

        this.autoFireInterval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                this.shoot();
            }
        }, 100);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused ? "Paused" : "Defend Earth!";
    }

    shoot() {
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

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateBullets();
        this.drawPlayer();
        this.drawBullets();
    }

    updateBullets() {
        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > 0);
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
        this.ctx.fillStyle = "red";
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        clearInterval(this.autoFireInterval);

        this.statusElement.textContent = "Game Over!";
    }
}

window.spaceInvadersGame = new SpaceInvadersGame();
