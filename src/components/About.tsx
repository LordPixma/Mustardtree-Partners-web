import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
export function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  return <section id="about" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(234, 179, 8) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div ref={ref} initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.8
      }}>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">
            About <span className="text-yellow-600">Mustardtree Partners</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            Mustardtree Partners Ltd is a UK-based corporate governance and
            business intelligence firm committed to helping organisations
            navigate complexity with clarity and confidence. We provide expert
            guidance in company secretarial services, strategic intelligence,
            and data-driven decision-making.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            Our mission is to empower businesses to establish robust governance
            frameworks, unlock actionable insights, and achieve sustainable
            growth through integrity, transparency, and partnership.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Whether you are starting a new venture, expanding into the UK
            market, or seeking to strengthen your corporate governance, we are
            here to support you every step of the way.
          </p>
        </motion.div>
      </div>
    </section>;
}