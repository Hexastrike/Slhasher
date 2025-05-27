
import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function ProgressSteps({ currentStep, totalSteps, stepTitles }: ProgressStepsProps) {
  const progressPercentage = ((currentStep - 1) / Math.max(1, totalSteps - 1)) * 100;
  
  return (
    <div className="space-y-4 mb-6">
      <div className="relative pt-5">
        {/* Progress bar positioned underneath the step circles */}
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-muted absolute top-10 transform -translate-y-1/2 z-0 w-[calc(100%-20px)] mx-[10px]" 
        />
        
        {/* Step circles and labels */}
        <div className="flex justify-between relative z-10">
          {stepTitles.map((title, i) => (
            <div 
              key={i}
              className="flex flex-col items-center"
            >
              <div 
                className={cn(
                  "rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium mb-2 transition-colors",
                  i + 1 < currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : i + 1 === currentStep 
                      ? "bg-primary text-primary-foreground border-4 border-primary"
                      : "bg-secondary text-secondary-foreground"
                )}
              >
                {i + 1}
              </div>
              <span 
                className={cn(
                  "text-xs font-medium text-center",
                  i + 1 <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
