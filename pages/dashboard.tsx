import type { NextPage } from 'next'
import Link from 'next/link'

const cards = [
  {
    title: 'Net Worth',
    value: '$0.00',
    description: 'Connect accounts to calculate your live net worth.',
  },
  {
    title: 'Monthly Cash Flow',
    value: '$0.00',
    description: 'Track income and spending trends in one place.',
  },
  {
    title: 'Upcoming Bills',
    value: '0 due',
    description: 'No upcoming bills detected yet.',
  },
]

const Dashboard: NextPage = () => {
  return (
    <main className="dashboardPage">
      <section className="hero">
        <div>
          <p className="eyebrow">WealthPilot Dashboard</p>
          <h1>Welcome back</h1>
          <p className="subtitle">
            The dashboard is now running in stable mode while we continue improving advanced analytics.
          </p>
        </div>
        <div className="ctaRow">
          <Link href="/" className="btn ghost">
            Home
          </Link>
          <Link href="/contact" className="btn solid">
            Request account sync
          </Link>
        </div>
      </section>

      <section className="cardGrid" aria-label="Financial summary">
        {cards.map((card) => (
          <article key={card.title} className="card">
            <h2>{card.title}</h2>
            <p className="value">{card.value}</p>
            <p className="description">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="statusPanel" aria-label="Status">
        <h2>System status</h2>
        <p>
          Core dashboard panels are available. If your data is missing, reconnect providers or contact support.
        </p>
      </section>

      <style jsx>{`
        .dashboardPage {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 0%, #1d2435 0%, #0a0b0e 45%);
          color: #f0f2f7;
          padding: 32px 20px 60px;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }

        .hero,
        .cardGrid,
        .statusPanel {
          width: min(1040px, 100%);
          margin: 0 auto;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #97a2b8;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 42px);
        }

        .subtitle {
          margin: 12px 0 0;
          max-width: 640px;
          color: #b8c2d8;
          line-height: 1.5;
        }

        .ctaRow {
          display: flex;
          gap: 10px;
        }

        .btn {
          text-decoration: none;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 700;
          border: 1px solid transparent;
        }

        .btn.solid {
          color: #0d1117;
          background: #7bc4ff;
        }

        .btn.ghost {
          color: #dce6ff;
          border-color: #5f6e8b;
        }

        .cardGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .card,
        .statusPanel {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          background: rgba(17, 19, 24, 0.8);
          padding: 18px;
          backdrop-filter: blur(4px);
        }

        .card h2,
        .statusPanel h2 {
          margin: 0;
          font-size: 15px;
          color: #9bb3dc;
          font-weight: 600;
        }

        .value {
          margin: 8px 0;
          font-size: 30px;
          font-weight: 700;
        }

        .description {
          margin: 0;
          color: #b2bed8;
          line-height: 1.45;
        }

        .statusPanel p {
          margin: 10px 0 0;
          color: #bac5dc;
        }
      `}</style>
    </main>
  )
}

export default Dashboard
