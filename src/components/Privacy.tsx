import { motion } from 'framer-motion';
import { Shield, Mail, MapPin } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Effective date: 28 October 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Who we are</h2>
              <p className="text-gray-700 leading-relaxed">
                Mustardtree Partners Ltd (company number 16815318), trading as Mustardtree Partners, operates the website mustardtreegroup.com (the "Site"). We provide professional company secretarial, business intelligence and governance services. When we collect and process personal data in connection with the Site and our services, we are the "data controller" for the purposes of the UK GDPR and the Data Protection Act 2018.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What information we collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect and process a variety of information depending on how you interact with us. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Contact details:</strong> such as your name, job title, email address, postal address and telephone number when you correspond with us, request information or purchase services.</li>
                <li><strong>Business information:</strong> including your company name, registration number and professional interests.</li>
                <li><strong>Service usage data:</strong> details about your visits to our Site including IP address, browser type and version, time‑zone setting, pages viewed and the date and time of your visit. This may be collected automatically through cookies and similar technologies (see Cookies below).</li>
                <li><strong>Payment information:</strong> basic billing details and transaction history if you engage us for paid services. We do not store complete payment card details; these are processed securely by our payment service providers.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We do not intentionally collect special categories of personal data (such as health information) or data relating to criminal offences through the Site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How we use your information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the personal data we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>To provide our services:</strong> We use contact and business information to set up company secretarial services, maintain statutory registers, prepare filings, manage registered office addresses and deliver business intelligence reports.</li>
                <li><strong>To administer our relationship:</strong> We use your details to respond to enquiries, send quotations, invoice for services, collect payments and maintain our records.</li>
                <li><strong>To operate and improve the Site:</strong> Usage information helps us understand how visitors use our Site so that we can maintain security, fix technical issues and improve user experience.</li>
                <li><strong>To promote our business:</strong> Where permitted by law or with your consent, we may send marketing communications about our services. You can opt out at any time by following the unsubscribe instructions in our emails or contacting us.</li>
                <li><strong>To comply with legal obligations:</strong> We retain records and share information where necessary to comply with company law, HMRC requirements, anti‑money laundering obligations or court orders.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal bases for processing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under the UK GDPR, we must have a lawful basis for processing personal data. Depending on the context, we rely on one or more of the following:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Contract:</strong> Processing is necessary to perform a contract with you or to take steps at your request prior to entering into a contract.</li>
                <li><strong>Legitimate interests:</strong> We have a legitimate interest in running and promoting our business, keeping our Site secure and developing our services. We balance this with your interests and fundamental rights.</li>
                <li><strong>Legal obligation:</strong> Processing is necessary to comply with a legal obligation, such as maintaining statutory records or responding to lawful requests.</li>
                <li><strong>Consent:</strong> In some cases we may ask for your consent (for example, to send certain marketing communications). You can withdraw consent at any time.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How we share your information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We will not sell or rent your personal data. We may share it with trusted third parties under written agreements that protect your privacy, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service providers and suppliers</strong> who help us deliver our services (for example, cloud hosting providers, email marketing platforms, analytics providers, payment processors, identity verification and anti‑money‑laundering services, or Companies House filing agents). These providers only process your data on our instructions and subject to confidentiality obligations.</li>
                <li><strong>Professional advisers</strong> (such as accountants, auditors and lawyers) as necessary for our legitimate business interests and as permitted by law.</li>
                <li><strong>Government agencies, regulators or law enforcement</strong> where we are required to do so by law or to protect our rights and the rights of others.</li>
                <li>In the event of a business reorganisation, sale or merger, personal data may be transferred to the new entity subject to this Privacy Policy and UK data protection laws.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. International transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Some of our service providers are located outside the UK, so your personal data may be transferred internationally. Whenever we transfer data to countries that are not subject to an adequacy decision by the UK Government, we put in place appropriate safeguards, such as the International Data Transfer Agreement (IDTA) or Standard Contractual Clauses, to ensure your information remains protected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. How long we keep your information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We keep personal data only for as long as is necessary for the purposes described in this policy. This generally means we will retain information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>For at least six years after the end of a client relationship to comply with legal and tax obligations;</li>
                <li>For marketing contacts, until you opt out or we determine that your details are no longer up to date;</li>
                <li>For enquiries that do not result in a contract, for up to two years.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We securely delete or anonymise data when it is no longer needed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                UK data protection law gives you rights in relation to your personal data. You may:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request access to the personal data we hold about you;</li>
                <li>Request correction of inaccurate or incomplete data;</li>
                <li>Request erasure of your data, where there is no good reason for us to continue processing it;</li>
                <li>Request restriction of processing in certain circumstances;</li>
                <li>Object to processing based on legitimate interests or to direct marketing;</li>
                <li>Request the transfer of your data to another provider (data portability); and</li>
                <li>Withdraw consent at any time when we are processing your data on the basis of consent.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can exercise these rights by contacting us at the details below. If you are not satisfied with our response, you can lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Site uses cookies and similar technologies to enable essential functionality and to help us understand how people use it. We use:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Strictly necessary cookies:</strong> required for the Site to function (for example, to remember your cookie preferences).</li>
                <li><strong>Analytics cookies:</strong> used to collect information about how visitors interact with our Site so we can improve it. Analytics data is aggregated and does not directly identify you.</li>
                <li><strong>Functionality cookies:</strong> used to remember your preferences (such as language or region).</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                When you first visit our Site, we will ask for your consent to use non‑essential cookies. You can change your cookie preferences at any time by adjusting your browser settings or by using the cookie banner if available.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We take appropriate technical and organisational measures to protect personal data against unauthorised access, accidental loss or destruction and unlawful disclosure. However, no online transmission can be guaranteed to be completely secure, so you should always take care when sharing information over the internet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to this policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in the law or our practices. The updated version will be posted on this page with a new effective date. Please review this page regularly to stay informed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact us</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have any questions about this Privacy Policy, our data practices or your rights, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Mustardtree Partners Ltd</p>
                      <p className="text-gray-700">33A Great George Street, Leeds LS1 3BB, United Kingdom</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <a href="mailto:info@mustardtreegroup.com" className="text-yellow-600 hover:text-yellow-700 transition-colors">
                      info@mustardtreegroup.com
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}