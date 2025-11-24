import { type Metadata } from "next";
import { Separator } from "@/src/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy - houle.ai",
  description: "Privacy Policy and Data Protection Notice for houle.ai services",
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

export default function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  return (
    <div className="container mx-auto px-4 py-16 max-w-[var(--breakpoint-xl)]">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg mb-2">
          Data Protection and Privacy Notice
        </p>
        <p className="text-xs mb-2">
          Last updated: {formatDate("2025-11-24", locale)}
        </p>
        <Separator className="mt-6" />
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <div className="space-y-4">
            <p>
              At houle.ai (West-Bay SA), we are committed to protecting your privacy and personal data in accordance with Swiss Federal Data Protection Act (FADP) and applicable EU regulations.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, and protect your information when you use our AI services integrated into Microsoft tools.
            </p>
          </div>
        </section>

        {/* Data Controller */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Controller</h2>
          <div className="space-y-4">
            <p>
              West-Bay SA (operating as houle.ai) acts as the data controller for personal data collected and processed in connection with our AI services.
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="font-semibold">Contact details:</p>
              <p>houle.ai (West-Bay SA)</p>
              <p>Email: contact@houle.ai</p>
              <p>Address: 19 Pré-Roset, 1294 Genthod, Switzerland</p>
            </div>
          </div>
        </section>

        {/* Data We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Data:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (name, email address)</li>
                <li>Microsoft account information for authentication</li>
                <li>Document content processed through our AI services</li>
                <li>Usage patterns and preferences for AI features</li>
                <li>Technical data (IP address, browser type, device information)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Website Data:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Technical information (IP address, browser type, device information)</li>
                <li>Usage data (pages visited, time spent, referral sources)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Contact form submissions and communications</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Legal Basis */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Legal Basis for Processing</h2>
          <div className="space-y-4">
            <p>We process your personal data based on the following legal grounds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contract performance: To provide AI services integrated into Microsoft tools</li>
              <li>Legal compliance: To meet Swiss regulatory and reporting requirements</li>
              <li>Legitimate interests: For business operations, fraud prevention, and service improvement</li>
              <li>Consent: For marketing communications and non-essential cookies (where required)</li>
            </ul>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Delivery:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing AI assistance in Outlook, Word, and other Microsoft tools</li>
                <li>Processing and analyzing documents for AI-powered features</li>
                <li>Maintaining and improving AI models and services</li>
                <li>Communicating about your services and account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Business Operations:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customer relationship management</li>
                <li>Quality assurance and service improvement</li>
                <li>Risk management and fraud prevention</li>
                <li>Legal and regulatory compliance</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
          <div className="space-y-4">
            <p>We may share your personal data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Microsoft Corporation (for authentication and integration services)</li>
              <li>Azure cloud services (for secure data processing and storage)</li>
              <li>Professional service providers (IT support, security services)</li>
              <li>Swiss authorities (as legally required)</li>
            </ul>
            <p>
              We do not sell personal data to third parties. All sharing is conducted with appropriate confidentiality agreements and data protection measures in place.
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <div className="space-y-4">
            <p>We implement comprehensive security measures including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Multi-factor authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Staff training on data protection</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Data Retention:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service records: For the duration of your subscription plus legal retention requirements</li>
                <li>Website data: For the duration necessary to fulfill stated purposes</li>
                <li>Marketing data: Until consent is withdrawn or data is no longer needed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <div className="space-y-4">
            <p>Under Swiss data protection law, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> Request information about personal data we hold about you
              </li>
              <li>
                <strong>Rectification:</strong> Correct inaccurate or incomplete personal data
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of personal data (subject to legal obligations)
              </li>
              <li>
                <strong>Restriction:</strong> Limit processing in certain circumstances
              </li>
              <li>
                <strong>Data portability:</strong> Receive your data in a structured, machine-readable format
              </li>
              <li>
                <strong>Object:</strong> Object to processing based on legitimate interests
              </li>
              <li>
                <strong>Withdraw consent:</strong> For processing based on consent
              </li>
            </ul>
            <p>
              To exercise these rights, contact us at contact@houle.ai. We will respond within 30 days.
            </p>
          </div>
        </section>

        {/* International Transfers */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
          <div className="space-y-4">
            <p>We may transfer personal data outside Switzerland to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>EU/EEA countries with adequate data protection</li>
              <li>Microsoft Azure data centers with appropriate safeguards</li>
              <li>Third countries with appropriate safeguards (standard contractual clauses)</li>
            </ul>
            <p>
              All international transfers are conducted with appropriate legal safeguards to ensure your data remains protected to Swiss standards.
            </p>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <div className="space-y-4">
            <p>
              We may update this Privacy Policy to reflect changes in our practices, services, or legal requirements. Material changes will be communicated through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our website</li>
              <li>Direct communication during service interactions</li>
            </ul>
            <p>
              The updated policy will be effective from the date specified in the revised version.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="space-y-4">
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="font-semibold">houle.ai (West-Bay SA)</p>
              <p>19 Pré-Roset, 1294 Genthod, Switzerland</p>
              <p>Email: contact@houle.ai</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
