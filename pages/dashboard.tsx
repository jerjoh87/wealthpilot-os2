import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const WealthPilotOS = dynamic(() => import('../wealthpilot-os'), {
  ssr: false,
  loading: () => (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0b0e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8892a4',
        fontFamily: 'DM Sans, system-ui, -apple-system, sans-serif',
        fontSize: 14,
      }}
    >
      Loading WealthPilot OS…
    </main>
  ),
})

const Dashboard: NextPage = () => <WealthPilotOS />

export default Dashboard
