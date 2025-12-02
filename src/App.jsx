import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import QuickSetup from './components/QuickSetup'
import InteractiveWizard from './components/InteractiveWizard'
import TemplateCustomizer from './components/TemplateCustomizer'
import GeneratedOutput from './components/GeneratedOutput'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [generatedProject, setGeneratedProject] = useState(null)

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route 
                path="/quick-setup" 
                element={<QuickSetup onGenerate={setGeneratedProject} />} 
              />
              <Route 
                path="/wizard" 
                element={<InteractiveWizard onGenerate={setGeneratedProject} />} 
              />
              <Route 
                path="/customizer" 
                element={<TemplateCustomizer onGenerate={setGeneratedProject} />} 
              />
              <Route 
                path="/output" 
                element={<GeneratedOutput project={generatedProject} />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
