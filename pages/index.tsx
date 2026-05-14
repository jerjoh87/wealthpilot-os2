import type { NextPage } from 'next'
import Link from 'next/link'

const benefits = [
  { icon: '🔐', title: 'Secure Bank Sync', copy: 'Connect accounts with read-only, bank-level security.' },
  { icon: '✨', title: 'AI-Powered Insights', copy: 'Get smart guidance based on your spending behavior.' },
  { icon: '🎯', title: 'Reach Your Goals', copy: 'Plan milestones and track progress in real time.' },
  { icon: '📊', title: 'Clean Reports', copy: 'Beautiful monthly summaries you can actually use.' },
]

const features = [
  { icon: '📒', title: 'Budget Tracking', copy: 'Set spending plans and monitor every category with clarity.' },
  { icon: '🤖', title: 'AI Coach', copy: 'Ask natural questions and receive practical money actions.' },
  { icon: '📈', title: 'Spending Insights', copy: 'Spot trends, overspending, and savings opportunities fast.' },
  { icon: '🏁', title: 'Goal Planning', copy: 'Build and manage savings goals with smart recommendations.' },
  { icon: '🧾', title: 'Smart Reports', copy: 'Understand your monthly progress with clean visual reports.' },
  { icon: '🏦', title: 'Bank Connections', copy: 'Sync multiple institutions for one complete money view.' },
]

const testimonials = [
  {
    name: 'Sarah J.',
    role: 'Marketing Manager',
    quote:
      'AI Budget changed the way I manage my money. The insights are amazing and I’m saving more every month!',
  },
  {
    name: 'Mike R.',
    role: 'Software Engineer',
    quote: 'The AI coach is like having a personal financial advisor in my pocket.',
  },
  {
    name: 'Emily K.',
    role: 'Freelancer',
    quote: 'Beautiful app, super easy to use, and actually helps me reach my savings goals.',
  },
]

const Home: NextPage = () => {
  return (
    <div className="landing">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <header className="shell navWrap">
        <div className="navBar">
          <div className="brand">WealthPilot</div>
          <nav>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#reviews">Reviews</a>
          </nav>
          <div className="navCta">
            <Link href="/dashboard" className="btn ghostBtn">Sign in</Link>
            <Link href="/dashboard" className="btn gradientBtn">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="shell pageFlow">
        <section className="hero">
          <div>
            <span className="pill">AI-Powered Personal Finance</span>
            <h1>
              Smarter Budgeting,
              <br />
              <span>Powered by AI.</span>
            </h1>
            <p className="lead">
              Track spending, build budgets, reach savings goals, and get AI insights that help you make smarter financial decisions.
            </p>
            <div className="heroCta">
              <Link href="/dashboard" className="btn gradientBtn">Start Free</Link>
              <Link href="/dashboard" className="btn ghostBtn">Watch Demo</Link>
            </div>
            <div className="trustDots">
              <span>• Free 14-day trial</span>
              <span>• No credit card</span>
              <span>• Cancel anytime</span>
            </div>
          </div>

          <article className="dashboardMock">
            <aside>
              <h4>AI Budget</h4>
              <span>Dashboard</span><span>Transactions</span><span>Budgets</span><span>Goals</span><span>Reports</span>
            </aside>
            <div className="mockMain">
              <div className="miniGrid">
                <div><small>Total Balance</small><strong>$1,148.00</strong></div>
                <div><small>Monthly Budget</small><strong>$1,240.00</strong></div>
              </div>
              <div className="spendCard">
                <small>Spending Breakdown</small>
                <div className="bar"><i style={{ width: '72%' }} /></div>
              </div>
              <div className="miniGrid">
                <div><small>Savings Goal</small><strong>$3,450.00</strong></div>
                <div><small>AI Insight</small><p>Dining spend up 18%. Shift $80 to savings this week.</p></div>
              </div>
            </div>
          </article>
        </section>

        <section className="benefitStrip" id="how-it-works">
          {benefits.map((item, index) => (
            <article key={item.title} className={index < benefits.length - 1 ? 'divider' : ''}>
              <div className="iconGlow">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </section>

        <section id="features" className="section">
          <div className="sectionHead">
            <div>
              <small>POWERFUL FEATURES</small>
              <h2>Everything You Need to <span>Master Your Money</span></h2>
            </div>
            <Link href="/dashboard" className="btn ghostBtn">Explore all features →</Link>
          </div>
          <div className="featureGrid">
            {features.map((feature) => (
              <article key={feature.title} className="glassCard">
                <div className="iconGlow">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="aiShowcase">
          <div className="leftDecor">
            <div className="starCard">✦ AI Insight Engine</div>
            <div className="miniChart"><span /></div>
          </div>
          <div>
            <small>AI INSIGHT</small>
            <h2>AI that Works for You</h2>
            <p>Our AI analyzes your spending patterns, detects behavior shifts, and gives actionable next steps to improve cash flow and accelerate goals.</p>
            <Link href="/dashboard" className="btn gradientBtn">See how it works →</Link>
          </div>
        </section>

        <section className="statsRow">
          <article className="glassCard"><h3>Total Balance</h3><p className="metric">$1,148.00</p><div className="line" /></article>
          <article className="glassCard"><h3>Monthly Budget</h3><p className="metric">$1,240.00</p><div className="bar"><i style={{ width: '66%' }} /></div></article>
          <article className="glassCard"><h3>Spending Breakdown</h3><div className="donut" /><p>Housing • Food • Transport</p></article>
          <article className="glassCard"><h3>Savings Goal</h3><p className="metric">$3,450.00</p><div className="bar green"><i style={{ width: '58%' }} /></div></article>
        </section>

        <section id="reviews" className="section">
          <div className="sectionHead">
            <div><small>TRUSTED BY THOUSANDS</small><h2>Loved by People Like You</h2></div>
            <Link href="/dashboard" className="btn ghostBtn">View all reviews →</Link>
          </div>
          <div className="testimonialGrid">
            {testimonials.map((t) => (
              <article key={t.name} className="glassCard">
                <div className="stars">★★★★★</div>
                <p>“{t.quote}”</p>
                <div className="person"><span /> <div><strong>{t.name}</strong><small>{t.role}</small></div></div>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="section">
          <small>SIMPLE, TRANSPARENT PRICING</small>
          <h2>Choose the Plan That’s Right for You</h2>
          <div className="toggle">Monthly <span>Yearly</span> <em>Save 20%</em></div>
          <div className="pricingGrid">
            <article className="glassCard"><h3>Free</h3><p className="metric">$0 <small>/ month</small></p><ul><li>Connect up to 2 accounts</li><li>Basic budgeting</li><li>Standard reports</li></ul><Link href="/dashboard" className="btn ghostBtn">Get Started</Link></article>
            <article className="glassCard popular"><b>Most Popular</b><h3>Pro</h3><p className="metric">$9.99 <small>/ month</small></p><ul><li>Unlimited accounts</li><li>AI insights & coach</li><li>Advanced reports</li><li>Custom goals</li></ul><Link href="/dashboard" className="btn gradientBtn">Start Free Trial</Link></article>
            <article className="glassCard"><h3>Premium</h3><p className="metric">$19.99 <small>/ month</small></p><ul><li>Everything in Pro</li><li>Priority support</li><li>Early access to new features</li></ul><Link href="/dashboard" className="btn ghostBtn">Start Free Trial</Link></article>
          </div>
        </section>

        <section className="finalCta">
          <div><h2>Ready to Take Control of Your Finances?</h2><p>Join thousands of people who are already saving more, spending smarter, and building a better future.</p></div>
          <Link href="/dashboard" className="btn gradientBtn">Start Managing Money Smarter →</Link>
        </section>
      </main>

      <footer className="shell footer">
        <div><h3>WealthPilot</h3><p>Your premium AI finance command center.</p></div>
        <div><h4>Product</h4><Link href="/dashboard">Dashboard</Link><Link href="#pricing">Pricing</Link></div>
        <div><h4>Resources</h4><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        <div><h4>Company</h4><Link href="/contact">Contact</Link><Link href="/disclaimer">Disclaimer</Link></div>
        <div><h4>Stay Updated</h4><input placeholder="Enter your email" /><div className="social">◉ ◉ ◉</div></div>
      </footer>

      <style jsx>{`
        .landing{background:#050B1F;color:#F8FAFC;min-height:100vh;position:relative;overflow:hidden;font-family:Inter,system-ui,sans-serif}
        .shell{width:min(1240px,92%);margin:0 auto;position:relative;z-index:2}.pageFlow{display:grid;gap:22px;padding-bottom:40px}
        .ambient{position:absolute;border-radius:999px;filter:blur(90px);opacity:.35}.ambientOne{width:500px;height:500px;background:#8B5CF6;left:-180px;top:-120px}.ambientTwo{width:420px;height:420px;background:#3B82F6;right:-160px;top:280px}
        .navWrap{padding-top:20px}.navBar{display:flex;align-items:center;justify-content:space-between;background:rgba(10,18,45,.75);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:14px 18px;backdrop-filter:blur(18px)}
        .brand{font-weight:800;font-size:1.2rem}nav{display:flex;gap:24px}nav a{color:#A7B0C3;text-decoration:none}.navCta,.heroCta{display:flex;gap:10px}
        .btn{padding:11px 16px;border-radius:14px;text-decoration:none;color:#fff;border:1px solid transparent;display:inline-block}.gradientBtn{background:linear-gradient(135deg,#6366F1,#8B5CF6,#A855F7);box-shadow:0 14px 35px rgba(139,92,246,.35)}.ghostBtn{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12)}
        .hero{display:grid;grid-template-columns:1fr 1.05fr;gap:20px;background:rgba(10,18,45,.75);border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:30px;backdrop-filter:blur(18px)}
        .pill{display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(59,130,246,.18);border:1px solid rgba(255,255,255,.16);color:#cfe3ff}.hero h1{font-size:clamp(2rem,5vw,3.9rem);line-height:1.08;margin:16px 0}.hero h1 span{background:linear-gradient(120deg,#8B5CF6,#3B82F6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.lead{color:#A7B0C3;max-width:620px}.trustDots{display:flex;gap:16px;flex-wrap:wrap;color:#A7B0C3;margin-top:12px}
        .dashboardMock{background:linear-gradient(180deg,rgba(15,23,52,.9),rgba(8,13,32,.82));border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:14px;display:grid;grid-template-columns:130px 1fr;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
        .dashboardMock aside{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:8px}.dashboardMock aside span{color:#A7B0C3;font-size:.87rem}
        .mockMain{display:grid;gap:10px}.miniGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.miniGrid div,.spendCard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px}.miniGrid small,.spendCard small{color:#A7B0C3}.miniGrid strong{display:block;margin-top:5px}
        .bar{height:8px;border-radius:999px;background:rgba(255,255,255,.08);margin-top:9px}.bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#8B5CF6,#3B82F6)}.bar.green i{background:#22C55E}
        .benefitStrip{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(10,18,45,.75);border:1px solid rgba(255,255,255,.08);border-radius:24px;backdrop-filter:blur(18px)}
        .benefitStrip article{padding:20px}.divider{border-right:1px solid rgba(255,255,255,.08)}.iconGlow{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(139,92,246,.2);box-shadow:0 0 24px rgba(139,92,246,.4);margin-bottom:10px}
        .section,.aiShowcase,.statsRow,.finalCta{background:rgba(10,18,45,.75);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px;backdrop-filter:blur(18px)}
        .sectionHead{display:flex;justify-content:space-between;gap:14px;align-items:end}.section small{color:#A7B0C3}.section h2 span{background:linear-gradient(120deg,#8B5CF6,#3B82F6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .featureGrid,.testimonialGrid,.pricingGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}.glassCard{background:linear-gradient(180deg,rgba(15,23,52,.9),rgba(8,13,32,.82));border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);transition:.25s}.glassCard:hover{transform:translateY(-4px)}
        .aiShowcase{display:grid;grid-template-columns:.95fr 1.05fr;gap:18px;background:radial-gradient(circle at left,#5130ad77,transparent 45%),rgba(10,18,45,.8)}
        .starCard,.miniChart{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px}.miniChart{height:100px;position:relative}.miniChart span{position:absolute;left:12px;right:12px;bottom:18px;height:2px;background:linear-gradient(90deg,#8B5CF6,#3B82F6)}
        .statsRow{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric{font-size:1.8rem;margin:8px 0}.line{height:70px;border-radius:12px;background:linear-gradient(180deg,rgba(139,92,246,.3),rgba(59,130,246,.09))}.donut{width:76px;height:76px;border-radius:50%;background:conic-gradient(#8B5CF6 0 42%,#3B82F6 42% 72%,#22C55E 72% 100%);margin:8px 0;position:relative}.donut:after{content:'';position:absolute;inset:15px;background:#0c1638;border-radius:50%}
        .stars{color:#FACC15}.person{display:flex;align-items:center;gap:10px}.person span{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#3B82F6);display:inline-block}.person small{display:block;color:#A7B0C3}
        ul{padding-left:18px} li{margin:6px 0;color:#cfd8ed}.popular{outline:1px solid #8B5CF6;position:relative}.popular b{position:absolute;top:-10px;right:16px;background:#8B5CF6;padding:4px 10px;border-radius:999px;font-size:.74rem}
        .toggle{display:inline-flex;gap:10px;background:rgba(255,255,255,.04);padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.1)}.toggle span{color:#fff}.toggle em{font-style:normal;color:#22C55E}
        .finalCta{display:flex;justify-content:space-between;gap:18px;align-items:center;background:linear-gradient(135deg,rgba(99,102,241,.22),rgba(139,92,246,.2)),rgba(10,18,45,.8)}
        .footer{display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:14px;border-top:1px solid rgba(255,255,255,.08);padding:28px 0 38px}.footer a{display:block;color:#A7B0C3;text-decoration:none;margin:6px 0}.footer input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;color:#fff}.social{margin-top:8px;color:#8B5CF6}
        @media (max-width:1080px){.hero,.aiShowcase{grid-template-columns:1fr}.benefitStrip{grid-template-columns:repeat(2,1fr)}.divider{border-right:0}.featureGrid,.pricingGrid,.statsRow,.testimonialGrid,.footer{grid-template-columns:1fr 1fr}}
        @media (max-width:720px){nav{display:none}.navBar{flex-wrap:wrap;gap:10px}.featureGrid,.pricingGrid,.statsRow,.testimonialGrid,.benefitStrip,.footer{grid-template-columns:1fr}.dashboardMock{grid-template-columns:1fr}.miniGrid{grid-template-columns:1fr}.finalCta,.sectionHead{flex-direction:column;align-items:flex-start}}
      `}</style>
    </div>
  )
}

export default Home
