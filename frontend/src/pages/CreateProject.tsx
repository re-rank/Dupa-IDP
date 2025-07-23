import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface CreateProjectForm {
  name: string;
  repositoryUrl: string;
  repositoryType: 'single' | 'multi';
  branch: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<CreateProjectForm>({
    name: '',
    repositoryUrl: '',
    repositoryType: 'single',
    branch: 'main'
  });

  const [errors, setErrors] = useState<Partial<CreateProjectForm>>({});

  const createProjectMutation = useMutation(
    (data: CreateProjectForm) => api.post('/projects', data),
    {
      onSuccess: (project) => {
        toast.success('Project created successfully!');
        queryClient.invalidateQueries('projects');
        navigate(`/projects/${project.id}`);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to create project');
      }
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateProjectForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!form.repositoryUrl.trim()) {
      newErrors.repositoryUrl = 'Repository URL is required';
    } else if (!form.repositoryUrl.match(/^https?:\/\/.+\.git$|^git@.+:.+\.git$/)) {
      newErrors.repositoryUrl = 'Please enter a valid Git repository URL';
    }

    if (!form.branch.trim()) {
      newErrors.branch = 'Branch name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createProjectMutation.mutate(form);
  };

  const handleInputChange = (field: keyof CreateProjectForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const extractProjectName = (url: string) => {
    try {
      const match = url.match(/\/([^\/]+)\.git$/);
      if (match) {
        return match[1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    } catch (error) {
      // Ignore errors
    }
    return '';
  };

  const handleRepositoryUrlChange = (url: string) => {
    handleInputChange('repositoryUrl', url);
    
    // Auto-fill project name if empty
    if (!form.name && url) {
      const suggestedName = extractProjectName(url);
      if (suggestedName) {
        setForm(prev => ({ ...prev, name: suggestedName }));
      }
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-2 text-gray-600">
            Add a new repository to analyze its structure and dependencies.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="My Awesome Project"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Repository URL */}
            <div>
              <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700">
                Repository URL
              </label>
              <input
                type="url"
                id="repositoryUrl"
                value={form.repositoryUrl}
                onChange={(e) => handleRepositoryUrlChange(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.repositoryUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://github.com/username/repository.git"
              />
              {errors.repositoryUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.repositoryUrl}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Supports GitHub, GitLab, Bitbucket, and other Git repositories
              </p>
            </div>

            {/* Repository Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Repository Type
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="single"
                    type="radio"
                    value="single"
                    checked={form.repositoryType === 'single'}
                    onChange={(e) => handleInputChange('repositoryType', e.target.value as 'single' | 'multi')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="single" className="ml-3 block text-sm text-gray-700">
                    Single Repository
                    <span className="block text-xs text-gray-500">
                      Analyze a single codebase or monorepo
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="multi"
                    type="radio"
                    value="multi"
                    checked={form.repositoryType === 'multi'}
                    onChange={(e) => handleInputChange('repositoryType', e.target.value as 'single' | 'multi')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="multi" className="ml-3 block text-sm text-gray-700">
                    Multi-Repository Project
                    <span className="block text-xs text-gray-500">
                      Analyze multiple related repositories (microservices)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Branch
              </label>
              <input
                type="text"
                id="branch"
                value={form.branch}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.branch ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="main"
              />
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                The branch to analyze (default: main)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProjectMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createProjectMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                What happens next?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>We'll clone your repository and analyze its structure</li>
                  <li>Detect programming languages, frameworks, and dependencies</li>
                  <li>Map API calls, database connections, and service relationships</li>
                  <li>Generate interactive visualizations and reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;