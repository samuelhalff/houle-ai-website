"use client";

import { useState } from "react";

const PlusIcon = ({
  className,
  stroke,
}: {
  className?: string;
  stroke?: string;
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke || "currentColor"}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  items: FAQItem[];
}

export default function FAQ({ title, subtitle, lastUpdated, items }: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div id="faq" className="w-full max-w-[1200px] mx-auto py-16 px-6 mb-10">
      <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-4xl mx-auto">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-center text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {lastUpdated}{" "}
        {new Intl.DateTimeFormat(undefined, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date())}
      </p>

      <div className="mt-8 columns-1 md:columns-2 gap-4">
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          return (
            <div
              key={index}
              className="bg-accent rounded-xl px-5 py-3 mb-4 break-inside-avoid transition-shadow"
              style={{
                boxShadow: isOpen ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                className="flex items-center justify-between gap-4 w-full text-left py-1 pr-2"
                aria-expanded={isOpen}
              >
                <h3 className="font-semibold tracking-tight text-lg leading-snug">
                  {item.question}
                </h3>
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-all flex-none"
                  style={{
                    backgroundColor: isOpen
                      ? "hsl(var(--foreground) / 0.65)"
                      : "hsl(var(--foreground) / 0.55)",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  <PlusIcon
                    className="w-5 h-5"
                    stroke="hsl(var(--background))"
                  />
                </span>
              </button>
              {isOpen && (
                <div className="mt-2 pb-2 text-[15px] text-foreground/80">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
