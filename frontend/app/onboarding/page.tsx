'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome to AI Skin Intelligence',
      description: 'Let\'s get you started with personalized skincare analysis',
      icon: '🌟',
      content: (
        <div className="space-y-6">
          <div className="text-6xl text-center">🌟</div>
          <p className="text-lg text-foreground/80 text-center">
            AI Skin Intelligence uses advanced artificial intelligence and computer vision to analyze your skin and provide personalized recommendations.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'How It Works',
      description: 'Simple 3-step process',
      icon: '📸',
      content: (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Upload Photo</h3>
              <p className="text-sm text-muted-foreground">
                Take or upload a clear photo of your skin
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 font-bold text-accent-foreground">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your skin condition in seconds
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Get Results</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed insights and recommendations
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Key Features',
      description: 'Everything you need to track your skin health',
      icon: '✨',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">Smart Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get accurate skin type and condition detection
            </p>
          </div>
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">Personalized Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Tailored skincare routines and product suggestions
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your skin health journey over time
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-1">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Chat with our AI about any skincare questions
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Privacy & Data',
      description: 'Your data is secure with us',
      icon: '🔒',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Data Protection</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>All your data is encrypted end-to-end</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>We never share your data with third parties</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>You can export your data anytime</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Compliant with privacy regulations</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Ready to Begin?',
      description: 'Start your skin health journey',
      icon: '🚀',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">🚀</div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">All Set!</h3>
            <p className="text-muted-foreground">
              Your account is ready. Let\'s start analyzing your skin and get you personalized recommendations.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2 justify-center mb-4">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: i === currentStep ? 1 : 0.8 }}
                className={`h-2 rounded-full transition ${
                  i <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ width: i === currentStep ? 32 : 24 }}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 rounded-2xl space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">{steps[currentStep].icon}</div>
              <h2 className="text-3xl font-bold text-foreground">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step Content */}
            <div className="py-6">{steps[currentStep].content}</div>

            {/* Navigation */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-foreground font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
