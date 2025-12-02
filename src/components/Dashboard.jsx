import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Wand2, Settings, Shield, GitBranch, Cloud, Database } from 'lucide-react'

const Dashboard = () => {
  const features = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Built-in security scanning, SAST/DAST integration, and compliance frameworks'
    },
    {
      icon: GitBranch,
      title: 'CI/CD Ready',
      description: 'Pre-configured pipelines for GitHub Actions, GitLab CI, Jenkins, and more'
    },
    {
      icon: Cloud,
      title: 'Multi-Cloud',
      description: 'Support for AWS, GCP, Azure with security best practices'
    },
    {
      icon: Database,
      title: 'Dependency Management',
      description: 'Automated vulnerability scanning and dependency updates'
    }
  ]

  const quickActions = [
    {
      to: '/quick-setup',
      icon: Zap,
      title: 'Quick Setup',
      description: 'Generate a project in minutes with sensible defaults',
      color: 'bg-green-500'
    },
    {
      to: '/wizard',
      icon: Wand2,
      title: 'Interactive Wizard',
      description: 'Step-by-step guidance for complex configurations',
      color: 'bg-blue-500'
    },
    {
      to: '/customizer',
      icon: Settings,
      title: 'Template Customizer',
      description: 'Fine-tune every aspect of your project structure',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Scalable Service Generator
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Generate production-ready, security-hardened service repositories following 
          Agile/DevOps/SRE principles with comprehensive compliance and dependency management.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {quickActions.map(({ to, icon: Icon, title, description, color }) => (
          <Link
            key={to}
            to={to}
            className="card p-6 hover:shadow-lg transition-all duration-200 group"
          >
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </Link>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Technology Support */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Supported Technologies
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Languages & Frameworks</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Go (Golang) with security scanning</li>
              <li>• Node.js/TypeScript with npm audit</li>
              <li>• Python with safety checks</li>
              <li>• Java/Spring Boot with OWASP</li>
              <li>• .NET Core with vulnerability scanning</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Deployment Platforms</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Kubernetes with security policies</li>
              <li>• AWS with IAM and encryption</li>
              <li>• Google Cloud Platform</li>
              <li>• Microsoft Azure</li>
              <li>• Docker Compose</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CI/CD Platforms</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• GitHub Actions with security</li>
              <li>• GitLab CI with SAST/DAST</li>
              <li>• Jenkins with security plugins</li>
              <li>• Azure DevOps</li>
              <li>• CircleCI with security orbs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
