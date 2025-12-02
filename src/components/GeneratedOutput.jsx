import React, { useState } from 'react'
import { Download, Eye, Copy, Check, FileText, Folder } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const GeneratedOutput = ({ project }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [copiedFile, setCopiedFile] = useState(null)

  if (!project) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          No Project Generated
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Generate a project first to see the output here.
        </p>
      </div>
    )
  }

  const downloadProject = async () => {
    const zip = new JSZip()
    
    // Add all files to the zip
    project.files.forEach(file => {
      zip.file(file.path, file.content)
    })
    
    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${project.name}.zip`)
  }

  const copyToClipboard = async (content, fileName) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(fileName)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getFileLanguage = (fileName) => {
    const ext = fileName.split('.').pop()
    const languageMap = {
      'go': 'go',
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'yml': 'yaml',
      'yaml': 'yaml',
      'json': 'json',
      'md': 'markdown',
      'dockerfile': 'docker',
      'tf': 'hcl',
      'sh': 'bash'
    }
    return languageMap[ext] || 'text'
  }

  const renderFileTree = (files) => {
    const tree = {}
    
    files.forEach(file => {
      const parts = file.path.split('/')
      let current = tree
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = file
        } else {
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part]
        }
      })
    })
    
    const renderNode = (node, path = '') => {
      return Object.entries(node).map(([key, value]) => {
        const fullPath = path ? `${path}/${key}` : key
        
        if (value.path) {
          // It's a file
          return (
            <div
              key={value.path}
              className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedFile?.path === value.path ? 'bg-primary-100 dark:bg-primary-900' : ''
              }`}
              onClick={() => setSelectedFile(value)}
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
            </div>
          )
        } else {
          // It's a directory
          return (
            <details key={fullPath} open>
              <summary className="flex items-center space-x-2 py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Folder className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</span>
              </summary>
              <div className="ml-4 border-l border-gray-200 dark:border-gray-600 pl-2">
                {renderNode(value, fullPath)}
              </div>
            </details>
          )
        }
      })
    }
    
    return renderNode(tree)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Generated Project: {project.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {project.files.length} files generated • {project.techStack} • {project.deploymentPlatform}
          </p>
        </div>
        
        <button
          onClick={downloadProject}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download ZIP</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* File Tree */}
        <div className="lg:col-span-1">
          <div className="card p-4 h-[600px] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Structure
            </h2>
            <div className="space-y-1">
              {renderFileTree(project.files)}
            </div>
          </div>
        </div>

        {/* File Content */}
        <div className="lg:col-span-3">
          <div className="card p-6 h-[600px] flex flex-col">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedFile.path}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(selectedFile.content, selectedFile.path)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      {copiedFile === selectedFile.path ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedFile === selectedFile.path ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <SyntaxHighlighter
                    language={getFileLanguage(selectedFile.path)}
                    style={tomorrow}
                    className="h-full overflow-y-auto rounded-lg"
                    showLineNumbers
                  >
                    {selectedFile.content}
                  </SyntaxHighlighter>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Select a File
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose a file from the project structure to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Security Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {project.securityFeatures?.map((feature) => (
              <li key={feature} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{feature.replace('-', ' ').toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Compliance
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {project.complianceFrameworks?.map((framework) => (
              <li key={framework} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{framework.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Monitoring
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {project.monitoringTools?.map((tool) => (
              <li key={tool} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GeneratedOutput
