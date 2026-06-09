import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function Approach() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  const steps = [
    {
      number: '01',
      title: 'Listen & scope',
      description:
        'We start with your objective, not our service list. Every engagement is scoped precisely to what you need to achieve.',
    },
    {
      number: '02',
      title: 'Structure & advise',
      description:
        'We translate the objective into the right structure — the entity, the governance, the strategy — and set out clear options and recommendations.',
    },
    {
      number: '03',
      title: 'Execute & file',
      description:
        'We do the work: incorporations, appointments, filings, and documentation, handled accurately and on time.',
    },
    {
      number: '04',
      title: 'Govern & review',
      description:
        'We stay on as a standing partner — maintaining compliance, monitoring risk, and revisiting strategy as your business changes.',
    },
  ];

  return (
    <section
      id="approach"
      className="py-24 md:py-32 bg-navy-950 text-white relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(195,154,55) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="kicker text-gold-400 mb-5">How we work</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-5 leading-tight">
            Rigorous, discreet, and{' '}
            <span className="text-gold-500">accountable</span>
          </h2>
          <p className="text-lg text-navy-100/70 leading-relaxed">
            The work differs from client to client; the discipline does not. We
            apply the same structured approach to a single incorporation and to
            a multi-entity governance programme.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="relative pt-8 border-t border-white/15"
            >
              <span className="absolute -top-px left-0 h-px w-12 bg-gold-500" />
              <p className="font-serif text-3xl text-gold-500/80 mb-4">
                {step.number}
              </p>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-navy-100/70 leading-relaxed text-[0.95rem]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
