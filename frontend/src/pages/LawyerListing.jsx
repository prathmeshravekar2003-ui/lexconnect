import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineFilter, HiStar, HiOutlineLocationMarker, HiOutlineTranslate, HiOutlineBriefcase } from 'react-icons/hi';
import api from '../services/api';

const LawyerListing = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    experience: '',
    language: '',
    sort: 'rating'
  });

  const specializations = [
    'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
    'Tax Law', 'Property Law', 'Labour Law', 'Immigration Law'
  ];

  const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu'];

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/lawyers?${queryParams}`);
      setLawyers(response.data.lawyers);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchLawyers();
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-serif mb-2">Find Your Legal Expert</h1>
            <p className="text-slate-500">Search from thousands of verified lawyers worldwide.</p>
          </div>
          
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search by name or keyword..."
              className="bg-transparent border-none focus:ring-0 px-4 py-2 w-full md:w-64"
            />
            <button className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-colors">
              <HiOutlineSearch className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <HiOutlineFilter className="text-primary-600 w-5 h-5" />
                <h3 className="font-bold">Filters</h3>
              </div>

              <form onSubmit={applyFilters} className="space-y-6">
                <FilterGroup label="Specialization">
                  <select name="specialization" onChange={handleFilterChange} className="filter-select">
                    <option value="">All Specializations</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Price Range (INR)">
                  <div className="flex gap-2">
                    <input name="minPrice" placeholder="Min" onChange={handleFilterChange} className="filter-input" />
                    <input name="maxPrice" placeholder="Max" onChange={handleFilterChange} className="filter-input" />
                  </div>
                </FilterGroup>

                <FilterGroup label="Min Experience (Years)">
                  <input type="number" name="experience" onChange={handleFilterChange} className="filter-input" placeholder="e.g. 5" />
                </FilterGroup>

                <FilterGroup label="Language">
                  <select name="language" onChange={handleFilterChange} className="filter-select">
                    <option value="">Any Language</option>
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Sort By">
                  <select name="sort" onChange={handleFilterChange} className="filter-select">
                    <option value="rating">Top Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="experience">Experience</option>
                  </select>
                </FilterGroup>

                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all">
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Lawyer Cards Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : lawyers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lawyers.map(lawyer => (
                  <LawyerCard key={lawyer._id} lawyer={lawyer} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-3xl text-center border border-dashed border-slate-300">
                <p className="text-slate-400 text-lg">No lawyers found matching your criteria.</p>
                <button onClick={() => setFilters({})} className="mt-4 text-primary-600 font-bold hover:underline">Clear all filters</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const LawyerCard = ({ lawyer }) => {
  const lawyerUser = lawyer?.user || {};
  
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-primary-600/5 transition-all group flex flex-col h-full">
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <img 
            src={lawyerUser.avatar || 'https://via.placeholder.com/150'} 
            alt={lawyerUser.name || 'Lawyer'} 
            className="w-20 h-20 rounded-2xl object-cover"
          />
          {lawyerUser.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{lawyerUser.name || 'Anonymous Lawyer'}</h3>
            {lawyer.isTopRated && <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Top Rated</span>}
          </div>
          <p className="text-primary-600 text-sm font-medium mb-2">{lawyer.specialization?.[0] || 'Legal Expert'}</p>
          <div className="flex items-center gap-1 text-amber-500">
            <HiStar className="w-4 h-4" />
            <span className="text-slate-900 font-bold text-sm">{lawyer.averageRating || 0}</span>
            <span className="text-slate-400 text-xs font-normal">({lawyer.totalReviews || 0} reviews)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8 flex-grow">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <HiOutlineBriefcase className="w-4 h-4" />
          <span>{lawyer.experience || 0} years experience</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <HiOutlineTranslate className="w-4 h-4" />
          <span>{lawyer.languages?.slice(0, 2).join(', ') || 'English'}{lawyer.languages?.length > 2 && '...'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <HiOutlineLocationMarker className="w-4 h-4" />
          <span>{lawyer.location?.city || 'Remote'}, {lawyer.location?.state || 'India'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Starts from</p>
          <p className="text-xl font-bold text-slate-900">₹{lawyer.consultationFee || 0}</p>
        </div>
        <Link 
          to={`/lawyer/${lawyerUser._id}`} 
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-600 transition-all"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse">
    <div className="flex gap-4 mb-6">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl"></div>
      <div className="space-y-2 flex-grow">
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
      </div>
    </div>
    <div className="space-y-3 mb-8">
      <div className="h-3 bg-slate-100 rounded w-full"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
    <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
  </div>
);

export default LawyerListing;
