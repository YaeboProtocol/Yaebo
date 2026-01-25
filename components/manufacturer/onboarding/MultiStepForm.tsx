import React, { ReactNode, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

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

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    // Mark current step as completed
    setCompletedSteps({
      ...completedSteps,
      [steps[currentStepIndex].id]: true,
    });

    // Move to next step
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

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Steps Navigation */}
      <nav aria-label="Progress" className="mb-10">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[step.id];
            const isCurrent = index === currentStepIndex;
            const isClickable = isCompleted || isCurrent || (index === currentStepIndex + 1 && step.optional);

            return (
              <li
                key={step.id}
                className={`relative ${index !== 0 ? 'pl-6 sm:pl-8' : ''} ${
                  index !== steps.length - 1 ? 'pr-6 sm:pr-8' : ''
                } flex-1 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={() => handleStepClick(index)}
              >
                {index !== 0 && (
                  <div
                    className={`absolute inset-0 flex items-center`}
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-0.5 w-full",
                        isCompleted ? "bg-primary" : "bg-gray-200"
                      )}
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-sm transition-colors",
                    isCompleted ? "bg-primary" :
                    isCurrent ? "bg-primary" : "bg-gray-100"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  ) : (
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isCurrent ? "bg-primary-foreground" : "bg-gray-400"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="ml-3 mt-2">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent ? "text-primary font-semibold" : 
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.optional && (
                    <span className="text-xs text-gray-500 ml-1">(Optional)</span>
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
            "px-6",
            currentStepIndex === 0 && "opacity-50 cursor-not-allowed"
          )}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex items-center px-6"
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 