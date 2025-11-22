export default function Footer({ locale }: { locale?: string }) {
  const localePrefix = locale ? `/${locale}` : "/en";
  return (
    <footer className="mt-16 border-t bg-background text-foreground">
      <div className="mx-auto flex max-w-[var(--breakpoint-xl)] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold">houle.ai</p>
          <p className="text-sm text-muted-foreground">
            {locale === "fr"
              ? "IA privée intégrée aux outils Microsoft que vous utilisez déjà."
              : "Private AI built into the Microsoft tools you already use."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`${localePrefix}/`}
            className="text-sm font-medium hover:text-primary"
          >
            Home
          </a>
          <a
            href={`${localePrefix}/contact`}
            className="text-sm font-medium hover:text-primary"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
