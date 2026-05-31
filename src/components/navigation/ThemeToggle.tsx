"use client";
import { useTheme } from "next-themes";

function ListItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full cursor-pointer rounded-sm px-4 py-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
      role="menuitem"
    >
      {children}
    </button>
  );
}

export default function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div className="theme-toggle group relative">
      <button
        type="button"
        className="theme-toggle-trigger flex h-9 min-w-[44px] items-center justify-center gap-1 rounded-md bg-background px-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-haspopup="menu"
      >
        <svg
          className="h-4 w-4 dark:hidden"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
        <svg
          className="h-4 w-4 hidden dark:block"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span className="sr-only">Toggle theme</span>
        <svg
          className="relative top-px ml-1 size-3 transition duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className="invisible absolute right-0 top-full z-50 mt-1.5 min-w-36 overflow-hidden rounded-md border bg-popover p-2 text-popover-foreground opacity-0 shadow transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        <ListItem onClick={() => setTheme("light")}>Light</ListItem>
        <ListItem onClick={() => setTheme("dark")}>Dark</ListItem>
        <ListItem onClick={() => setTheme("system")}>System</ListItem>
      </div>
    </div>
  );
}
