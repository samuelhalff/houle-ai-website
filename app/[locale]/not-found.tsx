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

  return (
    <main
      id="main-content"
      className="max-w-[1200px] mx-auto px-6 py-16 md:py-24"
    >
      <div className="text-center mb-12">
        <p className="text-8xl md:text-9xl font-black tracking-tight text-muted-foreground/20 mb-4">
          404
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {content.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {content.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link
          href={localePrefix}
          className="group p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">🏠</div>
          <h2 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {content.home}
          </h2>
        </Link>

        <Link
          href={`${localePrefix}/services`}
          className="group p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">🔧</div>
          <h2 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {content.services}
          </h2>
        </Link>

        <Link
          href={`${localePrefix}/products`}
          className="group p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">📦</div>
          <h2 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {content.products}
          </h2>
        </Link>

        <Link
          href={`${localePrefix}/contact`}
          className="group p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">💬</div>
          <h2 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {content.contact}
          </h2>
        </Link>
      </div>

      {articles.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {content.articlesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`${localePrefix}/ressources/articles/${article.slug}`}
                className="group block p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {article.description}
                </p>
                <span className="text-sm text-primary font-medium">
                  {content.readMore} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
