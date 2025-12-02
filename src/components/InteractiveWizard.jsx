import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Wand2, Check } from 'lucide-react'
import { generateProject } from '../services/projectGenerator'

const InteractiveWizard = ({ onGenerate }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)

  const steps = [
    { id: 'project', title: 'Project Details', component: ProjectDetailsStep },
    { id: 'tech', title: 'Technology Stack', component: TechStackStep },
    { id: 'security', title: 'Security Features', component: SecurityStep },
    { id: 'compliance', title: 'Compliance', component: ComplianceStep },
    { id: 'deployment', title: 'Deployment', component: DeploymentStep },
    { id: 'review', title: 'Review & Generate', component: ReviewStep }
  ]

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const project = await generateProject({ ...formData, mode: 'wizard' })
      onGenerate(project)
      navigate('/output')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Interactive Wizard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Step-by-step guidance for complex configurations
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {steps[currentStep].title}
          </h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-6 mb-8">
        <CurrentStepComponent 
          data={formData} 
          updateData={updateFormData}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

// Step Components
const ProjectDetailsStep = ({ data, updateData }) => {
  const handleChange = (field, value) => {
    updateData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          value={data.projectName || ''}
          onChange={(e) => handleChange('projectName', e.target.value)}
          className="input-field"
          placeholder="my-awesome-service"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="input-field h-24 resize-none"
          placeholder="Describe your service..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Service Type
        </label>
        <select
          value={data.serviceType || ''}
          onChange={(e) => handleChange('serviceType', e.target.value)}
          className="input-field"
        >
          <option value="">Select service type</option>
          <option value="api">REST API Service</option>
          <option value="microservice">Microservice</option>
          <option value="background">Background Service</option>
          <option value="web">Web Application</option>
        </select>
      </div>
    </div>
  )
}

const TechStackStep = ({ data, updateData }) => {
  const techStacks = [
    { value: 'go', label: 'Go (Golang)', description: 'High-performance, compiled language' },
    { value: 'nodejs', label: 'Node.js/TypeScript', description: 'JavaScript runtime with TypeScript' },
    { value: 'python', label: 'Python', description: 'Versatile, readable language' },
    { value: 'java', label: 'Java/Spring Boot', description: 'Enterprise-grade Java framework' },
    { value: 'dotnet', label: '.NET Core', description: 'Cross-platform .NET framework' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Choose your primary technology stack
        </h3>
        <div className="grid gap-4">
          {techStacks.map((tech) => (
            <label key={tech.value} className="relative">
              <input
                type="radio"
                name="techStack"
                value={tech.value}
                checked={data.techStack === tech.value}
                onChange={(e) => updateData({ techStack: e.target.value })}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <h4 className="font-medium text-gray-900 dark:text-white">{tech.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tech.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const SecurityStep = ({ data, updateData }) => {
  const securityFeatures = [
    { id: 'sast', label: 'SAST (Static Analysis)', description: 'Code security scanning' },
    { id: 'dast', label: 'DAST (Dynamic Analysis)', description: 'Runtime security testing' },
    { id: 'dependency-scan', label: 'Dependency Scanning', description: 'Vulnerability detection in dependencies' },
    { id: 'secrets-scan', label: 'Secrets Scanning', description: 'Detect hardcoded secrets' },
    { id: 'container-scan', label: 'Container Scanning', description: 'Docker image security' },
    { id: 'iac-scan', label: 'Infrastructure Scanning', description: 'Terraform/CloudFormation security' }
  ]

  const toggleFeature = (featureId) => {
    const current = data.securityFeatures || []
    const updated = current.includes(featureId)
      ? current.filter(id => id !== featureId)
      : [...current, featureId]
    updateData({ securityFeatures: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select security features to include
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {securityFeatures.map((feature) => (
            <label key={feature.id} className="relative">
              <input
                type="checkbox"
                checked={(data.securityFeatures || []).includes(feature.id)}
                onChange={() => toggleFeature(feature.id)}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <h4 className="font-medium text-gray-900 dark:text-white">{feature.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{feature.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const ComplianceStep = ({ data, updateData }) => {
  const frameworks = [
    { id: 'iso27001', label: 'ISO 27001', description: 'Information security management' },
    { id: 'soc2', label: 'SOC 2', description: 'Service organization controls' },
    { id: 'gdpr', label: 'GDPR', description: 'General Data Protection Regulation' },
    { id: 'hipaa', label: 'HIPAA', description: 'Health Insurance Portability' },
    { id: 'pci', label: 'PCI DSS', description: 'Payment card industry standards' }
  ]

  const toggleFramework = (frameworkId) => {
    const current = data.complianceFrameworks || []
    const updated = current.includes(frameworkId)
      ? current.filter(id => id !== frameworkId)
      : [...current, frameworkId]
    updateData({ complianceFrameworks: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select compliance frameworks
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {frameworks.map((framework) => (
            <label key={framework.id} className="relative">
              <input
                type="checkbox"
                checked={(data.complianceFrameworks || []).includes(framework.id)}
                onChange={() => toggleFramework(framework.id)}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <h4 className="font-medium text-gray-900 dark:text-white">{framework.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{framework.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const DeploymentStep = ({ data, updateData }) => {
  const platforms = [
    { value: 'kubernetes', label: 'Kubernetes', description: 'Container orchestration platform' },
    { value: 'aws', label: 'AWS', description: 'Amazon Web Services' },
    { value: 'gcp', label: 'Google Cloud', description: 'Google Cloud Platform' },
    { value: 'azure', label: 'Microsoft Azure', description: 'Microsoft cloud platform' }
  ]

  const cicdPlatforms = [
    { value: 'github', label: 'GitHub Actions' },
    { value: 'gitlab', label: 'GitLab CI' },
    { value: 'jenkins', label: 'Jenkins' },
    { value: 'azure-devops', label: 'Azure DevOps' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Deployment Platform
        </h3>
        <div className="grid gap-4">
          {platforms.map((platform) => (
            <label key={platform.value} className="relative">
              <input
                type="radio"
                name="deploymentPlatform"
                value={platform.value}
                checked={data.deploymentPlatform === platform.value}
                onChange={(e) => updateData({ deploymentPlatform: e.target.value })}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <h4 className="font-medium text-gray-900 dark:text-white">{platform.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{platform.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          CI/CD Platform
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {cicdPlatforms.map((platform) => (
            <label key={platform.value} className="relative">
              <input
                type="radio"
                name="cicdPlatform"
                value={platform.value}
                checked={data.cicdPlatform === platform.value}
                onChange={(e) => updateData({ cicdPlatform: e.target.value })}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <h4 className="font-medium text-gray-900 dark:text-white">{platform.label}</h4>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const ReviewStep = ({ data, onGenerate, isGenerating }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Review Your Configuration
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Project Details</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Name: {data.projectName || 'Not specified'}<br />
            Type: {data.serviceType || 'Not specified'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Technology Stack</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {data.techStack || 'Not selected'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Security Features</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {(data.securityFeatures || []).join(', ') || 'None selected'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Compliance</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {(data.complianceFrameworks || []).join(', ') || 'None selected'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Deployment</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Platform: {data.deploymentPlatform || 'Not selected'}<br />
            CI/CD: {data.cicdPlatform || 'Not selected'}
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Project'}
        </button>
      </div>
    </div>
  )
}

export default InteractiveWizard
