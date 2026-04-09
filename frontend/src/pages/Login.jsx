import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Access Granted. Welcome back.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Verification failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-32 bg-mesh overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[120px] rounded-full"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-[3rem] shadow-3xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row border-white/40"
      >
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-sm">
          <Link to="/" className="mb-12 text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <span className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">⚖️</span>
            <span className="tracking-tight">LexConnect</span>
          </Link>
          
          <h2 className="text-4xl font-bold mb-3 tracking-tight">Identity Access</h2>
          <p className="text-slate-500 mb-10 font-medium">Continue to your secure legal workspace.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-premium outline-none placeholder:text-slate-300 font-medium"
                  placeholder="name@organization.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Master Key</label>
                <a href="#" className="text-xs text-primary-600 font-bold hover:underline">Forgot Key?</a>
              </div>
              <div className="relative group">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-premium outline-none placeholder:text-slate-300 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-primary-500/20 transition-premium flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
              {!loading && <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New operative? <Link to="/register" className="text-primary-600 font-black hover:underline px-1">Create Access</Link>
          </p>
        </div>
        
        <div className="hidden md:block md:w-1/2 bg-slate-900 p-16 text-white relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/30 blur-[120px] rounded-full"></div>
          <div className="relative h-full flex flex-col justify-between">
            <div>
              <HiShieldCheck className="w-12 h-12 text-primary-500 mb-8" />
              <blockquote className="text-3xl font-serif italic mb-8 leading-relaxed text-slate-100">
                "The evolution of legal accessibility begins with extreme clarity and unwavering security."
              </blockquote>
            </div>
            
            <div className="space-y-6">
              <div className="glass-dark p-6 rounded-3xl border-white/5">
                <div className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Protocol Status</div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-lg font-bold">End-to-End Encryption Enabled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
