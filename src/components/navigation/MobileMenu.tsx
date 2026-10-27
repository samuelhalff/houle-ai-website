"use client";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Suspense } from "react";
import LangSwitchMobile from "@/src/components/navigation/LangSwitchMobile";
import ThemeToggleMobile from "@/src/components/navigation/ThemeToggleMobile";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TrackedLink from "@/src/components/ui/tracked-link";
import { cn } from "@/src/lib/utils";
import { trackEvent } from "@/src/lib/analytics";
import type { NavData } from "@/src/components/navigation/types";

const MobileMenuToggleIcon = ({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn(
      "pointer-events-none relative flex h-4 w-6 items-center justify-center",
      className
    )}
  >
    <span
      className={cn(
        "absolute block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ease-in-out",
        open ? "translate-y-0 rotate-45" : "-translate-y-[6px] rotate-0"
      )}
    />
    <span
      className={cn(
        "absolute block h-[2px] w-6 rounded-full bg-current transition-all duration-200 ease-in-out",
        open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
      )}
    />
    <span
      className={cn(
        "absolute block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ease-in-out",
        open ? "translate-y-0 -rotate-45" : "translate-y-[6px] rotate-0"
      )}
    />
  </span>
);

// Locale- and trailing-slash-insensitive path: "/fr/services/ai-consulting/" -> "/services/ai-consulting".
const LOCALES = ["en", "fr", "de", "es", "pt"];
const toSectionPath = (p: string) => {
  const parts = p.split(/[?#]/)[0].split("/").filter(Boolean);
  if (parts.length && LOCALES.includes(parts[0])) parts.shift();
  return "/" + parts.join("/");
};

// Shared by plain rows and disclosure summaries so every top-level entry has the same size.
// Plain `border-b` picks up the global --border colour (the `border-border` utility breaks in dark mode).
const rowBase =
  "flex min-h-12 w-full items-center justify-between border-b py-3 text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const rowClass = `${rowBase} text-foreground hover:text-brand-hover aria-[current=page]:text-brand-hover dark:hover:text-brand dark:aria-[current=page]:text-brand`;

type MenuItem = { href: string; title: string };

const MenuSection = ({
  label,
  items,
  hub,
  localePrefix,
  path,
  onNavigate,
}: {
  label: string;
  items: MenuItem[];
  hub: { href: string; label?: string };
  localePrefix: string;
  path: string;
  onNavigate: () => void;
}) => {
  const hubPath = toSectionPath(hub.href);
  const inSection = path === hubPath || path.startsWith(hubPath + "/");
  return (
    // Native disclosure: keyboard and screen-reader accessible; closed links stay in the DOM.
    <details className="group" open={inSection}>
      <summary
        className={cn(
          rowClass,
          "cursor-pointer list-none group-open:border-transparent [&::-webkit-details-marker]:hidden"
        )}
      >
        {label}
        <span
          aria-hidden
          className="text-2xl font-light leading-none text-brand-hover transition-transform duration-200 group-open:rotate-45 dark:text-brand"
        >
          +
        </span>
      </summary>
      <ul className="border-b py-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={`${localePrefix}${item.href}`}
              onClick={onNavigate}
              prefetch={false}
              aria-current={
                path === toSectionPath(item.href) ? "page" : undefined
              }
              className="flex min-h-11 items-center pl-4 text-base text-foreground transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-brand-hover dark:hover:text-brand dark:aria-[current=page]:text-brand"
            >
              {item.title}
            </Link>
          </li>
        ))}
        {hub.label && (
          <li>
            <Link
              href={`${localePrefix}${hub.href}`}
              onClick={onNavigate}
              prefetch={false}
              aria-current={path === hubPath ? "page" : undefined}
              className="flex min-h-11 items-center pl-4 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-brand-hover dark:aria-[current=page]:text-brand"
            >
              {hub.label}
            </Link>
          </li>
        )}
      </ul>
    </details>
  );
};

const MobileMenu = ({
  locale,
  navData,
}: {
  locale?: string;
  navData: NavData;
}) => {
  const [open, setOpen] = useState(false);
  const handleLinkClick = () => setOpen(false);
  const localePrefix = locale ? `/${locale}` : "/en";
  const path = toSectionPath(usePathname() || "/");
  const isCurrent = (href: string) => path === toSectionPath(href);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "p-2 text-foreground transition-colors",
            open ? "text-primary" : "hover:text-primary"
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="mobile-menu-panel"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <MobileMenuToggleIcon open={open} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-[100vw] h-[100svh] sm:h-full overflow-hidden p-0 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
        hideClose
        id="mobile-menu-panel"
        aria-label="Mobile navigation"
        role="dialog"
      >
        <SheetTitle className="sr-only">
          {navData.labels.mobileNavigation}
        </SheetTitle>
        <div className="flex items-center h-16 px-4 border-b">
          <div className="flex-1 text-lg font-semibold text-primary">
            houle.ai
          </div>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="ml-2 p-2 text-primary transition-colors hover:text-primary/90"
              aria-label="Close menu"
            >
              <MobileMenuToggleIcon open className="scale-90" />
            </Button>
          </SheetTrigger>
        </div>
        <div
          className="h-[calc(100svh-64px)] md:h-[calc(100vh-64px)] overflow-y-auto pb-24 [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <nav aria-label={navData.labels.mobileNavigation} className="px-4 pb-10 pt-2">
            <ul className="flex flex-col">
              <li>
                <Link
                  href={`${localePrefix}/`}
                  onClick={handleLinkClick}
                  prefetch={false}
                  aria-current={isCurrent("/") ? "page" : undefined}
                  className={rowClass}
                >
                  {navData.labels.home}
                </Link>
              </li>
              {!navData.hideProducts && (
                <li>
                  <MenuSection
                    label={navData.labels.products}
                    items={navData.products}
                    hub={{ href: "/products/", label: navData.labels.allProducts }}
                    localePrefix={localePrefix}
                    path={path}
                    onNavigate={handleLinkClick}
                  />
                </li>
              )}
              <li>
                <MenuSection
                  label={navData.labels.services}
                  items={navData.services}
                  hub={{ href: "/services/", label: navData.labels.allServices }}
                  localePrefix={localePrefix}
                  path={path}
                  onNavigate={handleLinkClick}
                />
              </li>
              <li>
                <Link
                  href={`${localePrefix}/ressources/`}
                  onClick={handleLinkClick}
                  prefetch={false}
                  aria-current={isCurrent("/ressources") ? "page" : undefined}
                  className={rowClass}
                >
                  {navData.labels.ressources}
                </Link>
              </li>
              <li>
                <TrackedLink
                  cta="nav_mobile_contact"
                  href={`${localePrefix}/contact/`}
                  onClick={handleLinkClick}
                  prefetch={false}
                  aria-current={isCurrent("/contact") ? "page" : undefined}
                  className={`${rowBase} text-brand-hover hover:opacity-80 dark:text-brand`}
                >
                  {navData.labels.contact}
                </TrackedLink>
              </li>
            </ul>
            <a
              href="mailto:contact@houle.ai"
              onClick={() =>
                trackEvent("contact_channel_click", {
                  channel: "email",
                  location: "mobile_menu",
                })
              }
              className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              contact@houle.ai
            </a>
            <div className="mt-3 flex flex-col gap-1 border-t pt-3 [&>div>span:first-child]:pl-0">
              <ThemeToggleMobile />
              <Suspense fallback={null}>
                <LangSwitchMobile onLocaleChange={handleLinkClick} />
              </Suspense>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
