// ============================================
// FakeGuardAI - Main JavaScript
// ============================================

const API_BASE = 'http://127.0.0.1:5001';

// ===== BACKGROUND PARTICLES =====
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
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
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
});

const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
  themeBtn.querySelector('.theme-icon').textContent = isLight ? '🌙' : '☀️';
});

// ===== EXAMPLE URL =====
document.getElementById('btn-example').addEventListener('click', () => {
  document.getElementById('url-input').value = 'https://www.bbc.com/news/articles/c4gzge8nyero';
});

// ===== CLEAR INPUT =====
document.getElementById('btn-clear').addEventListener('click', () => {
  document.getElementById('url-input').value = '';
  document.getElementById('results-section').style.display = 'none';
});

// ===== ANALYZE FUNCTION =====
document.getElementById('btn-analyze').addEventListener('click', analyze);
document.getElementById('btn-new-analysis').addEventListener('click', () => {
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('url-input').focus();
});

async function analyze() {
  const url = document.getElementById('url-input').value.trim();
  if (!url || !url.startsWith('http')) { alert('Please enter a valid URL.'); return; }

  showLoading(true);
  const statuses = ['Fetching source...', 'Extracting metadata...', 'Checking domain reputation...', 'Analyzing content consistency...', 'Finalizing AI verdict...'];
  let si = 0;
  const statusInterval = setInterval(() => {
    si = (si + 1) % statuses.length;
    document.getElementById('loader-status').textContent = statuses[si];
  }, 1200);

  try {
    const res = await fetch(`${API_BASE}/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    clearInterval(statusInterval);
    showLoading(false);
    
    if (data.error) { alert(data.error); return; }
    displayResults(data);
  } catch (err) {
    clearInterval(statusInterval);
    showLoading(false);
    console.warn('Backend unavailable:', err);
    alert('Server is currently offline. Please ensure the backend is running.');
  }
}

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('visible', show);
  overlay.style.display = show ? 'flex' : 'none';
}

function displayResults(data) {
  const section = document.getElementById('results-section');
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 1. Verdict Badge
  const badge = document.getElementById('prediction-badge');
  const label = document.getElementById('prediction-label');
  const subtitle = document.getElementById('prediction-subtitle');
  badge.className = 'prediction-badge ' + (data.prediction || 'fake').toLowerCase();
  label.textContent = data.prediction || 'Unknown';
  subtitle.textContent = data.metadata ? `Source: ${data.metadata.domain}` : '';

  // 2. Confidence Meter
  const pct = data.confidence || 0;
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (pct / 100) * circumference;
  const fill = document.getElementById('meter-fill');
  fill.style.strokeDasharray = circumference;
  setTimeout(() => { fill.style.strokeDashoffset = offset; }, 100);
  document.getElementById('meter-text').textContent = pct + '%';

  // 3. Trust index
  const cred = data.credibility || 50;
  document.getElementById('trust-fill').style.width = cred + '%';
  document.getElementById('trust-score').textContent = cred + '%';
  document.getElementById('trust-label').textContent = cred > 70 ? 'High Trust' : cred > 40 ? 'Moderate Risk' : 'High Risk';

  // 4. Reasoning
  document.getElementById('reasoning-text').textContent = data.reason || '';
  const tagsEl = document.getElementById('manipulation-tags');
  tagsEl.innerHTML = '';
  (data.manipulation || []).forEach(m => {
    const tag = document.createElement('span');
    tag.className = 'manip-tag emotion';
    tag.textContent = m;
    tagsEl.appendChild(tag);
  });

  drawEmotionChart(data.emotions);

  // 5. Red Flags
  const hlEl = document.getElementById('highlighted-text');
  hlEl.innerHTML = '';
  (data.suspicious_sentences || []).forEach(s => {
    const p = document.createElement('p');
    p.className = 'suspicious-item';
    p.textContent = `• ${s}`;
    hlEl.appendChild(p);
  });

  // 6. Verification Path
  const fcList = document.getElementById('factcheck-list');
  fcList.innerHTML = '';
  (data.suggestions || []).forEach(s => {
    const li = document.createElement('li');
    li.className = 'factcheck-item';
    li.textContent = s;
    fcList.appendChild(li);
  });

  saveToHistory({
    prediction: data.prediction,
    confidence: data.confidence,
    timestamp: new Date().toLocaleTimeString(),
    url: document.getElementById('url-input').value
  });
}

// ===== HISTORY =====
function saveToHistory(item) {
  let history = JSON.parse(localStorage.getItem('fakeguard_history') || '[]');
  history.unshift(item);
  history = history.slice(0, 10);
  localStorage.setItem('fakeguard_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('fakeguard_history') || '[]');
  const list = document.getElementById('history-list');
  if (history.length === 0) return;
  document.getElementById('history-section').style.display = 'block';
  list.innerHTML = '';
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item glass-card';
    div.innerHTML = `<div>${item.timestamp}</div><div><strong>${item.prediction}</strong> (${item.confidence}%)</div><div class="hist-url">${item.url.substring(0, 40)}...</div>`;
    list.appendChild(div);
  });
}
document.getElementById('btn-clear-history').addEventListener('click', () => {
    localStorage.removeItem('fakeguard_history');
    document.getElementById('history-section').style.display = 'none';
});

// ===== CHART =====
function drawEmotionChart(emotions) {
  const canvas = document.getElementById('emotion-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const keys = Object.keys(emotions || {});
  const colors = ['#FF3D71', '#ff8c00', '#7B61FF', '#00F5FF', '#4ecdc4'];
  keys.forEach((key, i) => {
    const val = emotions[key];
    const barH = (val / 100) * (h - 60);
    const x = 20 + i * (w / keys.length);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, h - 30 - barH, 30, barH);
    ctx.fillStyle = '#8892b0';
    ctx.font = '10px Inter';
    ctx.fillText(key, x, h - 10);
  });
}

// ===== NEWS FEED =====
async function fetchNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="news-loading-inline">Connecting to global news stream...</div>';
  setTimeout(() => {
    grid.innerHTML = '';
    const demoNews = [
      { title: 'Global Climate Summit 2026', trust: 85, source: 'BBC' },
      { title: 'New Mars Colony Successful', trust: 92, source: 'NASA' },
      { title: 'AI Governance Treaty Signed', trust: 88, source: 'Reuters' }
    ];
    demoNews.forEach(n => {
      const card = document.createElement('div');
      card.className = 'news-card glass-card';
      card.innerHTML = `<h4>${n.title}</h4><div class="news-meta"><span>${n.source}</span><span class="trust-badge">Trust: ${n.trust}%</span></div>`;
      grid.appendChild(card);
    });
  }, 1000);
}
fetchNews();

// ===== CHATBOT =====
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chatbot-window');
const chatInput = document.getElementById('chatbot-input');
const chatSend = document.getElementById('chatbot-send');
const chatMessages = document.getElementById('chatbot-messages');
chatToggle.addEventListener('click', () => { chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none'; });
chatSend.addEventListener('click', () => {
  const msg = chatInput.value.trim();
  if (!msg) return;
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = msg;
  chatMessages.appendChild(div);
  chatInput.value = '';
  setTimeout(() => {
    const bdiv = document.createElement('div');
    bdiv.className = 'chat-msg bot';
    bdiv.textContent = "I'm analyzing that query. Remember to verify URLs before sharing!";
    chatMessages.appendChild(bdiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 600);
});

console.log('🛡️ FakeGuardAI URL-Engine initialized.');
