import type { NextPage } from 'next'
import Link from 'next/link'

const features = [
  ['Smart Budgeting', 'AI-powered spend tracking and monthly insights.'],
  ['Bills & Calendar', 'Track, plan, and never miss a payment again.'],
  ['AI Financial Coach', 'Personalized replies with your real financial data.'],
  ['Credit Score Tracker', 'Monitor your score and get tips to improve it.'],
  ['Portfolio & Investing', 'Track investments, crypto, and diversification.'],
  ['Smart Alerts', 'Get notified about bills, unusual activity, and trends.'],
]

const Home: NextPage = () => {
  return (
    <div className="page">
      <div className="noise" />
      <header className="header shell">
        <div className="logo">WealthPilot <span>OS</span></div>
        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link href="/dashboard" className="btn btnGhost">Sign In</Link>
      </header>

      <main className="shell">
        <HeroSection />

        <section id="features" className="section">
          <h2>Everything you need to take control of your money</h2>
          <div className="featureGrid">
            {features.map(([title, copy]) => (
              <article key={title} className="card featureCard">
                <div className="chip">✦</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <DashboardPreview />
        <AiCoachSection />
        <PricingSection />
        <SecuritySection />
        <FAQSection />
        <FinalCTA />
      </main>

      <style jsx>{`
        :global(:root){--bg-main:#050713;--bg-card:#0b1020;--bg-card-soft:#10162a;--purple:#8b5cf6;--purple-bright:#a855f7;--blue:#3b82f6;--green:#22c55e;--text-main:#f8fafc;--text-muted:#94a3b8;--border:rgba(139,92,246,.25)}
        .page{min-height:100vh;background:radial-gradient(70% 60% at 12% 22%,rgba(139,92,246,.22),transparent 62%),radial-gradient(55% 55% at 92% 38%,rgba(59,130,246,.17),transparent 64%),#050713;color:var(--text-main);font-family:Inter,ui-sans-serif,system-ui;position:relative;overflow:hidden}
        .noise{position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:44px 44px;opacity:.2;pointer-events:none}
        .shell{width:min(1280px,92%);margin:0 auto;position:relative;z-index:1}
        .header{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
        .logo{font-size:1.55rem;font-weight:800}.logo span{color:#a77dff}
        nav{display:flex;gap:30px} nav a{color:#c5d1f5;text-decoration:none}
        .btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 22px;transition:.2s}
        .btnPrimary{background:linear-gradient(135deg,#6d3cff,#954dff);color:#fff;border:1px solid rgba(186,143,255,.4);box-shadow:0 12px 24px rgba(127,72,255,.28)}
        .btnGhost{color:#e9eeff;background:rgba(6,12,32,.6);border:1px solid rgba(145,160,255,.35)}
        .section{margin-top:26px}
        h2{font-size:clamp(1.7rem,3vw,2.6rem);margin:0 0 18px}
        .card{background:linear-gradient(170deg,rgba(15,22,45,.9),rgba(7,12,27,.92));border:1px solid var(--border);border-radius:16px}
        .featureGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .featureCard{padding:16px;transition:.2s}.featureCard:hover{transform:translateY(-4px);box-shadow:0 0 0 1px rgba(159,115,255,.45),0 20px 35px rgba(52,36,111,.35)}
        .chip{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:rgba(146,93,255,.2);border:1px solid rgba(146,93,255,.4);color:#c5a7ff}
        h3{margin:11px 0 8px} p{margin:0;color:var(--text-muted);line-height:1.55}
        @media (max-width:980px){.featureGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (max-width:740px){nav{display:none}.featureGrid{grid-template-columns:1fr}}
      `}</style>
    </div>
  )
}

const HeroSection = () => (
  <section className="hero card">
    <div className="heroLeft">
      <p className="badge">✳ All-in-one financial operating system</p>
      <h1>Your AI-powered command center for <span>money, bills, credit, and investing.</span></h1>
      <p>Connect your accounts, track spending, plan bills, monitor credit, and get AI-powered financial insights in one premium dashboard.</p>
      <div className="ctaRow">
        <Link href="/dashboard" className="btn btnPrimary">Start Free</Link>
        <Link href="/dashboard" className="btn btnGhost">View Dashboard</Link>
      </div>
      <div className="trustRow">
        <div className="avatars"><span/><span/><span/><span/></div>
        <strong>★★★★★</strong>
        <small>4.9/5 from 8,500+ users</small>
      </div>
    </div>
    <div className="heroGlow" />
    <style jsx>{`
      .hero{margin-top:10px;padding:32px;position:relative;display:grid;grid-template-columns:1fr;min-height:420px;overflow:hidden}
      .heroLeft{max-width:620px;z-index:1}
      .badge{display:inline-flex;padding:6px 12px;border:1px solid var(--border);border-radius:999px;background:rgba(17,24,46,.6);color:#b9ccff;font-size:.83rem}
      h1{font-size:clamp(2.3rem,5vw,4rem);line-height:1.08;margin:14px 0}.heroLeft span{background:linear-gradient(90deg,#9367ff,#52b2ff,#3ed86f);-webkit-background-clip:text;background-clip:text;color:transparent}
      .ctaRow{margin-top:18px;display:flex;gap:12px}.trustRow{margin-top:16px;display:flex;align-items:center;gap:10px;color:#9db1e8}
      .avatars{display:flex}.avatars span{width:28px;height:28px;border-radius:50%;border:2px solid #0b1020;background:linear-gradient(160deg,#8f5df9,#3756ff);margin-right:-7px}
      .heroGlow{position:absolute;inset:auto -140px -200px auto;width:540px;height:540px;background:radial-gradient(circle,#9b56ff 0%,rgba(79,48,159,.44) 35%,transparent 68%);filter:blur(4px)}
      @media (max-width:740px){.hero{padding:20px}.ctaRow{flex-direction:column;align-items:flex-start}}
    `}</style>
  </section>
)

const DashboardPreview = () => (
  <section className="section card dashWrap">
    <div className="frame">
      <aside><h4>WealthPilot OS</h4>{['Dashboard','Accounts','Transactions','Bills & Calendar','Budgets','Investments','Credit Score','Goals','Reports','AI Coach'].map(i=><span key={i}>{i}</span>)}</aside>
      <div className="content">
        <div className="top">{['Net Worth\n$1,284,632','Monthly Cash Flow\n$8,642','Investments\n$926,123','Saving Rate\n26.4%'].map(i=><article key={i}>{i}</article>)}<article className="score">Credit Score <strong>742</strong></article></div>
        <div className="middle"><article>Net Worth Trend</article><article>Asset Allocation</article><article>AI Financial Insight</article></div>
        <div className="bottom"><article>Recent Transactions</article><article>Financial Goals</article></div>
      </div>
    </div>
    <style jsx>{`
      .dashWrap{padding:14px;margin-top:24px}.frame{display:grid;grid-template-columns:220px 1fr;gap:12px;background:#070d20;border-radius:14px;padding:12px;border:1px solid var(--border)}
      aside{border:1px solid rgba(130,144,255,.2);padding:12px;border-radius:12px;background:#0a1025;display:flex;flex-direction:column;gap:8px} aside span{font-size:.82rem;color:#9db0e5}
      .content{display:grid;gap:10px}.top{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.top article,.middle article,.bottom article{background:linear-gradient(160deg,#111a3b,#0a132f);border:1px solid rgba(129,144,255,.23);border-radius:12px;padding:12px;white-space:pre-line;color:#c9d7ff}
      .middle{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px}.bottom{display:grid;grid-template-columns:1fr 1fr;gap:10px}.score strong{display:block;font-size:1.8rem;color:#caa1ff}
      @media (max-width:980px){.frame{grid-template-columns:1fr}aside{display:none}.top{grid-template-columns:repeat(2,1fr)}.middle,.bottom{grid-template-columns:1fr}}
    `}</style>
  </section>
)

const AiCoachSection = () => <section className="section card ai"><h2>Meet your AI Financial Coach</h2><div className="chat"><p className="q">How much am I spending on dining out this month?</p><p className="a">You’ve spent $478 on dining out so far this month, which is 21% higher than your monthly average of $398. I recommend setting a budget of $300 to stay on track with your goal.</p><div className="input">Ask another question...</div></div><style jsx>{`.ai{padding:20px;margin-top:24px}.chat{max-width:560px;border:1px solid var(--border);border-radius:14px;padding:12px;background:#0a1128}.q{background:linear-gradient(90deg,#743cff,#9c52ff);padding:8px 12px;border-radius:10px;color:white;font-size:.92rem}.a{margin-top:10px}.input{margin-top:10px;padding:10px;border:1px solid rgba(130,145,255,.26);border-radius:9px;color:#7f95d3}`}</style></section>

const PricingSection = () => <section id="pricing" className="section"><h2>Simple, transparent pricing</h2><div className="pricing">{[['Free','$0 /month','For getting started',['Connect up to 2 accounts','Basic budgeting tools','Bills & payment reminders','Credit score tracking'],'Get Started',false],['Pro','$7.99 /month','For serious money management',['Unlimited account connections','Advanced budgeting','AI Financial Coach','Investment tracking','Smart alerts & reports'],'Start Free Trial',true],['Premium','$14.99 /month','For wealth builders',['Everything in Pro','Portfolio analytics','Profit Lock protection','Priority support','Early access to new features'],'Start Free Trial',false]].map(([n,p,s,f,b,pop])=><article key={n as string} className={`card pCard ${pop?'pop':''}`}>{pop&&<span className='most'>Most Popular</span>}<h3>{n}</h3><p className='price'>{p}</p><p>{s}</p><ul>{(f as string[]).map(x=><li key={x}>{x}</li>)}</ul><Link href='/dashboard' className='btn btnPrimary'>{b}</Link>{n!=='Free'&&<small>7-day free trial · Cancel anytime</small>}</article>)}</div><style jsx>{`.pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.pCard{padding:16px;position:relative}.most{position:absolute;top:-9px;right:14px;background:#8752ff;border-radius:999px;padding:3px 9px;font-size:.72rem}.price{font-size:1.8rem;color:white}ul{padding-left:1rem}li{margin:.2rem 0;color:#b4c3ec}small{color:#8698cb;display:block;margin-top:8px}.pop{box-shadow:0 0 0 1px rgba(154,106,255,.45),0 18px 26px rgba(86,56,177,.35)}@media(max-width:980px){.pricing{grid-template-columns:1fr}}`}</style></section>

const SecuritySection = () => <section id="security" className="section card sec"><h2>Your security is our priority</h2><div>{['Bank-level encryption','SOC 2 Type II compliant','Read-only bank access','No selling of your data','Plaid-powered secure connection'].map(x=><span key={x}>{x}</span>)}</div><style jsx>{`.sec{padding:18px}.sec div{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.sec span{padding:10px;border:1px solid rgba(136,153,255,.22);border-radius:10px;background:#0d1531;color:#c0d0f8;text-align:center;font-size:.9rem}@media(max-width:980px){.sec div{grid-template-columns:1fr 1fr}}`}</style></section>

const FAQSection = () => <section id="faq" className="section card" style={{padding:'18px'}}><h2>Frequently asked questions</h2>{['How does WealthPilot OS connect to my accounts?','Is my data safe?','Can I cancel anytime?','Will this affect my credit score?'].map(q=><details key={q}><summary>{q}</summary><p>WealthPilot uses secure infrastructure and read-only connections designed for safe financial monitoring.</p></details>)}<style jsx>{`details{border:1px solid rgba(133,149,255,.23);padding:12px;border-radius:10px;background:#0b1229;margin:8px 0}summary{cursor:pointer;font-weight:600}`}</style></section>

const FinalCTA = () => <section className="section card final"><div><h2>Join thousands taking control of their financial future.</h2><p>Start your journey with WealthPilot OS today.</p><Link href="/dashboard" className="btn btnPrimary">Start Free</Link></div><div className="trustRow"><div className="avatars"><span/><span/><span/><span/></div><small>Trusted by 8,500+ users</small></div><style jsx>{`.final{padding:20px;margin:24px 0 32px;display:flex;justify-content:space-between;align-items:center;background:radial-gradient(70% 120% at 80% 120%,rgba(129,73,255,.35),rgba(8,12,28,.94))}.trustRow{display:flex;align-items:center;gap:10px;color:#a5b7e6}.avatars{display:flex}.avatars span{width:30px;height:30px;border-radius:50%;border:2px solid #0b1020;background:linear-gradient(150deg,#8a5cf8,#3c5cff);margin-right:-8px}@media(max-width:740px){.final{flex-direction:column;align-items:flex-start;gap:14px}}`}</style></section>

export default Home
