class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 360;
        this.canvas.height = 500;

        this.score = 0;
        this.lives = 3;

        this.isRunning = true;
        this.isPaused = false;

        this.player = {
            x: this.canvas.width / 2 - 20,
            y: this.canvas.height - 40,
            width: 40,
            height: 20,
            speed: 6
        };

        this.bullets = [];
        this.keys = {};

        this.statusElement = document.getElementById("status");

        this.setupKeyboard();
        this.setupTouch();
        this.start();
    }

    start() {
        this.statusElement.textContent = "Defend Earth!";
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);

        this.autoFire = setInterval(() => {
            if (!this.isPaused) this.shoot();
        }, 120);
    }

    setupKeyboard() {
        window.addEventListener("keydown", e => {
            this.keys[e.key] = true;
            if (e.key === " ") this.togglePause();
        });
        window.addEventListener("keyup", e => {
            this.keys[e.key] = false;
        });
    }

    setupTouch() {
        const left = document.getElementById("leftBtn");
        const right = document.getElementById("rightBtn");
        const pause = document.getElementById("pauseBtn");

        if (!left || !right || !pause) return;

        left.ontouchstart = () => this.keys.left = true;
        left.ontouchend = () => this.keys.left = false;

        right.ontouchstart = () => this.keys.right = true;
        right.ontouchend = () => this.keys.right = false;

        pause.onclick = () => this.togglePause();
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
            speed: 8
        });
    }

    update() {
        if (this.isPaused) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.movePlayer();
        this.updateBullets();
        this.drawPlayer();
        this.drawBullets();
    }

    movePlayer() {
        if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys.left) {
            this.player.x -= this.player.speed;
        }
        if (this.keys["ArrowRight"] || this.keys["d"] || this.keys.right) {
            this.player.x += this.player.speed;
        }

        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
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
}

window.spaceInvadersGame = new SpaceInvadersGame();
