import type { NextPage } from 'next'
import Link from 'next/link'

const DeleteAccountPage: NextPage = () => (
  <main style={{ minHeight: '100vh', background: '#0a0b0e', color: '#f0f2f7', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Delete Account</h1>
      <p>Deleting your account removes your WealthPilot profile and associated product data, subject to legal and operational retention requirements.</p>
      <p>Before deletion, disconnect any linked Plaid items to stop future account synchronization.</p>
      <h3>How to request deletion</h3>
      <ol style={{ paddingLeft: 20 }}>
        <li>Email <strong>support@wealthpilot.example</strong> from your account email with subject “Delete Account Request”.</li>
        <li>Include your full name and confirmation that you want all eligible data deleted.</li>
        <li>Our support team will verify your identity and process the request.</li>
      </ol>
      <button style={{ marginTop: 8, background: '#f43f5e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
        Request Account Deletion (Placeholder)
      </button>
      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: '#4f8ef7' }}>← Back to WealthPilot</Link>
      </div>
    </div>
  </main>
)

export default DeleteAccountPage
