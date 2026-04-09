import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineChatAlt, HiOutlineVideoCamera, 
  HiOutlineCreditCard, HiOutlineClock,
  HiOutlineCheckCircle, HiChevronRight, HiSparkles, HiArrowRight
} from 'react-icons/hi';
import api from '../services/api';
import socketService from '../services/socketService';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    earnings: 0
  });

  useEffect(() => {
    fetchData();
    setupRealtime();

    return () => {
      socketService.getSocket()?.off('new_consultation');
      socketService.getSocket()?.off('consultation_updated');
    };
  }, []);

  const setupRealtime = () => {
    const socket = socketService.connect(useAuthStore.getState().token);
    
    socket.on('new_consultation', (data) => {
      toast.success(data.message || 'New consultation request!');
      fetchData();
    });

    socket.on('consultation_updated', (data) => {
      toast(data.message || 'Consultation status updated', { icon: '🔔' });
      fetchData();
    });
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/consultations/my');
      setConsultations(res.data.consultations);
      
      const ongoing = res.data.consultations.filter(c => ['accepted', 'ongoing'].includes(c.status)).length;
      const completed = res.data.consultations.filter(c => c.status === 'completed').length;
      
      setStats({
        total: res.data.total,
        ongoing,
        completed,
        earnings: user?.role === 'lawyer' ? res.data.consultations.reduce((acc, curr) => acc + (curr.isPaid ? curr.fee : 0), 0) : 0
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (consultation) => {
    try {
      setLoading(true);
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const orderRes = await api.post('/payments/create-order', {
        consultationId: consultation._id
      });
      
      const { order, key } = orderRes.data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'LexConnect',
        description: 'Consultation Fee Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful!');
            fetchData();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: { color: '#0e8ce4' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/consultations/${id}/status`, { status });
      toast.success(`Consultation ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="bg-mesh min-h-screen py-32 px-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        
        {/* Modern Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-200">
                Live Console
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif">Command Center</h1>
            <p className="text-slate-500 mt-2 font-medium">Monitoring legal activities for <span className="text-slate-900">{user?.name}</span></p>
          </div>
          <div className="flex gap-4">
            <Link to="/lawyers" className="glass px-6 py-3 rounded-2xl text-sm font-bold transition-premium hover:bg-white/80 flex items-center gap-2">
              New Case <HiSparkles className="text-primary-500" />
            </Link>
          </div>
        </motion.div>

        {/* Stats Section with Glass Effect */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Consults" value={stats.total} icon={<HiOutlineClock />} />
          <StatCard label="Active Sessions" value={stats.ongoing} icon={<HiOutlineVideoCamera />} color="text-green-600" />
          <StatCard label="Completed" value={stats.completed} icon={<HiOutlineCheckCircle />} color="text-amber-600" />
          {user?.role === 'lawyer' && (
            <StatCard label="Revenue" value={`₹${stats.earnings.toLocaleString()}`} icon={<HiOutlineCreditCard />} color="text-primary-600" />
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
            <div className="glass rounded-[2.5rem] p-4 md:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  Engagement Feed 
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400 font-black tracking-widest uppercase">Real-time</span>
                </h3>
              </div>
              
              <AnimatePresence mode='wait'>
                {loading ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50/50 animate-pulse rounded-3xl"></div>)}
                  </motion.div>
                ) : consultations.length > 0 ? (
                  <motion.div key="list" initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
                    {consultations.map(consult => (
                      <ConsultationCard 
                        key={consult._id} 
                        consult={consult} 
                        role={user.role} 
                        onAction={updateStatus}
                        onPay={() => handlePayment(consult)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="text-center py-20 px-8">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <HiOutlineChatAlt className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-medium">Your engagement feed is currently empty.</p>
                    <Link to="/lawyers" className="text-primary-600 font-bold hover:underline mt-4 inline-block">Initiate first consultation</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <div className="glass rounded-[2.5rem] p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-600/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="relative inline-block mb-6 p-1.5 glass rounded-3xl">
                  <img src={user?.avatar || 'https://via.placeholder.com/120'} className="w-24 h-24 rounded-2xl object-cover shadow-2xl" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <h4 className="font-bold text-2xl mb-1 tracking-tight">{user?.name}</h4>
                <p className="text-[10px] text-primary-600 uppercase font-black tracking-[0.2em] mb-8">{user?.role} PRO</p>
                
                <div className="space-y-4 text-left">
                  <ProfileInfo label="Trust Level" value="Verified Expert" icon="✅" />
                  <ProfileInfo label="Location" value="Global / Hybrid" icon="🌐" />
                </div>
                
                <Link to="/profile/settings" className="mt-8 block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-2xl transition-premium hover:bg-slate-800">
                  Manage Credentials
                </Link>
              </div>
            </div>

            <div className="glass-dark text-white rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"></div>
              <h4 className="font-bold text-xl mb-4 relative z-10 flex items-center gap-2">
                Pro Support <span className="text-[8px] bg-red-500/80 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">
                Priority access to legal platform experts available through our instant concierge.
              </p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-sm shadow-2xl transition-premium hover:scale-[1.02] active:scale-95 z-10 relative">
                Summon Concierge
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color = "text-slate-900" }) => (
  <div className="glass p-6 rounded-[2rem] flex items-center gap-5 transition-premium hover:bg-white">
    <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.1em] mb-0.5">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  </div>
);

const ProfileInfo = ({ label, value, icon }) => (
  <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-white/50 shadow-sm">
    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
    <span className="text-xs font-black flex items-center gap-1.5">{icon} {value}</span>
  </div>
);

const ConsultationCard = ({ consult, role, onAction, onPay }) => {
  const partner = (role === 'client' ? consult.lawyer : consult.client) || {};
  
  const statusConfig = {
    pending: { color: 'text-slate-500 bg-slate-100', dot: 'bg-slate-300' },
    accepted: { color: 'text-primary-600 bg-primary-100', dot: 'bg-primary-500' },
    ongoing: { color: 'text-green-600 bg-green-100 animate-pulse', dot: 'bg-green-500' },
    completed: { color: 'text-slate-400 bg-slate-50', dot: 'bg-slate-200' },
    rejected: { color: 'text-red-600 bg-red-50', dot: 'bg-red-500' }
  };

  const currentStatus = consult.status || 'pending';
  const config = statusConfig[currentStatus] || statusConfig.pending;

  const isClient = role === 'client';
  const isLawyer = role === 'lawyer';

  if (!partner.name && !consult._id) return null;

  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.01 }}
      className="group w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-premium duration-500"
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          <img src={partner?.avatar || 'https://via.placeholder.com/80'} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
          {consult.status === 'ongoing' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></div>}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h5 className="font-bold text-lg text-slate-900 leading-none">{partner?.name || 'Unknown User'}</h5>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
              {currentStatus}
            </div>
            {consult.isPaid && <span className="bg-primary-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-primary-200">Vaulted</span>}
          </div>
          <p className="text-sm text-slate-400 line-clamp-1 max-w-[300px] font-medium italic">“{consult.problemDescription || 'No description provided.'}”</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {consult.status === 'pending' && isLawyer && (
          <div className="flex gap-2">
            <button onClick={() => onAction(consult._id, 'accepted')} className="px-5 py-3 bg-primary-600 text-white rounded-2xl font-extrabold text-xs shadow-xl shadow-primary-100 hover:bg-primary-700 transition-premium">Accept Case</button>
            <button onClick={() => onAction(consult._id, 'rejected')} className="px-5 py-3 border border-slate-100 text-slate-400 rounded-2xl font-extrabold text-xs hover:bg-slate-50 transition-premium">Decline</button>
          </div>
        )}

        {consult.status === 'accepted' && isClient && !consult.isPaid && (
          <button onClick={onPay} className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-extrabold text-sm shadow-2xl shadow-primary-100 hover:scale-105 active:scale-95 transition-premium flex items-center gap-2">
             Deposit Fee <HiArrowRight className="w-4 h-4" />
          </button>
        )}

        {consult.isPaid && consult.status !== 'completed' && (
          <div className="flex gap-2">
            <Link to={`/chat/${consult._id}`} className="p-4 text-primary-600 bg-primary-50 rounded-2xl hover:bg-primary-600 hover:text-white transition-premium shadow-sm">
              <HiOutlineChatAlt className="w-6 h-6" />
            </Link>
            <Link to={`/video-call/${consult._id}`} className="p-4 text-accent-600 bg-accent-50 rounded-2xl hover:bg-accent-600 hover:text-white transition-premium shadow-sm">
              <HiOutlineVideoCamera className="w-6 h-6" />
            </Link>
            {isLawyer && (
              <button onClick={() => onAction(consult._id, 'completed')} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-extrabold text-xs hover:bg-slate-800 transition-premium">Close Case</button>
            )}
          </div>
        )}
        
        {consult.status === 'completed' && (
          <Link to={`/chat/${consult._id}`} className="px-8 py-4 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-premium flex items-center gap-2">
            Case Archive <HiChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
