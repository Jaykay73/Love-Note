// =========================================================================
// App — Root application component
//
// Wires together all providers, the app shell, and the wizard step
// router. AuthProvider/WizardProvider/SendFlowProvider wrap everything,
// then AppShell provides the structural layout, and AppContent routes
// between the six wizard steps.
// =========================================================================

import { AuthProvider } from './contexts/AuthContext';
import { WizardProvider } from './contexts/WizardContext';
import { SendFlowProvider } from './contexts/SendFlowContext';
import AppShell from './components/layout/AppShell';
import UserInfo from './components/auth/UserInfo';
import WizardProgress, { WIZARD_STEPS } from './components/layout/WizardProgress';
import WelcomeStep from './components/welcome/WelcomeStep';
import UploadStep from './components/upload/UploadStep';
import ComposeStep from './components/compose/ComposeStep';
import ReviewStep from './components/review/ReviewStep';
import SendingStep from './components/sending/SendingStep';
import ResultStep from './components/result/ResultStep';
import { useWizard } from './hooks/useWizard';
import { useAuth } from './hooks/useAuth';

// -------------------------------------------------------------------------
// AppContent — Inner component that consumes wizard/auth context
//
// Must be rendered inside all three providers so it can use the hooks.
// Routes between the six wizard steps based on wizardState.currentStep
// and shows the wizard progress indicator on applicable steps.
// -------------------------------------------------------------------------

function AppContent() {
  const { state: wizardState, goToNextStep, goToPrevStep } = useWizard();
  const { state: authState } = useAuth();

  const currentStep = wizardState.currentStep;
  const isAuthenticated = authState.status === 'authenticated';

  // Show the progress bar on all steps except welcome and result
  const showWizardProgress =
    currentStep !== 'welcome' && currentStep !== 'result';

  return (
    <>
      {/* User info banner — only visible when signed in */}
      {isAuthenticated && (
        <div className="mb-6">
          <UserInfo />
        </div>
      )}

      {/* Wizard progress indicator */}
      {showWizardProgress && (
        <WizardProgress currentStep={currentStep} steps={WIZARD_STEPS} />
      )}

      {/* Step router */}
      {currentStep === 'welcome' && <WelcomeStep />}
      {currentStep === 'upload' && <UploadStep />}
      {currentStep === 'compose' && (
        <ComposeStep onNext={goToNextStep} onPrev={goToPrevStep} />
      )}
      {currentStep === 'review' && <ReviewStep />}
      {currentStep === 'sending' && <SendingStep />}
      {currentStep === 'result' && <ResultStep />}
    </>
  );
}

// -------------------------------------------------------------------------
// App — Root component
//
// Provider nesting order:
//   AuthProvider > WizardProvider > SendFlowProvider
//
// This ensures that all wizard and send-flow contexts can access auth
// state if needed, and that the step components can use any combination
// of the three hooks.
// -------------------------------------------------------------------------

export default function App() {
  return (
    <AuthProvider>
      <WizardProvider>
        <SendFlowProvider>
          <AppShell>
            <AppContent />
          </AppShell>
        </SendFlowProvider>
      </WizardProvider>
    </AuthProvider>
  );
}
