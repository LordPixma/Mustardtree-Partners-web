import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };
  const navLinks = [{
    name: 'Home',
    id: 'hero'
  }, {
    name: 'About',
    id: 'about'
  }, {
    name: 'Services',
    id: 'services'
  }, {
    name: 'Why Us',
    id: 'why-choose-us'
  }, {
    name: 'Contact',
    id: 'contact'
  }];
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <img src="/mustardtree_300.png" alt="Mustardtree Partners" className={`h-12 transition-all duration-300 ${!isScrolled ? 'brightness-0 invert' : ''}`} />
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map(link => <button key={link.id} onClick={() => scrollToSection(link.id)} className={`transition-colors duration-200 font-medium ${isScrolled ? 'text-gray-700 hover:text-yellow-600' : 'text-white hover:text-yellow-400'}`}>
                {link.name}
              </button>)}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`transition-colors duration-200 ${isScrolled ? 'text-gray-700 hover:text-yellow-600' : 'text-white hover:text-yellow-400'}`}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => <button key={link.id} onClick={() => scrollToSection(link.id)} className="block w-full text-left text-gray-700 hover:text-yellow-600 py-2 font-medium">
                {link.name}
              </button>)}
          </div>
        </div>}
    </nav>;
}