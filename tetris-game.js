// Tetris Game
class TetrisGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.rows = 20;
        this.cols = 10;
        this.blockSize = 30;
        this.board = [];
        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;

        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]]  // Z
        ];

        this.colors = ['#00ffff', '#ffff00', '#ff00ff', '#ffa500', '#0000ff', '#00ff00', '#ff0000'];
    }

    init(windowElement) {
        this.canvas = windowElement.querySelector('#tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = windowElement.querySelector('#tetrisScore');
        this.levelElement = windowElement.querySelector('#tetrisLevel');
        this.statusElement = windowElement.querySelector('#tetrisStatus');

        this.initBoard();
        this.setupControls();
        this.draw();
    }

    initBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.canvas) return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
                return;
            }

            if (this.isPaused || !this.isRunning) return;

            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
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
        this.spawnPiece();
        this.gameLoop = setInterval(() => this.update(), 1000 / this.level);
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
            this.gameLoop = setInterval(() => this.update(), 1000 / this.level);
        }
    }

    reset() {
        this.initBoard();
        this.score = 0;
        this.level = 1;
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }

    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = {
            shape: this.pieces[pieceIndex],
            color: this.colors[pieceIndex],
            x: Math.floor(this.cols / 2) - 1,
            y: 0
        };

        if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.gameOver();
        }
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return;

        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (!this.checkCollision(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.draw();
        } else if (dy > 0) {
            this.lockPiece();
        }
    }

    rotatePiece() {
        if (!this.currentPiece) return;

        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );

        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
            this.draw();
        }
    }

    checkCollision(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }

                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        const { shape, x, y, color } = this.currentPiece;

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.board[y + row][x + col] = color;
                }
            }
        }

        this.clearLines();
        this.spawnPiece();
        this.draw();
    }

    clearLines() {
        let linesCleared = 0;

        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                row++;
            }
        }

        if (linesCleared > 0) {
            this.score += linesCleared * 100 * this.level;
            this.scoreElement.textContent = this.score;

            if (this.score >= this.level * 500) {
                this.level++;
                this.levelElement.textContent = this.level;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), 1000 / this.level);
            }
        }
    }

    update() {
        this.movePiece(0, 1);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(
                        col * this.blockSize + 1,
                        row * this.blockSize + 1,
                        this.blockSize - 2,
                        this.blockSize - 2
                    );
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            const { shape, x, y, color } = this.currentPiece;
            this.ctx.fillStyle = color;

            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        this.ctx.fillRect(
                            (x + col) * this.blockSize + 1,
                            (y + row) * this.blockSize + 1,
                            this.blockSize - 2,
                            this.blockSize - 2
                        );
                    }
                }
            }
        }

        // Draw grid
        this.ctx.strokeStyle = '#333';
        for (let row = 0; row <= this.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.blockSize);
            this.ctx.lineTo(this.canvas.width, row * this.blockSize);
            this.ctx.stroke();
        }
        for (let col = 0; col <= this.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.blockSize, 0);
            this.ctx.lineTo(col * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        this.isPaused = false;
        this.statusElement.textContent = `Game Over! Score: ${this.score} - Press SPACE to restart`;
    }
}

window.tetrisGame = new TetrisGame();
