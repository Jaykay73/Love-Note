import React from 'react';
import type { WizardStep } from '../../types';

/**
 * Props for the WizardProgress component.
 */
export interface WizardProgressProps {
  currentStep: WizardStep;
  steps: Array<{ key: WizardStep; label: string }>;
}

/** Default wizard step definitions. */
export const WIZARD_STEPS: Array<{ key: WizardStep; label: string }> = [
  { key: 'welcome', label: 'Sign In' },
  { key: 'upload', label: 'Upload' },
  { key: 'compose', label: 'Compose' },
  { key: 'review', label: 'Review' },
  { key: 'sending', label: 'Send' },
  { key: 'result', label: 'Done' },
];

/** Map wizard step keys to their numeric index (1-based) for small-screen display. */
const STEP_NUMBERS: Record<WizardStep, number> = {
  welcome: 1,
  upload: 2,
  compose: 3,
  review: 4,
  sending: 5,
  result: 6,
};

/**
 * Horizontal step indicator bar for the wizard.
 *
 * - Current step is highlighted in blue.
 * - Completed steps show a green checkmark.
 * - Future steps are gray.
 * - Responsive: shows step numbers only on small screens, labels + indicators on desktop.
 */
const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, steps }) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Wizard progress" className="mb-8">
      <ol className="flex items-center justify-center gap-0 sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          // Dot indicator styling
          const colorMap = {
            completed: 'bg-emerald-400 text-white',
            current: 'bg-rose-500 text-white ring-4 ring-rose-200',
            future: 'bg-gray-200 text-gray-400',
          };

          const dotColor = isCompleted
            ? colorMap.completed
            : isCurrent
              ? colorMap.current
              : colorMap.future;

          const dotClasses = [
            'flex items-center justify-center rounded-full text-sm font-semibold transition-colors',
            'h-8 w-8 shrink-0',
            dotColor,
          ].join(' ');

          // Label color
          const labelColor = isCurrent
            ? 'text-rose-600 font-semibold'
            : isCompleted
              ? 'text-emerald-600'
              : 'text-gray-400';

          const labelClasses = [
            'text-sm font-medium truncate',
            labelColor,
          ].join(' ');

          return (
            <li
              key={step.key}
              className="flex items-center gap-2 px-1 sm:px-3 py-2 rounded-lg transition-colors"
              aria-label={`${step.label}${isCurrent ? ' (current step)' : isCompleted ? ' (completed)' : ''}`}
            >
              <span className={dotClasses} aria-current={isCurrent ? 'step' : undefined}>
                {/* On mobile: always show step number. On desktop: checkmark for completed, number otherwise. */}
                {isCompleted ? (
                  <svg
                    className="h-4 w-4 hidden sm:block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : null}
                <span className={isCompleted ? 'sm:hidden' : ''}>
                  {STEP_NUMBERS[step.key]}
                </span>
              </span>

              {/* Label: hidden on small screens */}
              <span className={`${labelClasses} hidden sm:inline`}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default WizardProgress;
