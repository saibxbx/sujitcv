// Snake Game
class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.tileCount = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector('#snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = windowElement.querySelector('#snakeScore');
        this.statusElement = windowElement.querySelector('#snakeStatus');

        this.setupControls();
        this.draw();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.canvas) return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
                return;
            }

            if (this.isPaused || !this.isRunning) {
                if (e.code === 'Space') {
                    this.start();
                }
                return;
            }

            switch (e.code) {
                case 'ArrowUp':
                    if (this.dy === 0) { this.dx = 0; this.dy = -1; }
                    break;
                case 'ArrowDown':
                    if (this.dy === 0) { this.dx = 0; this.dy = 1; }
                    break;
                case 'ArrowLeft':
                    if (this.dx === 0) { this.dx = -1; this.dy = 0; }
                    break;
                case 'ArrowRight':
                    if (this.dx === 0) { this.dx = 1; this.dy = 0; }
                    break;
            }
        });
    }

    start() {
        if (this.isRunning && !this.isPaused) return;

        if (!this.isRunning) {
            this.reset();
        }

        this.isRunning = true;
        this.isPaused = false;
        this.statusElement.textContent = 'Playing...';
        this.gameLoop = setInterval(() => this.update(), 150);
    }

    togglePause() {
        if (!this.isRunning) {
            this.start();
            return;
        }

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            clearInterval(this.gameLoop);
            this.statusElement.textContent = 'Paused';
        } else {
            this.statusElement.textContent = 'Playing...';
            this.gameLoop = setInterval(() => this.update(), 150);
        }
    }

    reset() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.placeFood();
    }

    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.placeFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    placeFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#00ff00' : '#00cc00';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        this.isPaused = false;
        this.statusElement.textContent = `Game Over! Score: ${this.score} - Press SPACE to restart`;
    }
}

window.snakeGame = new SnakeGame();
