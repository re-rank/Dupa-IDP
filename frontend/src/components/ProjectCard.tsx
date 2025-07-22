import React from 'react';
import { Project } from '../../../shared/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  MoreVertical,
  Play,
  Trash2,
  Edit
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onAnalyze: (projectId: string) => void;
  onView: (projectId: string) => void;
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  isAnalyzing?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onAnalyze,
  onView,
  onEdit,
  onDelete,
  isAnalyzing = false
}) => {
  const getStatusIcon = () => {
    switch (project.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'analyzing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'analyzing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };


  const formatRepositoryUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\.git$/, '');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <GitBranch className="w-4 h-4 mr-1" />
              <span className="truncate">
                {formatRepositoryUrl(project.repositoryUrl)}
              </span>
              <ExternalLink 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-gray-700"
                onClick={() => window.open(project.repositoryUrl, '_blank')}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{project.status}</span>
            </div>
            
            <div className="relative">
              <button className="p-1 rounded-full hover:bg-gray-100">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {project.lastAnalyzedAt 
                ? `Analyzed ${formatDistanceToNow(project.lastAnalyzedAt, { addSuffix: true })}`
                : `Created ${formatDistanceToNow(project.createdAt, { addSuffix: true })}`
              }
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {project.status === 'completed' && (
              <button
                onClick={() => onView(project.id)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Results
              </button>
            )}
            
            <button
              onClick={() => onAnalyze(project.id)}
              disabled={isAnalyzing || project.status === 'analyzing'}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3 h-3 mr-1" />
              {project.status === 'analyzing' ? 'Analyzing...' : 'Analyze'}
            </button>

            <button
              onClick={() => onEdit(project.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            >
              <Edit className="w-3 h-3" />
            </button>

            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};