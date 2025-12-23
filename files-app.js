// File Manager Application
class FilesApp {
    constructor() {
        this.currentPath = '/';
        this.fileSystem = {
            '/': {
                type: 'folder',
                name: 'Root',
                children: {
                    'Documents': {
                        type: 'folder',
                        name: 'Documents',
                        children: {
                            'Resume.pdf': {
                                type: 'file',
                                name: 'Resume.pdf',
                                icon: 'fa-file-pdf',
                                content: 'resume'
                            }
                        }
                    },
                    'Projects': {
                        type: 'folder',
                        name: 'Projects',
                        children: {
                            'Peace_Messenger': {
                                type: 'project',
                                name: 'Peace Messenger',
                                icon: 'fa-code',
                                description: 'A real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.',
                                link: 'https://github.com/saibxbx/peace_messenger'
                            },
                            'Portfolio_OS': {
                                type: 'project',
                                name: 'Portfolio OS',
                                icon: 'fa-desktop',
                                description: 'Interactive portfolio website designed as a desktop operating system.',
                                link: '#'
                            }
                        }
                    },
                    'Certificates': {
                        type: 'folder',
                        name: 'Certificates',
                        children: {
                            'C_Certificate.pdf': {
                                type: 'file',
                                name: 'C_Certificate.pdf',
                                icon: 'fa-file-pdf',
                                content: 'c-cert'
                            },
                            'Cpp_Certificate.pdf': {
                                type: 'file',
                                name: 'Cpp_Certificate.pdf',
                                icon: 'fa-file-pdf',
                                content: 'cpp-cert'
                            }
                        }
                    }
                }
            }
        };
    }

    init(windowElement) {
        this.windowElement = windowElement;
        this.renderFileSystem();
    }

    renderFileSystem() {
        const container = this.windowElement.querySelector('.files-container');
        const currentFolder = this.getCurrentFolder();

        let html = `
            <div class="files-header">
                <div class="files-path">
                    <i class="fas fa-folder-open"></i>
                    <span>${this.currentPath === '/' ? 'Root' : this.currentPath}</span>
                </div>
                ${this.currentPath !== '/' ? '<button class="files-back-btn" onclick="window.filesApp.goBack()"><i class="fas fa-arrow-left"></i> Back</button>' : ''}
            </div>
            <div class="files-grid">
        `;

        if (currentFolder && currentFolder.children) {
            for (const [key, item] of Object.entries(currentFolder.children)) {
                if (item.type === 'folder') {
                    html += `
                        <div class="file-item folder" onclick="window.filesApp.openFolder('${key}')">
                            <i class="fas fa-folder"></i>
                            <span>${item.name}</span>
                        </div>
                    `;
                } else if (item.type === 'project') {
                    html += `
                        <div class="file-item project" onclick="window.filesApp.openProject('${key}')" style="cursor: pointer;">
                            <i class="fas ${item.icon}" style="color: #00d4ff;"></i>
                            <span>${item.name}</span>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="file-item file" onclick="window.filesApp.openFile('${key}')">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.name}</span>
                        </div>
                    `;
                }
            }
        }

        html += '</div>';
        container.innerHTML = html;
    }

    getCurrentFolder() {
        if (this.currentPath === '/') {
            return this.fileSystem['/'];
        }

        const parts = this.currentPath.split('/').filter(p => p);
        let current = this.fileSystem['/'];

        for (const part of parts) {
            if (current.children && current.children[part]) {
                current = current.children[part];
            }
        }

        return current;
    }

    openFolder(folderName) {
        if (this.currentPath === '/') {
            this.currentPath = '/' + folderName;
        } else {
            this.currentPath += '/' + folderName;
        }
        this.renderFileSystem();
    }

    goBack() {
        const parts = this.currentPath.split('/').filter(p => p);
        parts.pop();
        this.currentPath = parts.length > 0 ? '/' + parts.join('/') : '/';
        this.renderFileSystem();
    }

    openProject(projectName) {
        const currentFolder = this.getCurrentFolder();
        const project = currentFolder.children[projectName];

        if (!project) return;

        if (project.link && project.link !== '#') {
            window.open(project.link, '_blank');
        } else {
            alert(`${project.name}\n\n${project.description}`);
        }
    }

    openFile(fileName) {
        const currentFolder = this.getCurrentFolder();
        const file = currentFolder.children[fileName];

        if (!file) return;

        if (file.name.endsWith('.pdf')) {
            this.openPDF(file);
        } else {
            this.openTextFile(file);
        }
    }

    openPDF(file) {
        // Create a PDF viewer window
        const pdfContent = this.generatePDFContent(file.content);

        // Create a new window for PDF viewer
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="window pdf-viewer" data-window="pdf-viewer" style="left: 100px; top: 100px; width: 800px; height: 600px;">
                <div class="window-header">
                    <div class="window-title">
                        <i class="fas fa-file-pdf"></i>
                        <span>${file.name}</span>
                    </div>
                    <div class="window-controls">
                        <button class="window-control close" title="Close" onclick="this.closest('.window').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="window-content" style="padding: 0;">
                    <iframe style="width: 100%; height: 100%; border: none;" srcdoc="${pdfContent.replace(/"/g, '&quot;')}"></iframe>
                </div>
            </div>
        `;

        const container = document.getElementById('windowsContainer');
        container.appendChild(template.content.firstElementChild);
    }

    generatePDFContent(type) {
        const styles = `
            body {
                font-family: 'Inter', sans-serif;
                padding: 40px;
                background: white;
                color: #333;
            }
            h1 {
                color: #0078d4;
                border-bottom: 3px solid #0078d4;
                padding-bottom: 10px;
            }
            .cert-header {
                text-align: center;
                margin-bottom: 40px;
            }
            .cert-body {
                line-height: 1.8;
            }
            .signature {
                margin-top: 60px;
                text-align: right;
            }
        `;

        if (type === 'resume') {
            return `
                <!DOCTYPE html>
                <html>
                <head><style>${styles}</style></head>
                <body>
                    <div class="cert-header">
                        <h1>RESUME</h1>
                        <h2>Sujit S</h2>
                        <p>Full Stack Developer</p>
                        <p>rekhasujit2017@gmail.com</p>
                    </div>
                    <div class="cert-body">
                        <h3>Skills</h3>
                        <p>C, C++, JavaScript, React, Node.js, Express, MongoDB, MySQL, HTML5, CSS3, Git, Socket.IO</p>
                        
                        <h3>Projects</h3>
                        <p><strong>Messenger Application</strong><br>
                        A real-time messenger application with chat, file sharing, and authentication.</p>
                        
                        <h3>Certifications</h3>
                        <p>• C Programming Certificate (2023)<br>
                        • C++ Programming Certificate (2023)</p>
                        
                        <h3>Internship Experience</h3>
                        <p>No internship experience - Currently focused on personal projects and skill development.</p>
                    </div>
                </body>
                </html>
            `;
        } else if (type === 'c-cert') {
            return `
                <!DOCTYPE html>
                <html>
                <head><style>${styles}</style></head>
                <body>
                    <div class="cert-header">
                        <h1>CERTIFICATE OF COMPLETION</h1>
                        <h2>C Programming</h2>
                    </div>
                    <div class="cert-body">
                        <p>This is to certify that</p>
                        <h2 style="text-align: center; color: #0078d4;">Sujit S</h2>
                        <p>has successfully completed the comprehensive course in <strong>C Programming Language</strong> covering fundamentals and advanced concepts including:</p>
                        <ul>
                            <li>Data Types and Variables</li>
                            <li>Control Structures</li>
                            <li>Functions and Recursion</li>
                            <li>Pointers and Memory Management</li>
                            <li>File Handling</li>
                            <li>Data Structures</li>
                        </ul>
                        <div class="signature">
                            <p><strong>Certification Authority</strong><br>
                            Year: 2023</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        } else if (type === 'cpp-cert') {
            return `
                <!DOCTYPE html>
                <html>
                <head><style>${styles}</style></head>
                <body>
                    <div class="cert-header">
                        <h1>CERTIFICATE OF COMPLETION</h1>
                        <h2>C++ Programming</h2>
                    </div>
                    <div class="cert-body">
                        <p>This is to certify that</p>
                        <h2 style="text-align: center; color: #0078d4;">Sujit S</h2>
                        <p>has successfully completed the advanced course in <strong>C++ Programming Language</strong> covering object-oriented programming and STL including:</p>
                        <ul>
                            <li>Object-Oriented Programming</li>
                            <li>Classes and Objects</li>
                            <li>Inheritance and Polymorphism</li>
                            <li>Templates and Generic Programming</li>
                            <li>Standard Template Library (STL)</li>
                            <li>Exception Handling</li>
                        </ul>
                        <div class="signature">
                            <p><strong>Certification Authority</strong><br>
                            Year: 2023</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        }
    }

    openTextFile(file) {
        alert(file.content);
    }
}

window.filesApp = new FilesApp();
