# ============================================
# FakeGuardAI - Training Script
# Yeh script model ko train karta hai dataset pe
# Pehle dataset/ folder mein Fake.csv aur True.csv daalein
# ============================================

from model import FakeNewsDetector

if __name__ == '__main__':
    print('=' * 50)
    print('  FakeGuardAI - Model Training')
    print('=' * 50)
    print()
    print('📂 Make sure Fake.csv and True.csv are in backend/dataset/')
    print()

    # Detector initialize karo
    detector = FakeNewsDetector()

    # Train karo
    success = detector.train()

    if success:
        print()
        print('✅ Training complete! Model saved.')
        print('🚀 Now run: python app.py')
    else:
        print()
        print('⚠️ Training skipped. Server will use rule-based analysis.')
        print('📥 Download dataset from: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset')
        print('📂 Place Fake.csv and True.csv in backend/dataset/ folder')
        print('🔄 Then run this script again.')
        print()
        print('🚀 You can still run: python app.py (rule-based mode)')
