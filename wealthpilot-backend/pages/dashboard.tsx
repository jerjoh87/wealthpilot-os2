// @ts-nocheck
// pages/dashboard.tsx
// Renders the full WealthPilot OS app at /dashboard.
// Uses dynamic import with ssr:false because the app uses browser APIs
// (localStorage for auth token, window.Plaid, etc.)

import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const WealthPilotOS = dynamic(
  () => import('../wealthpilot-os'),   // place wealthpilot-os.jsx in project root
  {
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: '100vh',
        background: '#0a0b0e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8892a4',
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}>
        Loading WealthPilot OS…
      </div>
    ),
  }
)

const Dashboard: NextPage = () => <WealthPilotOS />
export default Dashboard
