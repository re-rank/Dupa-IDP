import React from 'react';
import { FrameworkInfo } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FrameworkDetectionProps {
  frameworks: FrameworkInfo[];
}

const FrameworkDetection: React.FC<FrameworkDetectionProps> = ({ frameworks }) => {
  // Prepare data for visualizations
  const typeDistribution = frameworks.reduce((acc, fw) => {
    acc[fw.type] = (acc[fw.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  const confidenceData = frameworks.map(fw => ({
    name: fw.name,
    confidence: Math.round(fw.confidence * 100),
    type: fw.type
  })).sort((a, b) => b.confidence - a.confidence);

  const COLORS = {
    frontend: '#3B82F6',
    backend: '#10B981',
    fullstack: '#8B5CF6',
    library: '#F59E0B',
    tool: '#EF4444'
  };

  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'frontend':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'backend':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      case 'database':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Framework Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Confidence</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={confidenceData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="confidence" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Framework List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detected Frameworks</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {frameworks.map((framework, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  framework.type === 'frontend' ? 'bg-blue-100 text-blue-600' :
                  framework.type === 'backend' ? 'bg-green-100 text-green-600' :
                  framework.type === 'fullstack' ? 'bg-purple-100 text-purple-600' :
                  framework.type === 'library' ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {getFrameworkIcon(framework.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{framework.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Type: <span className="font-medium">{framework.type}</span>
                        </span>
                        {framework.version && (
                          <span className="text-sm text-gray-500">
                            Version: <span className="font-medium">{framework.version}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              framework.confidence >= 0.8 ? 'bg-green-500' :
                              framework.confidence >= 0.5 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${framework.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(framework.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Indicators */}
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Detection Indicators:</h5>
                    <div className="flex flex-wrap gap-2">
                      {framework.indicators.slice(0, 5).map((indicator, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {indicator}
                        </span>
                      ))}
                      {framework.indicators.length > 5 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{framework.indicators.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Config Files */}
                  {framework.configFiles.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Configuration Files:</h5>
                      <div className="flex flex-wrap gap-2">
                        {framework.configFiles.map((file, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700">
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FrameworkDetection;