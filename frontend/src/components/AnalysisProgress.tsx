import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface AnalysisProgressProps {
  projectId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface ProgressState {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedTime?: number;
  error?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  projectId,
  onComplete,
  onError
}) => {
  const [progressState, setProgressState] = useState<ProgressState>({
    status: 'pending',
    progress: 0,
    currentStep: 'Initializing...'
  });

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      // Try WebSocket first, fallback to polling
      if (typeof EventSource !== 'undefined') {
        eventSource = new EventSource(`/api/analysis/projects/${projectId}/progress`);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setProgressState(data);
            
            if (data.status === 'completed' && onComplete) {
              onComplete(data.result);
            } else if (data.status === 'failed' && onError) {
              onError(data.error);
            }
          } catch (error) {
            console.error('Failed to parse progress data:', error);
          }
        };

        eventSource.onerror = () => {
          console.warn('EventSource failed, falling back to polling');
          eventSource?.close();
          startPolling();
        };
      } else {
        // Fallback to polling
        pollInterval = setInterval(async () => {
          try {
            const response = await fetch(`/api/analysis/projects/${projectId}/status`);
            if (response.ok) {
              const data = await response.json();
              setProgressState(data);
              
              if (data.status === 'completed' && onComplete) {
                onComplete(data.result);
                clearInterval(pollInterval!);
              } else if (data.status === 'failed' && onError) {
                onError(data.error);
                clearInterval(pollInterval!);
              }
            }
          } catch (error) {
            console.error('Failed to fetch progress:', error);
          }
        }, 2000);
      }
    };

    startPolling();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [projectId, onComplete, onError]);

  const getStatusIcon = () => {
    switch (progressState.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'running':
        return <Clock className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progressState.status) {
      case 'completed':
        return 'text-green-700';
      case 'running':
        return 'text-blue-700';
      case 'failed':
        return 'text-red-700';
      default:
        return 'text-yellow-700';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-medium ${getStatusColor()}`}>
              {progressState.status === 'completed' && 'Analysis Complete'}
              {progressState.status === 'running' && 'Analyzing Project'}
              {progressState.status === 'failed' && 'Analysis Failed'}
              {progressState.status === 'pending' && 'Analysis Pending'}
            </h3>
            
            {progressState.status === 'running' && (
              <span className="text-sm text-gray-500">
                {progressState.progress}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {progressState.status === 'running' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressState.progress}%` }}
              />
            </div>
          )}

          {/* Current Step */}
          <p className="text-sm text-gray-600 mb-2">
            {progressState.currentStep}
          </p>

          {/* Estimated Time */}
          {progressState.estimatedTime && progressState.status === 'running' && (
            <p className="text-xs text-gray-500">
              Estimated time remaining: {formatTime(progressState.estimatedTime)}
            </p>
          )}

          {/* Error Message */}
          {progressState.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {progressState.error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {progressState.status === 'completed' && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                Analysis completed successfully! You can now view the results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      {progressState.status === 'running' && (
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Steps</span>
            <span>{Math.floor(progressState.progress / 20) + 1} of 5</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              'Clone Repository',
              'Scan Structure',
              'Detect Frameworks',
              'Extract Dependencies',
              'Generate Report'
            ].map((step, index) => {
              const stepProgress = (index + 1) * 20;
              const isCompleted = progressState.progress >= stepProgress;
              const isCurrent = progressState.progress >= (index * 20) && progressState.progress < stepProgress;
              
              return (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isCurrent 
                        ? 'bg-blue-500' 
                        : 'bg-gray-200'
                  }`}
                  title={step}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};