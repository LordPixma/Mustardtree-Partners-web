import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, Eye, Handshake } from 'lucide-react';
export function WhyChooseUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  const pillars = [{
    icon: Shield,
    title: 'Integrity',
    description: 'We uphold the highest ethical standards in all our engagements, ensuring trust and reliability in every interaction.'
  }, {
    icon: Eye,
    title: 'Clarity',
    description: 'We deliver transparent, actionable insights that cut through complexity and empower confident decision-making.'
  }, {
    icon: Handshake,
    title: 'Partnership',
    description: 'We work alongside you as true partners, committed to your long-term success and sustainable growth.'
  }];
  return <section id="why-choose-us" className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
          <h2 className="text-4xl md:text-5xl font-serif mb-4">
            Why Choose{' '}
            <span className="text-yellow-500">Mustardtree Partners</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Built on three foundational pillars that guide everything we do
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} animate={inView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.8,
            delay: index * 0.2
          }} className="text-center group">
                <motion.div whileHover={{
              scale: 1.1,
              rotate: 5
            }} transition={{
              type: 'spring',
              stiffness: 300
            }} className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icon size={40} className="text-gray-900" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-4">{pillar.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>;
        })}
        </div>
      </div>
    </section>;
}