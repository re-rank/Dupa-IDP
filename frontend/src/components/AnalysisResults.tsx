import React, { useState, useEffect } from 'react';
import { AnalysisResult, AnalysisData } from '../types';
import { endpoints } from '../services/api';
import LoadingSpinner from './UI/LoadingSpinner';
import DependencyGraph from './DependencyGraph';
import APIMapping from './APIMapping';
import FrameworkDetection from './FrameworkDetection';

interface AnalysisResultsProps {
  projectId: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ projectId }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'frameworks' | 'apis'>('overview');

  useEffect(() => {
    const fetchAnalysisResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api${endpoints.analysisResults(projectId)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis results');
        }
        
        const responseData = await response.json();
        const results: AnalysisResult[] = responseData.data || [];
        
        if (results.length > 0) {
          // Get the latest analysis result
          const latestResult = results[0];
          setAnalysisData(latestResult.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResults();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8 text-center">
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900">Error loading results</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis results</h3>
          <p className="mt-1 text-sm text-gray-500">
            No analysis results found for this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dependencies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dependency Graph
            </button>
            <button
              onClick={() => setActiveTab('frameworks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'frameworks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Frameworks
            </button>
            <button
              onClick={() => setActiveTab('apis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'apis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API Mapping
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Project Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Project Summary</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisData.summary?.projectType || 'Unknown'}
                  </div>
                  <div className="text-sm text-blue-600">Project Type</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisData.summary?.primaryLanguage || 'Unknown'}
                  </div>
                  <div className="text-sm text-green-600">Primary Language</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisData.frameworks?.length || 0}
                  </div>
                  <div className="text-sm text-purple-600">Frameworks</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysisData.dependencies?.length || 0}
                  </div>
                  <div className="text-sm text-orange-600">Dependencies</div>
                </div>
              </div>
            </div>
          </div>

      {/* Project Structure */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Project Structure</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">File Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Files:</span>
                  <span className="text-sm font-medium">{analysisData.structure?.totalFiles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Size:</span>
                  <span className="text-sm font-medium">
                    {analysisData.structure?.totalSize ? 
                      `${(analysisData.structure.totalSize / 1024).toFixed(1)} KB` : 
                      '0 KB'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Language Distribution</h3>
              <div className="space-y-2">
                {Object.entries(analysisData.structure?.languageDistribution || {}).map(([lang, count]) => (
                  <div key={lang} className="flex justify-between">
                    <span className="text-sm text-gray-600">{lang}:</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Important Files</h3>
              <div className="space-y-2">
                {analysisData.structure?.importantFiles?.entry?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Entry Points:</span>
                    <div className="text-sm text-gray-700">
                      {analysisData.structure.importantFiles.entry.slice(0, 3).join(', ')}
                    </div>
                  </div>
                )}
                {analysisData.structure?.importantFiles?.configuration?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Config Files:</span>
                    <div className="text-sm text-gray-700">
                      {analysisData.structure.importantFiles.configuration.slice(0, 3).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


          {/* Metrics */}
          {analysisData.metrics && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Code Metrics</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {analysisData.metrics.totalLines || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Lines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {analysisData.metrics.totalAPICalls || 0}
                    </div>
                    <div className="text-sm text-gray-500">API Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((analysisData.metrics.complexityScore || 0) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Complexity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((analysisData.metrics.maintainabilityIndex || 0) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Maintainability</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dependency Graph Tab */}
      {activeTab === 'dependencies' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Interactive Dependency Graph</h2>
          </div>
          <div className="px-6 py-4">
            {analysisData.dependencyGraph && analysisData.dependencyGraph.nodes.length > 0 ? (
              <DependencyGraph data={analysisData.dependencyGraph} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No dependency graph data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Frameworks Tab */}
      {activeTab === 'frameworks' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Framework Detection Analysis</h2>
          </div>
          <div className="px-6 py-4">
            {analysisData.frameworks && analysisData.frameworks.length > 0 ? (
              <FrameworkDetection frameworks={analysisData.frameworks} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No frameworks detected
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Mapping Tab */}
      {activeTab === 'apis' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">API Endpoint Mapping</h2>
          </div>
          <div className="px-6 py-4">
            {analysisData.apiCalls && analysisData.apiCalls.length > 0 ? (
              <APIMapping apiCalls={analysisData.apiCalls} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No API calls detected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;