// pages/dashboard.tsx

import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const WealthPilotOS = dynamic(
  () => import('../wealthpilot-os'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0b0e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8892a4',
          fontFamily: 'sans-serif',
          fontSize: 14,
        }}
      >
        Loading WealthPilot OS…
      </div>
    ),
  }
)

const Dashboard: NextPage = () => (
  <>
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        background: 'red',
        color: 'white',
        padding: '14px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 900,
        letterSpacing: '1px',
      }}
    >
      DEPLOY TEST — DASHBOARD FILE UPDATED — 2026-05-11-4
    </div>

    <WealthPilotOS />
  </>
)

export default Dashboard
