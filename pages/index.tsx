import type { NextPage } from 'next'
import Link from 'next/link'

const trustItems = [
  'Bank-level encryption',
  'Read-only bank access',
  'Powered by Plaid',
  'AI insights',
  'No hidden fees',
]

const features = [
  {
    title: 'Budgeting',
    description:
      'Track every dollar with live category intelligence, net-worth snapshots, and monthly cash flow trends.',
  },
  {
    title: 'Bills & Calendar',
    description:
      'Stay ahead of due dates with proactive reminders and a visual payment timeline that keeps you on schedule.',
  },
  {
    title: 'AI Coach',
    description:
      'Get personalized guidance on spending, saving, and tradeoffs backed by your real financial data.',
  },
  {
    title: 'Credit Score Tracker',
    description:
      'Monitor your score progress, understand score drivers, and receive targeted actions to improve faster.',
  },
  {
    title: 'Portfolio / Profit Lock',
    description:
      'View allocation, performance, and profit-protection opportunities in one investing command center.',
  },
  {
    title: 'Smart Alerts',
    description:
      'Catch unusual activity, bill spikes, and milestone opportunities before they impact your goals.',
  },
]

const faq = [
  {
    q: 'Is it safe to connect my bank accounts?',
    a: 'Yes. WealthPilot OS uses bank-grade encryption and secure tokenized connections via Plaid. Your credentials are never stored in plain text.',
  },
  {
    q: 'How does the AI feature work?',
    a: 'Our AI analyzes your spending patterns, bills, and trends to deliver practical recommendations you can act on immediately.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. You can upgrade, downgrade, or cancel at any time from your dashboard settings.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'Your paid features remain active through your billing period, and you can continue using the Free plan afterward.',
  },
  {
    q: 'How do I delete my data?',
    a: 'You can request full data deletion from the Delete Account link, and we permanently remove your profile and connected records.',
  },
]

const Home: NextPage = () => {
  return (
    <div className="page">
      <main className="container">
        <section className="hero card">
          <p className="eyebrow">WealthPilot OS</p>
          <h1>Your AI-powered command center for money, bills, credit, and investing.</h1>
          <p className="subheadline">
            Connect your accounts, track spending, plan bills, monitor credit, and get AI-powered financial insights in one premium dashboard.
          </p>
          <div className="ctaRow">
            <Link href="/dashboard" className="btn btnPrimary">Start Free</Link>
            <Link href="/dashboard" className="btn btnSecondary">Sign In</Link>
            <Link href="/dashboard" className="btn btnGhost">View Dashboard Demo</Link>
          </div>
        </section>

        <section className="trust card">
          {trustItems.map((item) => (
            <div className="trustItem" key={item}>{item}</div>
          ))}
        </section>

        <section className="features">
          <h2>Everything you need to run your financial life</h2>
          <div className="grid">
            {features.map((feature) => (
              <article className="card feature" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="preview card">
          <div className="previewHeader">
            <h2>Premium dashboard experience</h2>
            <span>Live overview • Cash flow • AI insights</span>
          </div>
          <div className="previewGrid">
            <div className="mockCard">
              <p>Net Worth</p>
              <strong>$1,234,567</strong>
              <small>+12.5% this month</small>
            </div>
            <div className="mockCard">
              <p>Monthly Cash Flow</p>
              <strong>$8,425</strong>
              <small>Healthy trajectory</small>
            </div>
            <div className="mockChart">
              <p>Asset Allocation</p>
              <div className="ring" />
            </div>
            <div className="mockChart">
              <p>Financial Health Score</p>
              <div className="score">82</div>
            </div>
          </div>
        </section>

        <section className="pricing">
          <h2>Simple pricing</h2>
          <div className="grid pricingGrid">
            <article className="card priceCard">
              <h3>Free</h3>
              <p className="price">$0</p>
              <p>Core tracking, budgeting, and account monitoring.</p>
            </article>
            <article className="card priceCard featured">
              <h3>Pro</h3>
              <p className="price">$9.99/mo</p>
              <p>Advanced AI insights, reports, and smart automations.</p>
            </article>
            <article className="card priceCard">
              <h3>Premium</h3>
              <p className="price">$19.99/mo</p>
              <p>Full intelligence suite, profit lock, and priority support.</p>
            </article>
          </div>
        </section>

        <section className="faq">
          <h2>Frequently asked questions</h2>
          <div className="grid">
            {faq.map((item) => (
              <article className="card faqCard" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footerLinks">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Disclaimer</a>
          <a href="#">Contact</a>
          <a href="#">Delete Account</a>
          <Link href="/dashboard">Dashboard/Login</Link>
        </div>
      </footer>

      <style jsx>{`
        .page { min-height: 100vh; background: radial-gradient(circle at 20% 0%, #2b145f 0%, #070a14 45%, #04060d 100%); color: #e8ecff; font-family: Inter, Arial, sans-serif; }
        .container { width: min(1120px, 92%); margin: 0 auto; padding: 48px 0 64px; }
        .card { background: linear-gradient(145deg, rgba(17,24,49,.9), rgba(8,12,25,.88)); border: 1px solid rgba(132,152,255,.16); border-radius: 20px; box-shadow: 0 20px 45px rgba(0,0,0,.35); }
        .hero { padding: 44px; text-align: center; }
        h1 { font-size: clamp(1.9rem, 3.4vw, 3rem); line-height: 1.2; margin: 12px auto 16px; max-width: 850px; }
        .eyebrow { color: #b9b7ff; letter-spacing: .12em; text-transform: uppercase; font-size: .74rem; }
        .subheadline { max-width: 840px; margin: 0 auto; color: #b9c2e6; line-height: 1.6; }
        .ctaRow { margin-top: 28px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 12px 18px; border-radius: 999px; font-weight: 600; text-decoration: none; transition: .25s ease; border: 1px solid transparent; }
        .btnPrimary { background: linear-gradient(90deg, #7f5bff, #6b8dff); color: white; }
        .btnSecondary { background: rgba(127, 91, 255, .2); border-color: rgba(163, 143, 255, .45); color: #e8ecff; }
        .btnGhost { background: transparent; border-color: rgba(190, 205, 255, .35); color: #cdd8ff; }
        .btn:hover { transform: translateY(-2px); }
        .trust { margin-top: 20px; display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); padding: 14px 20px; gap: 10px; }
        .trustItem { text-align: center; color: #c2ccf3; font-size: .92rem; }
        section { margin-top: 32px; }
        h2 { font-size: clamp(1.4rem, 2.7vw, 2rem); margin-bottom: 16px; }
        .grid { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0,1fr)); }
        .feature, .priceCard, .faqCard { padding: 20px; }
        .feature h3, .faqCard h3, .priceCard h3 { margin: 0 0 10px; }
        .feature p, .faqCard p, .priceCard p { margin: 0; color: #adbadf; line-height: 1.55; }
        .preview { padding: 20px; }
        .previewHeader { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
        .previewHeader span { color: #9fb0e2; font-size: .9rem; }
        .previewGrid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
        .mockCard, .mockChart { background: rgba(9,13,30,.92); border-radius: 14px; border: 1px solid rgba(113,130,230,.22); padding: 16px; min-height: 130px; }
        .mockCard p, .mockChart p { margin: 0; color: #97a7d5; font-size: .88rem; }
        .mockCard strong { display: block; font-size: 1.6rem; margin-top: 12px; }
        .mockCard small { color: #5be9a8; }
        .ring { width: 78px; height: 78px; border-radius: 50%; margin-top: 16px; background: conic-gradient(#7f5bff 0 30%, #19d39a 30% 58%, #4889ff 58% 82%, #f8943a 82% 100%); }
        .score { margin-top: 18px; font-size: 2rem; color: #93f9c8; font-weight: 700; }
        .pricingGrid .featured { border-color: rgba(127, 91, 255, .58); box-shadow: 0 0 0 1px rgba(127,91,255,.4), 0 24px 50px rgba(61,28,129,.55); }
        .price { font-size: 1.7rem; color: #f3f5ff !important; margin-bottom: 8px !important; }
        .footer { border-top: 1px solid rgba(141, 158, 244, .2); padding: 22px 0 34px; margin-top: 24px; }
        .footerLinks { width: min(1120px, 92%); margin: 0 auto; display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .footer a { color: #adb8e4; text-decoration: none; font-size: .92rem; }

        @media (max-width: 1000px) {
          .trust { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .grid, .previewGrid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }

        @media (max-width: 640px) {
          .container { padding-top: 26px; }
          .hero { padding: 26px 18px; }
          .grid, .previewGrid, .trust { grid-template-columns: 1fr; }
          .previewHeader { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  )
}

export default Home
