// Terminal Application
class TerminalApp {
    constructor() {
        this.windowElement = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commands = {
            help: this.helpCommand.bind(this),
            about: this.aboutCommand.bind(this),
            skills: this.skillsCommand.bind(this),
            projects: this.projectsCommand.bind(this),
            education: this.educationCommand.bind(this),
            contact: this.contactCommand.bind(this),
            clear: this.clearCommand.bind(this),
            whoami: this.whoamiCommand.bind(this),
            ls: this.lsCommand.bind(this),
            date: this.dateCommand.bind(this),
            echo: this.echoCommand.bind(this)
        };
    }

    init(windowElement) {
        this.windowElement = windowElement;
        this.setupEventListeners();
        this.focusInput();
    }

    setupEventListeners() {
        const input = this.windowElement.querySelector('#terminalInput');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = input.value.trim();
                if (command) {
                    this.executeCommand(command);
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;
                }
                input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.commandHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    input.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    input.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autocomplete(input);
            }
        });

        // Keep input focused
        this.windowElement.addEventListener('click', () => {
            this.focusInput();
        });
    }

    focusInput() {
        const input = this.windowElement.querySelector('#terminalInput');
        if (input) {
            input.focus();
        }
    }

    executeCommand(commandLine) {
        const output = this.windowElement.querySelector('#terminalOutput');

        // Display command
        this.addLine(`<span class="terminal-prompt">guest@portfolio:~$</span> ${commandLine}`);

        // Parse command
        const parts = commandLine.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Execute command
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.addLine(`Command not found: ${command}`, 'error');
            this.addLine(`Type 'help' for available commands.`, 'info');
        }

        this.addLine('');
        this.scrollToBottom();
    }

    addLine(text, type = '') {
        const output = this.windowElement.querySelector('#terminalOutput');
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.innerHTML = text;
        output.appendChild(line);
    }

    scrollToBottom() {
        const content = this.windowElement.querySelector('.terminal-output');
        content.scrollTop = content.scrollHeight;
    }

    autocomplete(input) {
        const value = input.value.toLowerCase();
        const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(value));

        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            this.addLine('');
            this.addLine(matches.join('  '), 'info');
            this.addLine('');
        }
    }

    // Command Implementations

    helpCommand() {
        this.addLine('Available commands:', 'success');
        this.addLine('');
        this.addLine('  help        - Show this help message');
        this.addLine('  about       - About me');
        this.addLine('  skills      - List my technical skills');
        this.addLine('  projects    - Show my projects');
        this.addLine('  education   - Display education history');
        this.addLine('  contact     - Get contact information');
        this.addLine('  clear       - Clear terminal screen');
        this.addLine('  whoami      - Display current user');
        this.addLine('  ls          - List available sections');
        this.addLine('  date        - Show current date and time');
        this.addLine('  echo [text] - Echo text to terminal');
    }

    aboutCommand() {
        this.addLine('About Me', 'success');
        this.addLine('━'.repeat(50), 'info');
        this.addLine('Name: Sujit S');
        this.addLine('Role: Full Stack Developer');
        this.addLine('Location: India');
        this.addLine('');
        this.addLine('Passionate Full Stack Developer with expertise in building');
        this.addLine('modern web applications. Experienced in React, Node.js,');
        this.addLine('MongoDB, and cloud technologies. Strong problem-solving');
        this.addLine('skills and a commitment to writing clean, maintainable code.');
    }

    skillsCommand() {
        this.addLine('Technical Skills', 'success');
        this.addLine('━'.repeat(50), 'info');
        this.addLine('');
        this.addLine('Frontend:');
        this.addLine('  • JavaScript, TypeScript, React, Vue.js, Next.js');
        this.addLine('  • HTML5, CSS3, Tailwind CSS, Bootstrap');
        this.addLine('  • Redux, Socket.IO');
        this.addLine('');
        this.addLine('Backend:');
        this.addLine('  • Node.js, Express, Python, Java');
        this.addLine('  • REST APIs, GraphQL');
        this.addLine('');
        this.addLine('Database:');
        this.addLine('  • MongoDB, PostgreSQL, MySQL');
        this.addLine('');
        this.addLine('Tools & Cloud:');
        this.addLine('  • Git, Docker, AWS, Firebase');
    }

    projectsCommand() {
        this.addLine('Projects', 'success');
        this.addLine('━'.repeat(50), 'info');
        this.addLine('');
        this.addLine('[1] Peace Chat Application');
        this.addLine('    Real-time messenger with chat, file sharing, voice messages');
        this.addLine('    Tech: React, Node.js, MongoDB, Socket.IO, Firebase');
        this.addLine('    Link: https://github.com/saibxbx/messenger_project');
        this.addLine('');
        this.addLine('[2] E-Commerce Platform');
        this.addLine('    Full-featured online store with payment integration');
        this.addLine('    Tech: React, Node.js, Express, MongoDB, Stripe');
        this.addLine('');
        this.addLine('[3] Task Management System');
        this.addLine('    Collaborative tool with real-time updates');
        this.addLine('    Tech: Vue.js, Node.js, PostgreSQL, Socket.IO');
        this.addLine('');
        this.addLine('[4] Portfolio OS Website');
        this.addLine('    Interactive portfolio as desktop operating system');
        this.addLine('    Tech: HTML5, CSS3, Vanilla JavaScript');
    }

    educationCommand() {
        this.addLine('Education', 'success');
        this.addLine('━'.repeat(50), 'info');
        this.addLine('');
        this.addLine('Bachelor of Technology in Computer Science');
        this.addLine('University Name | 2020 - 2024');
        this.addLine('Focus: Software engineering, algorithms, web technologies');
        this.addLine('');
        this.addLine('Higher Secondary Education');
        this.addLine('School Name | 2018 - 2020');
        this.addLine('Stream: Science with Computer Science');
    }

    contactCommand() {
        this.addLine('Contact Information', 'success');
        this.addLine('━'.repeat(50), 'info');
        this.addLine('');
        this.addLine('Email:    rekhasujit2017@gmail.com');
        this.addLine('GitHub:   https://github.com/saibxbx');
        this.addLine('LinkedIn: https://www.linkedin.com/in/sujit-s-b7933631b/');
        this.addLine('Location: India');
        this.addLine('');
        this.addLine('Feel free to reach out for collaborations or opportunities!', 'info');
    }

    clearCommand() {
        const output = this.windowElement.querySelector('#terminalOutput');
        output.innerHTML = '';
    }

    whoamiCommand() {
        this.addLine('guest', 'success');
    }

    lsCommand() {
        this.addLine('about      skills     projects   education  contact', 'info');
    }

    dateCommand() {
        const now = new Date();
        this.addLine(now.toString(), 'info');
    }

    echoCommand(args) {
        this.addLine(args.join(' '));
    }

    githubCommand() {
        this.addLine('Opening GitHub profile...', 'success');
        window.open('https://github.com/saibxbx', '_blank');
    }

    linkedinCommand() {
        this.addLine('Opening LinkedIn profile...', 'success');
        window.open('https://www.linkedin.com/in/rekhasujit2017', '_blank');
    }
}

// Initialize Terminal App
window.terminalApp = new TerminalApp();
