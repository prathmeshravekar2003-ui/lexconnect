import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineUser, HiOutlineBriefcase, HiOutlineCurrencyRupee, 
  HiOutlineLocationMarker, HiOutlineTranslate, HiOutlineCheckCircle,
  HiOutlineIdentification, HiArrowLeft
} from 'react-icons/hi';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const ProfileSettings = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    specialization: [],
    barCouncilId: '',
    experience: '',
    bio: '',
    consultationFee: '',
    languages: [],
    location: {
      city: '',
      state: '',
      address: ''
    }
  });

  const specializations = [
    'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
    'Tax Law', 'Property Law', 'Labour Law', 'Immigration Law',
    'Intellectual Property', 'Banking Law', 'Cyber Law', 'Consumer Protection'
  ];

  const availableLanguages = [
    'English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/lawyers/profile/me');
      if (response.data.success && response.data.profile) {
        const p = response.data.profile;
        setFormData({
          specialization: p.specialization || [],
          barCouncilId: p.barCouncilId || '',
          experience: p.experience || '',
          bio: p.bio || '',
          consultationFee: p.consultationFee || '',
          languages: p.languages || [],
          location: {
            city: p.location?.city || '',
            state: p.location?.state || '',
            address: p.location?.address || ''
          }
        });
      }
    } catch (error) {
      console.log('No profile found, create new one');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const items = [...prev[field]];
      const index = items.indexOf(item);
      if (index > -1) {
        items.splice(index, 1);
      } else {
        items.push(item);
      }
      return { ...prev, [field]: items };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.specialization.length === 0) return toast.error('Select at least one specialization');
    if (formData.languages.length === 0) return toast.error('Select at least one language');

    setLoading(true);
    try {
      await api.post('/lawyers/profile', formData);
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading your profile...</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold mb-8 transition-colors"
        >
          <HiArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-fade-in">
          <div className="bg-slate-900 p-12 text-white relative h-48 flex items-end">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] rounded-full"></div>
            <div className="relative">
              <h1 className="text-4xl font-bold font-serif">Professional Profile</h1>
              <p className="text-slate-400 mt-2">Manage your professional details and consultation settings.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-12">
            {/* Section: Basic Pro Info */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">01</span>
                Lawyer Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Bar Council ID</label>
                  <div className="relative">
                    <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text"
                      name="barCouncilId"
                      value={formData.barCouncilId}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="e.g. MAH/1234/2026"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Experience (Years)</label>
                  <div className="relative">
                    <HiOutlineBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="e.g. 10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Specialization */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">02</span>
                Area of Expertise
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specializations.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleArrayItem('specialization', spec)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                      formData.specialization.includes(spec)
                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Consultation Info */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">03</span>
                Consultation Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Fee per Session (INR)</label>
                  <div className="relative">
                    <HiOutlineCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-lg"
                      placeholder="e.g. 1000"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 px-1">Per 30-minute consultation</p>
                </div>
                <div className="space-y-2 text-sm">
                  <label className="text-sm font-bold text-slate-700 ml-1">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayItem('languages', lang)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          formData.languages.includes(lang)
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Professional Biography</label>
                <textarea 
                  name="bio"
                  rows="5"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-600"
                  placeholder="Tell clients about your legal career, notable achievements, and how you approach cases..."
                  required
                ></textarea>
              </div>
            </div>

            {/* Section: Location */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">04</span>
                Physical Office Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">City</label>
                  <input 
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">State</label>
                  <input 
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="e.g. Maharashtra"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Office Address</label>
                  <div className="relative">
                    <HiOutlineLocationMarker className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                    <textarea 
                      name="location.address"
                      rows="2"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                      placeholder="Street, Landmark, etc."
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary-200 transition-all flex items-center gap-2 group"
              >
                {loading ? 'Saving Changes...' : 'Save & Publish Profile'}
                {!loading && <HiOutlineCheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
