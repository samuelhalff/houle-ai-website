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
import { cn } from "@/src/lib/utils";
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
          <nav className="flex flex-col gap-3 px-4 mt-3 pb-10 pt-2">
            <ThemeToggleMobile />
            <Suspense fallback={null}>
              <LangSwitchMobile onLocaleChange={handleLinkClick} />
            </Suspense>
            <div>
              <Link
                href={`${localePrefix}/`}
                onClick={handleLinkClick}
                prefetch={false}
                className="flex items-center gap-3 text-md px-2 py-2 rounded hover:bg-accent active:scale-[0.99] transition-all font-bold"
              >
                <span>{navData.labels.home}</span>
              </Link>
            </div>
            {!navData.hideProducts && (
              <div>
                <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {navData.labels.products}
                </div>
                {navData.products.map((product) => (
                  <Link
                    key={product.href}
                    href={`${localePrefix}${product.href}`}
                    onClick={handleLinkClick}
                    prefetch={false}
                    className="flex items-start gap-3 text-md px-4 py-2 rounded hover:bg-accent active:scale-[0.99] transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{product.title}</div>
                      {product.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div>
              <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {navData.labels.services}
              </div>
              {navData.services.map((service) => (
                <Link
                  key={service.href}
                  href={`${localePrefix}${service.href}`}
                  onClick={handleLinkClick}
                  prefetch={false}
                  className="flex items-start gap-3 text-md px-4 py-2 rounded hover:bg-accent active:scale-[0.99] transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium">{service.title}</div>
                    {service.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {service.description}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div>
              <Link
                href={`${localePrefix}/ressources/`}
                onClick={handleLinkClick}
                prefetch={false}
                className="flex items-center gap-3 text-md px-2 py-2 rounded hover:bg-accent active:scale-[0.99] transition-all"
              >
                <span>{navData.labels.ressources}</span>
              </Link>
            </div>
            {/* Contact: final entry — hairline separator then accent-coloured
                label with a mono email line beneath. */}
            <div className="mt-5 border-t border-border pt-6">
              <Link
                href={`${localePrefix}/contact/`}
                onClick={handleLinkClick}
                prefetch={false}
                className="flex items-center px-2 py-2 text-md font-bold text-brand transition-opacity hover:opacity-80"
              >
                <span>{navData.labels.contact}</span>
              </Link>
              <a
                href="mailto:contact@houle.ai"
                className="block px-2 pt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                contact@houle.ai
              </a>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
