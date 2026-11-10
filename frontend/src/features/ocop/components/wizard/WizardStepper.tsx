import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  steps: { num: number; title: string }[];
  currentStep: number;
  onSelectStep: (step: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  currentStep,
  onSelectStep,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <button
              type="button"
              onClick={() => onSelectStep(s.num)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                currentStep === s.num
                  ? 'text-emerald-800 font-extrabold'
                  : currentStep > s.num
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs transition-all ${
                  currentStep === s.num
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-300'
                    : currentStep > s.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span>{s.title}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className="hidden md:block flex-1 h-[2px] bg-slate-200 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
