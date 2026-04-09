import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineUserGroup, HiOutlineScale, HiOutlineCash, 
  HiOutlineShieldCheck, HiOutlineDotsVertical, HiOutlineSearch
} from 'react-icons/hi';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0,
    totalConsultations: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // In a real app, these would be dedicated admin endpoints
      // For this demo, we'll simulate some stats and fetch users
      const usersRes = await api.get('/auth/me'); // Placeholder for actual admin list endpoint
      setStats({
        totalUsers: 1240,
        totalLawyers: 85,
        totalConsultations: 3420,
        totalRevenue: 542000
      });
      // Mocking a list of users/lawyers for admin to manage
      setUsers([
        { id: 1, name: 'Adv. Sarah Khan', email: 'sarah@lex.com', role: 'lawyer', status: 'verified', joined: '2026-03-12' },
        { id: 2, name: 'John Doe', email: 'john@gmail.com', role: 'client', status: 'active', joined: '2026-04-01' },
        { id: 3, name: 'Adv. Rajesh Kumar', email: 'rajesh@lex.com', role: 'lawyer', status: 'pending', joined: '2026-04-08' },
        { id: 4, name: 'Priya Sharma', email: 'priya@outlook.com', role: 'client', status: 'active', joined: '2026-04-09' },
      ]);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-1">Admin Control Panel</h1>
            <p className="text-slate-500 text-sm">Overview of platform performance and user management.</p>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search users, case IDs..."
              className="bg-transparent border-none focus:ring-0 px-4 py-2 w-full md:w-64"
            />
            <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-colors">
              <HiOutlineSearch className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <AdminStatCard icon={<HiOutlineUserGroup />} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
          <AdminStatCard icon={<HiOutlineScale />} label="Expert Lawyers" value={stats.totalLawyers} color="bg-purple-500" />
          <AdminStatCard icon={<HiOutlineDotsVertical />} label="Consultations" value={stats.totalConsultations} color="bg-amber-500" />
          <AdminStatCard icon={<HiOutlineCash />} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-bold">User Management</h3>
                <button className="text-primary-600 text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'lawyer' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'verified' ? 'bg-green-500' : u.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 capitalize">{u.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <HiOutlineDotsVertical />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Verification Requests Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <HiOutlineShieldCheck className="text-primary-600" />
                KYC Requests
              </h3>
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-50">
                  <p className="font-bold text-sm">Adv. Manoj Singh</p>
                  <p className="text-xs text-slate-400 mb-3">Criminal Law • 12 Years Exp.</p>
                  <div className="flex gap-2">
                    <button className="flex-grow bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-black transition-all">Review Docs</button>
                    <button className="px-4 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50">Ignore</button>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-sm">Adv. Elena Gilbert</p>
                  <p className="text-xs text-slate-400 mb-3">Civil Law • 4 Years Exp.</p>
                  <div className="flex gap-2">
                    <button className="flex-grow bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-black transition-all">Review Docs</button>
                    <button className="px-4 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50">Ignore</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px]"></div>
              <h4 className="font-bold mb-2">Platform Health</h4>
              <p className="text-primary-100 text-xs leading-relaxed mb-6">Database, Socket, and API servers are all healthy.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-200">Uptime</p>
                  <p className="font-bold text-lg">99.9%</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-200">Errors</p>
                  <p className="font-bold text-lg">0.02%</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all">
    <div className={`${color} p-4 rounded-2xl text-white text-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
