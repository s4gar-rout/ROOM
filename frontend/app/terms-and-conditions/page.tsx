import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | room.",
  description: "Terms and conditions for using the room. platform.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F4EA]">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-12">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-[#1C1B18] mb-4">
              Terms & Conditions
            </h1>
            <p className="text-sm text-[#756A5C]">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-10 text-[#4A433A] text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Introduction</h2>
              <p>
                Welcome to room. These Terms & Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or using the room. platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions, as well as our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">About room.</h2>
              <p>
                room. acts as an online marketplace connecting property owners/landlords with prospective tenants. We provide the platform for communication and listing discovery but are not a party to any rental agreements or contracts entered into between users.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Eligibility</h2>
              <p>
                You must be at least 18 years old to use this platform. By using the service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into binding contracts.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Tenant Responsibilities</h2>
              <p>
                As a tenant or prospective renter, you agree to provide truthful information when communicating with property owners. You acknowledge that room. does not guarantee the availability, safety, or accuracy of any listing, and it is your responsibility to verify details and view properties before making any commitments or payments.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Owner/Landlord Responsibilities</h2>
              <p>
                As a property owner or landlord, you are solely responsible for the accuracy of your listings, including pricing, availability, descriptions, and images. You must have the legal right to rent out the properties you list and must comply with all applicable local housing, zoning, and rental laws.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Property Listings</h2>
              <p>
                Listings must not contain misleading information, discriminatory language, or inappropriate content. We reserve the right, but not the obligation, to review, modify, or remove listings that violate these terms or that we deem harmful to the platform.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Listing Accuracy</h2>
              <p>
                room. does not independently verify the accuracy of property descriptions, images, or ownership. Users are encouraged to conduct their own due diligence. We disclaim any liability for discrepancies between the listing and the actual property.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Room Availability & Pricing</h2>
              <p>
                Prices and availability are set by the property owners and are subject to change without notice. room. does not guarantee that a listed price will be honored or that a room marked as available has not already been rented.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Rental Enquiries and Communication</h2>
              <p>
                Users can communicate through our internal messaging system. You agree to use this system responsibly and only for the purpose of inquiring about or arranging property rentals.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Messaging Rules</h2>
              <p>
                You agree not to use the messaging system to send spam, abusive, threatening, or harassing messages, or to solicit users for commercial services unrelated to room rentals. Violation of these rules may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Prohibited Activities</h2>
              <p className="mb-3">When using the platform, you agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violate any applicable laws or regulations.</li>
                <li>Post false, inaccurate, or misleading information.</li>
                <li>Distribute viruses, malware, or any other harmful code.</li>
                <li>Scrape, crawl, or use automated means to access the platform.</li>
                <li>Interfere with the security or proper functioning of the service.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Payments and Transactions</h2>
              <p>
                room. is solely a platform for discovery and communication. We do not process rent payments, deposits, or transaction fees between tenants and owners. Any financial transactions are conducted entirely off-platform at your own risk.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Cancellations / Refunds</h2>
              <p>
                Since room. does not process payments or manage rental agreements, any disputes regarding cancellations, refunds, or lease terms must be resolved directly between the tenant and the property owner according to their individual agreements and local laws.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Intellectual Property</h2>
              <p>
                The platform and its original content (excluding user-generated content), features, and functionality are owned by room. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">User-Generated Content</h2>
              <p>
                By posting content (such as listings, images, or messages), you grant room. a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content in connection with providing and promoting the service.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Privacy</h2>
              <p>
                Your use of the platform is also governed by our Privacy Policy, which details how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Third-Party Services</h2>
              <p>
                The platform may contain links to third-party websites or services that are not owned or controlled by room. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Platform Availability</h2>
              <p>
                We strive to ensure the platform is available at all times. However, we do not guarantee uninterrupted access and reserve the right to modify, suspend, or discontinue the service (or any part thereof) with or without notice.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Disclaimer</h2>
              <p>
                The platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. room. makes no representations or warranties of any kind, express or implied, regarding the operation of the service, the accuracy of listings, or the conduct of users.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall room., its directors, employees, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform or any interactions with other users.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless room. and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from your use of the service or breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Account Suspension & Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Changes to These Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our platform after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which room. operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#1C1B18] mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms & Conditions, please contact us at: <a href="mailto:hello@room.local" className="text-[#174D35] hover:underline">hello@room.local</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
