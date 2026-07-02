import { useSelector } from 'react-redux';
import MainLayout from '@/layouts/MainLayout';
import { Activity, Users, Zap, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    { label: 'Total APIs', value: '0', icon: Zap, color: 'text-blue-400' },
    { label: 'Test Cases', value: '0', icon: Activity, color: 'text-green-400' },
    { label: 'Team Members', value: '1', icon: Users, color: 'text-purple-400' },
    { label: 'Uptime', value: '100%', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <MainLayout>
      <div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName || 'User'}</h2>
          <p className="text-[#aab6c6]">
            Here's what's happening with your APIs today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0f1419] border border-[#1f2937] rounded-lg p-6 hover:border-[#63b3ff]/50 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#aab6c6] text-sm font-medium">{stat.label}</h3>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0f1419] border border-[#1f2937] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-[#1a1f2e] hover:bg-[#252d3d] rounded-lg transition text-[#63b3ff] text-sm">
              → Create your first API
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#1a1f2e] hover:bg-[#252d3d] rounded-lg transition text-[#63b3ff] text-sm">
              → Invite team members
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#1a1f2e] hover:bg-[#252d3d] rounded-lg transition text-[#63b3ff] text-sm">
              → Read the documentation
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
