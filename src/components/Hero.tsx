import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section id="hero" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
    }} />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Partners in Growth,
            <br />
            <span className="text-yellow-500">Governance & Intelligence</span>
          </h1>
        </motion.div>
        <motion.p initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Helping businesses establish, manage, and grow compliant, data-driven
          organisations.
        </motion.p>
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.4
      }} className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => scrollToSection('contact')} className="px-8 py-4 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
            Book a Consultation
            <ArrowRight size={20} />
          </button>
          <button onClick={() => scrollToSection('services')} className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
            Explore Our Services
          </button>
        </motion.div>
      </div>
      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 1,
      delay: 1
    }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div animate={{
          y: [0, 12, 0]
        }} transition={{
          duration: 1.5,
          repeat: Infinity
        }} className="w-1.5 h-1.5 bg-white rounded-full mt-2" />
        </div>
      </motion.div>
    </section>;
}