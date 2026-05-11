# WEALTHPILOT — Luxury AI Financial OS Design System + UI Blueprint

## Unified Visual Identity
- Brand: premium, data-dense, AI-native, dark glass fintech OS.
- Tagline: **Your Financial Command Center**.
- Experience pillars: command clarity, premium depth, intelligent automation, cross-device consistency.

## Design Tokens
### Colors
- `bg.base` `#050816`
- `bg.elevated` `#0B1224`
- `bg.glass` `rgba(11,18,36,0.62)`
- `text.primary` `#F8FAFC`
- `text.secondary` `#CBD5E1`
- `accent.neonPurple` `#8B5CF6`
- `accent.electricBlue` `#38BDF8`
- `accent.emerald` `#10B981`
- `accent.orangeAlert` `#FB923C`
- glow borders: blue/purple transparent overlays

### Typography (SF Pro Display / Inter)
- Display XL: 48/56 700
- H1: 32/40 700
- H2: 24/32 650
- H3: 20/28 600
- Body: 14/20 500
- Caption: 12/16 500
- Metric: 34/40 700, -0.02em

### Spacing + Radius + Shadows
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Radius: 10, 14, 18, 24, pill
- Shadows: glass depth + neon blue/purple glow

## Desktop Dashboard Mockup
### Global shell
- Left sidebar (264px): Dashboard, Accounts, Transactions, Budgets, Investments, Bills & Calendar, Goals, Reports, AI Advisor, Alerts, Settings
- Top nav (72px): global search, notifications, sync status, add button, profile avatar

### Main dashboard
**Row 1: KPI cards (5)**
- Net Worth, Monthly Cash Flow, Investments, Savings Rate, Credit Score
- Each card: sparkline, % delta, glow border, hover-lift animation

**Row 2**
1. Net Worth chart
2. Asset Allocation donut
3. Cash Flow summary

**Row 3**
1. Upcoming Bills
2. Recent Transactions
3. AI Financial Insights
4. Financial Goals

**Row 4**
1. Investment Performance
2. Spending Categories
3. Market Overview

**Sidebar lower panel**
- Financial Health Score ring
- Upgrade to Pro glass card

## Mobile App Mockup
### Bottom nav
- Dashboard, Accounts, Transactions, AI Advisor, Settings

### Mobile dashboard blocks
- Swipeable financial cards
- Mobile net worth + cash flow charts
- Quick actions row
- AI assistant widget
- Recent transactions list
- Spending insights card
- Voice assistant floating action button

### Mobile UX
- Thumb-zone optimized controls (44px+ targets)
- One-handed flows
- Swipe gestures between card groups
- Expandable cards and bottom sheets
- Pull-to-refresh with sync pulse
- Floating bottom nav with blur backdrop

## AI Feature UX
- AI financial coach panel with proactive recommendations
- Voice assistant with waveform + transcript
- Predictive budgeting forecast + confidence band
- Bill reminders with urgency states
- Investment recommendations with risk labels
- Smart alerts and anomaly detection
- Safe-to-spend calculator with editable assumptions
- Conversational finance UI with action chips

## Component Hierarchy
- AppShell
  - Sidebar
  - TopNav
  - DashboardPage
    - MetricsRow → MetricCard x5
    - AnalyticsRow → NetWorthChart, AllocationDonut, CashFlowSummary
    - OperationsRow → BillsPanel, TransactionsPanel, AIInsightsPanel, GoalsPanel
    - MarketsRow → InvestmentPerformance, SpendingCategories, MarketOverview

## Responsive Layout System
- Breakpoints: xs 360+, sm 480+, md 768+, lg 1024+, xl 1440+
- Desktop (`lg+`): full grid + sidebar
- Tablet (`md`): icon rail + reduced columns
- Mobile (`sm/xs`): stacked cards + bottom nav + condensed charts

## Animation System
- Motion style: smooth, restrained, premium
- Card hover: y:-4, scale 1.01, 180ms
- Panel transitions: fade + slide 220ms
- Data updates: number tween + color pulse
- AI interactions: glow pulse + typing microstates
- Respect reduced-motion preference

## Reusable Component Architecture
- `GlassCard` (default/intense/alert)
- `MetricCard` (label/value/delta/sparkline)
- `ChartCard` (shared axis + tooltip theme)
- `InsightChip` (priority/confidence)
- `FinanceListItem` (transaction/bill/holding variants)
- `CommandPalette` (AI quick actions)

## Suggested Folder Structure
```txt
src/
  design-system/
    tokens/
      colors.ts
      typography.ts
      spacing.ts
      shadows.ts
      motion.ts
    primitives/
      GlassCard.tsx
      GlowBadge.tsx
      MetricValue.tsx
      Icon.tsx
  features/
    dashboard/
      components/
      charts/
      hooks/
    accounts/
    transactions/
    ai-advisor/
  app/
    web/
      AppShell.tsx
      routes/
    mobile/
      navigation/
      screens/
      components/
```

## Premium UI Improvements
- Neon edge tracing on focus
- Advanced glass depth layers
- AI command palette (⌘K)
- Contextual next-best-action prompts
- Market sentiment strip and risk heatmap
- Accessibility pass for contrast and motion reduction

## Stack Implementation Targets
- **Web:** React + TailwindCSS + Framer Motion + Recharts
- **Mobile:** React Native Expo + NativeWind + Reanimated + React Navigation

This blueprint keeps desktop and mobile as one coherent luxury AI-fintech operating system.
