import Link from "next/link";
import { ArrowRight, BookOpen, Check, ChartNoAxesCombined, Mail, LockKeyhole, ShieldCheck } from "lucide-react";
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
        <a href="#bookkeeping">Bookkeeping</a><a href="#about">About us</a><a href="#contact">Contact</a>
        <Link href={portalHref} className="button button-small button-dark">Client sign in <ArrowRight size={15} aria-hidden="true"/></Link>
      </nav>
    </header>
    <main id="main-content" tabIndex={-1}>
      <section className="hero container" aria-labelledby="home-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" aria-hidden="true"/> BOOKKEEPING WITH NUMERACOUNT</div>
          <h1 id="home-title">Clear books.<br/><em>A clearer picture.</em></h1>
          <p>Your financial records should help you understand your business. Numeracount provides bookkeeping support to keep those records organized and your numbers easier to follow.</p>
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
      <section id="bookkeeping" className="steps-section container" aria-labelledby="services-title">
        <div className="section-heading"><span className="section-kicker">OUR SERVICES</span><h2 id="services-title">Bookkeeping that brings<br/><em>the details into focus.</em></h2><p>Practical support for keeping track of your business finances.</p></div>
        <div className="steps-grid">
          <article className="step-card"><span className="step-number" aria-hidden="true">01</span><div className="step-icon"><BookOpen size={25} aria-hidden="true"/></div><h3>Keep your records organized</h3><p>Bring your financial records together so the information you need is easier to find and follow.</p></article>
          <article className="step-card"><span className="step-number" aria-hidden="true">02</span><div className="step-icon"><ChartNoAxesCombined size={25} aria-hidden="true"/></div><h3>Understand your numbers</h3><p>A clearer view of your books helps you see where things stand and ask informed questions.</p></article>
          <article className="step-card"><span className="step-number" aria-hidden="true">03</span><div className="step-icon"><Mail size={25} aria-hidden="true"/></div><h3>Work with a real team</h3><p>Talk with Numeracount about your bookkeeping needs and the support that makes sense for you.</p></article>
        </div>
      </section>
      <section id="about" className="about-section" aria-labelledby="about-title"><div className="container about-grid">
        <div><span className="section-kicker">ABOUT NUMERACOUNT</span><h2 id="about-title">The details matter.<br/><em>So does the person behind them.</em></h2></div>
        <div><p>Numeracount provides bookkeeping services with a practical focus: organized records, clear information, and a straightforward working relationship.</p><p>We believe you should feel comfortable asking questions about your books. Tell us what you’re looking for, and we’ll start the conversation there.</p><a href={contactHref} className="text-link">Get in touch <ArrowRight size={17} aria-hidden="true"/></a></div>
      </div></section>
      <section className="container client-support" aria-labelledby="existing-client-title">
        <div className="client-support-icon"><ShieldCheck size={30} aria-hidden="true"/></div>
        <div><span className="section-kicker">FOR EXISTING CLIENTS</span><h2 id="existing-client-title">Your documents have a private place.</h2><p>Sign in to exchange documents with the Numeracount team. Your client space is restricted to you and authorized staff.</p></div>
        <Link href={portalHref} className="button button-dark"><LockKeyhole size={17} aria-hidden="true"/> Client sign in</Link>
      </section>
      <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="container contact-grid">
        <div><span className="section-kicker">LET’S CONNECT</span><h2 id="contact-title">Let’s talk about<br/>your bookkeeping.</h2><p>Tell us a little about your business and the bookkeeping support you’re looking for.</p></div>
        <div className="contact-details"><span>Email Numeracount</span><a href={contactHref} className="contact-email">{email}</a><a href={contactHref} className="button button-primary">Email our team <ArrowRight size={18} aria-hidden="true"/></a></div>
      </div></section>
    </main>
    <footer className="footer"><div className="container footer-inner"><Brand/><span>© {new Date().getFullYear()} Numeracount. All rights reserved.</span><a href={contactHref}>{email}</a></div></footer>
  </div>;
}
