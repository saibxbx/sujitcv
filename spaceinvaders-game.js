// Space Invaders Game - PS1 Style
class SpaceInvadersGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameLoop = null;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isRunning = false;
        this.isPaused = false;

        // Player
        this.player = {
            x: 200,
            y: 360,
            width: 30,
            height: 20,
            speed: 5
        };

        // Bullets
        this.bullets = [];
        this.enemyBullets = [];

        // Enemies
        this.enemies = [];
        this.enemyDirection = 1;
        this.enemySpeed = 1;

        // Controls
        this.keys = {};

        this.initEnemies();
    }

    initEnemies() {
        this.enemies = [];
        const rows = 4;
        const cols = 8;
        const spacing = 50;
        const startX = 50;
        const startY = 50;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: 30,
                    height: 20,
                    alive: true,
                    type: row % 3
                });
            }
        }
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector('#spaceInvadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = windowElement.querySelector('#spaceInvadersScore');
        this.levelElement = windowElement.querySelector('#spaceInvadersLevel');
        this.livesElement = windowElement.querySelector('#spaceInvadersLives');
        this.statusElement = windowElement.querySelector('#spaceInvadersStatus');
        this.windowElement = windowElement;

        this.setupControls();
        this.setupMobileControls();
        this.reset();
    }

    setupMobileControls() {
        const mobileControls = this.windowElement.querySelector('#spaceinvadersMobileControls');
        if (!mobileControls) return;

        // Left button
        const leftBtn = mobileControls.querySelector('#siMoveLeft');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                    return;
                }
                this.keys['ArrowLeft'] = true;
            }, { passive: false });

            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
            }, { passive: false });
        }

        // Right button
        const rightBtn = mobileControls.querySelector('#siMoveRight');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                    return;
                }
                this.keys['ArrowRight'] = true;
            }, { passive: false });

            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
            }, { passive: false });
        }

        // Fire button
        const fireBtn = mobileControls.querySelector('#siFireBtn');
        if (fireBtn) {
            fireBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                } else if (!this.isPaused) {
                    this.shoot();
                }
            }, { passive: false });
        }

        // Also allow tapping on canvas to start
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isRunning) {
                this.start();
            }
        }, { passive: false });
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.canvas) return;

            this.keys[e.key] = true;

            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                } else if (!this.isPaused) {
                    this.shoot();
                }
            }

            if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                if (this.isRunning) {
                    this.togglePause();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.statusElement.textContent = 'Defend Earth!';
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused ? 'Paused - Press P to resume' : 'Defend Earth!';
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.player.x = 200;
        this.bullets = [];
        this.enemyBullets = [];
        this.enemySpeed = 1;
        this.initEnemies();
        this.updateUI();
        this.draw();
    }

    shoot() {
        if (this.bullets.length < 3) {
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
        if (this.isPaused || !this.isRunning) return;

        // Move player
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }

        // Move bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });

        // Move enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height;
        });

        // Move enemies
        let moveDown = false;
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            enemy.x += this.enemyDirection * this.enemySpeed;

            if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
                moveDown = true;
            }
        });

        if (moveDown) {
            this.enemyDirection *= -1;
            this.enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.y += 20;
                    if (enemy.y + enemy.height >= this.player.y) {
                        this.gameOver();
                    }
                }
            });
        }

        // Enemy shooting
        if (Math.random() < 0.02) {
            const aliveEnemies = this.enemies.filter(e => e.alive);
            if (aliveEnemies.length > 0) {
                const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                this.enemyBullets.push({
                    x: shooter.x + shooter.width / 2 - 2,
                    y: shooter.y + shooter.height,
                    width: 4,
                    height: 10,
                    speed: 3
                });
            }
        }

        // Check collisions
        this.checkCollisions();

        // Check win condition
        if (this.enemies.every(e => !e.alive)) {
            this.nextLevel();
        }

        this.draw();
        this.updateUI();
    }

    checkCollisions() {
        // Bullet hits enemy
        this.bullets.forEach((bullet, bIndex) => {
            this.enemies.forEach(enemy => {
                if (enemy.alive &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    enemy.alive = false;
                    this.bullets.splice(bIndex, 1);
                    this.score += (enemy.type + 1) * 10;
                }
            });
        });

        // Enemy bullet hits player
        this.enemyBullets.forEach((bullet, bIndex) => {
            if (bullet.x < this.player.x + this.player.width &&
                bullet.x + bullet.width > this.player.x &&
                bullet.y < this.player.y + this.player.height &&
                bullet.y + bullet.height > this.player.y) {
                this.enemyBullets.splice(bIndex, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    draw() {
        // Background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 53) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }

        // Player
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#00AA00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y);
        this.ctx.lineTo(this.player.x + this.player.width / 2, this.player.y - 10);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y);
        this.ctx.fill();

        // Player bullets
        this.ctx.fillStyle = '#FFFF00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Enemy bullets
        this.ctx.fillStyle = '#FF0000';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Enemies
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const colors = ['#FF00FF', '#00FFFF', '#FFFF00'];
            this.ctx.fillStyle = colors[enemy.type];

            // Draw alien shape
            this.ctx.fillRect(enemy.x + 5, enemy.y, 20, 15);
            this.ctx.fillRect(enemy.x, enemy.y + 5, 30, 10);
            this.ctx.fillRect(enemy.x + 5, enemy.y + 15, 5, 5);
            this.ctx.fillRect(enemy.x + 20, enemy.y + 15, 5, 5);
        });

        // Ground line
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 10);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 10);
        this.ctx.stroke();
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.livesElement.textContent = this.lives;
    }

    nextLevel() {
        this.level++;
        this.enemySpeed += 0.5;
        this.bullets = [];
        this.enemyBullets = [];
        this.initEnemies();
        this.statusElement.textContent = `Level ${this.level}!`;
        setTimeout(() => {
            if (this.isRunning) {
                this.statusElement.textContent = 'Defend Earth!';
            }
        }, 2000);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.statusElement.textContent = 'Game Over! Press SPACE to restart';
        setTimeout(() => this.reset(), 2000);
    }
}

// Initialize Space Invaders Game
window.spaceInvadersGame = new SpaceInvadersGame();
