import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Cpu,
  Shield,
  Edit2,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { endpointService, aiService } from '@/services/apiService';
import toast from 'react-hot-toast';
import MainLayout from '@/layouts/MainLayout';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { currentProjectId } = useSelector((state) => state.project);

  const [endpoints, setEndpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    method: 'GET',
    url: '',
    description: '',
  });

  // Security analysis states
  const [securityAnalysis, setSecurityAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  useEffect(() => {
    if (currentProjectId) {
      loadEndpoints();
      setSecurityAnalysis(null);
      setShowSecurityPanel(false);
    } else {
      setEndpoints([]);
    }
  }, [currentProjectId]);

  const loadEndpoints = async () => {
    try {
      setIsLoading(true);
      const data = await endpointService.getByProject(currentProjectId);
      setEndpoints(data);
    } catch (error) {
      toast.error(error || 'Failed to load endpoints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Name and URL are required');
      return;
    }

    try {
      const newEndpoint = await endpointService.create({
        ...form,
        projectId: currentProjectId,
        headers: {},
        queryParams: {},
        body: null,
      });
      setEndpoints([newEndpoint, ...endpoints]);
      toast.success('Endpoint created successfully!');
      setShowForm(false);
      setForm({ name: '', method: 'GET', url: '', description: '' });
    } catch (error) {
      toast.error(error || 'Failed to create endpoint');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this endpoint?')) return;
    try {
      await endpointService.delete(id);
      setEndpoints(endpoints.filter((e) => e.id !== id));
      toast.success('Endpoint deleted');
    } catch (error) {
      toast.error(error || 'Failed to delete endpoint');
    }
  };

  const generateTestsForEndpoint = async (endpointId) => {
    const loadingToast = toast.loading('Gemini is generating test cases...');
    try {
      const result = await aiService.generateTests(endpointId, currentProjectId, 4);
      toast.dismiss(loadingToast);
      toast.success(result.message || 'Test cases generated successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error || 'Failed to generate test cases');
    }
  };

  const handleRunSecurityAnalysis = async () => {
    setIsAnalyzing(true);
    const loadingToast = toast.loading('Gemini is scanning endpoints for vulnerabilities...');
    try {
      const result = await aiService.analyzeSecurity(currentProjectId);
      setSecurityAnalysis(result);
      setShowSecurityPanel(true);
      toast.dismiss(loadingToast);
      toast.success('Security scan completed!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error || 'Security scan failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      {!currentProjectId ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-[#aab6c6] gap-4">
          <FolderOpen className="w-16 h-16 text-[#63b3ff] opacity-40 animate-pulse" />
          <h2 className="text-xl font-bold">No Project Selected</h2>
          <p className="text-sm max-w-md text-center opacity-70">
            Please select an existing project or create a new project in the top navigation bar to access the Collections.
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#e6ebf2]">API Collections</h2>
              <p className="text-xs text-[#aab6c6]">
                Manage endpoints, scan project security, and run AI test generations
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRunSecurityAnalysis}
                disabled={isAnalyzing || endpoints.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-900/40 text-emerald-400 text-xs font-semibold rounded-lg transition disabled:opacity-40"
              >
                <Shield className="w-3.5 h-3.5" />
                Security Scan
              </button>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] text-xs font-bold rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Endpoint
              </button>
            </div>
          </div>

          {/* Security Analysis Display */}
          {showSecurityPanel && securityAnalysis && (
            <div className="bg-[#0f1419] border border-[#2d3748] rounded-xl overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-200">
              <div
                className="p-4 bg-[#141a24] border-b border-[#2d3748] flex items-center justify-between cursor-pointer"
                onClick={() => setShowSecurityPanel(!showSecurityPanel)}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e6ebf2]">
                    AI Security Scan Results
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#aab6c6]">Security Score:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        securityAnalysis.securityScore >= 80
                          ? 'bg-green-950/20 text-green-400'
                          : securityAnalysis.securityScore >= 50
                          ? 'bg-amber-950/20 text-amber-400'
                          : 'bg-red-950/20 text-red-400'
                      }`}
                    >
                      {securityAnalysis.securityScore}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#aab6c6]">Issues Found:</span>
                    <span className="font-bold text-red-400">
                      {securityAnalysis.vulnerabilityCount}
                    </span>
                  </div>
                  {showSecurityPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {securityAnalysis.vulnerabilities.length === 0 ? (
                  <p className="text-xs text-green-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> No vulnerabilities detected by AI. Great job!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {securityAnalysis.vulnerabilities.map((v, idx) => (
                      <div
                        key={idx}
                        className="bg-[#141a24] border border-[#2d3748] rounded-lg p-3 flex gap-3 items-start"
                      >
                        <div className="p-1.5 rounded-lg bg-red-950/30 border border-red-900/30 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#e6ebf2]">{v.issue}</span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 rounded ${
                                v.severity === 'high'
                                  ? 'bg-red-950/20 text-red-400 border border-red-900/40'
                                  : v.severity === 'medium'
                                  ? 'bg-amber-950/20 text-amber-400 border border-amber-900/40'
                                  : 'bg-blue-950/20 text-blue-400 border border-blue-900/40'
                              }`}
                            >
                              {v.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#aab6c6]">
                            <span className="font-semibold">Endpoint:</span> {v.endpoint}
                          </p>
                          <p className="text-[11px] text-[#aab6c6]">
                            <span className="font-semibold text-emerald-400">Recommendation:</span> {v.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="bg-[#0f1419] border border-[#2d3748] rounded-xl p-5 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-150"
            >
              <h3 className="text-sm font-bold text-[#e6ebf2]">Create New Endpoint</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                    Endpoint Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. List Products, Create Invoice"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs text-[#e6ebf2] outline-none focus:border-[#63b3ff] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                    Path / URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /products or https://api.stripe.com/v1/charges"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs text-[#e6ebf2] outline-none focus:border-[#63b3ff] transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                    HTTP Method
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs text-[#63b3ff] outline-none font-semibold cursor-pointer"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#aab6c6] mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Briefly describe what this endpoint does..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs text-[#e6ebf2] outline-none focus:border-[#63b3ff] transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-[#1a1f2e] hover:bg-[#252d3d] border border-[#2d3748] rounded-lg text-xs text-[#e6ebf2] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] rounded-lg text-xs font-bold transition"
                >
                  Create Endpoint
                </button>
              </div>
            </form>
          )}

          {/* Endpoints List */}
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center text-xs py-12 text-[#aab6c6] animate-pulse">
                Loading endpoints list...
              </div>
            )}

            {!isLoading && endpoints.length === 0 && (
              <div className="text-center bg-[#0f1419]/50 border border-[#1f2937] rounded-xl py-16 px-4">
                <p className="text-sm text-[#aab6c6] mb-2 font-medium">No Endpoints Registered</p>
                <p className="text-xs text-[#aab6c6]/60 mb-4 max-w-sm mx-auto">
                  Create your first API endpoint to start editing headers, query parameters, request bodies, running tests, or doing security scans.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-[#1a1f2e] hover:bg-[#252d3d] border border-[#2d3748] rounded-lg text-xs text-[#63b3ff] font-semibold transition"
                >
                  Create Endpoint
                </button>
              </div>
            )}

            {endpoints.map((endpoint) => {
              const methodColors = {
                GET: 'text-blue-400 bg-blue-950/20 border-blue-900/40',
                POST: 'text-green-400 bg-green-950/20 border-green-900/40',
                PUT: 'text-amber-400 bg-amber-950/20 border-amber-900/40',
                PATCH: 'text-purple-400 bg-purple-950/20 border-purple-900/40',
                DELETE: 'text-red-400 bg-red-950/20 border-red-900/40',
              };

              return (
                <div
                  key={endpoint.id}
                  className="bg-[#0f1419] border border-[#1f2937] hover:border-[#2d3748] rounded-xl p-4 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          methodColors[endpoint.method] || 'text-[#aab6c6] border-[#1f2937]'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <h3 className="text-sm font-bold text-[#e6ebf2] truncate">{endpoint.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#aab6c6] font-mono">
                      <span className="truncate">{endpoint.url}</span>
                    </div>
                    {endpoint.description && (
                      <p className="text-xs text-[#aab6c6]/80 mt-2 line-clamp-2">
                        {endpoint.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-[#1f2937] pt-3 md:pt-0">
                    <button
                      onClick={() => navigate(`/builder?id=${endpoint.id}`)}
                      className="p-2 hover:bg-[#1a1f2e] text-[#63b3ff] hover:text-[#7fbfff] rounded-lg transition"
                      title="Open in Builder"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => generateTestsForEndpoint(endpoint.id)}
                      className="p-2 hover:bg-[#1a1f2e] text-[#63b3ff] hover:text-[#7fbfff] rounded-lg transition flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2"
                      title="Generate AI Test Cases"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>AI Tests</span>
                    </button>

                    <button
                      onClick={() => handleDelete(endpoint.id)}
                      className="p-2 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg transition"
                      title="Delete Endpoint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
