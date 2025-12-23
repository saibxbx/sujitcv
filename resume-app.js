class ResumeApp {
    constructor() {
        this.resumeData = {
            name: "Sujit S",
            title: "Full Stack Developer",
            contact: {
                email: "rekhasujit2017@gmail.com",
                github: "https://github.com/saibxbx",
                linkedin: "https://www.linkedin.com/in/sujit-s-b7933631b/",
                location: "India"
            },
            about: "Passionate Full Stack Developer with expertise in C/C++ programming and modern web technologies. Experienced in building scalable applications using React, Node.js, and MongoDB. Strong problem-solving skills with a focus on clean, efficient code.",
            skills: [
                "C", "C++", "JavaScript", "React",
                "Node.js", "Express", "MongoDB", "MySQL",
                "HTML5", "CSS3", "Git", "Socket.IO",
                "REST APIs", "Firebase", "Data Structures", "Algorithms"
            ],
            education: [
                {
                    degree: "M.Tech Integrated (Software Engineering)",
                    institution: "VIT Chennai",
                    year: "2nd Year - 5-Year Integrated Programme",
                    description: "Currently pursuing M.Tech Integrated in Software Engineering at VIT Chennai. The 5-year integrated programme combines undergraduate and postgraduate studies with focus on advanced software development, system design, and emerging technologies."
                }
            ],
            projects: [
                {
                    name: "Peace Messenger Application",
                    description: "A real-time messenger application with features like one-to-one chat, group chat, file sharing, voice messages, and Google OAuth authentication. Built with modern web technologies.",
                    technologies: "React, Node.js, Express, MongoDB, Socket.IO, Firebase",
                    link: "https://github.com/saibxbx/peace_messenger.git"
                },
                {
                    name: "Portfolio OS Website",
                    description: "Interactive portfolio website designed as a desktop operating system with draggable windows, terminal, browser, and game applications.",
                    technologies: "HTML5, CSS3, Vanilla JavaScript",
                    link: "#"
                }
            ],
            certifications: [
                {
                    name: "C Programming Certification",
                    issuer: "Professional Certification Authority",
                    description: "Comprehensive certification covering C programming fundamentals, pointers, memory management, data structures, and advanced concepts including file handling and system programming."
                },
                {
                    name: "C++ Programming Certification",
                    issuer: "Professional Certification Authority",
                    description: "Advanced certification in C++ programming covering object-oriented programming, templates, STL (Standard Template Library), exception handling, and modern C++ features."
                }
            ],
            internship: {
                status: "No internship experience",
                description: "Currently focused on personal projects and skill development."
            }
        };

        // Bind methods to ensure proper 'this' context
        this.downloadPDF = this.downloadPDF.bind(this);
    }

    init(windowElement) {
        if (!windowElement) {
            console.error('Window element not provided');
            return;
        }

        this.renderResume(windowElement);
        this.setupEventListeners(windowElement);
    }

    renderResume(windowElement) {
        try {
            // Header
            this.setTextContent(windowElement, '#resumeName', this.resumeData.name);
            this.setTextContent(windowElement, '#resumeTitle', this.resumeData.title);

            // Contact
            this.renderContact(windowElement);

            // About
            this.setHTMLContent(windowElement, '#resumeAbout', `<p>${this.resumeData.about}</p>`);

            // Skills
            this.renderSkills(windowElement);

            // Education
            this.renderEducation(windowElement);

            // Projects
            this.renderProjects(windowElement);

            // Internship
            this.renderInternship(windowElement);

            // Certifications
            this.renderCertifications(windowElement);

            // Contact Section
            this.renderContactSection(windowElement);

        } catch (error) {
            console.error('Error rendering resume:', error);
            this.showError('Failed to render resume content');
        }
    }

    setTextContent(element, selector, text) {
        const node = element.querySelector(selector);
        if (node) node.textContent = text;
    }

    setHTMLContent(element, selector, html) {
        const node = element.querySelector(selector);
        if (node) node.innerHTML = html;
    }

    renderContact(windowElement) {
        const contactDiv = windowElement.querySelector('#resumeContact');
        if (!contactDiv) return;

        contactDiv.innerHTML = `
            <a href="mailto:${this.resumeData.contact.email}" aria-label="Email ${this.resumeData.contact.email}">
                <i class="fas fa-envelope"></i> ${this.resumeData.contact.email}
            </a>
            <a href="${this.resumeData.contact.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                <i class="fab fa-github"></i> GitHub
            </a>
            <a href="${this.resumeData.contact.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                <i class="fab fa-linkedin"></i> LinkedIn
            </a>
            <span aria-label="Location">
                <i class="fas fa-map-marker-alt"></i> ${this.resumeData.contact.location}
            </span>
        `;
    }

    renderSkills(windowElement) {
        const skillsGrid = windowElement.querySelector('#resumeSkills');
        if (!skillsGrid) return;

        skillsGrid.innerHTML = this.resumeData.skills.map(skill =>
            `<div class="skill-item" aria-label="Skill: ${skill}">${skill}</div>`
        ).join('');
    }

    renderEducation(windowElement) {
        const educationDiv = windowElement.querySelector('#resumeEducation');
        if (!educationDiv) return;

        educationDiv.innerHTML = this.resumeData.education.map(edu => `
            <div class="education-item">
                <h3>${edu.degree}</h3>
                <p><strong>${edu.institution}</strong> | ${edu.year}</p>
                <p>${edu.description}</p>
            </div>
        `).join('');
    }

    renderProjects(windowElement) {
        const projectsDiv = windowElement.querySelector('#resumeProjects');
        if (!projectsDiv) return;

        projectsDiv.innerHTML = this.resumeData.projects.map(project => `
            <div class="project-item">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <p><strong>Technologies:</strong> ${project.technologies}</p>
                ${project.link !== '#' ?
                `<p><a href="${project.link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-blue);">View Project →</a></p>` :
                ''
            }
            </div>
        `).join('');
    }

    renderInternship(windowElement) {
        const internshipDiv = windowElement.querySelector('#resumeInternship');
        if (!internshipDiv) return;

        internshipDiv.innerHTML = `
            <div class="education-item">
                <h3>${this.resumeData.internship.status}</h3>
                <p>${this.resumeData.internship.description}</p>
            </div>
        `;
    }

    renderCertifications(windowElement) {
        const certificationsDiv = windowElement.querySelector('#resumeCertifications');
        if (!certificationsDiv) return;

        certificationsDiv.innerHTML = this.resumeData.certifications.map(cert => `
            <div class="certification-item">
                <h3>${cert.name}</h3>
                <p><strong>${cert.issuer}</strong></p>
                <p>${cert.description}</p>
            </div>
        `).join('');
    }

    renderContactSection(windowElement) {
        const contactSection = windowElement.querySelector('#resumeContactSection');
        if (!contactSection) return;

        contactSection.innerHTML = `
            <p>Feel free to reach out for collaborations or opportunities!</p>
            <div class="resume-contact">
                <a href="mailto:${this.resumeData.contact.email}" aria-label="Send email">
                    <i class="fas fa-envelope"></i> Email
                </a>
                <a href="${this.resumeData.contact.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <i class="fab fa-github"></i> GitHub
                </a>
                <a href="${this.resumeData.contact.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <i class="fab fa-linkedin"></i> LinkedIn
                </a>
            </div>
        `;
    }

    setupEventListeners(windowElement) {
        const downloadBtn = windowElement.querySelector('#downloadResumeBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', this.downloadPDF);
        } else {
            console.warn('Download button not found');
        }
    }

    showError(message) {
        // Create or update error display
        let errorDiv = document.querySelector('.resume-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'resume-error';
            errorDiv.style.cssText = 'color: red; padding: 10px; margin: 10px 0; border: 1px solid red; border-radius: 4px;';
            document.body.prepend(errorDiv);
        }
        errorDiv.textContent = message;
    }

    downloadPDF() {
        try {
            // Verify jsPDF library is loaded with modern UMD pattern [web:13][web:16]
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF library not loaded. Please ensure the script tag is included before this code.');
            }

            const { jsPDF } = window.jspdf; // Extract jsPDF constructor [web:25][web:32]
            const doc = new jsPDF();

            let yPos = 20;
            const lineHeight = 7;
            const pageHeight = 280;
            const margin = 20;
            const maxWidth = 170; // A4 width in mm minus margins

            // Helper function with improved page break handling
            const addText = (text, fontSize = 12, isBold = false) => {
                if (!text || text.trim() === '') return; // Skip empty text

                doc.setFontSize(fontSize);
                doc.setFont(undefined, isBold ? 'bold' : 'normal');
                const lines = doc.splitTextToSize(text, maxWidth);

                lines.forEach(line => {
                    if (yPos > pageHeight) {
                        doc.addPage();
                        yPos = 20;
                    }
                    doc.text(line, margin, yPos);
                    yPos += lineHeight;
                });
            };

            // Header Section
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text(this.resumeData.name, 105, yPos, { align: 'center' });
            yPos += 10;

            doc.setFontSize(14);
            doc.setFont(undefined, 'normal');
            doc.text(this.resumeData.title, 105, yPos, { align: 'center' });
            yPos += 10;

            doc.setFontSize(10);
            doc.text(`${this.resumeData.contact.email} | ${this.resumeData.contact.location}`, 105, yPos, { align: 'center' });
            yPos += 15;

            // About Section
            addText('ABOUT', 16, true);
            yPos += 2;
            addText(this.resumeData.about, 11);
            yPos += 5;

            // Skills Section
            addText('SKILLS', 16, true);
            yPos += 2;
            addText(this.resumeData.skills.join(' • '), 11);
            yPos += 5;

            // Education Section
            addText('EDUCATION', 16, true);
            yPos += 2;
            this.resumeData.education.forEach(edu => {
                addText(edu.degree, 12, true);
                addText(`${edu.institution} | ${edu.year}`, 11);
                addText(edu.description, 11);
                yPos += 3;
            });

            // Projects Section
            addText('PROJECTS', 16, true);
            yPos += 2;
            this.resumeData.projects.forEach(project => {
                addText(project.name, 12, true);
                addText(project.description, 11);
                addText(`Technologies: ${project.technologies}`, 11);
                yPos += 3;
            });

            // Certifications Section
            addText('CERTIFICATIONS', 16, true);
            yPos += 2;
            this.resumeData.certifications.forEach(cert => {
                addText(`${cert.name} - ${cert.issuer}`, 11, true);
                addText(cert.description, 11);
                yPos += 3;
            });

            // Save PDF with sanitized filename
            const safeFilename = this.resumeData.name.replace(/[^a-z0-9]/gi, '_');
            doc.save(`${safeFilename}_Resume.pdf`);

        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showError(`Failed to generate PDF: ${error.message}`);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Verify jsPDF is available before initializing
    if (typeof window.jspdf !== 'undefined') {
        window.resumeApp = new ResumeApp();
        console.log('ResumeApp initialized successfully');
    } else {
        console.error('jsPDF library not loaded. Please include the script tag.');
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'resume-error';
        errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center; font-size: 16px;';
        errorDiv.textContent = 'PDF generation library failed to load. Please refresh the page.';
        document.body.prepend(errorDiv);
    }
});
