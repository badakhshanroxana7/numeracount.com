import Link from "next/link";
import { ArrowRight, BookOpen, Check, ChartNoAxesCombined, Mail, LockKeyhole, ShieldCheck, RefreshCw, FolderCheck, Users, ReceiptText } from "lucide-react";
import Brand from "./components/brand";

const email = "info@numeracount.com";
const contactHref = `mailto:${email}`;

export default function Home() {
  const portalReady = process.env.PORTAL_ENABLED === "true";
  const portalHref = portalReady ? "/login" : "/status";
  return <div className="site-shell bookkeeping-site">
    <header className="topbar container">
      <Brand/>
      <nav className="topnav" aria-label="Main navigation">
        <a href="#bookkeeping">Services</a><a href="#about">About us</a><a href="#contact">Contact</a>
        <Link href={portalHref} className="button button-small button-dark">Client sign in <ArrowRight size={15} aria-hidden="true"/></Link>
      </nav>
    </header>
    <main id="main-content" tabIndex={-1}>
      <section className="hero container" aria-labelledby="home-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" aria-hidden="true"/> BOOKKEEPING WITH NUMERACOUNT</div>
          <h1 id="home-title">Clear books.<br/><em>A clearer picture.</em></h1>
          <p>From everyday bookkeeping and bank reconciliation to catching up on overdue records, Numeracount helps bring your financial information together. We also offer payroll support and practical business financial guidance, so you can move forward with a clearer understanding of your numbers.</p>
          <div className="hero-actions"><a href={contactHref} className="button button-primary">Let’s talk bookkeeping <ArrowRight size={18} aria-hidden="true"/></a><a href="#bookkeeping" className="text-link">Explore our services <ArrowRight size={16} aria-hidden="true"/></a></div>
          <p className="hero-proof"><BookOpen size={19} aria-hidden="true"/> Thoughtful support for the details that count.</p>
        </div>
        <div className="bookkeeping-visual" aria-hidden="true">
          <div className="ledger-orbit"/>
          <div className="ledger-card">
            <div className="ledger-topline"><span className="ledger-symbol"><ChartNoAxesCombined size={25}/></span><span>THE BIGGER PICTURE</span></div>
            <div className="ledger-heading">It starts with<br/><span>well-kept books.</span></div>
            <div className="ledger-rule"/>
            <div className="ledger-entry"><span className="ledger-check"><Check size={17}/></span><div><strong>Organized records</strong><span>The details, brought together.</span></div></div>
            <div className="ledger-entry"><span className="ledger-check"><Check size={17}/></span><div><strong>A clearer view</strong><span>Your numbers, easier to follow.</span></div></div>
            <div className="ledger-entry"><span className="ledger-check"><Check size={17}/></span><div><strong>Personal attention</strong><span>A team you can connect with.</span></div></div>
            <div className="ledger-bottom">Less guesswork. More understanding.</div>
          </div>
          <div className="ledger-note"><BookOpen size={18}/> Make sense of the numbers.</div>
        </div>
      </section>
      <div className="trust-strip"><div className="container trust-inner"><span>ATTENTION TO WHAT MATTERS</span><div><BookOpen size={18} aria-hidden="true"/> Organized records</div><div><ChartNoAxesCombined size={18} aria-hidden="true"/> Clear information</div><div><Mail size={18} aria-hidden="true"/> A direct connection</div></div></div>
      <section id="bookkeeping" className="steps-section container services-detail" aria-labelledby="services-title">
        <div className="section-heading"><span className="section-kicker">WHAT WE CAN HELP WITH</span><h2 id="services-title">Support for the everyday details.<br/><em>Clarity for the bigger picture.</em></h2><p>Whether you need ongoing bookkeeping or help getting your records back on track, we’ll discuss what your business needs and agree on the right scope of work.</p></div>
        <div className="service-detail-grid">
          <article className="service-detail-card"><div className="step-icon"><BookOpen size={25} aria-hidden="true"/></div><h3>Everyday bookkeeping</h3><p>Keep income, expenses, and supporting records organized so you can follow the activity in your business.</p><ul><li>Record and categorize financial transactions.</li><li>Organize receipts and supporting documents.</li><li>Track unpaid invoices and outstanding bills.</li></ul><p className="service-outcome"><strong>The goal:</strong> Records that are easier to maintain, review, and find when you need them.</p></article>
          <article className="service-detail-card"><div className="step-icon"><RefreshCw size={25} aria-hidden="true"/></div><h3>Bank &amp; credit-card reconciliation</h3><p>Compare your books with your account statements to help identify where the numbers need attention.</p><ul><li>Match recorded activity to bank and card statements.</li><li>Identify missing entries, duplicates, or discrepancies.</li><li>Follow up on items that need clarification.</li></ul><p className="service-outcome"><strong>The goal:</strong> Balances that reflect the activity in your accounts.</p></article>
          <article className="service-detail-card"><div className="step-icon"><ChartNoAxesCombined size={25} aria-hidden="true"/></div><h3>Monthly financial reporting</h3><p>Turn your bookkeeping records into information you can use to understand how your business is doing.</p><ul><li>Prepare monthly financial reports from your books.</li><li>Review income, expenses, and account balances.</li><li>Discuss questions and changes you want to understand.</li></ul><p className="service-outcome"><strong>The goal:</strong> A regular, clearer view of where things stand.</p></article>
          <article className="service-detail-card"><div className="step-icon"><FolderCheck size={25} aria-hidden="true"/></div><h3>Catch-up &amp; cleanup bookkeeping</h3><p>If records have fallen behind or the books don’t look right, we can help work through the backlog.</p><ul><li>Review existing records and identify gaps.</li><li>Organize outstanding transactions and documents.</li><li>Address bookkeeping inconsistencies and overdue reconciliations.</li></ul><p className="service-outcome"><strong>The goal:</strong> A more organized starting point and a practical plan for staying current.</p></article>
          <article className="service-detail-card"><div className="step-icon"><Users size={25} aria-hidden="true"/></div><h3>Payroll support</h3><p>Keep payroll information organized and connected with the rest of your bookkeeping.</p><ul><li>Organize payroll records and supporting information.</li><li>Record payroll-related expenses in your books.</li><li>Discuss the support you need alongside your existing payroll process or provider.</li></ul><p className="service-outcome"><strong>The goal:</strong> Payroll records that fit into a clearer overall financial picture.</p></article>
          <article className="service-detail-card"><div className="step-icon"><ReceiptText size={25} aria-hidden="true"/></div><h3>Business financial guidance</h3><p>Make time to talk through your numbers and the practical questions that come with running a business.</p><ul><li>Review financial reports in plain language.</li><li>Discuss income, expenses, cash flow, and budgeting needs.</li><li>Identify financial information that can help you plan your next steps.</li></ul><p className="service-outcome"><strong>The goal:</strong> Better understanding to support your business decisions.</p></article>
        </div>
        <div className="services-next"><p>Not sure where to start? Tell us what’s working, what’s behind, and what you’d like help with.</p><a href={contactHref} className="text-link">Discuss your bookkeeping needs <ArrowRight size={17} aria-hidden="true"/></a></div>
      </section>
      <section className="getting-started-section" aria-labelledby="getting-started-title"><div className="container">
        <div className="section-heading"><span className="section-kicker">WORKING WITH NUMERACOUNT</span><h2 id="getting-started-title">A straightforward way<br/><em>to get started.</em></h2><p>You don’t need to have everything perfectly organized before reaching out.</p></div>
        <ol className="getting-started-list">
          <li><span className="process-number" aria-hidden="true">01</span><h3>Tell us about your business</h3><p>Email us with the support you’re looking for, the tools you use, and whether your records are current or need catching up.</p></li>
          <li><span className="process-number" aria-hidden="true">02</span><h3>Agree on the work</h3><p>We’ll discuss your priorities, the records involved, and the scope and pricing before work begins.</p></li>
          <li><span className="process-number" aria-hidden="true">03</span><h3>Share records privately</h3><p>Once we set up your client space, you can sign in with your registered email to upload and receive documents.</p></li>
          <li><span className="process-number" aria-hidden="true">04</span><h3>Review and stay connected</h3><p>Keep in touch as we work through your books, clarify questions, and review the information relevant to your needs.</p></li>
        </ol>
      </div></section>
      <section id="about" className="about-section" aria-labelledby="about-title"><div className="container about-grid">
        <div><span className="section-kicker">ABOUT NUMERACOUNT</span><h2 id="about-title">The details matter.<br/><em>So does the person behind them.</em></h2></div>
        <div><p>Numeracount provides bookkeeping, payroll support, and business financial guidance with a practical focus: organized records, clear information, and a straightforward working relationship.</p><p>We believe you should feel comfortable asking questions about your books. Tell us what you’re looking for, and we’ll start the conversation there.</p><a href={contactHref} className="text-link">Get in touch <ArrowRight size={17} aria-hidden="true"/></a></div>
      </div></section>
      <section className="container faq-section" aria-labelledby="faq-title"><div className="faq-intro"><span className="section-kicker">COMMON QUESTIONS</span><h2 id="faq-title">A little more clarity<br/>before we begin.</h2><p>Have another question? Email <a href={contactHref}>{email}</a>.</p></div><div className="faq-list">
        <details><summary>Can you help if my books are behind?</summary><p>Yes. Catch-up and cleanup bookkeeping can help organize overdue records, identify missing information, and address inconsistencies. We’ll first discuss how far behind the books are and which records are available so we can agree on the work involved.</p></details>
        <details><summary>What should I have ready for our first conversation?</summary><p>Start with a brief description of your business, the bookkeeping software or tools you use, and the areas where you need support. Bank and credit-card statements, existing reports, invoices, bills, and receipts may be useful as we review your needs. We’ll let you know which records are needed for the agreed work.</p></details>
        <details><summary>Can you track invoices and bills?</summary><p>Yes. As part of bookkeeping, we can help keep track of unpaid customer invoices and outstanding business bills, giving you a clearer view of what is owed to you and what your business owes. We’ll discuss how this fits into your existing process.</p></details>
        <details><summary>What kind of payroll support do you provide?</summary><p>We can help organize payroll information and record payroll-related expenses in your books. Tell us about your current payroll process or provider so we can confirm the support you need and the responsibilities included in the engagement.</p></details>
        <details><summary>Do you prepare tax returns?</summary><p>We don’t offer tax preparation. We can help organize your bookkeeping records so you have clearer financial information to share with your tax preparer.</p></details>
        <details><summary>How is pricing determined?</summary><p>Pricing depends on the scope of work, the amount and condition of your records, and the support your business needs. Email us to discuss your situation. We’ll confirm the scope and pricing before starting work.</p></details>
        <details><summary>How do I send documents securely?</summary><p>We’ll create a private client space for you. After it’s set up, use Client sign in with the email address registered for your space. You can upload and download your documents, and access is restricted to you and authorized Numeracount staff.</p></details>
      </div></section>
      <section className="container client-support" aria-labelledby="existing-client-title">
        <div className="client-support-icon"><ShieldCheck size={30} aria-hidden="true"/></div>
        <div><span className="section-kicker">FOR EXISTING CLIENTS</span><h2 id="existing-client-title">Your documents have a private place.</h2><p>Sign in to exchange documents with the Numeracount team. Your client space is restricted to you and authorized staff.</p></div>
        <Link href={portalHref} className="button button-dark"><LockKeyhole size={17} aria-hidden="true"/> Client sign in</Link>
      </section>
      <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="container contact-grid">
        <div><span className="section-kicker">LET’S CONNECT</span><h2 id="contact-title">Let’s talk about<br/>your bookkeeping.</h2><p>Tell us a little about your business, the support you need, and whether your records are current or need catching up.</p></div>
        <div className="contact-details"><span>Email Numeracount</span><a href={contactHref} className="contact-email">{email}</a><a href={contactHref} className="button button-primary">Email our team <ArrowRight size={18} aria-hidden="true"/></a></div>
      </div></section>
    </main>
    <footer className="footer"><div className="container footer-inner"><Brand/><span>© {new Date().getFullYear()} Numeracount. All rights reserved.</span><a href={contactHref}>{email}</a></div></footer>
  </div>;
}
