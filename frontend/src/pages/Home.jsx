import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineVideoCamera, HiOutlineChatAlt, HiArrowRight } from 'react-icons/hi';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="bg-mesh min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-4 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-400/20 blur-[120px] rounded-full animate-slow-pulse"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-accent-400/10 blur-[100px] rounded-full animate-slow-pulse [animation-delay:2s]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 mb-8 rounded-full bg-primary-100/50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              ✨ The Future of Legal Tech is Here
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1]">
              Legal Counsel <br />
              <span className="text-gradient">Redefined.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Connect with top-tier legal experts instantly. Secure, encrypted, and available 24/7 at your fingertips.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                to="/lawyers" 
                className="group relative bg-primary-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-primary-500/30 overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Browse Experts <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link 
                to="/register?role=lawyer" 
                className="glass px-10 py-5 rounded-2xl text-lg font-bold text-slate-900 transition-all hover:bg-white/80 active:scale-95"
              >
                Join as Professional
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Floating Image/Card UI Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="glass rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
                alt="Modern Law Office" 
                className="w-full h-auto rounded-[2.5rem] shadow-inner"
              />
            </div>
            
            {/* Contextual Stats Overlay */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 glass p-6 rounded-3xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <HiOutlineShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold">100% Secure</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">End-to-End Encrypted</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Unrivaled Expertise.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">LexConnect brings together the finest legal minds with the most advanced collaborative tools.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              delay={0.2}
              icon={<HiOutlineSearch className="w-8 h-8 text-primary-600" />}
              title="Smart Search"
              description="Find precisely who you need using our AI-driven specialization matching system."
            />
            <FeatureCard 
              delay={0.3}
              icon={<HiOutlineChatAlt className="w-8 h-8 text-primary-600" />}
              title="Fluid Chat"
              description="Whisper-fast messaging that keeps your legal documents and case history organized."
            />
            <FeatureCard 
              delay={0.4}
              icon={<HiOutlineVideoCamera className="w-8 h-8 text-primary-600" />}
              title="HD Consult"
              description="Zero-latency high definition video for a true face-to-face legal experience."
            />
            <FeatureCard 
              delay={0.5}
              icon={<HiOutlineShieldCheck className="w-8 h-8 text-primary-600" />}
              title="Verified"
              description="Every lawyer on our platform undergoes a rigorous 5-step background verification."
            />
          </div>
        </div>
      </section>

      {/* Stats/Logo Section */}
      <section className="py-24 border-y border-slate-100 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-40 grayscale pointer-events-none">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Forbes_logo.svg" alt="Forbes" className="h-8 md:h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/TechCrunch_logo.svg" alt="TechCrunch" className="h-8 md:h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Wall_Street_Journal_Logo.svg" alt="WSJ" className="h-8 md:h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/02/The_New_York_Times_Logo.svg" alt="NYT" className="h-8 md:h-10" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="glass-dark rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden"
          >
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-600/30 blur-[120px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">Ready for Clarity?</h2>
              <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Join our premium ecosystem today. Whether you're a client seeking advice or a lawyer looking to expand your reach.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/register" className="bg-white text-slate-900 px-12 py-5 rounded-2xl text-xl font-bold transition-all hover:bg-slate-100 active:scale-95 shadow-2xl">
                  Get Started
                </Link>
                <Link to="/about" className="glass px-12 py-5 rounded-2xl text-xl font-bold text-white transition-all hover:bg-white/10 active:scale-95">
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    whileInView={{ opacity: 1, y: 0 }}
    initial={{ opacity: 0, y: 50 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="card-premium group"
  >
    <div className="bg-primary-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
      {React.cloneElement(icon, { className: 'w-10 h-10 group-hover:scale-110 transition-transform duration-500' })}
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-slate-500 text-base leading-relaxed tracking-tight">{description}</p>
  </motion.div>
);

export default Home;
