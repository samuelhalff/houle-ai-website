# Decisions

## Decision Log

- `2026-03-08T14:37:20.019866+00:00`: Project initialized as `nextjs` / `nextjs`.
- `2026-11-23`: Mesure d'audience, présomption de consentement (décision de Sam, 23.11.2026, prise en connaissance du risque RGPD / arrêt Planet49 pour les visiteurs UE/EEE/Royaume-Uni). Partout, ignorer le bandeau vaut acceptation : les quatre signaux Consent Mode v2 sont accordés par défaut (une seule règle, `CONSENT_DEFAULT_RULES` dans `src/lib/consent-mode.ts`, prévue pour rétablir une règle régionale), gtm.js se charge toujours. Seul « Refuser » arrête la mesure. Le bandeau reste affiché avec « Refuser » et le lien « Cookies ». Même règle sur ark-fid.ch et guide-assurance.ch. Pas de PostHog sur houle.ai : l'offre PostHog de West Bay SA n'autorise pas un projet de plus.
