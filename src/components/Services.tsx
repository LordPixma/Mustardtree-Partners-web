import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building2, Globe2, LineChart, ShieldAlert, ArrowUpRight } from 'lucide-react';

export function Services() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Four practice areas, led by corporate services & governance.
  const practices = [
    {
      number: '01',
      icon: Building2,
      title: 'Corporate Services & Governance',
      lead: true,
      description:
        'The statutory backbone of a well-run company, managed by professionals who treat your obligations as their own.',
      points: [
        'Nominee & professional directorship',
        'Company secretarial & registered office',
        'Companies House filings & confirmation statements',
        'Statutory registers, minutes & board support',
        'Corporate governance frameworks',
      ],
    },
    {
      number: '02',
      icon: Globe2,
      title: 'International Expansion & UK Market Entry',
      lead: false,
      description:
        'A single, accountable point of presence for establishing and running your business in the United Kingdom.',
      points: [
        'UK subsidiary incorporation & structuring',
        'Cross-border entity and holding setup',
        'Local representation & registered office',
        'Regulatory, tax-registration & banking support',
        'Ongoing compliance for overseas parents',
      ],
    },
    {
      number: '03',
      icon: LineChart,
      title: 'Strategy & Business Advisory',
      lead: false,
      description:
        "Independent counsel at the moments that shape a company's trajectory.",
      points: [
        'Corporate & growth strategy',
        'Operating model & organisational design',
        'Due diligence & transaction support',
        'Market & competitive analysis',
        'Board and executive advisory',
      ],
    },
    {
      number: '04',
      icon: ShieldAlert,
      title: 'Risk, Cyber & Intelligence',
      lead: false,
      description:
        'Governing the risks that now reach the boardroom — from regulation to technology.',
      points: [
        'Cyber & AI governance (EU AI Act, ISO 42001)',
        'Identity & access governance oversight',
        'Operational resilience & risk registers',
        'Due diligence & open-source intelligence (OSINT)',
        'Business & spatial intelligence (GIS)',
      ],
      href: '/services/gis',
      hrefLabel: 'Explore spatial intelligence & GIS',
    },
  ];

  return (
    <section id="services" className="py-24 md:py-32 bg-white dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="kicker mb-5">What we do</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-navy-900 dark:text-white mb-5 leading-tight">
            Four practices, one accountable{' '}
            <span className="text-gold-600 dark:text-gold-400">partner</span>
          </h2>
          <p className="text-lg text-navy-600 dark:text-navy-100/70 leading-relaxed">
            From incorporation and day-to-day governance through to strategy and
            risk, our practices are designed to work together — so a single firm
            can support you across the life of your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {practices.map((practice, index) => {
            const Icon = practice.icon;
            return (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className={`group relative flex flex-col p-8 lg:p-10 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  practice.lead
                    ? 'bg-navy-900 border-navy-800 ring-1 ring-gold-500/40 shadow-xl'
                    : 'bg-ivory-100 dark:bg-navy-950 border-navy-100 dark:border-white/10 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      practice.lead
                        ? 'bg-gold-500'
                        : 'bg-gold-100 dark:bg-gold-500/15 group-hover:bg-gold-500'
                    } transition-colors duration-300`}
                  >
                    <Icon
                      size={26}
                      className={
                        practice.lead
                          ? 'text-navy-950'
                          : 'text-gold-600 dark:text-gold-400 group-hover:text-navy-950 transition-colors duration-300'
                      }
                    />
                  </div>
                  <span
                    className={`font-serif text-2xl ${
                      practice.lead
                        ? 'text-white/30'
                        : 'text-navy-300 dark:text-white/20'
                    }`}
                  >
                    {practice.number}
                  </span>
                </div>

                {practice.lead && (
                  <span className="inline-block self-start mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-400">
                    Our core practice
                  </span>
                )}

                <h3
                  className={`text-xl lg:text-2xl font-semibold mb-3 ${
                    practice.lead ? 'text-white' : 'text-navy-900 dark:text-white'
                  }`}
                >
                  {practice.title}
                </h3>
                <p
                  className={`leading-relaxed mb-6 ${
                    practice.lead
                      ? 'text-navy-100/80'
                      : 'text-navy-600 dark:text-navy-100/70'
                  }`}
                >
                  {practice.description}
                </p>

                <ul className="space-y-2.5 mb-2">
                  {practice.points.map((point) => (
                    <li
                      key={point}
                      className={`flex items-start gap-3 text-sm ${
                        practice.lead
                          ? 'text-navy-100/80'
                          : 'text-navy-700 dark:text-navy-100/70'
                      }`}
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gold-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {practice.href && (
                  <a
                    href={practice.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 dark:text-gold-400 hover:gap-2.5 transition-all"
                  >
                    {practice.hrefLabel}
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
