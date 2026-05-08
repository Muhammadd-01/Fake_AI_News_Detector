# ============================================
# FakeGuardAI - Flask Backend Server
# Yeh main server hai jo API endpoints handle karta hai
# ============================================

import os
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from model import FakeNewsDetector

# Flask app banao
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # Cross-origin requests allow karo

# AI model initialize karo
detector = FakeNewsDetector()

# Rate limiting ke liye simple tracker
request_counts = {}

def check_rate_limit(ip, limit=30, window=60):
    """Simple rate limiting - ek IP se zyada requests block karo"""
    import time
    now = time.time()
    if ip not in request_counts:
        request_counts[ip] = []
    # Purani entries hatao
    request_counts[ip] = [t for t in request_counts[ip] if now - t < window]
    if len(request_counts[ip]) >= limit:
        return False
    request_counts[ip].append(now)
    return True

def sanitize_input(text):
    """Input ko sanitize karo - XSS aur injection se bachao"""
    if not text:
        return ''
    # HTML tags hatao
    text = re.sub(r'<[^>]+>', '', text)
    # Script tags specifically hatao
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Max length limit
    return text[:50000]


# ===== SERVE FRONTEND =====
@app.route('/')
def serve_frontend():
    """Frontend HTML serve karo"""
    return send_from_directory(app.static_folder, 'index.html')


# ===== HEALTH CHECK =====
@app.route('/health', methods=['GET'])
def health():
    """Server ki health check karo"""
    return jsonify({
        'status': 'healthy',
        'model_trained': detector.is_trained,
        'message': 'FakeGuardAI is running! 🛡️'
    })


# ===== ANALYZE TEXT =====
@app.route('/analyze', methods=['POST'])
def analyze():
    """Text ko analyze karo - main endpoint"""
    # Rate limit check
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided.'}), 400

    text = sanitize_input(data['text'])
    if len(text.strip()) < 10:
        return jsonify({'error': 'Text too short. Provide at least 10 characters.'}), 400

    # AI model se prediction lo
    result = detector.predict(text)
    return jsonify(result)


# ===== ANALYZE URL =====
@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    """URL se article fetch karke analyze karo"""
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided.'}), 400

    url = data['url'].strip()
    # URL validation
    if not re.match(r'https?://[^\s]+', url):
        return jsonify({'error': 'Invalid URL format.'}), 400

    try:
        import requests as req
        from bs4 import BeautifulSoup
        # Article fetch karo
        response = req.get(url, timeout=10, headers={'User-Agent': 'FakeGuardAI/1.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        # Paragraphs extract karo
        paragraphs = soup.find_all('p')
        text = ' '.join(p.get_text() for p in paragraphs)
        text = sanitize_input(text)

        if len(text.strip()) < 20:
            return jsonify({'error': 'Could not extract enough text from this URL.'}), 400

        result = detector.predict(text)
        return jsonify(result)
    except ImportError:
        return jsonify({'error': 'URL analysis requires: pip install requests beautifulsoup4'}), 500
    except Exception as e:
        return jsonify({'error': f'Failed to fetch URL: {str(e)}'}), 500


# ===== UPLOAD FILE =====
@app.route('/upload', methods=['POST'])
def upload_file():
    """File upload karke analyze karo"""
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Empty filename.'}), 400

    # File type validate karo
    allowed = {'.txt', '.md', '.doc', '.docx'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        return jsonify({'error': f'File type {ext} not supported. Use: {", ".join(allowed)}'}), 400

    # File size check - max 5MB
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > 5 * 1024 * 1024:
        return jsonify({'error': 'File too large. Max 5MB.'}), 400

    try:
        text = file.read().decode('utf-8', errors='ignore')
        text = sanitize_input(text)
        if len(text.strip()) < 10:
            return jsonify({'error': 'File contains too little text.'}), 400
        result = detector.predict(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500


# ===== MAIN =====
if __name__ == '__main__':
    print('🛡️ FakeGuardAI Server Starting...')
    print(f'📊 Model trained: {detector.is_trained}')
    print('🌐 Open http://127.0.0.1:5000 in your browser')
    app.run(debug=True, host='0.0.0.0', port=5001)
