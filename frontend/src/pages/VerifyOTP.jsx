import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineRefresh } from 'react-icons/hi';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const { verifyOTP, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) navigate('/register');
    
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return toast.error('Please enter complete code');

    const result = await verifyOTP(email, otpValue);
    if (result.success) {
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      setTimer(60);
      toast.success('New code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center border border-slate-100 animate-fade-in">
        <div className="bg-primary-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <HiOutlineShieldCheck className="w-10 h-10 text-primary-600" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We've sent a 6-digit verification code to <br />
          <span className="text-slate-900 font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold shadow-xl shadow-primary-200 transition-all transform hover:-translate-y-1"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-4">Didn't receive the code?</p>
          <button 
            onClick={handleResend}
            disabled={timer > 0}
            className={`flex items-center justify-center mx-auto space-x-2 font-bold ${timer > 0 ? 'text-slate-400' : 'text-primary-600 hover:text-primary-700'}`}
          >
            <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
