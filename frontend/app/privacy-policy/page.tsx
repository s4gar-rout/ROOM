import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | room.",
  description: "Privacy policy and data handling practices for room.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F4EA]">
      <Navbar />

      <main className="flex-1 pt-12 pb-24 md:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-12">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-[#1C1B18] mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#756A5C]">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-10 text-[#4A433A] text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Introduction</h2>
              <p>
                Welcome to room. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our application, or communicate with us. Please read this policy carefully to understand our views and practices regarding your personal data and how we will treat it.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Information We Collect</h2>
              <p className="mb-3">We may collect and process the following data about you:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Identity Data:</strong> includes first name, last name, username, and profile picture.</li>
                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, and operating system.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">How We Use Information</h2>
              <p className="mb-3">We use the information we collect in various ways, including to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, operate, and maintain our platform.</li>
                <li>Improve, personalize, and expand our platform.</li>
                <li>Understand and analyze how you use our platform.</li>
                <li>Develop new products, services, features, and functionality.</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service and support.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Account & Authentication Information</h2>
              <p>
                When you register for an account, we collect your email address and password to create and secure your profile. Your authentication tokens are stored securely to maintain your logged-in state across devices. You have the right to request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Rental/Property Information</h2>
              <p>
                For property owners, we collect information related to the rooms you list, including descriptions, images, pricing, and availability. This information is displayed publicly to facilitate connections with potential renters. We may also collect verification documents where legally required.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Messages & Communication</h2>
              <p>
                We provide a messaging system for users to communicate with property owners. We process and store these messages to deliver them, allow you to review past conversations, and for safety and security purposes. We do not use message content for advertising.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Cookies and Similar Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track the activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share your information with trusted third-party service providers who assist us in operating our platform, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also release information when its release is appropriate to comply with the law or protect ours or others&apos; rights, property, or safety.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Data Security</h2>
              <p>
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Data Retention</h2>
              <p>
                We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">User Rights</h2>
              <p className="mb-3">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Children&apos;s Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Third-Party Services</h2>
              <p>
                Our platform may contain links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this policy. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at: <a href="mailto:hello@room.local" className="text-[#174D35] hover:underline">hello@room.local</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
