import { useEffect } from 'react'

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service — Kathion'
  }, [])

  return (
    <main className="static-main">
      <div className="static-wrap">
        <p className="static-eyebrow">Legal</p>
        <h1 className="static-h1">Terms of Service</h1>
        <p className="static-updated">Last updated: 9 May 2026</p>
        <p className="static-lead">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
          Kathion websites, demos, waitlist, and related services (collectively, the
          &quot;Services&quot;) operated by Kathion (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;). By using the Services, you agree to these Terms.
        </p>

        <h2 className="static-h2">1. The Services</h2>
        <p className="static-p">
          Kathion provides a narrative-engine experience for authoring worlds and playing
          interactive scenes. Features may change at any time, especially while we operate a{' '}
          <strong>private alpha</strong> or limited beta. We may add, modify, or discontinue
          any part of the Services without prior notice.
        </p>

        <h2 className="static-h2">2. Eligibility and accounts</h2>
        <p className="static-p">
          You must be able to form a binding contract where you live. If we offer accounts, you
          agree to provide accurate information and to keep credentials confidential. You are
          responsible for activity under your account.
        </p>

        <h2 className="static-h2">3. Acceptable use</h2>
        <p className="static-p">You agree not to:</p>
        <ul className="static-list">
          <li>
            Use the Services in violation of law, to harm others, or to generate or distribute
            unlawful, fraudulent, or abusive content.
          </li>
          <li>
            Attempt to probe, scan, or test the vulnerability of our systems, or bypass
            authentication or rate limits.
          </li>
          <li>
            Reverse engineer, decompile, or scrape the Services except where applicable law
            forbids this restriction.
          </li>
          <li>
            Resell or sublicense access to the Services without our written permission.
          </li>
        </ul>

        <h2 className="static-h2">4. Content and intellectual property</h2>
        <p className="static-p">
          The Services, including branding, UI, and underlying software, are owned by Kathion
          or our licensors. Subject to these Terms, you retain rights to original content you
          submit (&quot;Your Content&quot;). You grant us a limited license to host, process,
          and display Your Content solely to operate and improve the Services. You represent
          that you have the rights needed for Your Content.
        </p>
        <p className="static-p">
          Narration or suggestions produced by the engine are provided for your use in
          connection with the Services; output may be imperfect or inconsistent, and you are
          responsible for how you publish or rely on it.
        </p>

        <h2 className="static-h2">5. Third parties</h2>
        <p className="static-p">
          The Services may integrate third-party APIs, models, or hosting. Your use of those
          components may be subject to separate terms from those providers.
        </p>

        <h2 className="static-h2">6. Disclaimers</h2>
        <p className="static-p">
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE
          MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS,
          IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED,
          ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </p>

        <h2 className="static-h2">7. Limitation of liability</h2>
        <p className="static-p">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, KATHION AND ITS AFFILIATES, OFFICERS,
          DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR FOR LOSS OF PROFITS, DATA, OR
          GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE
          SERVICES WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE SERVICES IN
          THE TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US$100), IF
          YOU HAVE NOT PAID US. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE
          CASES, OUR LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
        </p>

        <h2 className="static-h2">8. Indemnity</h2>
        <p className="static-p">
          You will defend and indemnify Kathion against claims, damages, and expenses
          (including reasonable attorneys&apos; fees) arising from Your Content or your misuse
          of the Services, subject to applicable law.
        </p>

        <h2 className="static-h2">9. Suspension and termination</h2>
        <p className="static-p">
          We may suspend or terminate access to the Services if we reasonably believe you have
          violated these Terms or pose a risk to the Services or others.
        </p>

        <h2 className="static-h2">10. Changes</h2>
        <p className="static-p">
          We may update these Terms from time to time. We will post the revised Terms on this
          page and update the &quot;Last updated&quot; date. Continued use after changes become
          effective constitutes acceptance. If you do not agree, stop using the Services.
        </p>

        <h2 className="static-h2">11. Governing law</h2>
        <p className="static-p">
          These Terms are governed by the laws of the jurisdiction in which Kathion is
          organized, excluding conflict-of-law rules, unless a different governing law is
          required by the place where you live.
        </p>

        <h2 className="static-h2">12. Contact</h2>
        <p className="static-p">
          For questions about these Terms, reach us through the contact channel provided on our
          landing page or waitlist correspondence.
        </p>
      </div>
    </main>
  )
}
