import type { NextPage } from 'next'
import Link from 'next/link'

const Dashboard: NextPage = () => {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0b0e',
        color: '#f0f2f7',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 640,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          background: '#111318',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>Dashboard temporarily disabled</h1>
        <p style={{ margin: '12px 0 20px', color: '#a0abc1', fontSize: 15, lineHeight: 1.5 }}>
          We found stability issues in the previous dashboard experience, so it has been turned off for now to prevent crashes.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: '#ffffff',
            background: '#4f8ef7',
            padding: '10px 14px',
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Back to home
        </Link>
      </section>
    </main>
  )
}

export default Dashboard
