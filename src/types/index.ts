// =========================================================================
// Auth Types
// =========================================================================

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: UserProfile | null;
  error: string | null;
  isInitialized: boolean;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { accessToken: string; user: UserProfile } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'TOKEN_REFRESHED'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_INITIALIZED' };

// =========================================================================
// Wizard Types
// =========================================================================

export type WizardStep =
  | 'welcome'
  | 'upload'
  | 'compose'
  | 'review'
  | 'sending'
  | 'result';

export interface WizardState {
  currentStep: WizardStep;
  direction: 'forward' | 'backward';
  history: WizardStep[];
}

export type WizardAction =
  | { type: 'GO_TO_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

// =========================================================================
// File Parsing & Column Mapping
// =========================================================================

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  fileType: 'xlsx' | 'csv';
  totalRows: number;
}

export interface ColumnDetection {
  email: { column: string | null; confidence: 'high' | 'medium' | 'low' };
  firstName: { column: string | null; confidence: 'high' | 'medium' | 'low' };
  lastName: { column: string | null; confidence: 'high' | 'medium' | 'low' };
}

export interface ColumnMapping {
  emailColumn: string;
  firstNameColumn: string;
  lastNameColumn: string;
}

export interface Recipient {
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  rowIndex: number;
}

export interface InvalidRow {
  rowIndex: number;
  raw: Record<string, string>;
  reasons: Array<'empty-email' | 'invalid-email' | 'duplicate-email'>;
}

export interface RecipientValidation {
  valid: Recipient[];
  invalid: InvalidRow[];
  duplicateCount: number;
  skippedCount: number;
}

// =========================================================================
// Message Template
// =========================================================================

export interface MessageTemplate {
  subject: string;
  body: string;
  fromName: string;
}

export type PlaceholderKey = '{{first_name}}' | '{{last_name}}' | '{{full_name}}' | '{{email}}';

// =========================================================================
// Send Queue
// =========================================================================

export type SendStatus = 'idle' | 'sending' | 'paused' | 'completed' | 'cancelled' | 'recovering-auth';

export interface SendProgress {
  status: SendStatus;
  sent: number;
  failed: number;
  total: number;
  currentRecipientName: string;
  currentRecipientEmail: string;
  lastSuccessfullySentIndex: number;
}

export interface SendResult {
  recipient: Recipient;
  status: 'sent' | 'failed';
  error?: string;
  errorType?: 'rate-limit' | 'permanent' | 'auth-expired' | 'network' | 'quota-exceeded';
  messageId?: string;
}

// =========================================================================
// Combined Send Flow State
// =========================================================================

export interface SendFlowState {
  parsedFile: ParsedFile | null;
  columnDetection: ColumnDetection | null;
  columnMapping: ColumnMapping | null;
  isMappingConfirmed: boolean;
  recipients: Recipient[];
  validation: RecipientValidation | null;
  skipInvalidRows: boolean;
  template: MessageTemplate;
  sendProgress: SendProgress;
  sendResults: SendResult[];
  recipientPreviewIndices: number[];
}

export type SendFlowAction =
  | { type: 'SET_PARSED_FILE'; payload: ParsedFile }
  | { type: 'SET_COLUMN_DETECTION'; payload: ColumnDetection }
  | { type: 'SET_COLUMN_MAPPING'; payload: ColumnMapping }
  | { type: 'CONFIRM_MAPPING' }
  | { type: 'SET_RECIPIENTS'; payload: { recipients: Recipient[]; validation: RecipientValidation } }
  | { type: 'SET_SKIP_INVALID'; payload: boolean }
  | { type: 'UPDATE_TEMPLATE'; payload: Partial<MessageTemplate> }
  | { type: 'GENERATE_PREVIEW_INDICES' }
  | { type: 'SET_SEND_PROGRESS'; payload: Partial<SendProgress> }
  | { type: 'ADD_SEND_RESULT'; payload: SendResult }
  | { type: 'SEND_COMPLETE' }
  | { type: 'RESET' };
