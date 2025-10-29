import { Linkedin, Mail } from 'lucide-react';
export function Footer() {
  return <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <img src="/mustardtree_300.png" alt="Mustardtree Partners" className="h-12 mb-4 brightness-0 invert" />
            <p className="text-gray-400 text-sm">
              Partners in Growth, Governance & Intelligence
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>33A Great George Street</p>
              <p>Leeds LS1 3BB</p>
              <p>Company No: 16815318</p>
              <div className="flex gap-4 mt-4">
                <a href="mailto:info@mustardtreegroup.com" className="hover:text-yellow-500 transition-colors">
                  <Mail size={20} />
                </a>
                <a href="#" className="hover:text-yellow-500 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Mustardtree Partners Ltd. All rights reserved.</p>
          <p className="mt-2">
            Mustardtree Partners Ltd is a registered company in England and Wales (Company No: 16815318) 
            and is part of the MustardTree Group.
          </p>
        </div>
      </div>
    </footer>;
}