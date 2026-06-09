# Product Requirements Document (PRD): Church Love Note Sender

| | |
|------|------|
| **Project Name** | Church Love Note Sender |
| **Version** | 1.0 |
| **Date** | 2026-06-09 |
| **Status** | Draft |
| **Author** | [Your Name] |

---

## 1. Executive Summary

**Church Love Note Sender** is a simple, browser-based web application that enables church staff and volunteers to send personalized, caring emails to multiple congregants at once. The user logs in with their existing Gmail account, uploads a spreadsheet of recipients (name and email), writes a single template message with placeholders like `{{first_name}}`, previews the personalized messages, and sends them in one batch. All emails are sent from the user’s own Gmail address—replies come straight back to the sender, maintaining personal connection.

This tool replaces the need for manual, one-by-one emails, complex mail merges, or Google Apps Script solutions that require technical expertise. It is designed for **non-technical users**, with an interface that guides them step‑by‑step from login to send confirmation.

---

## 2. Problem Statement

Churches want to stay connected with their members through personal check‑ins, encouragement, and prayer follow‑ups. Today they have two poor options:

- **Manual emails** – time‑consuming, error‑prone, can’t scale beyond a few dozen people.
- **Google Apps Script / Mail Merge** – powerful but too technical; requires editing scripts, understanding quotas, and troubleshooting. The intended sender (often a pastor’s assistant or volunteer coordinator) is not comfortable with code or spreadsheet formulas.

There is no “dead‑simple,” free, privacy‑respecting tool that lets a church member send personalized batch emails using their own Gmail account.

---

## 3. Target Audience & User Personas

### Primary Persona: **Volunteer Care Coordinator**
- **Name**: Mary
- **Tech Level**: Can use Excel, Gmail, and Facebook. Finds Google Apps Script intimidating.
- **Goal**: Send a monthly “thinking of you” email to 50–200 members. Wants each email to feel personal, not like a newsletter blast.
- **Frustrations**: Current methods require her to copy‑paste names one by one or use a confusing “mail merge” add‑on. She worries about accidentally emailing everyone at once with the wrong name.

### Secondary Persona: **Pastor / Ministry Leader**
- **Name**: Pastor James
- **Tech Level**: Medium – uses tools but has no time to learn new software.
- **Goal**: Rapidly send follow‑ups after a Sunday service to visitors who filled out a connect card. Needs to upload the list, type a quick note, and send without hassle.

---

## 4. Goals & Success Metrics

### Business / Ministry Goals
- Increase frequency of personal touchpoints by removing technical friction.
- Empower non‑technical volunteers to manage member care communication.
- Maintain security and privacy—no data ever stored on third‑party servers.

### Product Goals (v1)
1. **0‑learning‑curve sending**: A user can go from opening the app to sending 100 personalized emails in under 5 minutes (after first OAuth consent).
2. **100% client‑side**: No backend server stores email addresses, names, or message content.
3. **Error‑proofing**: Prevent common mistakes (wrong column mapping, invalid emails, missing placeholders) with clear, non‑technical error messages.
4. **Transparency**: Show the user exactly what will be sent before they click send.

### Success Metrics
- Task completion rate: > 90% of users who upload a list successfully send all emails.
- User satisfaction: average rating ≥ 4.5/5 on a simple post‑send “How was this?” feedback optional prompt.
- Adoption: At least 5 church volunteers actively using the tool within 1 month of launch.

---

## 5. User Stories

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US‑01 | Volunteer | Log in with my church Gmail account securely | The tool can send emails from my address without sharing my password |
| US‑02 | Volunteer | Upload an Excel (.xlsx) or CSV file of members | I can use the same lists I already maintain |
| US‑03 | Volunteer | See a preview of the columns and map them | The system knows which column is first name, last name, and email, even if they are named differently |
| US‑04 | Volunteer | Type a message with placeholders like `{{first_name}}` | Each recipient gets a message that feels handwritten |
| US‑05 | Volunteer | Preview at least 3 personalized emails before sending | I can spot mistakes without sending test emails to myself |
| US‑06 | Volunteer | Send all emails with one click, see progress, and know when it’s done | I’m not left wondering if it worked |
| US‑07 | Volunteer | See a simple summary (e.g., “120 sent, 2 failed”) with the option to retry failures | I can address any issues and resend to those few people |
| US‑08 | Pastor | Send immediately without having to “enable” anything or edit quota limits | My time is limited; I don’t want to configure settings |
| US‑09 | Volunteer | Understand if I hit Gmail limits (e.g., 500 emails/day) with a clear warning | I can plan to send the rest tomorrow |

---

## 6. Functional Requirements

### 6.1 Authentication
- FR‑A1: Use Google OAuth 2.0 (Implicit or PKCE flow) to obtain an access token with scope `https://www.googleapis.com/auth/gmail.send` only.
- FR‑A2: On first visit, clearly explain why the app needs permission (“to send emails from your account – we never see your emails or contacts”).
- FR‑A3: Allow logout and token revocation from within the app.
- FR‑A4: Handle expired tokens automatically by prompting re‑login (or using silent refresh via Google Identity Services).

### 6.2 File Upload & Column Mapping
- FR‑U1: Accept `.csv`, `.xlsx`, `.xls` files via drag‑and‑drop or file picker.
- FR‑U2: Parse the first sheet of an Excel file, or the entire CSV. Treat the first row as header.
- FR‑U3: Detect columns automatically: look for headers that contain “email” (e.g., “Email Address”, “E‑mail”) and “first”/“name” (e.g., “First Name”, “Given Name”) and “last”/“surname”. If not confident, show a dropdown mapping UI:
  - “Which column is Email?” (required)
  - “Which column is First Name?” (optional, if missing, use “friend” or leave blank)
  - “Which column is Last Name?” (optional)
- FR‑U4: Show a table preview of the first 5 rows with the mapped columns. Allow the user to change the mapping if incorrect.
- FR‑U5: Validate that every row has a non‑empty email address. Show warnings for rows with missing email, duplicate emails, or invalid format (e.g., no `@`). Offer to skip invalid rows.
- FR‑U6: Trim whitespace from all fields before use.

### 6.3 Message Composition
- FR‑M1: Provide a plain text editor (rich text optional) for the email body.
- FR‑M2: Support placeholders: `{{first_name}}`, `{{last_name}}`, `{{full_name}}` (auto‑composed from first + last), and `{{email}}`.
- FR‑M3: Show a live preview pane that populates with data from the first valid recipient.
- FR‑M4: Include a subject line field that also supports the same placeholders.
- FR‑M5: Allow the user to specify a “From name” (display name) that appears to recipients (default to their Gmail display name).
- FR‑M6: Warn if no placeholders are used and the list is larger than 10 recipients (the email might feel impersonal).

### 6.4 Preview & Review
- FR‑P1: Generate full message previews for at least 3 random recipients (or user‑selected rows). Show exactly what will land in the recipient’s inbox (subject + body + display name).
- FR‑P2: Display the total number of emails to be sent and a final checklist (subject, number of recipients, estimated send time).
- FR‑P3: Before sending, require an explicit confirmation (e.g., “I’ve reviewed the previews – Send 150 emails”).

### 6.5 Sending
- FR‑S1: Send emails one by one through the Gmail API `users.messages.send` method. Use `raw` base64url‑encoded RFC 2822 messages (or the simpler `uploadType=media` endpoint).
- FR‑S2: Show a progress bar with sent count and current recipient name.
- FR‑S3: Respect Gmail sending limits. Before starting, estimate if the batch exceeds daily limit (500 for consumer Gmail, 2000 for Google Workspace). Warn the user and offer to stop or proceed at risk of throttling.
- FR‑S4: Implement exponential backoff on rate‑limit errors (HTTP 429 or “User‑rate limit exceeded”).
- FR‑S5: On any permanent failure for a single recipient (e.g., invalid email), mark it as failed and continue.
- FR‑S6: After completion, display:
  - ✅ Success count
  - ❌ Failure count with specific reason (e.g., “Invalid email”, “Quota exceeded”)
  - Option to export list of failed recipients so they can correct and retry.
- FR‑S7: All data (recipient list, message, previews) resides only in browser memory; nothing is sent to any third‑party server except Google’s Gmail API.

### 6.6 History & Logging (Nice-to-have for v1)
- In v1, no persistent history is stored. User can screenshot the final summary. For later, consider storing send logs encrypted in browser localStorage with explicit user opt‑in.

---

## 7. Non‑Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Upload and parse 1,000‑row Excel file in < 2 seconds. Sending speed ~1 email per second (Gmail rate‑limited). |
| **Reliability** | 99% of emails sent without error (excluding permanent recipient errors like invalid addresses). Graceful handling of network interruptions. |
| **Security** | No recipient data sent to any server other than Google’s API endpoints. OAuth token stored in browser memory only (no localStorage). Use Content Security Policy (CSP) to prevent XSS. |
| **Compatibility** | Support latest versions of Chrome, Edge, Safari, Firefox. Mobile‑responsive for tablet use (v1 not optimized for small phones). |
| **Usability** | Designed for a user who can fill out a web form. All technical jargon replaced with plain language. |
| **Accessibility** | WCAG 2.1 Level AA where achievable (semantic HTML, labels, contrast, keyboard navigation). |
| **Compliance** | No storage of PII; minimal scope OAuth; comply with Google API Services User Data Policy. |

---

## 8. User Interface & Experience (UX)

### 8.1 Overall Flow (Wizard Style)
1. **Welcome** → Brief explanation, “Sign in with Google” button.
2. **Upload & Map** → Drag‑and‑drop file area, auto‑mapping confirmation, manual overrides.
3. **Compose** → Subject line, message body, placeholder helper buttons, live preview.
4. **Review** → Three random personalized previews, recipient count, “Send” button.
5. **Sending** → Progress bar, animated “sending love…” indicator.
6. **Result** → Success/failure summary, export failures, “Send another” button.

### 8.2 Key Screens (Wireframe Descriptions)

**Screen 1: Sign In**
- Church logo / app title.
- Short text: “Send personalized caring emails to your church family using your Gmail account. We never store your contacts or messages.”
- Prominent “Sign in with Google” button.

**Screen 2: Upload & Map**
- Large dashed drop zone: “Drop your Excel or CSV file here, or click to browse.”
- Once loaded: a table showing first 5 rows with dropdown headers “Email”, “First Name”, “Last Name”.
- Smart suggestions: if columns are clearly detected, show a green check “We found these columns – look good?”.
- Buttons: “Back”, “Next – Write Message”.

**Screen 3: Compose**
- Subject line (with placeholder insert buttons).
- Body text area (min 3 lines height, resizable). Placeholder buttons below: `{first_name}`, `{last_name}`, `{full_name}` insert at cursor.
- Live preview panel (right side on desktop, below on mobile): shows the email preview for the first recipient.
- “Next – Preview & Send”.

**Screen 4: Review & Send**
- Three cards showing full personalized messages (different recipients).
- Summary line: “You’re about to send **150 emails** from <user@gmail.com>”.
- Checkbox: “I’ve checked the previews – I’m ready to send”.
- “Send Now” button (disabled until checkbox is clicked).

**Screen 5: Sending**
- Large progress bar with recipient name and count (e.g., “Sending to Sarah M. (52/150)”).
- Cancel button (with confirmation dialog: “Stop sending? Already sent 52.”).

**Screen 6: Done**
- Big checkmark (or partial warning icon).
- “150 emails sent successfully!” (or “148 sent, 2 failed”).
- List failed rows with reason, “Download failed list” button (CSV).
- “Send Another Batch” button to start over.

---

## 9. Technical Architecture

### 9.1 High-Level Architecture
- Single‑page application (SPA) built with HTML, CSS, JavaScript (likely React/Vue/Svelte for maintainability, but could be vanilla JS to keep dependencies minimal).
- Hosted on any static file host (GitHub Pages, Netlify, Firebase Hosting) – no server-side code.
- All logic runs in the user’s browser. Google API calls are made directly from the client using the Gmail API (v1) via Google Identity Services (GIS) and `gapi` client library or standard fetch with Bearer token.

### 9.2 Key Libraries & APIs
- **Google Identity Services** (OAuth 2.0 implicit/PKCE): for authentication and token acquisition.
- **Google Gmail API**: `users.messages.send` endpoint.
- **SheetJS (xlsx)**: For parsing Excel files in the browser.
- **Papa Parse**: For CSV parsing (optional, could be done manually).
- **CSS Framework**: Tailwind CSS or minimal custom CSS for speed and cleanliness.

### 9.3 Data Flow
1. User opens index.html → no data loaded.
2. User clicks “Sign in” → OAuth popup → token stored in memory (variable).
3. User uploads file → File read via FileReader → parsed into array of objects in memory.
4. User types message → template string stored.
5. Preview: for each selected preview recipient, the template is interpolated and rendered.
6. Send: loop through recipients, for each:
   - Build MIME message (headers + UTF‑8 body).
   - Base64url encode for the `raw` parameter.
   - POST to `https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media` (or simple JSON with `raw`).
   - Handle response/errors.
7. No data persisted after page close. Token is lost; user must sign in again next time (acceptable for v1).

### 9.4 Gmail API Rate Limits & Sending Limits
- Consumer Gmail: 500 recipients/day (unique recipients, not messages).
- Google Workspace: 2,000 recipients/day.
- Sending rate: roughly 1 email/second sustained. The app will sequentially send with a small delay (100ms) and handle 429 errors with exponential backoff (retry up to 5 times).
- User will be informed if remaining quota might be insufficient for the batch; offer to send partial.

---

## 10. Data Model (In‑memory only)

```javascript
Recipient = {
  email: string,        // required, validated
  first_name: string,   // default "" if missing
  last_name: string,    // default ""
  full_name: string,    // computed: (first + " " + last).trim()
  rowIndex: number      // for error tracking
}

MessageTemplate = {
  subject: string,
  body: string,         // may contain {{placeholders}}
  fromName: string      // user’s chosen display name
}

SendJob = {
  recipients: Recipient[],
  template: MessageTemplate,
  sentCount: number,
  failedItems: [{recipient, errorReason}]
}
```

No database. State is held in the page’s memory, lost on navigation/close by design for privacy.

---

## 11. Security & Privacy

- **Minimal scope**: Only `gmail.send` permission, not read, modify, or delete.
- **Token handling**: Access token kept in JavaScript closure, never in localStorage/cookies. Use Google’s token client to handle refresh securely.
- **No third‑party analytics** that could leak recipient data. If analytics are needed, use a privacy‑focused, self‑hosted solution like Plausible with no custom event data.
- **Content Security Policy**: Prevent inline scripts, restrict connect‑src to `https://gmail.googleapis.com` and `https://oauth2.googleapis.com`.
- **Transparency**: Clearly state on the landing page that all processing happens locally, and the developer cannot see the emails or recipient list.

---

## 12. Error Handling

| Scenario | User‑facing message | Resolution |
|----------|---------------------|------------|
| File cannot be parsed | “We couldn’t read your file. Please make sure it’s an Excel (.xlsx) or CSV file.” | Let user retry. |
| Missing email column | “We need to know which column contains email addresses. Please select it from the dropdown.” | Show dropdown mapping. |
| Invalid emails found | “We found 3 rows with invalid emails. They will be skipped. [View list]” | Allow user to correct file and re‑upload, or proceed. |
| OAuth consent denied | “To send emails from your account, we need your permission. Please try again and allow access.” | Restart sign‑in. |
| Token expired during send | “Your session expired. Please sign in again to continue sending.” | Re‑authenticate and resume from where it left off (possible if we track sent indices). |
| Gmail daily limit hit | “You’ve reached Gmail’s daily sending limit (500). 320 emails were sent, 180 remain. You can send the rest tomorrow by uploading this list again.” | Provide a “Download unsent recipients” button. |
| Network error / API down | “Something went wrong. Check your internet connection and try again. Emails already sent are not affected.” | Retry button; give option to download unsent list. |

---

## 13. Dependencies & Assumptions

### Dependencies
- Google Gmail API availability and quota policies.
- User has a Google account (consumer Gmail or Workspace) with sending limits not already exhausted.
- Browser support for FileReader, ES6, and modern CSS (IE11 not supported).

### Assumptions
- The sender’s Gmail account is in good standing (not flagged for spam).
- Recipients have opted into receiving emails (church membership context implies consent).
- The uploaded file has a header row.

---

## 14. Future Considerations (Post‑v1)

1. **Save as draft**: Option to save message template and list mapping locally (browser storage) to resend next time.
2. **Email open tracking**: A controversial feature; if added, must be opt‑in and use a tracking pixel only with clear disclosure.
3. **Scheduled sending**: Queue emails to be sent over time to avoid rate limits.
4. **Multi‑account support**: For churches with multiple pastors sharing the tool.
5. **Template library**: Pre‑written encouragement messages that users can choose and customize.
6. **Offline/PWA**: Install as a progressive web app for easy access.
7. **Integration with church management systems (ChMS)**: Import lists directly from Planning Center, Breeze, etc., via their APIs.
8. **Send via email alias**: If the user has set up a church‑branded email alias, allow selecting it.

---

## 15. Release Plan

**Phase 1 – Alpha (Internal test)**
- Static site with basic OAuth, file upload, column mapping, plain text send.
- Tested with 2–3 church volunteers.

**Phase 2 – Beta (Limited rollout)**
- Add live preview, progress bar, error summary, and mobile responsiveness.
- Share with 10 churches, collect feedback.

**Phase 3 – Public v1 Launch**
- Polish UI, add accessibility, finalize error messages.
- Host on easy‑to‑remember URL (e.g., `lovenotesend.com`).
- Provide a one‑page user guide with screenshots.

---

## 16. Appendices

### A. Example Email MIME Format (raw)
```
From: "Pastor Jane" <jane@gmail.com>
To: john@example.com
Subject: Thinking of you, John
Content-Type: text/plain; charset="UTF-8"

Hi John,

Just wanted to check in and let you know you’re loved!
```
Encoded as base64url in the API call.

### B. Placeholder Reference
| Placeholder | Output |
|-------------|--------|
| `{{first_name}}` | First name from spreadsheet, or empty if missing |
| `{{last_name}}` | Last name from spreadsheet, or empty |
| `{{full_name}}` | First name + Last name (trimmed), or “friend” if both missing |
| `{{email}}` | Recipient email address |

If no first name is provided, the app could suggest a fallback like “Dear friend” to avoid “Hi ,” awkwardness.

### C. User Guide Outline (for non‑technical users)
1. Go to [website], click “Sign in with Google” and allow permission.
2. Drag your church member list (Excel/CSV) onto the page.
3. Check that the program correctly found the Email and Name columns. Change them if needed.
4. Write your subject line (e.g., “Checking in, {{first_name}}!”) and message.
5. Look at the previews – do they look right?
6. Click “Send” and watch the progress. When it’s done, you’ll see a summary.
7. If any emails failed, download the list and fix those addresses, then upload again.

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |gdhdss

| Church Representative | | | |

*This PRD is a living document and will be updated as requirements evolve based on user feedback.*
