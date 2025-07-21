import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk import pos_tag
from collections import Counter
from pathlib import Path

# Ensure app finds the data
NLTK_DIR = str(Path(__file__).parent / "nltk_data")
nltk.data.path.append(NLTK_DIR)


stop_words = set(stopwords.words('english'))

def process_email_text(text: str) -> dict:
    # Tokenize into sentences and words
    sentences = sent_tokenize(text)
    words = word_tokenize(text.lower())
    
    # Remove stopwords and non-alphabetic words
    filtered_words = [word for word in words if word.isalpha() and word not in stop_words]
    
    # Part-of-speech tagging
    pos_tags = pos_tag(filtered_words)
    
    # Count common parts of speech
    nouns = [word for word, tag in pos_tags if tag.startswith('NN')]
    verbs = [word for word, tag in pos_tags if tag.startswith('VB')]
    adjectives = [word for word, tag in pos_tags if tag.startswith('JJ')]

    return {
        "num_sentences": len(sentences),
        "most_common_words": Counter(filtered_words).most_common(10),
        "most_common_nouns": Counter(nouns).most_common(10),
        "most_common_verbs": Counter(verbs).most_common(10),
        "most_common_adjectives": Counter(adjectives).most_common(10)
    }
