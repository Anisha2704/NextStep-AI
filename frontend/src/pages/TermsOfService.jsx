import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, ChevronRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Logo from '../components/common/Logo';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-20">
    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-main">
      <ChevronRight size={18} className="text-primary shrink-0" />
      {title}
    </h2>
    <div className="space-y-3 pl-6 text-sm leading-relaxed text-text-secondary">
      {children}
    </div>
  </section>
);

const TOC_ITEMS = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'acceptance-of-terms', label: '2. Acceptance of Terms' },
  { id: 'user-eligibility', label: '3. User Eligibility' },
  { id: 'account-registration', label: '4. Account Registration' },
  { id: 'account-security', label: '5. Account Security' },
  { id: 'user-responsibilities', label: '6. User Responsibilities' },
  { id: 'acceptable-use', label: '7. Acceptable Use' },
  { id: 'prohibited-activities', label: '8. Prohibited Activities' },
  { id: 'user-content', label: '9. User Content' },
  { id: 'intellectual-property', label: '10. Intellectual Property' },
  { id: 'third-party-services', label: '11. Third-Party Services' },
  { id: 'service-availability', label: '12. Service Availability' },
  { id: 'suspension-termination', label: '13. Account Suspension or Termination' },
  { id: 'disclaimer-warranties', label: '14. Disclaimer of Warranties' },
  { id: 'limitation-liability', label: '15. Limitation of Liability' },
  { id: 'changes-to-terms', label: '16. Changes to the Terms' },
  { id: 'governing-law', label: '17. Governing Law' },
  { id: 'contact-support', label: '18. Contact Information / Support' },
];

const TermsOfService = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background" id="top">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to={isAuthenticated ? '/dashboard' : '/'} aria-label="Home">
            <Logo size="sm" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors">
              Privacy Policy
            </Link>
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
            <FileText size={28} />
          </div>
          <h1 className="text-3xl font-bold text-text-main sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-text-secondary">
            Last updated: <strong>September 2026</strong>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">
            Welcome to <strong>NextStep AI</strong>. These Terms of Service govern your access to and
            use of our AI-driven career guidance, skill evaluation, resume intelligence, and placement
            preparation platform.
          </p>
        </div>

        <div className="gap-10 lg:flex">
          {/* Table of Contents — sidebar */}
          <aside className="mb-10 shrink-0 lg:mb-0 lg:w-64">
            <div className="sticky top-24 rounded-xl border border-border bg-lavender/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Table of Contents
              </p>
              <ol className="space-y-1.5 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 text-xs">
                {TOC_ITEMS.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-start gap-2 py-0.5 text-text-secondary transition-colors hover:text-primary"
                    >
                      <span className="font-mono text-text-secondary/60 shrink-0">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="truncate">{item.label.replace(/^\d+\.\s*/, '')}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* Policy Content */}
          <article className="min-w-0 flex-1 space-y-10">
            {/* 1. Introduction */}
            <Section id="introduction" title="1. Introduction">
              <p>
                Welcome to NextStep AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service
                (&quot;Terms&quot;) constitute a legally binding agreement made between you, whether
                personally or on behalf of an entity (&quot;you&quot;), and NextStep AI regarding your
                access to and use of the NextStep AI website, web application, services, tools, and
                associated software (collectively, the &quot;Service&quot;).
              </p>
              <p>
                NextStep AI provides an intelligent career advancement platform offering resume parsing
                and optimization, automated skill gap assessments, personalized learning paths, and
                placement preparation powered by advanced artificial intelligence.
              </p>
            </Section>

            {/* 2. Acceptance of Terms */}
            <Section id="acceptance-of-terms" title="2. Acceptance of Terms">
              <p>
                By registering for an account, accessing, or using the Service in any manner, you
                confirm that you have read, understood, and agreed to be bound by these Terms and our{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </p>
              <p>
                If you do not agree to all the provisions set forth in these Terms, you are expressly
                prohibited from using the Service and must immediately discontinue all use.
              </p>
            </Section>

            {/* 3. User Eligibility */}
            <Section id="user-eligibility" title="3. User Eligibility">
              <p>
                You must be at least 16 years of age (or the minimum age of digital consent in your
                jurisdiction) to create an account and use NextStep AI. By using the Service, you represent
                and warrant that:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>You have the legal capacity to enter into binding contracts.</li>
                <li>You are not a person barred from receiving services under applicable law.</li>
                <li>
                  If you are using the platform on behalf of an educational institution, organization, or
                  company, you possess the requisite authority to bind that entity to these Terms.
                </li>
              </ul>
            </Section>

            {/* 4. Account Registration */}
            <Section id="account-registration" title="4. Account Registration">
              <p>
                To unlock the full functionality of the platform, you must register for an account. During
                registration, you agree to:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain and promptly update your profile information when changes occur.</li>
                <li>
                  Not use automated bots, scripts, or fraudulent emails to generate accounts.
                </li>
                <li>Maintain only one active individual user account unless explicitly authorized.</li>
              </ul>
            </Section>

            {/* 5. Account Security */}
            <Section id="account-security" title="5. Account Security">
              <p>
                You are solely responsible for maintaining the confidentiality of your credentials,
                including your email, password, and session access tokens. You agree to:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Create passwords meeting our complexity requirements.</li>
                <li>
                  Immediately notify NextStep AI of any unauthorized access, breach, or compromise of your
                  account.
                </li>
                <li>
                  Accept responsibility for all activities, submissions, and transactions that occur under
                  your account credentials.
                </li>
              </ul>
              <p>
                We cannot and will not be liable for any loss or damage arising from your failure to comply
                with these security obligations.
              </p>
            </Section>

            {/* 6. User Responsibilities */}
            <Section id="user-responsibilities" title="6. User Responsibilities">
              <p>As a registered user of NextStep AI, you agree that you will:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Provide truthful and genuine resume information, academic credentials, and skill sets.
                </li>
                <li>
                  Engage constructively with educational recommendations, assessments, and learning plans.
                </li>
                <li>
                  Respect other community members, administrators, and placement coordinators.
                </li>
                <li>
                  Comply with all local, state, national, and international laws and regulations applicable to
                  your usage.
                </li>
              </ul>
            </Section>

            {/* 7. Acceptable Use */}
            <Section id="acceptable-use" title="7. Acceptable Use">
              <p>
                NextStep AI is engineered to help students and job seekers develop skills, refine resumes,
                and prepare for career opportunities. Acceptable use encompasses:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Uploading your legitimate personal resume for analysis and ATS optimization.</li>
                <li>Taking skill assessments honestly to identify authentic competency levels.</li>
                <li>Following customized learning roadmaps and career progression suggestions.</li>
                <li>Reviewing placement insights and job fit analyses for personal career development.</li>
              </ul>
            </Section>

            {/* 8. Prohibited Activities */}
            <Section id="prohibited-activities" title="8. Prohibited Activities">
              <p>
                You may not access or use the Service for any purpose other than that for which we make it
                available. Prohibited activities include, but are not limited to:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Attempting to bypass, disable, reverse-engineer, decompile, or tamper with any security
                  controls or rate limits of the platform or AI services.
                </li>
                <li>
                  Using scrapers, spiders, crawlers, or harvesting tools to extract platform data, user
                  directories, or proprietary assessment questions.
                </li>
                <li>
                  Submitting fraudulent, plagiarized, misleading, or deceptive resumes, diplomas, or credentials.
                </li>
                <li>
                  Prompt injecting, manipulating, or abusing underlying AI endpoints (e.g. attempting to induce
                  harmful, toxic, illegal, or malicious outputs).
                </li>
                <li>
                  Distributing malware, viruses, trojans, worms, or malicious code through uploaded files.
                </li>
                <li>
                  Reselling, renting, sublicensing, or commercially redistributing access to NextStep AI
                  without prior written consent.
                </li>
              </ul>
            </Section>

            {/* 9. User Content */}
            <Section id="user-content" title="9. User Content">
              <p>
                &quot;User Content&quot; refers to resumes, profiles, project portfolios, text responses,
                assessment submissions, and feedback uploaded or supplied by you to the platform.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Ownership:</strong> You retain complete ownership of all intellectual property
                  rights in your original User Content.
                </li>
                <li>
                  <strong>License to Operate:</strong> By uploading User Content, you grant NextStep AI a
                  worldwide, non-exclusive, royalty-free license to parse, process, display, analyze, and format
                  your content solely for the purpose of providing, improving, and delivering the Service to you.
                </li>
                <li>
                  <strong>Responsibility:</strong> You represent that you possess all necessary rights and
                  consents to upload such content and that it does not infringe the intellectual property or
                  privacy rights of any third party.
                </li>
              </ul>
            </Section>

            {/* 10. Intellectual Property */}
            <Section id="intellectual-property" title="10. Intellectual Property">
              <p>
                Except for your User Content, the Service and all materials therein, including but not limited
                to the software code, algorithms, user interface designs, logos, graphics, trademarks,
                recommendation engines, and curated assessment banks, are the exclusive intellectual property of
                NextStep AI and its licensors.
              </p>
              <p>
                You are granted a personal, revocable, non-transferable, and non-exclusive right to access and
                use the Service in accordance with these Terms. No rights or licenses are granted by implication
                or estoppel.
              </p>
            </Section>

            {/* 11. Third-Party Services */}
            <Section id="third-party-services" title="11. Third-Party Services">
              <p>
                The Service integrates with third-party providers to power specific capabilities, such as
                Google Gemini API for intelligent career reasoning and natural language resume feedback,
                cloud storage providers, and analytics utilities.
              </p>
              <p>
                NextStep AI does not endorse, control, or assume responsibility for any third-party websites,
                services, or content linked to or integrated within our platform. Your interactions with such
                third parties are governed by their respective terms and privacy policies.
              </p>
            </Section>

            {/* 12. Service Availability */}
            <Section id="service-availability" title="12. Service Availability">
              <p>
                We strive to maintain continuous uptime and reliable performance. However, we do not guarantee
                uninterrupted or error-free availability. We reserve the right to:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Modify, suspend, or discontinue any feature, tool, or aspect of the Service at any time.
                </li>
                <li>
                  Perform routine or emergency maintenance, bug fixes, or infrastructure upgrades without
                  prior liability.
                </li>
                <li>
                  Throttle or impose rate limits on requests to prevent abuse or service degradation.
                </li>
              </ul>
            </Section>

            {/* 13. Account Suspension or Termination */}
            <Section id="suspension-termination" title="13. Account Suspension or Termination">
              <p>
                We reserve the right to suspend or terminate your account and refuse any current or future use
                of the Service, with or without notice, if:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>You violate any provision of these Terms of Service or our Acceptable Use policies.</li>
                <li>Required by law enforcement, judicial decree, or regulatory authority.</li>
                <li>
                  Your actions pose a security risk, technical vulnerability, or legal exposure to NextStep AI
                  or other users.
                </li>
              </ul>
              <p>
                You may terminate your account at any time via your profile settings or by contacting our
                support team.
              </p>
            </Section>

            {/* 14. Disclaimer of Warranties */}
            <Section id="disclaimer-warranties" title="14. Disclaimer of Warranties">
              <div className="rounded-xl border border-border bg-lavender/30 p-4">
                <p className="font-semibold text-text-main">
                  THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT
                  WARRANTIES OF ANY KIND.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, NEXTSTEP AI DISCLAIMS ALL WARRANTIES,
                  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT
                  THAT AI-GENERATED RECOMMENDATIONS, ATS SCORES, OR CAREER MATCHES WILL GUARANTEE EMPLOYMENT,
                  INTERVIEW CALLS, OR SALARY OUTCOMES.
                </p>
              </div>
            </Section>

            {/* 15. Limitation of Liability */}
            <Section id="limitation-liability" title="15. Limitation of Liability">
              <div className="rounded-xl border border-border bg-lavender/30 p-4">
                <p className="font-semibold text-text-main">LIMITATION OF DAMAGES</p>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  IN NO EVENT SHALL NEXTSTEP AI, ITS FOUNDERS, DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR
                  ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF
                  DATA, OPPORTUNITIES, REVENUE, OR CAREER OUTCOMES) ARISING OUT OF OR IN CONNECTION WITH YOUR
                  ACCESS OR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL
                  AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF $50 USD OR THE AMOUNT YOU PAID US IN THE
                  PRECEDING THREE MONTHS.
                </p>
              </div>
            </Section>

            {/* 16. Changes to the Terms */}
            <Section id="changes-to-terms" title="16. Changes to the Terms">
              <p>
                We may modify or update these Terms of Service from time to time. When changes occur, we will
                update the &quot;Last updated&quot; date at the top of this page. If revisions are material, we
                will notify you via a banner notification within the application or via email.
              </p>
              <p>
                Your continued use of NextStep AI following the publication of revised Terms signifies your
                binding acceptance of such revisions.
              </p>
            </Section>

            {/* 17. Governing Law */}
            <Section id="governing-law" title="17. Governing Law">
              <p>
                These Terms and your use of the Service shall be governed by and construed in accordance with
                the laws applicable in your jurisdiction, without regard to conflict of law principles.
              </p>
              <p>
                Any legal action or dispute arising out of these Terms shall first be attempted to be resolved
                through informal good-faith negotiation between the parties.
              </p>
            </Section>

            {/* 18. Contact Information / Support */}
            <Section id="contact-support" title="18. Contact Information / Support">
              <p>
                If you have questions, feedback, or need support regarding these Terms of Service, please
                reach out to our team:
              </p>
              <div className="rounded-xl border border-border bg-lavender/40 p-4 text-text-main">
                <p className="font-semibold">NextStep AI Legal & Support Team</p>
                <p className="mt-1 text-sm">
                  Email:{' '}
                  <a
                    href="mailto:support@nextstepai.app"
                    className="text-primary hover:underline font-medium"
                  >
                    support@nextstepai.app
                  </a>
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  We typically respond to inquiries within 3–5 business days.
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
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="font-medium text-primary">Terms of Service</span>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
