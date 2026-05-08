# 🛡️ FakeGuardAI — AI Fake News Detector

Assalam-o-Alaikum! Yeh ek modern **AI-powered Fake News Detector** hai jo Flask (Python) aur Vanilla JavaScript (Frontend) pe bana hai. Iska maqsad yeh hai ke users asani se kisi bhi news ki sachai (authenticity) check kar sakein.

---

## ✨ Is Project Ke Khaas Features

Yeh sirf ek simple detector nahi hai, balkay is mein bohot saaray advanced features hain:

- **📝 Paste News**: Aap kisi bhi article ka text yahan paste kar ke check kar saktay hain.
- **🔗 URL Analysis**: Agar aapke paas kisi news ka link hai, toh bas URL dalein, AI khud content fetch kar ke analyze kar lega.
- **📂 File Upload**: Aap `.txt` ya `.doc` files bhi upload kar saktay hain.
- **🤖 AI Prediction**: AI aapko batayega ke news **Real** hai, **Fake** hai ya **Misleading**. Saath mein confidence score bhi milega.
- **🎭 Emotion Detection**: Yeh tool check karta hai ke news mein kitni dar (fear), gussa (anger), ya manipulation use hui hai.
- **🎣 Clickbait Detection**: Kya headline sirf clicks lene ke liye sensational banai gayi hai? AI isay bhi pakar lega.
- **🔎 Suspicious Highlighting**: Jo sentences AI ko shakki (suspicious) lagtay hain, unhein alag se highlight kar deta hai.
- **🛡️ Source Credibility**: Content ki quality dekh kar AI batata hai ke is pe kitna bharosa kiya ja sakta hai.
- **🎙️ Voice Input**: Aap bol kar bhi text enter kar saktay hain (Speech-to-Text).
- **🌙 Dark/Light Mode**: Futuristic glassmorphic design jo day aur night dono mein pyara lagta hai.
- **📄 PDF Export**: Aap apni analysis report ko PDF mein save bhi kar saktay hain.

---

## 🧠 AI Kaise Kaam Karta Hai? (Under the Hood)

Is project mein Machine Learning aur Rule-based logic dono ka mix use kiya gaya hai:

1. **TF-IDF Vectorization**: Text ko numbers mein convert kiya jata hai taake computer samajh sakay.
2. **PassiveAggressiveClassifier**: Yeh hamara main ML model hai jo 40,000+ news articles pe train hua hai.
3. **Sentiment Analysis**: AI check karta hai ke news mein jazbaat (emotions) kitne zyada hain. Zyada emotional news aksar fake hoti hai.
4. **Keyword Matching**: Clickbait aur propaganda pakarne ke liye khaas keywords ki list use hoti hai.
5. **Fallback System**: Agar ML model train nahi bhi hai, toh rule-based logic tab bhi kaam karti hai.

---

## 📁 Project Structure (Kaunsi File Kahan Hai?)

Aapko project ki files ki samajh honi chahiye:

```
fake-news-detector/
├── frontend/             # UI wala sara hissa
│   ├── index.html        # Main page structure
│   ├── base.css          # Colors aur layout styles
│   ├── components.css    # Cards, buttons, aur inputs ke styles
│   ├── style.css         # entry point for CSS
│   └── script.js         # Frontend ki main logic (API calls, animations)
├── backend/              # Server wala sara hissa
│   ├── app.py            # Flask server (Main entry point)
│   ├── model.py          # AI Logic aur ML Model code
│   ├── train.py          # Model train karne ka script
│   ├── requirements.txt  # Zaroori libraries ki list
│   └── dataset/          # Training data (Fake.csv, True.csv)
└── README.md             # Yeh file jo aap parh rahay hain
```

---

## 📦 Setup aur Installation (Kaise Chalana Hai?)

Is project ko apne computer pe chalane ke liye yeh steps follow karein:

### 1. Requirements
Aapke computer mein **Python** install hona chahiye.

### 2. Libraries Install Karein
Terminal ya CMD khol kar yeh command chalayen:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Model Train Karein (Optional)
Agar aap chahtay hain ke AI model train ho jaye (best accuracy ke liye):
- Kaggle se dataset download karein (Fake.csv aur True.csv).
- Unhein `backend/dataset/` folder mein dalein.
- Yeh command run karein:
```bash
python train.py
```

### 4. Server Start Karein
Ab project ko chalane ke liye:
```bash
python app.py
```
Server `http://127.0.0.1:5001` pe chalne lagay ga.

---

## 📡 API Endpoints (Developers ke liye)

Agar aap koi mobile app ya doosri website banana chahtay hain, toh yeh endpoints use kar saktay hain:

- `POST /analyze`: Text analyze karne ke liye.
- `POST /analyze-url`: Link (URL) analyze karne ke liye.
- `POST /upload`: File analyze karne ke liye.

---

## 🛠️ Tech Stack (Kya Kya Use Hua?)

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla).
- **Backend**: Python, Flask.
- **AI/ML**: Scikit-Learn, Pandas, TF-IDF.
- **Design**: Futuristic Glassmorphism, Canvas Particles Animation.

---

### ❤️ Built with Passion
Yeh project asani aur samajh ke liye banaya gaya hai. Umeed hai aapko pasand ayega! 🛡️
