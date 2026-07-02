import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/redux/authSlice';
import {
  fetchWorkspaces,
  fetchProjects,
  selectWorkspace,
  selectProject,
} from '@/redux/projectSlice';
import workspaceService from '@/services/workspaceService';
import projectService from '@/services/projectService';
import {
  Menu,
  X,
  LogOut,
  Home,
  Zap,
  List,
  Play,
  Briefcase,
  Folder,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { workspaces, projects, currentWorkspaceId, currentProjectId } = useSelector(
    (state) => state.project
  );

  // Modals state
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectBaseUrl, setNewProjectBaseUrl] = useState('https://api.example.com');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch workspaces on user load
  useEffect(() => {
    if (user) {
      dispatch(fetchWorkspaces());
    }
  }, [user, dispatch]);

  // Fetch projects when workspace changes
  useEffect(() => {
    if (currentWorkspaceId) {
      dispatch(fetchProjects(currentWorkspaceId));
    }
  }, [currentWorkspaceId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'API Builder', icon: Zap, href: '/builder' },
    { name: 'Collections', icon: List, href: '/collections' },
    { name: 'Test Runner', icon: Play, href: '/runner' },
  ];

  const handleWorkspaceChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      setShowWorkspaceModal(true);
    } else {
      dispatch(selectWorkspace(val || null));
    }
  };

  const handleProjectChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      if (!currentWorkspaceId) {
        toast.error('Please select or create a workspace first');
        return;
      }
      setShowProjectModal(true);
    } else {
      dispatch(selectProject(val || null));
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsSubmitting(true);
    try {
      const workspace = await workspaceService.create({
        name: newWorkspaceName,
        description: newWorkspaceDesc,
      });
      toast.success('Workspace created successfully!');
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
      setShowWorkspaceModal(false);
      
      // Refresh workspaces list and select the new one
      await dispatch(fetchWorkspaces());
      dispatch(selectWorkspace(workspace.id));
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectBaseUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const project = await projectService.create({
        name: newProjectName,
        description: newProjectDesc,
        baseUrl: newProjectBaseUrl,
        workspaceId: currentWorkspaceId,
      });
      toast.success('Project created successfully!');
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectBaseUrl('https://api.example.com');
      setShowProjectModal(false);

      // Refresh projects list and select the new one
      await dispatch(fetchProjects(currentWorkspaceId));
      dispatch(selectProject(project.id));
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get active title based on path
  const currentNav = navItems.find((item) => item.href === location.pathname);
  const pageTitle = currentNav ? currentNav.name : 'APIPilot AI';

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
            <div className="text-sm font-bold tracking-wider text-[#63b3ff] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#63b3ff] fill-[#63b3ff]/20 animate-pulse" />
              APIPilot AI
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-[#1a1f2e] rounded-lg transition text-[#aab6c6] hover:text-[#e6ebf2]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#1a1f2e] border-l-2 border-[#63b3ff] text-[#63b3ff] font-medium'
                    : 'text-[#aab6c6] hover:text-[#e6ebf2] hover:bg-[#131922]'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#63b3ff]' : ''}`} />
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-[#1f2937] bg-[#0c1014]">
          {sidebarOpen && user && (
            <div className="mb-3 px-2">
              <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Signed in as</p>
              <p className="text-xs font-semibold truncate text-[#e6ebf2]">{user.fullName || user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-800/30 rounded-lg text-red-400 text-xs transition font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-[#0f1419] border-b border-[#1f2937] flex items-center justify-between px-6">
          <h1 className="text-lg font-bold text-[#e6ebf2]">{pageTitle}</h1>

          {/* Workspace and Project Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Workspace Selector */}
            <div className="flex items-center gap-1.5 bg-[#141a24] border border-[#2d3748] rounded-md px-2 py-1 text-xs">
              <Briefcase className="w-3.5 h-3.5 text-[#63b3ff]" />
              <select
                value={currentWorkspaceId || ''}
                onChange={handleWorkspaceChange}
                className="bg-transparent text-[#e6ebf2] outline-none font-medium pr-2 cursor-pointer max-w-[150px]"
              >
                <option value="" className="bg-[#0f1419]">Select Workspace</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#0f1419]">
                    {w.name}
                  </option>
                ))}
                <option value="__new__" className="bg-[#0f1419] text-[#63b3ff] font-semibold">
                  + Create Workspace
                </option>
              </select>
            </div>

            {/* Project Selector */}
            <div className="flex items-center gap-1.5 bg-[#141a24] border border-[#2d3748] rounded-md px-2 py-1 text-xs">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={currentProjectId || ''}
                onChange={handleProjectChange}
                disabled={!currentWorkspaceId}
                className="bg-transparent text-[#e6ebf2] outline-none font-medium pr-2 cursor-pointer disabled:opacity-50 max-w-[150px]"
              >
                <option value="" className="bg-[#0f1419]">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0f1419]">
                    {p.name}
                  </option>
                ))}
                {currentWorkspaceId && (
                  <option value="__new__" className="bg-[#0f1419] text-amber-400 font-semibold">
                    + Create Project
                  </option>
                )}
              </select>
            </div>

            <div className="h-6 w-[1px] bg-[#1f2937]"></div>
            <div className="text-xs text-[#aab6c6] font-mono hidden md:block">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#090b10] mesh">
          {children}
        </div>
      </div>

      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f1419] border border-[#2d3748] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e6ebf2]">Create New Workspace</h3>
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="p-1 hover:bg-[#1a1f2e] rounded-lg text-[#aab6c6] hover:text-[#e6ebf2] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Startup, Personal API Dev"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe your workspace"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="flex-1 px-4 py-2 bg-[#1a1f2e] hover:bg-[#252d3d] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWorkspaceName.trim()}
                  className="flex-1 px-4 py-2 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] rounded-lg text-sm font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f1419] border border-[#2d3748] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e6ebf2]">Create New Project</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-1 hover:bg-[#1a1f2e] rounded-lg text-[#aab6c6] hover:text-[#e6ebf2] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentication Service, Stripe Webhooks"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://api.example.com"
                  value={newProjectBaseUrl}
                  onChange={(e) => setNewProjectBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe your project"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 px-4 py-2 bg-[#1a1f2e] hover:bg-[#252d3d] border border-[#2d3748] rounded-lg text-sm text-[#e6ebf2] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newProjectName.trim() || !newProjectBaseUrl.trim()}
                  className="flex-1 px-4 py-2 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] rounded-lg text-sm font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
