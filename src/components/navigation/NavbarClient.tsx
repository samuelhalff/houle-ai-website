"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Defer from "@/src/components/Defer";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { NavData } from "@/src/components/navigation/types";
import ServicesDropdown from "@/src/components/navigation/ServicesDropdown";
import ProductsDropdown from "@/src/components/navigation/ProductsDropdown";

const HeaderControls = dynamic(
  () => import("@/src/components/navigation/HeaderControls"),
  { ssr: false, loading: () => null }
);
const MobileMenuIsland = dynamic(
  () => import("@/src/components/navigation/MobileMenuIsland"),
  { ssr: false, loading: () => null }
);

export default function NavbarClient({
  locale,
  navData,
}: {
  locale?: string;
  navData: NavData;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const localePrefix = locale ? `/${locale}` : "/en";

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const normalize = (p: string) => {
    if (!p) return "/";
    return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
  };
  const isActive = (href: string) => normalize(pathname) === normalize(href);
  const isSection = (href: string) => {
    const cur = normalize(pathname);
    const base = normalize(href);
    return cur === base || cur.startsWith(base + "/");
  };

  /* Pill nav links with brand underline indicator — matches ark-fid style */
  const linkBase =
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-center transition-colors duration-160 ease-in-out hover:bg-surface-tint hover:text-foreground cursor-pointer after:absolute after:inset-x-3 after:-bottom-1 after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-200";
  const activeClasses =
    "text-brand-hover hover:text-brand-hover after:scale-x-100 dark:text-brand dark:hover:text-brand";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <nav
        className={`site-header flex h-16 items-center bg-background transition-[box-shadow] duration-200 ${
          scrolled
            ? "shadow-[0_16px_38px_rgba(0,0,0,0.08),0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.72),0_1px_0_rgba(255,255,255,0.08)]"
            : "shadow-none"
        }`}
      >
        <div className="site-header-inner mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8 xl:px-0">
          <Link
            href={`${localePrefix}/`}
            prefetch={false}
            locale={locale}
            aria-label={navData.labels.home}
            className="site-logo font-semibold tracking-tight text-lg"
          >
            <span className="text-brand">houle</span>
            <span className="text-foreground">.ai</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden min-w-0 flex-1 md:block">
            <nav aria-label="Primary">
              <ul className="flex min-w-0 items-center justify-end gap-1">
                <li>
                  <Link
                    href={`${localePrefix}/`}
                    prefetch={false}
                    locale={locale}
                    aria-current={isActive(`${localePrefix}`) ? "page" : undefined}
                    className={`${linkBase} ${isActive(`${localePrefix}`) ? activeClasses : ""}`}
                  >
                    {navData.labels.home}
                  </Link>
                </li>
                {!navData.hideProducts && (
                  <ProductsDropdown
                    locale={locale}
                    localePrefix={localePrefix}
                    navData={navData}
                    isActive={isSection(`${localePrefix}/products`)}
                  />
                )}
                <ServicesDropdown
                  locale={locale}
                  localePrefix={localePrefix}
                  navData={navData}
                  isActive={isSection(`${localePrefix}/services`)}
                />
                <li>
                  <Link
                    href={`${localePrefix}/ressources/`}
                    prefetch={false}
                    locale={locale}
                    aria-current={
                      isSection(`${localePrefix}/ressources`) ? "page" : undefined
                    }
                    className={`${linkBase} ${
                      isSection(`${localePrefix}/ressources`) ? activeClasses : ""
                    }`}
                  >
                    {navData.labels.ressources}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/contact/`}
                    prefetch={false}
                    locale={locale}
                    aria-current={
                      isSection(`${localePrefix}/contact`) ? "page" : undefined
                    }
                    className={`${linkBase} ${
                      isSection(`${localePrefix}/contact`) ? activeClasses : ""
                    }`}
                  >
                    {navData.labels.contact}
                  </Link>
                </li>
                <li className="site-header-controls ml-1">
                  <HeaderControls />
                </li>
              </ul>
            </nav>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden">
            <Defer rootMargin="100px" idle={150} maxDelay={1800} placeholder={null}>
              <MobileMenuIsland locale={locale} navData={navData} />
            </Defer>
          </div>
        </div>
      </nav>
    </div>
  );
}
