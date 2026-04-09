import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiStar, HiOutlineLocationMarker, HiOutlineTranslate, HiOutlineBriefcase, HiOutlineCheckCircle, HiCalendar } from 'react-icons/hi';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const LawyerProfile = () => {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLawyerDetails();
    fetchReviews();
  }, [id]);

  const fetchLawyerDetails = async () => {
    try {
      const response = await api.get(`/lawyers/${id}`);
      setLawyer(response.data.profile);
    } catch (error) {
      toast.error('Failed to load lawyer profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/lawyer/${id}`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen animate-pulse text-primary-600 font-bold">Loading Profile...</div>;
  if (!lawyer) return <div className="text-center py-20 bg-slate-50 min-h-screen">Lawyer not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Profile Header Background */}
      <div className="h-80 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 items-start relative">
                <img 
                  src={lawyer.user?.avatar || 'https://via.placeholder.com/200'} 
                  alt={lawyer.user?.name || 'Lawyer'} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-grow pt-4">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold font-serif">{lawyer.user?.name || 'Anonymous Lawyer'}</h1>
                    {lawyer.isTopRated && (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Top Rated Expert</span>
                    )}
                  </div>
                  <p className="text-primary-600 font-medium text-lg mb-4">{lawyer.specialization?.join(' • ') || 'Legal Expert'}</p>
                  
                  <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <HiStar className="w-5 h-5" />
                      <span>{lawyer.averageRating || 0}</span>
                      <span className="text-slate-400 font-normal text-sm">({lawyer.totalReviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <HiOutlineBriefcase className="w-5 h-5 text-slate-400" />
                      <span>{lawyer.experience || 0} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <HiOutlineLocationMarker className="w-5 h-5 text-slate-400" />
                      <span>{lawyer.location?.city || 'Remote'}, {lawyer.location?.state || 'India'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-50">
                <QuickInfo label="Success Rate" value="98%" />
                <QuickInfo label="Consultations" value={lawyer.totalConsultations} />
                <QuickInfo label="Response Time" value="< 2h" />
                <QuickInfo label="Bar Council ID" value={lawyer.barCouncilId} />
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-6">About the Lawyer</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {lawyer.bio || "No biography provided."}
              </p>
            </div>

            {/* Education & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <HiOutlineCheckCircle className="text-primary-600" />
                  Education
                </h3>
                <ul className="space-y-4">
                  {lawyer.education.map((edu, idx) => (
                    <li key={idx} className="border-l-2 border-primary-100 pl-4 py-1">
                      <p className="font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-sm text-slate-500">{edu.institution} • {edu.year}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <HiOutlineTranslate className="text-primary-600" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {lawyer.languages.map(lang => (
                    <span key={lang} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium border border-slate-100">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Client Reviews</h2>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1 rounded-full font-bold">
                  <HiStar /> {lawyer.averageRating} Average
                </div>
              </div>
              
              <div className="space-y-8">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review._id} className="pb-8 border-b border-slate-50 last:border-0">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          <img src={review.client.avatar || 'https://via.placeholder.com/40'} alt="client" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{review.client.name}</p>
                          <p className="text-xs text-slate-400">Verified Client</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => <HiStar key={i} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />)}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm italic">"{review.reviewText}"</p>
                  </div>
                )) : (
                  <p className="text-slate-400 text-center py-4">No reviews yet for this lawyer.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 sticky top-24">
              <div className="text-center mb-8">
                <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">Consultation Fee</p>
                <p className="text-5xl font-bold text-primary-600">₹{lawyer.consultationFee}</p>
                <p className="text-slate-400 text-sm mt-2">Per 30 min session</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <HiOutlineVideoCamera className="text-primary-500 w-5 h-5 flex-shrink-0" />
                  <span>Secure Video Consultation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <HiOutlineChatAlt className="text-primary-500 w-5 h-5 flex-shrink-0" />
                  <span>Real-time Chat Consultation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <HiCalendar className="text-primary-500 w-5 h-5 flex-shrink-0" />
                  <span>Instant or Scheduled Booking</span>
                </div>
              </div>

              {user?.role === 'lawyer' ? (
                <div className="bg-slate-50 p-4 rounded-xl text-center text-sm text-slate-500 italic">
                  Lawyers cannot book other lawyers.
                </div>
              ) : (
                <Link 
                  to={`/booking/${lawyer.user._id}`}
                  className="w-full block bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-500/20 text-center transition-all transform hover:-translate-y-1"
                >
                  Book Consultation Now
                </Link>
              )}
              
              <p className="text-[10px] text-slate-400 text-center mt-6 uppercase leading-relaxed font-bold">
                🔒 Protected by End-to-End Encryption <br /> & 100% Satisfaction Guarantee
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const QuickInfo = ({ label, value }) => (
  <div className="text-center">
    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">{label}</p>
    <p className="text-lg font-bold text-slate-900">{value}</p>
  </div>
);

const HiOutlineVideoCamera = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 7l-7 5 7 5V7z"></path>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

const HiOutlineChatAlt = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default LawyerProfile;
