// Browser Application
class BrowserApp {
  constructor() {
    this.currentUrl = '';
    this.history = [];
    this.historyIndex = -1;
    this.windowElement = null;
  }

  init(windowElement) {
    this.windowElement = windowElement;
    this.setupEventListeners();
    // Load Google Search (Embedded Mode) as default homepage
    this.navigate('https://www.linkedin.com/in/sujit-s-b7933631b/');
  }

  setupEventListeners() {
    // Pre-defined blocklist of sites that strictly forbid IFrame embedding
    this.blockedDomains = [
      'linkedin.com',
      'github.com',
      'twitter.com',
      'x.com',
      'facebook.com',
      'instagram.com',
      'reddit.com',
      'stackoverflow.com'
    ];

    const addressInput = this.windowElement.querySelector('#browserAddressInput');
    const goBtn = this.windowElement.querySelector('#browserGo');
    const backBtn = this.windowElement.querySelector('#browserBack');
    const forwardBtn = this.windowElement.querySelector('#browserForward');
    const refreshBtn = this.windowElement.querySelector('#browserRefresh');
    const githubBtn = this.windowElement.querySelector('#browserGithub');
    const linkedinBtn = this.windowElement.querySelector('#browserLinkedin');

    if (addressInput) {
      addressInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.navigate(addressInput.value);
        }
      });
    }

    if (goBtn && addressInput) {
      goBtn.addEventListener('click', () => {
        this.navigate(addressInput.value);
      });
    }

    if (backBtn) backBtn.addEventListener('click', () => this.goBack());
    if (forwardBtn) forwardBtn.addEventListener('click', () => this.goForward());
    if (refreshBtn) refreshBtn.addEventListener('click', () => this.refresh());

    if (githubBtn) {
      githubBtn.addEventListener('click', () => {
        this.navigate('https://github.com/saibxbx');
      });
    }

    if (linkedinBtn) {
      linkedinBtn.addEventListener('click', () => {
        this.navigate('https://www.linkedin.com/in/sujit-s-b7933631b/');
      });
    }
  }

  loadHomePage() {
    const homeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          .links {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          a {
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 0.5rem;
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          a:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          .search-box {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 2rem;
            color: white;
            font-size: 1rem;
            width: 100%;
            max-width: 500px;
            backdrop-filter: blur(10px);
          }
          .search-box::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }
        </style>
      </head>
      <body>
        <h1>🌐 Portfolio Browser</h1>
        <h1>🌐 Portfolio Browser</h1>
        <p>Explore the web securely from within your portfolio!</p>
        <div class="links">
          <a href="https://github.com/saibxbx" target="_blank">GitHub Profile</a>
          <a href="https://www.linkedin.com/in/sujit-s-b7933631b/" target="_blank">LinkedIn Profile</a>
          <a href="https://www.google.com" target="_blank">Google</a>
          <a href="https://stackoverflow.com" target="_blank">Stack Overflow</a>
        </div>
        <input type="text" class="search-box" placeholder="Enter a URL to visit..." id="searchBox">
      </body>
      </html>
    `;

    const iframe = this.windowElement.querySelector('#browserFrame');
    if (!iframe) return;

    iframe.srcdoc = homeContent; // uses srcdoc for inline HTML
    this.currentUrl = 'browser://home';
    this.updateAddressBar('browser://home');
    this.updateNavigationButtons();
  }

  navigate(url) {
    if (!url) return;

    let normalizedUrl = url.trim();

    if (normalizedUrl === 'home' || normalizedUrl === 'browser://home') {
      this.loadHomePage();
      return;
    }

    // Only add https:// if URL doesn't already have a protocol
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      if (normalizedUrl.includes('.') && !normalizedUrl.includes(' ')) {
        normalizedUrl = 'https://' + normalizedUrl;
      } else {
        // Use Google Search with iframe-enabling parameter
        normalizedUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(normalizedUrl);
      }
    }

    // Check if URL is blocked (can't be embedded) - show preview page instead
    const isBlocked = this.blockedDomains.some(domain => normalizedUrl.includes(domain));
    if (isBlocked) {
      this.currentUrl = normalizedUrl;
      this.updateAddressBar(normalizedUrl);
      this.showExternalLinkPage(normalizedUrl);
      return;
    }

    // Load the URL in the iframe
    this.loadUrl(normalizedUrl);
  }

  showExternalLinkPage(url) {
    // Check if it's LinkedIn - show profile preview
    if (url.includes('linkedin.com')) {
      this.showLinkedInProfile(url);
      return;
    }

    // For other blocked sites, show external link page
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .container { max-width: 600px; }
          h1 { font-size: 2.5rem; margin-bottom: 1rem; }
          p { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; }
          .url-display {
            background: rgba(255, 255, 255, 0.2);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
            word-break: break-all;
            font-family: monospace;
          }
          .button {
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 0.5rem;
            color: #667eea;
            font-weight: 600;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 0.5rem;
            text-decoration: none;
            display: inline-block;
          }
          .button:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌐 External Link</h1>
          <p>This site cannot be embedded. Click below to open it.</p>
          <div class="url-display">${url}</div>
          <button class="button" onclick="window.open('${url}', '_blank')">
            Open in New Tab
          </button>
        </div>
      </body>
      </html>
    `;

    const iframe = this.windowElement.querySelector('#browserFrame');
    if (!iframe) return;
    iframe.srcdoc = content;
  }

  showLinkedInProfile(url) {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 50%, #667eea 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .profile-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 1.5rem;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
            animation: slideUp 0.5s ease;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .cover {
            height: 120px;
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
            position: relative;
          }
          .linkedin-logo {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 2rem;
            color: white;
          }
          .avatar-container {
            display: flex;
            justify-content: center;
            margin-top: -60px;
          }
          .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 5px solid white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
            font-weight: 700;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          .profile-info {
            padding: 1.5rem 2rem 2rem;
            text-align: center;
          }
          .name {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
          }
          .title {
            font-size: 1rem;
            color: #666;
            margin-bottom: 1rem;
          }
          .location {
            font-size: 0.9rem;
            color: #888;
            margin-bottom: 1.5rem;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1.5rem;
            padding: 1rem 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          }
          .stat {
            text-align: center;
          }
          .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0077b5;
          }
          .stat-label {
            font-size: 0.8rem;
            color: #888;
          }
          .connect-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: #0077b5;
            color: white;
            border: none;
            border-radius: 2rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
          }
          .connect-btn:hover {
            background: #005885;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 119, 181, 0.4);
          }
          .connect-btn svg {
            width: 20px;
            height: 20px;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
            margin-top: 1.5rem;
          }
          .skill {
            padding: 0.5rem 1rem;
            background: #f0f7ff;
            color: #0077b5;
            border-radius: 2rem;
            font-size: 0.85rem;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="profile-card">
          <div class="cover">
            <div class="linkedin-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </div>
          </div>
          <div class="avatar-container">
            <div class="avatar">SS</div>
          </div>
          <div class="profile-info">
            <h1 class="name">Sujit S</h1>
            <p class="title">Full Stack Developer | Software Engineer</p>
            <p class="location">📍 India</p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">4</div>
                <div class="stat-label">Connections</div>
              </div>
              <div class="stat">
                <div class="stat-value">Open</div>
                <div class="stat-label">To Work</div>
              </div>
            </div>
            <a href="${url}" target="_blank" class="connect-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19V6.413L11.207 14.207L9.793 12.793L17.585 5H13V3H21Z"/>
              </svg>
              View Full Profile
            </a>
            <div class="skills">
              <span class="skill">JavaScript</span>
              <span class="skill">React</span>
              <span class="skill">Node.js</span>
              <span class="skill">Python</span>
              <span class="skill">MongoDB</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const iframe = this.windowElement.querySelector('#browserFrame');
    if (!iframe) return;
    iframe.srcdoc = content;
  }

  loadUrl(url) {
    const iframe = this.windowElement.querySelector('#browserFrame');
    const loading = this.windowElement.querySelector('#browserLoading');
    const blocked = this.windowElement.querySelector('#browserBlocked');

    if (!iframe || !loading || !blocked) return;

    // Check if URL is in the known blocklist
    const isKnownBlocked = this.blockedDomains.some(domain => url.includes(domain));
    if (isKnownBlocked) {
      this.currentUrl = url;
      this.updateAddressBar(url);
      this.showBlocked(url);
      return;
    }

    blocked.classList.remove('show');
    iframe.style.display = 'block'; // Ensure iframe is visible for loading

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(url);
    this.historyIndex = this.history.length - 1;

    this.currentUrl = url;
    this.updateAddressBar(url);
    this.updateNavigationButtons();

    iframe.src = url;
    iframe.style.display = 'block';

    const loadTimeout = setTimeout(() => {
      loading.style.display = 'none';
      this.showBlocked(url);
    }, 3000);

    iframe.onload = () => {
      clearTimeout(loadTimeout);
      loading.style.display = 'none';
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc.body || iframeDoc.body.children.length === 0) {
          // Empty body might indicate a block or error
          // But some valid sites might trigger this too.
          // We'll rely more on the timeout and blocklist.
        }
      } catch (e) {
        // CAUTION: A SecurityError here actually means the Page LOADED successfully!
        // It means we are respecting Cross-Origin security.
        // WE DO NOT BLOCK HERE. We assume success.
        console.log('Cross-origin frame loaded successfully');
      }
    };

    iframe.onerror = () => {
      clearTimeout(loadTimeout);
      this.showBlocked(url);
    };
  }

  showBlocked(url) {
    const loading = this.windowElement.querySelector('#browserLoading');
    const blocked = this.windowElement.querySelector('#browserBlocked');
    const openExternalBtn = this.windowElement.querySelector('#browserOpenExternal');

    if (!loading || !blocked || !openExternalBtn) return;

    loading.style.display = 'none';
    blocked.classList.add('show');

    openExternalBtn.onclick = () => {
      window.open(url, '_blank'); // external window for blocked iframe content
    };

    const iframe = this.windowElement.querySelector('#browserFrame');
    if (iframe) {
      iframe.style.display = 'none'; // Hide the iframe so the error icon doesn't show through
    }
  }

  updateAddressBar(url) {
    const addressInput = this.windowElement.querySelector('#browserAddressInput');
    if (addressInput) {
      addressInput.value = url;
    }
  }

  updateNavigationButtons() {
    const backBtn = this.windowElement.querySelector('#browserBack');
    const forwardBtn = this.windowElement.querySelector('#browserForward');

    if (backBtn) {
      backBtn.disabled = this.historyIndex <= 0;
    }
    if (forwardBtn) {
      forwardBtn.disabled = this.historyIndex >= this.history.length - 1;
    }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const url = this.history[this.historyIndex];

      if (url === 'browser://home') {
        this.loadHomePage();
      } else {
        this.loadUrl(url);
      }
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const url = this.history[this.historyIndex];

      if (url === 'browser://home') {
        this.loadHomePage();
      } else {
        this.loadUrl(url);
      }
    }
  }

  refresh() {
    const iframe = this.windowElement.querySelector('#browserFrame');
    if (!iframe) return;

    if (this.currentUrl === 'browser://home') {
      this.loadHomePage();
    } else {
      iframe.src = iframe.src;
    }
  }
}

// Initialize Browser App
window.browserApp = new BrowserApp();
