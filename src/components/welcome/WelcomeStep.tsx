// =========================================================================
// WelcomeStep — The landing screen for the Love Note wizard
//
// Shows the app branding, a description, and either a Sign In button
// (for unauthenticated users) or a "Get Started" button (for authenticated
// users) that advances to the Upload step.
// =========================================================================

import { useAuth } from '../../hooks/useAuth';
import { useWizard } from '../../hooks/useWizard';
import SignInButton from '../auth/SignInButton';
import Button from '../common/Button';

/**
 * Welcome screen — the first step of the wizard.
 *
 * Handles three states:
 * - Loading: spinner while auth initializes
 * - Unauthenticated: branding + SignInButton
 * - Authenticated: branding + Get Started button
 */
export default function WelcomeStep() {
  const { state: authState } = useAuth();
  const { goToNextStep } = useWizard();

  // --- Loading: auth is still initializing ---
  if (!authState.isInitialized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <div
          aria-hidden="true"
          className="h-10 w-10 motion-safe:animate-spin rounded-full border-[3px] border-brand-secondary border-t-brand-primary"
        />
        <p className="text-sm text-brand-primary font-medium font-display">Warming up the love…</p>
      </div>
    );
  }

  const isAuthenticated = authState.status === 'authenticated';

  return (
    <div className="relative w-full overflow-hidden bg-[#faf8f6] min-h-screen flex flex-col items-center">
      {/* --- Ambient Background Orbs --- */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 ambient-orb orb-rose" />
      <div className="absolute top-[30%] right-[-150px] w-[500px] h-[500px] ambient-orb orb-peach" />
      <div className="absolute bottom-[10%] left-[-150px] w-[450px] h-[450px] ambient-orb orb-sage" />

      {/* --- Page Content Wrapper --- */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* --- Hero Section --- */}
        <section className="pt-20 pb-16 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light/60 border border-brand-primary/15 text-brand-dark font-display text-xs font-semibold backdrop-blur-sm mb-6 animate-pulse-glow">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            Private & Secure Gmail Sender
          </div>

          {/* Logo */}
          <div
            aria-hidden="true"
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-premium border border-stone-200/30"
          >
            <span className="text-3.5xl">💌</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold font-serif text-brand-dark tracking-tight leading-[1.15] px-2">
            Personal check-ins, <br className="hidden sm:inline" />
            <span className="italic font-medium text-brand-primary">made personal.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-base md:text-lg text-stone-600 font-sans leading-relaxed px-2">
            Create beautiful, personalized messages for your church or care group. Send them directly from your personal Gmail account without intermediate servers, databases, or privacy compromises.
          </p>

          {/* Auth Error Display */}
          {authState.error && !isAuthenticated && (
            <div className="mt-6 max-w-md mx-auto rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-100 shadow-sm" role="alert">
              {authState.error}
            </div>
          )}

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={goToNextStep} className="w-full sm:w-auto px-8 py-4 text-base font-semibold shadow-premium hover:shadow-premium-hover">
                Get Started
                <svg
                  className="h-4 w-4 ml-2 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Button>
            ) : (
              <SignInButton />
            )}

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-stone-600 hover:text-brand-dark font-display tracking-wide transition-colors"
            >
              See how it works
              <svg className="ml-1.5 h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </section>

        {/* --- Visual Product Mockup Frame --- */}
        <section className="w-full max-w-5xl px-4 md:px-6 mb-24">
          <div className="glass-card rounded-2xl overflow-hidden shadow-premium border border-stone-200/40 p-1 md:p-2 bg-white/60">
            {/* Window controls header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/20 bg-stone-50/50">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="text-[10px] font-display font-semibold text-stone-400 tracking-wider uppercase">
                Live Composer View
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Split composer and live output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 bg-white/40">
              {/* Left Column: Editor Input */}
              <div className="flex flex-col gap-4 rounded-xl border border-stone-200/40 p-4 bg-white/70 shadow-sm text-left">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/10">
                  <span className="text-xs font-semibold text-stone-700 font-display">Template Editor</span>
                  <span className="text-[10px] bg-brand-light text-brand-dark px-2 py-0.5 rounded-full font-display font-medium">Step 2 of 4</span>
                </div>

                {/* Available Variables */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-mono">{'{{first_name}}'}</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-mono">{'{{family_update}}'}</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-mono">{'{{pastoral_need}}'}</span>
                </div>

                {/* Subject field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider font-display">Subject</label>
                  <div className="text-xs border border-stone-200 rounded-lg px-3 py-2 bg-stone-50/50 text-stone-800 font-mono">
                    Thinking of you, <span className="text-brand-primary">{'{{first_name}}'}</span>
                  </div>
                </div>

                {/* Body field */}
                <div className="space-y-1 flex-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider font-display">Message Body</label>
                  <div className="text-xs border border-stone-200 rounded-lg p-3 bg-stone-50/50 text-stone-700 font-mono min-h-[140px] leading-relaxed whitespace-pre-wrap">
                    {"Hi "}
                    <span className="text-brand-primary">{'{{first_name}}'}</span>
                    {",\n\nI hope you're doing well. Just wanted to send a quick note to let you know we're praying for you and your family as you recover from "}
                    <span className="text-brand-primary">{'{{family_update}}'}</span>
                    {".\n\nWe would love to know how we can support you with your current need for "}
                    <span className="text-brand-primary">{'{{pastoral_need}}'}</span>
                    {". Please reply directly and let us know!\n\nWarmly,\nAdemidara Adeyemi"}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Simulated Preview */}
              <div className="flex flex-col gap-4 rounded-xl border border-brand-primary/10 p-4 bg-brand-light/20 shadow-sm text-left">
                <div className="flex items-center justify-between pb-2 border-b border-brand-primary/10">
                  <span className="text-xs font-semibold text-brand-dark font-display">Live Preview: Recipient 1</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-display font-medium">Ready</span>
                </div>

                {/* Recipient Details */}
                <div className="space-y-1 text-xs text-stone-600 font-display">
                  <div><span className="font-semibold text-stone-400 uppercase tracking-wider text-[9px] mr-2">To:</span> Oluwapelumi Adebayo &lt;oluwapelumi.a@email.com&gt;</div>
                  <div><span className="font-semibold text-stone-400 uppercase tracking-wider text-[9px] mr-2">From:</span> ademidara.adeyemi@cacsaunilorin.org</div>
                </div>

                {/* Subject preview */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider font-display">Generated Subject</label>
                  <div className="text-xs font-bold text-stone-800 bg-white/70 border border-stone-200/30 rounded-lg px-3 py-2">
                    Thinking of you, <span className="bg-brand-secondary/35 text-brand-dark px-1.5 py-0.5 rounded font-semibold">Oluwapelumi</span>
                  </div>
                </div>

                {/* Body preview */}
                <div className="space-y-1 flex-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider font-display">Generated Email Body</label>
                  <div className="text-xs text-stone-700 bg-white/70 border border-stone-200/30 rounded-lg p-3 min-h-[140px] leading-relaxed whitespace-pre-wrap">
                    {"Hi "}
                    <span className="bg-brand-secondary/35 text-brand-dark px-1.5 py-0.5 rounded font-semibold">Oluwapelumi</span>
                    {",\n\nI hope you're doing well. Just wanted to send a quick note to let you know we're praying for you and your family as you recover from "}
                    <span className="bg-brand-secondary/35 text-brand-dark px-1.5 py-0.5 rounded font-semibold">knee surgery</span>
                    {".\n\nWe would love to know how we can support you with your current need for "}
                    <span className="bg-brand-secondary/35 text-brand-dark px-1.5 py-0.5 rounded font-semibold">meals next week</span>
                    {". Please reply directly and let us know!\n\nWarmly,\nAdemidara Adeyemi"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Value Props Grid (Features) --- */}
        <section className="w-full bg-white/50 border-y border-stone-200/30 py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-semibold text-brand-primary tracking-widest uppercase font-display mb-3">Designed for Care</h2>
              <p className="text-3xl font-bold font-serif text-brand-dark">Built with safety, intimacy, and simplicity in mind.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Privacy Card */}
              <div className="glass-card rounded-2xl p-6 bg-white/80 border border-stone-200/20 shadow-sm flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-primary text-2xl mb-6 border border-brand-primary/10">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 font-display mb-2">Privacy First</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    All spreadsheet mapping, text composition, and email rendering happen locally inside your browser's memory. No databases, no external storage, and no tracking.
                  </p>
                </div>
              </div>

              {/* Handwritten Card */}
              <div className="glass-card rounded-2xl p-6 bg-white/80 border border-stone-200/20 shadow-sm flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf2ee] text-brand-accent text-2xl mb-6 border border-brand-accent/10">
                    ✍️
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 font-display mb-2">Personal Touch</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Avoid bulk marketing styles. Dynamically inject placeholders from your Excel sheet into your subjects and bodies to compose genuine, personal letters of encouragement.
                  </p>
                </div>
              </div>

              {/* Direct Gmail Card */}
              <div className="glass-card rounded-2xl p-6 bg-white/80 border border-stone-200/20 shadow-sm flex flex-col justify-between text-left">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-primary text-2xl mb-6 border border-brand-primary/10">
                    📩
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 font-display mb-2">Sent via Gmail</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Connects directly to your Google account. Emails go through your normal account, ensuring high deliverability. Any responses go directly back into your inbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Visual Stepper Timeline --- */}
        <section id="how-it-works" className="w-full py-20 max-w-5xl mx-auto px-4 md:px-6 scroll-mt-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-brand-primary tracking-widest uppercase font-display mb-3">Workflow</h2>
            <p className="text-3xl font-bold font-serif text-brand-dark">How Love Note Works</p>
            <p className="text-stone-500 text-sm mt-3">Three simple steps to connect with your care recipients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-[2px] bg-stone-200/40 -z-10" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white font-display font-bold shadow-md mb-6">
                1
              </div>
              <h3 className="text-base font-bold text-stone-800 font-display mb-2">Upload Care List</h3>
              <p className="text-stone-600 text-xs leading-relaxed max-w-xs">
                Drag and drop your spreadsheet. Map your columns to tags like email, name, and check-in details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white font-display font-bold shadow-md mb-6">
                2
              </div>
              <h3 className="text-base font-bold text-stone-800 font-display mb-2">Draft Template</h3>
              <p className="text-stone-600 text-xs leading-relaxed max-w-xs">
                Write your message once. The editor automatically resolves custom variables for every individual on your list.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white font-display font-bold shadow-md mb-6">
                3
              </div>
              <h3 className="text-base font-bold text-stone-800 font-display mb-2">Review & Send</h3>
              <p className="text-stone-600 text-xs leading-relaxed max-w-xs">
                Inspect every generated preview. Send them out individually or trigger a batch send via the Gmail API.
              </p>
            </div>
          </div>
        </section>

        {/* --- Testimonial Section --- */}
        <section className="w-full bg-[#f3efe9]/30 border-y border-stone-200/20 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <span className="text-4xl text-brand-secondary/60 font-serif leading-none">“</span>
            <blockquote className="text-lg md:text-xl font-serif text-brand-dark italic leading-relaxed mb-6 px-4">
              "Our congregational care team checks in on dozens of family coordinators weekly. Before Love Note, we struggled between sending impersonal email blasts or spending hours copy-pasting. Now, we compose personal letters in minutes. Responses land straight back in my Gmail inbox."
            </blockquote>
            <div className="font-display">
              <div className="text-sm font-bold text-stone-800">Oluwapelumi Ogunleye</div>
              <div className="text-xs text-stone-500 mt-0.5">Welfare Coordinator • CACSA Unilorin</div>
            </div>
          </div>
        </section>

        {/* --- Bottom Hero CTA Section --- */}
        <section className="w-full py-24 max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark tracking-tight leading-tight">
            Ready to check in on your team?
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-sm text-stone-500 font-sans leading-relaxed">
            Connect your Google account and send your first note of encouragement. All data remains inside your local web browser.
          </p>
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Button size="lg" onClick={goToNextStep} className="px-8 py-4 shadow-premium hover:shadow-premium-hover">
                Get Started Now
              </Button>
            ) : (
              <SignInButton />
            )}
          </div>
          <p className="mt-4 text-[11px] text-stone-400 font-display">
            💕 Safe & secure. We only request permissions to draft and send emails.
          </p>
        </section>

        {/* --- Structured Landing Footer --- */}
        <footer className="w-full border-t border-stone-200/40 bg-white/40 backdrop-blur-sm py-12 text-left">
          <div className="max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💌</span>
                <span className="font-serif italic font-bold text-brand-dark text-lg">Love Note</span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
                A local-first, privacy-respecting tool for pastoral care teams, volunteer coordinators, and community groups to send personalized encouragement.
              </p>
            </div>
            
            <div>
              <h4 className="text-stone-800 font-display font-semibold text-xs uppercase tracking-wider mb-4">Security & Trust</h4>
              <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
                No tracking. No cookies. No central database. We interact directly with the Google API from your own browser. Your data is yours.
              </p>
            </div>

            <div>
              <h4 className="text-stone-800 font-display font-semibold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="flex flex-col space-y-2 text-xs text-stone-500 font-display">
                <a href="/privacy.html" className="hover:text-brand-primary transition-colors underline underline-offset-2">Privacy Policy</a>
                <a href="/terms.html" className="hover:text-brand-primary transition-colors underline underline-offset-2">Terms of Service</a>
                <span className="text-[10px] text-stone-400 mt-2">© {new Date().getFullYear()} Love Note. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
