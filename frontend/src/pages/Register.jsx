import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineDeviceMobile, HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'lawyer' ? 'lawyer' : 'client';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    phone: ''
  });
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      toast.success('Onboarding complete. Welcome to the platform.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed. Check your data.');
    }
  };

  return (
    <div className="min-h-screen py-12 pt-32 flex items-center justify-center p-4 bg-mesh overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-[3rem] shadow-3xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row border-white/40"
      >
        {/* Info Sidebar */}
        <div className="md:w-[35%] bg-slate-900 p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px]"></div>
          
          <div className="relative z-10">
            <Link to="/" className="text-2xl font-bold font-serif text-primary-400 mb-16 block">⚖️ LexConnect</Link>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tight">Access Modern <br/>Legal Power.</h2>
            
            <div className="space-y-8">
              <SidebarItem icon={<HiCheckCircle />} title="Elite Network" desc="Top-tier verified legal minds." />
              <SidebarItem icon={<HiCheckCircle />} title="Vanguard Security" desc="End-to-end encrypted infrastructure." />
              <SidebarItem icon={<HiCheckCircle />} title="Direct Action" desc="Instant booking and resolution." />
            </div>
          </div>
          
          <div className="mt-16 pt-10 border-t border-slate-800 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Intelligence Net</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:w-[65%] p-8 md:p-16 bg-white/40 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">New Credentials</h2>
              <p className="text-slate-500 font-medium">Initialize your professional profile.</p>
            </div>
            
            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
              <RoleToggle 
                active={formData.role === 'client'} 
                onClick={() => setFormData({...formData, role: 'client'})}
                label="CLIENT"
              />
              <RoleToggle 
                active={formData.role === 'lawyer'} 
                onClick={() => setFormData({...formData, role: 'lawyer'})}
                label="PROFESSIONAL"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PremiumInput 
              label="Full Name" 
              name="name" 
              icon={<HiOutlineUser />} 
              placeholder="Operational Name" 
              value={formData.name} 
              onChange={handleChange} 
            />
            <PremiumInput 
              label="Secure Email" 
              name="email" 
              type="email" 
              icon={<HiOutlineMail />} 
              placeholder="name@nexus.com" 
              value={formData.email} 
              onChange={handleChange} 
            />
            <PremiumInput 
              label="Direct Dial" 
              name="phone" 
              icon={<HiOutlineDeviceMobile />} 
              placeholder="+00 XXXXX XXXXX" 
              value={formData.phone} 
              onChange={handleChange} 
            />
            <PremiumInput 
              label="Master Key" 
              name="password" 
              type="password" 
              icon={<HiOutlineLockClosed />} 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
            />

            <div className="md:col-span-2">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input type="checkbox" required className="mt-1.5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 w-5 h-5 transition-premium" />
                <span className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-800 transition-colors">
                  I accept the <Link to="/terms" className="text-primary-600 font-black">Protocols</Link> and <Link to="/privacy" className="text-primary-600 font-black">Security Standards</Link> of the network.
                </span>
              </label>
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white py-5 rounded-[2rem] font-bold text-lg shadow-2xl shadow-primary-500/20 transition-premium flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? 'Initializing...' : 'Authorize Account'}
                {!loading && <HiArrowRight />}
              </button>
              <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                Already registered? <Link to="/login" className="text-primary-600 font-black hover:underline px-1">Access Console</Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const SidebarItem = ({ icon, title, desc }) => (
  <div className="flex gap-5">
    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/10">
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    <div>
      <div className="font-bold text-lg leading-tight mb-1">{title}</div>
      <div className="text-slate-500 text-sm font-medium">{desc}</div>
    </div>
  </div>
);

const RoleToggle = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-premium ${active ? 'bg-white shadow-xl text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
  </button>
);

const PremiumInput = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <input 
        className="w-full pl-14 pr-6 py-4 bg-white/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-premium font-medium placeholder:text-slate-300"
        {...props}
        required
      />
    </div>
  </div>
);

export default Register;
