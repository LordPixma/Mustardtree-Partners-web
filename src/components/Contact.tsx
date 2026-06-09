import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
export function Contact() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
          const data = await response.json();
          if (data && typeof data.error === 'string') message = data.error;
        } catch {
          // response had no JSON body
        }
        throw new Error(message);
      }
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return <section id="contact" className="py-24 md:py-32 bg-white dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.8
      }} className="max-w-3xl mb-16">
          <p className="kicker mb-5">Contact</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-navy-900 dark:text-white mb-5 leading-tight">
            Start a <span className="text-gold-600 dark:text-gold-400">conversation</span>
          </h2>
          <p className="text-lg text-navy-600 dark:text-navy-100/70 leading-relaxed">
            Tell us what you are trying to achieve. We will respond with a
            considered view and clear next steps — in confidence, and without
            obligation.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} animate={inView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none" />
              </div>
              {status === 'success' && <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 size={20} className="flex-shrink-0" />
                  <span>Thank you for your message. We will get back to you shortly.</span>
                </div>}
              {status === 'error' && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>}
              <button type="submit" disabled={status === 'submitting'} className="w-full px-8 py-4 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70">
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
                <Send size={20} />
              </button>
            </form>
          </motion.div>
          {/* Contact Information */}
          <motion.div initial={{
          opacity: 0,
          x: 30
        }} animate={inView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Registered Address
                  </h3>
                  <p className="text-gray-600">
                    33A Great George Street
                    <br />
                    Leeds LS1 3BB
                    <br />
                    United Kingdom
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Email
                  </h3>
                  <p className="text-gray-600">info@mustardtreegroup.com</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Information
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">Company Name:</span> Mustardtree
                  Partners Ltd
                </p>
                <p>
                  <span className="font-medium">Company Number:</span> 16815318
                </p>
                <p>
                  <span className="font-medium">Website:</span>{' '}
                  <a href="https://mustardtreegroup.com" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">
                    mustardtreegroup.com
                  </a>
                </p>
              </div>
            </div>
            {/* Map placeholder */}
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.7777777777777!2d-1.5490!3d53.7979!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c1b0b0b0b0b%3A0x0!2sGreat%20George%20Street%2C%20Leeds!5e0!3m2!1sen!2suk!4v1234567890" width="100%" height="100%" style={{
              border: 0,
              borderRadius: '0.5rem'
            }} allowFullScreen loading="lazy" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}