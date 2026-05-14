# ============================================
# FakeGuardAI - Flask Backend Server
# Yeh main server hai jo frontend se requests leta hai aur AI model se results dilwata hai.
# ============================================

import os
import re
import requests as req
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from bs4 import BeautifulSoup
from model import FakeNewsDetector

# 1. Flask app initialize karo.
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# 2. AI model ko initialize karo.
detector = FakeNewsDetector()

# 3. Rate limiting tracker.
request_counts = {}

def check_rate_limit(ip, limit=30, window=60):
    import time
    now = time.time()
    if ip not in request_counts:
        request_counts[ip] = []
    request_counts[ip] = [t for t in request_counts[ip] if now - t < window]
    if len(request_counts[ip]) >= limit:
        return False
    request_counts[ip].append(now)
    return True

def sanitize_input(text):
    if not text:
        return ''
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    return text[:50000]


# ===== FRONTEND SERVE =====
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')


# ===== SERVER HEALTH CHECK =====
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_trained': detector.is_trained,
        'message': 'FakeGuardAI is running! 🛡️'
    })


# ===== ENHANCED URL ANALYSIS ENDPOINT =====
@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    """
    URL se news article nikaal kar analyze karta hai.
    Extracts title, content, and metadata for a more powerful check.
    """
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided.'}), 400

    url = data['url'].strip()
    if not re.match(r'https?://[^\s]+', url):
        return jsonify({'error': 'Invalid URL format.'}), 400

    try:
        # Website content fetch karo.
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = req.get(url, timeout=12, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Title extract karo.
        title = ""
        if soup.title:
            title = soup.title.string
        if not title:
            h1 = soup.find('h1')
            if h1: title = h1.get_text()
            
        # 2. Meta description extract karo.
        meta_desc = ""
        desc_tag = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        if desc_tag:
            meta_desc = desc_tag.get('content', '')

        # 3. Content extract karo (main article text).
        # Hum generic tags check karte hain jo articles mein hote hain.
        article_body = soup.find('article')
        if article_body:
            paragraphs = article_body.find_all('p')
        else:
            paragraphs = soup.find_all('p')
            
        text = ' '.join(p.get_text() for p in paragraphs if len(p.get_text()) > 20)
        text = sanitize_input(text)

        if len(text.strip()) < 50:
            return jsonify({'error': 'Could not extract enough readable text from this URL. The site might be protected or use heavy Javascript.'}), 400

        # AI se prediction karwao naye factors ke saath.
        result = detector.predict(
            text=text, 
            url=url, 
            title=sanitize_input(title), 
            meta_desc=sanitize_input(meta_desc)
        )
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch or parse URL: {str(e)}'}), 500


# ===== MAIN ENTRY POINT =====
if __name__ == '__main__':
    print('🛡️ FakeGuardAI Server Starting (URL-Only Mode)...')
    print(f'📊 Model trained: {detector.is_trained}')
    print('🌐 Open http://127.0.0.1:5001 in your browser')
    app.run(debug=True, host='0.0.0.0', port=5001)

