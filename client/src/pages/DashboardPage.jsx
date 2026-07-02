import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import {
  Activity,
  Users,
  Zap,
  TrendingUp,
  Plus,
  Trash2,
  ArrowRight,
  Briefcase,
  Folder,
} from 'lucide-react';
import { endpointService, testCaseService } from '@/services/apiService';
import workspaceService from '@/services/workspaceService';
import projectService from '@/services/projectService';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentWorkspaceId, currentProjectId, workspaces } = useSelector(
    (state) => state.project
  );

  const [apiCount, setApiCount] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const [workspaceDetails, setWorkspaceDetails] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  
  // Member invite inputs
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (currentProjectId) {
      fetchCounts();
    } else {
      setApiCount(0);
      setTestCount(0);
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchWorkspaceInfo();
    } else {
      setWorkspaceDetails(null);
      setProjectsList([]);
    }
  }, [currentWorkspaceId]);

  const fetchCounts = async () => {
    try {
      const endpoints = await endpointService.getByProject(currentProjectId);
      setApiCount(endpoints.length);
      const tests = await testCaseService.getByProject(currentProjectId);
      setTestCount(tests.length);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchWorkspaceInfo = async () => {
    try {
      const ws = await workspaceService.getById(currentWorkspaceId);
      setWorkspaceDetails(ws);
      const projs = await projectService.getByWorkspace(currentWorkspaceId);
      setProjectsList(projs);
    } catch (err) {
      console.error('Failed to fetch workspace info:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteUserId.trim()) return;

    setIsInviting(true);
    try {
      await workspaceService.addMember(currentWorkspaceId, inviteUserId.trim(), inviteRole);
      toast.success('Member added to workspace!');
      setInviteUserId('');
      fetchWorkspaceInfo();
    } catch (err) {
      toast.error(err || 'Failed to add member. Make sure User ID is correct.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the workspace?')) return;
    try {
      await workspaceService.removeMember(currentWorkspaceId, memberId);
      toast.success('Member removed');
      fetchWorkspaceInfo();
    } catch (err) {
      toast.error(err || 'Failed to remove member');
    }
  };

  const currentWorkspaceName = workspaces.find(w => w.id === currentWorkspaceId)?.name || 'Selected Workspace';

  const stats = [
    { label: 'Total APIs', value: String(apiCount), icon: Zap, color: 'text-blue-400' },
    { label: 'Test Cases', value: String(testCount), icon: Activity, color: 'text-green-400' },
    {
      label: 'Team Members',
      value: workspaceDetails ? String(workspaceDetails.members?.length || 1) : '1',
      icon: Users,
      color: 'text-purple-400',
    },
    { label: 'Uptime', value: '100%', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-extrabold mb-1">
            Welcome back, {user?.fullName || 'User'}
          </h2>
          <p className="text-xs text-[#aab6c6]">
            Manage, execute, test, and secure your API collections under{' '}
            <span className="text-[#63b3ff] font-semibold">{currentWorkspaceName}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0f1419] border border-[#1f2937] rounded-xl p-5 hover:border-[#63b3ff]/30 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#aab6c6] text-xs font-semibold uppercase tracking-wider">
                  {stat.label}
                </h3>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-[#e6ebf2]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Split Section: Workspace details & Quick Start */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Start Card */}
          <div className="lg:col-span-1 bg-[#0f1419] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#e6ebf2] mb-4 uppercase tracking-wider">
                Quick Start
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/collections')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#141a24] border border-[#2d3748] hover:bg-[#1a2333] hover:border-[#63b3ff]/30 rounded-lg text-left text-xs text-[#aab6c6] hover:text-[#e6ebf2] transition font-medium"
                >
                  <span>Create or view endpoints</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#63b3ff]" />
                </button>
                <button
                  onClick={() => navigate('/builder')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#141a24] border border-[#2d3748] hover:bg-[#1a2333] hover:border-[#63b3ff]/30 rounded-lg text-left text-xs text-[#aab6c6] hover:text-[#e6ebf2] transition font-medium"
                >
                  <span>Open API Builder console</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  onClick={() => navigate('/runner')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#141a24] border border-[#2d3748] hover:bg-[#1a2333] hover:border-[#63b3ff]/30 rounded-lg text-left text-xs text-[#aab6c6] hover:text-[#e6ebf2] transition font-medium"
                >
                  <span>Run configured assertions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-green-400" />
                </button>
              </div>
            </div>

            {/* Current project info */}
            {currentProjectId && (
              <div className="mt-6 pt-4 border-t border-[#1f2937] text-xs text-[#aab6c6]/80 space-y-1 bg-[#141a24]/30 p-3 rounded-lg border">
                <p className="font-bold text-[#63b3ff]">Active Project Context</p>
                <p>
                  ID: <span className="font-mono text-[10px]">{currentProjectId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Team Members List */}
          <div className="lg:col-span-1 bg-[#0f1419] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#e6ebf2] mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                Team Members
              </h3>
              
              {!currentWorkspaceId ? (
                <p className="text-xs text-[#aab6c6]/50 text-center py-8">
                  Select a workspace to view members
                </p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {workspaceDetails?.members?.map((m) => {
                    const isOwner = workspaceDetails.owner?._id === m.user?._id;
                    return (
                      <div
                        key={m.user?._id || m._id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#141a24] text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#e6ebf2] truncate">
                            {m.user?.fullName || 'Active User'}
                          </p>
                          <p className="text-[10px] text-[#aab6c6] truncate">
                            {m.user?.email || 'user@apipilot.ai'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1a1f2e] text-[#aab6c6]">
                            {isOwner ? 'Owner' : m.role}
                          </span>
                          {!isOwner && workspaceDetails.owner?._id === user?.id && (
                            <button
                              onClick={() => handleRemoveMember(m.user?._id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Remove member"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Invite input form */}
            {currentWorkspaceId && workspaceDetails?.owner?._id === user?.id && (
              <form onSubmit={handleAddMember} className="mt-4 pt-4 border-t border-[#1f2937] space-y-2">
                <p className="text-[10px] font-semibold text-[#aab6c6]">Add Workspace Member (ID)</p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="User MongoDB ID"
                    value={inviteUserId}
                    onChange={(e) => setInviteUserId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-[#141a24] border border-[#2d3748] rounded-md text-xs text-[#e6ebf2] outline-none"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-[#141a24] border border-[#2d3748] text-[#aab6c6] text-[10px] rounded px-1"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] rounded p-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Projects lists under workspace */}
          <div className="lg:col-span-1 bg-[#0f1419] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#e6ebf2] mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-amber-400" />
                Workspace Projects
              </h3>

              {!currentWorkspaceId ? (
                <p className="text-xs text-[#aab6c6]/50 text-center py-8">
                  Select a workspace to view projects
                </p>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {projectsList.length === 0 && (
                    <p className="text-xs text-[#aab6c6]/50 text-center py-4">No projects yet</p>
                  )}
                  {projectsList.map((p) => {
                    const isActive = p.id === currentProjectId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/collections`)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isActive
                            ? 'bg-[#1a1f2e] border-[#63b3ff]/30 text-[#e6ebf2]'
                            : 'bg-[#141a24]/50 border-[#2d3748] text-[#aab6c6] hover:text-[#e6ebf2]'
                        }`}
                      >
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-[10px] text-[#aab6c6]/80 truncate mt-1">
                          Base: {p.baseUrl}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
