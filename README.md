# 🛡️ FakeGuardAI — AI Fake News Detector

A modern AI-powered fake news detection platform built with Flask + Vanilla JS.

## ✨ Features

- **Paste News** — Analyze any text for fake news patterns
- **URL Analysis** — Fetch and analyze articles from URLs
- **File Upload** — Drag & drop text files for analysis
- **AI Prediction** — Fake / Real / Misleading verdict with confidence score
- **Emotion Detection** — Fear, anger, manipulation scoring
- **Clickbait Detection** — Identifies sensational language patterns
- **Propaganda Detection** — Political bias and extreme wording analysis
- **Suspicious Highlighting** — Flags specific suspicious sentences
- **Source Credibility** — Trust score for the content
- **Live News Feed** — Trending news with AI trust badges
- **AI Chatbot** — Ask questions about fake news
- **Voice Input** — Speak to analyze (Chrome/Edge)
- **Theme Toggle** — Dark/Light mode
- **PDF Export** — Export analysis reports
- **Responsive** — Works on mobile, tablet, desktop

## 🧠 How The AI Works

1. **TF-IDF Vectorization** — Converts text into numerical features
2. **PassiveAggressiveClassifier** — ML model trained on 40k+ articles
3. **Clickbait Analysis** — Keyword + ALL-CAPS pattern matching
4. **Emotion Detection** — Fear/anger/manipulation word scoring
5. **Propaganda Detection** — Political bias keyword analysis
6. **Rule-Based Fallback** — Works even without trained model

## 📦 Installation

```bash
# 1. Clone the repository
cd "Fake News Dectactor"

# 2. Install Python dependencies
cd backend
pip install -r requirements.txt

# 3. (Optional) Download dataset for training
# Get from: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
# Place Fake.csv and True.csv in backend/dataset/

# 4. (Optional) Train the model
python train.py

# 5. Start the server
python app.py
```

## 🚀 Running

### Backend (Flask)
```bash
cd backend
python app.py
# Server runs at http://127.0.0.1:5000
```

### Frontend
Open `http://127.0.0.1:5000` in your browser (Flask serves the frontend).

Or open `frontend/index.html` directly (uses demo mode without backend).

## 📂 Dataset Setup

1. Go to [Kaggle Fake News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
2. Download `Fake.csv` and `True.csv`
3. Place them in `backend/dataset/`
4. Run `python train.py`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze text content |
| POST | `/analyze-url` | Fetch and analyze a URL |
| POST | `/upload` | Upload and analyze a file |
| GET | `/health` | Server health check |

### Example Request
```bash
curl -X POST http://127.0.0.1:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "BREAKING: Scientists discover shocking secret!"}'
```

### Example Response
```json
{
  "prediction": "Fake",
  "confidence": 87,
  "reason": "Clickbait language and emotional manipulation detected.",
  "manipulation": ["Clickbait", "Fear Tactics"],
  "credibility": 18,
  "emotions": {"fear": 60, "anger": 30, "manipulation": 70, "hope": 10, "sadness": 25},
  "suspicious_sentences": ["Scientists discover shocking secret!"],
  "suggestions": ["Verify the original source...", "Cross-reference claims..."]
}
```

## 🔮 Future Improvements

- Transformer-based models (BERT/RoBERTa)
- Real News API integration
- User authentication & history
- Multi-language support (Urdu, Arabic, etc.)
- Browser extension
- Social media link analysis
- Image/video deepfake detection

## 📁 Project Structure

```
fake-news-detector/
├── frontend/
│   ├── index.html      # Main HTML
│   ├── style.css       # CSS entry point
│   ├── base.css        # Variables, reset, layout
│   ├── components.css  # Component styles
│   ├── script.js       # Frontend logic
│   └── assets/
├── backend/
│   ├── app.py          # Flask server
│   ├── model.py        # AI model logic
│   ├── train.py        # Training script
│   ├── requirements.txt
│   └── dataset/
│       ├── Fake.csv
│       └── True.csv
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python, Flask
- **AI/ML**: scikit-learn, TF-IDF, PassiveAggressiveClassifier
- **Design**: Glassmorphism, CSS Grid, Flexbox, Canvas

---

Built with ❤️ by FakeGuardAI
