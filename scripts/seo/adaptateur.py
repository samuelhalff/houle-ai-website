"""Adaptateur houle.ai du SEO mensuel (scripts/seo/seo_mensuel.py).

Pages modifiables :
  - articles : src/translations/<locale>/ressources.json, Articles[slug] ; titre et description dans metaTitle /
    metaDescription (src/lib/metadata.ts les reprend tels quels) ; FAQ dans Articles[].faq [{q, a}], qui alimente la
    FAQ visible et le JSON-LD, 5 questions au plus (src/lib/faq-content.test.ts). Articles redirigés vers ark-fid.ch
    ou consolidés exclus.
  - pages produits et services : src/translations/<locale>/metadata.json pages["<chemin>"] (le site ajoute
    « - houle ») ; FAQ dans <ns>.json « Faq.Items » [{Question, Answer}], 6 au plus.
Toute question ajoutée l'est dans les cinq langues (AGENTS.md), ou pas du tout.
Jamais touchées : légal, cookies, contact, tarifs (« Pricing »), FAQ de l'accueil et de chat-website (listes figées
dans le code), solutions (titres calculés par gabarit).
Sujets sans page adaptée : data/article-backlog.json (file du pipeline d'articles ai-ressources-weekly.yml), après
validation par scripts/lib/articleBacklog.js (catégorie, service, champ IA, mots-clés des cinq langues).
"""
from __future__ import annotations

import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TR = ROOT / "src" / "translations"

NOM = "houle.ai (houle, conseil en IA indépendant à Genève)"
PROPRIETE = "sc-domain:houle.ai"
HOTE = "houle.ai"
BASE_URL = "https://houle.ai"
BOT = "houle-seo-bot"
DEPLOIEMENT_LLM = "gpt-4.1"
VERSION_API_LLM = "2024-05-01-preview"
APOSTROPHE_COURBE = False
PREFIXE_COMMIT = "feat(seo): "
MARQUE = r"\bhoule\b"
LOCALES = ["en", "fr", "de", "es", "pt"]
THEME = ("conseil et intégration d'IA pour les entreprises en Suisse : agents IA, modèles open source hébergés en "
         "Suisse, GPT privé, Microsoft 365, compléments Word et Outlook, automatisation des processus, gouvernance et "
         "conformité de l'IA (nLPD, AI Act), coûts et retour sur investissement")
REGLES_SITE = ("houle est un cabinet de conseil en IA indépendant et neutre vis-à-vis des éditeurs, à Genève : jamais "
               "partenaire ou revendeur d'un fournisseur, neutre entre Microsoft et OpenAI, Anthropic, Mistral et les "
               "modèles open source, Copilot n'est pas la réponse par défaut ; jamais de prix ni de gain garanti, aucun "
               "client, citation ou statistique inventé ; peu de majuscules, phrases simples, ton professionnel naturel, "
               "pas de « furthermore / moreover / additionally » ; casse des marques : Microsoft 365, SharePoint, Azure "
               "OpenAI ; aucun caractère markdown (* _ ` # [ ]). Pas de sujets fiduciaires, fiscaux ou de salaires sans IA.")
INTERDITS = [
    (r"\bCHF\b|€|\$\s?\d|\bEUR\b|\bUSD\b|\bprix\b|\bpricing\b|\bprice\b|\bPreis\w*|\bprecio\w*|\bpreço\w*|\btarif\w*",
     "prix ou tarif"),
    (r"\bgaranti\w*|\bguarantee\w*|\bgarantiert\w*", "garantie"),
    (r"\bpartenaire officiel|\bofficial partner|\breseller\b|\brevendeur", "partenariat éditeur"),
    (r"\bfurthermore\b|\bmoreover\b|\badditionally\b", "connecteur proscrit (AGENTS.md)"),
    (r"[*_`#\[\]]", "caractère markdown"),
    (r"\bmeilleur\w*|\bbest\b|\bbeste\w*|\bmejor\w*|\bmelhor\w*|\bn[°o]\s?1\b|\bleader\b", "superlatif"),
]
BASE_NS = {
    "/": "home", "/products/ai-agents": "ai-agents", "/products/word-addin": "word-addin",
    "/products/outlook-addin": "outlook-addin", "/products/swiss-gpt": "swiss-gpt",
    "/products/chat-website": "chat-website", "/services/ai-consulting": "ai-consulting",
    "/services/microsoft-consulting": "microsoft-consulting",
}
SANS_FAQ = {"/", "/products/chat-website"}  # FAQ figées dans le code (accueil : 25 questions max ; chat-website : Q1..Q6)
SUFFIXE = " - houle"
BACKLOG = ROOT / "data" / "article-backlog.json"
DEST_SUJETS = "file du pipeline d'articles data/article-backlog.json"
LLM = None  # fourni par le moteur (seo_mensuel.llm) avant ajouter_sujets


def lire(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


def ecrire(p: Path, d: dict) -> None:
    s = p.read_text(encoding="utf-8")
    m = re.search(r"\n( +)\S", s)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=len(m.group(1)) if m else 2)
                 + ("\n" if s.endswith("\n") else ""), encoding="utf-8")


def chaines(x, sauf=("Pricing",)) -> list[str]:
    if isinstance(x, str):
        return [x]
    if isinstance(x, dict):
        return [s for k, v in x.items() if k not in sauf for s in chaines(v, sauf)]
    if isinstance(x, list):
        return [s for v in x for s in chaines(v, sauf)]
    return []


class Page:
    suffixe = ""
    meta_ok = True
    faq_max = 6

    def __init__(self, **kw):
        self.soeurs: dict[str, Page] = {}
        self.__dict__.update(kw)

    def texte(self) -> str:
        return self._texte()


def pages() -> dict[str, Page]:
    out: dict[str, Page] = {}
    redirige = lire(ROOT / "src" / "data" / "articles-redirected-to-ark.json")
    consolide = lire(ROOT / "src" / "data" / "articles-consolidated.json")
    fr_articles = {a["slug"]: a for a in lire(TR / "fr" / "ressources.json")["Articles"]}
    articles: dict[str, dict[str, Page]] = {}
    for loc in LOCALES:
        meta = lire(TR / loc / "metadata.json")
        tpl = meta.get("dynamic", {}).get("articles", {}).get("titleTemplate", "{articleTitle}")
        f = TR / loc / "ressources.json"
        for a in lire(f)["Articles"]:
            slug = a.get("slug")
            if not slug or not a.get("content") or f"{loc}/{slug}" in redirige or slug in consolide:
                continue
            fr = fr_articles.get(slug)
            copie = loc != "fr" and fr and all(fr.get(k) == a.get(k) for k in ("title", "description", "content"))
            t = a.get("title", "")
            branded = tpl.replace("{articleTitle}", t)
            url = f"/{loc}/ressources/articles/{slug}/"
            p = Page(url=url, locale="fr" if copie else loc, fichier=str(f.relative_to(ROOT)), kind="article", path=f,
                     slug=slug, title=a.get("metaTitle") or (branded if len(branded) <= 60 else t),
                     description=a.get("metaDescription") or a.get("description", ""),
                     faq=None if copie or not isinstance(a.get("faq"), list) else [dict(x) for x in a["faq"]],
                     faq_max=5, meta_ok=not copie,
                     _texte=lambda a=a: f"{a.get('title', '')}\n{a.get('description', '')}\n{a['content']}\n"
                                        + "\n".join(f"{x.get('q', '')} {x.get('a', '')}" for x in a.get("faq") or []))
            out[url] = p
            if p.faq is not None:
                articles.setdefault(slug, {})[loc] = p
        for base, ns in BASE_NS.items():
            nsf = TR / loc / f"{ns}.json"
            m = meta.get("pages", {}).get(base)
            if not nsf.exists() or not m:
                continue
            data = lire(nsf)
            url = f"/{loc}/" if base == "/" else f"/{loc}{base}/"
            faq = None
            if base not in SANS_FAQ and isinstance(data.get("Faq"), dict) and isinstance(data["Faq"].get("Items"), list):
                faq = [{"q": x["Question"], "a": x["Answer"]} for x in data["Faq"]["Items"]]
            titre = m.get("title", "")
            a_suffixe = not re.search(r"\bhoule\b", titre, re.I)
            out[url] = Page(url=url, locale=loc, fichier=str((TR / loc / "metadata.json").relative_to(ROOT)),
                            kind="page", path=nsf, base=base, ns=ns, meta_path=TR / loc / "metadata.json",
                            title=titre + (SUFFIXE if a_suffixe else ""), description=m.get("description", ""),
                            suffixe=SUFFIXE if a_suffixe else "", faq=faq,
                            _texte=lambda data=data, m=m: "\n".join([m.get("title", ""), m.get("description", "")]
                                                                     + chaines(data)))
            if faq is not None:
                articles.setdefault("page:" + ns, {})[loc] = out[url]
    # une question ajoutée l'est dans les cinq langues : sinon, pas de FAQ automatique pour ce groupe
    for groupe in articles.values():
        complet = len(groupe) == len(LOCALES)
        for loc, p in groupe.items():
            if complet:
                p.soeurs = {l: q for l, q in groupe.items() if l != loc}
            else:
                p.faq = None
    return out


def ecrire_meta(page: Page, title: str, description: str) -> list[Path]:
    if page.kind == "page":
        d = lire(page.meta_path)
        d["pages"][page.base]["title"] = title[: -len(SUFFIXE)] if page.suffixe and title.endswith(SUFFIXE) else title
        d["pages"][page.base]["description"] = description
        ecrire(page.meta_path, d)
        return [page.meta_path]
    d = lire(page.path)
    for i, a in enumerate(d["Articles"]):
        if a.get("slug") != page.slug:
            continue
        if "metaTitle" in a:
            a["metaTitle"], a["metaDescription"] = title, description
            continue
        nouveau = {}
        for k, v in a.items():
            if k == "metaDescription":
                continue
            nouveau[k] = v
            if k == "description":
                nouveau["metaTitle"], nouveau["metaDescription"] = title, description
        d["Articles"][i] = nouveau
    ecrire(page.path, d)
    return [page.path]


def ajouter_faq(page: Page, q: str, a: str) -> list[Path]:
    d = lire(page.path)
    if page.kind == "page":
        d["Faq"]["Items"].append({"Question": q, "Answer": a})
    else:
        for art in d["Articles"]:
            if art.get("slug") == page.slug:
                art["faq"].append({"q": q, "a": a})
    ecrire(page.path, d)
    return [page.path]


SYS_BACKLOG = """Tu prépares des sujets d'articles pour la file du pipeline d'articles de houle.ai (conseil en IA indépendant,
Genève). Pour chaque requête Google fournie, écris un sujet qui y répond, dans le champ de l'IA appliquée aux
entreprises (jamais un sujet fiduciaire, fiscal ou de salaires sans IA ; le titre doit parler explicitement d'IA,
d'agent, de LLM, de GPT, d'automatisation par IA ou équivalent).
Champs : id (slug unique en minuscules et tirets, nouveau), category (une des catégories fournies), intent
(informational, commercial ou transactional), priority (1, 2 ou 3 ; 1 = le plus prioritaire), service (un des chemins
fournis), title (en français, sans tiret long), angle (une phrase en français), keywords : {{"fr": [...], "en": [...],
"de": [...], "es": [...], "pt": [...]}} avec 2 ou 3 mots-clés de recherche par langue, la requête d'origine en tête dans
sa langue ; requete : la requête d'origine, recopiée telle quelle. Règles du site : {regles}
Réponds uniquement par un objet JSON : {{"topics": [ ... ]}}"""


def _valider(bl: dict) -> list[str]:
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as fh:
        json.dump(bl, fh, ensure_ascii=False)
    js = ("const B=require('./scripts/lib/articleBacklog.js');const fs=require('fs');"
          "const bl=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));"
          "console.log(JSON.stringify(B.validateBacklog(bl,{servicePaths:B.loadServicePaths()})));")
    r = subprocess.run(["node", "-e", js, fh.name], cwd=ROOT, capture_output=True, text=True)
    Path(fh.name).unlink(missing_ok=True)
    if r.returncode:
        return [f"validation impossible : {r.stderr[-300:]}"]
    return json.loads(r.stdout)


def ajouter_sujets(sujets: list[dict]) -> tuple[list[Path], list[Path]]:
    bl = lire(BACKLOG)
    cats = [c["id"] for c in bl["categories"]]
    services = sorted({t["service"] for t in bl["topics"]})
    ids = {t["id"] for t in bl["topics"]}
    rep = LLM(SYS_BACKLOG.format(regles=REGLES_SITE),
              f"Catégories : {', '.join(cats)}\nServices : {', '.join(services)}\nIdentifiants déjà pris : "
              f"{', '.join(sorted(ids))}\n\nRequêtes :\n"
              + "\n".join(f"- « {s['requete']} » ({s['impressions']} impressions, position {s['position']}) : {s['angle']}"
                          for s in sujets))
    cands = [t for t in rep.get("topics", []) if isinstance(t, dict) and t.get("id") and t["id"] not in ids]
    origine = {t["id"]: str(t.get("requete", "")).strip().lower() for t in cands}
    garder = {"id", "category", "intent", "priority", "service", "title", "angle", "keywords"}
    cands = [{k: v for k, v in t.items() if k in garder} for t in cands]
    for t in cands:
        t["title"] = re.sub(r"\s*[—–]\s*", ", ", str(t.get("title", "")))
    base_err = set(_valider(bl))
    if not cands:
        sujets.clear()
        return [], []
    while cands:
        err = [e for e in _valider({**bl, "topics": bl["topics"] + cands}) if e not in base_err]
        if not err:
            break
        mauvais = {t["id"] for t in cands for e in err if e.startswith(f"topic {t['id']}:")}
        if not mauvais:
            sujets.clear()
            return [], []  # erreur non attribuable à un sujet : on n'ajoute rien
        cands = [t for t in cands if t["id"] not in mauvais]
    par_requete = {origine.get(t["id"], ""): t["id"] for t in cands}
    for s in sujets:  # le moteur ne journalise que ce qui a vraiment été versé à la file
        s["backlog_id"] = par_requete.get(s["requete"], "")
    sujets[:] = [s for s in sujets if s["backlog_id"]]
    cands = [t for t in cands if t["id"] in {s["backlog_id"] for s in sujets}]
    if not cands:
        return [], []
    bl["topics"] += cands
    ecrire(BACKLOG, bl)
    return [BACKLOG], []


CONTROLES = [
    ("Lint", "npm run lint", "."),
    ("Tests (types, données structurées, rotation des sujets, redirections)", "npm test", "."),
    ("FAQ (texte visible = JSON-LD, typographie, 3 à 6 / 3 à 5)", "npx --yes node@22 --test src/lib/faq-content.test.ts",
     "."),
    ("File de sujets", "node scripts/article-topic-plan.js --check", "."),
    ("Liens internes des articles", "node scripts/fix-article-internal-links.js --check", "."),
    ("Build (traductions validées au prebuild)", "npm run build", "."),
]


def deployer(log) -> str:
    log("le push (jeton PAT_TOKEN du checkout) déclenche build-and-deploy.yml")
    return ("Déploiement : build-and-deploy.yml, déclenché par le push, attend la fin de ce passage (groupe "
            "production-deploy).")
