import type { NextPage } from 'next'
import Link from 'next/link'

const DisclaimerPage: NextPage = () => (
  <main style={{ minHeight: '100vh', background: '#0a0b0e', color: '#f0f2f7', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Disclaimer</h1>
      <blockquote style={{ borderLeft: '3px solid #4f8ef7', margin: '0 0 20px 0', padding: '10px 14px', color: '#c8cfdd', background: '#111318' }}>
        WealthPilot provides educational financial insights and budgeting tools. It is not a bank, investment advisor, credit repair company, tax advisor, legal advisor, or financial advisor.
      </blockquote>
      <ul style={{ display: 'grid', gap: 10, paddingLeft: 20 }}>
        <li><strong>Not investment advice:</strong> Content should not be treated as investment recommendations.</li>
        <li><strong>Not credit repair advice:</strong> WealthPilot does not provide credit repair services.</li>
        <li><strong>No guarantee of results:</strong> Financial outcomes depend on personal circumstances and external factors.</li>
        <li><strong>Consult professionals:</strong> Seek licensed professionals for investment, tax, legal, and financial planning decisions.</li>
      </ul>
      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: '#4f8ef7' }}>← Back to WealthPilot</Link>
      </div>
    </div>
  </main>
)

export default DisclaimerPage
