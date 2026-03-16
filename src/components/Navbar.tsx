import { useEffect, useState, useCallback } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize dark mode
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  // Sync dark mode state if toggled from portal
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setDarkMode(next);
  }, [darkMode]);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const navLinks: Array<{ name: string; id?: string; path?: string; isSection: boolean }> = [
    { name: 'Home', id: 'hero', isSection: true },
    { name: 'About', id: 'about', isSection: true },
    { name: 'Services', id: 'services', isSection: true },
    { name: 'GIS', path: '/services/gis', isSection: false },
    { name: 'Why Us', id: 'why-choose-us', isSection: true },
    { name: 'Blog', path: '/blog', isSection: false },
    { name: 'Portal', path: '/portal', isSection: false },
    { name: 'Contact', id: 'contact', isSection: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-gray-900 shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <img
              src="/mustardtree_300.png"
              alt="Mustardtree Partners"
              className={`h-12 transition-all duration-300 ${!isScrolled ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'}`}
            />
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <button
                key={link.id || link.path}
                onClick={() => link.isSection ? scrollToSection(link.id!) : handleNavigation(link.path!)}
                className={`transition-colors duration-200 font-medium ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400' : 'text-white hover:text-yellow-400'}`}
              >
                {link.name}
              </button>
            ))}
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full transition-colors ${isScrolled ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full transition-colors ${isScrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`transition-colors duration-200 ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-yellow-600' : 'text-white hover:text-yellow-400'}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <button
                key={link.id || link.path}
                onClick={() => link.isSection ? scrollToSection(link.id!) : handleNavigation(link.path!)}
                className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 py-2 font-medium"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
