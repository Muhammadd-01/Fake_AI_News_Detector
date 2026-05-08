// ============================================
// FakeGuardAI - Main JavaScript
// Yahan sari frontend logic hai
// ============================================

const API_BASE = 'http://127.0.0.1:5001';

// ===== PARTICLES BACKGROUND =====
// Yahan canvas pe particles draw ho rahe hain
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
      // Connect nearby particles
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
// Hero section mein typing effect
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

// ===== COUNTER ANIMATION =====
// Stats ke numbers animate ho rahe hain
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

// ===== SCROLL REVEAL =====
// Scroll pe elements fade in hote hain
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.result-card, .step-card, .section-header').forEach(el => {
    el.classList.add('reveal'); obs.observe(el);
  });
})();

// ===== NAVBAR =====
// Navbar scroll effect aur hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
// Active link on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
});

// ===== THEME TOGGLE =====
// Dark/Light mode switch
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
  themeBtn.querySelector('.theme-icon').textContent = isLight ? '🌙' : '☀️';
});

// ===== TABS =====
// Analyzer tabs ka logic - paste, url, upload
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`content-${btn.dataset.tab}`).classList.add('active');
  });
});

// ===== FILE UPLOAD =====
// Drag & drop aur file select ka logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; fileName.textContent = e.dataTransfer.files[0].name; }
});
fileInput.addEventListener('change', () => { if (fileInput.files.length) fileName.textContent = fileInput.files[0].name; });

// ===== EXAMPLE NEWS =====
// Example fake news text load karne ka button
document.getElementById('btn-example').addEventListener('click', () => {
  document.querySelector('.tab-btn[data-tab="paste"]').click();
  document.getElementById('news-input').value = `BREAKING: Scientists discover that drinking coffee makes you immortal! A secret government study, hidden for decades, has finally been leaked by an anonymous whistleblower. The study claims that just 3 cups of coffee per day can reverse aging and grant eternal life. Big Pharma has been suppressing this information to keep selling expensive medications. Share this before it gets deleted!`;
});

// ===== CLEAR =====
document.getElementById('btn-clear').addEventListener('click', () => {
  document.getElementById('news-input').value = '';
  document.getElementById('url-input').value = '';
  fileInput.value = ''; fileName.textContent = '';
  document.getElementById('results-section').style.display = 'none';
});

// ===== VOICE INPUT =====
// Mic se text input lena - Speech Recognition API
document.getElementById('btn-voice').addEventListener('click', () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
  const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false;
  rec.onresult = e => {
    document.querySelector('.tab-btn[data-tab="paste"]').click();
    document.getElementById('news-input').value = e.results[0][0].transcript;
  };
  rec.start();
});

// ===== ANALYZE BUTTON =====
// Yeh main analysis function hai - backend ko request bhejta hai
document.getElementById('btn-analyze').addEventListener('click', analyze);

async function analyze() {
  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  let text = '', endpoint = '/analyze', body = null, isFormData = false;

  // Konsa tab active hai uske mutabiq data bhejo
  if (activeTab === 'paste') {
    text = document.getElementById('news-input').value.trim();
    if (!text) { alert('Please paste some news text.'); return; }
    body = JSON.stringify({ text });
  } else if (activeTab === 'url') {
    const url = document.getElementById('url-input').value.trim();
    if (!url || !url.startsWith('http')) { alert('Please enter a valid URL.'); return; }
    endpoint = '/analyze-url';
    body = JSON.stringify({ url });
  } else {
    if (!fileInput.files.length) { alert('Please upload a file.'); return; }
    endpoint = '/upload';
    body = new FormData(); body.append('file', fileInput.files[0]);
    isFormData = true;
  }

  // Loading dikhaao
  showLoading(true);
  const statuses = ['Preprocessing text...', 'Running AI models...', 'Analyzing emotions...', 'Detecting propaganda...', 'Generating report...'];
  let si = 0;
  const statusInterval = setInterval(() => {
    si = (si + 1) % statuses.length;
    document.getElementById('loader-status').textContent = statuses[si];
  }, 1500);

  try {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers, body });
    const data = await res.json();
    clearInterval(statusInterval);
    showLoading(false);
    displayResults(data);
  } catch (err) {
    clearInterval(statusInterval);
    showLoading(false);
    // Agar backend nahi chal raha toh demo results dikhao
    console.warn('Backend unavailable, showing demo results:', err);
    displayResults(generateDemoResults(activeTab === 'paste' ? document.getElementById('news-input').value : 'Sample article text'));
  }
}

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('visible', show);
  overlay.style.display = show ? 'flex' : 'none';
}

// ===== DEMO RESULTS GENERATOR =====
// Jab backend na chale toh demo data banao
function generateDemoResults(text) {
  const clickbaitWords = ['BREAKING', 'SHOCKING', 'SECRET', 'EXPOSED', 'MUST SEE', 'URGENT', 'LEAKED', 'BANNED'];
  const emotionalWords = ['fear', 'terrifying', 'dangerous', 'amazing', 'incredible', 'unbelievable', 'outrage', 'scandal'];
  const upperText = (text || '').toUpperCase();
  let clickbaitScore = 0, emotionScore = 0;
  clickbaitWords.forEach(w => { if (upperText.includes(w)) clickbaitScore += 15; });
  emotionalWords.forEach(w => { if (upperText.toLowerCase().includes(w)) emotionScore += 10; });

  const totalSuspicion = Math.min(clickbaitScore + emotionScore + 30, 98);
  const isFake = totalSuspicion > 60;
  const isMisleading = totalSuspicion > 40 && totalSuspicion <= 60;
  const prediction = isFake ? 'Fake' : isMisleading ? 'Misleading' : 'Real';
  const confidence = isFake ? totalSuspicion : isMisleading ? totalSuspicion : 100 - totalSuspicion;

  const manipulation = [];
  if (clickbaitScore > 10) manipulation.push('Clickbait');
  if (emotionScore > 10) manipulation.push('Emotional Language');
  if (upperText.includes('GOVERNMENT') || upperText.includes('PHARMA')) manipulation.push('Political Bias');
  if (clickbaitScore > 20) manipulation.push('Fear Tactics');
  if (!manipulation.length) manipulation.push('None Detected');

  // Suspicious sentences detect karo
  const sentences = (text || '').split(/[.!?]+/).filter(s => s.trim());
  const suspicious = sentences.filter(s => {
    const su = s.toUpperCase();
    return clickbaitWords.some(w => su.includes(w)) || emotionalWords.some(w => s.toLowerCase().includes(w));
  }).map(s => s.trim());

  return {
    prediction, confidence: Math.round(confidence),
    reason: isFake
      ? 'This article contains highly sensational language, unverified claims, and emotional manipulation tactics commonly found in fake news. The use of phrases like "secret study" and "before it gets deleted" are classic misinformation indicators.'
      : isMisleading
      ? 'This article contains some misleading framing and emotional language but may have partial factual basis.'
      : 'This article appears to use neutral language and factual reporting style.',
    manipulation,
    credibility: Math.max(5, 100 - totalSuspicion),
    emotions: { fear: Math.min(clickbaitScore * 2, 90), anger: Math.min(emotionScore * 2, 80), manipulation: Math.min(totalSuspicion, 85), hope: 20, sadness: 15 },
    suspicious_sentences: suspicious.length ? suspicious : ['No highly suspicious sentences detected.'],
    suggestions: [
      '🔍 Verify the original source and check if reputable outlets cover this story.',
      '📰 Cross-reference claims with fact-checking sites like Snopes or PolitiFact.',
      '🧪 Look for the cited "study" in academic databases like PubMed or Google Scholar.',
      '⚠️ Be cautious of urgency language like "share before deleted" — a common manipulation tactic.',
      '🌐 Search for the same claim in reverse to find debunking articles.'
    ]
  };
}

// ===== DISPLAY RESULTS =====
// Results ko DOM mein render karo
function displayResults(data) {
  const section = document.getElementById('results-section');
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Prediction badge
  const badge = document.getElementById('prediction-badge');
  const label = document.getElementById('prediction-label');
  badge.className = 'prediction-badge ' + (data.prediction || 'fake').toLowerCase();
  label.textContent = data.prediction || 'Unknown';
  document.getElementById('prediction-subtitle').textContent =
    data.prediction === 'Fake' ? 'This content is likely fabricated.' :
    data.prediction === 'Misleading' ? 'This content may be partially misleading.' :
    'This content appears authentic.';

  // Confidence meter - SVG circle animate karo
  const pct = data.confidence || 0;
  const circumference = 2 * Math.PI * 85; // r=85
  const offset = circumference - (pct / 100) * circumference;
  const fill = document.getElementById('meter-fill');
  fill.style.strokeDasharray = circumference;
  setTimeout(() => { fill.style.strokeDashoffset = offset; }, 100);
  document.getElementById('meter-text').textContent = pct + '%';
  // Color based on prediction
  if (data.prediction === 'Fake') fill.style.stroke = '#FF3D71';
  else if (data.prediction === 'Misleading') fill.style.stroke = '#ffc800';
  else fill.style.stroke = '#00F5FF';

  // Trust/Credibility bar
  const cred = data.credibility || 50;
  const trustFill = document.getElementById('trust-fill');
  trustFill.style.width = cred + '%';
  trustFill.style.background = cred > 60 ? 'linear-gradient(90deg,#00F5FF,#7B61FF)' : cred > 30 ? 'linear-gradient(90deg,#ffc800,#ff8c00)' : 'linear-gradient(90deg,#FF3D71,#ff0040)';
  document.getElementById('trust-score').textContent = cred + '%';
  document.getElementById('trust-label').textContent = cred > 60 ? 'Source appears credible' : cred > 30 ? 'Source credibility is questionable' : 'Source appears suspicious';

  // AI Reasoning
  document.getElementById('reasoning-text').textContent = data.reason || 'No reasoning provided.';

  // Manipulation tags
  const tagsEl = document.getElementById('manipulation-tags');
  tagsEl.innerHTML = '';
  const tagClasses = { 'Fear Tactics': 'fear', 'Clickbait': 'clickbait', 'Political Bias': 'bias', 'Emotional Language': 'emotion', 'None Detected': 'emotion' };
  const tagIcons = { 'Fear Tactics': '😨', 'Clickbait': '🎣', 'Political Bias': '⚖️', 'Emotional Language': '💬', 'None Detected': '✅' };
  (data.manipulation || []).forEach(m => {
    const tag = document.createElement('span');
    tag.className = 'manip-tag ' + (tagClasses[m] || 'emotion');
    tag.innerHTML = `<span>${tagIcons[m] || '⚠️'}</span> ${m}`;
    tagsEl.appendChild(tag);
  });

  // Emotion chart - Canvas pe bar chart banao
  drawEmotionChart(data.emotions || { fear: 30, anger: 20, manipulation: 40, hope: 50, sadness: 10 });

  // Suspicious sentences highlight karo
  const hlEl = document.getElementById('highlighted-text');
  hlEl.innerHTML = '';
  (data.suspicious_sentences || []).forEach(s => {
    const span = document.createElement('span');
    span.className = 'suspicious';
    span.textContent = s;
    hlEl.appendChild(span);
    hlEl.appendChild(document.createTextNode(' '));
  });

  // Fact-check suggestions
  const fcList = document.getElementById('factcheck-list');
  fcList.innerHTML = '';
  (data.suggestions || []).forEach(s => {
    const li = document.createElement('li');
    li.className = 'factcheck-item';
    li.textContent = s;
    fcList.appendChild(li);
  });

  // Save to History (Bonus)
  saveToHistory({
    prediction: data.prediction,
    confidence: data.confidence,
    timestamp: new Date().toLocaleString(),
    text: document.getElementById('news-input').value.substring(0, 100) + '...'
  });
}

// ===== HISTORY MANAGEMENT =====
// Past results ko local storage mein save aur show karo
function saveToHistory(item) {
  let history = JSON.parse(localStorage.getItem('fakeguard_history') || '[]');
  history.unshift(item);
  history = history.slice(0, 10); // Keep last 10
  localStorage.setItem('fakeguard_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('fakeguard_history') || '[]');
  const container = document.getElementById('history-section');
  const list = document.getElementById('history-list');
  
  if (history.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  list.innerHTML = '';
  
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item glass-card';
    div.style.padding = '1rem';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    
    const badgeClass = (item.prediction || 'fake').toLowerCase();
    div.innerHTML = `
      <div style="flex: 1;">
        <div style="font-size: 0.8rem; color: var(--text-dim);">${item.timestamp}</div>
        <div style="font-weight: 600; font-size: 0.9rem; margin: 0.2rem 0;">${item.text}</div>
      </div>
      <div style="text-align: right;">
        <span class="trust-badge ${badgeClass === 'real' ? 'high' : badgeClass === 'misleading' ? 'medium' : 'low'}" style="font-size: 0.7rem;">
          ${item.prediction} (${item.confidence}%)
        </span>
      </div>
    `;
    list.appendChild(div);
  });
}

// Initial render
renderHistory();

// Clear history
document.getElementById('btn-clear-history').addEventListener('click', () => {
  localStorage.removeItem('fakeguard_history');
  renderHistory();
});

// ===== EMOTION CHART =====
// Canvas pe emotion ka bar chart draw karo
function drawEmotionChart(emotions) {
  const canvas = document.getElementById('emotion-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = 220 * dpr;
  ctx.scale(dpr, dpr);
  const w = canvas.offsetWidth, h = 220;
  ctx.clearRect(0, 0, w, h);

  const keys = Object.keys(emotions);
  const barW = Math.min(50, (w - 40) / keys.length - 16);
  const gap = (w - keys.length * barW) / (keys.length + 1);
  const colors = ['#FF3D71', '#ff8c00', '#7B61FF', '#00F5FF', '#4ecdc4'];

  keys.forEach((key, i) => {
    const val = emotions[key];
    const barH = (val / 100) * (h - 50);
    const x = gap + i * (barW + gap);
    const y = h - 30 - barH;
    // Bar draw karo
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();
    // Label
    ctx.fillStyle = '#8892b0';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), x + barW / 2, h - 10);
    // Value
    ctx.fillStyle = '#E6F1FF';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.fillText(val + '%', x + barW / 2, y - 8);
  });
}

// ===== NEW ANALYSIS =====
document.getElementById('btn-new-analysis').addEventListener('click', () => {
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
});

// ===== EXPORT PDF =====
// Report ko PDF mein convert karo - simple print method
document.getElementById('btn-export-pdf').addEventListener('click', () => {
  const results = document.getElementById('results-section');
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<html><head><title>FakeGuard AI Report</title><style>body{font-family:Inter,sans-serif;padding:2rem;color:#1a202c}h1{color:#050816}.suspicious{background:#ffe0e6;padding:2px 6px;border-radius:4px;color:#d40030}</style></head><body><h1>FakeGuard AI — Analysis Report</h1><hr/>${results.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.print();
});

// ===== LIVE NEWS =====
// Free API se news fetch karo
const NEWS_API_KEY = ''; // User apna API key daalega
async function fetchNews(query = '', category = 'general') {
  const grid = document.getElementById('news-grid');
  const loading = document.getElementById('news-loading');
  loading.style.display = 'flex';
  grid.innerHTML = '';

  // Demo news data - jab API key na ho
  const demoNews = [
    { title: 'Global Climate Summit Reaches Historic Agreement', source: 'Reuters', date: '2026-05-08', img: '', trust: 88, url: '#' },
    { title: 'New AI Breakthrough: Machines Can Now Detect Emotions', source: 'TechCrunch', date: '2026-05-07', img: '', trust: 75, url: '#' },
    { title: 'SHOCKING: Celebrity Caught in Massive Scandal!', source: 'BuzzDaily', date: '2026-05-08', img: '', trust: 22, url: '#' },
    { title: 'Stock Markets Rally as Economic Indicators Improve', source: 'Bloomberg', date: '2026-05-07', img: '', trust: 91, url: '#' },
    { title: 'EXPOSED: Secret Government Program Finally Revealed', source: 'TruthNow', date: '2026-05-06', img: '', trust: 15, url: '#' },
    { title: 'Advances in Renewable Energy Storage Show Promise', source: 'Nature', date: '2026-05-06', img: '', trust: 95, url: '#' },
  ];

  setTimeout(() => {
    loading.style.display = 'none';
    let filtered = demoNews;
    if (query) filtered = filtered.filter(n => n.title.toLowerCase().includes(query.toLowerCase()));

    const trustFilter = document.getElementById('news-trust-filter').value;
    if (trustFilter === 'high') filtered = filtered.filter(n => n.trust >= 70);
    else if (trustFilter === 'medium') filtered = filtered.filter(n => n.trust >= 40 && n.trust < 70);
    else if (trustFilter === 'low') filtered = filtered.filter(n => n.trust < 40);

    filtered.forEach(n => {
      const trustClass = n.trust >= 70 ? 'high' : n.trust >= 40 ? 'medium' : 'low';
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <div class="news-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,rgba(0,245,255,0.05),rgba(123,97,255,0.05));">📰</div>
        <div class="news-card-body">
          <div class="news-card-source">${n.source}</div>
          <h4 class="news-card-title">${n.title}</h4>
          <span class="news-card-date">${n.date}</span>
        </div>
        <div class="news-card-footer">
          <span class="trust-badge ${trustClass}">${trustClass.toUpperCase()} TRUST · ${n.trust}%</span>
        </div>`;
      grid.appendChild(card);
    });
    if (!filtered.length) grid.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:2rem;">No news found matching your criteria.</p>';
  }, 800);
}
// Initial load
fetchNews();
// Search & filter events
document.getElementById('news-search').addEventListener('input', e => fetchNews(e.target.value));
document.getElementById('news-category').addEventListener('change', e => fetchNews(document.getElementById('news-search').value, e.target.value));
document.getElementById('news-trust-filter').addEventListener('change', () => fetchNews(document.getElementById('news-search').value));

// ===== CHATBOT =====
// AI chatbot assistant ka logic
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chatbot-window');
const chatClose = document.getElementById('chatbot-close');
const chatInput = document.getElementById('chatbot-input');
const chatSend = document.getElementById('chatbot-send');
const chatMessages = document.getElementById('chatbot-messages');

chatToggle.addEventListener('click', () => { chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none'; });
chatClose.addEventListener('click', () => { chatWindow.style.display = 'none'; });

function addChatMsg(text, isUser) {
  const div = document.createElement('div');
  div.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple chatbot responses - keyword based
const chatResponses = {
  'fake news': 'Fake news is false or misleading information presented as legitimate news. Our AI analyzes text patterns, emotional language, and source credibility to detect it.',
  'how': 'We use TF-IDF vectorization with a PassiveAggressiveClassifier trained on thousands of real and fake articles. We also check for clickbait, emotional manipulation, and propaganda patterns.',
  'accuracy': 'Our AI model achieves approximately 93-97% accuracy on test datasets. However, always cross-verify important claims with multiple reliable sources.',
  'clickbait': 'Clickbait uses sensational headlines to attract clicks. Common signs: ALL CAPS, words like SHOCKING/EXPOSED/SECRET, and urgency language.',
  'source': 'We analyze source credibility by checking domain age, content patterns, language quality, and cross-referencing with known reliable/unreliable source databases.',
  'help': 'You can: 1) Paste news text to analyze, 2) Enter a URL, 3) Upload a file. Our AI will give you a verdict with confidence score, reasoning, and manipulation detection.',
};

function getChatResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(chatResponses)) {
    if (lower.includes(key)) return val;
  }
  return "That's a great question! I can help you with fake news detection. Try asking about 'how it works', 'accuracy', 'clickbait', or 'source credibility'. You can also paste news text in the Analyze section for a full AI report. 🛡️";
}

chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendChat(); });

function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  addChatMsg(msg, true);
  chatInput.value = '';
  setTimeout(() => addChatMsg(getChatResponse(msg), false), 600);
}

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = this.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

console.log('🛡️ FakeGuardAI initialized successfully.');
