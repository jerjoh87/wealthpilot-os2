import type { NextPage } from 'next'
import Link from 'next/link'

const sectionStyle = {
  background: '#111318',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  padding: 20,
  marginBottom: 14,
} as const

const PrivacyPage: NextPage = () => {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0b0e', color: '#f0f2f7', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>Privacy Policy</h1>
        <p style={{ color: '#8892a4', marginBottom: 24 }}>Effective date: May 11, 2026</p>

        <section style={sectionStyle}>
          <h2>What data WealthPilot collects</h2>
          <p>WealthPilot may collect account profile data, transaction metadata, budgeting preferences, subscription details, and support messages submitted by you.</p>
        </section>

        <section style={sectionStyle}>
          <h2>Bank connection data</h2>
          <p>When you connect a financial institution, WealthPilot receives account and transaction data needed to power dashboards, budget insights, and financial summaries.</p>
        </section>

        <section style={sectionStyle}>
          <h2>Plaid read-only access</h2>
          <p>Bank connectivity is provided through Plaid with read-only access. WealthPilot does not request credentials that allow direct money movement from your connected institutions.</p>
        </section>

        <section style={sectionStyle}>
          <h2>AI usage</h2>
          <p>WealthPilot AI features analyze financial inputs you provide to generate educational insights, reminders, and suggestions. AI output can be incomplete and should be reviewed before acting.</p>
        </section>

        <section style={sectionStyle}>
          <h2>Data storage and security</h2>
          <p>Data is stored using cloud services with access controls and encryption safeguards. Access is limited to authorized systems and personnel supporting product operations.</p>
        </section>

        <section style={sectionStyle}>
          <h2>User rights</h2>
          <p>You may request access, correction, export, or deletion of your data by contacting support.</p>
          <p>Privacy contact: <strong>privacy@wealthpilot.example</strong></p>
        </section>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: '#4f8ef7' }}>← Back to WealthPilot</Link>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPage
