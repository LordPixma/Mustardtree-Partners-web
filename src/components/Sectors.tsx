import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Briefcase, HeartPulse, Landmark } from 'lucide-react';

export function Sectors() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const sectors = [{
    icon: Briefcase,
    title: 'Financial & Professional Services',
    description: 'Governance, risk, and compliance advisory for financial, legal, and professional-services firms operating under regulatory scrutiny.'
  }, {
    icon: HeartPulse,
    title: 'Healthcare & Life Sciences',
    description: 'Governance frameworks and intelligence for NHS trusts, private healthcare providers, and life-sciences organisations navigating complex regulatory landscapes.'
  }, {
    icon: Landmark,
    title: 'Public Sector & Government',
    description: 'Governance advisory, risk assessment, and data-driven insight for councils, agencies, and public bodies seeking transparency and operational resilience.'
  }];

  return <section id="sectors" className="py-24 bg-gray-50 dark:bg-gray-900">
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
            Industries We <span className="text-yellow-600 dark:text-yellow-500">Understand</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Focused expertise in the sectors where governance, regulation, and
            risk carry the highest stakes
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sectors.map((sector, index) => {
          const Icon = sector.icon;
          return <motion.div key={sector.title} initial={{
            opacity: 0,
            y: 30
          }} animate={inView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.8,
            delay: index * 0.1
          }} className="bg-white dark:bg-gray-800 p-8 rounded-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors duration-300">
                  <Icon className="text-yellow-600 dark:text-yellow-500 group-hover:text-white transition-colors duration-300" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {sector.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {sector.description}
                </p>
              </motion.div>;
        })}
        </div>
      </div>
    </section>;
}
