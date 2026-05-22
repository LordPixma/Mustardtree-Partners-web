import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building2, Shield, Search } from 'lucide-react';

export function Services() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Cyber, AI & Identity Governance leads — it is the firm's differentiator.
  const services = [{
    icon: Shield,
    title: 'Cyber, AI & Identity Governance',
    lead: true,
    description: "Independent governance of the risks technology now puts on the board's agenda.",
    points: [
      'AI governance & readiness (EU AI Act, ISO 42001, NIST AI RMF)',
      'Cyber-risk governance & operational resilience',
      'Identity & access governance (IAM/IDAM oversight)',
      'Security policy, controls mapping & assurance'
    ]
  }, {
    icon: Building2,
    title: 'Governance & Risk',
    lead: false,
    description: 'The governance foundations that underpin credible, compliant organisations.',
    points: [
      'Corporate governance & company secretarial',
      'Annual filings & statutory compliance',
      'Board support & governance framework design',
      'Risk identification, assessment & registers'
    ]
  }, {
    icon: Search,
    title: 'Intelligence & Analytics',
    lead: false,
    description: 'Rigorous, ethical intelligence and data that surface risk, opportunity, and competitive dynamics.',
    points: [
      'Due diligence & open-source intelligence (OSINT)',
      'Market & competitive landscape analysis',
      'Business intelligence, dashboards & KPI reporting',
      'Spatial intelligence & GIS (location-aware analytics)'
    ]
  }];

  return <section id="services" className="py-24 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.8
      }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-4">
            What We <span className="text-yellow-600 dark:text-yellow-500">Do</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Three propositions for organisations navigating regulation,
            technology, and growth
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
          const Icon = service.icon;
          return <motion.div key={service.title} initial={{
            opacity: 0,
            y: 30
          }} animate={inView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.8,
            delay: index * 0.1
          }} className={`p-8 rounded-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 ${service.lead ? 'bg-gray-900 dark:bg-gray-900 ring-2 ring-yellow-500' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 transition-colors duration-300 ${service.lead ? 'bg-yellow-500' : 'bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-500'}`}>
                  <Icon className={`transition-colors duration-300 ${service.lead ? 'text-gray-900' : 'text-yellow-600 dark:text-yellow-500 group-hover:text-white'}`} size={32} />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${service.lead ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {service.title}
                </h3>
                <p className={`leading-relaxed mb-5 ${service.lead ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.points.map((point) => (
                    <li key={point} className={`flex items-start gap-2 text-sm ${service.lead ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                      <span className="text-yellow-500 mt-0.5 flex-shrink-0">▪</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>;
        })}
        </div>
      </div>
    </section>;
}
