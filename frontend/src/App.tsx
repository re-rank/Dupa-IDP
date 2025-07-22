import React, { useState, useEffect } from 'react'
import './App.css'

interface Project {
  id: string
  name: string
  repositoryUrl: string
  status: string
  createdAt: string
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newProjectUrl, setNewProjectUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async (retries = 5) => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        // Backend is ready, fetch projects
        fetchProjects()
      } else if (retries > 0) {
        console.log(`Backend health check failed, retrying... (${retries} attempts left)`)
        setTimeout(() => checkBackendHealth(retries - 1), 1000)
      } else {
        setError('Unable to connect to backend server')
        setLoading(false)
      }
    } catch (err) {
      if (retries > 0) {
        console.log(`Backend not ready, retrying... (${retries} attempts left)`)
        setTimeout(() => checkBackendHealth(retries - 1), 1000)
      } else {
        setError('Unable to connect to backend server')
        setLoading(false)
      }
    }
  }

  const fetchProjects = async (retries = 3) => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        if (response.status === 502 && retries > 0) {
          // Proxy error - backend might not be ready yet
          console.log(`Backend not ready, retrying... (${retries} attempts left)`)
          setTimeout(() => fetchProjects(retries - 1), 1000)
          return
        }
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data.projects || [])
      setError(null)
    } catch (err) {
      if (retries > 0) {
        console.log(`Connection failed, retrying... (${retries} attempts left)`)
        setTimeout(() => fetchProjects(retries - 1), 1000)
        return
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (retries === 0) {
        setLoading(false)
      }
    }
  }

  const analyzeProject = async () => {
    if (!newProjectUrl.trim()) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectUrl.split('/').pop() || 'New Project',
          repositoryUrl: newProjectUrl,
          branch: 'main'
        }),
      })

      if (!response.ok) throw new Error('Failed to create project')
      
      const newProject = await response.json()
      
      // Start analysis
      const analysisResponse = await fetch(`/api/projects/${newProject.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!analysisResponse.ok) throw new Error('Failed to start analysis')

      // Refresh projects list
      await fetchProjects()
      setNewProjectUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗺️ Project Atlas</h1>
        <p>Analyze and visualize your codebase architecture</p>
      </header>

      <main className="App-main">
        <section className="new-project-section">
          <h2>Analyze a New Project</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Git repository URL (e.g., https://github.com/user/repo.git)"
              value={newProjectUrl}
              onChange={(e) => setNewProjectUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeProject()}
              disabled={isAnalyzing}
            />
            <button 
              onClick={analyzeProject} 
              disabled={isAnalyzing || !newProjectUrl.trim()}
            >
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </section>

        <section className="projects-section">
          <h2>Your Projects</h2>
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects yet. Add your first project above!</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <h3>{project.name}</h3>
                  <p className="repo-url">{project.repositoryUrl}</p>
                  <p className="status">Status: {project.status}</p>
                  <p className="date">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                  <button onClick={() => window.location.href = `/project/${project.id}`}>
                    View Analysis
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App