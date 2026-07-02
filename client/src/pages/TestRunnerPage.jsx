import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Zap,
  Trash2,
  ListRestart,
  Activity,
  Award,
} from 'lucide-react';
import { testCaseService } from '@/services/apiService';
import toast from 'react-hot-toast';
import MainLayout from '@/layouts/MainLayout';

export default function TestRunnerPage() {
  const { currentProjectId } = useSelector((state) => state.project);

  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [results, setResults] = useState({});
  const [assertionResults, setAssertionResults] = useState({});
  const [expandedTestId, setExpandedTestId] = useState(null);

  useEffect(() => {
    if (currentProjectId) {
      loadTests();
      setResults({});
      setAssertionResults({});
      setExpandedTestId(null);
    } else {
      setTests([]);
    }
  }, [currentProjectId]);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      const testCases = await testCaseService.getByProject(currentProjectId);
      setTests(testCases);
      
      // Initialize results with lastRun info from DB if it exists
      const initialResults = {};
      testCases.forEach((t) => {
        if (t.lastRun && t.lastRun.status !== 'pending') {
          initialResults[t.id] = t.lastRun;
        }
      });
      setResults(initialResults);
    } catch (error) {
      toast.error(error || 'Failed to load test cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAll = async () => {
    if (tests.length === 0) {
      toast.error('No test cases found in this project');
      return;
    }

    setIsRunningAll(true);
    const loadingToast = toast.loading('Running all test cases...');
    try {
      for (const test of tests) {
        setResults((prev) => ({
          ...prev,
          [test.id]: { status: 'running' },
        }));
        
        try {
          const res = await testCaseService.run(test.id);
          setResults((prev) => ({
            ...prev,
            [test.id]: res.testCase.lastRun,
          }));
          setAssertionResults((prev) => ({
            ...prev,
            [test.id]: res.assertionResults,
          }));
        } catch (testErr) {
          setResults((prev) => ({
            ...prev,
            [test.id]: { status: 'failed', error: testErr.message || 'Execution error' },
          }));
        }
      }
      toast.dismiss(loadingToast);
      toast.success('All test runs completed!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error || 'Failed during batch test execution');
    } finally {
      setIsRunningAll(false);
    }
  };

  const runTest = async (testId) => {
    setResults((prev) => ({
      ...prev,
      [testId]: { status: 'running' },
    }));

    try {
      const res = await testCaseService.run(testId);
      setResults((prev) => ({
        ...prev,
        [testId]: res.testCase.lastRun,
      }));
      setAssertionResults((prev) => ({
        ...prev,
        [testId]: res.assertionResults,
      }));
      toast.success('Test run completed!');
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testId]: { status: 'failed', error: error || 'Execution error' },
      }));
      toast.error(error || 'Failed to run test case');
    }
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;
    try {
      await testCaseService.delete(testId);
      setTests(tests.filter((t) => t.id !== testId));
      toast.success('Test case deleted');
    } catch (error) {
      toast.error(error || 'Failed to delete test case');
    }
  };

  const toggleExpand = (testId) => {
    setExpandedTestId(expandedTestId === testId ? null : testId);
  };

  const totalTests = tests.length;
  const passedTests = tests.filter((t) => results[t.id]?.status === 'passed').length;
  const failedTests = tests.filter((t) => results[t.id]?.status === 'failed').length;
  const pendingTests = totalTests - passedTests - failedTests;

  return (
    <MainLayout>
      {!currentProjectId ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-[#aab6c6] gap-4">
          <FolderOpen className="w-16 h-16 text-[#63b3ff] opacity-40 animate-pulse" />
          <h2 className="text-xl font-bold">No Project Selected</h2>
          <p className="text-sm max-w-md text-center opacity-70">
            Please select an existing project or create a new project in the top navigation bar to access the Test Runner.
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#e6ebf2]">Test Runner</h2>
              <p className="text-xs text-[#aab6c6]">
                Monitor assertions, track response validation checks, and batch execute test suites
              </p>
            </div>
            
            <button
              onClick={handleRunAll}
              disabled={isRunningAll || tests.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] text-xs font-bold rounded-lg transition disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5" />
              Run All Tests
            </button>
          </div>

          {/* Stats Widgets */}
          {totalTests > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0f1419] border border-[#1f2937] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#aab6c6] tracking-wider">Total Tests</p>
                  <p className="text-2xl font-extrabold mt-1 text-[#e6ebf2]">{totalTests}</p>
                </div>
                <Activity className="w-8 h-8 text-[#63b3ff] opacity-40" />
              </div>

              <div className="bg-[#0f1419] border border-green-900/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-green-400 tracking-wider">Passed</p>
                  <p className="text-2xl font-extrabold text-green-400 mt-1">{passedTests}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400 opacity-40" />
              </div>

              <div className="bg-[#0f1419] border border-red-900/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Failed</p>
                  <p className="text-2xl font-extrabold text-red-400 mt-1">{failedTests}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400 opacity-40" />
              </div>

              <div className="bg-[#0f1419] border border-[#1f2937] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#aab6c6] tracking-wider">Pending</p>
                  <p className="text-2xl font-extrabold text-[#aab6c6]/60 mt-1">{pendingTests}</p>
                </div>
                <Clock className="w-8 h-8 text-[#aab6c6] opacity-30 animate-pulse" />
              </div>
            </div>
          )}

          {/* Test list */}
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center text-xs py-12 text-[#aab6c6] animate-pulse">
                Loading test suite...
              </div>
            )}

            {!isLoading && tests.length === 0 && (
              <div className="text-center bg-[#0f1419]/50 border border-[#1f2937] rounded-xl py-16 px-4">
                <Award className="w-16 h-16 text-[#63b3ff] opacity-40 mx-auto mb-4" />
                <p className="text-sm text-[#aab6c6] mb-2 font-medium">No Test Cases Yet</p>
                <p className="text-xs text-[#aab6c6]/60 mb-4 max-w-sm mx-auto">
                  Test cases validate your API changes automatically. Navigate to the API Builder or Collections page to create test cases.
                </p>
              </div>
            )}

            {tests.map((test) => {
              const res = results[test.id];
              const testStatus = res?.status || 'pending';
              const assertions = assertionResults[test.id] || test.assertions || [];
              const isExpanded = expandedTestId === test.id;

              const statusConfigs = {
                passed: {
                  color: 'text-green-400 bg-green-950/20 border-green-900/40',
                  icon: CheckCircle,
                  text: 'Passed',
                },
                failed: {
                  color: 'text-red-400 bg-red-950/20 border-red-900/40',
                  icon: XCircle,
                  text: 'Failed',
                },
                running: {
                  color: 'text-[#63b3ff] bg-[#63b3ff]/10 border-[#63b3ff]/20',
                  icon: Clock,
                  text: 'Running',
                },
                pending: {
                  color: 'text-[#aab6c6] bg-[#1a1f2e] border-[#2d3748]',
                  icon: Clock,
                  text: 'Pending',
                },
              };

              const conf = statusConfigs[testStatus] || statusConfigs.pending;

              return (
                <div
                  key={test.id}
                  className={`bg-[#0f1419] border rounded-xl overflow-hidden transition-all duration-200 ${
                    isExpanded ? 'border-[#2d3748] shadow-lg' : 'border-[#1f2937] hover:border-[#2d3748]'
                  }`}
                >
                  {/* Summary Bar */}
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleExpand(test.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#e6ebf2]">{test.name}</span>
                        {test.endpoint && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1a1f2e] text-[#63b3ff] border border-[#2d3748]">
                            {test.endpoint.method || 'GET'} {test.endpoint.url || ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#aab6c6] line-clamp-1">{test.description}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      {/* Status Badge */}
                      <span
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${conf.color}`}
                      >
                        <conf.icon className={`w-3.5 h-3.5 ${testStatus === 'running' ? 'animate-spin' : ''}`} />
                        {conf.text}
                      </span>

                      {res?.duration && (
                        <span className="text-xs text-[#aab6c6] font-mono">{res.duration}ms</span>
                      )}

                      <button
                        onClick={() => runTest(test.id)}
                        disabled={testStatus === 'running'}
                        className="p-1.5 hover:bg-[#1a1f2e] text-[#63b3ff] hover:text-[#7fbfff] rounded-lg transition disabled:opacity-40"
                        title="Run Test"
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(test.id)}
                        className="p-1.5 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg transition"
                        title="Delete Test Case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(test.id)}
                        className="p-1 hover:bg-[#1a1f2e] text-[#aab6c6] hover:text-[#e6ebf2] rounded transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expansion Area */}
                  {isExpanded && (
                    <div className="border-t border-[#1f2937] bg-[#0c1015]/60 p-4 space-y-4 text-xs">
                      {/* Assertions results */}
                      <div>
                        <h4 className="font-bold text-[#e6ebf2] mb-2 uppercase tracking-wider text-[10px]">
                          Assertion Validation
                        </h4>
                        <div className="space-y-1.5">
                          {assertions.map((assertion, idx) => {
                            const isPassed = assertion.passed || res?.status === 'passed';
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded bg-[#141a24] border border-[#2d3748]"
                              >
                                <div className="flex items-center gap-2">
                                  {isPassed ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="font-mono text-[11px] text-[#aab6c6]">
                                    Assert that{' '}
                                    <span className="text-[#63b3ff] font-semibold">
                                      {assertion.type}
                                    </span>{' '}
                                    {assertion.operator}{' '}
                                    <span className="text-amber-400">
                                      {assertion.expectedValue}
                                    </span>
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] uppercase font-bold px-1.5 rounded ${
                                    isPassed ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {isPassed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Request and expected output configuration details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#141a24] border border-[#2d3748] rounded-lg p-3">
                          <h5 className="font-bold text-[#e6ebf2] mb-1.5">Request Overrides</h5>
                          <div className="space-y-1 text-[#aab6c6] font-mono text-[11px]">
                            <div>
                              Headers:{' '}
                              {Object.keys(test.requestHeaders || {}).length > 0
                                ? JSON.stringify(test.requestHeaders)
                                : 'None'}
                            </div>
                            <div>
                              Params:{' '}
                              {Object.keys(test.requestQueryParams || {}).length > 0
                                ? JSON.stringify(test.requestQueryParams)
                                : 'None'}
                            </div>
                            <div>
                              Body:{' '}
                              {test.requestBody
                                ? JSON.stringify(test.requestBody)
                                : 'None'}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#141a24] border border-[#2d3748] rounded-lg p-3">
                          <h5 className="font-bold text-[#e6ebf2] mb-1.5">Expected Output</h5>
                          <div className="space-y-1 text-[#aab6c6] font-mono text-[11px]">
                            <div>Status Code: {test.expectedStatus}</div>
                            <div>
                              Response Body:{' '}
                              {test.expectedResponseBody
                                ? JSON.stringify(test.expectedResponseBody)
                                : 'None'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actual Response execution output if failure exists */}
                      {res?.error && (
                        <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 text-red-400">
                          <span className="font-bold">Error Summary:</span> {res.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
