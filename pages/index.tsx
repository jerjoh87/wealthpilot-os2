import type { NextPage } from 'next'
import Link from 'next/link'

const trustBadges = [
  'Bank-level encryption',
  'Read-only bank access',
  'Powered by Plaid',
  'AI insights',
  'Private & secure',
  'Cancel anytime',
]

const problemCards = [
  {
    title: 'Know where your money goes',
    copy: 'Unify transactions, budgets, and trends so every dollar has a job.',
  },
  {
    title: 'Stop missing bills',
    copy: 'Stay ahead with calendar views, reminders, and projected cash flow timing.',
  },
  {
    title: 'Make smarter money moves with AI',
    copy: 'Get instant insights, saving opportunities, and tactical next steps.',
  },
]

const features = [
  { icon: '◈', title: 'Smart Budgeting', copy: 'Auto-categorize spending and shape realistic spending plans.' },
  { icon: '◉', title: 'Bills & Calendar', copy: 'Track due dates and upcoming payments in one timeline.' },
  { icon: '✦', title: 'AI Financial Coach', copy: 'Ask plain-English questions and get clear, actionable answers.' },
  { icon: '◎', title: 'Credit Score Tracker', copy: 'Monitor score direction and understand what is moving it.' },
  { icon: '▣', title: 'Portfolio & Investing', copy: 'See allocation, performance, and diversification at a glance.' },
  { icon: '◬', title: 'Profit Lock', copy: 'Protect gains with guardrails and disciplined rebalancing cues.' },
  { icon: '⚡', title: 'Smart Alerts', copy: 'Get notified about unusual activity, bills, and spending spikes.' },
  { icon: '◍', title: 'Monthly Reports', copy: 'Receive concise, visual recaps of your financial progress.' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0/mo',
    perks: ['Manual budget', 'Credit score logging', 'Basic dashboard', 'Limited AI messages'],
  },
  {
    name: 'Pro',
    price: '$9.99/mo',
    popular: true,
    perks: ['Bank sync', 'AI Coach', 'Bills calendar', 'Smart alerts', 'Monthly reports'],
  },
  {
    name: 'Premium',
    price: '$19.99/mo',
    perks: ['Advanced AI insights', 'Portfolio tools', 'Profit Lock', 'Subscription detection', 'Priority features'],
  },
]

const faqs = [
  { q: 'Is WealthPilot a bank?', a: 'No. WealthPilot OS is a financial dashboard and AI insight platform.' },
  { q: 'Is this financial advice?', a: 'No. AI insights are educational and informational, not personalized investment advice.' },
  { q: 'Is my bank data safe?', a: 'Yes. Bank linking uses secure read-only access and your credentials are never stored by us.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Paid plans can be canceled anytime with no long-term contracts.' },
  { q: 'Does it work on mobile?', a: 'Yes. The experience is fully responsive for phones, tablets, and desktop.' },
  { q: 'Can I use it without connecting a bank?', a: 'Yes. You can start with manual budgeting and upgrade to linked accounts later.' },
]

const Home: NextPage = () => {
  return (
    <div className="landing">
      <div className="bgGlow one" />
      <div className="bgGlow two" />

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
        <section className="hero sectionCard">
          <div className="heroCopy">
            <p className="kicker">AI-first financial operating system</p>
            <h1>Your AI-powered command center for money, bills, credit, and investing.</h1>
            <p>
              WealthPilot OS connects your financial life into one premium dashboard — track spending,
              plan bills, monitor credit, manage investments, and get AI-powered money insights.
            </p>
            <div className="heroCtas">
              <Link href="/dashboard" className="solid">Start Free</Link>
              <Link href="/dashboard" className="ghost">View Dashboard</Link>
            </div>
          </div>

          <div className="heroVisual floaty">
            <aside className="miniSidebar">
              <p className="miniBrand">WP OS</p>
              <span>Dashboard</span><span>Accounts</span><span>Bills</span><span>Credit</span><span>AI Coach</span>
            </aside>
            <div className="dashArea">
              <div className="row topCards">
                <article><small>Net Worth</small><strong>$1,284,632</strong><em>+12.7%</em></article>
                <article><small>Cash Flow</small><strong>$8,642</strong><em>+8.3%</em></article>
                <article><small>Credit Score</small><strong>742</strong><em>+14 pts</em></article>
              </div>
              <div className="row">
                <article className="chartCard">
                  <h4>Spending Chart</h4>
                  <div className="chartLine" />
                </article>
                <article className="aiCard">
                  <h4>AI Insight</h4>
                  <p>Dining is 23% higher this month. Set a $300 cap and move $125 into savings.</p>
                </article>
              </div>
              <article className="billsCard">
                <h4>Upcoming Bills</h4>
                <div><span>Mortgage</span><span>$2,450</span></div>
                <div><span>Car Insurance</span><span>$156</span></div>
                <div><span>Netflix</span><span>$15.99</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="trustBar">
          {trustBadges.map((item) => <span key={item}>{item}</span>)}
        </section>

        <section className="sectionCard">
          <h2>Most people use 5 different apps to manage money.</h2>
          <p className="sectionLead">WealthPilot brings budgeting, bills, credit, investing, goals, and AI coaching into one clean command center.</p>
          <div className="grid three">
            {problemCards.map((card) => (
              <article key={card.title} className="glass">
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="sectionCard">
          <h2>Everything you need to run your financial life</h2>
          <div className="grid four">
            {features.map((feature) => (
              <article key={feature.title} className="featureCard">
                <div className="icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard aiCoach">
          <div>
            <h2>Meet your personal AI money strategist.</h2>
            <Link href="/dashboard" className="solid">Ask WealthPilot AI</Link>
          </div>
          <div className="chatBox glass">
            <p><strong>User:</strong> “Where am I overspending?”</p>
            <p><strong>AI:</strong> “Dining is 23% higher this month. Set a $300 cap and move $125 into savings.”</p>
          </div>
        </section>

        <section className="sectionCard">
          <h2>Command-center dashboard preview</h2>
          <div className="grid previewGrid">
            {['Net Worth', 'Cash Flow', 'Savings Rate', 'Credit Score', 'Upcoming Bills', 'Financial Goals', 'AI Insights', 'Market Overview'].map((label) => (
              <article key={label} className="glass previewCard"><h3>{label}</h3></article>
            ))}
          </div>
        </section>

        <section id="pricing" className="sectionCard">
          <h2>Simple, transparent pricing</h2>
          <div className="grid three">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`priceCard ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="pill">Most Popular</span>}
                <h3>{plan.name}</h3>
                <p className="price">{plan.price}</p>
                <ul>
                  {plan.perks.map((perk) => <li key={perk}>{perk}</li>)}
                </ul>
                <Link href="/dashboard" className="ghost">Start Free</Link>
              </article>
            ))}
          </div>
        </section>

        <section id="security" className="sectionCard">
          <h2>Built with privacy and security in mind.</h2>
          <ul className="securityList">
            <li>Your bank credentials are never stored</li>
            <li>Plaid uses secure read-only access</li>
            <li>Financial data stays private</li>
            <li>AI insights are educational only</li>
            <li>You control your connected accounts</li>
          </ul>
        </section>

        <section id="faq" className="sectionCard">
          <h2>Frequently asked questions</h2>
          <div className="faqList">
            {faqs.map((item) => (
              <details key={item.q} className="glass">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="shell footer">
        <div>
          <h3>WealthPilot OS</h3>
          <p>Your premium AI finance command center.</p>
        </div>
        <div className="footerLinks">
          {['/dashboard', '/privacy', '/terms', '/disclaimer', '/contact', '/delete-account'].map((link) => (
            <Link key={link} href={link}>{link}</Link>
          ))}
        </div>
      </footer>

      <style jsx>{`
        .landing{position:relative;overflow:hidden;min-height:100vh;padding-bottom:2rem;background:#040712;color:#e9efff;font-family:Inter,system-ui,sans-serif}
        .shell{width:min(1200px,92%);margin:0 auto;position:relative;z-index:2}
        .bgGlow{position:absolute;filter:blur(75px);opacity:.33;pointer-events:none}
        .bgGlow.one{background:#6a34ff;width:420px;height:420px;top:-120px;left:-100px;animation:pulse 8s ease-in-out infinite}
        .bgGlow.two{background:#00c9a7;width:330px;height:330px;right:-90px;top:300px;animation:pulse 10s ease-in-out infinite}
        @keyframes pulse{50%{transform:translateY(20px) scale(1.05);opacity:.55}}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 0}
        .brand{font-weight:800;font-size:1.4rem}.brand span{color:#8b5dff}
        nav{display:flex;gap:1.5rem} nav a{color:#c5d2ff;text-decoration:none}
        .actions,.heroCtas{display:flex;gap:.75rem}.solid,.ghost{padding:.72rem 1.1rem;border-radius:12px;font-weight:700;text-decoration:none;border:1px solid transparent}
        .solid{background:linear-gradient(100deg,#7f52ff,#4657ff);color:#fff}.ghost{color:#dce6ff;border-color:#4a5a8b;background:rgba(84,101,165,.15)}
        .sectionCard{border:1px solid rgba(132,151,255,.23);border-radius:20px;background:rgba(7,12,30,.74);backdrop-filter:blur(10px);padding:1.6rem;margin-top:1rem}
        .hero{display:grid;grid-template-columns:1fr 1.35fr;gap:1rem}
        .kicker{color:#80f8cb;font-weight:600}.heroCopy h1{font-size:clamp(2rem,4vw,3.4rem);line-height:1.1;margin:.5rem 0 1rem}.heroCopy p{color:#bdcbf3;line-height:1.6}
        .heroVisual{border-radius:16px;border:1px solid rgba(137,153,255,.25);background:linear-gradient(130deg,#0d1333,#090d21);padding:.9rem;display:grid;grid-template-columns:120px 1fr;gap:.75rem;box-shadow:0 0 0 1px rgba(140,100,255,.15),0 24px 40px rgba(26,18,66,.6)}
        .floaty{animation:float 5s ease-in-out infinite}@keyframes float{50%{transform:translateY(-6px)}}
        .miniSidebar{border-radius:12px;background:#090f27;padding:.6rem;display:flex;flex-direction:column;gap:.4rem}.miniSidebar span{font-size:.78rem;color:#9db0e6}.miniBrand{font-weight:700;color:#8f6bff}
        .dashArea{display:grid;gap:.6rem}.row{display:grid;gap:.6rem;grid-template-columns:repeat(2,minmax(0,1fr))}.topCards{grid-template-columns:repeat(3,minmax(0,1fr))}
        .topCards article,.chartCard,.aiCard,.billsCard{border:1px solid rgba(130,147,255,.2);background:rgba(13,19,43,.85);border-radius:12px;padding:.72rem}.topCards small{display:block;color:#98b0eb}.topCards strong{display:block;margin:.3rem 0}.topCards em{color:#58e48b;font-style:normal;font-size:.82rem}
        .chartLine{height:70px;border-radius:10px;background:linear-gradient(180deg,rgba(165,95,255,.35),rgba(95,202,255,.08));position:relative;overflow:hidden}.chartLine:before{content:'';position:absolute;inset:auto 0 0;height:2px;background:linear-gradient(90deg,#8f5cff,#43e0b7);animation:scan 3s linear infinite}@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .billsCard div{display:flex;justify-content:space-between;color:#bed0f7;padding:.22rem 0}
        .trustBar{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.6rem;margin-top:1rem}.trustBar span{border:1px solid rgba(134,152,255,.2);background:rgba(8,14,35,.76);padding:.7rem;border-radius:12px;text-align:center;font-size:.9rem;color:#b7c8f6}
        h2{font-size:clamp(1.6rem,2.8vw,2.5rem);margin:0 0 .75rem}.sectionLead{color:#b7c8ef;margin-top:0}
        .grid{display:grid;gap:.8rem}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.four{grid-template-columns:repeat(4,minmax(0,1fr))}
        .glass{border:1px solid rgba(130,149,255,.2);background:rgba(14,22,50,.74);border-radius:14px;padding:1rem}
        .featureCard{border:1px solid rgba(130,149,255,.2);background:rgba(10,18,43,.8);border-radius:14px;padding:1rem;transition:.25s}.featureCard:hover{box-shadow:0 0 0 1px rgba(104,170,255,.5),0 14px 24px rgba(44,90,205,.28);transform:translateY(-3px)}
        .icon{font-size:1.2rem;color:#8fb4ff}
        .aiCoach{display:grid;grid-template-columns:1fr 1.2fr;gap:1rem;align-items:center}.chatBox p{margin:.5rem 0;color:#c9d7fb}
        .previewGrid{grid-template-columns:repeat(4,minmax(0,1fr))}.previewCard{min-height:92px;display:flex;align-items:flex-end}
        .priceCard{position:relative;border:1px solid rgba(130,149,255,.2);background:rgba(11,19,45,.85);border-radius:14px;padding:1rem}.popular{box-shadow:0 0 0 1px rgba(153,102,255,.5),0 18px 28px rgba(98,54,199,.3)}
        .pill{position:absolute;right:1rem;top:-.55rem;background:#7f53ff;color:#fff;font-size:.74rem;padding:.2rem .55rem;border-radius:999px}.price{font-size:2rem;margin:.4rem 0}
        ul{margin:.3rem 0 1rem;padding-left:1.1rem} li{margin:.24rem 0;color:#c2d1f7}
        .securityList{columns:2}.faqList{display:grid;gap:.7rem} summary{cursor:pointer;font-weight:700} details p{color:#bfd0f5}
        .footer{margin-top:1rem;padding:1.4rem 0 2rem;display:flex;justify-content:space-between;gap:1rem;border-top:1px solid rgba(136,153,255,.2)}
        .footerLinks{display:flex;flex-wrap:wrap;gap:.8rem}.footer a{color:#c2d2ff;text-decoration:none}
        @media (max-width:1024px){.hero,.aiCoach{grid-template-columns:1fr}.trustBar{grid-template-columns:repeat(3,minmax(0,1fr))}.four,.previewGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (max-width:720px){nav{display:none}.actions{display:none}.topCards,.row,.three,.trustBar,.four,.previewGrid{grid-template-columns:1fr}.heroVisual{grid-template-columns:1fr}.securityList{columns:1}.footer{flex-direction:column}}
      `}</style>
    </div>
  )
}

export default Home
