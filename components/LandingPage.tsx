import type { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const trustBadges = ['Bank-grade security', '256-bit encryption', 'Read-only sync', 'SOC-ready posture', 'Private beta', 'AI assisted']
const painPoints = ['No clear monthly plan', 'Bills slipping through', 'Debt progress feels slow', 'Unclear credit impact', 'Scattered account data', 'No actionable AI guidance']
const features = ['Unified dashboard', 'Smart budgeting', 'Bill reminders', 'Debt planner', 'Credit scanner', 'AI coach', 'Weekly reports', 'Goal tracking']
const steps = ['Connect or add accounts', 'Set monthly budgets', 'Track bills and due dates', 'Scan credit report', 'Follow AI action plan']
const faqs = [
  ['Is this live?', 'We are currently in private beta with staged feature rollout.'],
  ['Is my data secure?', 'Yes, we use encrypted transport and keep sensitive processing server-side.'],
  ['Do I need bank sync?', 'No, manual mode works if you do not connect accounts.'],
  ['Can I cancel?', 'Yes. You can leave beta access at any time.'],
]

const Counter = ({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) => {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const duration = 1200
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(Math.round(to * p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{prefix}{value.toLocaleString()}{suffix}</>
}

const LandingPage: NextPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal'))
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.14 })
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <div className="lp">
      <header className="nav reveal">
        <strong>WealthPilot</strong>
        <nav><a href="#features">Features</a><a href="#scanner">Scanner</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
        <label htmlFor="mnav" className="hamb">☰</label><input id="mnav" type="checkbox" hidden />
      </header>

      <section className="hero reveal">
        <h1>Luxury Financial Control <span>for Real Life</span></h1>
        <p>Track money, optimize debt, and monitor credit with AI-assisted insights in one command center.</p>
        <div className="cta"><Link href="/dashboard" className="btn pri">Join Private Beta</Link><Link href="/dashboard" className="btn">View Demo</Link></div>
        <small>Trusted by beta users across budgeting, credit, and cash-flow planning.</small>
      </section>

      <section className="dash reveal">
        <div className="cards">
          <article><b><Counter to={12480} prefix="$" /></b><span>Total Cash</span></article>
          <article><b><Counter to={742} /></b><span>Credit Score</span></article>
          <article><b><Counter to={28} suffix="%" /></b><span>Utilization</span></article>
        </div>
        <div className="bars"><i style={{ width: '78%' }} /><i style={{ width: '62%' }} /><i style={{ width: '91%' }} /></div>
        <div className="insight">AI Insight: Reduce card A by $320 to move utilization under 25%.</div>
      </section>

      <section className="badges reveal">{trustBadges.map((b) => <span key={b}>{b}</span>)}</section>

      <section className="grid reveal"><h2>Problems We Solve</h2><div>{painPoints.map((p) => <article key={p}>{p}</article>)}</div></section>
      <section id="features" className="grid reveal"><h2>Core Features</h2><div>{features.map((f) => <article key={f}>{f}</article>)}</div></section>

      <section className="steps reveal"><h2>How It Works</h2><ol>{steps.map((s) => <li key={s}>{s}</li>)}</ol></section>

      <section id="scanner" className="scanner reveal">
        <div><h2>AI Credit Scanner</h2><p>Upload a credit report PDF, review extracted data, then save to dashboard.</p></div>
        <aside><div>Drop PDF here</div><button>Upload Credit Report</button><small>Your credit report contains sensitive personal information. Upload only your own report or a report you are authorized to use.</small></aside>
      </section>

      <section className="beta reveal"><h3>Private Beta Status</h3><div><span>Core Dashboard: Live</span><span>AI Scanner: Rolling Out</span><span>Bank Sync: Limited</span></div></section>

      <section id="pricing" className="pricing reveal">
        <article className="hot"><h4>Free Beta</h4><p>$0</p></article><article><h4>Pro</h4><p>$9.99</p></article><article><h4>Premium</h4><p>$19.99</p></article>
      </section>

      <section id="faq" className="faq reveal">
        <h2>FAQ</h2>
        {faqs.map(([q, a], i) => <div key={q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)}>{q}</button><p className={openFaq === i ? 'open' : ''}>{a}</p></div>)}
      </section>

      <section className="final reveal"><h2>Ready to Join WealthPilot Private Beta?</h2><Link href="/dashboard" className="btn pri">Request Access</Link></section>
      <footer className="reveal">© {year} WealthPilot · Not financial advice. For educational purposes only.</footer>

      <style jsx>{`
        .lp{background:radial-gradient(circle at 15% 0,#101833,#070a14 45%,#05070e);color:#f8fafc;min-height:100vh;padding:20px;display:grid;gap:18px;font-family:Inter,system-ui}
        .reveal{opacity:0;transform:translateY(18px);transition:.6s ease}.reveal.in{opacity:1;transform:none}
        .nav{position:sticky;top:10px;z-index:30;display:flex;justify-content:space-between;align-items:center;background:#0b1120cc;border:1px solid #23314f;border-radius:16px;padding:12px 16px}
        nav{display:flex;gap:16px}nav a{color:#cbd5e1;text-decoration:none}.hamb{display:none}
        section,footer{max-width:1200px;width:100%;margin:0 auto}
        .hero,.dash,.grid,.steps,.scanner,.beta,.pricing,.faq,.final,.badges{background:#0b1222;border:1px solid #1f2b45;border-radius:18px;padding:24px}
        .hero h1{font-size:clamp(2rem,5vw,4rem);margin:0}.hero h1 span{background:linear-gradient(90deg,#8b5cf6,#22c55e,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .cta{display:flex;gap:10px;margin:14px 0}.btn{padding:10px 14px;border-radius:12px;border:1px solid #334155;color:white;text-decoration:none}.pri{background:linear-gradient(135deg,#7c3aed,#3b82f6)}
        .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.cards article{background:#10192f;border-radius:12px;padding:12px}.cards b{font-size:1.4rem}
        .bars i{display:block;height:9px;border-radius:99px;background:linear-gradient(90deg,#8b5cf6,#22c55e);margin-top:10px}
        .insight{margin-top:12px;padding:10px;border-radius:10px;background:#13213d;color:#c7d2fe}
        .badges{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.badges span{background:#121a2d;border-radius:999px;padding:8px 10px;text-align:center}
        .grid>div{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.grid article{background:#121a2d;padding:14px;border-radius:12px}
        .steps ol{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:0;list-style:none}.steps li{background:#121a2d;padding:12px;border-radius:12px}
        .scanner{display:grid;grid-template-columns:1fr 1fr;gap:14px}.scanner aside{background:#121a2d;padding:14px;border-radius:12px;display:grid;gap:10px}
        .scanner button{padding:10px;border-radius:10px;background:#2563eb;border:none;color:#fff}
        .beta div{display:flex;gap:8px;flex-wrap:wrap}.beta span{background:#0f1a30;border:1px solid #24344f;padding:8px 10px;border-radius:999px}
        .pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.pricing article{background:#121a2d;padding:16px;border-radius:12px}.hot{outline:2px solid #22c55e}
        .faq div{border-top:1px solid #24344f}.faq button{width:100%;text-align:left;background:none;border:none;color:#fff;padding:12px 0}.faq p{max-height:0;overflow:hidden;transition:max-height .3s ease;color:#cbd5e1}.faq p.open{max-height:90px}
        .final{display:flex;justify-content:space-between;align-items:center}
        footer{color:#94a3b8;padding:10px 2px 30px}
        @media (max-width:900px){.cards,.grid>div,.steps ol,.pricing,.scanner,.badges{grid-template-columns:1fr 1fr}.final{flex-direction:column;align-items:flex-start;gap:10px}}
        @media (max-width:640px){nav{display:none}.hamb{display:block}.cards,.grid>div,.steps ol,.pricing,.scanner,.badges{grid-template-columns:1fr}}
      `}</style>
    </div>
  )
}

export default LandingPage
