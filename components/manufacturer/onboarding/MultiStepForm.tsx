import React, { ReactNode, useState, createContext, useContext } from 'react';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

// Create context for handling step completion
interface StepContextType {
  completeStep: () => void;
}

const StepContext = createContext<StepContextType | undefined>(undefined);

// Hook to use step completion
export function useStepCompletion() {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useStepCompletion must be used within a MultiStepForm');
  }
  return context;
}

interface Step {
  id: string;
  title: string;
  content: ReactNode;
  optional?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  initialStep?: number;
}

export default function MultiStepForm({
  steps,
  onComplete,
  initialStep = 0,
}: MultiStepFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const isLastStep = currentStepIndex === steps.length - 1;

  // This function will be called from each form's onSubmit
  const handleStepComplete = () => {
    // Mark current step as completed
    setCompletedSteps({
      ...completedSteps,
      [steps[currentStepIndex].id]: true,
    });

    // If it's the last step, complete the entire process
    if (isLastStep) {
      onComplete();
      return;
    }

    // Otherwise, move to the next step
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepClick = (index: number) => {
    // Only allow clicking on completed steps or the next available step
    if (
      completedSteps[steps[index].id] ||
      index === currentStepIndex ||
      (index === currentStepIndex + 1 && steps[index].optional)
    ) {
      setCurrentStepIndex(index);
    }
  };

  // Create context value
  const contextValue: StepContextType = {
    completeStep: handleStepComplete
  };

  return (
    <StepContext.Provider value={contextValue}>
      <div className="w-full max-w-6xl mx-auto">
        {/* Step Progress Indicator */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-gray-600">
              {Math.floor(((currentStepIndex + (Object.keys(completedSteps).length === steps.length ? 1 : 0)) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ 
                width: `${((currentStepIndex + (Object.keys(completedSteps).length === steps.length ? 1 : 0)) / steps.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Steps Navigation */}
        <nav aria-label="Progress" className="mb-10">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps[step.id];
              const isCurrent = index === currentStepIndex;
              const isClickable = isCompleted || isCurrent || (index === currentStepIndex + 1 && step.optional);
              
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center relative group",
                    isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  {/* Connecting line */}
                  {index !== 0 && (
                    <div className="absolute top-4 -left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                      <div 
                        className={cn(
                          "h-0.5 transition-all duration-300",
                          isCompleted || isCurrent ? "bg-primary" : "bg-gray-200"
                        )}
                        style={{
                          width: isCompleted ? "100%" : isCurrent ? "50%" : "0%"
                        }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Step circle */}
                  <div
                    className={cn(
                      "z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200",
                      isCompleted 
                        ? "border-primary bg-primary text-white" 
                        : isCurrent 
                          ? "border-primary bg-white text-primary shadow-sm ring-2 ring-primary ring-offset-2" 
                          : "border-gray-300 bg-white text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Step title */}
                  <div className="mt-3 text-center">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-primary" : 
                        isCompleted ? "text-gray-900" : "text-gray-500"
                      )}
                    >
                      {step.title}
                    </span>
                    {step.optional && (
                      <span className="block text-xs text-gray-500">(Optional)</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Current Step Content */}
        <div className="bg-white shadow-md rounded-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{steps[currentStepIndex].title}</h2>
          {steps[currentStepIndex].content}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            variant="outline"
            className={cn(
              "px-6 flex items-center",
              currentStepIndex === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        </div>
      </div>
    </StepContext.Provider>
  );
} 