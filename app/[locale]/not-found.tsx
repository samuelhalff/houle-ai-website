import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="max-w-[var(--breakpoint-xl)] mx-auto px-6 py-16"
    >
      <div className="text-center space-y-4">
        <p className="text-7xl font-black tracking-tight text-muted-foreground">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Page not found
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We are reshaping the site for houle. The page you are looking for
          is not available yet.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/en/"
            className="inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2 font-medium hover:shadow-md"
          >
            Back to home
          </Link>
          <Link
            href="/en/contact"
            className="inline-flex rounded-full border border-border px-5 py-2 font-medium hover:bg-accent"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
