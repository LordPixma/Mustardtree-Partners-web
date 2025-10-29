import { motion } from 'framer-motion';
import { FileText, Mail, MapPin } from 'lucide-react';

export function Terms() {
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
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-gray-600">Last updated: 28 October 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. About us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Site at mustardtreegroup.com is operated by Mustardtree Partners Ltd (company number 16815318), trading as Mustardtree Partners (collectively "we", "us" or "our"). Our registered office is at 33A Great George Street, Leeds LS1 3BB, United Kingdom.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We provide professional company secretarial, governance, business intelligence and advisory services. We are not a regulated law firm and nothing on this Site constitutes legal advice. If you require legal advice you should consult a qualified solicitor.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Acceptance of these terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the Site you agree to be bound by these Terms & Conditions and our Privacy Policy. If you are accessing the Site on behalf of a company or other organisation, you represent that you have authority to bind that entity. We may update these terms from time to time; continued use of the Site after changes are posted constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Access to the Site</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We aim to keep the Site available but cannot guarantee that it will always be uninterrupted or free from errors. We may suspend or withdraw the Site or any part of it at any time without notice. You are responsible for ensuring that all persons who access the Site through your internet connection are aware of these terms and comply with them.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You must use the Site only for lawful purposes. You may not use the Site:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>In any way that breaches applicable local, national or international law or regulation;</li>
                <li>To transmit or procure the sending of any unsolicited or unauthorised advertising or promotional material (spam);</li>
                <li>To knowingly transmit any data, send or upload any material that contains viruses, trojan horses, worms or other malicious code intended to disrupt or harm computer software or hardware;</li>
                <li>To attempt to gain unauthorised access to the Site, the server on which the Site is stored or any server, computer or database connected to the Site.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Our services and information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The content on the Site is provided for general information only and should not be relied upon as a substitute for professional advice. While we endeavour to keep information up to date and correct, we make no representations or warranties, express or implied, about the completeness, accuracy, reliability or suitability of the information on the Site.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any services described on the Site are subject to separate terms and conditions which will be provided to you when you engage us. We reserve the right to amend or withdraw any services described on the Site without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Unless otherwise stated, we or our licensors own the intellectual property rights in the Site and the material published on it, including text, graphics, logos, icons, images and software. Those works are protected by copyright and trademark laws. All such rights are reserved.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may download and print one copy of pages from the Site for your personal reference and you may draw the attention of others within your organisation to material posted on the Site. You must not modify the paper or digital copies of any materials you have printed or downloaded. Our status (and that of any identified contributors) as the authors of material on our Site must always be acknowledged.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You must not use any part of the content on our Site for commercial purposes without obtaining a licence to do so from us or our licensors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User contributions</h2>
              <p className="text-gray-700 leading-relaxed">
                If you provide us with any comments, feedback, suggestions or other materials (collectively "Contributions"), you grant us a non‑exclusive, perpetual, irrevocable, royalty‑free licence to use, reproduce, modify, adapt, publish, translate and distribute those Contributions worldwide in any media. You represent that you have the right to make such Contributions and that they do not infringe any third‑party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Links to other websites</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Site may contain links to third‑party websites and resources provided by others. These links are provided for your information only. We have no control over the contents of those sites or resources and accept no responsibility for them or for any loss or damage that may arise from your use of them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the fullest extent permitted by law, we exclude all conditions, warranties, representations or other terms which may apply to the Site or any content on it, whether express or implied. We will not be liable for any loss or damage (whether direct, indirect or consequential) arising from your use of the Site or reliance on any content on the Site, including but not limited to loss of profits, data, business or goodwill.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nothing in these terms excludes or limits our liability for death or personal injury arising from our negligence, or for fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnity</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Mustardtree Partners Ltd and its officers, directors and employees from any claims, damages, liabilities, costs and expenses (including legal fees) arising from your use of the Site or your breach of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your access to the Site immediately and without notice if you breach any of these terms or if we reasonably suspect fraudulent, abusive or unlawful activity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing law and jurisdiction</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms are governed by the laws of England and Wales and you agree that the courts of England and Wales will have exclusive jurisdiction in relation to any dispute arising out of or in connection with your use of the Site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact us</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have any questions about these Terms & Conditions, please contact us at:
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