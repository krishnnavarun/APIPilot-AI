import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/redux/authSlice';
import { Menu, X, LogOut, Home, Zap, Settings } from 'lucide-react';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'API Builder', icon: Zap, href: '/builder' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#090b10] text-[#e6ebf2]">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0f1419] border-r border-[#1f2937] transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2937]">
          {sidebarOpen && (
            <div className="text-sm font-bold tracking-wider text-[#63b3ff]">
              APIPilot
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-[#1a1f2e] rounded-lg transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#1a1f2e] transition text-[#aab6c6] hover:text-[#e6ebf2]"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.name}</span>}
            </a>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#1f2937]">
          {sidebarOpen && user && (
            <div className="mb-4">
              <p className="text-xs text-[#aab6c6]">Signed in as</p>
              <p className="text-sm font-medium truncate">{user.fullName || user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-[#0f1419] border-b border-[#1f2937] flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="text-sm text-[#aab6c6]">{user?.email}</div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
