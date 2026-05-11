import type { NextPage } from 'next'
import Link from 'next/link'

const features = [
  'Bank-level encryption',
  'Powered by Plaid',
  'AI-powered insights',
  'Private & secure',
  'Read-only access',
  'Cancel anytime',
]

const productCards = [
  { title: 'Smart Budgeting', body: 'Auto-categorize spending, set live budgets, and track every dollar.' },
  { title: 'Bills & Calendar', body: 'Never miss due dates with reminders and payment planning.' },
  { title: 'AI Financial Coach', body: 'Get personalized money guidance based on your real data.' },
  { title: 'Credit Score Tracker', body: 'Monitor score changes and drivers with actionable steps.' },
  { title: 'Portfolio & Investing', body: 'Track performance, allocation, and risk from one dashboard.' },
  { title: 'Smart Alerts', body: 'Catch unusual spending, bill spikes, and anomalies instantly.' },
]

const Home: NextPage = () => {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">WealthPilot <span>OS</span></div>
        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="actions">
          <Link href="/dashboard" className="btn ghost">Sign In</Link>
          <Link href="/dashboard" className="btn primary">Get Started</Link>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="left">
            <p className="eyebrow">✨ All-in-one financial operating system</p>
            <h1>
              Your AI-powered command center for <span className="c1">money</span>, <span className="c2">bills</span>, <span className="c3">credit</span>, and <span className="c4">investing</span>.
            </h1>
            <p>Connect your accounts, track spending, plan bills, monitor credit, and get AI-powered insights that grow your wealth.</p>
            <div className="cta">
              <Link href="/dashboard" className="btn primary">Start Free</Link>
              <Link href="/dashboard" className="btn ghost">View Dashboard →</Link>
            </div>
          </div>
          <div className="right">
            <div className="mock">
              <div className="mockHead">Good morning, Alex! 👋</div>
              <div className="stats">
                <div><small>Net Worth</small><strong>$1,284,632</strong></div>
                <div><small>Monthly Cash Flow</small><strong>$8,642</strong></div>
                <div><small>Savings Rate</small><strong>26.4%</strong></div>
              </div>
              <div className="graph" />
            </div>
          </div>
        </section>

        <section className="strip" id="features">
          {features.map((f) => <div key={f}>{f}</div>)}
        </section>

        <section className="gridWrap">
          <h2>Everything you need to run your financial life</h2>
          <div className="grid">
            {productCards.map((card) => (
              <article key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pricing" id="pricing">
          <h2>Simple, transparent pricing</h2>
          <div className="plans">
            <div className="plan"><h3>Free</h3><p className="price">$0<span>/month</span></p></div>
            <div className="plan popular"><h3>Pro</h3><p className="price">$7.99<span>/month</span></p></div>
            <div className="plan"><h3>Premium</h3><p className="price">$14.99<span>/month</span></p></div>
          </div>
        </section>

        <section className="security" id="security">
          <h2>Your security is our priority</h2>
          <p>256-bit encryption · SOC 2 alignment · read-only account connections via Plaid.</p>
        </section>

        <section className="faq" id="faq">
          <h2>Frequently asked questions</h2>
          <details><summary>How does WealthPilot connect to my accounts?</summary><p>We use Plaid secure tokenized connections with read-only permissions.</p></details>
          <details><summary>Can I cancel anytime?</summary><p>Yes. You can cancel or downgrade at any time from settings.</p></details>
          <details><summary>Will this impact my credit score?</summary><p>No. Tracking and insights do not trigger hard inquiries.</p></details>
        </section>
      </main>

      <footer className="footer">© 2026 WealthPilot OS · All rights reserved.</footer>

      <style jsx>{`
        .page{min-height:100vh;background:radial-gradient(circle at 20% 0%,#21114f 0,#070b1b 46%,#03050f 100%);color:#eef2ff;font-family:Inter,system-ui,sans-serif}
        .container{width:min(1280px,94%);margin:auto;padding-bottom:64px}
        .topbar{position:sticky;top:0;background:rgba(5,8,20,.75);backdrop-filter:blur(8px);border-bottom:1px solid rgba(129,105,255,.2);display:flex;align-items:center;justify-content:space-between;padding:14px 3%}
        .brand{font-weight:800;font-size:28px}.brand span{color:#9d63ff}
        nav{display:flex;gap:30px} nav a{color:#cfd6ff;text-decoration:none;font-size:14px}
        .actions{display:flex;gap:10px}.btn{padding:10px 18px;border-radius:12px;text-decoration:none;font-weight:700}.primary{background:linear-gradient(90deg,#7f42ff,#4f6bff);color:#fff}.ghost{border:1px solid rgba(151,133,255,.4);color:#d6ddff}
        .hero{display:grid;grid-template-columns:1.02fr 1fr;gap:20px;padding:36px 0}
        .left,.right{background:rgba(6,12,29,.74);border:1px solid rgba(112,90,255,.28);border-radius:20px;padding:28px}
        .eyebrow{color:#9effca;font-size:14px}.left h1{font-size:58px;line-height:1.05;margin:10px 0 16px}
        .left p{color:#b9c5f9;font-size:22px;max-width:780px}.c1{color:#8a64ff}.c2{color:#44a7ff}.c3{color:#6e6cff}.c4{color:#47d976}
        .cta{display:flex;gap:12px;margin-top:20px}
        .mockHead{font-size:20px;font-weight:700;margin-bottom:12px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats div{background:#0d1430;border:1px solid rgba(124,101,255,.25);padding:12px;border-radius:12px}.stats small{display:block;color:#9aa7d4}.stats strong{font-size:22px}
        .graph{margin-top:12px;height:220px;border-radius:14px;border:1px solid rgba(124,101,255,.25);background:linear-gradient(180deg,rgba(148,88,255,.22),rgba(6,8,16,.35))}
        .strip{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;padding:10px;background:rgba(9,14,34,.9);border:1px solid rgba(124,101,255,.2);border-radius:14px}.strip div{text-align:center;color:#c7d4ff;font-size:14px}
        .gridWrap{margin-top:28px}.gridWrap h2,.pricing h2{font-size:40px;margin-bottom:14px}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.grid article,.plan{background:#090f26;border:1px solid rgba(124,101,255,.24);border-radius:14px;padding:16px}.grid p{color:#b8c5f5}
        .pricing{margin-top:30px}.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.price{font-size:40px;font-weight:800}.price span{font-size:16px;color:#8f9bca}.popular{outline:2px solid #824bff}
        .security,.faq{margin-top:28px;background:#090f26;border:1px solid rgba(124,101,255,.24);border-radius:14px;padding:18px}
        .security p,.faq p{color:#b8c5f5}
        details{padding:10px 0;border-top:1px solid rgba(124,101,255,.2)}
        details:first-of-type{border-top:none}
        summary{cursor:pointer;font-weight:600}
        .footer{margin:20px auto 0;width:min(1280px,94%);padding:14px 0;color:#95a1cc;border-top:1px solid rgba(124,101,255,.2)}
        @media (max-width:1100px){.hero{grid-template-columns:1fr}.left h1{font-size:42px}.left p{font-size:18px}.strip{grid-template-columns:repeat(2,1fr)}.grid,.plans{grid-template-columns:1fr 1fr}nav{display:none}}
        @media (max-width:700px){.grid,.plans{grid-template-columns:1fr}.stats{grid-template-columns:1fr}.left h1{font-size:34px}}
      `}</style>
    </div>
  )
}

export default Home
