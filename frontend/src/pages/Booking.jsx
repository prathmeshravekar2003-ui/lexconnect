import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlineCreditCard, HiCheckCircle, HiOutlineCloudUpload, HiX } from 'react-icons/hi';
import api from '../services/api';

const Booking = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [type, setType] = useState('instant');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLawyer();
  }, [lawyerId]);

  const fetchLawyer = async () => {
    try {
      const response = await api.get(`/lawyers/${lawyerId}`);
      setLawyer(response.data.profile);
    } catch (error) {
      toast.error('Lawyer not found');
      navigate('/lawyers');
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!problemDescription) return toast.error('Please describe your legal problem');
    if (problemDescription.length < 20) return toast.error('Description should be at least 20 characters');
    
    setLoading(true);
    try {
      // 1. Create Consultation Request
      const consultRes = await api.post('/consultations', {
        lawyerId,
        type,
        problemDescription
      });
      const consultation = consultRes.data.consultation;

      // 2. Upload Documents if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('consultationId', consultation._id);
        
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Consultation request sent! Please wait for the lawyer to accept.');
      navigate('/dashboard');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!lawyer) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2">Book Your Consultation</h1>
          <p className="text-slate-500">Provide details about your case and proceed to payment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <form onSubmit={handleBooking} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <HiOutlineDocumentText className="text-primary-600 w-5 h-5" />
                  Describe Your Legal Problem
                </label>
                <textarea 
                  rows="6"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Tell the lawyer what you need help with. Mention key facts, dates, and any specific questions you have."
                  required
                ></textarea>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-right">Min. 20 characters</p>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <HiOutlineCloudUpload className="text-primary-600 w-5 h-5" />
                  Upload Documents (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-400 transition-all bg-slate-50/50">
                  <input 
                    type="file" 
                    id="file-upload" 
                    multiple 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer group">
                    <HiOutlineCloudUpload className="w-12 h-12 text-slate-300 mx-auto mb-3 group-hover:text-primary-500 transition-all" />
                    <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max 5MB per file)</p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-primary-100">
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button type="button" onClick={() => removeFile(idx)} className="text-primary-400 hover:text-red-500"><HiX /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">Choose Consultation Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <TypeOption 
                    active={type === 'instant'} 
                    onClick={() => setType('instant')}
                    title="Instant"
                    desc="Connect right away"
                  />
                  <TypeOption 
                    active={type === 'scheduled'} 
                    onClick={() => setType('scheduled')}
                    title="Scheduled"
                    desc="Pick a time later"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
              >
                <HiOutlineCreditCard className="w-6 h-6" />
                {loading ? 'Processing...' : `Pay ₹${lawyer.consultationFee} & Book`}
              </button>
            </form>
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold mb-4 pb-4 border-b border-slate-50">Booking Summary</h3>
              <div className="flex items-center gap-3 mb-6">
                <img src={lawyer.user.avatar || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div>
                  <p className="font-bold text-sm">{lawyer.user.name}</p>
                  <p className="text-xs text-primary-600">{lawyer.specialization[0]}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-bold">₹{lawyer.consultationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform Fee</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-base">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-primary-600">₹{lawyer.consultationFee}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100">
              <h4 className="flex items-center gap-2 font-bold text-primary-900 mb-3 text-sm">
                <HiCheckCircle className="text-primary-600" />
                What Happens Next?
              </h4>
              <ul className="space-y-3 text-xs text-primary-800 leading-relaxed">
                <li>• Instant access to a private chat room.</li>
                <li>• Lawyer will be notified immediately.</li>
                <li>• You can upload relevant documents.</li>
                <li>• Option to switch to high-quality video call.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TypeOption = ({ active, onClick, title, desc }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 text-left transition-all ${active ? 'border-primary-600 bg-primary-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
  >
    <p className={`font-bold ${active ? 'text-primary-600' : 'text-slate-900'}`}>{title}</p>
    <p className="text-xs text-slate-500">{desc}</p>
  </button>
);

export default Booking;
