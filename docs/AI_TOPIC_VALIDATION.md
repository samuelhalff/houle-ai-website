# AI Topic Validation Documentation

## Overview

The `scripts/ai-ressources-update.js` script includes topic validation to ensure all generated articles focus on AI and Microsoft 365 solutions, not general business services.

## Purpose

**houle.ai** provides:
- AI solutions for Microsoft 365
- Azure OpenAI implementations
- Private AI assistants
- Add-ins for Outlook, Word, Teams

**ark-fid.ch** (sister company) provides:
- General accounting and bookkeeping
- VAT/TVA compliance services
- Fiduciary services
- Payroll management

This validation ensures content stays on-brand and doesn't overlap with ark-fid.ch services.

## Validation Rules

### ✅ ALLOWED Topics (AI/Microsoft 365 Focus)

Articles must be clearly related to:
- IA privée et assistants internes (RAG, anti-hallucinations)
- Add-ins Microsoft 365 (Outlook, Word, Teams)
- Architecture Azure OpenAI / Azure AI Foundry
- Gouvernance IA et conformité (nLPD, RGPD pour systèmes IA)
- Automatisation avec IA et productivité Microsoft 365
- Évaluation qualité IA et monitoring
- Adoption entreprise de solutions IA
- Technologies IA: LLM, GPT, fine-tuning, embeddings, vector databases
- Hébergement en Suisse pour solutions IA
- Sécurité et conformité SPÉCIFIQUES aux déploiements IA

### ❌ FORBIDDEN Topics (General Business Services)

Articles must NOT focus on:
- Comptabilité générale et tenue de livres (sans contexte IA)
- TVA / VAT compliance générale (sans contexte IA)
- Services fiduciaires généraux
- Gestion de la paie (salaires, AVS, LAA, LPP) sans contexte IA
- Structure d'entreprise (SA, Sàrl) sans lien IA
- Conseils juridiques ou fiscaux généraux
- Domiciliation d'entreprise
- Audit financier traditionnel

## Examples

### ✅ ACCEPTED Articles

**Example 1: AI Automation with Business Process**
- **Slug**: `automatiser-tva-avec-ia`
- **Title**: "Automatiser la déclaration TVA avec l'IA"
- **Description**: "Comment utiliser l'intelligence artificielle pour automatiser vos déclarations TVA"
- **Why Accepted**: While mentioning TVA, the focus is clearly on AI automation

**Example 2: Microsoft 365 Add-in**
- **Slug**: `outlook-add-in-tri-automatique`
- **Title**: "Outlook Add-in: tri automatique des emails avec IA"
- **Description**: "Guide pour créer un add-in Outlook avec Azure OpenAI"
- **Why Accepted**: Clearly focused on Microsoft 365 add-ins with AI

**Example 3: AI Architecture**
- **Slug**: `azure-openai-securite-entreprise`
- **Title**: "Sécuriser Azure OpenAI en entreprise"
- **Description**: "Architecture et bonnes pratiques pour déployer Azure OpenAI"
- **Why Accepted**: Pure AI/Azure infrastructure topic

**Example 4: AI Compliance**
- **Slug**: `nlpd-rgpd-assistant-ia`
- **Title**: "nLPD et RGPD pour un assistant IA en entreprise"
- **Description**: "Conformité des données pour systèmes d'IA en Suisse"
- **Why Accepted**: Compliance is specifically for AI systems

### ❌ REJECTED Articles

**Example 1: Pure VAT Topic**
- **Slug**: `declaration-tva-suisse-2024`
- **Title**: "Guide de la déclaration TVA en Suisse 2024"
- **Description**: "Comment remplir votre déclaration TVA trimestrielle"
- **Why Rejected**: Pure VAT topic with no AI context

**Example 2: General Accounting**
- **Slug**: `comptabilite-pme-suisse`
- **Title**: "La comptabilité pour PME en Suisse"
- **Description**: "Guide complet de la tenue de livres comptables"
- **Why Rejected**: General accounting topic with no AI/tech context

**Example 3: Payroll Management**
- **Slug**: `gestion-paie-avs-laa`
- **Title**: "Gestion de la paie et assurances sociales (AVS, LAA)"
- **Description**: "Calculer les salaires et gérer les cotisations sociales"
- **Why Rejected**: Pure payroll topic with no AI context

**Example 4: Corporate Structure**
- **Slug**: `creer-sa-suisse`
- **Title**: "Créer une SA en Suisse: guide complet"
- **Description**: "Étapes et documents pour créer une société anonyme"
- **Why Rejected**: No AI or technology context

## Implementation

### Where Validation Happens

1. **Prompt Level** (Prevention):
   - `buildSystemPrompt()`: Explicit exclusions in AI instructions
   - `buildResearchPrompt()`: Research phase excludes non-AI topics
   - `buildDraftPromptFromResearch()`: Draft phase reinforces AI focus

2. **Code Level** (Enforcement):
   - `assertAIRelatedTopic()`: Validates slug, title, and description
   - Called in `main()` after article generation, before saving
   - Throws error with code `OFF_TOPIC_ARTICLE` or `MISSING_AI_CONTEXT`

### Validation Logic

```javascript
function assertAIRelatedTopic(article, where = "article") {
  const textToCheck = `${article.slug} ${article.title} ${article.description}`.toLowerCase();
  
  // Check for forbidden terms (TVA, comptabilité, paie, etc.)
  // If found, check for AI context words (ia, ai, automatisation, microsoft 365, gpt, etc.)
  // If forbidden term present WITHOUT AI context → REJECT
  
  // Also check that at least SOME AI/tech terms are present
  // If no AI terms found at all → REJECT
}
```

## Testing

Validation logic tested with multiple scenarios:
- ✅ AI articles with Microsoft 365: Accepted
- ✅ Business processes with AI automation: Accepted  
- ✅ Pure Azure OpenAI topics: Accepted
- ❌ Pure TVA/accounting without AI: Rejected
- ❌ Payroll without AI context: Rejected
- ❌ Articles with no AI/tech terms: Rejected

## Error Handling

When validation fails, the script:
1. Logs the error with details (slug, title, forbidden term)
2. Throws an error with code `OFF_TOPIC_ARTICLE` or `MISSING_AI_CONTEXT`
3. Article is NOT saved to ressources.json
4. CI workflow fails (preventing off-topic content from being published)

## Maintenance

When updating this validation:
1. Update prompt texts in `buildSystemPrompt()`, `buildResearchPrompt()`, `buildDraftPromptFromResearch()`
2. Update `forbiddenTerms` array in `assertAIRelatedTopic()` if needed
3. Update `aiTechTerms` regex if new technology terms emerge
4. Test with representative examples before deploying

## Related Files

- `scripts/ai-ressources-update.js`: Main script with validation
- `scripts/translate-articles.js`: Updated acronyms list for AI/tech terms
- `scripts/lib/trends.js`: EVERGREEN_TOPICS already AI-focused
- `.github/workflows/ai-ressources-every-4-days.yml`: CI workflow that runs the script
