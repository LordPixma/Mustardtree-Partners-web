import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Scale, ShieldCheck, Landmark, Globe2 } from 'lucide-react';

export function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Factual credibility markers only — no invented metrics, tenure, or clients.
  const markers = [
    {
      icon: Landmark,
      label: 'Registered in England & Wales',
      detail: 'Mustardtree Partners Ltd · No. 16815318',
    },
    {
      icon: Globe2,
      label: 'UK & international clients',
      detail: 'Domestic businesses and overseas groups entering the UK',
    },
    {
      icon: Scale,
      label: 'Multidisciplinary by design',
      detail: 'Legal, governance, and commercial expertise in one team',
    },
    {
      icon: ShieldCheck,
      label: 'Confidential by default',
      detail: 'Discretion and independence on every engagement',
    },
  ];

  return (
    <section
      id="about"
      className="py-24 md:py-32 bg-ivory-100 dark:bg-navy-950 relative overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Narrative */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <p className="kicker mb-5">Who we are</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-navy-900 dark:text-white mb-8 leading-tight">
              A long-term partner to{' '}
              <span className="text-gold-600 dark:text-gold-400">
                ambitious organisations
              </span>
            </h2>
            <div className="space-y-6 text-lg text-navy-700 dark:text-navy-100/80 leading-relaxed">
              <p>
                MustardTree Partners is a UK business advisory and corporate
                services firm. We act as a trusted partner to founders, boards,
                and international companies — providing the structure,
                governance, and counsel that ambitious organisations need to
                operate with confidence.
              </p>
              <p>
                Our work spans the full lifecycle of a business. We incorporate
                and structure UK entities, act as nominee and professional
                directors, maintain statutory compliance and Companies House
                filings, and advise on strategy, risk, and growth. For overseas
                groups, we provide a single, accountable point of presence in
                the United Kingdom.
              </p>
              <p>
                We bring legal, governance, and commercial expertise together in
                one team, so our advice is both rigorous and practical. We are
                independent by design, discreet by default, and accountable for
                the outcomes we are engaged to deliver.
              </p>
            </div>
          </motion.div>

          {/* Credibility markers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 lg:pt-4"
          >
            <div className="rounded-2xl border border-navy-100 dark:border-white/10 bg-white dark:bg-navy-900 shadow-sm divide-y divide-navy-100 dark:divide-white/10">
              {markers.map((marker) => {
                const Icon = marker.icon;
                return (
                  <div
                    key={marker.label}
                    className="flex items-start gap-4 p-6"
                  >
                    <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-gold-100 dark:bg-gold-500/15 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 dark:text-white">
                        {marker.label}
                      </p>
                      <p className="text-sm text-navy-500 dark:text-navy-200/70 mt-0.5 leading-snug">
                        {marker.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
