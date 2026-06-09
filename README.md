# 💌 Love Note

**Send personalized caring emails to your church family — using your own Gmail account.**

Love Note is a 100% browser-based tool that lets church staff and volunteers send personalized batch emails without any technical setup. Upload a spreadsheet, write a template with `{{first_name}}` placeholders, preview, and send — all from your browser. No data ever leaves your computer except to Google's Gmail API.

---

## ✨ Features

- **Sign in with Google** — Uses your existing Gmail account (send-only permission)
- **Upload spreadsheets** — Drag-and-drop Excel (.xlsx/.xls) or CSV files
- **Smart column detection** — Automatically finds Email, First Name, and Last Name columns
- **Personalized templates** — Use `{{first_name}}`, `{{last_name}}`, `{{full_name}}`, `{{email}}` placeholders
- **Live preview** — See exactly what each recipient will receive before sending
- **Progress tracking** — Watch emails send in real-time with a progress bar
- **Error handling** — Failed emails are listed with reasons; download the failed list to retry
- **100% private** — All processing happens in your browser. No server stores your contacts or messages.

---

## 🚀 Quick Start

### Prerequisites
- A Google account (consumer Gmail or Google Workspace)
- Node.js 18+ and npm

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/love-note-sender.git
cd love-note-sender

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

### Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Gmail API** (APIs & Services → Library → search "Gmail API")
4. Configure the **OAuth consent screen**:
   - Choose "External" user type
   - App name: "Love Note Sender"
   - Add your email as a test user (for development)
   - Scopes needed: `https://www.googleapis.com/auth/gmail.send` only
5. Create **OAuth 2.0 credentials** (Web application):
   - Add `http://localhost:5173` to Authorized JavaScript origins
   - Add `http://localhost:5173` to Authorized redirect URIs
6. Copy your **Client ID** and add it to `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The `dist/` folder contains static files that can be deployed to any static host (GitHub Pages, Netlify, Firebase Hosting, etc.)

---

## 🏗️ Architecture

```
love-note-sender/
├── index.html              # SPA shell with Google Identity Services script
├── src/
│   ├── App.tsx              # Root: AuthProvider > WizardProvider > SendFlowProvider
│   ├── main.tsx             # React entry point
│   ├── types/index.ts       # All shared TypeScript types
│   ├── services/            # Google API and file parsing services
│   │   ├── oauth.ts         # Google Identity Services (OAuth 2.0)
│   │   ├── gmail.ts         # Gmail API client (send + profile)
│   │   ├── fileParser.ts    # Excel/CSV file parsing (SheetJS + PapaParse)
│   │   └── mimeBuilder.ts   # RFC 2822 MIME message builder
│   ├── utils/               # Pure utility functions
│   │   ├── templateEngine.ts    # {{placeholder}} interpolation
│   │   ├── columnDetection.ts   # Smart header-to-field matching
│   │   ├── validators.ts        # Email validation + dedup detection
│   │   ├── csvExport.ts         # Failed list → CSV download
│   │   └── rateLimiter.ts       # Backoff calculation + quota checks
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── WizardContext.tsx     # Wizard step navigation
│   │   └── SendFlowContext.tsx   # File, recipients, template, results
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts           # Auth context consumer
│   │   ├── useWizard.ts         # Wizard context consumer
│   │   ├── useSendFlow.ts       # Send-flow context consumer
│   │   ├── useFileParser.ts     # File → parse → detect → validate pipeline
│   │   ├── useSendQueue.ts      # Core sending engine (sequential + backoff)
│   │   └── useDebounce.ts       # Generic debounce hook
│   └── components/          # React components (6 wizard steps + common UI)
│       ├── common/          # Button, Card, Badge, Spinner, Modal, Toast, ErrorBoundary
│       ├── layout/          # AppShell, Header, WizardProgress, NavigationButtons
│       ├── auth/            # SignInButton, UserInfo, AuthGuard
│       ├── welcome/         # WelcomeStep (landing page)
│       ├── upload/          # UploadStep, DropZone, ColumnMapper, DataPreviewTable
│       ├── compose/         # ComposeStep, SubjectField, MessageBodyEditor, LivePreview
│       ├── review/          # ReviewStep, PreviewCard, SendChecklist
│       ├── sending/         # SendingStep, ProgressBar, SendStatus, CancelDialog
│       └── result/          # ResultStep, SuccessSummary, FailureList, ExportButton
```

### Key Design Decisions

- **No backend server** — 100% client-side SPA. All data in browser memory.
- **No React Router** — Linear wizard uses a `useReducer` state machine with 6 explicit steps.
- **No localStorage for tokens** — OAuth access token lives only in memory (privacy-first).
- **Gmail API via raw fetch** — Lighter than the `gapi` client library; full control over error handling.
- **Sequential send loop** — Emails sent one-by-one with exponential backoff on rate limits (429).

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Test stack: **Vitest** + **React Testing Library** + **MSW** (for Gmail API mocking).

- **133 tests** across 10 test files
- Unit tests for all utility functions and services
- Component tests for key UI components (DropZone, ColumnMapper, ComposeStep, ResultStep)

---

## 🔒 Privacy & Security

- **Minimal OAuth scope**: `gmail.send` only — no read, modify, or delete permissions
- **No data storage**: Recipient lists, email content, and previews exist only in browser memory
- **No third-party servers**: All processing happens locally; only Google's Gmail API receives data
- **CSP protection**: Content Security Policy prevents XSS and restricts network requests
- **Token in memory only**: OAuth access token is never written to localStorage or cookies

---

## 📋 Gmail Sending Limits

- **Consumer Gmail**: 500 recipients per day
- **Google Workspace**: 2,000 recipients per day
- **Send rate**: ~1 email per second

The app warns you before sending if your batch exceeds your estimated remaining daily quota.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Auth | Google Identity Services (OAuth 2.0) |
| Excel | SheetJS (xlsx) |
| CSV | Papa Parse |
| Testing | Vitest + React Testing Library + MSW |

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built for church communities who want to stay connected with their members through personal, caring communication — without needing technical expertise.
