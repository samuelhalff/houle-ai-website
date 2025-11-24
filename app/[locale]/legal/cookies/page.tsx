import { type Metadata } from "next";
import { Separator } from "@/src/components/ui/separator";
import { LEGAL_LAST_UPDATED } from "../constants";

export const metadata: Metadata = {
  title: "Cookies Policy - houle.ai",
  description: "Information about our use of cookies and tracking technologies",
};

function formatDate(date: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export default function CookiesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  return (
    <div className="container mx-auto px-4 py-16 max-w-[var(--breakpoint-xl)]">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Cookies Policy</h1>
        <p className="text-lg mb-2">
          Information about our use of cookies and tracking technologies
        </p>
        <p className="text-xs">
          Last updated: {formatDate(LEGAL_LAST_UPDATED, locale)}
        </p>
        <Separator className="mt-6" />
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <div className="space-y-4">
            <p>
              This Cookies Policy explains how houle.ai (West-Bay SA) uses cookies and similar tracking technologies on our website. It provides information about what cookies are, how we use them, and your choices regarding their use.
            </p>
            <p>
              By using our website, you consent to the use of cookies in accordance with this policy and our Privacy Policy.
            </p>
          </div>
        </section>

        {/* What Are Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
          <div className="space-y-4">
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They allow the website to recognize your device and store information about your preferences or past actions.
            </p>
            <p>Cookies typically contain:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The name of the server that placed the cookie</li>
              <li>An identifier in the form of a unique number</li>
              <li>An expiration date (some cookies only last for the duration of your session)</li>
            </ul>
          </div>
        </section>

        {/* Types of Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
          <div className="space-y-8">
            {/* Essential Cookies */}
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Essential Cookies</h3>
              <p className="mb-3">
                These cookies are necessary for the website to function properly and cannot be disabled.
              </p>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="font-semibold mb-2">Purpose:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Website navigation and basic functionality</li>
                  <li>Security and authentication</li>
                  <li>Language and accessibility preferences</li>
                  <li>Form submission and session management</li>
                </ul>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div>
              <h3 className="text-lg font-semibold mb-3">2. Analytics Cookies</h3>
              <p className="mb-3">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="font-semibold mb-2">Purpose:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Website traffic analysis</li>
                  <li>Page performance monitoring</li>
                  <li>User behavior patterns</li>
                  <li>Website optimization and improvement</li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Providers: Analytics tools</strong>
                </p>
              </div>
            </div>

            {/* Functional Cookies */}
            <div>
              <h3 className="text-lg font-semibold mb-3">3. Functional Cookies</h3>
              <p className="mb-3">
                These cookies enable enhanced functionality and personalization features.
              </p>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="font-semibold mb-2">Purpose:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Remembering language and theme preferences</li>
                  <li>Saving form data and progress</li>
                  <li>Customizing content and layout</li>
                  <li>Providing enhanced user experience</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Duration */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Cookie Duration</h2>
          <div className="space-y-4">
            <p>Cookies are classified by duration as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Session Cookies: Temporary cookies that are deleted when you close your browser</li>
              <li>Persistent Cookies: Remain on your device for a set period or until manually deleted</li>
            </ul>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Typical Cookie Lifespans:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Essential cookies: Session duration or up to 1 year</li>
                <li>Analytics cookies: 2 years maximum</li>
                <li>Functional cookies: 1 year maximum</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Browser Settings</h3>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View and delete cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close the browser</li>
              </ul>

              <div className="mt-4">
                <p className="font-semibold mb-2">Browser-specific instructions:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Manage cookies in Chrome
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Manage cookies in Firefox
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Manage cookies in Safari
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Manage cookies in Edge
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Impact of Disabling Cookies</h3>
              <p>
                Please note that disabling certain cookies may affect your experience on our website:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Essential cookies: Website may not function properly</li>
                <li>Analytics cookies: We cannot improve our website based on usage data</li>
                <li>Functional cookies: Personalization features will be disabled</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <div className="space-y-4">
            <p>
              We retain cookie data for a limited period necessary for the purposes described in this policy.
            </p>
          </div>
        </section>

        {/* Updates to Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Updates to this Policy</h2>
          <div className="space-y-4">
            <p>
              We may update this policy from time to time to reflect changes in technology, regulation, or our practices.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Update this page with the latest effective date</li>
              <li>Notify users through our website (for significant changes)</li>
              <li>Request renewed consent where required by law</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <div className="space-y-4">
            <p>
              If you have any questions about this policy, please contact us:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="font-semibold">houle.ai (West-Bay SA)</p>
              <p>19 Pré-Roset, 1294 Genthod, Switzerland</p>
              <p className="font-semibold">Email: contact@houle.ai</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
