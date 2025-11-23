#!/usr/bin/env python3
"""
Translate full article content from French to English, German, Spanish, Portuguese.
This script replaces the short summaries with full 3000-4000 character translations.
"""

import json
import sys
from pathlib import Path

# Article slugs that need translation (14 new use case articles)
ARTICLES_TO_TRANSLATE = [
    "automatisation-courrier-entrant-ia",
    "detection-delais-spfx-calendriers", 
    "relance-factures-impayees-power-automate",
    "resume-documents-juridiques-azure-ai",
    "assistant-redaction-contrats-ia",
    "analyse-predictive-ventes-azure-ml",
    "recherche-semantique-base-connaissances",
    "transcription-reunions-teams-ia",
    "controle-qualite-vision-ia",
    "analyse-sentiment-feedback-clients",
    "allocation-taches-dynamique-teams-planner",
    "validation-notes-frais-power-automate-approvals",
    "onboarding-clients-automatise-sharepoint-forms",
    "tableau-bord-projets-power-bi-project"
]

TRANSLATIONS_DIR = Path("src/translations")

def load_french_articles():
    """Load French articles from ressources.json"""
    fr_path = TRANSLATIONS_DIR / "fr" / "ressources.json"
    with open(fr_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    articles = {}
    for article in data.get("Articles", []):
        if article["slug"] in ARTICLES_TO_TRANSLATE:
            articles[article["slug"]] = article
    
    return articles

def main():
    # Load French articles
    french_articles = load_french_articles()
    
    print(f"Found {len(french_articles)} articles to translate")
    print(f"Total characters to translate: {sum(len(a['content']) for a in french_articles.values())}")
    
    for slug in ARTICLES_TO_TRANSLATE:
        if slug in french_articles:
            article = french_articles[slug]
            print(f"\n{slug}:")
            print(f"  Title: {article['title']}")
            print(f"  Content: {len(article['content'])} chars")

if __name__ == "__main__":
    main()
