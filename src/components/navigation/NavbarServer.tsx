"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Defer from "@/src/components/Defer";
import { usePathname } from "next/navigation";
import type { NavData } from "@/src/components/navigation/types";
import { buttonVariants } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

const HeaderControls = dynamic(
  () => import("@/src/components/navigation/HeaderControls"),
  { ssr: false, loading: () => null }
);
const MobileMenuIsland = dynamic(
  () => import("@/src/components/navigation/MobileMenuIsland"),
  { ssr: false, loading: () => null }
);

export default function NavbarServer({
  locale,
  navData,
}: {
  locale?: string;
  navData: NavData;
}) {
  const pathname = usePathname();
  const localePrefix = locale ? `/${locale}` : "/en";

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

  const linkBase =
    "inline-flex items-center justify-center px-3 py-2 rounded-lg font-medium text-[0.95rem] text-center min-w-[92px] transition-colors duration-160 ease-in-out hover:bg-accent hover:text-accent-foreground";
  const activeClasses = "bg-accent text-accent-foreground";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full max-w-screen">
      <nav className="backdrop-blur-[14px] bg-white/80 border-b dark:bg-black/70 h-16 flex items-center">
        <div className="flex items-center justify-between gap-4 h-full mx-auto max-w-[1200px] px-4 w-full sm:px-6">
          <Link
            href={`${localePrefix}/`}
            prefetch={false}
            locale={locale}
            aria-label={navData.labels.home}
            className="font-semibold tracking-tight text-lg text-primary"
          >
            houle<span className="text-foreground">.ai</span>
          </Link>

          <div className="hidden md:block">
            <nav aria-label="Primary">
              <ul className="flex items-center gap-1">
                <li>
                  <Link
                    href={`${localePrefix}/`}
                    prefetch={false}
                    locale={locale}
                    aria-current={
                      isActive(`${localePrefix}`) ? "page" : undefined
                    }
                    className={cn(
                      linkBase,
                      isActive(`${localePrefix}`) ? activeClasses : ""
                    )}
                  >
                    {navData.labels.home}
                  </Link>
                </li>
                <li className={navData.hideProducts ? "hidden" : ""}>
                  <Link
                    href={`${localePrefix}/products`}
                    prefetch={false}
                    locale={locale}
                    aria-current={
                      isSection(`${localePrefix}/products`) ? "page" : undefined
                    }
                    className={cn(
                      linkBase,
                      "min-w-[112px]",
                      isSection(`${localePrefix}/products`) ? activeClasses : "",
                      "opacity-70 pointer-events-none"
                    )}
                    aria-hidden
                    tabIndex={-1}
                  >
                    {navData.labels.products}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/contact`}
                    prefetch={false}
                    locale={locale}
                    aria-current={
                      isSection(`${localePrefix}/contact`) ? "page" : undefined
                    }
                    className={cn(
                      linkBase,
                      "min-w-[96px]",
                      isSection(`${localePrefix}/contact`)
                        ? activeClasses
                        : ""
                    )}
                  >
                    {navData.labels.contact}
                  </Link>
                </li>
                <li className="ml-1">
                  <HeaderControls />
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/contact`}
                    prefetch={false}
                    locale={locale}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "rounded-full bg-primary text-primary-foreground hover:shadow-lg hover:scale-[1.02]",
                      "ml-2"
                    )}
                  >
                    Book a call
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex md:hidden">
            <Defer
              rootMargin="100px"
              idle={150}
              maxDelay={1800}
              placeholder={null}
            >
              <MobileMenuIsland locale={locale} navData={navData} />
            </Defer>
          </div>
        </div>
      </nav>
    </div>
  );
}
