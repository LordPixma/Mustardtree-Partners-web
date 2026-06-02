import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, User } from 'lucide-react';

export function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Confirmed credentials only. Do not add unconfirmed items here.
  const credentials = [
    'LLB (Hons), University of Buckingham',
    'ISC² Certified in Cybersecurity (CC)',
    'Microsoft Certified: Azure Fundamentals',
    'ITIL v3 Foundation',
    '20+ years enterprise IT and cybersecurity'
    /* TODO: add once earned — do not display until then:
       'IAPP AIGP (AI Governance Professional)',
       'ISO/IEC 42001 Lead Implementer' */
  ];

  return <section id="about" className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(234, 179, 8) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.8
      }} className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-8">
            Navigating complexity with{' '}
            <span className="text-yellow-600">clarity and confidence</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            MustardTree Partners is a UK consultancy providing board-level
            governance, risk, and intelligence advisory. We work with
            organisations that need rigorous, independent counsel — not
            off-the-shelf solutions.
          </p>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            The practice is led by{' '}
            <strong className="font-semibold text-gray-900 dark:text-white">
              Samuel Odekunle
            </strong>
            , who brings an unusual combination to the boardroom: over twenty
            years in enterprise IT and cybersecurity, hands-on leadership of
            identity and access management transformation at a UK public body,
            and a legal background (LLB Hons). That blend means our advice is
            both commercially grounded and technically informed — we can speak
            to a board about governance and to an engineering team about
            implementation, in the same engagement.
          </p>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Whether you are establishing governance foundations, assessing AI
            and cyber risk, entering the UK market, or strengthening oversight
            across a growing portfolio, we provide the clarity and structure to
            move forward with confidence.
          </p>
        </motion.div>

        {/* Principal profile block */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Headshot */}
            <div className="flex justify-center md:justify-start">
              {/* TODO: principal headshot — replace placeholder with real asset */}
              <div className="w-40 h-40 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-300 dark:text-gray-500" />
              </div>
            </div>
            {/* Bio + credentials */}
            <div className="md:col-span-2 text-left">
              <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-1">
                Samuel Odekunle
              </h3>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-4">
                Principal — Governance, Risk & Intelligence
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Samuel combines two decades of enterprise IT and cybersecurity
                practice with a legal background. He has led identity and
                access management transformation at a UK public body, and
                advises boards where governance, technology, and regulation
                intersect.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {credentials.map((credential) => (
                  <div key={credential} className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {credential}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
}
