import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Sectors } from './components/Sectors';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Seo, OrganizationJsonLd } from './components/Seo';
export function App() {
  return <div className="w-full min-h-screen bg-white">
      <Seo path="/" />
      <OrganizationJsonLd />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Sectors />
      <WhyChooseUs />
      <Contact />
      <Footer />
    </div>;
}