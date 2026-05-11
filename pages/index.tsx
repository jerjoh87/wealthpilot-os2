import type { NextPage } from 'next'
import Link from 'next/link'

const topMetrics = [
  { label: 'Net Worth', value: '$1,284,632', trend: '+12.7% vs last month', tone: 'up' },
  { label: 'Monthly Cash Flow', value: '$8,642', trend: '+8.3% vs last month', tone: 'up' },
  { label: 'Investments', value: '$926,123', trend: '+15.4% vs last month', tone: 'up' },
  { label: 'Savings Rate', value: '26.4%', trend: '-3.1% vs last month', tone: 'down' },
]

const featureCards = [
  { title: 'Smart Budgeting', desc: 'Auto-categorize spending and build budgets that actually work.' },
  { title: 'Bills & Calendar', desc: 'Plan, track, and never miss a payment again.' },
  { title: 'AI Financial Coach', desc: 'Personalized insights and action plans tailored to your goals.' },
  { title: 'Credit Score Tracker', desc: 'Monitor your score and learn what improves it over time.' },
  { title: 'Portfolio & Investing', desc: 'Track performance, diversification, and rebalancing ideas.' },
  { title: 'Profit Lock', desc: 'Set smart thresholds to protect gains in volatile markets.' },
]

const plans = [
  { name: 'Free', price: '$0', detail: 'For getting started', cta: 'Get Started' },
  { name: 'Pro', price: '$7.99', detail: 'For serious money management', cta: 'Start Free Trial', highlight: true },
  { name: 'Premium', price: '$14.99', detail: 'For wealth builders', cta: 'Start Free Trial' },
]

const Home: NextPage = () => {
  return (
    <div className="page">
      <header className="topbar shell">
        <div className="brand">WealthPilot <span>OS</span></div>
        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="actions">
          <Link href="/dashboard" className="ghost">Sign In</Link>
          <Link href="/dashboard" className="solid">Get Started</Link>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <div className="heroCopy">
            <p className="kicker">All-in-one financial operating system</p>
            <h1>Your AI-powered command center for <span>money</span>, <span>bills</span>, <span>credit</span>, and <span>investing</span>.</h1>
            <p>Connect your accounts, track spending, plan bills, monitor credit, and get AI-powered insights that grow your wealth.</p>
            <div className="heroCta">
              <Link href="/dashboard" className="solid">Start Free</Link>
              <Link href="/dashboard" className="ghost">View Dashboard</Link>
            </div>
          </div>

          <div className="dashMock">
            <h3>Good morning, Alex! 👋</h3>
            <div className="metricRow">
              {topMetrics.map((item) => (
                <article key={item.label} className="metricCard">
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <span className={item.tone}>{item.trend}</span>
                </article>
              ))}
            </div>
            <div className="mockGrid">
              <article className="chart">Net Worth Trend</article>
              <article className="donut">Asset Allocation</article>
              <article className="insight">AI Financial Insight</article>
            </div>
          </div>
        </section>

        <section id="features" className="featureSection">
          <h2>Everything you need to take control of your money</h2>
          <div className="featureGrid">
            {featureCards.map((feature) => (
              <article key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="pricingSection">
          <h2>Simple, transparent pricing</h2>
          <div className="pricingGrid">
            {plans.map((plan) => (
              <article key={plan.name} className={plan.highlight ? 'plan highlight' : 'plan'}>
                <h3>{plan.name}</h3>
                <p className="price">{plan.price} <span>/ month</span></p>
                <p>{plan.detail}</p>
                <Link href="/dashboard" className="ghost">{plan.cta}</Link>
              </article>
            ))}
          </div>
        </section>

        <section id="security" className="footerCta">
          <h2>Join thousands taking control of their financial future.</h2>
          <p>Start your journey with WealthPilot OS today.</p>
          <Link href="/dashboard" className="solid">Start Free</Link>
        </section>

      <style jsx>{`
        .page { min-height: 100vh; background: radial-gradient(circle at 25% 10%, #25145f 0, #090d27 50%, #050711 100%); color: #ecedff; font-family: Inter, Arial, sans-serif; }
        .shell { width: min(1320px, 94%); margin: 0 auto; }
        .topbar { padding: 18px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .brand { font-size: 1.45rem; font-weight: 700; }
        .brand span { color: #9b6cff; }
        nav { display: flex; gap: 28px; }
        nav a { color: #cdd4ff; text-decoration: none; font-size: .95rem; }
        .actions { display: flex; gap: 10px; }
        .solid, .ghost { border-radius: 12px; padding: 10px 18px; text-decoration: none; font-weight: 700; border: 1px solid transparent; }
        .solid { background: linear-gradient(90deg, #7049ff, #8748ff); color: #fff; }
        .ghost { color: #d8defe; border-color: rgba(147, 165, 255, .4); background: rgba(123, 146, 255, .1); }

        .hero { margin-top: 12px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 22px; }
        .heroCopy, .dashMock, .featureSection, .pricingSection, .footerCta { border: 1px solid rgba(131, 148, 255, .22); border-radius: 18px; background: rgba(7, 11, 30, .72); backdrop-filter: blur(4px); }
        .heroCopy { padding: 34px; }
        .kicker { color: #9cc2ff; margin-bottom: 8px; }
        h1 { font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.13; margin: 0 0 16px; }
        h1 span:nth-of-type(1) { color: #9f6dff; }
        h1 span:nth-of-type(2) { color: #53b6ff; }
        h1 span:nth-of-type(3) { color: #7d8fff; }
        h1 span:nth-of-type(4) { color: #3dd066; }
        .heroCopy p { color: #bec8f3; line-height: 1.6; }
        .heroCta { display: flex; gap: 12px; margin-top: 18px; }

        .dashMock { padding: 22px; }
        .dashMock h3 { margin: 0 0 14px; }
        .metricRow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .metricCard { padding: 12px; border-radius: 12px; background: rgba(16, 23, 54, .86); border: 1px solid rgba(138, 156, 255, .18); }
        .metricCard small { color: #92a8e8; display: block; }
        .metricCard strong { margin: 6px 0; display: block; }
        .metricCard span { font-size: .85rem; }
        .up { color: #4fe37f; }
        .down { color: #ff9658; }

        .mockGrid { margin-top: 14px; display: grid; gap: 10px; grid-template-columns: 1.4fr .9fr .9fr; }
        .mockGrid article { min-height: 120px; border-radius: 14px; background: linear-gradient(140deg, rgba(20, 28, 63, .9), rgba(9, 14, 33, .9)); border: 1px solid rgba(131, 152, 255, .2); padding: 16px; font-weight: 600; }

        .featureSection, .pricingSection, .footerCta { margin-top: 20px; padding: 24px; }
        h2 { margin: 0 0 16px; font-size: clamp(1.55rem, 3vw, 2.4rem); }
        .featureGrid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .featureGrid article { border: 1px solid rgba(136, 153, 255, .16); border-radius: 14px; background: rgba(14, 21, 49, .75); padding: 16px; }
        .featureGrid h3 { margin: 0 0 8px; }
        .featureGrid p { margin: 0; color: #b8c5ef; }

        .pricingGrid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .plan { border-radius: 14px; border: 1px solid rgba(137, 155, 255, .2); background: rgba(12, 19, 45, .8); padding: 16px; }
        .highlight { border-color: #8e64ff; box-shadow: 0 0 0 1px rgba(142, 100, 255, .4), 0 14px 34px rgba(95, 64, 196, .28); }
        .price { font-size: 2rem; margin: 10px 0 6px; }
        .price span { font-size: .95rem; color: #abbbeb; }

        .footerCta { text-align: center; margin-bottom: 24px; }
        .footerCta p { color: #bdc9f1; }

        @media (max-width: 1080px) {
          .hero { grid-template-columns: 1fr; }
          .metricRow { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 760px) {
          nav { display: none; }
          .featureGrid, .pricingGrid, .mockGrid, .metricRow { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default Home
