import type { NextPage } from 'next'
import Link from 'next/link'

const TermsPage: NextPage = () => (
  <main style={{ minHeight: '100vh', background: '#0a0b0e', color: '#f0f2f7', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>Terms of Use</h1>
      <p style={{ color: '#8892a4', marginBottom: 24 }}>Effective date: May 11, 2026</p>
      <ul style={{ display: 'grid', gap: 12, paddingLeft: 20 }}>
        <li><strong>User responsibilities:</strong> Keep account credentials secure and provide accurate information.</li>
        <li><strong>Subscription terms:</strong> Paid plans renew automatically until canceled.</li>
        <li><strong>Acceptable use:</strong> Do not misuse, disrupt, reverse engineer, or abuse the platform.</li>
        <li><strong>No guarantees:</strong> Results, insights, or forecasts may vary and are not guaranteed.</li>
        <li><strong>Limitation of liability:</strong> WealthPilot is not liable for indirect, incidental, or consequential losses to the maximum extent allowed by law.</li>
        <li><strong>Cancellation:</strong> You can cancel subscriptions from settings; access remains through the current billing cycle unless otherwise noted.</li>
        <li><strong>Account termination:</strong> WealthPilot may suspend or terminate accounts for policy violations or security risk.</li>
      </ul>
      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: '#4f8ef7' }}>← Back to WealthPilot</Link>
      </div>
    </div>
  </main>
)

export default TermsPage
