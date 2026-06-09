import { Mail, MapPin } from 'lucide-react';

export function Footer() {
  const practices = [
    { label: 'Corporate Services & Governance', href: '/#services' },
    { label: 'International Expansion', href: '/#services' },
    { label: 'Strategy & Business Advisory', href: '/#services' },
    { label: 'Risk, Cyber & Intelligence', href: '/#services' },
  ];

  const company = [
    { label: 'About', href: '/#about' },
    { label: 'Our approach', href: '/#approach' },
    { label: 'Industries', href: '/#sectors' },
    { label: 'Insights', href: '/blog' },
  ];

  const legal = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Client portal', href: '/portal' },
  ];

  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <img
              src="/mustardtree_300.png"
              alt="MustardTree Partners"
              className="h-11 mb-5 brightness-0 invert"
            />
            <p className="text-navy-200/70 text-sm leading-relaxed max-w-xs">
              UK business advisory and corporate services. We help founders,
              boards, and international companies establish, govern, and grow —
              with a single, accountable partner.
            </p>
          </div>

          {/* Practices */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400 mb-5">
              Practices
            </h4>
            <ul className="space-y-3">
              {practices.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-navy-200/70 hover:text-gold-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400 mb-5">
              Firm
            </h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-navy-200/70 hover:text-gold-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400 mb-5">
              Contact
            </h4>
            <div className="space-y-3 text-sm text-navy-200/70">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gold-400/80" />
                <span>
                  33A Great George Street
                  <br />
                  Leeds LS1 3BB, United Kingdom
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="flex-shrink-0 text-gold-400/80" />
                <a
                  href="mailto:info@mustardtreegroup.com"
                  className="hover:text-gold-400 transition-colors"
                >
                  info@mustardtreegroup.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-navy-300/60">
            © 2026 Mustardtree Partners Ltd. Registered in England &amp; Wales,
            company no. 16815318. Part of the MustardTree Group.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-xs text-navy-300/60 hover:text-gold-400 transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
