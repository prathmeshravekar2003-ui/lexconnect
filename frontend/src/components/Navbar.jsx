import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiUserCircle, HiLogout, HiViewGrid } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass px-6 py-3 rounded-3xl flex justify-between items-center transition-all duration-500 ${isScrolled ? 'shadow-2xl border-white/20' : 'border-transparent shadow-none'}`}>
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <span className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">⚖️</span>
              <span className="hidden sm:block tracking-tight">LexConnect</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/lawyers" active={location.pathname === '/lawyers'}>Find Lawyers</NavLink>
            <NavLink to="/about" active={location.pathname === '/about'}>About</NavLink>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l border-slate-200 pl-8">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>
                    Admin
                  </Link>
                )}
                <div className="relative group flex items-center gap-3">
                  <Link to="/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-primary-600 font-semibold transition-colors">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200" />
                    ) : (
                      <HiUserCircle className="w-8 h-8" />
                    )}
                    <span className="text-sm">{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <div className="h-4 w-[1px] bg-slate-200"></div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-accent-600 transition-colors" title="Logout">
                    <HiLogout className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-bold px-4 py-2 transition-colors">Sign In</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors">
              {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-24 left-4 right-4 z-40"
          >
            <div className="glass p-6 rounded-3xl space-y-4 shadow-3xl">
              <Link to="/lawyers" className="block p-4 rounded-2xl hover:bg-primary-50 text-slate-900 font-bold" onClick={() => setIsOpen(false)}>Find Lawyers</Link>
              <Link to="/about" className="block p-4 rounded-2xl hover:bg-primary-50 text-slate-900 font-bold" onClick={() => setIsOpen(false)}>About</Link>
              <div className="h-[1px] bg-slate-100 mx-4"></div>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block p-4 rounded-2xl hover:bg-primary-50 text-primary-600 font-bold" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block p-4 rounded-2xl hover:bg-primary-50 text-primary-600 font-bold" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left p-4 rounded-2xl hover:bg-accent-50 text-accent-600 font-bold">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block p-4 rounded-2xl hover:bg-primary-50 text-slate-900 font-bold" onClick={() => setIsOpen(false)}>Sign In</Link>
                  <Link to="/register" className="block p-4 bg-primary-600 text-white rounded-2xl text-center font-bold" onClick={() => setIsOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link 
    to={to} 
    className={`relative py-2 font-bold transition-colors ${active ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'}`}
  >
    {children}
    {active && (
      <motion.div 
        layoutId="nav-underline" 
        className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-primary-600 rounded-full"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
  </Link>
);

export default Navbar;
