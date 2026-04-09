import React from 'react';
import { HiOutlineUserAdd, HiOutlineScale, HiOutlineCheckCircle, HiOutlineChatAlt2, HiOutlineVideoCamera, HiOutlineShieldCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black font-serif mb-6 text-slate-900">How LexConnect Works</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            We've simplified the process of getting professional legal advice. From discovery to consultation, everything happens in one secure place.
          </p>
        </div>

        <div className="space-y-32">
          <Step 
            number="01"
            title="Create Your Account"
            description="Sign up as a client or a legal expert. Clients get access to a worldwide network, while lawyers can build their digital practice."
            icon={<HiOutlineUserAdd />}
            reverse={false}
          />
          
          <Step 
            number="02"
            title="Discover Legal Experts"
            description="Use our advanced filters to find the right lawyer for your specific case based on specialization, rating, experience, and fees."
            icon={<HiOutlineScale />}
            reverse={true}
          />

          <Step 
            number="03"
            title="Secure Booking & Payment"
            description="Submit your legal problem, upload documents, and book an instant or scheduled session. All payments are secured via Razorpay."
            icon={<HiOutlineShieldCheck />}
            reverse={false}
          />

          <Step 
            number="04"
            title="Consult via Chat & Video"
            description="Once booked, enter a private encrypted chat room. Switch to a high-quality video call whenever you need more personal interaction."
            icon={<HiOutlineVideoCamera />}
            reverse={true}
          />
        </div>

        <div className="mt-40 bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-600/10 blur-[100px]"></div>
          
          <h2 className="text-4xl font-bold font-serif mb-8 relative z-10">Ready to get started?</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center relative z-10">
            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/20 transition-all transform hover:-translate-y-1">
              Find a Lawyer Now
            </Link>
            <Link to="/register" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-lg backdrop-blur-md transition-all transform hover:-translate-y-1">
              Join as a Legal Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step = ({ number, title, description, icon, reverse }) => (
  <div className={`flex flex-col md:flex-row items-center gap-16 ${reverse ? 'md:flex-row-reverse' : ''}`}>
    <div className="flex-1">
      <div className="text-8xl font-black text-slate-100 mb-6 font-serif">{number}</div>
      <h3 className="text-3xl font-bold mb-6 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-lg leading-relaxed">{description}</p>
      <div className="mt-8 flex items-center gap-4 text-primary-600 font-bold">
        <HiOutlineCheckCircle className="w-6 h-6" />
        <span>Fully Secured & Encrypted</span>
      </div>
    </div>
    <div className="flex-1 flex justify-center">
      <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-8xl text-primary-600 border border-slate-100 relative group transition-all duration-500 hover:rotate-3">
        <div className="absolute inset-0 bg-primary-50 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">{icon}</div>
      </div>
    </div>
  </div>
);

export default About;
