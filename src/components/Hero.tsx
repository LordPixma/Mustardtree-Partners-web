import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-navy-950"
    >
      {/* Architectural background image (restored from the original hero) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        }}
      />
      {/* Legibility scrims: darker behind the left-aligned text, lighter over
          the image to the right; vertical fade to seat the navbar and base. */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-900/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/10 to-navy-950/40" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold-500/30 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="kicker text-gold-400 mb-6"
          >
            UK Business Advisory &amp; Corporate Services
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.05] mb-8"
          >
            Establish. Govern.{' '}
            <span className="text-gold-500">Grow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-navy-100/90 leading-relaxed mb-10 max-w-2xl"
          >
            MustardTree Partners is a UK advisory and corporate services firm. We
            help founders, boards, and international companies establish in the
            UK, meet their governance obligations, and grow with confidence —
            from company formation and nominee directorships to strategy, risk,
            and statutory compliance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 bg-gold-500 text-navy-950 rounded-md font-semibold hover:bg-gold-400 transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              Arrange a consultation
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-md font-semibold hover:bg-white/10 hover:border-white/50 transition-colors duration-300"
            >
              Explore our services
            </button>
          </motion.div>

          {/* Lifecycle / proposition strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px max-w-2xl border-t border-white/10 pt-8"
          >
            {[
              { k: 'Establish', v: 'UK formation, structuring & market entry' },
              { k: 'Govern', v: 'Directorships, secretarial & compliance' },
              { k: 'Grow', v: 'Strategy, risk & intelligence' },
            ].map((item) => (
              <div key={item.k} className="pr-6">
                <p className="text-gold-400 font-serif text-lg mb-1">{item.k}</p>
                <p className="text-sm text-navy-200/80 leading-snug">{item.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
