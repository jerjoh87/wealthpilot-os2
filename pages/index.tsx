import type { NextPage } from 'next'
import Link from 'next/link'

const metrics = [
  { label: 'Assets tracked', value: '$2.4B+', detail: 'Across connected client portfolios' },
  { label: 'Avg. savings uplift', value: '18.7%', detail: 'After 90 days with AI automations' },
  { label: 'On-time bill rate', value: '99.2%', detail: 'Reminder + smart cash-flow planning' },
]

const featureCards = [
  {
    icon: '📊',
    title: 'Executive Money Command',
    description:
      'Unified view of cash flow, liabilities, portfolio exposure, and runway forecasts with live visual intelligence.',
  },
  {
    icon: '🧠',
    title: 'AI Financial Co‑Pilot',
    description:
      'Get clear next-best actions on spending, debt, and investment strategy from a model trained on your real behavior patterns.',
  },
  {
    icon: '🛡️',
    title: 'Risk & Fraud Shield',
    description:
      'Catch unusual transactions, payment spikes, and account anomalies instantly with behavior-based alerting.',
  },
  {
    icon: '📅',
    title: 'Smart Bill Orchestration',
    description:
      'Visual payment timelines and due-date optimization prevent late fees while preserving target liquidity.',
  },
  {
    icon: '📈',
    title: 'Profit Lock Insights',
    description:
      'Track gains, identify de-risk opportunities, and preserve upside with threshold-based portfolio intelligence.',
  },
  {
    icon: '🔐',
    title: 'Institution-Grade Security',
    description:
      'Bank-level encryption, tokenized access via Plaid, and read-only data connections built for trust.',
  },
]

const Home: NextPage = () => {
  return (
    <div className="page">
      <div className="aurora auroraOne" />
      <div className="aurora auroraTwo" />
      <main className="container">
        <section className="hero">
          <div className="heroPanel">
            <p className="eyebrow">WealthPilot OS • Elite Financial Intelligence</p>
            <h1>Make your first impression unforgettable with a premium money platform experience.</h1>
            <p className="subheadline">
              Designed to convert instantly: cinematic visuals, polished motion, and a luxury-grade value proposition that positions your brand as best-in-class from the first scroll.
            </p>
            <div className="ctaRow">
              <Link href="/dashboard" className="btn btnPrimary">Start Free</Link>
              <Link href="/dashboard" className="btn btnSecondary">Book Demo</Link>
            </div>
            <div className="trustRow">
              <span>Powered by Plaid</span>
              <span>Read-only bank access</span>
              <span>AI-guided planning</span>
            </div>
          </div>

          <div className="heroVisual">
            <div className="glassCard large floating">
              <p>Financial Health Score</p>
              <strong>91</strong>
              <small>+11 pts this quarter</small>
            </div>
            <div className="glassCard small drift">
              <p>Cash Flow Signal</p>
              <strong>+ $12,430</strong>
            </div>
            <div className="glassCard small pulse">
              <p>Portfolio Guard</p>
              <strong>Protected</strong>
            </div>
            <div className="orbit orbitOne" />
            <div className="orbit orbitTwo" />
          </div>
        </section>

        <section className="metrics">
          {metrics.map((metric) => (
            <article className="metricCard" key={metric.label}>
              <p>{metric.label}</p>
              <h2>{metric.value}</h2>
              <small>{metric.detail}</small>
            </article>
          ))}
        </section>

        <section className="featuresSection">
          <div className="sectionHeader">
            <p>WHY CLIENTS STAY</p>
            <h2>Built to look premium. Engineered to perform.</h2>
          </div>
          <div className="featureGrid">
            {featureCards.map((feature, idx) => (
              <article className="featureCard" key={feature.title} style={{ animationDelay: `${idx * 90}ms` }}>
                <span className="featureIcon" aria-hidden>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="finalCta">
          <h2>Turn visitors into high-intent clients in under 10 seconds.</h2>
          <p>
            Upgrade your first-screen experience with strong visuals, meaningful motion, and a crystal-clear premium promise.
          </p>
          <Link href="/dashboard" className="btn btnPrimary">Launch WealthPilot</Link>
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          color: #edf2ff;
          font-family: Inter, Arial, sans-serif;
          background: radial-gradient(circle at 10% -10%, #412078 0%, #0a1024 44%, #03060f 100%);
          position: relative;
          overflow: hidden;
        }
        .container { width: min(1150px, 92%); margin: 0 auto; padding: 42px 0 70px; position: relative; z-index: 2; }
        .aurora { position: absolute; border-radius: 999px; filter: blur(38px); opacity: .35; animation: breathe 12s ease-in-out infinite; }
        .auroraOne { width: 360px; height: 360px; background: #8d5dff; top: -120px; left: -140px; }
        .auroraTwo { width: 320px; height: 320px; background: #1ea7ff; bottom: -140px; right: -80px; animation-delay: 2s; }

        .hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 26px; align-items: stretch; }
        .heroPanel, .heroVisual {
          border-radius: 24px;
          border: 1px solid rgba(153, 179, 255, .22);
          background: linear-gradient(145deg, rgba(17, 25, 52, .88), rgba(7, 12, 31, .84));
          box-shadow: 0 30px 65px rgba(0,0,0,.4);
        }
        .heroPanel { padding: 42px; }
        .eyebrow { letter-spacing: .13em; font-size: .72rem; text-transform: uppercase; color: #adc0ff; }
        h1 { margin: 14px 0; line-height: 1.14; font-size: clamp(2rem, 3.8vw, 3.3rem); }
        .subheadline { color: #b5c5ef; line-height: 1.6; max-width: 58ch; }
        .ctaRow { margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
        .btn { padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700; border: 1px solid transparent; transition: transform .2s ease, box-shadow .2s ease; }
        .btn:hover { transform: translateY(-2px); }
        .btnPrimary { color: #fff; background: linear-gradient(90deg, #7d57ff, #488cff); box-shadow: 0 10px 30px rgba(84, 111, 255, .45); }
        .btnSecondary { color: #d8e2ff; background: rgba(117, 146, 255, .15); border-color: rgba(153, 172, 255, .4); }
        .trustRow { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 14px; color: #a5b6e4; font-size: .87rem; }

        .heroVisual { padding: 28px; position: relative; min-height: 360px; overflow: hidden; }
        .glassCard { position: absolute; border-radius: 16px; padding: 16px; backdrop-filter: blur(8px); background: rgba(12, 18, 40, .68); border: 1px solid rgba(158, 178, 255, .24); }
        .glassCard p { margin: 0; font-size: .82rem; color: #9fb4e9; }
        .glassCard strong { display: block; margin-top: 10px; font-size: 1.45rem; }
        .glassCard small { color: #7ef6be; }
        .large { width: 52%; top: 22px; left: 20px; }
        .small { width: 44%; }
        .drift { right: 20px; top: 78px; }
        .pulse { right: 56px; bottom: 30px; }
        .orbit { position: absolute; border-radius: 50%; border: 1px solid rgba(137, 162, 255, .35); }
        .orbitOne { width: 300px; height: 300px; bottom: -120px; left: -70px; animation: spin 18s linear infinite; }
        .orbitTwo { width: 220px; height: 220px; top: -60px; right: -70px; animation: spinReverse 15s linear infinite; }

        .metrics { margin-top: 24px; display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; }
        .metricCard { padding: 20px; border-radius: 18px; background: rgba(10, 18, 40, .7); border: 1px solid rgba(150, 176, 255, .2); }
        .metricCard p { margin: 0; color: #9db2e9; font-size: .86rem; }
        .metricCard h2 { margin: 8px 0 5px; font-size: 2rem; }
        .metricCard small { color: #b1c3f2; }

        .featuresSection { margin-top: 38px; }
        .sectionHeader p { margin: 0; letter-spacing: .15em; color: #9cb1e5; font-size: .74rem; }
        .sectionHeader h2 { margin: 8px 0 18px; font-size: clamp(1.55rem, 3vw, 2.35rem); }
        .featureGrid { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0,1fr)); }
        .featureCard {
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(150deg, rgba(17, 28, 58, .84), rgba(8, 15, 35, .9));
          border: 1px solid rgba(144, 170, 255, .2);
          animation: rise .55s ease both;
        }
        .featureIcon { font-size: 1.2rem; display: inline-block; margin-bottom: 8px; }
        .featureCard h3 { margin: 0 0 8px; font-size: 1.05rem; }
        .featureCard p { margin: 0; color: #b5c6f1; line-height: 1.55; }

        .finalCta { margin-top: 32px; text-align: center; border-radius: 22px; padding: 30px 24px; border: 1px solid rgba(158, 180, 255, .3); background: linear-gradient(90deg, rgba(86, 53, 186, .35), rgba(41, 108, 214, .25)); }
        .finalCta h2 { margin: 0; font-size: clamp(1.35rem, 2.8vw, 2.2rem); }
        .finalCta p { max-width: 720px; margin: 12px auto 18px; color: #c4d2f8; }

        @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spinReverse { to { transform: rotate(-360deg); } }
        @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .floating { animation: float 6s ease-in-out infinite; }
        .drift { animation: float 5.5s ease-in-out infinite .8s; }
        .pulse { animation: float 4.8s ease-in-out infinite .3s; }

        @media (max-width: 980px) {
          .hero { grid-template-columns: 1fr; }
          .featureGrid, .metrics { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (max-width: 640px) {
          .heroPanel { padding: 26px 20px; }
          .featureGrid, .metrics { grid-template-columns: 1fr; }
          .heroVisual { min-height: 320px; }
          .large, .small { width: calc(100% - 30px); }
          .drift { top: 145px; left: 15px; right: auto; }
          .pulse { bottom: 20px; left: 15px; right: auto; }
        }
      `}</style>
    </div>
  )
}

export default Home
