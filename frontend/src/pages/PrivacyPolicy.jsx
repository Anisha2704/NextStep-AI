import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheck, ChevronRight, LayoutDashboard } from 'lucide-react';
import Logo from '../components/common/Logo';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-20">
    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-main">
      <ChevronRight size={18} className="text-primary shrink-0" />
      {title}
    </h2>
    <div className="space-y-2 pl-6 text-sm leading-relaxed text-text-secondary">
      {children}
    </div>
  </section>
);

const TOC_ITEMS = [
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'data-sharing', label: 'Data Sharing & Disclosure' },
  { id: 'cookies', label: 'Cookies & Storage' },
  { id: 'ai-features', label: 'AI Features & Third-Party APIs' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'security', label: 'Security' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact Us' },
];

const PrivacyPolicy = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to={isAuthenticated ? '/dashboard' : '/'} aria-label="Home">
            <Logo size="sm" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-text-secondary hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-bold text-text-main sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-text-secondary">
            Last updated: <strong>September 2026</strong>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">
            At <strong>NextStep AI</strong>, your privacy is important to us. This policy explains
            what information we collect, how we use it, and your rights regarding your data.
          </p>
        </div>

        <div className="gap-10 lg:flex">
          {/* Table of Contents — sidebar */}
          <aside className="mb-10 shrink-0 lg:mb-0 lg:w-56">
            <div className="sticky top-24 rounded-xl border border-border bg-lavender/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Contents
              </p>
              <ol className="space-y-1.5">
                {TOC_ITEMS.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-start gap-2 text-sm text-text-secondary transition-colors hover:text-primary"
                    >
                      <span className="mt-0.5 font-mono text-xs text-text-secondary/60 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* Policy Content */}
          <article className="min-w-0 flex-1 space-y-10">
            <Section id="information-we-collect" title="Information We Collect">
              <p>We collect information in the following ways:</p>
              <p>
                <strong className="text-text-main">Account Information:</strong> When you register,
                we collect your name, email address, and password (stored as a secure hash using
                bcrypt — we never store your plain-text password).
              </p>
              <p>
                <strong className="text-text-main">Profile Information:</strong> Career-related data
                you voluntarily provide, including education history, work experience, skills,
                certifications, and projects.
              </p>
              <p>
                <strong className="text-text-main">Usage Data:</strong> Pages you visit within the
                platform, features you interact with, and time spent on the platform (collected via
                server logs and analytics).
              </p>
              <p>
                <strong className="text-text-main">Device Information:</strong> Browser type,
                operating system, and IP address for security monitoring purposes.
              </p>
            </Section>

            <Section id="how-we-use" title="How We Use Your Information">
              <p>We use your data to:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Create and manage your account and authenticate your identity securely.</li>
                <li>
                  Provide AI-powered career recommendations, skill gap analysis, and learning path
                  suggestions personalised to your profile.
                </li>
                <li>
                  Send transactional emails such as password reset links and account notifications.
                </li>
                <li>Improve platform features, performance, and overall user experience.</li>
                <li>
                  Protect against fraud, abuse, and security threats by monitoring access patterns.
                </li>
              </ul>
              <p>We do not sell your personal data to third parties.</p>
            </Section>

            <Section id="data-sharing" title="Data Sharing & Disclosure">
              <p>
                We do <strong className="text-text-main">not</strong> sell, trade, or rent your
                personal information to third parties.
              </p>
              <p>We may share data in these limited circumstances:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>
                  <strong className="text-text-main">Service Providers:</strong> Trusted vendors
                  (e.g., email delivery, cloud hosting) who process data on our behalf under strict
                  confidentiality agreements.
                </li>
                <li>
                  <strong className="text-text-main">AI APIs:</strong> Portions of your profile may
                  be sent to AI inference services (such as Google Gemini) to generate
                  recommendations. See the AI Features section below.
                </li>
                <li>
                  <strong className="text-text-main">Legal Requirements:</strong> If required by
                  law, court order, or governmental authority.
                </li>
              </ul>
            </Section>

            <Section id="cookies" title="Cookies & Storage">
              <p>We use the following browser storage mechanisms:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>
                  <strong className="text-text-main">Session Storage:</strong> When you log in
                  without "Remember Me," your authentication token is stored in
                  <code className="mx-1 rounded bg-lavender px-1 font-mono text-xs">
                    sessionStorage
                  </code>
                  and is automatically cleared when the browser session ends.
                </li>
                <li>
                  <strong className="text-text-main">Local Storage:</strong> When you check
                  "Remember Me," your token is stored in
                  <code className="mx-1 rounded bg-lavender px-1 font-mono text-xs">
                    localStorage
                  </code>
                  and persists across browser restarts for up to 30 days.
                </li>
                <li>
                  <strong className="text-text-main">HttpOnly Cookies:</strong> An HttpOnly, Secure
                  cookie is set on login as an additional authentication fallback, inaccessible to
                  JavaScript.
                </li>
              </ul>
              <p>
                We do not use advertising or third-party tracking cookies.
              </p>
            </Section>

            <Section id="ai-features" title="AI Features & Third-Party APIs">
              <p>
                NextStep AI uses large language model (LLM) APIs (including Google Gemini) to power
                career recommendations, skill assessments, and learning suggestions.
              </p>
              <p>
                When you use AI features, relevant portions of your profile (e.g., skills, career
                goal, experience) are sent to these APIs as part of the request. We minimise the
                data shared to only what is required to generate a useful response.
              </p>
              <p>
                AI-generated responses are informational and advisory. They do not constitute
                professional career, legal, or financial advice.
              </p>
            </Section>

            <Section id="data-retention" title="Data Retention">
              <p>
                We retain your personal data for as long as your account is active or as needed to
                provide our services. You may request account deletion at any time, after which your
                personal data will be permanently removed within 30 days, except where retention is
                required by law.
              </p>
              <p>
                Authentication tokens expire automatically — session tokens expire within 1 day, and
                remembered-session tokens expire within 30 days.
              </p>
            </Section>

            <Section id="your-rights" title="Your Rights">
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>
                  <strong className="text-text-main">Access</strong> — request a copy of the
                  personal data we hold about you.
                </li>
                <li>
                  <strong className="text-text-main">Rectification</strong> — update or correct
                  inaccurate data via your profile settings.
                </li>
                <li>
                  <strong className="text-text-main">Deletion</strong> — request erasure of your
                  account and associated data.
                </li>
                <li>
                  <strong className="text-text-main">Portability</strong> — request your data in a
                  structured, machine-readable format.
                </li>
                <li>
                  <strong className="text-text-main">Withdraw Consent</strong> — opt out of
                  non-essential data processing at any time.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at the address below.
              </p>
            </Section>

            <Section id="security" title="Security">
              <p>We implement industry-standard security measures, including:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Passwords hashed with bcrypt (min 12 salt rounds).</li>
                <li>JWT authentication with short-lived tokens.</li>
                <li>HttpOnly, Secure cookies to mitigate XSS token theft.</li>
                <li>Password complexity requirements enforced on registration and password reset.</li>
                <li>HTTPS enforced in production environments.</li>
              </ul>
              <p>
                While we take security seriously, no system is 100% immune to breaches. We encourage
                you to use a strong, unique password and to keep your login credentials confidential.
              </p>
            </Section>

            <Section id="children" title="Children's Privacy">
              <p>
                NextStep AI is not directed at children under the age of 13. We do not knowingly
                collect personal information from children under 13. If you believe a child has
                provided us with personal data, please contact us and we will promptly delete it.
              </p>
            </Section>

            <Section id="changes" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When we do, we will revise the
                "Last updated" date at the top of this page. If changes are significant, we will
                notify you via email or a prominent notice on the platform before the changes take
                effect.
              </p>
              <p>
                Your continued use of NextStep AI after changes are posted constitutes your
                acceptance of the updated policy.
              </p>
            </Section>

            <Section id="contact" title="Contact Us">
              <p>
                If you have any questions, concerns, or requests related to this Privacy Policy or
                your personal data, please reach out:
              </p>
              <div className="rounded-xl border border-border bg-lavender/40 p-4 text-text-main">
                <p className="font-semibold">NextStep AI Privacy Team</p>
                <p className="mt-1 text-sm">
                  Email:{' '}
                  <a
                    href="mailto:privacy@nextstepai.app"
                    className="text-primary hover:underline"
                  >
                    privacy@nextstepai.app
                  </a>
                </p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  We aim to respond within 5 business days.
                </p>
              </div>
            </Section>

            {/* Back to top */}
            <div className="pt-4 text-center">
              <a
                href="#top"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                ↑ Back to top
              </a>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <Logo size="sm" />
          <p className="text-xs text-text-secondary">
            © 2026 NextStep AI. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 text-xs text-text-secondary">
            {isAuthenticated ? (
              <Link to="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Register
                </Link>
              </>
            )}
            <span className="font-medium text-primary">Privacy Policy</span>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
