'use client'

type Step = 'brief' | 'concepts' | 'images' | 'library'

interface StepIndicatorProps {
  currentStep: Step
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps: { id: Step; label: string }[] = [
    { id: 'brief', label: 'Brief' },
    { id: 'concepts', label: 'Concepts' },
    { id: 'images', label: 'Images' },
    { id: 'library', label: 'Library' }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            {/* Step circle with number */}
            <div 
              className={`
                flex items-center justify-center w-10 h-10 rounded-full
                border-2 font-bold mb-2
                ${currentStep === step.id 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-500 border-gray-300'}
              `}
            >
              {index + 1}
            </div>
            
            {/* Step label */}
            <span 
              className={`
                text-sm font-medium
                ${currentStep === step.id 
                  ? 'text-blue-600 font-bold' 
                  : 'text-gray-500'}
              `}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Connecting lines */}
      <div className="relative flex h-0.5 mt-5 mb-5">
        <div className="absolute w-full bg-gray-200 h-0.5 top-0"></div>
        {/* Progress line */}
        <div 
          className="absolute h-0.5 bg-blue-600" 
          style={{
            width: (() => {
              switch(currentStep) {
                case 'brief': return '0%';
                case 'concepts': return '33.3%';
                case 'images': return '66.7%';
                case 'library': return '100%';
                default: return '0%';
              }
            })()
          }}
        ></div>
      </div>
    </div>
  )
}