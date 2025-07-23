import React, { useState } from 'react';
import { APICall } from '../types';

interface APIMappingProps {
  apiCalls: APICall[];
}

const APIMapping: React.FC<APIMappingProps> = ({ apiCalls }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  // Group API calls by endpoint
  const groupedAPIs = apiCalls.reduce((acc, api) => {
    const key = api.endpoint || 'Unknown Endpoint';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(api);
    return acc;
  }, {} as Record<string, APICall[]>);

  // Filter APIs
  const filteredAPIs = Object.entries(groupedAPIs).filter(([endpoint, calls]) => {
    const matchesType = selectedType === 'all' || calls.some(call => call.type === selectedType);
    const matchesSearch = endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calls.some(call => 
        call.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.framework?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesType && matchesSearch;
  });

  const toggleEndpoint = (endpoint: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(endpoint)) {
      newExpanded.delete(endpoint);
    } else {
      newExpanded.add(endpoint);
    }
    setExpandedEndpoints(newExpanded);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'http': return 'bg-blue-100 text-blue-800';
      case 'graphql': return 'bg-purple-100 text-purple-800';
      case 'websocket': return 'bg-green-100 text-green-800';
      case 'grpc': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method?: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'text-green-600';
      case 'POST': return 'text-blue-600';
      case 'PUT': return 'text-orange-600';
      case 'DELETE': return 'text-red-600';
      case 'PATCH': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search endpoints, files, or frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="http">HTTP</option>
          <option value="graphql">GraphQL</option>
          <option value="websocket">WebSocket</option>
          <option value="grpc">gRPC</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{apiCalls.length}</div>
          <div className="text-sm text-blue-600">Total API Calls</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{Object.keys(groupedAPIs).length}</div>
          <div className="text-sm text-green-600">Unique Endpoints</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {apiCalls.filter(api => api.confidence >= 0.8).length}
          </div>
          <div className="text-sm text-purple-600">High Confidence</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(apiCalls.map(api => api.framework).filter(Boolean)).size}
          </div>
          <div className="text-sm text-orange-600">Frameworks Used</div>
        </div>
      </div>

      {/* API List */}
      <div className="space-y-2">
        {filteredAPIs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No API calls found matching your criteria
          </div>
        ) : (
          filteredAPIs.map(([endpoint, calls]) => (
            <div key={endpoint} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleEndpoint(endpoint)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg 
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      expandedEndpoints.has(endpoint) ? 'rotate-90' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{endpoint}</div>
                    <div className="text-sm text-gray-500">{calls.length} call{calls.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {Array.from(new Set(calls.map(c => c.type))).map(type => (
                    <span key={type} className={`px-2 py-1 text-xs rounded-full ${getTypeColor(type)}`}>
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </button>

              {expandedEndpoints.has(endpoint) && (
                <div className="border-t border-gray-200">
                  <div className="px-4 py-3 space-y-3">
                    {calls.map((call, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {call.method && (
                                <span className={`font-semibold text-sm ${getMethodColor(call.method)}`}>
                                  {call.method.toUpperCase()}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(call.type)}`}>
                                {call.type}
                              </span>
                              {call.framework && (
                                <span className="text-xs text-gray-500">
                                  via {call.framework}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-700">
                              <span className="font-mono">{call.file}:{call.line}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500">Confidence</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getConfidenceColor(call.confidence)}`}
                                style={{ width: `${call.confidence * 100}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 w-10 text-right">
                              {Math.round(call.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default APIMapping;