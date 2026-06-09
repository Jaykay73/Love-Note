// =========================================================================
// UploadStep — File upload step orchestrator
//
// Wires together the DropZone, ColumnMapper, DataPreviewTable, and
// ValidationWarnings components. Manages the file processing flow via
// the useFileParser hook.
//
// Provides Back / Next navigation via NavigationButtons.
// Next is disabled until the mapping includes an email column and there
// is at least one valid recipient.
// =========================================================================

import { useFileParser } from '../../hooks/useFileParser';
import { useWizard } from '../../hooks/useWizard';
import { useSendFlow } from '../../hooks/useSendFlow';
import Card from '../common/Card';
import NavigationButtons from '../layout/NavigationButtons';
import DropZone from './DropZone';
import ColumnMapper from './ColumnMapper';
import DataPreviewTable from './DataPreviewTable';
import ValidationWarnings from './ValidationWarnings';

/**
 * The Upload step — the second step in the wizard.
 *
 * Guides the user through:
 * 1. Dropping / selecting an Excel or CSV file
 * 2. Reviewing the auto-detected column mapping (with option to adjust)
 * 3. Previewing the data
 * 4. Reviewing validation results
 * 5. Proceeding to the Compose step
 */
export default function UploadStep() {
  const { goToNextStep, goToPrevStep } = useWizard();
  const { dispatch: sendFlowDispatch } = useSendFlow();
  const {
    parsedFile,
    detection,
    mapping,
    validation,
    isProcessing,
    error,
    handleFile,
    updateMapping,
    getValidRecipients,
  } = useFileParser();

  // -------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------

  const hasEmailColumn = Boolean(mapping.emailColumn);
  const hasValidRecipients = validation !== null && validation.valid.length > 0;
  const canProceed = hasEmailColumn && hasValidRecipients;

  // -------------------------------------------------------------------
  // Save recipients to SendFlowContext before navigating to Compose
  // -------------------------------------------------------------------

  const handleContinue = () => {
    if (!parsedFile || !detection || !validation) return;

    // Persist the file, column detection, and mapping to shared state
    sendFlowDispatch({ type: 'SET_PARSED_FILE', payload: parsedFile });
    sendFlowDispatch({ type: 'SET_COLUMN_DETECTION', payload: detection });
    sendFlowDispatch({ type: 'SET_COLUMN_MAPPING', payload: mapping });

    // Persist the validated recipients so the Compose/Review/Send steps can use them
    sendFlowDispatch({
      type: 'SET_RECIPIENTS',
      payload: {
        recipients: getValidRecipients(),
        validation,
      },
    });

    goToNextStep();
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-sky-700">📋 Upload Your Contact List</h2>
        <p className="mt-1 text-sm text-sky-500">
          Upload an Excel or CSV file containing your church members' contact
          information. All processing happens locally in your browser.
        </p>
      </div>

      {/* --- Drop zone --- */}
      <Card padding="md">
        <DropZone
          onFileSelected={handleFile}
          isProcessing={isProcessing}
          error={error}
        />
      </Card>

      {/* --- Column mapping --- */}
      {parsedFile && detection && !isProcessing && (
        <Card padding="md">
          <h3 className="mb-3 text-sm font-bold text-violet-700">🔗 Column Mapping</h3>
          <p className="mb-4 text-xs text-gray-500">
            Tell us which columns contain the email address, first name, and last
            name. Email is required; names are optional but help personalize your
            messages.
          </p>
          <ColumnMapper
            headers={parsedFile.headers}
            detection={detection}
            mapping={mapping}
            onChange={updateMapping}
          />
        </Card>
      )}

      {/* --- Data preview --- */}
      {parsedFile && !isProcessing && (
        <Card padding="md">
          <h3 className="mb-3 text-sm font-bold text-teal-700">📊 Data Preview</h3>
          <DataPreviewTable
            headers={parsedFile.headers}
            rows={parsedFile.rows}
            mapping={mapping}
          />
        </Card>
      )}

      {/* --- Validation warnings --- */}
      {validation && !isProcessing && (
        <Card padding="md">
          <h3 className="mb-3 text-sm font-bold text-amber-700">✅ Validation</h3>
          <ValidationWarnings validation={validation} />
        </Card>
      )}

      {/* --- Navigation --- */}
      <NavigationButtons
        onPrev={goToPrevStep}
        onNext={canProceed ? handleContinue : undefined}
        nextDisabled={!canProceed}
        prevLabel="Back"
        nextLabel="Continue to Compose"
      />

      {/* --- Next-disabled hint --- */}
      {!canProceed && parsedFile && !isProcessing && (
        <p
          className="-mt-4 text-center text-xs text-gray-400"
          role="status"
          aria-live="polite"
        >
          {!hasEmailColumn
            ? 'Please select an email column to continue.'
            : 'No valid recipients found. Check your data and mapping.'}
        </p>
      )}
    </div>
  );
}
