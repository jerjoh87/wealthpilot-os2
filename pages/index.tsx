// pages/index.tsx
// Entry point — renders the WealthPilot OS single-page app.
//
// SETUP: copy wealthpilot-os.jsx into this project root, then:
//   import WealthPilotOS from '../wealthpilot-os'
//
// OR move all components into src/ and import from there.
// The redirect below is a safe fallback until the component is wired.

import type { NextPage, GetServerSideProps } from 'next'

// ── Option A: direct component import (uncomment when wealthpilot-os.jsx is in project root)
// import dynamic from 'next/dynamic'
// const WealthPilotOS = dynamic(() => import('../wealthpilot-os'), { ssr: false })
// const Home: NextPage = () => <WealthPilotOS />

// ── Option B: redirect to /dashboard (use if you split into separate pages)
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/dashboard', permanent: false },
})

const Home: NextPage = () => null
export default Home
