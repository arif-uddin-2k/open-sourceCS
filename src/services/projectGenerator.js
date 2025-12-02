import { templates } from './templates'

// Helper functions - exported so they can be used by templates
export const getDependabotEcosystem = (techStack) => {
  const ecosystems = {
    go: 'gomod',
    nodejs: 'npm',
    python: 'pip',
    java: 'maven',
    dotnet: 'nuget'
  }
  return ecosystems[techStack] || 'gomod'
}

export const getSetupAction = (techStack) => {
  const actions = {
    go: 'actions/setup-go@v3',
    nodejs: 'actions/setup-node@v3',
    python: 'actions/setup-python@v3',
    java: 'actions/setup-java@v3',
    dotnet: 'actions/setup-dotnet@v3'
  }
  return actions[techStack] || 'actions/setup-go@v3'
}

export const getSetupActionConfig = (techStack) => {
  const configs = {
    go: 'go-version: 1.21',
    nodejs: 'node-version: 18',
    python: 'python-version: 3.11',
    java: 'java-version: 17',
    dotnet: 'dotnet-version: 7.0'
  }
  return configs[techStack] || 'go-version: 1.21'
}

export const getInstallCommand = (techStack) => {
  const commands = {
    go: 'go mod download',
    nodejs: 'npm ci',
    python: 'pip install -r requirements.txt',
    java: 'mvn dependency:resolve',
    dotnet: 'dotnet restore'
  }
  return commands[techStack] || 'go mod download'
}

export const getTestCommand = (techStack) => {
  const commands = {
    go: 'go test ./...',
    nodejs: 'npm test',
    python: 'pytest',
    java: 'mvn test',
    dotnet: 'dotnet test'
  }
  return commands[techStack] || 'go test ./...'
}

export const getSecurityScanCommand = (techStack) => {
  const commands = {
    go: 'go run github.com/securecodewarrior/gosec/v2/cmd/gosec@latest ./...',
    nodejs: 'npm audit',
    python: 'safety check',
    java: 'mvn org.owasp:dependency-check-maven:check',
    dotnet: 'dotnet list package --vulnerable'
  }
  return commands[techStack] || 'echo "No security scan configured"'
}

export const getBuildCommand = (techStack) => {
  const commands = {
    go: 'go build -o bin/app ./cmd/server',
    nodejs: 'npm run build',
    python: 'python -m build',
    java: 'mvn package',
    dotnet: 'dotnet build'
  }
  return commands[techStack] || 'go build -o bin/app ./cmd/server'
}

export const generateProject = async (config) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const template = templates[config.techStack]
    if (!template) {
      throw new Error(`Unsupported technology stack: ${config.techStack}`)
    }
    
    // Generate base project structure
    const files = template.generateFiles(config)
    
    // Add security configurations
    if (config.securityFeatures?.includes('sast')) {
      files.push(...generateSASTConfig(config))
    }
    
    if (config.securityFeatures?.includes('dependency-scan')) {
      files.push(...generateDependencyScanConfig(config))
    }
    
    // Add deployment configurations
    if (config.deploymentPlatform === 'kubernetes') {
      files.push(...generateKubernetesConfig(config))
    }
    
    // Add CI/CD configurations
    if (config.cicdPlatform === 'github') {
      files.push(...generateGitHubActionsConfig(config))
    }
    
    // Add monitoring configurations
    if (config.monitoringTools?.includes('prometheus')) {
      files.push(...generatePrometheusConfig(config))
    }
    
    // Add custom files
    if (config.customFiles) {
      files.push(...config.customFiles.map(file => ({
        path: file.path,
        content: file.content
      })))
    }
    
    return {
      name: config.projectName,
      techStack: config.techStack,
      deploymentPlatform: config.deploymentPlatform,
      securityFeatures: config.securityFeatures,
      complianceFrameworks: config.complianceFrameworks,
      monitoringTools: config.monitoringTools,
      files
    }
  } catch (error) {
    console.error('Project generation failed:', error)
    throw error
  }
}

const generateSASTConfig = (config) => {
  const files = []
  
  try {
    if (config.techStack === 'go') {
      files.push({
        path: '.github/workflows/security.yml',
        content: `name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  gosec:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-go@v3
      with:
        go-version: 1.21
    - name: Run Gosec Security Scanner
      uses: securecodewarrior/github-action-gosec@master
      with:
        args: './...'
`
      })
    }
  } catch (error) {
    console.error('Failed to generate SAST config:', error)
  }
  
  return files
}

const generateDependencyScanConfig = (config) => {
  const files = []
  
  try {
    files.push({
      path: '.github/dependabot.yml',
      content: `version: 2
updates:
  - package-ecosystem: "${getDependabotEcosystem(config.techStack)}"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    assignees:
      - "security-team"
`
    })
  } catch (error) {
    console.error('Failed to generate dependency scan config:', error)
  }
  
  return files
}

const generateKubernetesConfig = (config) => {
  const files = []
  
  try {
    files.push(
      {
        path: 'deployments/k8s/base/deployment.yaml',
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.projectName}
  labels:
    app: ${config.projectName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${config.projectName}
  template:
    metadata:
      labels:
        app: ${config.projectName}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: ${config.projectName}
        image: ${config.projectName}:latest
        ports:
        - containerPort: 8080
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
`
      },
      {
        path: 'deployments/k8s/base/service.yaml',
        content: `apiVersion: v1
kind: Service
metadata:
  name: ${config.projectName}
  labels:
    app: ${config.projectName}
spec:
  selector:
    app: ${config.projectName}
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
`
      }
    )
  } catch (error) {
    console.error('Failed to generate Kubernetes config:', error)
  }
  
  return files
}

const generateGitHubActionsConfig = (config) => {
  const files = []
  
  try {
    files.push({
      path: '.github/workflows/ci.yml',
      content: `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup ${config.techStack}
      uses: ${getSetupAction(config.techStack)}
      with:
        ${getSetupActionConfig(config.techStack)}
    
    - name: Install dependencies
      run: ${getInstallCommand(config.techStack)}
    
    - name: Run tests
      run: ${getTestCommand(config.techStack)}
    
    - name: Run security scan
      run: ${getSecurityScanCommand(config.techStack)}
    
    - name: Build
      run: ${getBuildCommand(config.techStack)}
    
    - name: Build Docker image
      run: docker build -t ${config.projectName}:\${{ github.sha }} .
`
    })
  } catch (error) {
    console.error('Failed to generate GitHub Actions config:', error)
  }
  
  return files
}

const generatePrometheusConfig = (config) => {
  const files = []
  
  try {
    files.push(
      {
        path: 'monitoring/prometheus/prometheus.yml',
        content: `global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: '${config.projectName}'
    static_configs:
      - targets: ['${config.projectName}:8080']
    metrics_path: /metrics
    scrape_interval: 10s
`
      },
      {
        path: 'monitoring/grafana/dashboards/service-dashboard.json',
        content: JSON.stringify({
          dashboard: {
            title: `${config.projectName} Dashboard`,
            panels: [
              {
                title: "Request Rate",
                type: "graph",
                targets: [
                  {
                    expr: `rate(http_requests_total{job="${config.projectName}"}[5m])`
                  }
                ]
              }
            ]
          }
        }, null, 2)
      }
    )
  } catch (error) {
    console.error('Failed to generate Prometheus config:', error)
  }
  
  return files
}
