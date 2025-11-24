# Project Instructions

## General Guidelines

- Follow the existing Next.js architecture; prefer server components unless a client component is required for interactivity.
- Keep dependencies minimal; consult the team before adding new packages unless strictly necessary to fix a regression or security issue.
- Keep commit history clean and descriptive; use conventional commit prefixes when committing directly to main.
- Target **Node.js 20.x** for all local and CI builds. Do not upgrade the runtime or Next.js version without explicit approval.

## Content Authoring

- When editing content JSON files, avoid unnecessary capital letters and keep the tone simple, professional, and human-written.
- Prefer concise wording in marketing copy and reuse existing terminology for services and pricing when possible.
- **Translation Quality Standards**:
  - All content must be translated to all 5 languages (en, fr, de, es, pt) - no placeholders or partial translations.
  - Avoid AI writing patterns: no unnecessary capitals, excessive bullet points, overuse of dashes, or overly formal language.
  - Use natural, conversational professional tone appropriate for each language's business culture.
  - Prefer simple sentence structures over complex nested clauses.
  - Avoid repetitive phrases like "furthermore", "moreover", "additionally" that signal AI-generated text.
  - Check FAQ and marketing content specifically for human-like tone before committing.

## Testing

- Run `npm run lint` and `npm run test` when touching TypeScript/React code.
- For production fixes, attempt `npm run build` even if the environment lacks the proper Node version; document any blockers in the PR description.

## Internationalisation

- Keep translation namespaces aligned between server and client utilities.
- When adding new translation keys, update both the locale JSON files and the translation key index in `TRANSLATION-KEYS-FIX.md`.

## Documentation

- Update relevant docs in the `docs/` directory when introducing build, deployment, or i18n changes.
