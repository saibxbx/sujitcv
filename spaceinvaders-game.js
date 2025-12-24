class SpaceInvadersGame {
    constructor() {
        /** Game params **/
        this.fps = 60;
        this.alienMargin = 10;
        this.maxAliensPerRow = 10;
        this.speed = 2.5; // Adjusted slightly for better feel in browser
        this.playerSpeed = 3;
        this.vJump = 20;
        this.moveLimit = 0.05;
        this.framesDying = 20;

        /** State **/
        this.playing = false;
        this.currentFrame = 0;
        this.aliens = [];
        this.rightMostAlien = 0;
        this.leftMostAlien = 0;
        this.direction = 1;
        this.waitFramesToMove = 1; // Faster updates

        this.canvas = null;
        this.context = null;
        this.size = { width: 0, height: 0 };
        this.player = null;
        this.playerBullet = null;
        this.lastBulletY = null;
        this.input = null;
        this.gameLoop = null;

        // Assets fallback flags
        this.assetsLoaded = false;
        this.useFallback = true; // Use circles/rects if assets missing
    }

    init(windowElement) {
        // Reset state if already running
        this.end();

        this.canvas = windowElement.querySelector('#spaceInvadersCanvas');
        if (!this.canvas) return;

        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.context.textAlign = "center";
        this.context.font = "30px Arial";

        this.size.width = this.canvas.width;
        this.size.height = this.canvas.height;

        this.statusElement = windowElement.querySelector('#spaceInvadersStatus');

        // Setup input (one-time global or per-init?)
        // To avoid multiple listeners, we attach if not present
        if (!this.input) {
            this.input = this.setupUserInput();
        }

        this.start();
    }

    setupUserInput() {
        const state = { left: false, right: false, shoot: false, end: false };
        document.addEventListener('keydown', event => {
            if (!this.playing) return;
            switch (event.keyCode) {
                case 65: case 37: state.left = true; break;
                case 68: case 39: state.right = true; break;
                case 32: state.shoot = true; break;
                case 27: state.end = true; break;
            }
        });
        document.addEventListener('keyup', event => {
            switch (event.keyCode) {
                case 65: case 37: state.left = false; break;
                case 68: case 39: state.right = false; break;
                case 32: state.shoot = false; break;
                case 27: state.end = false; break;
            }
        });
        return state;
    }

    start() {
        this.playing = true;
        this.currentFrame = 0;
        this.aliens = [];
        this.playerBullet = null;

        if (this.statusElement) this.statusElement.textContent = "Defend Earth!";

        // Generate Aliens
        const baseAlien = this.createAlien(0, 0);
        let fitHorizontalAliens = Math.floor((this.size.width * (1 - 2 * this.moveLimit) / (baseAlien.size.width + this.alienMargin)) * 0.8);
        fitHorizontalAliens = Math.min(fitHorizontalAliens, this.maxAliensPerRow);
        let fitVerticalAliens = 4;

        let y = 30;
        this.leftMostAlien = this.size.width;
        this.rightMostAlien = 0;

        for (let i = 0; i < fitVerticalAliens; i++) {
            y += baseAlien.size.height + this.alienMargin;
            let x = this.size.width * this.moveLimit - baseAlien.size.width - this.alienMargin;
            for (let j = 0; j < fitHorizontalAliens; j++) {
                x += baseAlien.size.width + this.alienMargin;
                const newAlien = this.createAlien(x, y);
                this.aliens.push(newAlien);
                if (newAlien.position.x < this.leftMostAlien) this.leftMostAlien = newAlien.position.x;
                if (newAlien.position.x + baseAlien.size.width > this.rightMostAlien) this.rightMostAlien = newAlien.position.x + baseAlien.size.width;
            }
        }

        // Generate Player
        const pSize = this.createPlayer(0, 0).size;
        this.player = this.createPlayer(this.size.width / 2 - pSize.width / 2, this.size.height - pSize.height - 20);

        this.tick();
    }

    tick() {
        if (!this.playing) return;
        this.currentFrame++;

        if (this.input.end) { this.end(); return; }

        // Win check
        if (this.aliens.length === 0) {
            this.win();
            return;
        }

        // Alien Logic
        this.aliens = this.aliens.filter(alien => !(alien.hit && this.currentFrame - alien.frameHit >= this.framesDying));

        if (this.currentFrame % this.waitFramesToMove == 0) {
            let edgeReached = false;
            let currentRightMost = -1000;
            let currentLeftMost = 1000;

            for (let alien of this.aliens) {
                alien.position.x += this.speed * this.direction;

                const rightEdge = alien.position.x + alien.size.width;
                const leftEdge = alien.position.x;

                if (rightEdge > currentRightMost) currentRightMost = rightEdge;
                if (leftEdge < currentLeftMost) currentLeftMost = leftEdge;
            }

            this.rightMostAlien = currentRightMost;
            this.leftMostAlien = currentLeftMost;

            if ((this.rightMostAlien >= this.size.width * (1 - this.moveLimit) && this.direction > 0) ||
                (this.leftMostAlien <= this.size.width * this.moveLimit && this.direction < 0)) {
                for (let alien of this.aliens) {
                    alien.position.y += this.vJump;
                    if (alien.position.y + alien.size.height >= this.player.position.y) {
                        this.lose();
                        return;
                    }
                }
                this.direction *= -1;
            }
        }

        // Bullet Logic
        if (this.playerBullet) {
            this.lastBulletY = this.playerBullet.position.y;
            this.playerBullet.position.y -= this.playerBullet.speed;

            for (let alien of this.aliens) {
                if (this.playerBullet &&
                    this.playerBullet.position.x + this.playerBullet.size.width >= alien.position.x &&
                    this.playerBullet.position.x <= alien.position.x + alien.size.width) {
                    if (this.lastBulletY > alien.position.y + alien.size.height &&
                        this.playerBullet.position.y <= alien.position.y + alien.size.height) {
                        alien.hit = true;
                        alien.frameHit = this.currentFrame;
                        this.playerBullet = null;
                        break;
                    }
                }
            }

            if (this.playerBullet && this.playerBullet.position.y < 0) {
                this.playerBullet = null;
            }
        }

        // Player Move
        if (this.input.left && !this.input.right && this.player.position.x > 0) {
            this.player.position.x -= this.playerSpeed;
        } else if (this.input.right && !this.input.left &&
            this.player.position.x + this.player.size.width < this.size.width) {
            this.player.position.x += this.playerSpeed;
        }

        // Player Shoot
        if (this.input.shoot && !this.playerBullet) {
            this.playerBullet = this.createBullet(this.player.position.x + this.player.size.width / 2, this.player.position.y);
        }

        // Draw
        this.render();

        if (this.playing) {
            this.gameLoop = setTimeout(() => this.tick(), 1000 / this.fps);
        }
    }

    render() {
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.size.width, this.size.height);

        for (let alien of this.aliens) {
            this.renderAlien(alien);
        }

        if (this.player) this.renderPlayer(this.player);
        if (this.playerBullet) this.renderBullet(this.playerBullet);
    }

    win() {
        this.playing = false;
        this.render();
        this.context.fillStyle = "#99ffff";
        this.context.fillText("You win! :)", this.size.width / 2, this.size.height / 2);
        if (this.statusElement) this.statusElement.textContent = "Victory!";
    }

    lose() {
        this.playing = false;
        this.render();
        this.context.fillStyle = "#ff3333";
        this.context.fillText("You Lose! :(", this.size.width / 2, this.size.height / 2);
        if (this.statusElement) this.statusElement.textContent = "Defeated!";
    }

    end() {
        this.playing = false;
        if (this.gameLoop) clearTimeout(this.gameLoop);
    }

    // Factory methods to create objects like the provided code
    createAlien(x, y) {
        return {
            position: { x, y },
            size: { width: 22, height: 16 },
            hit: false,
            frameHit: null
        };
    }

    createPlayer(x, y) {
        return {
            position: { x, y },
            size: { width: 30, height: 15 }
        };
    }

    createBullet(x, y) {
        return {
            position: { x, y },
            size: { width: 3, height: 8 },
            speed: 6
        };
    }

    renderAlien(alien) {
        if (alien.hit) {
            this.context.fillStyle = "#ff0000";
        } else {
            this.context.fillStyle = "#ffffff";
        }
        // Fallback to rectangle
        this.context.fillRect(alien.position.x, alien.position.y, alien.size.width, alien.size.height);
    }

    renderPlayer(player) {
        this.context.fillStyle = "#00ff00";
        this.context.fillRect(player.position.x, player.position.y, player.size.width, player.size.height);
    }

    renderBullet(bullet) {
        this.context.fillStyle = "#ffff00";
        this.context.fillRect(bullet.position.x, bullet.position.y, bullet.size.width, bullet.size.height);
    }
}

window.spaceInvadersGame = new SpaceInvadersGame();
