import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layers, Lock, Handshake } from 'lucide-react';

export function WhyChooseUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const differentiators = [
    {
      icon: Layers,
      title: 'Multidisciplinary by design',
      description:
        'Law, governance, and commercial strategy sit in one team. You get joined-up advice from people who understand the obligation and the business behind it — not a hand-off between specialists.',
    },
    {
      icon: Lock,
      title: 'Discreet and independent',
      description:
        'We hold no conflicting agenda and we keep your affairs confidential. As nominee directors and advisers, discretion is not a courtesy — it is the standard we are held to.',
    },
    {
      icon: Handshake,
      title: 'Partners, not vendors',
      description:
        'We are accountable for outcomes, not billable activity. We stay engaged across the life of your business and measure our success by yours.',
    },
  ];

  return (
    <section
      id="why-choose-us"
      className="py-24 md:py-32 bg-navy-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="kicker text-gold-400 mb-5">Why MustardTree</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-5 leading-tight">
            The case for a single, accountable{' '}
            <span className="text-gold-500">firm</span>
          </h2>
          <p className="text-lg text-navy-100/70 leading-relaxed">
            Most companies stitch together a lawyer, a company secretary, an
            accountant, and a strategist. We bring those disciplines under one
            roof — and one point of accountability.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className="border-t border-white/15 pt-8"
              >
                <div className="w-14 h-14 rounded-xl bg-gold-500/15 flex items-center justify-center mb-6">
                  <Icon size={26} className="text-gold-400" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-4">
                  {item.title}
                </h3>
                <p className="text-navy-100/70 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
