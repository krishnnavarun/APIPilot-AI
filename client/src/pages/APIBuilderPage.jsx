import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Save,
  Plus,
  Trash2,
  FolderOpen,
  Send,
  Cpu,
  Bookmark,
  CheckCircle,
  FileCode,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { endpointService, aiService, testCaseService } from '@/services/apiService';
import MainLayout from '@/layouts/MainLayout';

export default function APIBuilderPage() {
  const [searchParams] = useSearchParams();
  const { currentProjectId } = useSelector((state) => state.project);

  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isCreatingTestCase, setIsCreatingTestCase] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('{}');
  const [bodyType, setBodyType] = useState('json');

  // Response console state
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('params');
  const [activeResTab, setActiveResTab] = useState('body');

  // Load endpoint list when project changes
  useEffect(() => {
    if (currentProjectId) {
      loadEndpoints();
    } else {
      setEndpoints([]);
      handleNew();
    }
  }, [currentProjectId]);

  // Handle URL query parameter ?id=... to load an endpoint directly
  useEffect(() => {
    const id = searchParams.get('id');
    if (id && endpoints.length > 0) {
      handleSelect(id);
    }
  }, [searchParams, endpoints]);

  const loadEndpoints = async () => {
    setIsLoadingList(true);
    try {
      const data = await endpointService.getByProject(currentProjectId);
      setEndpoints(data);
    } catch (err) {
      toast.error(err || 'Failed to load endpoints');
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      const e = await endpointService.getById(id);
      setSelectedEndpointId(e.id);
      setName(e.name);
      setMethod(e.method);
      setUrl(e.url);
      setDescription(e.description || '');
      setBodyType(e.bodyType || 'json');
      setBody(e.body ? JSON.stringify(e.body, null, 2) : '{}');

      // Convert maps to key-value lists
      const rawHeaders = e.headers || {};
      const hList = Object.entries(rawHeaders).map(([key, value]) => ({ key, value }));
      setHeaders(hList.length > 0 ? hList : [{ key: '', value: '' }]);

      const rawParams = e.queryParams || {};
      const pList = Object.entries(rawParams).map(([key, value]) => ({ key, value }));
      setQueryParams(pList.length > 0 ? pList : [{ key: '', value: '' }]);

      setResponse(null);
    } catch (err) {
      toast.error(err || 'Failed to load endpoint details');
    }
  };

  const handleNew = () => {
    setSelectedEndpointId(null);
    setName('');
    setMethod('GET');
    setUrl('');
    setDescription('');
    setHeaders([{ key: '', value: '' }]);
    setQueryParams([{ key: '', value: '' }]);
    setBody('{}');
    setBodyType('json');
    setResponse(null);
  };

  // Helper conversions
  const listToObj = (list) => {
    const obj = {};
    list.forEach((item) => {
      if (item.key.trim()) {
        obj[item.key.trim()] = item.value;
      }
    });
    return obj;
  };

  const handleSave = async () => {
    if (!currentProjectId) {
      toast.error('Please select or create a project first');
      return;
    }
    if (!name.trim()) {
      toast.error('Endpoint name is required');
      return;
    }
    if (!url.trim()) {
      toast.error('Endpoint path or URL is required');
      return;
    }

    setIsSaving(true);
    let parsedBody = null;
    try {
      if (body && body.trim() !== '{}' && body.trim() !== '') {
        parsedBody = JSON.parse(body);
      }
    } catch (err) {
      toast.error('Invalid request body JSON format');
      setIsSaving(false);
      return;
    }

    const payload = {
      name,
      method,
      url,
      description,
      headers: listToObj(headers),
      queryParams: listToObj(queryParams),
      body: parsedBody,
      bodyType,
      projectId: currentProjectId,
    };

    try {
      if (selectedEndpointId) {
        await endpointService.update(selectedEndpointId, payload);
        toast.success('Endpoint updated successfully');
      } else {
        const newEndpoint = await endpointService.create(payload);
        setSelectedEndpointId(newEndpoint.id);
        toast.success('Endpoint created successfully');
      }
      loadEndpoints();
    } catch (err) {
      toast.error(err || 'Failed to save endpoint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedEndpointId) {
      toast.error('Please save the endpoint before executing it');
      return;
    }

    setIsExecuting(true);
    setResponse(null);

    try {
      const payload = {
        overrideHeaders: listToObj(headers),
        overrideQueryParams: listToObj(queryParams),
        overrideBody: body ? JSON.parse(body) : null,
      };

      const res = await endpointService.execute(selectedEndpointId, payload);
      setResponse(res.execution);
      setActiveResTab('body');
      toast.success('Request executed successfully!');
    } catch (err) {
      toast.error(err || 'Failed to execute endpoint');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGenerateMockData = async () => {
    if (!selectedEndpointId) {
      toast.error('Please save the endpoint first before generating AI mock data');
      return;
    }

    setIsAIGenerating(true);
    try {
      const res = await aiService.generateMockData(selectedEndpointId);
      setBody(JSON.stringify(res.mockData, null, 2));
      toast.success('Mock data generated with Gemini AI');
    } catch (err) {
      toast.error(err || 'Failed to generate mock data');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleCreateTestCase = async () => {
    if (!selectedEndpointId || !response) return;

    setIsCreatingTestCase(true);
    try {
      const tcPayload = {
        name: `Test: ${method} ${name} (Auto-created)`,
        description: `Verify that ${method} ${url} returns ${response.actualStatus}`,
        endpointId: selectedEndpointId,
        projectId: currentProjectId,
        requestHeaders: listToObj(headers),
        requestQueryParams: listToObj(queryParams),
        requestBody: body ? JSON.parse(body) : null,
        expectedStatus: response.actualStatus,
        expectedResponseBody: response.actualResponse,
        assertions: [
          {
            type: 'statusCode',
            operator: 'equals',
            expectedValue: String(response.actualStatus),
          },
          {
            type: 'responseTime',
            operator: 'lessThan',
            expectedValue: '3000', // 3 seconds timeout default
          },
        ],
      };

      await testCaseService.create(tcPayload);
      toast.success('Test case created and added to Test Runner!');
    } catch (err) {
      toast.error(err || 'Failed to create test case');
    } finally {
      setIsCreatingTestCase(false);
    }
  };

  // Row lists handlers
  const handleAddHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const handleRemoveHeader = (index) => {
    const list = [...headers];
    list.splice(index, 1);
    setHeaders(list.length > 0 ? list : [{ key: '', value: '' }]);
  };
  const handleHeaderChange = (index, field, val) => {
    const list = [...headers];
    list[index][field] = val;
    setHeaders(list);
  };

  const handleAddParam = () => setQueryParams([...queryParams, { key: '', value: '' }]);
  const handleRemoveParam = (index) => {
    const list = [...queryParams];
    list.splice(index, 1);
    setQueryParams(list.length > 0 ? list : [{ key: '', value: '' }]);
  };
  const handleParamChange = (index, field, val) => {
    const list = [...queryParams];
    list[index][field] = val;
    setQueryParams(list);
  };

  return (
    <MainLayout>
      {!currentProjectId ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-[#aab6c6] gap-4">
          <FolderOpen className="w-16 h-16 text-[#63b3ff] opacity-40 animate-pulse" />
          <h2 className="text-xl font-bold">No Project Selected</h2>
          <p className="text-sm max-w-md text-center opacity-70">
            Please select an existing project or create a new project in the top navigation bar to access the API Builder.
          </p>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* Endpoints Sidebar */}
          <div className="w-64 bg-[#0f1419]/90 border-r border-[#1f2937] flex flex-col">
            <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
              <h2 className="text-xs uppercase font-bold tracking-wider text-[#aab6c6]">
                Endpoints
              </h2>
              <button
                onClick={handleNew}
                className="p-1 hover:bg-[#1a1f2e] text-[#63b3ff] hover:text-[#7fbfff] rounded transition"
                title="Create New Endpoint"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingList && (
                <div className="text-center text-xs py-4 text-[#aab6c6]">Loading...</div>
              )}
              {!isLoadingList && endpoints.length === 0 && (
                <div className="text-center text-xs py-8 text-[#aab6c6]/50">
                  No endpoints yet
                </div>
              )}
              {endpoints.map((e) => {
                const methodColors = {
                  GET: 'text-blue-400 bg-blue-950/20 border-blue-900/40',
                  POST: 'text-green-400 bg-green-950/20 border-green-900/40',
                  PUT: 'text-amber-400 bg-amber-950/20 border-amber-900/40',
                  PATCH: 'text-purple-400 bg-purple-950/20 border-purple-900/40',
                  DELETE: 'text-red-400 bg-red-950/20 border-red-900/40',
                };
                const isSelected = selectedEndpointId === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => handleSelect(e.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs border transition ${
                      isSelected
                        ? 'bg-[#1a1f2e] border-[#63b3ff]/50 text-[#e6ebf2]'
                        : 'bg-transparent border-transparent hover:bg-[#131922] text-[#aab6c6]'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        methodColors[e.method] || 'text-[#aab6c6] border-[#1f2937]'
                      }`}
                    >
                      {e.method}
                    </span>
                    <span className="truncate flex-1 font-medium">{e.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main API Workspace Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#090b10]">
            {/* Action Bar */}
            <div className="p-4 bg-[#0f1419] border-b border-[#1f2937] flex flex-col md:flex-row gap-3">
              <div className="flex flex-1 gap-2 items-center">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs font-semibold text-[#63b3ff] outline-none cursor-pointer w-24"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>

                <input
                  type="text"
                  placeholder="e.g. /users or https://api.github.com/users"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs text-[#e6ebf2] outline-none focus:border-[#63b3ff] transition font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !selectedEndpointId}
                  className="px-4 py-2 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] text-xs font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isExecuting ? 'Sending...' : 'Send'}
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#141a24] hover:bg-[#1a2333] border border-[#2d3748] text-[#e6ebf2] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Config Workspace split grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
              {/* Left Config Panel */}
              <div className="border-r border-[#1f2937] flex flex-col overflow-hidden">
                {/* Meta details */}
                <div className="p-4 border-b border-[#1f2937] space-y-3 bg-[#0d1217]/50">
                  <input
                    type="text"
                    placeholder="Endpoint Display Name (e.g. Get User Profile)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#e6ebf2] outline-none placeholder:text-[#aab6c6]/40"
                  />
                  <input
                    type="text"
                    placeholder="Brief description of this endpoint..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#aab6c6] outline-none placeholder:text-[#aab6c6]/40"
                  />
                </div>

                {/* Tabs selection */}
                <div className="bg-[#0f1419]/50 border-b border-[#1f2937] flex px-4">
                  {['params', 'headers', 'body'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
                        activeTab === tab
                          ? 'border-[#63b3ff] text-[#63b3ff]'
                          : 'border-transparent text-[#aab6c6] hover:text-[#e6ebf2]'
                      }`}
                    >
                      {tab === 'params' ? 'Params' : tab === 'headers' ? 'Headers' : 'Body'}
                    </button>
                  ))}
                </div>

                {/* Config panel area */}
                <div className="flex-1 overflow-auto p-4">
                  {/* Query Params */}
                  {activeTab === 'params' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#aab6c6]">Query Parameters</span>
                        <button
                          onClick={handleAddParam}
                          className="text-xs text-[#63b3ff] hover:underline flex items-center gap-1"
                        >
                          + Add Row
                        </button>
                      </div>
                      {queryParams.map((p, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Parameter"
                            value={p.key}
                            onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs outline-none focus:border-[#63b3ff]"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={p.value}
                            onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs outline-none focus:border-[#63b3ff]"
                          />
                          <button
                            onClick={() => handleRemoveParam(idx)}
                            className="p-2 text-red-400 hover:bg-red-950/20 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Headers */}
                  {activeTab === 'headers' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#aab6c6]">Request Headers</span>
                        <button
                          onClick={handleAddHeader}
                          className="text-xs text-[#63b3ff] hover:underline flex items-center gap-1"
                        >
                          + Add Row
                        </button>
                      </div>
                      {headers.map((h, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Header"
                            value={h.key}
                            onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs outline-none focus:border-[#63b3ff]"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={h.value}
                            onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#141a24] border border-[#2d3748] rounded-lg text-xs outline-none focus:border-[#63b3ff]"
                          />
                          <button
                            onClick={() => handleRemoveHeader(idx)}
                            className="p-2 text-red-400 hover:bg-red-950/20 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Body Editor */}
                  {activeTab === 'body' && (
                    <div className="h-full flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#aab6c6]">JSON Request Body</span>
                        <button
                          onClick={handleGenerateMockData}
                          disabled={isAIGenerating || !selectedEndpointId}
                          className="text-xs bg-[#63b3ff]/10 hover:bg-[#63b3ff]/20 text-[#63b3ff] px-2 py-1 rounded border border-[#63b3ff]/20 flex items-center gap-1 font-semibold disabled:opacity-40 transition"
                        >
                          <Cpu className="w-3 h-3" />
                          {isAIGenerating ? 'Generating...' : 'AI Mock Body'}
                        </button>
                      </div>
                      <div className="flex-1 border border-[#2d3748] rounded-lg overflow-hidden h-[300px]">
                        <Editor
                          height="100%"
                          defaultLanguage="json"
                          theme="vs-dark"
                          value={body}
                          onChange={(val) => setBody(val || '')}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            fontFamily: 'Fira Code, monospace',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Response Panel */}
              <div className="flex flex-col overflow-hidden bg-[#0a0d15]/50">
                {/* Header detail */}
                <div className="p-4 border-b border-[#1f2937] flex items-center justify-between min-h-[57px] bg-[#0c1017]">
                  <span className="text-xs font-bold text-[#aab6c6] uppercase tracking-wider">
                    Response
                  </span>

                  {response && (
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${
                          response.actualStatus >= 200 && response.actualStatus < 300
                            ? 'bg-green-950/20 text-green-400 border-green-900/40'
                            : 'bg-red-950/20 text-red-400 border-red-900/40'
                        }`}
                      >
                        {response.actualStatus}
                      </span>
                      <span className="text-xs text-[#aab6c6] font-mono">
                        {response.duration} ms
                      </span>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="bg-[#0f1419]/30 border-b border-[#1f2937] flex px-4">
                  {['body', 'headers'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveResTab(tab)}
                      className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
                        activeResTab === tab
                          ? 'border-[#63b3ff] text-[#63b3ff]'
                          : 'border-transparent text-[#aab6c6] hover:text-[#e6ebf2]'
                      }`}
                    >
                      {tab === 'body' ? 'Response Body' : 'Headers'}
                    </button>
                  ))}
                </div>

                {/* Console content */}
                <div className="flex-1 overflow-auto p-4 flex flex-col">
                  {!response && (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#aab6c6]/40 gap-2">
                      <Send className="w-10 h-10 opacity-30" />
                      <span className="text-xs font-medium">Send a request to see the response</span>
                    </div>
                  )}

                  {response && activeResTab === 'body' && (
                    <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#aab6c6]">JSON Payload</span>
                        <button
                          onClick={handleCreateTestCase}
                          disabled={isCreatingTestCase}
                          className="bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded border border-emerald-900/40 flex items-center gap-1 font-semibold transition disabled:opacity-40"
                        >
                          <Bookmark className="w-3 h-3" />
                          {isCreatingTestCase ? 'Saving Test...' : 'Save as Test Case'}
                        </button>
                      </div>
                      <div className="flex-1 border border-[#2d3748] rounded-lg overflow-hidden">
                        <Editor
                          height="100%"
                          defaultLanguage="json"
                          theme="vs-dark"
                          value={
                            typeof response.actualResponse === 'object'
                              ? JSON.stringify(response.actualResponse, null, 2)
                              : String(response.actualResponse)
                          }
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 12,
                            fontFamily: 'Fira Code, monospace',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {response && activeResTab === 'headers' && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#aab6c6] mb-3">Response Headers</h4>
                      <div className="border border-[#1f2937] rounded-lg overflow-hidden text-xs">
                        {Object.entries(response.headers || {}).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex border-b border-[#1f2937] last:border-b-0 hover:bg-[#141a24]"
                          >
                            <span className="w-1/3 px-3 py-2 border-r border-[#1f2937] font-semibold text-[#63b3ff] truncate">
                              {k}
                            </span>
                            <span className="w-2/3 px-3 py-2 text-[#aab6c6] break-all">
                              {v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
