import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Package, AlertTriangle, 
  DollarSign, Loader2, Download, Filter 
} from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#3b82f6', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/reports/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Dashboard Overview</h1>
          <p className="text-stone-500 mt-1">Real-time insights for CoolHouse Ice Cream Shop</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`₹${stats.summary.totalSales.toLocaleString()}`} 
          icon={DollarSign} 
          color="rose"
          trend="+12.5%"
        />
        <StatCard 
          title="Net Profit" 
          value={`₹${stats.summary.netProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="emerald"
          trend="+8.2%"
        />
        <StatCard 
          title="Stock Remaining" 
          value={stats.summary.stockRemaining} 
          icon={Package} 
          color="amber"
        />
        <StatCard 
          title="Out of Stock" 
          value={stats.summary.outOfStock} 
          icon={AlertTriangle} 
          color="stone"
          isAlert={stats.summary.outOfStock > 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-stone-100 shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Daily Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Sold Flavors */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-stone-100 shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Most Sold Flavors</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.mostSold}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total_sold"
                  nameKey="flavor_name"
                >
                  {stats.mostSold.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.mostSold.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                <span className="text-sm text-stone-600">{entry.flavor_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rush Hours */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-stone-100 shadow-sm">
        <h3 className="text-xl font-bold text-stone-900 mb-6">Rush Hours Analysis</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.rushHours}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, isAlert }) => {
  const colors = {
    rose: 'bg-rose-50 text-rose-500',
    emerald: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
    stone: 'bg-stone-50 text-stone-500'
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-stone-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <h4 className="text-stone-500 text-sm font-medium">{title}</h4>
      <p className={`text-2xl font-bold mt-1 ${isAlert ? 'text-rose-500' : 'text-stone-900'}`}>{value}</p>
    </motion.div>
  );
};

export default AdminDashboard;
