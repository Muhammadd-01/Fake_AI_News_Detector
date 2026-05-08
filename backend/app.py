# ============================================
# FakeGuardAI - Flask Backend Server
# Yeh main server hai jo frontend se requests leta hai aur AI model se results dilwata hai.
# ============================================

import os
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from model import FakeNewsDetector

# 1. Flask app initialize karo.
# static_folder batata hai ke HTML/CSS/JS files kahan hain.
app = Flask(__name__, static_folder='../frontend', static_url_path='')

# CORS allow karo taake browser backend se baat kar sake bina kisi rukawat ke.
CORS(app)

# 2. AI model ko initialize karo jo model.py mein defined hai.
detector = FakeNewsDetector()

# 3. Rate limiting ke liye tracker. 
# Iska maqsad ye hai ke koi server ko bar bar request bhej kar crash na kar de.
request_counts = {}

def check_rate_limit(ip, limit=30, window=60):
    """
    Ek IP se kitni requests aa rahi hain wo check karta hai.
    Agar limit (30 requests per minute) cross ho jaye toh block kar deta hai.
    """
    import time
    now = time.time()
    if ip not in request_counts:
        request_counts[ip] = []
    # Purani requests jo time window se bahar hain unhe list se nikalo.
    request_counts[ip] = [t for t in request_counts[ip] if now - t < window]
    if len(request_counts[ip]) >= limit:
        return False
    request_counts[ip].append(now)
    return True

def sanitize_input(text):
    """
    User ke bheje hue text ko saaf karta hai.
    HTML tags aur scripts nikal deta hai taake server safe rahe (XSS protection).
    """
    if not text:
        return ''
    # HTML tags ko regex ke zariye remove karo.
    text = re.sub(r'<[^>]+>', '', text)
    # Javascript code (script tags) ko specifically nikalo.
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Bohat bara text server pe load na dale is liye limit set karo.
    return text[:50000]


# ===== FRONTEND SERVE KARNE KA ROUTE =====
@app.route('/')
def serve_frontend():
    """
    Jab koi main URL (/) khole, toh use frontend folder se index.html dikhao.
    """
    return send_from_directory(app.static_folder, 'index.html')


# ===== SERVER HEALTH CHECK =====
@app.route('/health', methods=['GET'])
def health():
    """
    Ye check karne ke liye hai ke server sahi chal raha hai ya nahi.
    Ye ye bhi batata hai ke AI model trained hai ya simple rules use kar raha hai.
    """
    return jsonify({
        'status': 'healthy',
        'model_trained': detector.is_trained,
        'message': 'FakeGuardAI is running! 🛡️'
    })


# ===== MAIN TEXT ANALYSIS ENDPOINT =====
@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Jab user text paste karke 'Analyze' dabaye toh ye function chalta hai.
    Pehle text saaf hota hai, phir AI model prediction karta hai.
    """
    # Check karo ke user limit se zyada requests toh nahi bhej raha.
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    # JSON data lio request se.
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided.'}), 400

    # Input ko sanitize (saaf) karo.
    text = sanitize_input(data['text'])
    if len(text.strip()) < 10:
        return jsonify({'error': 'Text too short. Provide at least 10 characters.'}), 400

    # AI model (FakeNewsDetector) ko text bhejo prediction ke liye.
    result = detector.predict(text)
    return jsonify(result)


# ===== URL SE ARTICLE ANALYZE KARNA =====
@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    """
    URL se news article nikaal kar analyze karta hai.
    BeautifulSoup use karke website ka text extract kiya jata hai.
    """
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided.'}), 400

    url = data['url'].strip()
    # Check karo ke URL format sahi hai.
    if not re.match(r'https?://[^\s]+', url):
        return jsonify({'error': 'Invalid URL format.'}), 400

    try:
        import requests as req
        from bs4 import BeautifulSoup
        
        # Website ka content fetch karo.
        response = req.get(url, timeout=10, headers={'User-Agent': 'FakeGuardAI/1.0'})
        response.raise_for_status()
        
        # HTML se sirf readable text nikalo.
        soup = BeautifulSoup(response.text, 'html.parser')
        # Sirf paragraph (<p>) tags ka text jama karo.
        paragraphs = soup.find_all('p')
        text = ' '.join(p.get_text() for p in paragraphs)
        text = sanitize_input(text)

        if len(text.strip()) < 20:
            return jsonify({'error': 'Could not extract enough text from this URL.'}), 400

        # AI se prediction karwao extract hue text pe.
        result = detector.predict(text)
        return jsonify(result)
    except ImportError:
        return jsonify({'error': 'URL analysis requires: pip install requests beautifulsoup4'}), 500
    except Exception as e:
        return jsonify({'error': f'Failed to fetch URL: {str(e)}'}), 500


# ===== FILE UPLOAD KARKE ANALYZE KARNA =====
@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Jab user koi file (.txt wagaira) upload kare toh uska text analyze karta hai.
    """
    if not check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Too many requests. Please wait.'}), 429

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Empty filename.'}), 400

    # Check karo ke file type supported hai.
    allowed = {'.txt', '.md', '.doc', '.docx'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        return jsonify({'error': f'File type {ext} not supported. Use: {", ".join(allowed)}'}), 400

    # File size check - 5MB se bari file allow nahi hai.
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > 5 * 1024 * 1024:
        return jsonify({'error': 'File too large. Max 5MB.'}), 400

    try:
        # File ka text read karo aur sanitize karo.
        text = file.read().decode('utf-8', errors='ignore')
        text = sanitize_input(text)
        if len(text.strip()) < 10:
            return jsonify({'error': 'File contains too little text.'}), 400
        
        # Prediction result wapis bhejo.
        result = detector.predict(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500


# ===== MAIN ENTRY POINT =====
if __name__ == '__main__':
    # Server start karne se pehle status print karo.
    print('🛡️ FakeGuardAI Server Starting...')
    print(f'📊 Model trained: {detector.is_trained}')
    print('🌐 Open http://127.0.0.1:5001 in your browser')
    
    # Flask app ko run karo port 5001 par.
    app.run(debug=True, host='0.0.0.0', port=5001)

