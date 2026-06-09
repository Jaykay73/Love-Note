import React from 'react';
import Button from '../common/Button';

/**
 * Props for the NavigationButtons component.
 */
export interface NavigationButtonsProps {
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  nextDisabled?: boolean;
  showNext?: boolean;
  showPrev?: boolean;
  nextLoading?: boolean;
}

/**
 * A row of Previous/Next navigation buttons for the wizard.
 *
 * - "Previous" is a ghost button on the left, hidden when `onPrev` is not provided.
 * - "Next" is a primary button on the right, hidden when `showNext` is false.
 * - Supports loading state and disabled state for the Next button.
 */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onPrev,
  nextLabel = 'Next',
  prevLabel = 'Back',
  nextDisabled = false,
  showNext = true,
  showPrev = true,
  nextLoading = false,
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 border-t border-rose-100 mt-8 gap-3 sm:gap-0">
      {/* Previous button — left side */}
      {showPrev && onPrev ? (
        <Button variant="ghost" onClick={onPrev} className="w-full sm:w-auto justify-center">
          <svg
            className="h-4 w-4 mr-1 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {prevLabel}
        </Button>
      ) : (
        <div /> /* spacer to keep Next on the right */
      )}

      {/* Next button — right side */}
      {showNext && (
        <Button
          variant="primary"
          onClick={onNext}
          disabled={nextDisabled}
          loading={nextLoading}
          className="w-full sm:w-auto justify-center"
        >
          {nextLabel}
          <svg
            className="h-4 w-4 ml-1 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
