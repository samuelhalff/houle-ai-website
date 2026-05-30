import React from "react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

function MessageCircleIcon({
  className = "",
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

const ContactSection = ({
  locale,
  title,
  description,
  buttonText,
}: {
  locale?: string;
  title: string;
  description: string;
  buttonText: string;
}) => {
  const localePrefix = locale ? `/${locale}` : "/fr";

  return (
    <section className="rounded-2xl border border-brand/15 bg-brand-soft px-8 py-10 text-center mt-12">
      <div className="max-w-2xl mx-auto">
        <MessageCircleIcon className="w-10 h-10 text-brand mx-auto mb-5" />
        <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">{title}</h3>
        <p className="mb-7 text-sm leading-7 text-foreground/70">{description}</p>
        <Link href={`${localePrefix}/contact/`} locale={locale} prefetch={false}>
          <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-background">
            <span>{buttonText}</span>
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ContactSection;
