import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, LayoutDashboard, Database, FileText, User, IceCream } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-stone-50 relative overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=1920&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-stone-200 flex flex-col z-10">
        <div className="p-6 flex items-center gap-2 text-rose-500">
          <IceCream className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">CoolHouse</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {user?.role === 'admin' ? (
            <>
              <Link to="/dashboard/main" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/dashboard/inventory" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
                <Database className="w-5 h-5" />
                <span>Inventory</span>
              </Link>
              <Link to="/dashboard/reports" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </Link>
            </>
          ) : (
            <Link to="/dashboard/worker" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
              <Database className="w-5 h-5" />
              <span>Data Entry</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{user?.name}</p>
              <p className="text-xs text-stone-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
