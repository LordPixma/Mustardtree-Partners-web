import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building2, BarChart3, Search, Lightbulb } from 'lucide-react';
export function Services() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const services = [{
    icon: Building2,
    title: 'Corporate Governance & Secretarial',
    description: 'Company formations, annual filings, board support, and compliance management to ensure your business operates within regulatory frameworks.'
  }, {
    icon: BarChart3,
    title: 'Business Intelligence & Analytics',
    description: 'Data dashboards, performance metrics, and compliance analytics that transform raw data into strategic insights for informed decision-making.'
  }, {
    icon: Search,
    title: 'Strategic Intelligence',
    description: 'Ethical OSINT/HUMINT research, due diligence, and market insight to help you understand risks, opportunities, and competitive landscapes.'
  }, {
    icon: Lightbulb,
    title: 'Advisory & Support',
    description: 'Business planning, governance training, and UK expansion guidance tailored to your unique needs and growth objectives.'
  }];
  return <section id="services" className="py-24 bg-white">
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
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Our <span className="text-yellow-600">Services</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions designed to support your business at every
            stage of growth
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
          const Icon = service.icon;
          return <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} animate={inView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.8,
            delay: index * 0.1
          }} className="bg-gray-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors duration-300">
                  <Icon className="text-yellow-600 group-hover:text-white transition-colors duration-300" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>;
        })}
        </div>
      </div>
    </section>;
}