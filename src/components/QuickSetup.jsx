import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Zap, ArrowRight, Loader2 } from 'lucide-react'
import { generateProject } from '../services/projectGenerator'

const QuickSetup = ({ onGenerate }) => {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const techStacks = [
    { value: 'go', label: 'Go (Golang)', description: 'High-performance microservices' },
    { value: 'nodejs', label: 'Node.js/TypeScript', description: 'JavaScript/TypeScript backend' },
    { value: 'python', label: 'Python', description: 'Django/FastAPI applications' },
    { value: 'java', label: 'Java/Spring Boot', description: 'Enterprise Java applications' },
    { value: 'dotnet', label: '.NET Core', description: 'Microsoft .NET applications' }
  ]

  const deploymentPlatforms = [
    { value: 'kubernetes', label: 'Kubernetes', description: 'Container orchestration' },
    { value: 'aws', label: 'AWS', description: 'Amazon Web Services' },
    { value: 'gcp', label: 'Google Cloud', description: 'Google Cloud Platform' },
    { value: 'azure', label: 'Microsoft Azure', description: 'Azure cloud services' },
    { value: 'docker', label: 'Docker Compose', description: 'Local development' }
  ]

  const cicdPlatforms = [
    { value: 'github', label: 'GitHub Actions', description: 'GitHub integrated CI/CD' },
    { value: 'gitlab', label: 'GitLab CI', description: 'GitLab integrated CI/CD' },
    { value: 'jenkins', label: 'Jenkins', description: 'Self-hosted automation' },
    { value: 'azure-devops', label: 'Azure DevOps', description: 'Microsoft DevOps platform' }
  ]

  const onSubmit = async (data) => {
    setIsGenerating(true)
    try {
      const project = await generateProject({
        ...data,
        mode: 'quick',
        securityFeatures: ['sast', 'dast', 'dependency-scan', 'secrets-scan'],
        complianceFrameworks: ['iso27001'],
        monitoringTools: ['prometheus', 'grafana']
      })
      onGenerate(project)
      navigate('/output')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quick Setup
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate a production-ready project with sensible security defaults
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Details */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Project Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                {...register('projectName', { required: 'Project name is required' })}
                className="input-field"
                placeholder="my-awesome-service"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                {...register('description')}
                className="input-field"
                placeholder="A scalable microservice for..."
              />
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Technology Stack
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStacks.map((tech) => (
              <label key={tech.value} className="relative">
                <input
                  {...register('techStack', { required: 'Please select a technology stack' })}
                  type="radio"
                  value={tech.value}
                  className="sr-only peer"
                />
                <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tech.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tech.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.techStack && (
            <p className="text-red-500 text-sm mt-2">{errors.techStack.message}</p>
          )}
        </div>

        {/* Deployment Platform */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Deployment Platform
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deploymentPlatforms.map((platform) => (
              <label key={platform.value} className="relative">
                <input
                  {...register('deploymentPlatform', { required: 'Please select a deployment platform' })}
                  type="radio"
                  value={platform.value}
                  className="sr-only peer"
                />
                <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                  <h3 className="font-medium text-gray-900 dark:text-white">{platform.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{platform.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.deploymentPlatform && (
            <p className="text-red-500 text-sm mt-2">{errors.deploymentPlatform.message}</p>
          )}
        </div>

        {/* CI/CD Platform */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            CI/CD Platform
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {cicdPlatforms.map((platform) => (
              <label key={platform.value} className="relative">
                <input
                  {...register('cicdPlatform', { required: 'Please select a CI/CD platform' })}
                  type="radio"
                  value={platform.value}
                  className="sr-only peer"
                />
                <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                  <h3 className="font-medium text-gray-900 dark:text-white">{platform.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{platform.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.cicdPlatform && (
            <p className="text-red-500 text-sm mt-2">{errors.cicdPlatform.message}</p>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary px-8 py-3 text-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate Project</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuickSetup
