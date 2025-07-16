import nltk
from pathlib import Path

# Optional: Set a specific path for consistent access
NLTK_DIR = str(Path(__file__).parent / "nltk_data")
nltk.data.path.append(NLTK_DIR)

# Force fresh downloads to avoid corrupted caches
nltk.download('punkt_tab', download_dir=NLTK_DIR, force=True)
nltk.download('averaged_perceptron_tagger_eng', download_dir=NLTK_DIR, force=True)
nltk.download('stopwords', download_dir=NLTK_DIR, force=True)
#nltk.download('punkt_tab')

print("✅ NLTK setup complete and saved to:", NLTK_DIR)
