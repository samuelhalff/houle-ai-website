import React from "react";

interface Labels {
  ReadArticle?: string;
  By?: string;
  Published?: string;
}

// Color palette for visual variety
const cardColors = [
  {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    accent: "bg-blue-500",
  },
  {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    accent: "bg-emerald-500",
  },
  {
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    accent: "bg-violet-500",
  },
  {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    accent: "bg-amber-500",
  },
  {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    accent: "bg-rose-500",
  },
  {
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    accent: "bg-cyan-500",
  },
];

interface ResourceCardProps {
  title: string;
  description: string;
  href: string;
  date?: string;
  author?: string;
  labels?: Labels;
  colorIndex?: number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  href,
  date,
  author,
  labels,
  colorIndex = 0,
}) => {
  const colors = cardColors[colorIndex % cardColors.length];

  return (
    <a
      href={href}
      className="group flex flex-col h-full rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
    >
      {/* Date badge */}
      {date && (
        <div className="mb-4">
          <time
            dateTime={new Date(date).toISOString()}
            className="inline-flex items-center px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] rounded-md bg-brand-soft text-brand-hover dark:text-brand"
          >
            {formatDateDeterministic(date)}
          </time>
        </div>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-brand transition-colors duration-200 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="flex-1 text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {author && (
          <p className="text-xs text-muted-foreground font-medium">{author}</p>
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand group-hover:gap-2.5 transition-all duration-200">
          {(labels && labels.ReadArticle) || "Read"}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </a>
  );
};

export default ResourceCard;

function formatDateDeterministic(date?: string) {
  if (!date) return "";
  try {
    // Use a fixed locale to produce consistent server/client output (day/month/year)
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch (e) {
    // Fallback to ISO date if formatting fails
    return new Date(date).toISOString().split("T")[0];
  }
}
