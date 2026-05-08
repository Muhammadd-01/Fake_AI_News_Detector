# ============================================
# FakeGuardAI - AI Model Logic
# Is file mein AI ka sara dimagh (logic) hai.
# Yahan training, text cleaning, aur prediction ka sara kaam hota hai.
# ============================================

import re
import os
import pickle
import numpy as np
from collections import Counter

# 1. Check karo ke machine learning library (sklearn) installed hai ya nahi.
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import PassiveAggressiveClassifier, LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

# Model aur vectorizer ko save karne ke liye paths.
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'vectorizer.pkl')

# ===== CLICKBAIT DETECTION WORDS =====
# Ye wo alfaz hain jo aksar jhootay ya sensational khabron mein hote hain.
CLICKBAIT_WORDS = [
    'shocking', 'must see', 'exposed', 'secret', 'breaking', 'urgent',
    'leaked', 'banned', 'you won\'t believe', 'mind blowing', 'incredible',
    'unbelievable', 'outrageous', 'insane', 'jaw dropping', 'bombshell',
    'exclusive', 'alert', 'warning', 'revealed', 'conspiracy', 'cover up',
    'anonymous', 'whistleblower', 'hidden', 'immortal', 'eternal life',
    'miracle', 'cure', 'they don\'t want', 'share before', 'gets deleted',
    'reverse aging', 'big pharma', 'suppressing'
]

# ===== EMOTIONAL / FEAR WORDS =====
# Jazbaati alfaz jo logon ko darane ya gussa dilane ke liye use hote hain.
EMOTION_WORDS = {
    'fear': ['terrifying', 'dangerous', 'threat', 'deadly', 'catastrophe', 'disaster',
             'panic', 'horror', 'nightmare', 'apocalypse', 'collapse', 'crisis', 'alarming'],
    'anger': ['outrage', 'fury', 'disgusting', 'corrupt', 'betrayal', 'scandal',
              'criminal', 'evil', 'despicable', 'shameful', 'infuriating'],
    'manipulation': ['they don\'t want you to know', 'wake up', 'open your eyes',
                     'mainstream media', 'deep state', 'big pharma', 'cover up',
                     'suppressed', 'silenced', 'censored', 'before it gets deleted',
                     'share this', 'spread the word']
}

# ===== PROPAGANDA INDICATORS =====
# Siyasi bias ya propaganda detect karne ke liye alfaz.
PROPAGANDA_WORDS = [
    'regime', 'puppet', 'traitor', 'enemy of the people', 'radical',
    'extremist', 'socialist', 'fascist', 'deep state', 'globalist',
    'patriot', 'freedom fighter', 'fake news media', 'witch hunt'
]


def preprocess_text(text):
    """
    Text ko clean karta hai:
    - Lowercase karta hai.
    - URLs aur special characters hatata hai.
    - Sirf kaam ke words rakhta hai.
    """
    if not text:
        return ''
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)  # Links nikalo
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)    # Symbols nikalo
    text = re.sub(r'\s+', ' ', text).strip()      # Extra spaces saaf karo
    return text


def detect_clickbait(text):
    """
    Check karta hai ke headline ya text clickbait hai ya nahi.
    Agar bohat zyada CAPS words hon toh bhi score barh jata hai.
    """
    lower_text = text.lower()
    found = [word for word in CLICKBAIT_WORDS if word in lower_text]
    
    # Check karo kitne words bare alphabets (CAPS) mein hain.
    words = text.split()
    caps_count = sum(1 for w in words if w.isupper() and len(w) > 2)
    caps_ratio = caps_count / max(len(words), 1)

    # Clickbait score calculate karo.
    score = min(len(found) * 15 + int(caps_ratio * 50), 100)
    return {'score': score, 'found_words': found, 'is_clickbait': score > 40}


def detect_emotions(text):
    """
    Text mein jazbaat (fear, anger, manipulation) ka level check karta hai.
    """
    lower_text = text.lower()
    results = {}
    for emotion, words in EMOTION_WORDS.items():
        found = [w for w in words if w in lower_text]
        score = min(len(found) * 20, 95)
        results[emotion] = score
    
    # Do aur emotions calculate karo.
    results['hope'] = max(5, 100 - results.get('fear', 0) - results.get('anger', 0)) // 3
    results['sadness'] = min(results.get('fear', 0) // 2 + 10, 60)
    return results


def detect_propaganda(text):
    """
    Check karta hai ke text mein propaganda ke alfaz kitne hain.
    """
    lower_text = text.lower()
    found = [w for w in PROPAGANDA_WORDS if w in lower_text]
    score = min(len(found) * 18, 95)
    return {'score': score, 'found_words': found, 'has_propaganda': score > 30}


def find_suspicious_sentences(text):
    """
    Poore text mein se wo sentences nikalta hai jo sab se zyada shakki (suspicious) lagte hain.
    """
    sentences = re.split(r'[.!?]+', text)
    suspicious = []
    all_bad_words = CLICKBAIT_WORDS + PROPAGANDA_WORDS
    for emotion_words in EMOTION_WORDS.values():
        all_bad_words.extend(emotion_words)

    for sentence in sentences:
        s = sentence.strip()
        if not s or len(s) < 10:
            continue
        lower_s = s.lower()
        
        # Agar sentence mein koi bura word hai ya zyada CAPS hain.
        if any(w in lower_s for w in all_bad_words):
            suspicious.append(s)
        elif sum(1 for c in s if c.isupper()) > len(s) * 0.4 and len(s) > 15:
            suspicious.append(s)

    return suspicious if suspicious else ['No highly suspicious sentences detected.']


def calculate_credibility(text, prediction, confidence):
    """
    Source kitna bharose-mand (credible) hai uska score nikalta hai.
    Real news ka score zyada hota hai, Clickbait aur Propaganda ka kam.
    """
    base_score = 50
    clickbait = detect_clickbait(text)
    emotions = detect_emotions(text)
    propaganda = detect_propaganda(text)

    # Negative factors se score kam karo.
    base_score -= clickbait['score'] * 0.3
    base_score -= max(emotions.values()) * 0.2
    base_score -= propaganda['score'] * 0.25

    # Prediction ke hisab se adjust karo.
    if prediction == 'Real':
        base_score += 30
    elif prediction == 'Misleading':
        base_score -= 10
    else:
        base_score -= 25

    return max(5, min(int(base_score), 95))


def generate_reason(prediction, clickbait_data, emotion_data, propaganda_data, confidence):
    """
    AI ki waja (reasoning) batata hai ke usne khabar ko Fake ya Real kyun kaha.
    """
    reasons = []

    if prediction == 'Fake':
        reasons.append(f'Our AI model classified this content as fake news with {confidence}% confidence.')
        if clickbait_data['is_clickbait']:
            reasons.append(f'Clickbait language detected: {", ".join(clickbait_data["found_words"][:3])}.')
        if max(emotion_data.get('fear', 0), emotion_data.get('anger', 0)) > 40:
            reasons.append('High levels of emotional manipulation were detected, including fear and anger tactics.')
        if propaganda_data['has_propaganda']:
            reasons.append(f'Propaganda indicators found: {", ".join(propaganda_data["found_words"][:3])}.')
        reasons.append('The writing style, tone, and word choices are consistent with misinformation patterns.')
    elif prediction == 'Misleading':
        reasons.append('This content shows mixed signals — some factual elements but with misleading framing.')
        if clickbait_data['score'] > 20:
            reasons.append('Some clickbait elements were detected that may exaggerate the actual story.')
        reasons.append('We recommend cross-referencing with verified news sources.')
    else:
        reasons.append(f'Our AI model classified this content as authentic with {confidence}% confidence.')
        reasons.append('The language style, tone, and structure are consistent with factual reporting.')
        if clickbait_data['score'] < 20 and max(emotion_data.values()) < 30:
            reasons.append('No significant emotional manipulation or clickbait patterns were detected.')

    return ' '.join(reasons)


def generate_suggestions(prediction, clickbait_data, propaganda_data):
    """
    User ko mashwaray (suggestions) deta hai ke khabar ko kaise verify karein.
    """
    suggestions = [
        '🔍 Verify the original source and check if reputable outlets cover this story.',
        '📰 Cross-reference claims with fact-checking sites like Snopes or PolitiFact.'
    ]
    if prediction in ('Fake', 'Misleading'):
        suggestions.extend([
            '⚠️ Be cautious of urgency language — a common manipulation tactic.',
            '🌐 Search for the same claim in reverse to find debunking articles.',
            '🧪 Look for cited studies or statistics in academic databases.'
        ])
    if clickbait_data['is_clickbait']:
        suggestions.append('🎣 This content uses clickbait — verify the headline matches the actual content.')
    if propaganda_data['has_propaganda']:
        suggestions.append('⚖️ Propaganda language detected — consider the political motivation behind this content.')
    return suggestions


def get_manipulation_labels(clickbait_data, emotion_data, propaganda_data):
    """
    Labels (tags) generate karta hai jo UI pe nazar aate hain.
    """
    labels = []
    if clickbait_data['is_clickbait']:
        labels.append('Clickbait')
    if emotion_data.get('fear', 0) > 30:
        labels.append('Fear Tactics')
    if emotion_data.get('anger', 0) > 30:
        labels.append('Emotional Language')
    if propaganda_data['has_propaganda']:
        labels.append('Political Bias')
    if not labels:
        labels.append('None Detected')
    return labels


class FakeNewsDetector:
    """
    MAIN AI CLASS.
    Iska kaam model load karna, train karna, aur prediction dena hai.
    """

    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.is_trained = False
        # Jab class bane, tabhi model load karne ki koshish karo.
        self._load_model()

    def _load_model(self):
        """
        Saved files (.pkl) se purana trained model load karta hai.
        """
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                with open(VECTORIZER_PATH, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                self.is_trained = True
                print('✅ Model loaded successfully!')
        except Exception as e:
            print(f'⚠️ Model load failed: {e}')
            self.is_trained = False

    def train(self, dataset_path=None):
        """
        Model ko naye data pe train karta hai (Fake aur True articles).
        """
        if not HAS_SKLEARN:
            print('❌ scikit-learn not installed. Run: pip install scikit-learn')
            return False

        try:
            import pandas as pd
        except ImportError:
            print('❌ pandas not installed. Run: pip install pandas')
            return False

        # Dataset ka rasta set karo.
        if not dataset_path:
            dataset_path = os.path.join(MODEL_DIR, 'dataset')

        fake_path = os.path.join(dataset_path, 'Fake.csv')
        true_path = os.path.join(dataset_path, 'True.csv')

        # Check karo ke dataset files mojood hain.
        if not os.path.exists(fake_path) or not os.path.exists(true_path):
            print(f'⚠️ Dataset files not found at {dataset_path}')
            print('Using fallback rule-based analysis.')
            return False

        print('📊 Loading dataset...')
        fake_df = pd.read_csv(fake_path)
        true_df = pd.read_csv(true_path)

        # Labels lagao: 0 matlab Fake, 1 matlab Real.
        fake_df['label'] = 0
        true_df['label'] = 1

        # Dono ko merge karo aur mix (shuffle) karo.
        df = pd.concat([fake_df, true_df], ignore_index=True)
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)

        # Text ko saaf karo.
        text_col = 'text' if 'text' in df.columns else df.columns[0]
        df['clean_text'] = df[text_col].apply(preprocess_text)

        print(f'📝 Dataset size: {len(df)} articles')

        # TF-IDF Vectorization: Text ko numbers mein badalta hai taake AI samajh sake.
        print('🔧 Vectorizing text with TF-IDF...')
        self.vectorizer = TfidfVectorizer(max_features=10000, stop_words='english', ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(df['clean_text'])
        y = df['label']

        # Kuch data testing ke liye rakho.
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # AI Algorithm (PassiveAggressiveClassifier) train karo.
        print('🤖 Training PassiveAggressiveClassifier...')
        self.model = PassiveAggressiveClassifier(max_iter=100, C=0.5, random_state=42)
        self.model.fit(X_train, y_train)

        # Check karo kitna accurate hai.
        y_pred = self.model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f'✅ Model trained! Accuracy: {acc:.2%}')

        # Model aur vectorizer ko save karlo taake dobara train na karna pare.
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(self.model, f)
        with open(VECTORIZER_PATH, 'wb') as f:
            pickle.dump(self.vectorizer, f)
        print('💾 Model saved!')

        self.is_trained = True
        return True

    def predict(self, text):
        """
        Main function jo bata-ta hai ke text Real hai ya Fake.
        """
        if not text or len(text.strip()) < 10:
            return self._rule_based_analysis(text or '')

        # Agar model train ho chuka hai toh AI use karo.
        if self.is_trained and self.model and self.vectorizer:
            return self._model_prediction(text)
        else:
            # Warna manual rules se kaam chalao.
            return self._rule_based_analysis(text)

    def _model_prediction(self, text):
        """
        Trained Machine Learning model ko use karke prediction karta hai.
        """
        clean = preprocess_text(text)
        X = self.vectorizer.transform([clean])

        # Prediction aur confidence (yaqeen) ka level.
        pred = self.model.predict(X)[0]
        decision = self.model.decision_function(X)[0]
        confidence = min(int(abs(decision) * 20 + 50), 98)

        prediction = 'Real' if pred == 1 else 'Fake'

        # Agar confidence bohat kam ho toh 'Misleading' kaho.
        if 45 < confidence < 65 and prediction == 'Fake':
            prediction = 'Misleading'

        # Baqi saari analysis bhi saath karo.
        clickbait = detect_clickbait(text)
        emotions = detect_emotions(text)
        propaganda = detect_propaganda(text)
        credibility = calculate_credibility(text, prediction, confidence)
        reason = generate_reason(prediction, clickbait, emotions, propaganda, confidence)
        manipulation = get_manipulation_labels(clickbait, emotions, propaganda)
        suggestions = generate_suggestions(prediction, clickbait, propaganda)
        suspicious = find_suspicious_sentences(text)

        return {
            'prediction': prediction,
            'confidence': confidence,
            'reason': reason,
            'manipulation': manipulation,
            'credibility': credibility,
            'emotions': emotions,
            'suspicious_sentences': suspicious,
            'suggestions': suggestions
        }

    def _rule_based_analysis(self, text):
        """
        Bina machine learning ke sirf rules (word matching) se analysis karta hai.
        """
        clickbait = detect_clickbait(text)
        emotions = detect_emotions(text)
        propaganda = detect_propaganda(text)

        # Shak (Suspicion) calculate karo.
        suspicion = (clickbait['score'] * 0.45 +
                     max(emotions.get('fear', 0), emotions.get('anger', 0), emotions.get('manipulation', 0)) * 0.3 +
                     propaganda['score'] * 0.25)

        # Suspicion ke hisab se verdict do.
        if suspicion > 35:
            prediction = 'Fake'
            confidence = min(int(suspicion + 30), 96)
        elif suspicion > 18:
            prediction = 'Misleading'
            confidence = min(int(suspicion + 30), 75)
        else:
            prediction = 'Real'
            confidence = min(int(100 - suspicion), 92)

        # Baqi analysis results jama karo.
        credibility = calculate_credibility(text, prediction, confidence)
        reason = generate_reason(prediction, clickbait, emotions, propaganda, confidence)
        manipulation = get_manipulation_labels(clickbait, emotions, propaganda)
        suggestions = generate_suggestions(prediction, clickbait, propaganda)
        suspicious = find_suspicious_sentences(text)

        return {
            'prediction': prediction,
            'confidence': confidence,
            'reason': reason,
            'manipulation': manipulation,
            'credibility': credibility,
            'emotions': emotions,
            'suspicious_sentences': suspicious,
            'suggestions': suggestions
        }

