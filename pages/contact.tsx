import type { NextPage } from 'next'
import Link from 'next/link'

const ContactPage: NextPage = () => (
  <main style={{ minHeight: '100vh', background: '#0a0b0e', color: '#f0f2f7', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Contact Support</h1>
      <p style={{ marginBottom: 10 }}>Support email: <strong>support@wealthpilot.example</strong></p>
      <p style={{ marginBottom: 20, color: '#8892a4' }}>Typical response time: <strong>1–2 business days</strong>.</p>

      <section style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Support form (placeholder)</h2>
        <p style={{ color: '#8892a4' }}>Submit your account email, issue summary, and steps to reproduce.</p>
        <button style={{ background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>Open Support Form (Coming Soon)</button>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Bug reports</h3>
        <p>For bugs, include device/browser details, screenshots, and timestamps so our team can diagnose faster.</p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: '#4f8ef7' }}>← Back to WealthPilot</Link>
      </div>
    </div>
  </main>
)

export default ContactPage
