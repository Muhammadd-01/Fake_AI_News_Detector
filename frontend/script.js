// ============================================
// FakeGuardAI - Main JavaScript
// Now with user authentication, feedback page, text check, and admin controls!
// ============================================

const API_BASE = 'http://127.0.0.1:5002';

// ===== BACKGROUND PARTICLES =====
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5, o: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${p.o})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,245,255,${0.08 * (1 - dist / 120)})`; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== TYPING ANIMATION =====
(function initTyping() {
  const words = ['Detector', 'Analyzer', 'Shield', 'Guardian'];
  const el = document.getElementById('typed-text');
  if (!el) return;
  let wi = 0, ci = 0, deleting = false;
  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.substring(0, ci + 1); ci++;
      if (ci === word.length) { deleting = true; setTimeout(type, 2000); return; }
    } else {
      el.textContent = word.substring(0, ci - 1); ci--;
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 50 : 120);
  }
  type();
})();

// ===== STATS COUNTER =====
(function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-number').forEach(el => {
          const target = parseInt(el.dataset.target);
          let current = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current.toLocaleString();
          }, 30);
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  const stats = document.querySelector('.hero-stats');
  if (stats) observer.observe(stats);
})();

// ===== NAVBAR & THEME =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('open');
  });
});

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
});

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    themeBtn.querySelector('.theme-icon').textContent = isLight ? '🌙' : '☀️';
  });
}

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ===== USER AUTHENTICATION STATE MANAGEMENT =====
function getToken() { return localStorage.getItem('fakeguard_token'); }
function setToken(token) { localStorage.setItem('fakeguard_token', token); }
function removeToken() { localStorage.removeItem('fakeguard_token'); localStorage.removeItem('fakeguard_user'); }
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('fakeguard_user'));
  } catch {
    return null;
  }
}
function setUser(user) { localStorage.setItem('fakeguard_user', JSON.stringify(user)); }

function updateAuthUI() {
  const user = getUser();
  const token = getToken();
  const authBtns = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const adminBtn = document.getElementById('btn-admin-nav');

  const isLoggedIn = !!(user && token);
  document.body.classList.toggle('logged-in', isLoggedIn);

  if (isLoggedIn) {
    if (authBtns) authBtns.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    const avatar = document.getElementById('user-avatar');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    
    const uName = document.getElementById('dropdown-user-name');
    const uEmail = document.getElementById('dropdown-user-email');
    if (uName) uName.textContent = user.name;
    if (uEmail) uEmail.textContent = user.email;

    if (user.role === 'admin') {
      if (adminBtn) adminBtn.style.display = 'flex';
    } else {
      if (adminBtn) adminBtn.style.display = 'none';
    }

    // Fetch dynamic user history and global news when logged in
    renderHistory();
    fetchNews();
  } else {
    if (authBtns) authBtns.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';

    // Clear views for logged out state
    const historySection = document.getElementById('history-section');
    if (historySection) historySection.style.display = 'none';
    const grid = document.getElementById('news-grid');
    if (grid) grid.innerHTML = '';
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) resultsSection.style.display = 'none';
  }
}

// Modal Toggle Logic
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginBtnNav = document.getElementById('btn-login-nav');
const signupBtnNav = document.getElementById('btn-signup-nav');
const loginClose = document.getElementById('login-modal-close');
const signupClose = document.getElementById('signup-modal-close');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

if (loginBtnNav) loginBtnNav.addEventListener('click', () => { loginModal.style.display = 'flex'; });
if (signupBtnNav) signupBtnNav.addEventListener('click', () => { signupModal.style.display = 'flex'; });
if (loginClose) loginClose.addEventListener('click', () => { loginModal.style.display = 'none'; });
if (signupClose) signupClose.addEventListener('click', () => { signupModal.style.display = 'none'; });

if (switchToSignup) switchToSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'none';
  signupModal.style.display = 'flex';
});
if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupModal.style.display = 'none';
  loginModal.style.display = 'flex';
});

// Click outside modal to close
window.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === signupModal) signupModal.style.display = 'none';
});

// Lock overlay button action listeners
document.querySelectorAll('.btn-lock-login').forEach(btn => {
  btn.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'flex'; });
});
document.querySelectorAll('.btn-lock-signup').forEach(btn => {
  btn.addEventListener('click', () => { if (signupModal) signupModal.style.display = 'flex'; });
});

// Dropdown Toggle
const userAvatar = document.getElementById('user-avatar');
const userDropdown = document.getElementById('user-dropdown');
if (userAvatar) {
  userAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
  });
}
document.addEventListener('click', () => {
  if (userDropdown) userDropdown.style.display = 'none';
});

// SIGNUP FORM SUBMISSION
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.ok ? await res.json() : null;
      if (res.ok && data) {
        setToken(data.token);
        setUser(data.user);
        updateAuthUI();
        signupModal.style.display = 'none';
        signupForm.reset();
        showToast(`Welcome to FakeGuardAI, ${data.user.name}! 🎉`, 'success');
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Signup failed.', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to authentication server.', 'error');
    }
  });
}

// LOGIN FORM SUBMISSION
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.ok ? await res.json() : null;
      if (res.ok && data) {
        setToken(data.token);
        setUser(data.user);
        updateAuthUI();
        loginModal.style.display = 'none';
        loginForm.reset();
        showToast(`Welcome back, ${data.user.name}! 🛡️`, 'success');
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to authentication server.', 'error');
    }
  });
}

// LOGOUT ACTION
const logoutBtn = document.getElementById('btn-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    removeToken();
    updateAuthUI();
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    showToast('Logged out successfully.', 'info');
  });
}

// ===== ANALYZER MODE SWITCHER (URL vs TEXT) =====
let analyzerMode = 'url';
const modeUrlBtn = document.getElementById('mode-url');
const modeTextBtn = document.getElementById('mode-text');
const urlContainer = document.getElementById('url-analysis-container');
const textContainer = document.getElementById('text-analysis-container');

if (modeUrlBtn && modeTextBtn) {
  modeUrlBtn.addEventListener('click', () => {
    analyzerMode = 'url';
    modeUrlBtn.classList.add('active');
    modeTextBtn.classList.remove('active');
    urlContainer.style.display = 'block';
    textContainer.style.display = 'none';
  });

  modeTextBtn.addEventListener('click', () => {
    analyzerMode = 'text';
    modeTextBtn.classList.add('active');
    modeUrlBtn.classList.remove('active');
    urlContainer.style.display = 'none';
    textContainer.style.display = 'block';
  });
}

// ===== EXAMPLE URL =====
const btnExample = document.getElementById('btn-example');
if (btnExample) {
  btnExample.addEventListener('click', () => {
    if (analyzerMode === 'url') {
      document.getElementById('url-input').value = 'https://www.bbc.com/news/articles/c4gzge8nyero';
    } else {
      document.getElementById('text-input').value = 'A shocking leaked document reveals that a secret organization has banned reverse aging technology to protect big pharma profits. Scientists who discovered the miracle cure were reportedly silenced before the truth gets deleted.';
    }
  });
}

// ===== CLEAR INPUT =====
const btnClear = document.getElementById('btn-clear');
if (btnClear) {
  btnClear.addEventListener('click', () => {
    document.getElementById('url-input').value = '';
    document.getElementById('text-input').value = '';
    document.getElementById('results-section').style.display = 'none';
  });
}

// ===== ANALYZE FUNCTION =====
const btnAnalyze = document.getElementById('btn-analyze');
if (btnAnalyze) {
  btnAnalyze.addEventListener('click', analyze);
}
const btnNewAnalysis = document.getElementById('btn-new-analysis');
if (btnNewAnalysis) {
  btnNewAnalysis.addEventListener('click', () => {
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
    if (analyzerMode === 'url') {
      document.getElementById('url-input').focus();
    } else {
      document.getElementById('text-input').focus();
    }
  });
}

async function analyze() {
  let endpoint = '';
  let payload = {};

  if (analyzerMode === 'url') {
    const url = document.getElementById('url-input').value.trim();
    if (!url || !url.startsWith('http')) {
      showToast('Please enter a valid HTTP/HTTPS URL.', 'error');
      return;
    }
    endpoint = '/analyze-url';
    payload = { url };
  } else {
    const text = document.getElementById('text-input').value.trim();
    if (!text || text.length < 50) {
      showToast('Please enter at least 50 characters of text.', 'error');
      return;
    }
    endpoint = '/api/analyze-text';
    payload = { text };
  }

  showLoading(true);
  let statuses = [];
  if (analyzerMode === 'url') {
    statuses = [
      'Extracting platform content...',
      'Analyzing site metadata...',
      'Initiating real-time web search...',
      'Cross-referencing global fact-checkers...',
      'Scanning reputable news networks...',
      'Blending AI predictions & evidence...',
      'Compiling final integrity report...'
    ];
  } else {
    statuses = [
      'Analyzing text structures...',
      'Evaluating emotional loads...',
      'Scanning for propaganda indicators...',
      'Initiating claims fact-check search...',
      'Comparing with verified databases...',
      'Blending linguistic scores...',
      'Compiling final integrity report...'
    ];
  }
  let si = 0;
  if (document.getElementById('loader-status')) {
    document.getElementById('loader-status').textContent = statuses[0];
  }
  const statusInterval = setInterval(() => {
    si = (si + 1) % statuses.length;
    const statusEl = document.getElementById('loader-status');
    if (statusEl) statusEl.textContent = statuses[si];
  }, 1200);

  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (res.status === 401) {
      clearInterval(statusInterval);
      showLoading(false);
      removeToken();
      updateAuthUI();
      document.getElementById('admin-panel').style.display = 'none';
      document.getElementById('results-section').style.display = 'none';
      showToast('Session expired. Please log in again.', 'error');
      return;
    }
    
    const data = await res.json();
    clearInterval(statusInterval);
    showLoading(false);
    
    if (data.error) {
      showToast(data.error, 'error');
      return;
    }
    displayResults(data);
    showToast('Analysis completed successfully!', 'success');
  } catch (err) {
    clearInterval(statusInterval);
    showLoading(false);
    console.warn('Backend connection error:', err);
    showToast('Verification server is offline or busy.', 'error');
  }
}

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.toggle('visible', show);
    overlay.style.display = show ? 'flex' : 'none';
  }
}

function displayResults(data) {
  const section = document.getElementById('results-section');
  if (!section) return;
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 1. Verdict Badge
  const badge = document.getElementById('prediction-badge');
  const label = document.getElementById('prediction-label');
  const subtitle = document.getElementById('prediction-subtitle');
  if (badge && label) {
    badge.className = 'prediction-badge ' + (data.prediction || 'fake').toLowerCase();
    label.textContent = data.prediction || 'Unknown';
  }
  if (subtitle) {
    subtitle.textContent = data.metadata ? `Source Reputation: ${data.metadata.domain}` : 'Linguistic Text Audit';
  }

  // 2. Confidence Meter
  const pct = data.confidence || 0;
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (pct / 100) * circumference;
  const fill = document.getElementById('meter-fill');
  if (fill) {
    fill.style.strokeDasharray = circumference;
    setTimeout(() => { fill.style.strokeDashoffset = offset; }, 100);
  }
  const meterText = document.getElementById('meter-text');
  if (meterText) meterText.textContent = pct + '%';

  // 3. Trust Index
  const cred = data.credibility || 50;
  const trustFill = document.getElementById('trust-fill');
  const trustScore = document.getElementById('trust-score');
  const trustLabel = document.getElementById('trust-label');
  if (trustFill) trustFill.style.width = cred + '%';
  if (trustScore) trustScore.textContent = cred + '%';
  if (trustLabel) {
    trustLabel.textContent = cred > 75 ? 'Verified High Trust Index' : cred > 45 ? 'Exhibits Moderate Risks' : 'High Misinformation Threat';
  }

  // 4. Reasoning
  const rText = document.getElementById('reasoning-text');
  if (rText) rText.textContent = data.reason || 'No detailed review compiled.';
  
  const tagsEl = document.getElementById('manipulation-tags');
  if (tagsEl) {
    tagsEl.innerHTML = '';
    (data.manipulation || []).forEach(m => {
      const tag = document.createElement('span');
      tag.className = 'manip-tag emotion';
      tag.textContent = m;
      tagsEl.appendChild(tag);
    });
  }

  drawEmotionChart(data.emotions);

  // 5. Red Flags
  const hlEl = document.getElementById('highlighted-text');
  if (hlEl) {
    hlEl.innerHTML = '';
    (data.suspicious_sentences || []).forEach(s => {
      const p = document.createElement('p');
      p.className = 'suspicious-item';
      p.style.marginBottom = '0.5rem';
      p.innerHTML = `<span class="suspicious">${s}</span>`;
      hlEl.appendChild(p);
    });
  }

  // 6. Verification Path
  const fcList = document.getElementById('factcheck-list');
  if (fcList) {
    fcList.innerHTML = '';
    (data.suggestions || []).forEach(s => {
      const li = document.createElement('li');
      li.className = 'factcheck-item';
      li.innerHTML = `<span class="factcheck-icon">✓</span> <span>${s}</span>`;
      fcList.appendChild(li);
    });
  }

  // 7. Cross-Reference Sources
  const crossRefCard = document.getElementById('cross-reference-card');
  const crossRefList = document.getElementById('cross-reference-list');
  if (crossRefCard && crossRefList) {
    if (data.cross_references && data.cross_references.length > 0) {
      crossRefCard.style.display = 'block';
      crossRefList.innerHTML = '';
      data.cross_references.forEach(ref => {
        const item = document.createElement('div');
        item.className = 'cross-reference-item';
        
        let badgeClass = 'unverified';
        if (ref.category === 'Reputable News') badgeClass = 'news';
        else if (ref.category === 'Fact Check (Debunked)') badgeClass = 'fact-fake';
        else if (ref.category === 'Fact Check (Verified)') badgeClass = 'fact-real';
        
        item.innerHTML = `
          <div class="cross-reference-meta">
            <a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="cross-reference-title">${ref.title}</a>
            <span class="cross-reference-badge ${badgeClass}">${ref.category}</span>
          </div>
          <p class="cross-reference-snippet">${ref.snippet}</p>
        `;
        crossRefList.appendChild(item);
      });
    } else {
      crossRefCard.style.display = 'none';
    }
  }

  // Sync and render updated verification history from MongoDB
  renderHistory();
}

// ===== DATABASE HISTORY SYNC =====
async function renderHistory() {
  const token = getToken();
  if (!token) return;

  const list = document.getElementById('history-list');
  const section = document.getElementById('history-section');
  if (!list || !section) return;

  try {
    const res = await fetch(`${API_BASE}/api/user/analyses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      removeToken();
      updateAuthUI();
      return;
    }

    if (res.ok) {
      const history = await res.json();
      if (history.length === 0) {
        section.style.display = 'none';
        return;
      }
      section.style.display = 'block';
      list.innerHTML = history.map(item => {
        const dateStr = new Date(item.created_at).toLocaleString();
        return `
          <div class="history-item glass-card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div style="font-size: 0.8rem; color: var(--text-dim);">${dateStr}</div>
            <div><strong>Verdict: ${item.prediction}</strong> (${item.confidence}%)</div>
            <div class="hist-url" style="color: var(--primary); font-size: 0.85rem; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.input}">${item.input}</div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.warn('Failed to load user history from DB:', err);
  }
}

const btnClearHistory = document.getElementById('btn-clear-history');
if (btnClearHistory) {
  btnClearHistory.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear your audit trail history?')) return;
    
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/user/analyses`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        removeToken();
        updateAuthUI();
        return;
      }
      
      if (res.ok) {
        renderHistory();
        showToast('Audit trail cleared successfully.', 'info');
      } else {
        showToast('Failed to clear audit trail.', 'error');
      }
    } catch {
      showToast('Connection to server failed.', 'error');
    }
  });
}

// ===== CHART =====
function drawEmotionChart(emotions) {
  const canvas = document.getElementById('emotion-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const keys = Object.keys(emotions || {});
  if (!keys.length) return;
  const colors = ['#FF3D71', '#ff8c00', '#7B61FF', '#00F5FF', '#4ecdc4'];
  keys.forEach((key, i) => {
    const val = emotions[key];
    const barH = (val / 100) * (h - 60);
    const x = 20 + i * (w / keys.length);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, h - 30 - barH, 35, barH);
    ctx.fillStyle = '#8892b0';
    ctx.font = '10px Inter';
    ctx.fillText(key.toUpperCase(), x, h - 10);
  });
}

// ===== NEWS FEED =====
async function fetchNews() {
  const token = getToken();
  if (!token) return;

  const grid = document.getElementById('news-grid');
  if (!grid) return;
  
  const categorySelect = document.getElementById('news-category');
  const category = categorySelect ? categorySelect.value : 'general';
  
  const loadingEl = document.getElementById('news-loading');
  if (loadingEl) loadingEl.style.display = 'flex';
  grid.innerHTML = '';
  
  try {
    const res = await fetch(`${API_BASE}/api/news?category=${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.status === 401) {
      removeToken();
      updateAuthUI();
      return;
    }
    
    if (!res.ok) {
      const errData = await res.json();
      grid.innerHTML = `<div class="news-error" style="grid-column: span 3; text-align: center; color: var(--accent); padding: 2rem;">${errData.error || 'Failed to sync news.'}</div>`;
      return;
    }
    
    const news = await res.json();
    if (loadingEl) loadingEl.style.display = 'none';
    
    if (news.length === 0) {
      grid.innerHTML = '<div class="news-empty" style="grid-column: span 3; text-align: center; color: var(--text-dim); padding: 2rem;">No articles found in this stream.</div>';
      return;
    }
    
    grid.innerHTML = news.map(n => `
      <div class="news-card glass-card">
        <div class="news-card-body">
          <div class="news-card-source">${n.source}</div>
          <h4 class="news-card-title">${n.title}</h4>
          <div class="news-card-date">${n.pubDate || 'Updated recently'}</div>
        </div>
        <div class="news-card-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span class="trust-badge ${n.tag}">Trust Score: ${n.trust}%</span>
          <a href="${n.link}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; color: var(--primary);">Read ➔</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    console.warn('Could not load global news stream:', err);
    grid.innerHTML = '<div class="news-error" style="grid-column: span 3; text-align: center; color: var(--accent); padding: 2rem;">Verification news node offline.</div>';
  }
}

// ===== CHATBOT =====
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chatbot-window');
const chatInput = document.getElementById('chatbot-input');
const chatSend = document.getElementById('chatbot-send');
const chatMessages = document.getElementById('chatbot-messages');
const chatClose = document.getElementById('chatbot-close');

if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
  });
}
if (chatClose) {
  chatClose.addEventListener('click', () => { chatWindow.style.display = 'none'; });
}

if (chatSend) {
  chatSend.addEventListener('click', handleChatbotSend);
}
if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatbotSend();
  });
}

function handleChatbotSend() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = msg;
  chatMessages.appendChild(div);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    const bdiv = document.createElement('div');
    bdiv.className = 'chat-msg bot';
    bdiv.textContent = "I am processing that. Make sure to paste a URL or direct text in our Verification Engine above for a complete analysis report! 🛡️";
    chatMessages.appendChild(bdiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800);
}

// ===== CONTACT / FEEDBACK SYSTEM =====
const starContainer = document.getElementById('star-rating');
const ratingInput = document.getElementById('feedback-rating');

if (starContainer) {
  const stars = starContainer.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value);
      ratingInput.value = val;
      stars.forEach((s, idx) => {
        s.classList.toggle('active', idx < val);
      });
    });

    star.addEventListener('mouseover', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s, idx) => {
        if (idx < val) s.style.color = '#ffc800';
      });
    });

    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.style.color = '');
    });
  });
}

const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const subject = document.getElementById('feedback-subject').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    const rating = parseInt(ratingInput.value);

    if (rating === 0) {
      showToast('Please rate your experience (select stars).', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, rating })
      });

      if (res.ok) {
        showToast('Feedback submitted successfully! Thank you.', 'success');
        feedbackForm.reset();
        ratingInput.value = 0;
        starContainer.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        loadTestimonials();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to submit feedback.', 'error');
      }
    } catch {
      showToast('Server connection failed.', 'error');
    }
  });
}

async function loadTestimonials() {
  const list = document.getElementById('testimonials-list');
  if (!list) return;

  try {
    const res = await fetch(`${API_BASE}/api/feedback`);
    if (res.ok) {
      const feedbacks = await res.json();
      if (feedbacks.length === 0) {
        list.innerHTML = '<div class="testimonial-placeholder">No feedback yet. Be the first! 🚀</div>';
        return;
      }
      
      list.innerHTML = feedbacks.map(f => `
        <div class="testimonial-item">
          <div class="testimonial-name">${f.name}</div>
          <div class="testimonial-stars">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
          <p class="testimonial-message">${f.message}</p>
          <div class="testimonial-date">${new Date(f.created_at).toLocaleDateString()}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Could not load feedbacks stream:', err);
  }
}

// ===== ADMIN PANEL LOGIC =====
const btnAdminNav = document.getElementById('btn-admin-nav');
if (btnAdminNav) {
  btnAdminNav.addEventListener('click', () => {
    const panel = document.getElementById('admin-panel');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
    loadAdminStats();
    loadAdminTab('admin-users-tab');
  });
}

// Admin Tab Switching
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.style.display = 'none';
    });
    const activeTabId = tab.dataset.tab;
    document.getElementById(activeTabId).style.display = 'block';
    loadAdminTab(activeTabId);
  });
});

async function loadAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('admin-total-users').textContent = stats.total_users;
      document.getElementById('admin-total-feedbacks').textContent = stats.total_feedbacks;
      document.getElementById('admin-total-analyses').textContent = stats.total_analyses;
    }
  } catch (err) {
    showToast('Failed to load admin stats.', 'error');
  }
}

async function loadAdminTab(tabId) {
  const token = getToken();
  if (!token) return;

  try {
    if (tabId === 'admin-users-tab') {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const users = await res.json();
        const tbody = document.getElementById('admin-users-tbody');
        tbody.innerHTML = users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="admin-role-badge ${u.role}">${u.role.toUpperCase()}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>
              ${u.role !== 'admin' ? `<button class="btn-delete" onclick="deleteUser('${u._id}')">Delete</button>` : '—'}
            </td>
          </tr>
        `).join('');
      }
    } else if (tabId === 'admin-feedbacks-tab') {
      const res = await fetch(`${API_BASE}/api/admin/feedbacks`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const feedbacks = await res.json();
        const tbody = document.getElementById('admin-feedbacks-tbody');
        tbody.innerHTML = feedbacks.map(f => `
          <tr>
            <td>${f.name}</td>
            <td>${f.email}</td>
            <td>${f.subject}</td>
            <td style="color: #ffc800">${'★'.repeat(f.rating)}</td>
            <td>${new Date(f.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn-delete" onclick="deleteFeedback('${f._id}')">Delete</button>
            </td>
          </tr>
        `).join('');
      }
    } else if (tabId === 'admin-analyses-tab') {
      const res = await fetch(`${API_BASE}/api/admin/analyses`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const logs = await res.json();
        const tbody = document.getElementById('admin-analyses-tbody');
        tbody.innerHTML = logs.map(l => `
          <tr>
            <td>${l.user_email || 'Anonymous'}</td>
            <td>${l.type.toUpperCase()}</td>
            <td title="${l.input}">${l.input.length > 40 ? l.input.substring(0, 40) + '...' : l.input}</td>
            <td><span class="prediction-badge-mini ${l.prediction.toLowerCase()}">${l.prediction}</span></td>
            <td>${l.confidence}%</td>
            <td>${new Date(l.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    showToast('Failed to load admin data tab.', 'error');
  }
}

// Global functions for delete buttons
window.deleteUser = async function(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/user/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.ok) {
      showToast('User deleted successfully.', 'success');
      loadAdminStats();
      loadAdminTab('admin-users-tab');
    } else {
      showToast('Failed to delete user.', 'error');
    }
  } catch {
    showToast('Server error.', 'error');
  }
};

window.deleteFeedback = async function(id) {
  if (!confirm('Are you sure you want to delete this feedback submission?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/feedback/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.ok) {
      showToast('Feedback deleted.', 'success');
      loadAdminStats();
      loadAdminTab('admin-feedbacks-tab');
      loadTestimonials();
    } else {
      showToast('Failed to delete feedback.', 'error');
    }
  } catch {
    showToast('Server error.', 'error');
  }
};

// ===== PDF EXPORT MOCK / PRINT SYSTEM =====
const btnExportPdf = document.getElementById('btn-export-pdf');
if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    showToast('Generating PDF Report... Opening print view.', 'info');
    setTimeout(() => {
      window.print();
    }, 1000);
  });
}

// ===== INITIALIZE FEEDBACKS & AUTH STATE =====
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadTestimonials();
  renderHistory();
  fetchNews();

  // News category dropdown select trigger
  const newsCategorySelect = document.getElementById('news-category');
  if (newsCategorySelect) {
    newsCategorySelect.addEventListener('change', fetchNews);
  }

  // News search dynamic query filter
  const newsSearchInput = document.getElementById('news-search');
  if (newsSearchInput) {
    newsSearchInput.addEventListener('input', () => {
      const query = newsSearchInput.value.toLowerCase().trim();
      const cards = document.querySelectorAll('#news-grid .news-card');
      cards.forEach(card => {
        const title = card.querySelector('.news-card-title').textContent.toLowerCase();
        const source = card.querySelector('.news-card-source').textContent.toLowerCase();
        if (title.includes(query) || source.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});

console.log('🛡️ FakeGuardAI URL-Engine & Database Client initialized.');
