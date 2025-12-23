// Pac-Man Game - PS1 Style
class PacManGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameLoop = null;
        this.score = 0;
        this.lives = 3;
        this.isRunning = false;
        this.isPaused = false;

        // Grid settings
        this.gridSize = 20;
        this.cols = 20;
        this.rows = 20;

        // Pac-Man
        this.pacman = {
            x: 10,
            y: 10,
            direction: 'right',
            nextDirection: 'right',
            mouthOpen: true
        };

        // Ghosts
        this.ghosts = [
            { x: 8, y: 8, color: '#FF0000', direction: 'right' },
            { x: 11, y: 8, color: '#FFB8FF', direction: 'left' },
            { x: 8, y: 11, color: '#00FFFF', direction: 'up' },
            { x: 11, y: 11, color: '#FFB852', direction: 'down' }
        ];

        // Maze and dots
        this.maze = [];
        this.dots = [];
        this.powerPellets = [];
        this.powerMode = false;
        this.powerModeTimer = 0;

        this.initMaze();
    }

    initMaze() {
        // Simple maze layout (1 = wall, 0 = path)
        const layout = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.maze = layout;

        // Place dots and power pellets
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze[y][x] === 0) {
                    // Power pellets in corners
                    if ((x === 1 && y === 1) || (x === 18 && y === 1) ||
                        (x === 1 && y === 18) || (x === 18 && y === 18)) {
                        this.powerPellets.push({ x, y });
                    } else {
                        this.dots.push({ x, y });
                    }
                }
            }
        }
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector('#pacmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = windowElement.querySelector('#pacmanScore');
        this.livesElement = windowElement.querySelector('#pacmanLives');
        this.statusElement = windowElement.querySelector('#pacmanStatus');

        this.setupControls();
        this.reset();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.canvas) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                } else {
                    this.togglePause();
                }
            }

            if (this.isRunning && !this.isPaused) {
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        this.pacman.nextDirection = 'up';
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.pacman.nextDirection = 'down';
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.pacman.nextDirection = 'left';
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.pacman.nextDirection = 'right';
                        break;
                }
            }
        });
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.statusElement.textContent = 'Playing!';
        this.gameLoop = setInterval(() => this.update(), 150);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.statusElement.textContent = this.isPaused ? 'Paused' : 'Playing!';
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.pacman = { x: 10, y: 10, direction: 'right', nextDirection: 'right', mouthOpen: true };
        this.initMaze();
        this.updateUI();
        this.draw();
    }

    update() {
        if (this.isPaused || !this.isRunning) return;

        // Update power mode timer
        if (this.powerMode) {
            this.powerModeTimer--;
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;
            }
        }

        // Move Pac-Man
        this.movePacman();

        // Move ghosts
        this.moveGhosts();

        // Check collisions
        this.checkCollisions();

        // Toggle mouth animation
        this.pacman.mouthOpen = !this.pacman.mouthOpen;

        this.draw();
        this.updateUI();

        // Check win condition
        if (this.dots.length === 0 && this.powerPellets.length === 0) {
            this.win();
        }
    }

    movePacman() {
        const newX = this.pacman.x + this.getDirectionOffset(this.pacman.nextDirection).x;
        const newY = this.pacman.y + this.getDirectionOffset(this.pacman.nextDirection).y;

        if (this.isValidMove(newX, newY)) {
            this.pacman.direction = this.pacman.nextDirection;
            this.pacman.x = newX;
            this.pacman.y = newY;
        } else {
            const currentX = this.pacman.x + this.getDirectionOffset(this.pacman.direction).x;
            const currentY = this.pacman.y + this.getDirectionOffset(this.pacman.direction).y;
            if (this.isValidMove(currentX, currentY)) {
                this.pacman.x = currentX;
                this.pacman.y = currentY;
            }
        }

        // Wrap around
        if (this.pacman.x < 0) this.pacman.x = this.cols - 1;
        if (this.pacman.x >= this.cols) this.pacman.x = 0;
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            const directions = ['up', 'down', 'left', 'right'];
            const validDirections = directions.filter(dir => {
                const offset = this.getDirectionOffset(dir);
                return this.isValidMove(ghost.x + offset.x, ghost.y + offset.y);
            });

            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }

            const offset = this.getDirectionOffset(ghost.direction);
            ghost.x += offset.x;
            ghost.y += offset.y;
        });
    }

    getDirectionOffset(direction) {
        switch (direction) {
            case 'up': return { x: 0, y: -1 };
            case 'down': return { x: 0, y: 1 };
            case 'left': return { x: -1, y: 0 };
            case 'right': return { x: 1, y: 0 };
            default: return { x: 0, y: 0 };
        }
    }

    isValidMove(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return true; // Wrap around
        return this.maze[y][x] === 0;
    }

    checkCollisions() {
        // Check dots
        this.dots = this.dots.filter(dot => {
            if (dot.x === this.pacman.x && dot.y === this.pacman.y) {
                this.score += 10;
                return false;
            }
            return true;
        });

        // Check power pellets
        this.powerPellets = this.powerPellets.filter(pellet => {
            if (pellet.x === this.pacman.x && pellet.y === this.pacman.y) {
                this.score += 50;
                this.powerMode = true;
                this.powerModeTimer = 30;
                return false;
            }
            return true;
        });

        // Check ghosts
        this.ghosts.forEach(ghost => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (this.powerMode) {
                    this.score += 200;
                    ghost.x = 10;
                    ghost.y = 10;
                } else {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.pacman.x = 10;
                        this.pacman.y = 10;
                    }
                }
            }
        });
    }

    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        this.ctx.fillStyle = '#0000FF';
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }

        // Draw dots
        this.ctx.fillStyle = '#FFB852';
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(
                dot.x * this.gridSize + this.gridSize / 2,
                dot.y * this.gridSize + this.gridSize / 2,
                2, 0, Math.PI * 2
            );
            this.ctx.fill();
        });

        // Draw power pellets
        this.ctx.fillStyle = '#FFFFFF';
        this.powerPellets.forEach(pellet => {
            this.ctx.beginPath();
            this.ctx.arc(
                pellet.x * this.gridSize + this.gridSize / 2,
                pellet.y * this.gridSize + this.gridSize / 2,
                5, 0, Math.PI * 2
            );
            this.ctx.fill();
        });

        // Draw Pac-Man
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        const pacX = this.pacman.x * this.gridSize + this.gridSize / 2;
        const pacY = this.pacman.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;

        if (this.pacman.mouthOpen) {
            const angle = this.getAngle(this.pacman.direction);
            this.ctx.arc(pacX, pacY, radius, angle + 0.2, angle - 0.2);
            this.ctx.lineTo(pacX, pacY);
        } else {
            this.ctx.arc(pacX, pacY, radius, 0, Math.PI * 2);
        }
        this.ctx.fill();

        // Draw ghosts
        this.ghosts.forEach(ghost => {
            this.ctx.fillStyle = this.powerMode ? '#0000FF' : ghost.color;
            const gX = ghost.x * this.gridSize + this.gridSize / 2;
            const gY = ghost.y * this.gridSize + this.gridSize / 2;

            this.ctx.beginPath();
            this.ctx.arc(gX, gY, radius, Math.PI, 0);
            this.ctx.lineTo(gX + radius, gY + radius);
            this.ctx.lineTo(gX, gY + radius - 3);
            this.ctx.lineTo(gX - radius, gY + radius);
            this.ctx.closePath();
            this.ctx.fill();

            // Eyes
            if (!this.powerMode) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(gX - 5, gY - 3, 4, 4);
                this.ctx.fillRect(gX + 1, gY - 3, 4, 4);
                this.ctx.fillStyle = '#0000FF';
                this.ctx.fillRect(gX - 4, gY - 2, 2, 2);
                this.ctx.fillRect(gX + 2, gY - 2, 2, 2);
            }
        });
    }

    getAngle(direction) {
        switch (direction) {
            case 'right': return 0;
            case 'down': return Math.PI / 2;
            case 'left': return Math.PI;
            case 'up': return -Math.PI / 2;
            default: return 0;
        }
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.statusElement.textContent = 'Game Over! Press SPACE to restart';
        setTimeout(() => this.reset(), 2000);
    }

    win() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.statusElement.textContent = 'You Win! Press SPACE to play again';
        setTimeout(() => this.reset(), 2000);
    }
}

// Initialize Pac-Man Game
window.pacmanGame = new PacManGame();
