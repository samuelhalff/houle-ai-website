import { type Metadata } from "next";
import { Separator } from "@/src/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service - houle.ai",
  description: "Terms of Service for houle.ai AI services",
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

export default function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  return (
    <div className="container mx-auto px-4 py-16 max-w-[var(--breakpoint-xl)]">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg mb-2">Our terms of service</p>
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
              Welcome to houle.ai. These Terms of Service govern your use of our website and AI services integrated into Microsoft tools.
            </p>
            <p>
              By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access our services.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Services</h2>
          <div className="space-y-4">
            <p>
              houle.ai (operated by West-Bay SA) provides private AI services built into Microsoft tools including Outlook, Word, and other Microsoft applications.
            </p>
            <p>
              All services are provided in accordance with Swiss law and applicable data protection regulations.
            </p>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
          <div className="space-y-4">
            <p>
              Users must comply with all applicable laws and regulations when using our services.
            </p>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials and for all activities under their account.
            </p>
            <p>
              Users must not use our services for any unlawful purpose or in any way that could harm our systems or other users.
            </p>
          </div>
        </section>

        {/* Data Privacy and Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Privacy and Security</h2>
          <div className="space-y-4">
            <p>
              We maintain strict confidentiality regarding all user data in accordance with Swiss data protection laws and the Federal Act on Data Protection (FADP).
            </p>
            <p>
              Our services are designed to provide private AI processing, ensuring your data remains secure and confidential.
            </p>
            <p>
              We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
        </section>

        {/* Fees and Payment */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Fees and Payment Terms</h2>
          <div className="space-y-4">
            <p>Service fees are established based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Selected service tier and features</li>
              <li>Number of users and usage volume</li>
              <li>Subscription duration and commitment</li>
              <li>Terms outlined in your service agreement</li>
            </ul>
            <p>
              Payment terms are typically specified in your subscription agreement. All fees are subject to applicable Swiss VAT.
            </p>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Acceptable Use Policy</h2>
          <div className="space-y-4">
            <p>When using our services, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service to spam or send unsolicited communications</li>
              <li>Reverse engineer or attempt to extract our AI models</li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <div className="space-y-4">
            <p>
              The houle.ai service, including all AI models, software, and content, is owned by West-Bay SA and protected by intellectual property laws.
            </p>
            <p>
              You retain all rights to your data and content. By using our service, you grant us a limited license to process your data solely to provide the agreed services.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <div className="space-y-4">
            <p>
              Our liability is limited to the maximum extent permitted under Swiss law. We maintain appropriate insurance coverage.
            </p>
            <p>We shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consequential, indirect, or special damages</li>
              <li>Loss of profits or business opportunities</li>
              <li>Damages arising from user misuse of the service</li>
              <li>Force majeure events beyond our reasonable control</li>
            </ul>
            <p>
              Our total liability shall not exceed the fees paid for the service in the 12 months preceding the claim.
            </p>
          </div>
        </section>

        {/* Service Availability */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
          <div className="space-y-4">
            <p>
              We strive to maintain high service availability but cannot guarantee uninterrupted access.
            </p>
            <p>
              Scheduled maintenance will be communicated in advance when possible. We are not liable for service interruptions due to circumstances beyond our control.
            </p>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <div className="space-y-4">
            <p>
              Either party may terminate the service agreement according to the terms specified in your subscription.
            </p>
            <p>We may immediately suspend or terminate access in cases of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Material breach of these Terms</li>
              <li>Non-payment of fees</li>
              <li>Violation of acceptable use policy</li>
              <li>Legal requirements</li>
            </ul>
            <p>Upon termination, we will:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cease providing the service</li>
              <li>Provide reasonable time to export your data</li>
              <li>Delete your data according to our retention policy</li>
            </ul>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <div className="space-y-4">
            <p>
              These Terms are governed by Swiss law. Any disputes shall be resolved through:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Good faith negotiations between the parties</li>
              <li>Mediation through a recognized Swiss mediation service</li>
              <li>If necessary, litigation before the competent Swiss courts</li>
            </ol>
            <p>
              The place of jurisdiction is Geneva, Switzerland.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
          <div className="space-y-4">
            <p>
              We may update these Terms from time to time. Material changes will be communicated through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our website</li>
              <li>In-service notifications</li>
            </ul>
            <p>
              Continued use of the service after changes constitutes acceptance of the updated Terms.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <p>
              For questions regarding these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="font-semibold">houle.ai (West-Bay SA)</p>
              <p>Email: contact@houle.ai</p>
              <p>Address: 19 Pré-Roset, 1294 Genthod, Switzerland</p>
            </div>
            <p>
              We are committed to maintaining the highest standards of service and customer satisfaction.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
