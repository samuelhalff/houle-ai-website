import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import fs from "fs";
import path from "path";

interface Article {
  slug: string;
  title: string;
  description: string;
  date?: string;
}

async function getRecentArticles(locale: Locale): Promise<Article[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "translations",
      locale,
      "ressources.json"
    );
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return (data.Articles || []).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function NotFoundPage() {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  const locale = (localeMatch?.[1] || "en") as Locale;
  const localePrefix = `/${locale}`;

  const tNav = await getTranslations(locale, "navbar");
  const articles = await getRecentArticles(locale);

  const content = {
    title:
      locale === "fr"
        ? "Page introuvable"
        : locale === "de"
        ? "Seite nicht gefunden"
        : locale === "es"
        ? "Página no encontrada"
        : locale === "pt"
        ? "Página não encontrada"
        : "Page not found",
    description:
      locale === "fr"
        ? "Cette page n'existe pas ou a été déplacée. Explorez nos services, produits ou articles pour trouver ce que vous cherchez."
        : locale === "de"
        ? "Diese Seite existiert nicht oder wurde verschoben. Erkunden Sie unsere Dienstleistungen, Produkte oder Artikel, um zu finden, was Sie suchen."
        : locale === "es"
        ? "Esta página no existe o ha sido movida. Explore nuestros servicios, productos o artículos para encontrar lo que busca."
        : locale === "pt"
        ? "Esta página não existe ou foi movida. Explore nossos serviços, produtos ou artigos para encontrar o que procura."
        : "This page doesn't exist or has been moved. Explore our services, products, or articles to find what you're looking for.",
    home:
      locale === "fr"
        ? "Accueil"
        : locale === "de"
        ? "Startseite"
        : locale === "es"
        ? "Inicio"
        : locale === "pt"
        ? "Início"
        : "Home",
    services:
      locale === "fr"
        ? "Services"
        : locale === "de"
        ? "Dienstleistungen"
        : locale === "es"
        ? "Servicios"
        : locale === "pt"
        ? "Serviços"
        : "Services",
    products:
      locale === "fr"
        ? "Produits"
        : locale === "de"
        ? "Produkte"
        : locale === "es"
        ? "Productos"
        : locale === "pt"
        ? "Produtos"
        : "Products",
    contact:
      locale === "fr"
        ? "Contact"
        : locale === "de"
        ? "Kontakt"
        : locale === "es"
        ? "Contacto"
        : locale === "pt"
        ? "Contato"
        : "Contact",
    articlesTitle:
      locale === "fr"
        ? "Articles récents"
        : locale === "de"
        ? "Aktuelle Artikel"
        : locale === "es"
        ? "Artículos recientes"
        : locale === "pt"
        ? "Artigos recentes"
        : "Recent articles",
    readMore:
      locale === "fr"
        ? "Lire l'article"
        : locale === "de"
        ? "Artikel lesen"
        : locale === "es"
        ? "Leer artículo"
        : locale === "pt"
        ? "Ler artigo"
        : "Read article",
  };

  const navLinks = [
    {
      href: localePrefix,
      label: content.home,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: `${localePrefix}/services/`,
      label: content.services,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>
      ),
    },
    {
      href: `${localePrefix}/products/`,
      label: content.products,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
    },
    {
      href: `${localePrefix}/contact/`,
      label: content.contact,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 md:py-24"
    >
      <div className="mb-14 text-center">
        <p className="mb-4 text-8xl font-black tracking-tight text-muted-foreground/15 md:text-9xl select-none">
          404
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {content.title}
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {content.description}
        </p>
      </div>

      <div className="mb-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
          >
            <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
              {link.icon}
            </span>
            <span className="font-semibold text-foreground transition-colors group-hover:text-brand">
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      {articles.length > 0 && (
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {content.articlesTitle}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`${localePrefix}/ressources/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
              >
                <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-brand line-clamp-2">
                  {article.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-6 text-muted-foreground line-clamp-3">
                  {article.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  {content.readMore}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
