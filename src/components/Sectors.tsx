import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Briefcase, Cpu, Globe2, Landmark } from 'lucide-react';

export function Sectors() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const sectors = [
    {
      icon: Briefcase,
      title: 'Financial & Professional Services',
      description:
        'Governance, corporate-secretarial, and risk advisory for firms operating under regulatory scrutiny, where rigour and discretion are non-negotiable.',
    },
    {
      icon: Cpu,
      title: 'Technology & High-Growth',
      description:
        'Structure, governance, and AI- and cyber-risk oversight for scaling technology companies and the investors and boards behind them.',
    },
    {
      icon: Globe2,
      title: 'International & Cross-Border',
      description:
        'A UK base of operations for overseas groups — incorporation, directorships, and local representation that keep an international parent compliant and credible.',
    },
    {
      icon: Landmark,
      title: 'Public Sector & Regulated Industries',
      description:
        'Governance frameworks, assurance, and data-driven insight for public bodies and organisations in highly regulated environments.',
    },
  ];

  return (
    <section
      id="sectors"
      className="py-24 md:py-32 bg-ivory-100 dark:bg-navy-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="kicker mb-5">Industries</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-navy-900 dark:text-white mb-5 leading-tight">
            Where governance and growth carry the{' '}
            <span className="text-gold-600 dark:text-gold-400">
              highest stakes
            </span>
          </h2>
          <p className="text-lg text-navy-600 dark:text-navy-100/70 leading-relaxed">
            We focus on sectors where structure, compliance, and judgement
            matter most — and where getting them wrong is expensive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <motion.div
                key={sector.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="group flex items-start gap-6 p-8 lg:p-10 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-white/10 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gold-100 dark:bg-gold-500/15 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
                  <Icon
                    size={26}
                    className="text-gold-600 dark:text-gold-400 group-hover:text-navy-950 transition-colors duration-300"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-navy-900 dark:text-white mb-3">
                    {sector.title}
                  </h3>
                  <p className="text-navy-600 dark:text-navy-100/70 leading-relaxed">
                    {sector.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
