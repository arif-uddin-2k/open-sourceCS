import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Plus, Minus, Save } from 'lucide-react'
import { generateProject } from '../services/projectGenerator'

const TemplateCustomizer = ({ onGenerate }) => {
  const navigate = useNavigate()
  const [config, setConfig] = useState({
    projectName: '',
    techStack: 'go',
    deploymentPlatform: 'kubernetes',
    cicdPlatform: 'github',
    securityFeatures: ['sast', 'dependency-scan'],
    complianceFrameworks: [],
    monitoringTools: ['prometheus'],
    customFiles: [],
    environmentVariables: [],
    dependencies: []
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const addCustomFile = () => {
    setConfig(prev => ({
      ...prev,
      customFiles: [...prev.customFiles, { path: '', content: '', description: '' }]
    }))
  }

  const removeCustomFile = (index) => {
    setConfig(prev => ({
      ...prev,
      customFiles: prev.customFiles.filter((_, i) => i !== index)
    }))
  }

  const updateCustomFile = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      customFiles: prev.customFiles.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      )
    }))
  }

  const addEnvironmentVariable = () => {
    setConfig(prev => ({
      ...prev,
      environmentVariables: [...prev.environmentVariables, { key: '', value: '', description: '' }]
    }))
  }

  const removeEnvironmentVariable = (index) => {
    setConfig(prev => ({
      ...prev,
      environmentVariables: prev.environmentVariables.filter((_, i) => i !== index)
    }))
  }

  const updateEnvironmentVariable = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      environmentVariables: prev.environmentVariables.map((env, i) => 
        i === index ? { ...env, [field]: value } : env
      )
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const project = await generateProject({ ...config, mode: 'custom' })
      onGenerate(project)
      navigate('/output')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Template Customizer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Fine-tune every aspect of your project structure
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => updateConfig('projectName', e.target.value)}
                  className="input-field"
                  placeholder="my-service"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technology Stack
                  </label>
                  <select
                    value={config.techStack}
                    onChange={(e) => updateConfig('techStack', e.target.value)}
                    className="input-field"
                  >
                    <option value="go">Go (Golang)</option>
                    <option value="nodejs">Node.js/TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java/Spring Boot</option>
                    <option value="dotnet">.NET Core</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deployment Platform
                  </label>
                  <select
                    value={config.deploymentPlatform}
                    onChange={(e) => updateConfig('deploymentPlatform', e.target.value)}
                    className="input-field"
                  >
                    <option value="kubernetes">Kubernetes</option>
                    <option value="aws">AWS</option>
                    <option value="gcp">Google Cloud</option>
                    <option value="azure">Microsoft Azure</option>
                    <option value="docker">Docker Compose</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Security Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { id: 'sast', label: 'SAST Scanning' },
                { id: 'dast', label: 'DAST Scanning' },
                { id: 'dependency-scan', label: 'Dependency Scanning' },
                { id: 'secrets-scan', label: 'Secrets Scanning' },
                { id: 'container-scan', label: 'Container Scanning' },
                { id: 'iac-scan', label: 'Infrastructure Scanning' }
              ].map((feature) => (
                <label key={feature.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.securityFeatures.includes(feature.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateConfig('securityFeatures', [...config.securityFeatures, feature.id])
                      } else {
                        updateConfig('securityFeatures', config.securityFeatures.filter(f => f !== feature.id))
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Files */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Custom Files
              </h2>
              <button
                onClick={addCustomFile}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add File</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {config.customFiles.map((file, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Custom File {index + 1}
                    </h3>
                    <button
                      onClick={() => removeCustomFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        File Path
                      </label>
                      <input
                        type="text"
                        value={file.path}
                        onChange={(e) => updateCustomFile(index, 'path', e.target.value)}
                        className="input-field"
                        placeholder="src/custom/file.go"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={file.description}
                        onChange={(e) => updateCustomFile(index, 'description', e.target.value)}
                        className="input-field"
                        placeholder="Custom utility functions"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Content
                      </label>
                      <textarea
                        value={file.content}
                        onChange={(e) => updateCustomFile(index, 'content', e.target.value)}
                        className="input-field h-32 resize-none font-mono text-sm"
                        placeholder="// Your custom code here..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Environment Variables
              </h2>
              <button
                onClick={addEnvironmentVariable}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Variable</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {config.environmentVariables.map((env, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={env.key}
                    onChange={(e) => updateEnvironmentVariable(index, 'key', e.target.value)}
                    className="input-field flex-1"
                    placeholder="VARIABLE_NAME"
                  />
                  <input
                    type="text"
                    value={env.value}
                    onChange={(e) => updateEnvironmentVariable(index, 'value', e.target.value)}
                    className="input-field flex-1"
                    placeholder="default_value"
                  />
                  <button
                    onClick={() => removeEnvironmentVariable(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuration Preview
            </h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Project:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {config.projectName || 'Unnamed'}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Tech Stack:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {config.techStack}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Platform:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {config.deploymentPlatform}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Security:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {config.securityFeatures.length} features
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Custom Files:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {config.customFiles.length} files
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Env Variables:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {config.environmentVariables.length} variables
                </span>
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !config.projectName}
              className="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateCustomizer
