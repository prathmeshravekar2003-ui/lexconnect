import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaFacebook, FaBalanceScale } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center text-white mb-4">
              <FaBalanceScale className="text-2xl mr-2 text-primary-400" />
              <span className="text-xl font-bold font-serif">LexConnect</span>
            </Link>
            <p className="text-sm text-slate-400">
              Connecting you with top-tier legal experts for seamless online consultations. Expert advice, anywhere, anytime.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-primary-400 transition-colors"><FaTwitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FaLinkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FaFacebook className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/lawyers" className="hover:text-primary-400">Search Lawyers</Link></li>
              <li><Link to="/about" className="hover:text-primary-400">How to Book</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400">Common FAQs</Link></li>
              <li><Link to="/help" className="hover:text-primary-400">Support Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Lawyers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=lawyer" className="hover:text-primary-400">Join as Lawyer</Link></li>
              <li><Link to="/success-stories" className="hover:text-primary-400">Success Stories</Link></li>
              <li><Link to="/legal-resources" className="hover:text-primary-400">Resources</Link></li>
              <li><Link to="/lawyer-help" className="hover:text-primary-400">Partner Help</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-primary-400">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary-400">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} LexConnect Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 uppercase tracking-widest text-slate-500">
            <span>Built for the future of Law</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
