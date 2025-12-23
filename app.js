// Core Application Logic
class DesktopOS {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.windowZIndex = 100;
        this.init();
    }

    init() {
        this.handleBootScreen();
        this.setupEventListeners();
        this.setupContextMenu();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    handleBootScreen() {
        const bootScreen = document.getElementById('bootScreen');
        if (bootScreen) {
            // Simulate boot sequence
            setTimeout(() => {
                bootScreen.style.opacity = '0';
                setTimeout(() => {
                    bootScreen.classList.add('hidden');
                    // Play startup sound if desired (requires user interaction first usually)
                }, 1000);
            }, 2500); // 2.5 seconds boot time
        }
    }

    setupContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        const desktop = document.getElementById('desktop');

        if (!contextMenu || !desktop) return;

        // Prevent default context menu on desktop
        desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const x = e.clientX;
            const y = e.clientY;

            // Adjust if menu goes off screen
            const menuWidth = 200;
            const menuHeight = 200;
            const finalX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
            const finalY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

            contextMenu.style.left = `${finalX}px`;
            contextMenu.style.top = `${finalY}px`;
            contextMenu.classList.add('show');
        });

        // Click elsewhere to close
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.classList.remove('show');
            }
        });

        // Handle menu items
        document.getElementById('ctxRefresh')?.addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('ctxWallpaper')?.addEventListener('click', () => {
            // Cycle through some wallpapers or random unsplash
            const wallpapers = [
                'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1920&h=1080&fit=crop', // Default Blue
                'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&h=1080&fit=crop', // Dark Mountains
                'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&h=1080&fit=crop', // Nature
                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&h=1080&fit=crop'  // Tech
            ];
            const currentBg = document.querySelector('.animated-background');
            const currentUrl = computedStyle(currentBg).backgroundImage;

            // Simple random switch for now
            const next = wallpapers[Math.floor(Math.random() * wallpapers.length)];
            currentBg.style.backgroundImage = `url('${next}')`;

            contextMenu.classList.remove('show');
        });

        document.getElementById('ctxAbout')?.addEventListener('click', () => {
            alert('Portfolio OS v2.0\nBuilt with Vanilla JS, HTML, CSS');
            contextMenu.classList.remove('show');
        });
    }

    setupEventListeners() {
        // Dock icon clicks
        document.querySelectorAll('.dock-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const app = e.currentTarget.dataset.app;
                if (app) this.launchApp(app);
            });
        });

        // Desktop icon clicks
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const app = e.currentTarget.dataset.app;
                if (app) this.launchApp(app);
            });
        });

        // Navigation bar clicks (guard against missing elements)
        const navHome = document.getElementById('navHome');
        if (navHome) {
            navHome.addEventListener('click', () => this.closeAllWindows());
        }

        const navProjects = document.getElementById('navProjects');
        if (navProjects) {
            navProjects.addEventListener('click', () => this.launchApp('projects'));
        }

        const navContact = document.getElementById('navContact');
        if (navContact) {
            navContact.addEventListener('click', () => {
                this.launchApp('terminal');
                setTimeout(() => {
                    if (window.terminalApp && typeof window.terminalApp.executeCommand === 'function') {
                        window.terminalApp.executeCommand('contact');
                    }
                }, 500);
            });
        }

        const navResume = document.getElementById('navResume');
        if (navResume) {
            navResume.addEventListener('click', () => this.launchApp('resume'));
        }
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const navTime = document.getElementById('navTime');
        if (navTime) navTime.textContent = `${hours}:${minutes}`;
    }

    launchApp(appName) {
        if (!appName) return;

        if (appName === 'github') {
            window.open('https://github.com/saibxbx', '_blank');
            return;
        }

        // Check if window already exists
        if (this.windows.has(appName)) {
            const existingWindow = this.windows.get(appName);
            if (!existingWindow) return;

            if (existingWindow.classList.contains('minimized')) {
                this.restoreWindow(appName);
            } else {
                this.focusWindow(existingWindow);
            }
            return;
        }

        // Create new window
        const template = document.getElementById(`${appName}WindowTemplate`);
        if (!template || !template.content) {
            console.warn(`No template found for app: ${appName}`);
            return;
        }

        const windowElement = template.content.cloneNode(true).querySelector('.window');
        if (!windowElement) {
            console.warn(`No .window element in template for app: ${appName}`);
            return;
        }

        const container = document.getElementById('windowsContainer');
        if (!container) {
            console.warn('No #windowsContainer element found.');
            return;
        }

        // Set initial position (centered with offset for multiple windows)
        const offset = this.windows.size * 30;
        const navHeight = 48; // 3rem top nav
        const dockHeight = 80; // 5rem bottom dock
        const availableHeight = window.innerHeight - navHeight - dockHeight;
        const availableWidth = window.innerWidth;

        const minMargin = 50;
        const windowWidth = Math.min(800, availableWidth - 2 * minMargin);
        const windowHeight = Math.min(600, availableHeight - 2 * minMargin);

        const centerX = Math.max(minMargin, (availableWidth - windowWidth) / 2 + offset);
        const centerY = Math.max(minMargin, (availableHeight - windowHeight) / 2 + offset);
        const finalTop = navHeight + centerY;

        windowElement.style.left = `${centerX}px`;
        windowElement.style.top = `${finalTop}px`;
        windowElement.style.width = `${windowWidth}px`;
        windowElement.style.height = `${windowHeight}px`;

        // Add opening class for animation
        windowElement.classList.add('opening');

        container.appendChild(windowElement);
        this.windows.set(appName, windowElement);

        // Setup window behavior
        this.setupWindowControls(windowElement, appName);
        this.setupWindowDrag(windowElement);
        this.focusWindow(windowElement);

        // Remove opening class after animation
        setTimeout(() => {
            windowElement.classList.remove('opening');
        }, 300);

        // Initialize app-specific functionality
        this.initializeApp(appName, windowElement);

        // Update dock icon
        const dockIcon = document.querySelector(`.dock-icon[data-app="${appName}"]`);
        if (dockIcon) {
            dockIcon.classList.add('active');
        }
    }

    setupWindowControls(windowElement, appName) {
        const minimizeBtn = windowElement.querySelector('.window-control.minimize');
        const snapLeftBtn = windowElement.querySelector('.window-control.snap-left');
        const snapRightBtn = windowElement.querySelector('.window-control.snap-right');
        const maximizeBtn = windowElement.querySelector('.window-control.maximize');
        const closeBtn = windowElement.querySelector('.window-control.close');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimizeWindow(appName));
        }
        if (snapLeftBtn) {
            snapLeftBtn.addEventListener('click', () => this.snapWindow(appName, 'left'));
        }
        if (snapRightBtn) {
            snapRightBtn.addEventListener('click', () => this.snapWindow(appName, 'right'));
        }
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => this.toggleMaximize(appName));
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeWindow(appName));
        }

        // Click on window to focus
        windowElement.addEventListener('mousedown', () => {
            this.focusWindow(windowElement);
        });
    }

    setupWindowDrag(windowElement) {
        const header = windowElement.querySelector('.window-header');
        if (!header) return;

        let isDragging = false;
        let initialX = 0;
        let initialY = 0;

        const onMouseDown = (e) => {
            if (e.target.closest('.window-control')) return;
            if (
                windowElement.classList.contains('maximized') ||
                windowElement.classList.contains('snapped-left') ||
                windowElement.classList.contains('snapped-right')
            ) {
                return;
            }

            isDragging = true;
            initialX = e.clientX - windowElement.offsetLeft;
            initialY = e.clientY - windowElement.offsetTop;
            this.focusWindow(windowElement);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            let currentX = e.clientX - initialX;
            let currentY = e.clientY - initialY;

            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight - 48; // nav height

            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            windowElement.style.left = `${currentX}px`;
            windowElement.style.top = `${currentY}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        header.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Double click to maximize
        header.addEventListener('dblclick', () => {
            const entry = Array.from(this.windows.entries())
                .find(([, win]) => win === windowElement);
            const appName = entry?.[0];
            if (appName) {
                this.toggleMaximize(appName);
            }
        });
    }

    focusWindow(windowElement) {
        document.querySelectorAll('.window').forEach(win => {
            win.classList.remove('active');
        });

        windowElement.classList.add('active');
        this.windowZIndex += 1;
        windowElement.style.zIndex = this.windowZIndex;
        this.activeWindow = windowElement;
    }

    minimizeWindow(appName) {
        const windowElement = this.windows.get(appName);
        if (windowElement) {
            windowElement.classList.add('minimized');
        }
    }

    restoreWindow(appName) {
        const windowElement = this.windows.get(appName);
        if (windowElement) {
            windowElement.classList.remove('minimized');
            this.focusWindow(windowElement);
        }
    }

    snapWindow(appName, direction) {
        const windowElement = this.windows.get(appName);
        if (!windowElement) return;

        windowElement.classList.remove('maximized', 'snapped-left', 'snapped-right');
        windowElement.classList.add(`snapped-${direction}`);

        const maximizeBtnIcon = windowElement.querySelector('.window-control.maximize i');
        if (maximizeBtnIcon) {
            maximizeBtnIcon.className = 'fas fa-expand';
        }
    }

    toggleMaximize(appName) {
        const windowElement = this.windows.get(appName);
        if (!windowElement) return;

        windowElement.classList.remove('snapped-left', 'snapped-right');
        windowElement.classList.toggle('maximized');

        const maximizeBtnIcon = windowElement.querySelector('.window-control.maximize i');
        if (maximizeBtnIcon) {
            maximizeBtnIcon.className = windowElement.classList.contains('maximized')
                ? 'fas fa-compress'
                : 'fas fa-expand';
        }
    }

    closeWindow(appName) {
        const windowElement = this.windows.get(appName);
        if (!windowElement) return;

        // Add closing animation
        windowElement.classList.add('closing');

        // Wait for animation to finish before removing
        setTimeout(() => {
            windowElement.remove();
            this.windows.delete(appName);

            const dockIcon = document.querySelector(`.dock-icon[data-app="${appName}"]`);
            if (dockIcon) {
                dockIcon.classList.remove('active');
            }
        }, 200); // Match CSS animation duration
    }

    closeAllWindows() {
        Array.from(this.windows.keys()).forEach(appName => {
            this.closeWindow(appName);
        });
    }

    initializeApp(appName, windowElement) {
        switch (appName) {
            case 'resume':
                if (window.resumeApp?.init) {
                    window.resumeApp.init(windowElement);
                }
                break;
            case 'browser':
                if (window.browserApp?.init) {
                    window.browserApp.init(windowElement);
                }
                break;
            case 'terminal':
                if (window.terminalApp?.init) {
                    window.terminalApp.init(windowElement);
                }
                break;
            case 'files':
                if (window.filesApp?.init) {
                    window.filesApp.init(windowElement);
                }
                break;
            case 'projects':
                // Projects window is self-contained in the template
                break;
            case 'pacman':
                if (window.pacmanGame?.init) {
                    window.pacmanGame.init(windowElement);
                }
                break;
            case 'spaceinvaders':
                if (window.spaceInvadersGame?.init) {
                    window.spaceInvadersGame.init(windowElement);
                }
                break;
            default:
                break;
        }
    }
}

// Initialize Desktop OS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Helper to get computed style for wallpaper switching
    window.computedStyle = (el) => window.getComputedStyle(el);
    window.desktopOS = new DesktopOS();
});
