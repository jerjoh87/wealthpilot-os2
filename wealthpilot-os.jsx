import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase";

// ── API CLIENT ────────────────────────────────────────────────────────────────
// LIVE: uncomment the import below and remove the stub block beneath it.
// Place api-client.js in the same directory as this file before enabling.
//
import { auth as authApi, bills as billsApi, calendarEvents as calApi, ai as aiApi, transactions as txApi, budgets as budgetsApi, portfolio as portfolioApi, creditScore as creditScoreApi, plaid as plaidApi } from './api-client';
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK = {
  user: { name: "WealthPilot User", email: "", plan: "Pro" },
  accounts: [
    { id: 1, name: "Checking Account", type: "checking", balance: 8420.55, institution: "Chase", last4: "4821", connected: true },
    { id: 2, name: "Savings Account", type: "savings", balance: 22100.00, institution: "Chase", last4: "9932", connected: true },
    { id: 3, name: "Credit Card", type: "credit", balance: -1240.80, institution: "Apple", last4: "3301", connected: true },
  ],
  income: 7200,
  spending: 4318.42,
  // Manual asset classes — connect integrations populate these
  crypto: {
    connected: false,
    totalValue: 3240.00,
    dayChangePct: +2.4,
    holdings: [
      { symbol:"BTC", name:"Bitcoin",  value:2100, qty:0.031, change:+3.1 },
      { symbol:"ETH", name:"Ethereum", value:840,  qty:0.42,  change:+1.2 },
      { symbol:"SOL", name:"Solana",   value:300,  qty:2.1,   change:-0.8 },
    ]
  },
  realEstate: {
    connected: false,
    properties: [
      { name:"Primary Residence", estimatedValue:0, mortgage:0, equity:0, connected:false },
    ]
  },
  studentLoan: 14200,  // total outstanding student debt
  carLoan:     8200,   // outstanding car loan
  bills: [
    { id: 1, name: "Rent", amount: 1850, dueDay: 1, category: "Housing", paid: true, autopay: true },
    { id: 2, name: "Netflix", amount: 15.99, dueDay: 12, category: "Entertainment", paid: false, autopay: true },
    { id: 3, name: "Spotify", amount: 9.99, dueDay: 14, category: "Entertainment", paid: false, autopay: true },
    { id: 4, name: "Electric Bill", amount: 112, dueDay: 18, category: "Utilities", paid: false, autopay: false },
    { id: 5, name: "Internet", amount: 79.99, dueDay: 20, category: "Utilities", paid: false, autopay: true },
    { id: 6, name: "Car Insurance", amount: 188, dueDay: 25, category: "Insurance", paid: false, autopay: false },
    { id: 7, name: "Gym", amount: 45, dueDay: 28, category: "Health", paid: false, autopay: true },
  ],
  transactions: [
    { id: 1, name: "Whole Foods Market", amount: -89.43, date: "2026-05-08", category: "Groceries", account: "Checking Account" },
    { id: 2, name: "Direct Deposit - Employer", amount: 3600.00, date: "2026-05-07", category: "Income", account: "Checking Account" },
    { id: 3, name: "Uber Eats", amount: -34.20, date: "2026-05-07", category: "Dining", account: "Credit Card" },
    { id: 4, name: "Shell Gas Station", amount: -58.10, date: "2026-05-06", category: "Transport", account: "Checking Account" },
    { id: 5, name: "Amazon", amount: -127.99, date: "2026-05-05", category: "Shopping", account: "Credit Card" },
    { id: 6, name: "Starbucks", amount: -7.85, date: "2026-05-05", category: "Dining", account: "Credit Card" },
    { id: 7, name: "Target", amount: -62.40, date: "2026-05-04", category: "Shopping", account: "Checking Account" },
    { id: 8, name: "Planet Fitness", amount: -25.00, date: "2026-05-03", category: "Health", account: "Credit Card" },
    { id: 9, name: "Netflix", amount: -15.99, date: "2026-05-02", category: "Entertainment", account: "Credit Card" },
    { id: 10, name: "Chipotle", amount: -13.50, date: "2026-05-02", category: "Dining", account: "Credit Card" },
    { id: 11, name: "CVS Pharmacy", amount: -28.75, date: "2026-05-01", category: "Health", account: "Checking Account" },
    { id: 12, name: "Direct Deposit - Employer", amount: 3600.00, date: "2026-05-01", category: "Income", account: "Checking Account" },
  ],
  budget: [
    { category: "Housing", limit: 1900, spent: 1850, color: "#6366f1" },
    { category: "Groceries", limit: 500, spent: 389, color: "#10b981" },
    { category: "Dining", limit: 300, spent: 247, color: "#f59e0b" },
    { category: "Transport", limit: 250, spent: 198, color: "#3b82f6" },
    { category: "Shopping", limit: 400, spent: 312, color: "#ec4899" },
    { category: "Entertainment", limit: 100, spent: 88, color: "#8b5cf6" },
    { category: "Health", limit: 150, spent: 93, color: "#14b8a6" },
  ],
  portfolio: {
    totalValue: 34820.50,
    dayChange: +412.30,
    dayChangePct: +1.20,
    connected: false,
    holdings: [
      { ticker: "AAPL", name: "Apple Inc.", shares: 10, price: 213.40, value: 2134.00, change: +1.8 },
      { ticker: "TSLA", name: "Tesla Inc.", shares: 5, price: 248.60, value: 1243.00, change: -0.9 },
      { ticker: "NVDA", name: "NVIDIA Corp.", shares: 8, price: 924.30, value: 7394.40, change: +3.2 },
      { ticker: "VTI", name: "Vanguard Total Market", shares: 40, price: 248.10, value: 9924.00, change: +0.6 },
      { ticker: "VOO", name: "Vanguard S&P 500", shares: 30, price: 506.80, value: 15204.00, change: +0.8 },
    ]
  },
  aiMessages: [
    { role: "assistant", content: "Hi Alex! I'm your WealthPilot AI Coach. I've analyzed your finances and have some insights. Your spending on dining is trending 18% above last month — want me to suggest some ways to rebalance? 💡" }
  ]
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n, opts = {}) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, ...opts }).format(n);
const fmtK = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);
const ensureArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.accounts)) return value.accounts;
  if (Array.isArray(value?.items)) return value.items;
  return fallback;
};
const pickCollection = (value, keys = [], fallback = []) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return ensureArray(value, fallback);
};
const today = new Date();
const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();

function safeToSpend() {
  const totalCash = MOCK.accounts.filter(a => a.type !== "credit").reduce((s, a) => s + a.balance, 0);
  const upcomingBills = MOCK.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const avgDaily = MOCK.spending / 30;
  return Math.max(0, totalCash - upcomingBills - avgDaily * daysLeft * 0.5);
}

const CATEGORY_ICONS = {
  Housing: "🏠", Groceries: "🛒", Dining: "🍜", Transport: "🚗",
  Shopping: "🛍️", Entertainment: "🎬", Health: "💊", Income: "💵",
  Utilities: "⚡", Insurance: "🛡️", Default: "💳"
};

const FRIENDLY_ERRORS = {
  auth: "We couldn’t sign you in right now. Please try again.",
  googleAuth: "Google sign-in failed. Please try again.",
  dashboard: "We couldn’t load your dashboard. Please refresh.",
  plaidConnect: "Bank connection failed. Please try again.",
  plaidSync: "We couldn’t sync your accounts. Please try again.",
  bills: "We couldn’t load your bills. Please refresh.",
  calendar: "We couldn’t load your calendar. Please refresh.",
  transactions: "We couldn’t load your transactions. Please refresh.",
  budgets: "We couldn’t load your budgets. Please refresh.",
  ai: "AI Coach is temporarily unavailable.",
  creditScore: "We couldn’t load your credit score. Please try again.",
  portfolio: "We couldn’t load your portfolio. Please refresh.",
  settings: "Settings update failed. Please try again.",
};

const ErrorNotice = ({ message }) => (
  <div style={{fontSize:12,color:"var(--red)",marginBottom:12,padding:"8px 10px",background:"rgba(244,63,94,0.1)",borderRadius:8,border:"1px solid rgba(244,63,94,0.2)"}}>
    {message}
  </div>
);

const EmptyState = ({ icon="📭", message }) => (
  <div className="empty-state"><div className="icon">{icon}</div><p className="text-sm">{message}</p></div>
);

const LoadingCard = ({ message="Loading…" }) => (
  <div className="card"><div className="text-sm text-muted">{message}</div></div>
);


// ─── AUTH HOOK ────────────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser]       = useState(null);   // null = loading, false = logged out
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        localStorage.setItem('wp_token', data.session.access_token);
        try {
          const u = await authApi.me();
          setUser(u || data.session.user || false);
        } catch {
          setUser(data.session.user || false);
        }
        setLoading(false);
        return;
      }

      const token = typeof window !== 'undefined' && localStorage.getItem('wp_token');
      if (!token) { setUser(false); setLoading(false); return; }
      authApi.me()
        .then(u => setUser(u || false))
        .catch(() => setUser(false))
        .finally(() => setLoading(false));
    };

    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data?.session?.access_token) localStorage.setItem('wp_token', data.session.access_token);
    setUser(data?.user || false);
  }, []);

  const signup = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;

    if (data?.session?.access_token) localStorage.setItem('wp_token', data.session.access_token);
    setUser(data?.user || false);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (typeof authApi.logout === "function") await authApi.logout();
    } catch (_) {
      // ignore API logout errors; local token cleanup below is source of truth for now
    } finally {
      localStorage.removeItem('wp_token');
      setUser(false);
    }
  }, []);

  return { user, loading, login, signup, logout };
}

// ─── AUTH GATE ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }) {
  const [mode, setMode]       = useState("login");   // "login" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async () => {
    if (!email || !password) return setError("Email and password required.");
    if (mode === "signup" && !name) return setError("Name required.");
    setError(""); setBusy(true);
    try {
      await onAuth(mode, email, password, name);
    } catch (e) {
      setError(FRIENDLY_ERRORS.auth);
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg)", display:"flex",
      alignItems:"center", justifyContent:"center", padding:20,
      fontFamily:"'DM Sans', sans-serif", color:"var(--text)"
    }}>
      <style>{`
        :root{--bg:#0a0b0e;--bg2:#111318;--bg3:#181c24;--border:rgba(255,255,255,0.07);
        --border2:rgba(255,255,255,0.12);--text:#f0f2f7;--text2:#8892a4;--text3:#525d72;
        --accent:#4f8ef7;--green:#10b981;--red:#f43f5e;--radius:16px;--radius-sm:10px;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg);}
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
      <div style={{
        width:"100%", maxWidth:400,
        background:"var(--bg2)", border:"1px solid var(--border2)",
        borderRadius:20, padding:32,
        boxShadow:"0 8px 40px rgba(0,0,0,0.5)"
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          <div style={{
            width:38,height:38,borderRadius:11,
            background:"linear-gradient(135deg,#4f8ef7,#6366f1)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,
            boxShadow:"0 4px 12px rgba(79,142,247,0.35)"
          }}>W</div>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17}}>
            Wealth<span style={{color:"#4f8ef7"}}>Pilot</span> OS
          </div>
        </div>

        <div style={{fontSize:22,fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:4}}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </div>
        <div style={{fontSize:13,color:"var(--text2)",marginBottom:24}}>
          {mode === "login" ? "Sign in to your account" : "Start managing your finances"}
        </div>

        {mode === "signup" && (
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>Name</label>
            <input value={name} onChange={e=>setName(e.target.value)}
              style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",color:"var(--text)",borderRadius:10,padding:"9px 12px",fontSize:14,outline:"none",fontFamily:"inherit"}}
              placeholder="Your full name" />
          </div>
        )}

        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",color:"var(--text)",borderRadius:10,padding:"9px 12px",fontSize:14,outline:"none",fontFamily:"inherit"}}
            placeholder="you@example.com" onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>

        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>Password</label>
          <input type="password" value={password} onChange={e=>setPass(e.target.value)}
            style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",color:"var(--text)",borderRadius:10,padding:"9px 12px",fontSize:14,outline:"none",fontFamily:"inherit"}}
            placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>

        {error && <div style={{fontSize:13,color:"var(--red)",marginBottom:14,padding:"8px 12px",background:"rgba(244,63,94,0.1)",borderRadius:8}}>{error}</div>}

        <button onClick={submit} disabled={busy} style={{
          width:"100%",padding:"11px",borderRadius:10,border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,#4f8ef7,#6366f1)",color:"#fff",
          fontFamily:"inherit",fontSize:15,fontWeight:700,
          opacity:busy?0.7:1,transition:"opacity .15s"
        }}>
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>



        <button onClick={async () => {
          setError("");
          setBusy(true);
          try {
            const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            }
          });
            if (error) throw error;
          } catch {
            setError(FRIENDLY_ERRORS.googleAuth);
          } finally {
            setBusy(false);
          }
        }} disabled={busy} style={{
          width:"100%",padding:"11px",borderRadius:10,border:"1px solid var(--border2)",cursor:"pointer",
          background:"var(--bg3)",color:"var(--text)",
          fontFamily:"inherit",fontSize:15,fontWeight:600,
          opacity:busy?0.7:1,transition:"opacity .15s",marginTop:10
        }}>
          Continue with Google
        </button>

        <div style={{marginTop:8,fontSize:11,color:"var(--text3)",lineHeight:1.4}}>
          Google OAuth requires Supabase + Google Console redirect URIs to include your project callback URL.
        </div>

        <div style={{textAlign:"center",marginTop:16,fontSize:13,color:"var(--text2)"}}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}}
            onClick={()=>{setMode(m=>m==="login"?"signup":"login");setError("");}}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </div>

        <div style={{marginTop:20,padding:"10px 12px",background:"rgba(79,142,247,0.08)",borderRadius:8,border:"1px solid rgba(79,142,247,0.15)"}}>
          <div style={{fontSize:11,color:"var(--accent)",fontWeight:600,marginBottom:3}}>ℹ DEMO MODE</div>
          <div style={{fontSize:11,color:"var(--text2)"}}>Sign in with a valid account to continue.</div>
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNTS HOOK ────────────────────────────────────────────────────────────
// Single source of truth for connected accounts.
// Starts with MOCK data; call refresh() after Plaid sync to update.
function useAccounts() {
  const [accounts, setAccounts] = useState(MOCK.accounts);
  const [syncing,  setSyncing]  = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const refresh = useCallback(async (liveAccounts = null) => {
    if (liveAccounts) { setAccounts(liveAccounts); setLastSync(new Date()); return; }
    setSyncing(true);
    try {
      // Real: const data = await accountsApi.list(); setAccounts(data);
      await new Promise(r => setTimeout(r, 600)); // demo delay
      setLastSync(new Date());
    } finally { setSyncing(false); }
  }, []);

  const safeAccounts = ensureArray(accounts, MOCK.accounts);
  const totalCash  = safeAccounts.filter(a => a.type !== "credit").reduce((s, a) => s + a.balance, 0);
  const creditDebt = safeAccounts.filter(a => a.type === "credit").reduce((s, a) => s + a.balance, 0);

  return { accounts: safeAccounts, totalCash, creditDebt, syncing, lastSync, refresh };
}

// ─── ALERT ENGINE ─────────────────────────────────────────────────────────────
// Central alert service. Computes alerts from live financial state.
// Severity: info | warning | critical
// Each alert: { id, type, severity, title, body, icon, ts, dismissed }
//
// BACKEND HOOK: POST /api/alerts/dismiss { alertId }
//               GET  /api/alerts         (fetch persisted + push-delivered alerts)
// PUSH HOOK:    Subscribe to Supabase realtime channel 'alerts:{userId}'
//               or use web-push when service worker is registered.

function buildAlerts({ accounts, bills, budget, transactions, portfolio, goals, mode }) {
  const safeAccounts = ensureArray(accounts, []);
  const safeBills = ensureArray(bills, []);
  const safeBudget = ensureArray(budget, []);
  const safeTransactions = ensureArray(transactions, []);
  const safeGoals = ensureArray(goals, []);
  // Mode-adjusted thresholds — Survival escalates everything, Wealth relaxes low-balance
  const T = {
    LOW_BALANCE_CRITICAL:    mode === "survival" ? 1000  : mode === "wealth" ? 200   : 500,
    LOW_BALANCE_WARNING:     mode === "survival" ? 3000  : mode === "wealth" ? 800   : 1500,
    LARGE_TX_WARNING:        mode === "survival" ? 200   : mode === "wealth" ? 2000  : 500,
    LARGE_TX_CRITICAL:       mode === "survival" ? 500   : mode === "wealth" ? 5000  : 1500,
    OVERSPEND_WARNING:       mode === "survival" ? 0.70  : mode === "growth"  ? 0.90 : 0.85,
    OVERSPEND_CRITICAL:      mode === "survival" ? 0.85  : 1.0,
    SAVINGS_GOAL_BEHIND:     mode === "survival" ? 0.30  : mode === "wealth"  ? 0.70 : 0.50,
    PORTFOLIO_DROP_WARNING:  mode === "wealth"   ? -0.05 : -0.03,
    PORTFOLIO_DROP_CRITICAL: mode === "wealth"   ? -0.10 : -0.07,
    BILL_DUE_DAYS:           mode === "survival" ? 7     : 3,
  };
  const alerts = [];
  const now    = new Date();
  const push   = (a) => alerts.push({ ...a, ts: now.toISOString(), dismissed: false });

  // 1. LOW BALANCE
  safeAccounts.filter(a => a.type === "checking").forEach(a => {
    if (a.balance < T.LOW_BALANCE_CRITICAL) {
      push({ id:`low-bal-crit-${a.id}`, type:"low_balance", severity:"critical",
        icon:"⚠️", title:`Critical: Low Balance — ${a.name}`,
        body:`${a.name} (••••${a.last4}) balance is ${fmt(a.balance)}. Transfer funds immediately.` });
    } else if (a.balance < T.LOW_BALANCE_WARNING) {
      push({ id:`low-bal-warn-${a.id}`, type:"low_balance", severity:"warning",
        icon:"💸", title:`Low Balance — ${a.name}`,
        body:`${a.name} is at ${fmt(a.balance)}. Consider transferring funds before bills hit.` });
    }
  });

  // 2. OVERSPENDING
  safeBudget.forEach(b => {
    const pct = b.spent / b.limit;
    if (pct >= T.OVERSPEND_CRITICAL) {
      push({ id:`overspend-crit-${b.category}`, type:"overspending", severity:"critical",
        icon:"🚨", title:`Over Budget: ${b.category}`,
        body:`You've spent ${fmt(b.spent)} of your ${fmt(b.limit)} ${b.category} budget (${Math.round(pct*100)}%).` });
    } else if (pct >= T.OVERSPEND_WARNING) {
      push({ id:`overspend-warn-${b.category}`, type:"overspending", severity:"warning",
        icon:"📊", title:`Budget Alert: ${b.category}`,
        body:`${Math.round(pct*100)}% of ${b.category} budget used (${fmt(b.spent)} / ${fmt(b.limit)}).` });
    }
  });

  // 3. LARGE TRANSACTION
  safeTransactions.filter(t => t.amount < 0).forEach(t => {
    const abs = Math.abs(t.amount);
    if (abs >= T.LARGE_TX_CRITICAL) {
      push({ id:`large-tx-crit-${t.id}`, type:"large_transaction", severity:"critical",
        icon:"💳", title:`Large Transaction: ${t.name}`,
        body:`${fmt(abs)} charge from ${t.name} on ${t.date}. Verify this is legitimate.` });
    } else if (abs >= T.LARGE_TX_WARNING) {
      push({ id:`large-tx-warn-${t.id}`, type:"large_transaction", severity:"warning",
        icon:"💰", title:`Large Transaction: ${t.name}`,
        body:`${fmt(abs)} spent at ${t.name} on ${t.date}.` });
    }
  });

  // 4. UPCOMING BILL
  safeBills.filter(b => !b.paid).forEach(b => {
    const dueDate = new Date(now.getFullYear(), now.getMonth(), b.dueDay);
    if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);
    const daysUntil = Math.ceil((dueDate - now) / (1000*60*60*24));
    if (daysUntil <= T.BILL_DUE_DAYS && !b.autopay) {
      push({ id:`bill-due-${b.id}`, type:"upcoming_bill", severity: daysUntil <= 1 ? "critical" : "warning",
        icon:"📋", title:`Bill Due Soon: ${b.name}`,
        body:`${fmt(b.amount)} due in ${daysUntil} day${daysUntil===1?"":"s"}. No autopay set — pay manually.` });
    }
  });

  // 5. SAVINGS GOAL BEHIND
  safeGoals.forEach(g => {
    if (g.current >= g.target) return;
    const pct = g.current / g.target;
    if (!g.deadline) return;
    const daysLeft = Math.ceil((new Date(g.deadline) - now) / (1000*60*60*24));
    if (daysLeft > 0 && daysLeft < 60 && pct < T.SAVINGS_GOAL_BEHIND) {
      push({ id:`goal-behind-${g.id}`, type:"missed_savings_goal", severity:"warning",
        icon:"🎯", title:`Goal Behind Schedule: ${g.name}`,
        body:`Only ${Math.round(pct*100)}% saved (${fmt(g.current)} of ${fmt(g.target)}) with ${daysLeft} days left.` });
    }
  });

  // 6. PORTFOLIO DROP
  if (portfolio.connected) {
    const chgPct = portfolio.dayChangePct / 100;
    if (chgPct <= T.PORTFOLIO_DROP_CRITICAL) {
      push({ id:"portfolio-drop-crit", type:"portfolio_drop", severity:"critical",
        icon:"📉", title:"Portfolio: Significant Drop",
        body:`Your portfolio dropped ${Math.abs(portfolio.dayChangePct).toFixed(2)}% today (${fmt(Math.abs(portfolio.dayChange))}).` });
    } else if (chgPct <= T.PORTFOLIO_DROP_WARNING) {
      push({ id:"portfolio-drop-warn", type:"portfolio_drop", severity:"warning",
        icon:"📉", title:"Portfolio: Notable Decline",
        body:`Down ${Math.abs(portfolio.dayChangePct).toFixed(2)}% today (${fmt(Math.abs(portfolio.dayChange))}).` });
    }
  } else {
    const totalCash = safeAccounts.filter(a=>a.type!=="credit").reduce((s,a)=>s+a.balance,0);
    if (totalCash > 5000 && mode !== "survival") {
      push({ id:"funding-readiness", type:"funding_readiness", severity:"info",
        icon:"📈", title:"Investing Opportunity",
        body:`You have ${fmt(totalCash)} in cash. Connect your brokerage to track investments and optimize allocation.` });
    }
  }

  // 7. SUBSCRIPTION INCREASE
  safeBills.filter(b => b.category === "Entertainment" || b.autopay).forEach(b => {
    const recentTx = safeTransactions.find(t => t.name.toLowerCase().includes(b.name.toLowerCase()) && t.amount < 0);
    if (recentTx && Math.abs(recentTx.amount) > b.amount * 1.05) {
      push({ id:`sub-increase-${b.id}`, type:"subscription_increase", severity:"info",
        icon:"🔔", title:`Price Increase: ${b.name}`,
        body:`${b.name} charged ${fmt(Math.abs(recentTx.amount))} but your recorded amount is ${fmt(b.amount)}. Update your bill.` });
    }
  });

  const order = { critical:0, warning:1, info:2 };
  return alerts.sort((a,b) => order[a.severity] - order[b.severity]);
}


function useAlerts({ accounts, bills, budget, transactions, portfolio, goals, mode }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wp_dismissed_alerts") || "[]"); } catch { return []; }
  });

  const rawAlerts = buildAlerts({ accounts, bills, budget, transactions, portfolio, goals, mode });
  const alerts    = rawAlerts.filter(a => !dismissed.includes(a.id));
  const unread    = alerts.length;
  const critical  = alerts.filter(a => a.severity === "critical").length;

  const dismiss = useCallback((id) => {
    setDismissed(d => {
      const next = [...d, id];
      try { localStorage.setItem("wp_dismissed_alerts", JSON.stringify(next)); } catch {}
      // BACKEND HOOK: POST /api/alerts/dismiss { alertId: id }
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    const ids = rawAlerts.map(a => a.id);
    setDismissed(ids);
    try { localStorage.setItem("wp_dismissed_alerts", JSON.stringify(ids)); } catch {}
  }, [rawAlerts]);

  // PUSH NOTIFICATION HOOK (future):
  // useEffect(() => {
  //   if (!("Notification" in window)) return;
  //   critical > 0 && Notification.requestPermission().then(p => {
  //     if (p === "granted") new Notification("WealthPilot Alert", { body: alerts[0]?.title });
  //   });
  // }, [critical]);

  return { alerts, unread, critical, dismiss, dismissAll };
}

// ─── ALERT CENTER ─────────────────────────────────────────────────────────────
const SEVERITY_STYLE = {
  critical: { color:"var(--red)",    bg:"rgba(244,63,94,0.1)",   border:"rgba(244,63,94,0.25)",   label:"Critical" },
  warning:  { color:"var(--yellow)", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  label:"Warning"  },
  info:     { color:"var(--accent)", bg:"rgba(79,142,247,0.1)",  border:"rgba(79,142,247,0.25)",  label:"Info"     },
};

function AlertCenter({ alerts, unread, critical, dismiss, dismissAll, onClose }) {
  const groups = ["critical","warning","info"].map(s => ({
    severity: s,
    items: alerts.filter(a => a.severity === s),
  })).filter(g => g.items.length > 0);

  return (
    <div style={{
      position:"fixed", top:60, right:16, width:360, maxHeight:"80vh",
      background:"var(--bg2)", border:"1px solid var(--border2)",
      borderRadius:16, boxShadow:"0 12px 48px rgba(0,0,0,0.6)",
      zIndex:500, display:"flex", flexDirection:"column",
      animation:"slideIn 0.18s ease",
    }}>
      {/* Header */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>Alert Center</span>
          {unread > 0 && (
            <span style={{background:"var(--red)",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:99}}>{unread}</span>
          )}
        </div>
        <div style={{display:"flex",gap:8}}>
          {unread > 0 && (
            <button className="btn btn-ghost btn-sm" style={{padding:"3px 10px",fontSize:11}} onClick={dismissAll}>
              Clear all
            </button>
          )}
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Alert list */}
      <div style={{overflowY:"auto",flex:1,padding:"10px 12px"}}>
        {unread === 0 ? (
          <div className="empty-state" style={{padding:"32px 0"}}>
            <div className="icon">✅</div>
            <h3>All clear</h3>
            <p className="text-sm" style={{marginTop:4}}>No active alerts right now.</p>
          </div>
        ) : groups.map(g => (
          <div key={g.severity} style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:SEVERITY_STYLE[g.severity].color,padding:"4px 4px 6px"}}>{SEVERITY_STYLE[g.severity].label}</div>
            {g.items.map(a => (
              <div key={a.id} style={{
                background: SEVERITY_STYLE[a.severity].bg,
                border:`1px solid ${SEVERITY_STYLE[a.severity].border}`,
                borderRadius:10, padding:"10px 12px", marginBottom:6,
                display:"flex", gap:10, alignItems:"flex-start",
              }}>
                <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{a.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:2}}>{a.title}</div>
                  <div style={{fontSize:11,color:"var(--text2)",lineHeight:1.5}}>{a.body}</div>
                </div>
                <button onClick={()=>dismiss(a.id)} style={{
                  background:"transparent",border:"none",color:"var(--text3)",
                  cursor:"pointer",fontSize:14,padding:"0 2px",flexShrink:0,lineHeight:1
                }}>✕</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{padding:"10px 16px",borderTop:"1px solid var(--border)",fontSize:10,color:"var(--text3)",flexShrink:0}}>
        Alerts computed from live financial data · Dismissed alerts reset on new session
      </div>
    </div>
  );
}

// ─── FINANCIAL MODES ──────────────────────────────────────────────────────────
const MODES = {
  survival: {
    id:"survival", label:"Survival", icon:"🛡️", color:"#f43f5e",
    bg:"rgba(244,63,94,0.08)", border:"rgba(244,63,94,0.25)",
    tagline:"Preserve cash · Cut spending · Prioritize bills",
    dashBanner:"Focus: preserve every dollar. Only essential spending until you're stable.",
    goalPriority:["debt","emergency","savings","home","car","vacation","investment","education","custom"],
    budgetSuggestions:[
      {category:"Dining",        action:"cut",      msg:"Cut dining out — cook at home to save $150+/mo."},
      {category:"Entertainment", action:"cut",      msg:"Pause entertainment subscriptions temporarily."},
      {category:"Shopping",      action:"cut",      msg:"Freeze discretionary shopping this month."},
      {category:"Housing",       action:"keep",     msg:"Priority: keep housing paid above all else."},
    ],
    aiInstructions:`The user is in SURVIVAL mode. They are under financial stress.
PRIORITIES: 1) Preserve cash. 2) Cut non-essentials. 3) Pay critical bills first. 4) Build $500+ buffer.
TONE: Calm, direct, non-judgmental. No investing advice.`,
  },
  stable: {
    id:"stable", label:"Stable", icon:"⚖️", color:"#f59e0b",
    bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.25)",
    tagline:"Build habits · Reduce debt · Grow emergency fund",
    dashBanner:"Focus: build solid financial habits and eliminate high-interest debt.",
    goalPriority:["emergency","debt","savings","home","car","vacation","investment","education","custom"],
    budgetSuggestions:[
      {category:"Dining",    action:"trim",  msg:"Trim dining to $200/mo to free up $100 for debt payoff."},
      {category:"Shopping",  action:"trim",  msg:"Set a $300 limit and track every purchase."},
      {category:"Groceries", action:"keep",  msg:"Healthy grocery budget — stay consistent."},
    ],
    aiInstructions:`The user is in STABLE mode. Baseline income covered, building habits.
PRIORITIES: 1) Eliminate credit card debt. 2) Build 3-month emergency fund. 3) Automate savings.
TONE: Encouraging, practical, step-by-step.`,
  },
  growth: {
    id:"growth", label:"Growth", icon:"📈", color:"#10b981",
    bg:"rgba(16,185,129,0.08)", border:"rgba(16,185,129,0.25)",
    tagline:"Optimize debt · Invest consistently · Grow income",
    dashBanner:"Focus: optimize every dollar — invest surplus, reduce debt, grow income streams.",
    goalPriority:["investment","savings","home","emergency","debt","education","vacation","car","custom"],
    budgetSuggestions:[
      {category:"Housing",       action:"review",   msg:"Consider refinancing if rate > 7% — save $200+/mo."},
      {category:"Dining",        action:"keep",     msg:"Dining budget is reasonable — maintain it."},
      {category:"Entertainment", action:"keep",     msg:"Quality of life matters — keep this reasonable."},
    ],
    aiInstructions:`The user is in GROWTH mode. Financially stable, wants to accelerate wealth.
PRIORITIES: 1) Invest 15-20% of income. 2) Optimize debt payoff. 3) Max 401k/IRA. 4) Side income.
TONE: Strategic, confident, data-driven with specific numbers.`,
  },
  wealth: {
    id:"wealth", label:"Wealth", icon:"💎", color:"#a3e635",
    bg:"rgba(163,230,53,0.08)", border:"rgba(163,230,53,0.2)",
    tagline:"Maximize investing · Leverage assets · Tax optimization",
    dashBanner:"Focus: maximize compounding, leverage assets, and minimize tax drag.",
    goalPriority:["investment","home","education","savings","custom","vacation","emergency","debt","car"],
    budgetSuggestions:[
      {category:"Housing",   action:"leverage", msg:"Equity access: HELOC could fund additional investments."},
      {category:"Transport", action:"review",   msg:"Depreciation cost — consider leasing strategy for tax."},
    ],
    aiInstructions:`The user is in WEALTH mode. Strong cash flow, maximizing wealth.
PRIORITIES: 1) Tax-advantaged accounts. 2) Tax loss harvesting. 3) Real estate equity. 4) Estate planning.
TONE: Sophisticated, strategic. Reference advanced concepts confidently.`,
  },
};

function useMode() {
  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem("wp_mode") || "stable"; } catch { return "stable"; }
  });
  const [suggestion, setSuggestion] = useState(null);

  // Auto-detect: analyze last 3 months cashflow from REPORT_MONTHS
  // BACKEND: swap with GET /api/users/mode/suggest when live
  useEffect(() => {
    const recent = REPORT_MONTHS.slice(-3);
    const negMonths = recent.filter(m => m.income - m.spending < 0).length;
    const avgSavingsRate = recent.reduce((s,m) => s + (m.income-m.spending)/m.income, 0) / recent.length;
    if (negMonths >= 2 && mode !== "survival") {
      setSuggestion({ suggest:"survival", reason:"Negative cash flow detected in 2+ of last 3 months." });
    } else if (avgSavingsRate > 0.25 && mode === "stable") {
      setSuggestion({ suggest:"growth", reason:"Your savings rate has been above 25% — you may be ready for Growth mode." });
    } else {
      setSuggestion(null);
    }
  }, [mode]);

  const setMode = (id) => {
    const prev = mode;
    if (prev === id) return;
    setModeState(id);
    try { localStorage.setItem("wp_mode", id); } catch {}
    try {
      const hist = JSON.parse(localStorage.getItem("wp_mode_history") || "[]");
      hist.push({ from: prev, to: id, ts: new Date().toISOString() });
      localStorage.setItem("wp_mode_history", JSON.stringify(hist.slice(-50)));
    } catch {}
    // BACKEND HOOK: POST /api/users/mode-history { from: prev, to: id, timestamp }
  };

  return { mode, setMode, config: MODES[mode] || MODES.stable, suggestion };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #07090f;
    --bg2: #101522;
    --bg3: #151c2c;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #f0f2f7;
    --text2: #8892a4;
    --text3: #525d72;
    --accent: #5ea2ff;
    --accent2: #6366f1;
    --green: #10b981;
    --red: #f43f5e;
    --yellow: #f59e0b;
    --card-glow: 0 0 0 1px var(--border), 0 10px 30px rgba(3,8,20,0.45);
    --radius: 16px;
    --radius-sm: 10px;
  }

  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 0; overflow: hidden;
    transition: width 0.3s ease;
  }
  .sidebar.collapsed { width: 64px; }
  .sidebar-logo {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .logo-mark {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, #4f8ef7, #6366f1);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(79,142,247,0.35);
  }
  .logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; letter-spacing: -0.3px; white-space: nowrap; overflow: hidden; }
  .logo-text span { color: var(--accent); }
  .nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--radius-sm);
    cursor: pointer; color: var(--text2);
    font-size: 14px; font-weight: 500;
    transition: all 0.15s ease;
    white-space: nowrap; overflow: hidden;
    border: 1px solid transparent;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: rgba(79,142,247,0.12); color: var(--accent); border-color: rgba(79,142,247,0.2); }
  .nav-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
  .sidebar-bottom { padding: 12px 8px; border-top: 1px solid var(--border); }
  .plan-badge {
    margin: 8px 4px 0;
    padding: 8px 12px; border-radius: var(--radius-sm);
    background: linear-gradient(135deg, rgba(79,142,247,0.15), rgba(99,102,241,0.15));
    border: 1px solid rgba(79,142,247,0.2);
    font-size: 11px; color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    white-space: nowrap; overflow: hidden;
  }

  /* MAIN */
  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-width: 0; }
  .topbar {
    padding: 16px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(16,21,34,0.74); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 10; flex-shrink: 0;
  }
  .page-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #4f8ef7, #6366f1);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; cursor: pointer;
  }
  .content { padding: 24px; flex: 1; }

  /* CARDS */
  .card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 18px; padding: 20px;
    box-shadow: var(--card-glow);
  }
  .card-sm { padding: 16px; }
  .card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text3); margin-bottom: 8px; }
  .card-value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 26px; line-height: 1; }
  .card-sub { font-size: 12px; color: var(--text2); margin-top: 4px; }

  /* GRIDS */
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
  .grid-1-2 { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }

  /* STAT CARD */
  .stat-card { position: relative; overflow: hidden; }
  .stat-card::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 80px; height: 80px; border-radius: 50%;
    opacity: 0.08; transform: translate(20px, -20px);
    background: var(--accent-color, var(--accent));
  }
  .stat-icon { font-size: 20px; margin-bottom: 12px; }
  .change-badge {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 20px; margin-top: 6px;
  }
  .change-badge.pos { background: rgba(16,185,129,0.15); color: var(--green); }
  .change-badge.neg { background: rgba(244,63,94,0.15); color: var(--red); }
  .change-badge.neu { background: rgba(245,158,11,0.15); color: var(--yellow); }

  /* PROGRESS BAR */
  .progress-bar { height: 6px; background: var(--bg3); border-radius: 999px; overflow: hidden; margin: 6px 0; }
  .progress-fill { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 10px 12px; color: var(--text3); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
  td { padding: 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  /* BADGE */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px;
  }
  .badge-blue { background: rgba(79,142,247,0.15); color: var(--accent); }
  .badge-green { background: rgba(16,185,129,0.15); color: var(--green); }
  .badge-red { background: rgba(244,63,94,0.15); color: var(--red); }
  .badge-yellow { background: rgba(245,158,11,0.15); color: var(--yellow); }
  .badge-gray { background: rgba(255,255,255,0.06); color: var(--text2); }

  /* BUTTON */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600; cursor: pointer; border: none;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #3d7df6; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(79,142,247,0.35); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--bg3); color: var(--text); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-danger { background: rgba(244,63,94,0.12); color: var(--red); border: 1px solid rgba(244,63,94,0.2); }

  /* PILL TAB */
  .tab-group { display: flex; gap: 4px; background: var(--bg3); border-radius: var(--radius-sm); padding: 4px; }
  .tab { padding: 6px 14px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--text2); transition: all 0.15s; }
  .tab.active { background: var(--bg2); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }

  /* BILL ITEM */
  .bill-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .bill-item:last-child { border-bottom: none; }
  .bill-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .bill-info { flex: 1; }
  .bill-name { font-size: 13px; font-weight: 500; }
  .bill-due { font-size: 11px; color: var(--text2); margin-top: 1px; }
  .bill-amount { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; }

  /* ACCOUNT CARD */
  .account-card {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px; cursor: pointer;
    transition: all 0.15s;
  }
  .account-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .account-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .institution-logo { width: 32px; height: 32px; border-radius: 8px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .account-type { font-size: 11px; color: var(--text2); text-transform: capitalize; }
  .account-num { font-size: 11px; color: var(--text3); margin-top: 1px; }
  .account-balance { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; }
  .account-name-label { font-size: 12px; color: var(--text2); margin-top: 2px; }

  /* DONUT CHART */
  .donut-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
  .donut-center { position: absolute; text-align: center; }

  /* AI CHAT */
  .chat-wrap { display: flex; flex-direction: column; height: calc(100vh - 120px); }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .msg { display: flex; gap: 10px; align-items: flex-start; max-width: 80%; }
  .msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .msg-bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; }
  .msg.assistant .msg-bubble { background: var(--bg3); border: 1px solid var(--border); color: var(--text); border-top-left-radius: 4px; }
  .msg.user .msg-bubble { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; border-top-right-radius: 4px; }
  .msg-avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; }
  .msg.assistant .msg-avatar { background: linear-gradient(135deg, #4f8ef7, #6366f1); }
  .msg.user .msg-avatar { background: var(--bg3); border: 1px solid var(--border); }
  .chat-input-wrap { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; }
  .chat-input {
    flex: 1; background: var(--bg3); border: 1px solid var(--border2);
    color: var(--text); border-radius: var(--radius-sm); padding: 10px 14px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.15s;
  }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--text3); }
  .ai-badge { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.25); font-size: 11px; font-weight: 600; color: #818cf8; }
  .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: #818cf8; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  /* PORTFOLIO */
  .portfolio-placeholder {
    background: linear-gradient(135deg, rgba(79,142,247,0.08), rgba(99,102,241,0.08));
    border: 1px dashed rgba(79,142,247,0.3);
    border-radius: var(--radius); padding: 32px; text-align: center;
  }
  .portfolio-placeholder h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
  .ticker-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .ticker-row:last-child { border-bottom: none; }
  .ticker-sym { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; min-width: 50px; }
  .ticker-name { font-size: 12px; color: var(--text2); flex: 1; }
  .ticker-shares { font-size: 12px; color: var(--text3); min-width: 80px; text-align: right; }
  .ticker-value { font-weight: 600; font-size: 14px; min-width: 90px; text-align: right; }
  .ticker-change { font-size: 12px; font-weight: 600; min-width: 60px; text-align: right; }
  .pos { color: var(--green); } .neg { color: var(--red); }

  /* SETTINGS */
  .settings-section { margin-bottom: 28px; }
  .settings-section h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; margin-bottom: 14px; color: var(--text); }
  .setting-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .setting-row:last-child { border-bottom: none; }
  .setting-label { font-size: 14px; font-weight: 500; }
  .setting-desc { font-size: 12px; color: var(--text2); margin-top: 2px; }
  .toggle { width: 42px; height: 24px; border-radius: 999px; background: var(--bg3); border: 1px solid var(--border2); cursor: pointer; position: relative; transition: background 0.2s; }
  .toggle.on { background: var(--green); border-color: var(--green); }
  .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .toggle.on::after { transform: translateX(18px); }
  .integration-card { display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 8px; }
  .int-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .int-info { flex: 1; }
  .int-name { font-size: 14px; font-weight: 600; }
  .int-status { font-size: 11px; color: var(--text2); margin-top: 2px; }

  /* SECTION */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; }
  .mt-4 { margin-top: 16px; } .mt-6 { margin-top: 24px; }
  .mb-4 { margin-bottom: 16px; }
  .gap-2 { gap: 8px; } .gap-3 { gap: 12px; }
  .flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; }
  .text-green { color: var(--green); } .text-red { color: var(--red); } .text-accent { color: var(--accent); }
  .text-muted { color: var(--text2); } .text-sm { font-size: 13px; } .text-xs { font-size: 11px; }
  .font-bold { font-weight: 700; } .font-syne { font-family: 'Syne', sans-serif; }
  .safe-to-spend-card {
    background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.05));
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden;
  }
  .safe-to-spend-card::after {
    content: '💚'; position: absolute; right: 20px; bottom: 20px;
    font-size: 48px; opacity: 0.15;
  }

  /* EMPTY / PLACEHOLDER */
  .empty-state { text-align: center; padding: 40px 20px; color: var(--text2); }
  .empty-state .icon { font-size: 36px; margin-bottom: 12px; }
  .empty-state h3 { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; margin-bottom: 6px; color: var(--text); }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(2, 1fr); }
    .grid-2-1, .grid-1-2 { grid-template-columns: 1fr; }
    .sidebar { width: 64px; }
    .logo-text, .nav-item span, .plan-badge { display: none; }
  }

  /* MOBILE: sidebar becomes bottom tab bar */
  @media (max-width: 640px) {
    .app { flex-direction: column; }

    /* Hide the side sidebar entirely */
    .sidebar {
      display: none;
    }

    /* Show bottom nav bar */
  .bottom-nav {
      display: flex !important;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
      background: rgba(16,21,34,0.85);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--border);
      padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
      justify-content: space-around;
      align-items: center;
    }

    .bottom-nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 10px; border-radius: 10px; cursor: pointer;
      color: var(--text3); font-size: 9px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.3px;
      transition: color 0.15s; flex: 1; min-width: 0;
    }
    .bottom-nav-item .bnav-icon { font-size: 18px; line-height: 1; }
    .bottom-nav-item.active { color: var(--accent); }
    .bottom-nav-item.active .bnav-icon { filter: drop-shadow(0 0 6px rgba(79,142,247,0.6)); }

    /* Main content fills full width, add bottom padding for nav bar */
    .main {
      width: 100%;
      padding-bottom: 72px;
    }

    /* Full-width topbar without sidebar offset */
    .topbar {
      padding: 12px 16px;
    }

    /* Show mobile logo in topbar */
    #mobile-logo { display: flex !important; }

    /* Hide "Plaid synced" text on very small screens */
    .plaid-sync-text { display: none; }

    /* Content padding */
    .content { padding: 16px; }

    /* Stat cards: 2 columns on mobile */
    .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .grid-3 { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .grid-2 { grid-template-columns: 1fr; gap: 10px; }
    .grid-2-1, .grid-1-2 { grid-template-columns: 1fr; gap: 10px; }

    /* Smaller cards on mobile */
    .card { padding: 14px; }
    .card-value { font-size: 20px; }
    .stat-icon { font-size: 16px; margin-bottom: 8px; }

    /* Safe to spend card full width */
    .safe-to-spend-card { padding: 14px; }

    /* mb spacing */
    .mb-4 { margin-bottom: 10px; }
    .mt-4 { margin-top: 10px; }
    /* Calendar: stack full width on mobile */
    .cal-layout { grid-template-columns: 1fr !important; }
  }

  /* NAV GROUPS */
  .nav-group-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    color: var(--text3); padding: 14px 12px 4px; white-space: nowrap; overflow: hidden;
  }
  .sidebar.collapsed .nav-group-label { opacity: 0; }
  .nav-divider { height: 1px; background: var(--border); margin: 6px 8px; }

  /* FLOATING MOBILE MENU */
  .fab {
    display: none; position: fixed; bottom: 76px; right: 16px; z-index: 200;
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; cursor: pointer; font-size: 18px;
    box-shadow: 0 4px 20px rgba(79,142,247,0.5);
    align-items: center; justify-content: center; color: #fff;
    transition: transform 0.2s;
  }
  .fab:hover { transform: scale(1.08); }
  .fab.open { transform: rotate(45deg); }
  .fab-menu {
    display: none; position: fixed; bottom: 128px; right: 12px; z-index: 199;
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 14px; padding: 8px; min-width: 160px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    flex-direction: column; gap: 2px;
  }
  .fab-menu.open { display: flex; }
  .fab-menu-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 9px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: var(--text2);
    transition: all 0.12s;
  }
  .fab-menu-item:hover { background: var(--bg3); color: var(--text); }
  .fab-menu-item.active { color: var(--accent); }
  @media (max-width: 640px) { .fab { display: flex; } }

  /* TOAST */
  .toast-wrap { position: fixed; top: 16px; right: 16px; z-index: 999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .toast {
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 10px; padding: 10px 16px; font-size: 13px; font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4); pointer-events: auto;
    display: flex; align-items: center; gap: 8px;
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
  .toast.success { border-left: 3px solid var(--green); }
  .toast.error   { border-left: 3px solid var(--red); }
  .toast.info    { border-left: 3px solid var(--accent); }

  /* ALERT BADGE on bell button */
  .alert-bell { position: relative; }
  .alert-badge {
    position: absolute; top: -4px; right: -4px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--red); color: #fff;
    font-size: 9px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--bg2); pointer-events: none;
  }
  .alert-badge.warning { background: var(--yellow); color: #000; }

  /* MODE SELECTOR */
  .mode-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 99px; cursor: pointer;
    font-size: 12px; font-weight: 700; border: 1px solid;
    transition: all 0.15s;
  }
  .mode-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 14px; padding: 8px; min-width: 220px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 300;
  }
  .mode-option {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 9px; cursor: pointer;
    transition: background 0.12s;
  }
  .mode-option:hover { background: var(--bg3); }
  .mode-option.active { background: var(--bg3); }
  .mode-icon { font-size: 18px; flex-shrink: 0; }
  .mode-label { font-size: 13px; font-weight: 700; }
  .mode-tagline { font-size: 10px; color: var(--text3); margin-top: 1px; }
  .mode-banner {
    padding: 8px 20px; font-size: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    border-bottom: 1px solid var(--border);
  }

  /* CALENDAR */
  .cal-grid {
    display: grid; grid-template-columns: repeat(7,1fr);
    gap: 1px; background: var(--border); border-radius: 12px; overflow: hidden;
  }
  .cal-day-header {
    background: var(--bg3); text-align: center;
    padding: 8px 4px; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3);
  }
  .cal-cell {
    background: var(--bg2); min-height: 90px; padding: 6px;
    cursor: pointer; transition: background 0.12s; position: relative;
  }
  .cal-cell:hover { background: var(--bg3); }
  .cal-cell.today { background: rgba(79,142,247,0.07); }
  .cal-cell.today .cal-date { color: var(--accent); font-weight: 700; }
  .cal-cell.other-month { opacity: 0.35; }
  .cal-cell.selected { background: rgba(79,142,247,0.12); outline: 1px solid rgba(79,142,247,0.35); }
  .cal-date { font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--text2); }
  .cal-event {
    font-size: 9px; font-weight: 600; padding: 2px 5px; border-radius: 4px;
    margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    cursor: pointer;
  }
  .cal-event.bill       { background: rgba(244,63,94,0.18); color: #fb7185; }
  .cal-event.income     { background: rgba(16,185,129,0.18); color: #34d399; }
  .cal-event.subscription { background: rgba(139,92,246,0.18); color: #a78bfa; }
  .cal-event.savings    { background: rgba(245,158,11,0.18); color: #fbbf24; }
  .cal-event.debt       { background: rgba(249,115,22,0.18); color: #fb923c; }
  .cal-event.transfer   { background: rgba(79,142,247,0.18); color: #7eb3fa; }
  .cal-event.reminder   { background: rgba(255,255,255,0.08); color: var(--text2); }
  .cal-event.tax        { background: rgba(232,121,249,0.18); color: #e879f9; }
  .cal-event.milestone  { background: rgba(56,189,248,0.18); color: #38bdf8; }
  .cal-event.portfolio  { background: rgba(163,230,53,0.18); color: #a3e635; }
  .cal-event.paid       { opacity: 0.45; text-decoration: line-through; }

  /* TIMELINE */
  .tl-row { display: flex; gap: 0; border-bottom: 1px solid var(--border); }
  .tl-row:last-child { border-bottom: none; }
  .tl-date {
    width: 56px; flex-shrink: 0; padding: 14px 8px;
    text-align: center; border-right: 1px solid var(--border);
    background: var(--bg3);
  }
  .tl-events { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px; }
  .tl-event-card {
    display: flex; align-items: center; gap: 10;
    padding: 8px 10px; border-radius: 9px;
    background: var(--bg3); border: 1px solid var(--border);
    cursor: pointer; transition: background 0.12s;
    gap: 10px;
  }
  .tl-event-card:hover { background: var(--bg2); }
  @media (max-width: 640px) {
    .tl-date { width: 44px; padding: 10px 4px; font-size: 12px; }
  }

  /* EVENT DRAWER */
  .drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 300;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.15s;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .drawer {
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 20px 20px 0 0; width: 100%; max-width: 600px;
    max-height: 85vh; overflow-y: auto; padding: 20px;
    animation: slideUp 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
  .drawer-handle { width: 36px; height: 4px; background: var(--border2); border-radius: 99px; margin: 0 auto 16px; }
  .drawer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .drawer-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; }
  .drawer-close { background: var(--bg3); border: none; color: var(--text2); width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }

  /* EVENT FORM */
  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; display: block; }
  .form-input, .form-select {
    width: 100%; background: var(--bg3); border: 1px solid var(--border2);
    color: var(--text); border-radius: var(--radius-sm); padding: 9px 12px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus { border-color: var(--accent); }
  .form-select option { background: var(--bg2); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* LEGEND */
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .cal-nav-btn {
    background: var(--bg3); border: 1px solid var(--border); color: var(--text2);
    width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center; transition: all 0.12s;
  }
  .cal-nav-btn:hover { background: var(--bg2); color: var(--text); border-color: var(--border2); }

  @media (max-width: 640px) {
    .cal-cell { min-height: 52px; }
    .cal-event { display: none; }
    .cal-cell .cal-dot-wrap { display: flex; gap: 2px; flex-wrap: wrap; margin-top: 2px; }
    .cal-dot { width: 5px; height: 5px; border-radius: 50%; }
    .form-row { grid-template-columns: 1fr; }
  }

  /* PROFIT LOCK */
  .pl-vault-card {
    background: linear-gradient(135deg, rgba(163,230,53,0.08), rgba(79,142,247,0.06));
    border: 1px solid rgba(163,230,53,0.2); border-radius: var(--radius); padding: 20px;
  }
  .pl-slider { width:100%; accent-color:#a3e635; cursor:pointer; }
  .pl-alloc-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); }
  .pl-alloc-row:last-child { border-bottom:none; }
  .pl-lock-btn {
    background: linear-gradient(135deg,#a3e635,#4ade80);
    color:#000; font-weight:700; font-size:14px;
    border:none; border-radius:10px; padding:12px 20px; cursor:pointer;
    transition:opacity 0.15s; width:100%;
  }
  .pl-lock-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .pl-lock-btn:hover:not(:disabled) { opacity:0.85; }
  .gain-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:12px; font-weight:700; }
  .gain-pill.pos { background:rgba(163,230,53,0.15); color:#a3e635; }
  .gain-pill.neg { background:rgba(244,63,94,0.15); color:var(--red); }
  .gain-pill.neu { background:rgba(255,255,255,0.06); color:var(--text3); }
`;


// ─── MINI DONUT CHART (pure SVG) ──────────────────────────────────────────────
function DonutChart({ data, size = 120, thickness = 20 }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const slices = data.map(d => {
    const len = (d.value / total) * circ;
    const slice = { ...d, len, offset, gap: 2 };
    offset += len;
    return slice;
  });
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={thickness} />
      {slices.map((s, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${Math.max(0, s.len - 3)} ${circ - s.len + 3}`}
          strokeDashoffset={-s.offset + 1}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#4f8ef7", width = 80, height = 30 }) {
  if (!data?.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function Dashboard({ setPage, accounts, totalCash, creditDebt, syncing, lastSync, onRefresh, bills = [], budget = [], transactions = [], portfolio = MOCK.portfolio, creditScore = null }) {
  const safeAccounts = pickCollection(accounts, ["accounts"], []);
  const safeBills = pickCollection(bills, ["bills"], []);
  const safeBudget = pickCollection(budget, ["budgets", "budget"], []);
  const safeTransactions = pickCollection(transactions, ["transactions"], []);
  const netWorth = totalCash + creditDebt + (portfolio?.totalValue || 0);
  const income = safeTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0) || MOCK.income;
  const spending = safeTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0) || MOCK.spending;
  const upcomingBills = safeBills.filter(b => !b.paid);
  const totalSpent = safeBudget.reduce((s, b) => s + (b.spent || 0), 0);
  const safe = Math.max(0, totalCash - upcomingBills.reduce((s, b) => s + b.amount, 0) - (spending / 30) * daysLeft * 0.5);
  const spendPct = income > 0 ? Math.round((spending / income) * 100) : 0;
  const creditScoreValue = creditScore?.latest?.score || 742;
  const billRunway = upcomingBills.reduce((s, b) => s + b.amount, 0);
  const portfolioPnl = portfolio?.dayChangePct ?? 0;

  return (
    <div style={{display:"grid",gap:14,paddingBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        <div className="card" style={{padding:18,borderRadius:18,background:"linear-gradient(135deg, rgba(79,142,247,0.12), rgba(79,142,247,0.04))"}}>
          <div className="card-title">Total Cash</div><div className="card-value" style={{fontSize:34}}>{fmtK(totalCash)}</div>
          <div className="card-sub">Linked cash accounts</div>
        </div>
        <div className="card" style={{padding:18,borderRadius:18,background:"linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))"}}>
          <div className="card-title">Monthly Income</div><div className="card-value">{fmtK(income)}</div>
          <div className="card-sub">Cash inflow this cycle</div>
        </div>
        <div className="card" style={{padding:18,borderRadius:18,background:"linear-gradient(135deg, rgba(244,63,94,0.12), rgba(244,63,94,0.03))"}}>
          <div className="card-title">Monthly Spending</div><div className="card-value">{fmtK(spending)}</div>
          <div className="card-sub">{spendPct}% of income</div>
        </div>
        <div className="card" style={{padding:18,borderRadius:18,background:"linear-gradient(135deg, rgba(16,185,129,0.16), rgba(16,185,129,0.03))"}}>
          <div className="card-title">Safe to Spend</div><div className="card-value text-green">{fmtK(safe)}</div>
          <div className="card-sub">{daysLeft} days left in month</div>
        </div>
      </div>

      <div className="card" style={{padding:"16px 20px",borderRadius:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"Syne",fontWeight:700,fontSize:14}}>Connected Accounts</span>
            {lastSync && <span style={{fontSize:10,color:"var(--text3)"}}>· synced {lastSync.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={syncing}>{syncing ? "Syncing…" : "↻ Refresh"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("settings")}>+ Add Account</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
          {safeAccounts.length === 0 ? (
            <div className="empty-state" style={{gridColumn:"1 / -1"}}><div className="icon">🏦</div><p className="text-sm">No connected accounts yet.</p></div>
          ) : safeAccounts.map(a => <div key={a.id} style={{background:"var(--bg3)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)",borderLeft:`3px solid ${a.type==="credit"?"var(--red)":a.type==="savings"?"var(--green)":"var(--accent)"}`}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"var(--text3)",textTransform:"capitalize"}}>{a.type}</span><span style={{fontSize:10,color:"var(--text3)"}}>••••{a.last4}</span></div><div style={{fontFamily:"Syne",fontWeight:700,fontSize:18,color:a.balance<0?"var(--red)":"var(--text)"}}>{fmt(a.balance)}</div><div style={{fontSize:11,color:"var(--text2)"}}>{a.name}</div></div>)}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14}}>
        <div className="card" style={{padding:18,borderRadius:18}}>
          <div className="section-header"><div className="section-title">Budget Progress</div><button className="btn btn-ghost btn-sm" onClick={() => setPage("budget")}>View All →</button></div>
          <div style={{marginTop:8}}>
            {safeBudget.slice(0,5).map(b => (<div key={b.category} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text2)",marginBottom:4}}><span>{CATEGORY_ICONS[b.category] || "💳"} {b.category}</span><span style={{color:"var(--text)"}}>{fmt(b.spent || 0)} / {fmt(b.limit || 0)}</span></div><div style={{height:8,borderRadius:99,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100, Math.round(((b.spent||0)/Math.max(1,b.limit||1))*100))}%`,background:b.color||"var(--accent)"}}/></div></div>))}
            {safeBudget.length===0 && <div className="text-sm text-muted">No budget categories yet.</div>}
          </div>
        </div>
        <div className="card" style={{padding:18,borderRadius:18}}>
          <div className="section-header"><div className="section-title">Upcoming Bills</div><button className="btn btn-ghost btn-sm" onClick={() => setPage("bills")}>All →</button></div>
          {upcomingBills.slice(0,4).map(b => <div key={b.id} className="bill-item"><div className="bill-icon">{CATEGORY_ICONS[b.category] || "💳"}</div><div className="bill-info"><div className="bill-name">{b.name}</div><div className="bill-due">Due day {b.dueDay}</div></div><div className="bill-amount">{fmt(b.amount)}</div></div>)}
          {upcomingBills.length===0 && <div className="empty-state"><div className="icon">🧾</div><p className="text-sm">Add your first bill</p></div>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
        <div className="card" style={{padding:16,borderRadius:16,background:"linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.02))"}}>
          <div className="card-title">Webull / Portfolio</div>
          <div className={`card-value ${portfolioPnl >= 0 ? "text-green" : "text-red"}`}>{portfolioPnl >= 0 ? "+" : ""}{portfolioPnl.toFixed(2)}%</div>
          <div className="card-sub">Day performance · {portfolio?.connected ? "Connected" : "Demo mode"}</div>
        </div>
        <div className="card" style={{padding:16,borderRadius:16,background:"linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.03))"}}>
          <div className="card-title">Credit Score Tracker</div>
          <div className="card-value">{creditScoreValue}</div>
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => setPage("credit-score")}>Open Tracker</button>
        </div>
        <div className="card" style={{padding:16,borderRadius:16,background:"linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.02))"}}>
          <div className="card-title">Bill Calendar</div>
          <div className="card-value">{upcomingBills.length}</div>
          <div className="card-sub">{fmt(billRunway)} due this cycle</div>
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => setPage("calendar")}>View Calendar</button>
        </div>
      </div>

      <div className="card mt-4" style={{borderRadius:18}}>
        <div className="section-header">
          <div className="section-title">Recent Transactions</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("transactions")}>View All →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Merchant</th><th>Category</th><th>Account</th><th>Date</th>
                <th style={{textAlign:"right"}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {safeTransactions.slice(0, 6).map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{width:28,height:28,borderRadius:8,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
                        {CATEGORY_ICONS[t.category] || "💳"}
                      </div>
                      <span style={{fontSize:13,fontWeight:500}}>{t.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{t.category}</span></td>
                  <td className="text-muted text-sm">{t.account}</td>
                  <td className="text-muted text-sm">{t.date}</td>
                  <td style={{textAlign:"right"}} className={t.amount > 0 ? "text-green font-bold" : "font-bold"}>
                    {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
                  </td>
                </tr>
              ))}
              {safeTransactions.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state"><div className="icon">📭</div><p className="text-sm">No transactions yet. Connect your bank to get started.</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BudgetPage({ modeConfig, budgets = [] }) {
  const totalLimit = budgets.reduce((s, b) => s + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const suggestions = modeConfig?.budgetSuggestions || [];
  return (
    <div>
      {/* Mode suggestions banner */}
      {suggestions.length > 0 && (
        <div className="card mb-4" style={{padding:"12px 16px",background:modeConfig.bg,border:`1px solid ${modeConfig.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <span>{modeConfig.icon}</span>
            <span style={{fontSize:12,fontWeight:700,color:modeConfig.color}}>{modeConfig.label} Mode — Budget Suggestions</span>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {suggestions.map((s,i) => (
              <div key={i} style={{fontSize:11,padding:"5px 10px",borderRadius:8,
                background: s.action==="cut"?"rgba(244,63,94,0.12)":s.action==="leverage"?"rgba(163,230,53,0.12)":"rgba(79,142,247,0.08)",
                color: s.action==="cut"?"#f87171":s.action==="leverage"?"#a3e635":"var(--text2)",
                border:`1px solid ${s.action==="cut"?"rgba(244,63,94,0.2)":s.action==="leverage"?"rgba(163,230,53,0.2)":"var(--border)"}`,
              }}>
                <b>{s.category}:</b> {s.msg}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid-3 mb-4">
        <div className="card">
          <div className="card-title">Total Budget</div>
          <div className="card-value">{fmt(totalLimit)}</div>
          <div className="card-sub">Monthly limit</div>
        </div>
        <div className="card">
          <div className="card-title">Spent So Far</div>
          <div className="card-value">{fmt(totalSpent)}</div>
          <div className="progress-bar" style={{marginTop:8}}>
            <div className="progress-fill" style={{width:`${Math.round(totalSpent/totalLimit*100)}%`, background:"var(--accent)"}} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Remaining</div>
          <div className="card-value text-green">{fmt(totalLimit - totalSpent)}</div>
          <div className="card-sub">{Math.round((totalLimit - totalSpent) / totalLimit * 100)}% of budget left</div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">Category Budgets</div>
          <button className="btn btn-primary btn-sm">+ Add Category</button>
        </div>
        {budgets.length === 0 ? <div className="empty-state"><div className="icon">📭</div><p className="text-sm">No budget categories yet. Create your first budget.</p></div> : budgets.map(b => {
          const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const remaining = b.limit - b.spent;
          const over = remaining < 0;
          return (
            <div key={b.category} style={{marginBottom:20}}>
              <div className="flex justify-between items-center" style={{marginBottom:6}}>
                <div className="flex items-center gap-2">
                  <div style={{width:32,height:32,borderRadius:8,background:b.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
                    {CATEGORY_ICONS[b.category]}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600}}>{b.category}</div>
                    <div className="text-xs text-muted">{fmt(b.spent)} spent of {fmt(b.limit)}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:600}} className={over?"text-red":"text-green"}>
                    {over ? "Over by " : ""}{fmt(Math.abs(remaining))}
                  </div>
                  <div className="text-xs text-muted">{pct}% used</div>
                </div>
              </div>
              <div className="progress-bar" style={{height:8}}>
                <div className="progress-fill" style={{
                  width:`${pct}%`,
                  background: over ? "var(--red)" : pct > 80 ? "var(--yellow)" : b.color
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TransactionsPage({ transactions = [] }) {
  const safeTransactions = ensureArray(transactions, []);
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Income", "Groceries", "Dining", "Transport", "Shopping", "Entertainment", "Health"];
  const filtered = filter === "All" ? safeTransactions : safeTransactions.filter(t => t.category === filter);

  return (
    <div>
      <div className="card mb-4" style={{padding:"12px 16px"}}>
        <div className="flex items-center gap-3" style={{flexWrap:"wrap"}}>
          <span className="text-sm text-muted">Filter:</span>
          {categories.map(c => (
            <button key={c} className={`tab ${filter === c ? "active" : ""}`}
              style={{padding:"5px 12px",borderRadius:7,fontSize:12,cursor:"pointer",border:"none",background:filter===c?"var(--bg2)":"transparent",color:filter===c?"var(--text)":"var(--text2)"}}
              onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">{filtered.length} Transactions</div>
          <button className="btn btn-ghost btn-sm">⬇ Export CSV</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Account</th>
                <th>Date</th>
                <th style={{textAlign:"right"}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{width:32,height:32,borderRadius:9,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                        {CATEGORY_ICONS[t.category] || "💳"}
                      </div>
                      <span style={{fontWeight:500}}>{t.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{t.category}</span></td>
                  <td className="text-muted text-sm">{t.account}</td>
                  <td className="text-muted text-sm">{t.date}</td>
                  <td style={{textAlign:"right",fontWeight:600}} className={t.amount > 0 ? "text-green" : ""}>
                    {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
                  </td>
                </tr>
              ))}
            {filtered.length===0 && <tr><td colSpan="5"><EmptyState message="No transactions yet. Connect your bank to get started." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const unpaid = bills.filter(b => !b.paid);
  const paid = bills.filter(b => b.paid);
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);
  const totalPaid = paid.reduce((s, b) => s + b.amount, 0);

  // Load from API on mount; fallback to MOCK if backend not connected
  useEffect(() => {
    setLoading(true);
    billsApi.list().then(data => { if (data) setBills(data); }).catch(() => setError(FRIENDLY_ERRORS.bills)).finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    const bill = bills.find(b => b.id === id);
    const updated = { ...bill, paid: !bill.paid };
    setBills(bs => bs.map(b => b.id === id ? updated : b));   // optimistic
    try { await billsApi.update(id, { paid: updated.paid }); } catch { setError(FRIENDLY_ERRORS.settings); }
  };

  return (
    <div>
      <div className="grid-3 mb-4">
        <div className="card">
          <div className="card-title">Due This Month</div>
          <div className="card-value text-red">{fmt(totalUnpaid)}</div>
          <div className="card-sub">{unpaid.length} bills remaining</div>
        </div>
        <div className="card">
          <div className="card-title">Paid</div>
          <div className="card-value text-green">{fmt(totalPaid)}</div>
          <div className="card-sub">{paid.length} bills paid</div>
        </div>
        <div className="card">
          <div className="card-title">Autopay Active</div>
          <div className="card-value">{bills.filter(b => b.autopay).length}</div>
          <div className="card-sub">of {bills.length} total bills</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">Upcoming Bills</div>
            <button className="btn btn-primary btn-sm">+ Add Bill</button>
          </div>
          {unpaid.length === 0 ? <div className="empty-state"><div className="icon">📭</div><p className="text-sm">No bills yet. Add your first bill.</p></div> : unpaid.map(b => (
            <div key={b.id} className="bill-item">
              <div className="bill-icon">{CATEGORY_ICONS[b.category] || "💳"}</div>
              <div className="bill-info">
                <div className="bill-name">{b.name}</div>
                <div className="bill-due">Due day {b.dueDay} · {b.autopay ? <span className="badge badge-blue" style={{fontSize:10}}>Autopay</span> : <span className="badge badge-yellow" style={{fontSize:10}}>Manual</span>}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="bill-amount">{fmt(b.amount)}</div>
                <button onClick={() => toggle(b.id)} className="btn btn-ghost btn-sm" style={{marginTop:4,padding:"3px 8px"}}>Mark Paid</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title mb-4">Paid Bills</div>
          {paid.length === 0 ? (
            <div className="empty-state"><div className="icon">✅</div><p className="text-sm">No paid bills yet this month</p></div>
          ) : paid.map(b => (
            <div key={b.id} className="bill-item" style={{opacity:0.6}}>
              <div className="bill-icon">{CATEGORY_ICONS[b.category] || "💳"}</div>
              <div className="bill-info">
                <div className="bill-name">{b.name}</div>
                <div className="bill-due">Paid · Day {b.dueDay}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div className="bill-amount text-muted">{fmt(b.amount)}</div>
                <span className="badge badge-green">✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioPage({ portfolioData = MOCK.portfolio }) {
  const { totalValue, dayChange, dayChangePct, holdings = [], connected } = portfolioData || {};
  return (
    <div>
      <div className="portfolio-placeholder mb-4">
        <div style={{fontSize:32, marginBottom:12}}>🔗</div>
        <h3>Connect Your Brokerage</h3>
        <p style={{fontSize:13, color:"var(--text2)", marginBottom:16, maxWidth:400, margin:"0 auto 16px"}}>
          Sync your Webull, TD Ameritrade, or any SnapTrade-supported brokerage to see your portfolio here in real time.
        </p>
        <div className="flex items-center gap-3" style={{justifyContent:"center", flexWrap:"wrap"}}>
          <button className="btn btn-primary">🔌 Connect via SnapTrade</button>
          <button className="btn btn-ghost">📊 Connect Webull</button>
        </div>
        <p className="text-xs text-muted" style={{marginTop:12}}>Read-only access · Bank-level encryption · Coming Q3 2026</p>
      </div>

      <div className="card mb-4" style={{background:"linear-gradient(135deg, rgba(79,142,247,0.1), rgba(99,102,241,0.05))"}}>
        <div className="card-title">Portfolio Value (Preview)</div>
        <div className="flex items-center gap-3">
          <div className="card-value" style={{fontSize:32}}>{fmt(totalValue)}</div>
          <span className="change-badge pos">↑ {fmt(dayChange)} (+{dayChangePct}%)</span>
        </div>
        <div className="text-xs text-muted" style={{marginTop:4}}>{connected ? "Live portfolio data" : "Preview data — Connect your account for live data"}</div>
      </div>

      <div className="card">
        <div className="section-title mb-4">Holdings Preview</div>
        {holdings.length === 0 ? <div className="empty-state"><div className="icon">📭</div><p className="text-sm">No holdings found.</p></div> : holdings.map(h => (
          <div key={h.ticker} className="ticker-row">
            <div style={{width:36,height:36,borderRadius:10,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--accent)",flexShrink:0}}>{h.ticker}</div>
            <div className="ticker-sym" style={{marginLeft:10}}>{h.ticker}</div>
            <div className="ticker-name">{h.name}</div>
            <div className="ticker-shares text-muted">{h.shares} shares</div>
            <div className="ticker-value">{fmt(h.value)}</div>
            <div className={`ticker-change ${h.change >= 0 ? "pos" : "neg"}`}>{h.change >= 0 ? "+" : ""}{h.change}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AICoachPage({ modeConfig }) {
  const [messages, setMessages] = useState(MOCK.aiMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = [
    "How can I save more each month?",
    "Am I on track for my goals?",
    "Where am I overspending?",
    "Analyze my budget",
  ];

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Calls /api/ai/chat — Anthropic key stays server-side
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const result  = await aiApi.chat(text, history, modeConfig?.id);
      const reply   = result?.reply || null;

      if (reply) {
        setMessages(m => [...m, { role: "assistant", content: reply }]);
      } else {
        // Fallback: direct Anthropic call (demo mode — no backend)
        const context = `You are WealthPilot AI, a personal finance coach. The user's name is ${MOCK.user.name}.
Monthly income: $${MOCK.income}. Monthly spending: $${MOCK.spending}. Safe to spend: $${Math.round(safeToSpend())}.
Top spending categories: ${MOCK.budget.map(b => `${b.category}: $${b.spent}/$${b.limit}`).join(", ")}.
Upcoming bills total: $${MOCK.bills.filter(b=>!b.paid).reduce((s,b)=>s+b.amount,0).toFixed(0)}.
${modeConfig ? `\nUSER FINANCIAL MODE: ${modeConfig.label.toUpperCase()}\n${modeConfig.aiInstructions}` : ""}
Be concise, specific. Use emojis sparingly.`;
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514", max_tokens: 1000,
            system: context,
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
          })
        });
        const data = await res.json();
        const fallbackReply = data.content?.[0]?.text || "I'm having trouble connecting. Please try again.";
        setMessages(m => [...m, { role: "assistant", content: fallbackReply }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: FRIENDLY_ERRORS.ai }]);
    }
    setLoading(false);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 68px)"}}>
      <div style={{padding:"12px 20px 0", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
        <div className="ai-badge"><div className="ai-dot" />AI Coach · Powered by Claude</div>
        <span className="text-xs text-muted">Your finances are analyzed in real time</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-avatar">{m.role === "assistant" ? "🤖" : "👤"}</div>
            <div className="msg-bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="msg assistant">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble" style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"pulse 1s infinite"}} />
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"pulse 1s 0.2s infinite"}} />
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"pulse 1s 0.4s infinite"}} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{padding:"0 20px 12px",display:"flex",gap:8,flexWrap:"wrap"}}>
          {suggestions.map(s => (
            <button key={s} className="btn btn-ghost btn-sm" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-input-wrap">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask your AI coach anything about your finances..." />
        <button className="btn btn-primary" onClick={() => send(input)} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

// ─── PLAID CONNECT HOOK ───────────────────────────────────────────────────────
// Uses Plaid's CDN script — no npm package needed.
// In a Next.js project replace with: import { usePlaidLink } from 'react-plaid-link'
function usePlaidConnect({ onSuccess, onExit }) {
  const [linkToken, setLinkToken]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [connected, setConnected]   = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [accounts, setAccounts]     = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const ensurePlaidScript = useCallback(() => new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Plaid unavailable"));
    if (window.Plaid?.create) return resolve(window.Plaid);
    const existing = document.querySelector('script[data-plaid-link="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Plaid), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Plaid Link")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.dataset.plaidLink = "true";
    script.onload = () => resolve(window.Plaid);
    script.onerror = () => reject(new Error("Failed to load Plaid Link"));
    document.body.appendChild(script);
  }), []);

  // Load link token from backend
  const fetchLinkToken = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await plaidApi.getLinkToken();
      if (!data?.link_token) throw new Error("Missing Plaid link token");
      setLinkToken(data.link_token);
    } catch (e) {
      setError(FRIENDLY_ERRORS.plaidConnect);
    } finally { setLoading(false); }
  }, []);

  const open = useCallback(async () => {
    if (!linkToken) return;
    setLoading(true); setError(null);
    try {
      await ensurePlaidScript();
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
          try {
            await onSuccess?.(publicToken, metadata);
            const syncedAccounts = await plaidApi.sync();
            setAccounts(Array.isArray(syncedAccounts?.accounts) ? syncedAccounts.accounts : accounts);
            setConnected(true);
            setLastSyncedAt(new Date());
          } catch (e) {
            setError(e.message || "Could not complete bank connection");
          } finally {
            setLoading(false);
          }
        },
        onExit: (err, metadata) => {
          if (err?.display_message || err?.error_message) setError(err.display_message || err.error_message);
          setLoading(false);
          onExit?.(err, metadata);
        },
      });
      handler.open();
    } catch (e) {
      setError(e.message || "Failed to open Plaid Link");
      setLoading(false);
    }
  }, [accounts, ensurePlaidScript, linkToken, onExit, onSuccess]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const data = await plaidApi.sync();
      if (Array.isArray(data?.accounts)) setAccounts(data.accounts);
      setLastSyncedAt(new Date());
      setConnected(true);
      setError(null);
      return data;
    } catch (e) {
      setError(e.message || "Failed to sync accounts");
      throw e;
    } finally { setSyncing(false); }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setLinkToken(null);
    setAccounts([]);
    setLastSyncedAt(null);
  }, []);

  return { linkToken, loading, error, connected, syncing, accounts, lastSyncedAt, fetchLinkToken, open, sync, disconnect };
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ addToast, user }) {
  const [toggles, setToggles] = useState({
    notifications: true,
    autopay: true,
    weeklyReport: true,
    twoFactor: false,
    saveChatHistory: true,
    dailyAiSummary: true,
    weeklyAiReview: true,
    billReminders: true,
    lowBalanceAlerts: true,
    overspendingAlerts: true,
    largeTransactionAlerts: true,
    portfolioAlerts: true,
    weeklySummaryEmail: true,
    autoCategorize: true,
    rolloverBudget: false,
    privacyMode: false,
    darkMode: true,
    compactMode: false,
    hideNetWorthWidget: false,
    hideBudgetWidget: false,
    hidePortfolioWidget: false,
  });

  const [form, setForm] = useState({
    fullName: MOCK.user.name,
    email: MOCK.user.email,
    password: '••••••••',
    monthlyIncome: '7200',
    paySchedule: 'Biweekly',
    financialGoal: 'Build emergency fund',
    riskTolerance: 'Moderate',
    financialMode: 'Balanced Growth',
    emergencyFundTarget: '10000',
    aiTone: 'Balanced',
    adviceDepth: 'Detailed',
    budgetResetDay: '1',
    spendingSensitivity: 'Medium',
    budgetMethod: '50/30/20',
    sessionTimeout: '30 minutes',
    accentColor: 'Electric Blue',
    currentPlan: MOCK.user.plan,
  });

  const toggle = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));
  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const plaid = usePlaidConnect({
    onSuccess: async () => {
      addToast && addToast('Bank connected successfully!', 'success');
    },
    onExit: () => {},
  });

  useEffect(() => { plaid.fetchLinkToken(); }, []);

  const handlePlaidConnect = () => {
    if (!plaid.linkToken) { plaid.fetchLinkToken(); return; }
    plaid.open();
  };

  const handleSync = async () => {
    try {
      await plaid.sync();
      addToast && addToast("Accounts synced ✓", "success");
    } catch {
      addToast && addToast(FRIENDLY_ERRORS.plaidSync, "error");
    }
  };

  const renderToggleRow = (key, label, desc) => (
    <div key={key} className="setting-row">
      <div>
        <div className="setting-label">{label}</div>
        <div className="setting-desc">{desc}</div>
      </div>
      <div className={`toggle ${toggles[key] ? 'on' : ''}`} onClick={() => toggle(key)} />
    </div>
  );

  const renderSelectRow = (label, desc, key, options) => (
    <div className="setting-row" key={key}>
      <div style={{flex:1}}>
        <div className="setting-label">{label}</div>
        <div className="setting-desc">{desc}</div>
      </div>
      <select
        value={form[key]}
        onChange={(e) => updateField(key, e.target.value)}
        style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,minWidth:150}}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div className="grid-2" style={{alignItems:'start'}}>
        <div>
          <div className="card settings-section">
            <h3>1. Account</h3>
            {[
              ['Full name','Manage your legal account name','fullName'],
              ['Email','Used for login and billing updates','email'],
              ['Password','Update your account password','password'],
            ].map(([label,desc,key]) => (
              <div className="setting-row" key={key}>
                <div style={{flex:1}}><div className="setting-label">{label}</div><div className="setting-desc">{desc}</div></div>
                <input value={form[key]} onChange={(e)=>updateField(key,e.target.value)} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,minWidth:170}} />
              </div>
            ))}
            {renderToggleRow('twoFactor','Two-factor auth','Require a verification step at login.')}
            <button className="btn btn-danger btn-sm" style={{marginTop:8}}>Delete Account</button>
          </div>

          <div className="card settings-section">
            <h3>2. Financial Profile</h3>
            <div className="setting-row"><div><div className="setting-label">Monthly income</div><div className="setting-desc">Net monthly household income.</div></div><input value={form.monthlyIncome} onChange={(e)=>updateField('monthlyIncome', e.target.value)} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,width:120}} /></div>
            {renderSelectRow('Pay schedule','How often your primary paycheck arrives.','paySchedule',['Weekly','Biweekly','Semi-monthly','Monthly'])}
            {renderSelectRow('Main financial goal','Primary objective for recommendations.','financialGoal',['Build emergency fund','Pay down debt','Grow investments','Save for home'])}
            {renderSelectRow('Risk tolerance','Used for portfolio and cash flow suggestions.','riskTolerance',['Conservative','Moderate','Aggressive'])}
            {renderSelectRow('Financial mode selector','Controls AI strategy and spending posture.','financialMode',['Conservative Defense','Balanced Growth','Aggressive Acceleration'])}
            <div className="setting-row"><div><div className="setting-label">Emergency fund target</div><div className="setting-desc">Recommended 3-6 months of expenses.</div></div><input value={form.emergencyFundTarget} onChange={(e)=>updateField('emergencyFundTarget',e.target.value)} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,width:120}} /></div>
          </div>

          <div className="card settings-section">
            <h3>3. Connected Accounts</h3>
            <div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Plaid Bank Connection</div>
            <div className="mb-4">{/* keep plaid card working */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h3 style={{fontFamily:'Syne',fontWeight:700,fontSize:15}}>🏦 Bank Accounts</h3>
                {plaid.connected && <div style={{display:'flex',gap:8}}><button className="btn btn-ghost btn-sm" onClick={handleSync} disabled={plaid.syncing}>{plaid.syncing ? 'Syncing…' : 'Sync now'}</button><button className="btn btn-danger btn-sm" onClick={plaid.disconnect}>Disconnect account</button></div>}
              </div>
              {!plaid.connected ? <button className="btn btn-primary" onClick={handlePlaidConnect} disabled={plaid.loading} style={{width:'100%',justifyContent:'center'}}>{plaid.loading ? 'Initializing…' : 'Connect with Plaid'}</button> : <>{plaid.accounts.map(a => <div key={a.id} className="integration-card" style={{marginBottom:8}}><div className="int-icon">{a.type === 'checking' ? '🏦' : a.type === 'savings' ? '💰' : '💳'}</div><div className="int-info"><div className="int-name">{a.name}</div><div className="int-status">{a.institution} · ••••{a.last4}</div></div><div style={{fontFamily:'Syne',fontWeight:700,fontSize:14}}>{fmt(a.balance)}</div></div>)}</>}
            </div>
            <div className="integration-card"><div className="int-icon">📊</div><div className="int-info"><div className="int-name">Webull / SnapTrade</div><div className="int-status">Brokerage sync placeholder</div></div><span className="badge badge-yellow">Coming soon</span></div>
          </div>

          <div className="card settings-section">
            <h3>4. AI Coach Preferences</h3>
            {renderSelectRow('AI tone','Voice and accountability style.','aiTone',['Strict','Balanced','Encouraging'])}
            {renderSelectRow('Advice depth','Complexity level for insights.','adviceDepth',['Simple','Detailed','Advanced'])}
            {renderToggleRow('saveChatHistory','Save chat history','Store prior AI conversations for context.')}
            {renderToggleRow('dailyAiSummary','Daily AI summary','Deliver a quick daily financial briefing.')}
            {renderToggleRow('weeklyAiReview','Weekly AI review','Receive a weekly strategy recap every Sunday.')}
          </div>

          <div className="card settings-section">
            <h3>5. Notifications</h3>
            {renderToggleRow('billReminders','Bill due reminders','Remind you before due dates.')}
            {renderToggleRow('lowBalanceAlerts','Low balance alerts','Alert when account balances fall below threshold.')}
            {renderToggleRow('overspendingAlerts','Overspending alerts','Detect category and monthly budget overages.')}
            {renderToggleRow('largeTransactionAlerts','Large transaction alerts','Flag unusual high-value spending events.')}
            {renderToggleRow('portfolioAlerts','Portfolio alerts','Notify on significant market movement.')}
            {renderToggleRow('weeklySummaryEmail','Weekly summary email','Send your full weekly financial digest.')}
          </div>
        </div>

        <div>
          <div className="card settings-section">
            <h3>6. Budget Preferences</h3>
            <div className="setting-row"><div><div className="setting-label">Monthly budget reset day</div><div className="setting-desc">Calendar day to reset budget tracking.</div></div><input value={form.budgetResetDay} onChange={(e)=>updateField('budgetResetDay',e.target.value)} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,width:70}} /></div>
            {renderToggleRow('autoCategorize','Auto-categorize transactions','Apply smart categories to new transactions.')}
            {renderToggleRow('rolloverBudget','Rollover unused budget','Carry remaining funds into next month.')}
            {renderSelectRow('Spending alert sensitivity','Threshold level for spend warnings.','spendingSensitivity',['Low','Medium','High'])}
            {renderSelectRow('Budget method selector','Framework for allocations.','budgetMethod',['50/30/20','Zero-based','Envelope','Pay Yourself First'])}
          </div>

          <div className="card settings-section">
            <h3>7. Privacy & Security</h3>
            {renderToggleRow('privacyMode','Privacy mode / hide balances','Mask balances and sensitive amounts on screen.')}
            {renderSelectRow('Session timeout selector','Auto sign-out period when inactive.','sessionTimeout',['15 minutes','30 minutes','1 hour','4 hours'])}
            <div className="setting-row"><div><div className="setting-label">Export my data</div><div className="setting-desc">Download your account records as CSV/JSON.</div></div><button className="btn btn-ghost btn-sm">Export</button></div>
            <div className="setting-row"><div><div className="setting-label">Delete my data</div><div className="setting-desc">Permanently remove stored financial profile data.</div></div><button className="btn btn-danger btn-sm">Delete Data</button></div>
            <div className="setting-row"><div><div className="setting-label">Connected data permissions</div><div className="setting-desc">Review what data each integration can access.</div></div><button className="btn btn-ghost btn-sm">Review</button></div>
          </div>

          <div className="card settings-section">
            <h3>8. Appearance</h3>
            {renderToggleRow('darkMode','Dark mode toggle','Premium low-glare experience for night usage.')}
            {renderSelectRow('Accent color selector','Set your interface highlight color.','accentColor',['Electric Blue','Emerald','Violet','Rose'])}
            {renderToggleRow('compactMode','Compact mode toggle','Reduce spacing to fit more content.')}
            {renderToggleRow('hideNetWorthWidget','Show/hide dashboard widgets · Net Worth','Control Net Worth card visibility.')}
            {renderToggleRow('hideBudgetWidget','Show/hide dashboard widgets · Budget','Control Budget card visibility.')}
            {renderToggleRow('hidePortfolioWidget','Show/hide dashboard widgets · Portfolio','Control Portfolio card visibility.')}
          </div>

          <div className="card settings-section">
            <h3>9. Billing</h3>
            <div className="setting-row"><div><div className="setting-label">Current plan</div><div className="setting-desc">{form.currentPlan} · $9.99 / month</div></div><span className="badge badge-green">Active</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}><button className="btn btn-primary btn-sm">Upgrade</button><button className="btn btn-ghost btn-sm">Manage Subscription</button><button className="btn btn-danger btn-sm">Cancel Subscription</button></div>
            <div style={{marginTop:14,padding:12,border:'1px dashed var(--border2)',borderRadius:12,color:'var(--text2)',fontSize:12}}>Billing history placeholder · Invoice download and payment history will appear here.</div>
          </div>
        </div>

        <div className="card" style={{marginTop:16}}>
          <h3 style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:14}}>Legal & Support</h3>
          <div style={{display:"grid",gap:8}}>
            {[
              { href:"/privacy", label:"Privacy Policy" },
              { href:"/terms", label:"Terms of Use" },
              { href:"/disclaimer", label:"Disclaimer" },
              { href:"/contact", label:"Contact Support" },
              { href:"/delete-account", label:"Delete Account" },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color:"#cbd5e1",
                  textDecoration:"none",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:10,
                  padding:"10px 12px",
                  background:"#111318",
                  display:"flex",
                  justifyContent:"space-between",
                }}
              >
                <span>{link.label}</span>
                <span style={{color:"#4f8ef7"}}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CALENDAR DATA & HELPERS ──────────────────────────────────────────────────
const EVENT_TYPES = ["bill","subscription","income","debt","transfer","savings","reminder","tax","milestone","portfolio"];
const TYPE_COLORS = {
  bill:"#f43f5e", subscription:"#8b5cf6", income:"#10b981", debt:"#f97316",
  transfer:"#4f8ef7", savings:"#f59e0b", reminder:"#64748b",
  tax:"#e879f9", milestone:"#38bdf8", portfolio:"#a3e635",
};
const TYPE_ICONS = {
  bill:"🏠", subscription:"🔄", income:"💵", debt:"💳",
  transfer:"📤", savings:"🏦", reminder:"🔔",
  tax:"🧾", milestone:"🏆", portfolio:"📈",
};

const INIT_EVENTS = [
  // Bills
  { id:1,  title:"Rent",                amount:1850,  type:"bill",         dueDate:"2026-05-01", status:"paid",     autopay:true,  recurring:"monthly",  notes:"" },
  { id:4,  title:"Electric Bill",       amount:112,   type:"bill",         dueDate:"2026-05-18", status:"upcoming", autopay:false, recurring:"monthly",  notes:"" },
  { id:7,  title:"Car Insurance",       amount:188,   type:"bill",         dueDate:"2026-05-25", status:"upcoming", autopay:false, recurring:"monthly",  notes:"" },
  { id:8,  title:"Internet",            amount:79.99, type:"bill",         dueDate:"2026-05-20", status:"upcoming", autopay:true,  recurring:"monthly",  notes:"" },
  // Subscriptions
  { id:2,  title:"Netflix",             amount:15.99, type:"subscription", dueDate:"2026-05-12", status:"upcoming", autopay:true,  recurring:"monthly",  notes:"" },
  { id:3,  title:"Spotify",             amount:9.99,  type:"subscription", dueDate:"2026-05-14", status:"upcoming", autopay:true,  recurring:"monthly",  notes:"" },
  { id:9,  title:"Gym",                 amount:45,    type:"subscription", dueDate:"2026-05-28", status:"upcoming", autopay:true,  recurring:"monthly",  notes:"" },
  // Income / Paydays
  { id:5,  title:"Paycheck",            amount:3600,  type:"income",       dueDate:"2026-05-07", status:"paid",     autopay:false, recurring:"biweekly", notes:"Employer direct deposit" },
  { id:6,  title:"Paycheck",            amount:3600,  type:"income",       dueDate:"2026-05-21", status:"upcoming", autopay:false, recurring:"biweekly", notes:"Employer direct deposit" },
  // Debt
  { id:12, title:"Student Loan",        amount:220,   type:"debt",         dueDate:"2026-05-09", status:"overdue",  autopay:false, recurring:"monthly",  notes:"" },
  { id:13, title:"Car Loan Payment",    amount:350,   type:"debt",         dueDate:"2026-05-15", status:"upcoming", autopay:true,  recurring:"monthly",  notes:"" },
  // Transfer / Funding
  { id:10, title:"Webull Deposit",      amount:500,   type:"transfer",     dueDate:"2026-05-15", status:"upcoming", autopay:false, recurring:"none",     notes:"Monthly investing" },
  // Savings
  { id:11, title:"Emergency Fund",      amount:300,   type:"savings",      dueDate:"2026-05-30", status:"upcoming", autopay:false, recurring:"monthly",  notes:"Auto-transfer to savings" },
  // Tax reminders
  { id:14, title:"Q2 Estimated Tax",    amount:1200,  type:"tax",          dueDate:"2026-06-15", status:"upcoming", autopay:false, recurring:"yearly",   notes:"IRS Form 1040-ES" },
  { id:15, title:"Tax Return Filing",   amount:0,     type:"tax",          dueDate:"2026-04-15", status:"paid",     autopay:false, recurring:"yearly",   notes:"Federal + State" },
  // Milestones
  { id:16, title:"Emergency Fund Goal", amount:10000, type:"milestone",    dueDate:"2026-12-01", status:"upcoming", autopay:false, recurring:"none",     notes:"Reach $10k savings target" },
  { id:17, title:"Car Loan Payoff",     amount:8200,  type:"milestone",    dueDate:"2027-01-01", status:"upcoming", autopay:false, recurring:"none",     notes:"Final debt-free date" },
  { id:18, title:"Credit Score 750",    amount:0,     type:"milestone",    dueDate:"2026-09-01", status:"upcoming", autopay:false, recurring:"none",     notes:"Target: Very Good range" },
  // Portfolio events
  { id:19, title:"Rebalance Portfolio", amount:0,     type:"portfolio",    dueDate:"2026-06-30", status:"upcoming", autopay:false, recurring:"yearly",   notes:"Annual rebalance check" },
  { id:20, title:"Dividend — VTI",      amount:124,   type:"portfolio",    dueDate:"2026-06-20", status:"upcoming", autopay:false, recurring:"yearly",   notes:"Estimated Q2 dividend" },
  // Funding milestones
  { id:21, title:"Down Payment: 25%",   amount:12500, type:"milestone",    dueDate:"2026-08-01", status:"upcoming", autopay:false, recurring:"none",     notes:"25% of $50k home goal" },
];

// New helper: flat sorted list for timeline view, filtered by type
const getTimelineEvents = (events, filterTypes, yr, mo, rangeMonths=3) => {
  const start = new Date(yr, mo, 1);
  const end   = new Date(yr, mo + rangeMonths, 0);
  return events
    .filter(e => {
      const d = new Date(e.dueDate);
      return d >= start && d <= end &&
        (filterTypes.length === 0 || filterTypes.includes(e.type));
    })
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
};

const groupEventsByDate = (events) => events.reduce((acc, e) => { acc[e.dueDate] = [...(acc[e.dueDate]||[]), e]; return acc; }, {});
const calculateMonthlyDue = (events, yr, mo) => events.filter(e => { const d=new Date(e.dueDate); return d.getFullYear()===yr&&d.getMonth()===mo&&e.type!=="income"; }).reduce((s,e)=>s+e.amount,0);
const getUpcomingBills = (events, days=7) => { const now=new Date(),lim=new Date(now); lim.setDate(lim.getDate()+days); return events.filter(e=>{ const d=new Date(e.dueDate); return d>=now&&d<=lim&&e.status!=="paid"; }); };
const getOverdueBills  = (events) => { const now=new Date(); return events.filter(e=>e.status==="overdue"||(new Date(e.dueDate)<now&&e.status==="upcoming"&&e.type!=="income")); };

const DAYS_HDR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_LBL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const toISO = (d) => d.toISOString().split("T")[0];

function buildCalendarDays(yr, mo) {
  const first=new Date(yr,mo,1).getDay(), total=new Date(yr,mo+1,0).getDate(), prev=new Date(yr,mo,0).getDate();
  const cells=[];
  for(let i=first-1;i>=0;i--) cells.push({day:prev-i,cur:false,date:new Date(yr,mo-1,prev-i)});
  for(let d=1;d<=total;d++) cells.push({day:d,cur:true,date:new Date(yr,mo,d)});
  const rem=42-cells.length;
  for(let d=1;d<=rem;d++) cells.push({day:d,cur:false,date:new Date(yr,mo+1,d)});
  return cells;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t=>(
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── CALENDAR PAGE ────────────────────────────────────────────────────────────

function CalendarPage({ addToast }) {
  const now = new Date();
  const [yr, setYr]         = useState(now.getFullYear());
  const [mo, setMo]         = useState(now.getMonth());
  const [events, setEvents] = useState(INIT_EVENTS);
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode]     = useState("calendar");
  const [activeFilters, setFilters] = useState([]);
  const BLANK = { title:"", amount:"", type:"bill", dueDate:toISO(now), status:"upcoming", autopay:false, recurring:"monthly", notes:"" };
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    calApi.list(mo + 1, yr).then(d => { if (d) setEvents(d); }).catch(() => setError(FRIENDLY_ERRORS.calendar)).finally(() => setLoading(false));
  }, [mo, yr]);

  const todayISO = toISO(now);
  const cells    = buildCalendarDays(yr, mo);

  const visibleEvents = activeFilters.length === 0 ? events : events.filter(e => activeFilters.includes(e.type));
  const byDate        = groupEventsByDate(visibleEvents);
  const monthDue      = calculateMonthlyDue(visibleEvents, yr, mo);
  const monthPaid     = visibleEvents.filter(e=>{ const d=new Date(e.dueDate); return d.getFullYear()===yr&&d.getMonth()===mo&&e.status==="paid"&&e.type!=="income"; }).reduce((s,e)=>s+e.amount,0);
  const upcoming7     = getUpcomingBills(visibleEvents);
  const overdue       = getOverdueBills(visibleEvents);
  const monthIncome   = visibleEvents.filter(e=>{ const d=new Date(e.dueDate); return d.getFullYear()===yr&&d.getMonth()===mo&&e.type==="income"; }).reduce((s,e)=>s+e.amount,0);
  const timelineEvents = getTimelineEvents(events, activeFilters, yr, mo, 3);
  const timelineByDate = timelineEvents.reduce((acc,e)=>{ acc[e.dueDate]=[...(acc[e.dueDate]||[]),e]; return acc; }, {});
  const timelineDates  = Object.keys(timelineByDate).sort();

  const prevMonth  = () => mo===0 ? (setMo(11),setYr(y=>y-1)) : setMo(m=>m-1);
  const nextMonth  = () => mo===11 ? (setMo(0),setYr(y=>y+1)) : setMo(m=>m+1);
  const openAdd    = (iso) => { setForm({...BLANK,dueDate:iso||todayISO}); setDrawer("add"); };
  const openEdit   = (ev)  => { setEditing(ev); setForm({...ev,amount:String(ev.amount)}); setDrawer("edit"); };
  const toggleFilter = (t) => setFilters(f => f.includes(t) ? f.filter(x=>x!==t) : [...f,t]);

  const saveEvent = async () => {
    if (!form.title.trim()) return;
    const ev = {...form, amount:parseFloat(form.amount)||0};
    if (drawer==="edit") {
      setEvents(es=>es.map(e=>e.id===editing.id?{...ev,id:editing.id}:e));
      try { await calApi.update(editing.id, ev); } catch {}
      addToast&&addToast("Event updated","success");
    } else {
      const tid = Date.now();
      setEvents(es=>[...es,{...ev,id:tid}]);
      try { const s=await calApi.create(ev); if(s?.id) setEvents(es=>es.map(e=>e.id===tid?s:e)); } catch {}
      addToast&&addToast("Event added","success");
    }
    setDrawer(null);
  };

  const deleteEvent = async (id) => {
    setEvents(es=>es.filter(e=>e.id!==id));
    try { await calApi.remove(id); } catch {}
    addToast&&addToast("Deleted","info"); setDrawer(null);
  };

  const markPaid = async (id) => {
    setEvents(es=>es.map(e=>e.id===id?{...e,status:"paid"}:e));
    try { await calApi.update(id,{status:"paid"}); } catch {}
    addToast&&addToast("Marked paid ✓","success");
  };

  // VOICE HOOK STUB — wire to Web Speech API or ElevenLabs when ready
  // const handleVoiceAdd = () => {
  //   const r = new window.webkitSpeechRecognition();
  //   r.onresult = (e) => parseVoiceEvent(e.results[0][0].transcript);
  //   r.start();
  // };

  const selectedEvents = selected ? (byDate[selected]||[]) : [];

  if (loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {error && <ErrorNotice message={error} />}
      {/* Summary Cards */}
      <div className="grid-4 mb-4" style={{gap:12}}>
        {[
          {label:"Due This Month",  val:fmt(monthDue),  sub:"total obligations",            color:"var(--red)"},
          {label:"Paid This Month", val:fmt(monthPaid), sub:`${fmt(monthIncome)} income`,   color:"var(--green)"},
          {label:"Next 7 Days",     val:fmt(upcoming7.reduce((s,e)=>s+e.amount,0)), sub:`${upcoming7.length} upcoming`, color:"var(--accent)"},
          {label:"Overdue",         val:fmt(overdue.reduce((s,e)=>s+e.amount,0)),   sub:`${overdue.length} items`,      color:"var(--yellow)"},
        ].map(c=>(
          <div key={c.label} className="card" style={{borderLeft:`3px solid ${c.color}`,padding:"14px 16px"}}>
            <div className="card-title">{c.label}</div>
            <div className="card-value" style={{fontSize:20,color:c.color}}>{c.val}</div>
            <div className="card-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card mb-4" style={{padding:"10px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div className="tab-group" style={{marginRight:4,flexShrink:0}}>
            <div className={`tab ${viewMode==="calendar"?"active":""}`} onClick={()=>setViewMode("calendar")}>📅 Calendar</div>
            <div className={`tab ${viewMode==="timeline"?"active":""}`} onClick={()=>setViewMode("timeline")}>📋 Timeline</div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",flex:1}}>
            {EVENT_TYPES.map(t=>{
              const on = activeFilters.includes(t);
              return (
                <button key={t} onClick={()=>toggleFilter(t)} style={{
                  padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:600,cursor:"pointer",
                  border:`1px solid ${on?TYPE_COLORS[t]:"var(--border2)"}`,
                  background:on?`${TYPE_COLORS[t]}20`:"transparent",
                  color:on?TYPE_COLORS[t]:"var(--text3)",transition:"all 0.12s",
                }}>
                  {TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              );
            })}
            {activeFilters.length>0 && (
              <button onClick={()=>setFilters([])} style={{padding:"3px 9px",borderRadius:99,fontSize:11,cursor:"pointer",background:"transparent",border:"1px solid var(--border)",color:"var(--text3)"}}>
                ✕ Clear
              </button>
            )}
          </div>
          {/* <button className="btn btn-ghost btn-sm" onClick={handleVoiceAdd} title="Voice add">🎙️</button> */}
          <button className="btn btn-primary btn-sm" style={{flexShrink:0}} onClick={()=>openAdd(todayISO)}>+ Quick Add</button>
        </div>
      </div>

      {/* ── CALENDAR VIEW ── */}
      {viewMode==="calendar" && (
        <div className="cal-layout" style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,alignItems:"start"}}>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:17}}>{MONTHS_LBL[mo]} {yr}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setYr(now.getFullYear());setMo(now.getMonth());}}>Today</button>
                <button className="cal-nav-btn" onClick={nextMonth}>›</button>
              </div>
            </div>
            <div className="cal-grid">
              {DAYS_HDR.map(d=><div key={d} className="cal-day-header">{d}</div>)}
              {cells.map((c,i)=>{
                const iso=toISO(c.date), dayEvs=byDate[iso]||[];
                return (
                  <div key={i} className={`cal-cell${!c.cur?" other-month":""}${iso===todayISO?" today":""}${iso===selected?" selected":""}`}
                    onClick={()=>{setSelected(iso);setDrawer("view");}}>
                    <div className="cal-date">{c.day}</div>
                    {dayEvs.slice(0,3).map(e=>(
                      <div key={e.id} className={`cal-event ${e.type}${e.status==="paid"?" paid":""}`}
                        onClick={ev=>{ev.stopPropagation();openEdit(e);}}>
                        {TYPE_ICONS[e.type]} {e.title}{e.amount>0?` $${e.amount}`:""}
                      </div>
                    ))}
                    {dayEvs.length>3&&<div style={{fontSize:9,color:"var(--text3)",paddingLeft:2}}>+{dayEvs.length-3}</div>}
                    <div className="cal-dot-wrap">
                      {dayEvs.slice(0,4).map(e=><div key={e.id} className="cal-dot" style={{background:TYPE_COLORS[e.type]}}/>)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"10px 16px",borderTop:"1px solid var(--border)",display:"flex",flexWrap:"wrap",gap:8}}>
              {EVENT_TYPES.map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div className="legend-dot" style={{background:TYPE_COLORS[t]}}/>
                  <span style={{fontSize:10,color:"var(--text2)"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="card" style={{padding:16}}>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:12}}>Upcoming (7 days)</div>
              {upcoming7.length===0
                ? <div className="empty-state" style={{padding:"16px 0"}}><div className="icon">🎉</div><p className="text-sm">All clear!</p></div>
                : upcoming7.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:TYPE_COLORS[e.type],flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TYPE_ICONS[e.type]} {e.title}</div>
                      <div style={{fontSize:10,color:"var(--text3)"}}>{e.dueDate}</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:e.type==="income"?"var(--green)":"var(--text)"}}>{e.amount>0?(e.type==="income"?"+":"")+fmt(e.amount):""}</div>
                  </div>
                ))
              }
            </div>
            {overdue.length>0&&(
              <div className="card" style={{padding:16,borderLeft:"3px solid var(--red)"}}>
                <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:10,color:"var(--red)"}}>⚠ Overdue</div>
                {overdue.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:12,fontWeight:600}}>{TYPE_ICONS[e.type]} {e.title}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      {e.amount>0&&<span style={{fontSize:12,color:"var(--red)",fontWeight:700}}>{fmt(e.amount)}</span>}
                      <button className="btn btn-ghost btn-sm" style={{padding:"3px 8px",fontSize:10}} onClick={()=>markPaid(e.id)}>Pay</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="card" style={{padding:16}}>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:10}}>Monthly Cash Flow</div>
              {[{label:"Income",val:monthIncome,color:"var(--green)"},{label:"Expenses",val:monthDue,color:"var(--red)"},{label:"Net",val:monthIncome-monthDue,color:monthIncome-monthDue>=0?"var(--green)":"var(--red)"}].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:12,color:"var(--text2)"}}>{r.label}</span>
                  <span style={{fontSize:13,fontWeight:700,color:r.color}}>{fmt(r.val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TIMELINE VIEW ── */}
      {viewMode==="timeline" && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>
              Timeline — {MONTHS_LBL[mo]} → {MONTHS_LBL[(mo+2)%12]} {yr}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>
          </div>
          {timelineDates.length===0 ? (
            <div className="empty-state" style={{padding:"48px 0"}}>
              <div className="icon">📅</div><h3>No events in range</h3>
              <p className="text-sm" style={{marginTop:4}}>Adjust filters or add an event.</p>
            </div>
          ) : timelineDates.map(date=>{
            const dayEvs = timelineByDate[date];
            const d = new Date(date);
            const isToday = date===todayISO;
            const isPast  = d < new Date() && !isToday;
            return (
              <div key={date} className="tl-row" style={{opacity:isPast?0.6:1}}>
                <div className="tl-date">
                  <div style={{fontFamily:"Syne",fontWeight:700,fontSize:16,color:isToday?"var(--accent)":"var(--text)"}}>{d.getDate()}</div>
                  <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5}}>{d.toLocaleString("default",{month:"short"})}</div>
                  {isToday&&<div style={{width:5,height:5,borderRadius:"50%",background:"var(--accent)",margin:"3px auto 0"}}/>}
                </div>
                <div className="tl-events">
                  {dayEvs.map(e=>(
                    <div key={e.id} className="tl-event-card" style={{borderLeft:`3px solid ${TYPE_COLORS[e.type]}`}} onClick={()=>openEdit(e)}>
                      <span style={{fontSize:16,flexShrink:0}}>{TYPE_ICONS[e.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                        <div style={{fontSize:10,color:"var(--text3)",marginTop:1,display:"flex",gap:5,flexWrap:"wrap"}}>
                          <span style={{color:TYPE_COLORS[e.type],textTransform:"capitalize"}}>{e.type}</span>
                          {e.recurring!=="none"&&<span>· {e.recurring}</span>}
                          {e.autopay&&<span>· Autopay</span>}
                          {e.notes&&<span>· {e.notes}</span>}
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        {e.amount>0&&<div style={{fontFamily:"Syne",fontWeight:700,fontSize:13,color:e.type==="income"?"var(--green)":e.type==="milestone"?"var(--accent)":"var(--text)"}}>{e.type==="income"?"+":""}{fmt(e.amount)}</div>}
                        <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,
                          background:e.status==="paid"?"rgba(16,185,129,0.15)":e.status==="overdue"?"rgba(244,63,94,0.15)":"rgba(255,255,255,0.06)",
                          color:e.status==="paid"?"var(--green)":e.status==="overdue"?"var(--red)":"var(--text3)"
                        }}>{e.status}</span>
                      </div>
                      {e.status!=="paid"&&(
                        <button className="btn btn-ghost btn-sm" style={{padding:"2px 7px",fontSize:10,flexShrink:0}} onClick={ev=>{ev.stopPropagation();markPaid(e.id);}}>✓</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DRAWER ── */}
      {drawer&&(
        <div className="drawer-overlay" onClick={()=>setDrawer(null)}>
          <div className="drawer" onClick={e=>e.stopPropagation()}>
            <div className="drawer-handle"/>
            {drawer==="view"&&(
              <>
                <div className="drawer-header">
                  <div className="drawer-title">{selected}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-primary btn-sm" onClick={()=>openAdd(selected)}>+ Add</button>
                    <button className="drawer-close" onClick={()=>setDrawer(null)}>✕</button>
                  </div>
                </div>
                {selectedEvents.length===0
                  ? <div className="empty-state"><div className="icon">📅</div><h3>No events</h3><p className="text-sm">Tap + Add to create one</p></div>
                  : selectedEvents.map(e=>(
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:TYPE_COLORS[e.type]+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{TYPE_ICONS[e.type]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14}}>{e.title}</div>
                        <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                          {e.recurring!=="none"&&`${e.recurring} · `}{e.autopay&&"Autopay · "}
                          <span style={{color:e.status==="paid"?"var(--green)":e.status==="overdue"?"var(--red)":"var(--text2)"}}>{e.status}</span>
                          {e.notes&&` · ${e.notes}`}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        {e.amount>0&&<div style={{fontWeight:700,fontSize:15,color:e.type==="income"?"var(--green)":"var(--text)"}}>{e.type==="income"?"+":""}{fmt(e.amount)}</div>}
                        <div style={{display:"flex",gap:4,marginTop:4,justifyContent:"flex-end"}}>
                          {e.status!=="paid"&&<button className="btn btn-ghost btn-sm" style={{padding:"2px 7px",fontSize:10}} onClick={()=>markPaid(e.id)}>✓ Paid</button>}
                          <button className="btn btn-ghost btn-sm" style={{padding:"2px 7px",fontSize:10}} onClick={()=>openEdit(e)}>Edit</button>
                          <button className="btn btn-danger btn-sm" style={{padding:"2px 7px",fontSize:10}} onClick={()=>deleteEvent(e.id)}>Del</button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </>
            )}
            {(drawer==="add"||drawer==="edit")&&(
              <>
                <div className="drawer-header">
                  <div className="drawer-title">{drawer==="edit"?"Edit Event":"New Event"}</div>
                  <button className="drawer-close" onClick={()=>setDrawer(null)}>✕</button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Netflix"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount ($)</label>
                    <input className="form-input" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00"/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                      {EVENT_TYPES.map(t=><option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      {["upcoming","paid","overdue"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recurring</label>
                    <select className="form-select" value={form.recurring} onChange={e=>setForm(f=>({...f,recurring:e.target.value}))}>
                      {["none","weekly","biweekly","monthly","yearly"].map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional..."/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div className={`toggle ${form.autopay?"on":""}`} onClick={()=>setForm(f=>({...f,autopay:!f.autopay}))}/>
                  <span style={{fontSize:13}}>Autopay enabled</span>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-primary" style={{flex:1,justifyContent:"center"}} onClick={saveEvent}>{drawer==="edit"?"Save Changes":"Add Event"}</button>
                  {drawer==="edit"&&<button className="btn btn-danger" onClick={()=>deleteEvent(editing.id)}>Delete</button>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── STUB PAGES ───────────────────────────────────────────────────────────────
// ─── CREDIT SCORE PAGE ────────────────────────────────────────────────────────
const SCORE_HISTORY = [];

const SCORE_BANDS = [
  { label:"Poor",      min:300, max:579,  color:"#f43f5e" },
  { label:"Fair",      min:580, max:669,  color:"#f97316" },
  { label:"Good",      min:670, max:739,  color:"#f59e0b" },
  { label:"Very Good", min:740, max:799,  color:"#10b981" },
  { label:"Exceptional",min:800,max:850, color:"#4f8ef7" },
];

function scoreColor(s) { return SCORE_BANDS.find(b => s>=b.min && s<=b.max)?.color ?? "#8892a4"; }
function scoreLabel(s) { return SCORE_BANDS.find(b => s>=b.min && s<=b.max)?.label ?? "Unknown"; }

// SVG arc gauge
function ScoreGauge({ score }) {
  const pct  = (score - 300) / (850 - 300);
  const R    = 80, cx = 100, cy = 100;
  const startAngle = -200, sweep = 220;
  const toRad = d => (d * Math.PI) / 180;
  const arc = (deg) => {
    const a = toRad(startAngle + deg);
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  };
  const bg  = arc(sweep);   // end of track
  const fg  = arc(sweep * pct);
  const largeArc = sweep * pct > 180 ? 1 : 0;
  const bgLarge  = sweep > 180 ? 1 : 0;
  const s0 = arc(0);
  const color = scoreColor(score);

  return (
    <svg width="200" height="130" viewBox="0 0 200 130">
      {/* Track */}
      <path d={`M ${s0.x} ${s0.y} A ${R} ${R} 0 ${bgLarge} 1 ${bg.x} ${bg.y}`}
        fill="none" stroke="var(--bg3)" strokeWidth="14" strokeLinecap="round"/>
      {/* Fill */}
      {pct > 0 && (
        <path d={`M ${s0.x} ${s0.y} A ${R} ${R} 0 ${largeArc} 1 ${fg.x} ${fg.y}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 8px ${color}66)`}}/>
      )}
      {/* Score text */}
      <text x="100" y="88" textAnchor="middle" fill="var(--text)"
        style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:32}}>{score}</text>
      <text x="100" y="106" textAnchor="middle" fill={color}
        style={{fontFamily:"DM Sans,sans-serif",fontWeight:600,fontSize:13}}>{scoreLabel(score)}</text>
    </svg>
  );
}

// Simple SVG line chart for score history
function ScoreLineChart({ history }) {
  const W=420, H=90, pad=10;
  const scores = history.map(h => h.score);
  const min = Math.min(...scores) - 10;
  const max = Math.max(...scores) + 10;
  const pts = history.map((h, i) => {
    const x = pad + (i / (history.length - 1)) * (W - pad * 2);
    const y = H - pad - ((h.score - min) / (max - min)) * (H - pad * 2);
    return { x, y, ...h };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;
  const latest = pts[pts.length - 1];
  const color = scoreColor(latest.score);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#scoreGrad)"/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="var(--bg2)" strokeWidth="2"/>
      ))}
      {/* Latest dot glow */}
      <circle cx={latest.x} cy={latest.y} r="6" fill={color} opacity="0.3"/>
    </svg>
  );
}

function CreditScorePage({ addToast, initialScore }) {
  const [history, setHistory] = useState(() => {
    if (initialScore?.score) return [...SCORE_HISTORY.slice(0, -1), { score: initialScore.score, date: toISO(new Date()), provider: initialScore.provider || "api" }];
    return [];
  });
  const [form, setForm]       = useState({ score:"", provider:"manual" });
  const [showForm, setShowForm] = useState(false);
  const hasHistory = history.length > 0;
  const latest  = hasHistory ? history[history.length - 1] : null;
  const prev    = history.length > 1 ? history[history.length - 2] : null;
  const trend   = hasHistory && prev ? latest.score - prev.score : 0;
  const color   = hasHistory ? scoreColor(latest.score) : "#8892a4";

  const submit = async () => {
    const s = parseInt(form.score);
    if (isNaN(s) || s < 300 || s > 850) return;
    const entry = { score: s, date: toISO(new Date()), provider: form.provider };
    setHistory(h => [...h, entry]);
    setForm({ score:"", provider:"manual" });
    setShowForm(false);
    // Real: await creditScore.record(entry)
    addToast && addToast("Score recorded ✓", "success");
  };

  const TIPS = [
    { icon:"💳", title:"Keep utilization below 30%",      desc:"You're currently at ~24% — great!" },
    { icon:"⏰", title:"Pay on time, every time",          desc:"Payment history is 35% of your score." },
    { icon:"📋", title:"Don't close old accounts",         desc:"Account age boosts your score over time." },
    { icon:"🔍", title:"Limit hard inquiries",             desc:"Each application can lower score 5–10 pts." },
    { icon:"🔀", title:"Diversify credit mix",             desc:"Installment + revolving = better score." },
  ];

  if (loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {error && <ErrorNotice message={error} />}
      {/* Top row */}
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:16,alignItems:"start",marginBottom:16}}>
        {/* Gauge card */}
        <div className="card" style={{textAlign:"center",minWidth:200}}>
          <div className="card-title" style={{textAlign:"left"}}>Credit Score</div>
          {hasHistory ? <ScoreGauge score={latest.score} /> : <div className="empty-state"><div className="icon">⭐</div><p className="text-sm">Log your first credit score</p></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--text3)",marginTop:4,padding:"0 4px"}}>
            <span>300</span><span>850</span>
          </div>
          <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {hasHistory && prev ? <span className={`change-badge ${trend>=0?"pos":"neg"}`}>{trend>=0?"↑":"↓"} {Math.abs(trend)} pts vs last month</span> : <span className="badge badge-gray">No score history yet</span>}
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:14,justifyContent:"center"}}
            onClick={()=>setShowForm(s=>!s)}>
            {showForm ? "Cancel" : "+ Log Score"}
          </button>
          {showForm && (
            <div style={{marginTop:12,textAlign:"left"}}>
              <div className="form-group">
                <label className="form-label">Score (300–850)</label>
                <input className="form-input" type="number" min="300" max="850"
                  value={form.score} onChange={e=>setForm(f=>({...f,score:e.target.value}))}
                  placeholder="e.g. 740" onKeyDown={e=>e.key==="Enter"&&submit()}/>
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" value={form.provider}
                  onChange={e=>setForm(f=>({...f,provider:e.target.value}))}>
                  {["manual","experian","equifax","transunion"].map(p=>(
                    <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={submit}>
                Save Score
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Score history chart */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div className="section-title">Score History</div>
              <span style={{fontSize:11,color:"var(--text3)"}}>Last {history.length} months</span>
            </div>
            <div style={{padding:"4px 0 8px"}}>
              {hasHistory ? <ScoreLineChart history={history} /> : <div className="empty-state"><div className="icon">📈</div><p className="text-sm">Log your first credit score</p></div>}
            </div>
            {/* X-axis labels */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              {history.map((h,i)=>(
                <span key={i} style={{fontSize:9,color:"var(--text3)"}}>
                  {new Date(h.date).toLocaleString("default",{month:"short"})}
                </span>
              ))}
            </div>
          </div>

          {/* Score bands */}
          <div className="card" style={{padding:14}}>
            <div className="section-title" style={{marginBottom:10}}>Score Ranges</div>
            {SCORE_BANDS.map(b=>{
              const active = latest.score >= b.min && latest.score <= b.max;
              const pct = Math.min(100, Math.max(0, (latest.score - b.min) / (b.max - b.min) * 100));
              return (
                <div key={b.label} style={{marginBottom:8,
                  padding: active?"8px 10px":"4px 10px",
                  background: active?`${b.color}15`:"transparent",
                  borderRadius:8, border: active?`1px solid ${b.color}30`:"1px solid transparent",
                  transition:"all 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:active?4:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/>
                      <span style={{fontSize:12,fontWeight:active?700:400,color:active?b.color:"var(--text2)"}}>{b.label}</span>
                      {active&&<span className="badge" style={{background:`${b.color}20`,color:b.color,fontSize:9}}>You</span>}
                    </div>
                    <span style={{fontSize:11,color:"var(--text3)"}}>{b.min}–{b.max}</span>
                  </div>
                  {active&&(
                    <div className="progress-bar" style={{height:4,margin:"4px 0 0"}}>
                      <div className="progress-fill" style={{width:`${pct}%`,background:b.color}}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <div className="section-title" style={{marginBottom:14}}>💡 Ways to Improve Your Score</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {TIPS.map(t=>(
            <div key={t.title} style={{
              background:"var(--bg3)",borderRadius:12,padding:"14px",
              border:"1px solid var(--border)"}}>
              <div style={{fontSize:22,marginBottom:8}}>{t.icon}</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{t.title}</div>
              <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GOALS PAGE ───────────────────────────────────────────────────────────────
const GOAL_ICONS = { savings:"💰", emergency:"🛡️", vacation:"✈️", home:"🏠", car:"🚗", debt:"💳", investment:"📈", education:"🎓", custom:"🎯" };
const GOAL_COLORS = { savings:"#10b981", emergency:"#4f8ef7", vacation:"#f59e0b", home:"#6366f1", car:"#f97316", debt:"#f43f5e", investment:"#8b5cf6", education:"#14b8a6", custom:"#ec4899" };

// ─── PROFIT LOCK ──────────────────────────────────────────────────────────────
// Detects realized + unrealized gains from portfolio holdings.
// Users set a "lock %" to automatically allocate gains into savings goals.
// No fake brokerage sync — reads from MOCK.portfolio (or live data when connected).
//
// BACKEND APIs NEEDED:
//   POST /api/profit-lock/execute  { allocationId, amount, goalId }
//   GET  /api/profit-lock/history  — past lock events per user
//   PUT  /api/profit-lock/rules    — save user's allocation rules
//   (store in Supabase: profit_lock_rules, profit_lock_history tables)

const VAULT_DESTINATIONS = [
  { id:"emergency", label:"Emergency Fund",    icon:"🛡️", color:"#4f8ef7" },
  { id:"savings",   label:"General Savings",   icon:"💰", color:"#10b981" },
  { id:"vault",     label:"Investment Vault",  icon:"🔒", color:"#a3e635" },
  { id:"goal",      label:"Specific Goal",     icon:"🎯", color:"#f59e0b" },
];

function computeGains(holdings) {
  // Uses day change % as proxy for unrealized gain since last close.
  // When live data is connected, swap with (currentValue - costBasis).
  return holdings.map(h => {
    const gainAmt = h.value * (h.change / 100);
    return { ...h, gainAmt, gainPct: h.change };
  });
}

function ProfitLockPage({ addToast }) {
  const { totalValue, dayChange, dayChangePct, connected, holdings } = MOCK.portfolio;

  // Allocation rules — persisted to backend when live
  const [rules, setRules] = useState([
    { id:1, destination:"emergency", label:"Emergency Fund", pct:40, icon:"🛡️", color:"#4f8ef7" },
    { id:2, destination:"savings",   label:"General Savings", pct:35, icon:"💰", color:"#10b981" },
    { id:3, destination:"vault",     label:"Investment Vault", pct:25, icon:"🔒", color:"#a3e635" },
  ]);
  const [lockPct, setLockPct]       = useState(20);   // % of total gains to lock
  const [aiRec, setAiRec]           = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [locked, setLocked]         = useState([]);   // history of lock events
  const [selectedGoal, setGoal]     = useState(INIT_GOALS[0]?.id || null);

  const enriched  = computeGains(holdings);
  const gainers   = enriched.filter(h => h.gainAmt > 0);
  const losers    = enriched.filter(h => h.gainAmt < 0);
  const totalGain = enriched.reduce((s, h) => s + h.gainAmt, 0);
  const lockableAmt = Math.max(0, totalGain * (lockPct / 100));

  // Validate allocations sum to 100
  const allocSum = rules.reduce((s, r) => s + r.pct, 0);
  const allocValid = Math.abs(allocSum - 100) < 1;

  const updateRulePct = (id, val) => {
    setRules(rs => rs.map(r => r.id === id ? { ...r, pct: Number(val) } : r));
  };

  // AI recommendation — calls backend /api/ai/chat with portfolio context
  const getAiRec = async () => {
    setAiLoading(true);
    const prompt = `I have $${totalGain.toFixed(2)} in unrealized portfolio gains today (${dayChangePct}% overall). 
My top gainer is ${gainers[0]?.ticker} (+${gainers[0]?.gainPct}%, $${gainers[0]?.gainAmt?.toFixed(2)}).
I'm considering locking ${lockPct}% of gains ($${lockableAmt.toFixed(2)}) into savings.
My goals: Emergency Fund ($${INIT_GOALS[0]?.current}/$${INIT_GOALS[0]?.target}), Down Payment ($${INIT_GOALS[2]?.current}/$${INIT_GOALS[2]?.target}).
Give me a concise 2-3 sentence recommendation on whether to lock profits now and how to allocate. Be specific with numbers.`;
    try {
      const result = await aiApi.chat(prompt, []);
      if (result?.reply) { setAiRec(result.reply); setAiLoading(false); return; }
      // Demo fallback
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:300,
          system:"You are WealthPilot AI, a concise personal finance coach. Give specific, numbers-based advice.",
          messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      setAiRec(data.content?.[0]?.text || "Consider locking 20% of today's gains into your emergency fund — you're 38% away from your target.");
    } catch {
      setAiRec(`Today you have ${fmt(totalGain)} in gains. Locking ${lockPct}% (${fmt(lockableAmt)}) into your Emergency Fund would add ${Math.round((lockableAmt/INIT_GOALS[0]?.target)*100)}% progress toward your goal.`);
    }
    setAiLoading(false);
  };

  // Execute lock — optimistic UI + backend stub
  const executeLock = async () => {
    if (!allocValid || lockableAmt <= 0) return;
    const event = {
      id: Date.now(),
      ts: new Date().toISOString(),
      totalGain: totalGain.toFixed(2),
      lockPct,
      lockedAmt: lockableAmt.toFixed(2),
      allocations: rules.map(r => ({
        ...r,
        amount: (lockableAmt * r.pct / 100).toFixed(2)
      })),
    };
    setLocked(h => [event, ...h]);
    addToast && addToast(`${fmt(lockableAmt)} locked into savings ✓`, "success");
    // BACKEND: POST /api/profit-lock/execute { ...event }
  };

  if (loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {error && <ErrorNotice message={error} />}
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"Syne",fontWeight:800,fontSize:22,marginBottom:4}}>
          🔒 Profit Lock
        </div>
        <div style={{fontSize:13,color:"var(--text2)"}}>
          Automatically redirect portfolio gains into savings goals before you spend them.
        </div>
      </div>

      {/* Disconnected state */}
      {!connected && (
        <div className="card mb-4" style={{
          background:"linear-gradient(135deg,rgba(163,230,53,0.06),rgba(79,142,247,0.04))",
          border:"1px solid rgba(163,230,53,0.15)",padding:20,textAlign:"center"
        }}>
          <div style={{fontSize:28,marginBottom:8}}>📊</div>
          <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:6}}>Brokerage Not Connected</div>
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:14,maxWidth:360,margin:"0 auto 14px"}}>
            Connect your brokerage via SnapTrade to use live gain detection. Showing demo data below.
          </div>
          <span className="badge badge-yellow" style={{fontSize:11}}>⚠ Demo Mode — Connect Portfolio for live gains</span>
        </div>
      )}

      {/* Summary row */}
      <div className="grid-3 mb-4" style={{gap:12}}>
        <div className="card" style={{padding:"14px 16px"}}>
          <div className="card-title">Portfolio Value</div>
          <div className="card-value" style={{fontSize:22}}>{fmt(totalValue)}</div>
          <div className="card-sub">{holdings.length} holdings</div>
        </div>
        <div className="card" style={{padding:"14px 16px",borderLeft:`3px solid ${totalGain>=0?"#a3e635":"var(--red)"}`}}>
          <div className="card-title">Today's Gain/Loss</div>
          <div className="card-value" style={{fontSize:22,color:totalGain>=0?"#a3e635":"var(--red)"}}>
            {totalGain>=0?"+":""}{fmt(totalGain)}
          </div>
          <span className={`gain-pill ${totalGain>=0?"pos":"neg"}`}>{dayChangePct>=0?"+":""}{dayChangePct}%</span>
        </div>
        <div className="card" style={{padding:"14px 16px",borderLeft:"3px solid var(--accent)"}}>
          <div className="card-title">Lockable Amount</div>
          <div className="card-value" style={{fontSize:22,color:"var(--accent)"}}>{fmt(lockableAmt)}</div>
          <div className="card-sub">{lockPct}% of gains</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
        {/* LEFT — Lock controls */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Lock % slider */}
          <div className="card">
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:14}}>Lock Percentage</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:13,color:"var(--text2)"}}>% of gains to lock</span>
              <span style={{fontFamily:"Syne",fontWeight:800,fontSize:24,color:"#a3e635"}}>{lockPct}%</span>
            </div>
            <input type="range" className="pl-slider" min={5} max={100} step={5}
              value={lockPct} onChange={e=>setLockPct(Number(e.target.value))} />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--text3)",marginTop:4}}>
              <span>5%</span><span>50%</span><span>100%</span>
            </div>
            <div style={{marginTop:14,padding:"10px 12px",background:"rgba(163,230,53,0.07)",borderRadius:9,border:"1px solid rgba(163,230,53,0.18)"}}>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:2}}>You will lock</div>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:20,color:"#a3e635"}}>{fmt(lockableAmt)}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>from {fmt(totalGain)} total gains today</div>
            </div>
          </div>

          {/* Allocation rules */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>Allocate To</div>
              <span className={`gain-pill ${allocValid?"pos":"neg"}`}>{allocSum}% {allocValid?"✓":"≠ 100%"}</span>
            </div>
            {rules.map(r => (
              <div key={r.id} className="pl-alloc-row">
                <div style={{width:34,height:34,borderRadius:9,background:`${r.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600}}>{r.label}</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>→ {fmt(lockableAmt * r.pct / 100)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input type="range" className="pl-slider" min={0} max={100} step={5}
                    value={r.pct} onChange={e=>updateRulePct(r.id, e.target.value)}
                    style={{width:80}} />
                  <span style={{fontFamily:"Syne",fontWeight:700,fontSize:13,minWidth:36,textAlign:"right",color:r.color}}>{r.pct}%</span>
                </div>
              </div>
            ))}

            {/* Goal selector if "goal" destination */}
            <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
              <label className="form-label">Link to Specific Goal</label>
              <select className="form-select" value={selectedGoal||""} onChange={e=>setGoal(Number(e.target.value))}>
                {INIT_GOALS.map(g=>(
                  <option key={g.id} value={g.id}>{g.name} — {fmt(g.current)}/{fmt(g.target)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Execute button */}
          <button className="pl-lock-btn" onClick={executeLock}
            disabled={!allocValid || lockableAmt <= 0}>
            {lockableAmt > 0
              ? `🔒 Lock ${fmt(lockableAmt)} Now`
              : "No gains to lock today"}
          </button>
          {!allocValid && <div style={{fontSize:11,color:"var(--red)",textAlign:"center",marginTop:-8}}>Allocations must sum to 100%</div>}
        </div>

        {/* RIGHT — Holdings + AI + History */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* AI Recommendation */}
          <div className="card" style={{background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(79,142,247,0.05))",border:"1px solid rgba(99,102,241,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:18}}>✦</span>
                <span style={{fontFamily:"Syne",fontWeight:700,fontSize:14,color:"#818cf8"}}>AI Recommendation</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={getAiRec} disabled={aiLoading}
                style={{fontSize:11,padding:"4px 10px"}}>
                {aiLoading ? "Analyzing…" : aiRec ? "↻ Refresh" : "Get Advice"}
              </button>
            </div>
            {aiRec ? (
              <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6}}>{aiRec}</div>
            ) : (
              <div style={{fontSize:12,color:"var(--text3)"}}>
                Click "Get Advice" for an AI-powered recommendation based on your portfolio and goals.
              </div>
            )}
          </div>

          {/* Holdings gain/loss breakdown */}
          <div className="card">
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:12}}>Today's Movers</div>
            {enriched.sort((a,b)=>b.gainAmt-a.gainAmt).map(h=>(
              <div key={h.ticker} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{width:32,height:32,borderRadius:8,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:h.gainAmt>=0?"#a3e635":"var(--red)",flexShrink:0}}>{h.ticker}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600}}>{h.name}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{h.shares} shares · {fmt(h.value)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:h.gainAmt>=0?"#a3e635":"var(--red)"}}>
                    {h.gainAmt>=0?"+":""}{fmt(h.gainAmt)}
                  </div>
                  <span className={`gain-pill ${h.gainPct>=0?"pos":"neg"}`} style={{fontSize:10}}>
                    {h.gainPct>=0?"+":""}{h.gainPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Lock history */}
          <div className="card">
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:12}}>Lock History</div>
            {locked.length === 0 ? (
              <div className="empty-state" style={{padding:"16px 0"}}>
                <div className="icon">🔒</div>
                <p className="text-sm">No locks executed yet this session.</p>
              </div>
            ) : locked.map(l=>(
              <div key={l.id} style={{padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:600}}>Locked {fmt(Number(l.lockedAmt))}</span>
                  <span style={{fontSize:10,color:"var(--text3)"}}>{new Date(l.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {l.allocations.map(a=>(
                    <span key={a.id} style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:`${a.color}18`,color:a.color,fontWeight:600}}>
                      {a.icon} {fmt(Number(a.amount))} → {a.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const INIT_GOALS = [
  { id:1, name:"Emergency Fund",   type:"emergency",  target:10000, current:6200,  deadline:"2026-12-01", monthlyContrib:500,  notes:"3–6 months expenses" },
  { id:2, name:"Vacation to Japan",type:"vacation",   target:4500,  current:1800,  deadline:"2026-09-01", monthlyContrib:450,  notes:"flights + hotel" },
  { id:3, name:"Down Payment",     type:"home",       target:50000, current:12000, deadline:"2028-06-01", monthlyContrib:800,  notes:"20% on $250k home" },
  { id:4, name:"Pay Off Car Loan", type:"debt",       target:8200,  current:5100,  deadline:"2027-01-01", monthlyContrib:350,  notes:"Extra $100/mo" },
];

function projectedDate(current, target, monthlyContrib) {
  if (monthlyContrib <= 0 || current >= target) return null;
  const months = Math.ceil((target - current) / monthlyContrib);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

function GoalsPage({ addToast, modeConfig }) {
  const [goals, setGoals] = useState(INIT_GOALS);

  // Sort goals by mode priority order
  const sortedGoals = modeConfig?.goalPriority
    ? [...goals].sort((a, b) => {
        const ai = modeConfig.goalPriority.indexOf(a.type);
        const bi = modeConfig.goalPriority.indexOf(b.type);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
    : goals;
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState(null);
  const BLANK = { name:"", type:"savings", target:"", current:"", deadline:"", monthlyContrib:"", notes:"" };
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalSaved  = goals.reduce((s,g) => s + g.current, 0);
  const totalTarget = goals.reduce((s,g) => s + g.target, 0);
  const completed   = goals.filter(g => g.current >= g.target).length;

  const openAdd  = () => { setForm(BLANK); setEditing(null); setDrawer(true); };
  const openEdit = (g) => { setForm({...g, target:String(g.target), current:String(g.current), monthlyContrib:String(g.monthlyContrib)}); setEditing(g); setDrawer(true); };

  const save = () => {
    if (!form.name.trim() || !form.target) return;
    const entry = { ...form, id: editing?.id || Date.now(), target: parseFloat(form.target)||0, current: parseFloat(form.current)||0, monthlyContrib: parseFloat(form.monthlyContrib)||0 };
    if (editing) { setGoals(gs => gs.map(g => g.id===editing.id ? entry : g)); addToast&&addToast("Goal updated","success"); }
    else         { setGoals(gs => [...gs, entry]); addToast&&addToast("Goal created 🎯","success"); }
    setDrawer(false);
  };

  const del = (id) => { setGoals(gs => gs.filter(g => g.id!==id)); addToast&&addToast("Goal deleted","info"); setDrawer(false); };

  const addContrib = (id, amt) => {
    setGoals(gs => gs.map(g => g.id===id ? {...g, current: Math.min(g.target, g.current+amt)} : g));
    addToast&&addToast(`+${fmt(amt)} added ✓`,"success");
  };

  if (loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {error && <ErrorNotice message={error} />}
      {/* Summary */}
      <div className="grid-3 mb-4" style={{gap:12}}>
        <div className="card" style={{borderLeft:"3px solid var(--accent)",padding:"14px 16px"}}>
          <div className="card-title">Total Saved</div>
          <div className="card-value" style={{fontSize:22,color:"var(--accent)"}}>{fmtK(totalSaved)}</div>
          <div className="card-sub">of {fmtK(totalTarget)} target</div>
        </div>
        <div className="card" style={{borderLeft:"3px solid var(--green)",padding:"14px 16px"}}>
          <div className="card-title">Overall Progress</div>
          <div className="card-value" style={{fontSize:22,color:"var(--green)"}}>
            {totalTarget > 0 ? Math.round((totalSaved/totalTarget)*100) : 0}%
          </div>
          <div className="progress-bar" style={{height:6,marginTop:8}}>
            <div className="progress-fill" style={{width:`${Math.min(100,(totalSaved/totalTarget)*100)}%`,background:"var(--green)"}}/>
          </div>
        </div>
        <div className="card" style={{borderLeft:"3px solid var(--yellow)",padding:"14px 16px"}}>
          <div className="card-title">Goals Completed</div>
          <div className="card-value" style={{fontSize:22,color:"var(--yellow)"}}>{completed} / {goals.length}</div>
          <div className="card-sub">
            {goals.filter(g=>g.current<g.target).length} active goals remaining
          </div>
        </div>
      </div>

      {/* Goals list */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className="section-title">My Goals</div>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ New Goal</button>
        </div>

        {goals.length === 0 && (
          <div className="empty-state card">
            <div className="icon">🎯</div>
            <h3>No goals yet</h3>
            <p className="text-sm" style={{marginTop:6}}>Set a savings target, debt payoff, or financial milestone.</p>
            <button className="btn btn-primary" style={{marginTop:14}} onClick={openAdd}>+ Create First Goal</button>
          </div>
        )}

        {sortedGoals.map(g => {
          const pct      = Math.min(100, Math.round((g.current/g.target)*100));
          const color    = GOAL_COLORS[g.type] || "#4f8ef7";
          const icon     = GOAL_ICONS[g.type]  || "🎯";
          const done     = g.current >= g.target;
          const proj     = projectedDate(g.current, g.target, g.monthlyContrib);
          const deadline = g.deadline ? new Date(g.deadline) : null;
          const overdue  = deadline && proj && proj > deadline && !done;
          const remaining = g.target - g.current;
          const monthsLeft = g.monthlyContrib > 0 ? Math.ceil(remaining / g.monthlyContrib) : null;

          return (
            <div key={g.id} className="card" style={{borderLeft:`3px solid ${done?"var(--green)":color}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                {/* Icon */}
                <div style={{width:44,height:44,borderRadius:12,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
                  {done ? "✅" : icon}
                </div>

                {/* Main content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>{g.name}</span>
                    {done && <span className="badge badge-green">Completed 🎉</span>}
                    {overdue && !done && <span className="badge badge-red">Behind schedule</span>}
                    {!done && !overdue && monthsLeft && <span className="badge badge-gray">{monthsLeft} mo left</span>}
                  </div>

                  {/* Progress bar */}
                  <div style={{display:"flex",alignItems:"center",gap:10,margin:"8px 0"}}>
                    <div className="progress-bar" style={{flex:1,height:8}}>
                      <div className="progress-fill" style={{width:`${pct}%`,background:done?"var(--green)":color,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:done?"var(--green)":color,minWidth:36,textAlign:"right"}}>{pct}%</span>
                  </div>

                  {/* Amounts row */}
                  <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:12}}>
                    <span style={{color:"var(--text2)"}}>Saved: <b style={{color:"var(--text)"}}>{fmt(g.current)}</b></span>
                    <span style={{color:"var(--text2)"}}>Target: <b style={{color:"var(--text)"}}>{fmt(g.target)}</b></span>
                    {!done && <span style={{color:"var(--text2)"}}>Remaining: <b style={{color}}>{fmt(remaining)}</b></span>}
                    {g.monthlyContrib>0 && <span style={{color:"var(--text2)"}}>Monthly: <b style={{color:"var(--green)"}}>{fmt(g.monthlyContrib)}</b></span>}
                  </div>

                  {/* Projection row */}
                  {!done && proj && (
                    <div style={{marginTop:6,fontSize:11,color:overdue?"var(--red)":"var(--text3)"}}>
                      {overdue?"⚠":"📅"} Projected completion: <b>{proj.toLocaleDateString("en-US",{month:"short",year:"numeric"})}</b>
                      {deadline && <span> · Deadline: {deadline.toLocaleDateString("en-US",{month:"short",year:"numeric"})}</span>}
                    </div>
                  )}
                  {g.notes && <div style={{marginTop:4,fontSize:11,color:"var(--text3)"}}>{g.notes}</div>}
                </div>

                {/* Actions */}
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {!done && (
                    <button className="btn btn-ghost btn-sm" style={{padding:"4px 10px",fontSize:11}}
                      onClick={()=>addContrib(g.id, g.monthlyContrib||100)}>
                      + Add
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" style={{padding:"4px 10px",fontSize:11}} onClick={()=>openEdit(g)}>Edit</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      {drawer && (
        <div className="drawer-overlay" onClick={()=>setDrawer(false)}>
          <div className="drawer" onClick={e=>e.stopPropagation()}>
            <div className="drawer-handle"/>
            <div className="drawer-header">
              <div className="drawer-title">{editing ? "Edit Goal" : "New Goal"}</div>
              <button className="drawer-close" onClick={()=>setDrawer(false)}>✕</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Emergency Fund"/>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {Object.keys(GOAL_ICONS).map(t=><option key={t} value={t}>{GOAL_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Target Amount ($)</label>
                <input className="form-input" type="number" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="10000"/>
              </div>
              <div className="form-group">
                <label className="form-label">Current Saved ($)</label>
                <input className="form-input" type="number" value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))} placeholder="0"/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Monthly Contribution ($)</label>
                <input className="form-input" type="number" value={form.monthlyContrib} onChange={e=>setForm(f=>({...f,monthlyContrib:e.target.value}))} placeholder="500"/>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional..."/>
            </div>
            {/* Live projection preview */}
            {form.target && form.current !== "" && form.monthlyContrib && (
              <div style={{background:"rgba(79,142,247,0.08)",border:"1px solid rgba(79,142,247,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12}}>
                <span style={{color:"var(--text3)"}}>📅 Projected: </span>
                <b>{projectedDate(parseFloat(form.current)||0, parseFloat(form.target)||0, parseFloat(form.monthlyContrib)||0)
                  ?.toLocaleDateString("en-US",{month:"long",year:"numeric"}) || "—"}</b>
                <span style={{color:"var(--text3)"}}> · {Math.ceil((parseFloat(form.target)-parseFloat(form.current))/(parseFloat(form.monthlyContrib)||1))} months at {fmt(parseFloat(form.monthlyContrib)||0)}/mo</span>
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary" style={{flex:1,justifyContent:"center"}} onClick={save}>
                {editing ? "Save Changes" : "Create Goal"}
              </button>
              {editing && <button className="btn btn-danger" onClick={()=>del(editing.id)}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
const REPORT_MONTHS = [
  { month:"Nov", income:6800,  spending:4100 },
  { month:"Dec", income:7200,  spending:5200 },
  { month:"Jan", income:7200,  spending:3900 },
  { month:"Feb", income:7200,  spending:4050 },
  { month:"Mar", income:7200,  spending:4280 },
  { month:"Apr", income:7200,  spending:3980 },
  { month:"May", income:7200,  spending:4318 },
];

const NET_WORTH_HISTORY = [
  { month:"Nov", value:48200 }, { month:"Dec", value:47100 },
  { month:"Jan", value:50300 }, { month:"Feb", value:52100 },
  { month:"Mar", value:53800 }, { month:"Apr", value:56400 },
  { month:"May", value:58200 },
];

// Reusable SVG bar chart — grouped bars
function BarChart({ data, keys, colors, height=160 }) {
  const W = 520, pad = { l:36, r:8, t:10, b:28 };
  const innerW = W - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k])));
  const groupW = innerW / data.length;
  const barW   = Math.min(22, (groupW - 8) / keys.length);

  const yTick = v => pad.t + innerH - (v / maxVal) * innerH;
  const ticks  = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Y grid + labels */}
      {ticks.map((t,i) => {
        const y = yTick(t);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W-pad.r} y1={y} y2={y} stroke="var(--border)" strokeWidth="1"/>
            <text x={pad.l-4} y={y+4} textAnchor="end" fill="var(--text3)" fontSize="9">
              {t>=1000?`$${(t/1000).toFixed(0)}k`:`$${t}`}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, gi) => {
        const gx = pad.l + gi * groupW + groupW/2 - (keys.length * (barW+2))/2;
        return (
          <g key={gi}>
            {keys.map((k, ki) => {
              const bh = (d[k] / maxVal) * innerH;
              const x  = gx + ki * (barW + 2);
              const y  = pad.t + innerH - bh;
              return (
                <rect key={k} x={x} y={y} width={barW} height={bh}
                  fill={colors[ki]} rx="3" opacity="0.9"/>
              );
            })}
            <text x={pad.l + gi*groupW + groupW/2} y={height-6}
              textAnchor="middle" fill="var(--text3)" fontSize="9">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Reusable SVG line chart (single series)
function LineChart({ data, color="#4f8ef7", height=100 }) {
  const W=520, pad=8;
  const vals = data.map(d=>d.value);
  const min=Math.min(...vals), max=Math.max(...vals), range=max-min||1;
  const pts = data.map((d,i)=>({
    x: pad + (i/(data.length-1))*(W-pad*2),
    y: height-pad-((d.value-min)/range)*(height-pad*2),
    ...d
  }));
  const pathD  = pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
  const areaD  = `${pathD} L ${pts[pts.length-1].x} ${height} L ${pts[0].x} ${height} Z`;
  const latest = pts[pts.length-1];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="rwGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#rwGrad)"/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=>(
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="var(--bg2)" strokeWidth="2"/>
      ))}
      <circle cx={latest.x} cy={latest.y} r="6" fill={color} opacity="0.25"/>
    </svg>
  );
}

function ReportsPage() {
  const [period, setPeriod] = useState("6m");

  const months = period === "3m" ? REPORT_MONTHS.slice(-3)
               : period === "6m" ? REPORT_MONTHS.slice(-6)
               : REPORT_MONTHS;

  const nwMonths = period === "3m" ? NET_WORTH_HISTORY.slice(-3)
                 : period === "6m" ? NET_WORTH_HISTORY.slice(-6)
                 : NET_WORTH_HISTORY;

  const avgIncome   = Math.round(months.reduce((s,m)=>s+m.income,0)/months.length);
  const avgSpending = Math.round(months.reduce((s,m)=>s+m.spending,0)/months.length);
  const avgSavings  = avgIncome - avgSpending;
  const savingsRate = Math.round((avgSavings/avgIncome)*100);

  const nwStart = nwMonths[0].value;
  const nwEnd   = nwMonths[nwMonths.length-1].value;
  const nwGain  = nwEnd - nwStart;

  if (loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {error && <ErrorNotice message={error} />}
      {/* Period toggle + header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div className="section-title">Financial Reports</div>
        <div className="tab-group">
          {["3m","6m","all"].map(p=>(
            <div key={p} className={`tab ${period===p?"active":""}`} onClick={()=>setPeriod(p)}>
              {p==="all"?"All":p.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid-4 mb-4" style={{gap:12}}>
        {[
          {label:"Avg Monthly Income",   val:fmt(avgIncome),   color:"var(--green)", icon:"💵"},
          {label:"Avg Monthly Spending", val:fmt(avgSpending), color:"var(--red)",   icon:"🛍️"},
          {label:"Avg Monthly Savings",  val:fmt(avgSavings),  color:"var(--accent)",icon:"💰"},
          {label:"Savings Rate",         val:`${savingsRate}%`,color:savingsRate>=20?"var(--green)":"var(--yellow)",icon:"📊"},
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:"14px 16px",borderLeft:`3px solid ${k.color}`}}>
            <div style={{fontSize:18,marginBottom:6}}>{k.icon}</div>
            <div className="card-title">{k.label}</div>
            <div className="card-value" style={{fontSize:20,color:k.color}}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-4" style={{gap:16}}>
        {/* Income vs Spending bar chart */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div className="section-title">Income vs Spending</div>
            <div style={{display:"flex",gap:12,fontSize:11}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"var(--green)",display:"inline-block"}}/> Income</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"var(--red)",display:"inline-block"}}/> Spending</span>
            </div>
          </div>
          <BarChart data={months} keys={["income","spending"]} colors={["var(--green)","var(--red)"]} />
        </div>

        {/* Net worth trend */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div className="section-title">Net Worth Trend</div>
            <span className={`change-badge ${nwGain>=0?"pos":"neg"}`}>
              {nwGain>=0?"↑":"↓"} {fmt(Math.abs(nwGain))}
            </span>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            <div><div className="card-title">Start</div><div style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>{fmtK(nwStart)}</div></div>
            <div><div className="card-title">Current</div><div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,color:"var(--green)"}}>{fmtK(nwEnd)}</div></div>
            <div><div className="card-title">Growth</div><div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,color:"var(--accent)"}}>{Math.round((nwGain/nwStart)*100)}%</div></div>
          </div>
          <LineChart data={nwMonths} color="var(--accent)" height={110}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            {nwMonths.map((m,i)=>(
              <span key={i} style={{fontSize:9,color:"var(--text3)"}}>{m.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly cash flow table */}
      <div className="card mb-4">
        <div className="section-title" style={{marginBottom:14}}>Monthly Cash Flow</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th style={{textAlign:"right"}}>Income</th>
                <th style={{textAlign:"right"}}>Spending</th>
                <th style={{textAlign:"right"}}>Saved</th>
                <th style={{textAlign:"right"}}>Rate</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {[...months].reverse().map((m,i)=>{
                const saved = m.income - m.spending;
                const rate  = Math.round((saved/m.income)*100);
                return (
                  <tr key={i}>
                    <td style={{fontWeight:600}}>{m.month}</td>
                    <td style={{textAlign:"right",color:"var(--green)",fontWeight:600}}>{fmt(m.income)}</td>
                    <td style={{textAlign:"right",color:"var(--red)",fontWeight:600}}>{fmt(m.spending)}</td>
                    <td style={{textAlign:"right",fontWeight:700,color:saved>=0?"var(--accent)":"var(--red)"}}>{fmt(saved)}</td>
                    <td style={{textAlign:"right"}}>
                      <span className={`badge ${rate>=20?"badge-green":rate>=10?"badge-blue":"badge-yellow"}`}>{rate}%</span>
                    </td>
                    <td style={{minWidth:80}}>
                      <div className="progress-bar" style={{height:5,margin:0}}>
                        <div className="progress-fill" style={{width:`${Math.min(100,rate*2)}%`,background:rate>=20?"var(--green)":"var(--accent)"}}/>
                      </div>
                    </td>
                  </tr>
                );
              })}
            {filtered.length===0 && <tr><td colSpan="5"><EmptyState message="No transactions yet. Connect your bank to get started." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card">
        <div className="section-title" style={{marginBottom:14}}>Spending by Category</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {MOCK.budget.map(b=>{
            const pct = Math.min(100,Math.round((b.spent/b.limit)*100));
            const over = b.spent > b.limit;
            return (
              <div key={b.category} style={{background:"var(--bg3)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:16}}>{CATEGORY_ICONS[b.category]||"💳"}</span>
                    <span style={{fontSize:12,fontWeight:600}}>{b.category}</span>
                  </div>
                  {over && <span className="badge badge-red" style={{fontSize:9}}>Over</span>}
                </div>
                <div style={{fontFamily:"Syne",fontWeight:700,fontSize:16,marginBottom:4,color:over?"var(--red)":"var(--text)"}}>{fmt(b.spent)}</div>
                <div className="progress-bar" style={{height:5}}>
                  <div className="progress-fill" style={{width:`${pct}%`,background:over?"var(--red)":b.color}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:"var(--text3)"}}>
                  <span>{pct}% of budget</span><span>Limit: {fmt(b.limit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── NET WORTH COMMAND CENTER ─────────────────────────────────────────────────
// Formulas:
//   totalAssets   = cash + savings + investments + crypto + realEstateEquity
//   totalLiabilities = |creditDebt| + studentLoan + carLoan + mortgage
//   netWorth      = totalAssets - totalLiabilities
//   debtRatio     = totalLiabilities / totalAssets  (healthy < 0.36)
//   cashflowNet   = MOCK.income - MOCK.spending
//   fundingReady  = cashflowNet > 0 && emergencyFundPct >= 1.0
//   monthlyGrowth = (netWorth - prevMonthNW) / prevMonthNW

function NetWorthPage({ accounts, totalCash, creditDebt }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (k) => setExpanded(e => ({...e, [k]: !e[k]}));

  // ── Asset calculations ──────────────────────────────────────────────────────
  const cashAssets       = totalCash;                            // live from useAccounts
  const investAssets     = MOCK.portfolio.totalValue;            // live when SnapTrade connected
  const cryptoAssets     = MOCK.crypto.totalValue;               // manual / Coinbase later
  const realEstateEquity = MOCK.realEstate.properties.reduce((s,p) => s + p.equity, 0);
  const totalAssets      = cashAssets + investAssets + cryptoAssets + realEstateEquity;

  // ── Liability calculations ──────────────────────────────────────────────────
  const creditLiab   = Math.abs(creditDebt);                     // live from useAccounts
  const studentLiab  = MOCK.studentLoan;
  const carLiab      = MOCK.carLoan;
  const mortgageLiab = MOCK.realEstate.properties.reduce((s,p) => s + p.mortgage, 0);
  const totalLiab    = creditLiab + studentLiab + carLiab + mortgageLiab;

  // ── Net worth ───────────────────────────────────────────────────────────────
  const netWorth   = totalAssets - totalLiab;
  const debtRatio  = totalAssets > 0 ? totalLiab / totalAssets : 0;
  const prevNW     = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 2]?.value || 0;
  const nwGrowth   = prevNW > 0 ? ((netWorth - prevNW) / prevNW) * 100 : 0;

  // ── Cash flow ───────────────────────────────────────────────────────────────
  const cashflowNet    = MOCK.income - MOCK.spending;
  const savingsRate    = Math.round((cashflowNet / MOCK.income) * 100);
  const emergencyGoal  = INIT_GOALS.find(g => g.type === "emergency");
  const emergencyPct   = emergencyGoal ? emergencyGoal.current / emergencyGoal.target : 0;
  const creditScore    = SCORE_HISTORY[SCORE_HISTORY.length - 1]?.score || 0;
  const fundingReady   = cashflowNet > 500 && emergencyPct >= 0.5;

  // ── Asset allocation for donut ──────────────────────────────────────────────
  const allocData = [
    { value: cashAssets,       color: "#4f8ef7", label: "Cash" },
    { value: investAssets,     color: "#10b981", label: "Investments" },
    { value: cryptoAssets,     color: "#f59e0b", label: "Crypto" },
    { value: realEstateEquity, color: "#6366f1", label: "Real Estate" },
  ].filter(d => d.value > 0);

  const liabData = [
    { value: creditLiab,   color: "#f43f5e", label: "Credit" },
    { value: studentLiab,  color: "#f97316", label: "Student Loan" },
    { value: carLiab,      color: "#fb923c", label: "Car Loan" },
    { value: mortgageLiab, color: "#8b5cf6", label: "Mortgage" },
  ].filter(d => d.value > 0);

  // ── NW trend (reuse NET_WORTH_HISTORY + append live calc) ──────────────────
  const trendData = [
    ...NET_WORTH_HISTORY.slice(0, -1),
    { month: "May", value: netWorth },
  ];

  // ── Asset category rows ─────────────────────────────────────────────────────
  const ASSET_CATS = [
    {
      key:"cash", label:"Cash & Banking", icon:"💵", color:"#4f8ef7",
      value: cashAssets, connected: true,
      detail: accounts.filter(a => a.type !== "credit").map(a => ({
        name: a.name, val: a.balance, sub: `••••${a.last4} · ${a.institution}`
      }))
    },
    {
      key:"invest", label:"Investments", icon:"📈", color:"#10b981",
      value: investAssets, connected: MOCK.portfolio.connected,
      connectLabel: "Connect via SnapTrade",
      detail: MOCK.portfolio.holdings.map(h => ({
        name: `${h.ticker} · ${h.name}`, val: h.value,
        sub: `${h.shares} shares · ${h.change >= 0 ? "+" : ""}${h.change}% today`
      }))
    },
    {
      key:"crypto", label:"Crypto", icon:"₿", color:"#f59e0b",
      value: cryptoAssets, connected: MOCK.crypto.connected,
      connectLabel: "Connect Coinbase / Kraken",
      detail: MOCK.crypto.holdings.map(h => ({
        name: `${h.symbol} · ${h.name}`, val: h.value,
        sub: `${h.qty} ${h.symbol} · ${h.change >= 0 ? "+" : ""}${h.change}% today`
      }))
    },
    {
      key:"realestate", label:"Real Estate", icon:"🏠", color:"#6366f1",
      value: realEstateEquity, connected: false,
      connectLabel: "Add property manually",
      detail: MOCK.realEstate.properties.map(p => ({
        name: p.name, val: p.equity,
        sub: `Est. value: ${fmt(p.estimatedValue)} · Mortgage: ${fmt(p.mortgage)}`
      }))
    },
  ];

  const LIAB_CATS = [
    {
      key:"credit", label:"Credit Cards", icon:"💳", color:"#f43f5e",
      value: creditLiab, connected: true,
      detail: accounts.filter(a => a.type === "credit").map(a => ({
        name: a.name, val: Math.abs(a.balance), sub: `••••${a.last4} · ${a.institution}`
      }))
    },
    {
      key:"student", label:"Student Loan", icon:"🎓", color:"#f97316",
      value: studentLiab, connected: false,
      detail: [{ name:"Federal Student Loan", val: studentLiab, sub:"Est. payoff: Jan 2029" }]
    },
    {
      key:"car", label:"Car Loan", icon:"🚗", color:"#fb923c",
      value: carLiab, connected: false,
      detail: [{ name:"Auto Financing", val: carLiab, sub:"Est. payoff: Jan 2027" }]
    },
  ];

  const Card = ({label, icon, color, value, connected, connectLabel, detail, catKey}) => {
    const open = expanded[catKey];
    return (
      <div style={{background:"var(--bg3)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>toggle(catKey)}>
          <div style={{width:34,height:34,borderRadius:9,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600}}>{label}</div>
            <div style={{fontSize:10,color:"var(--text3)",marginTop:1}}>
              {connected ? <span style={{color:"var(--green)"}}>● Connected</span> : <span style={{color:"var(--text3)"}}>○ {connectLabel || "Manual"}</span>}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,color: value > 0 ? "var(--text)" : "var(--text3)"}}>{value > 0 ? fmt(value) : "—"}</div>
            <div style={{fontSize:10,color:"var(--text3)",marginTop:1}}>{Math.round((value / (value > 500 ? totalAssets : totalLiab || 1)) * 100)}%</div>
          </div>
          <span style={{color:"var(--text3)",fontSize:12,marginLeft:4,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"none"}}>▾</span>
        </div>
        {open && (
          <div style={{borderTop:"1px solid var(--border)",padding:"8px 14px 12px"}}>
            {detail.length === 0 ? (
              <div style={{fontSize:12,color:"var(--text3)",padding:"8px 0"}}>No data — {connectLabel}</div>
            ) : detail.map((d,i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom: i<detail.length-1?"1px solid var(--border)":"none"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:500}}>{d.name}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{d.sub}</div>
                </div>
                <div style={{fontWeight:600,fontSize:13,color}}>{fmt(d.val)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {error && <ErrorNotice message={error} />}
      {/* ── Hero net worth ── */}
      <div style={{
        background:"linear-gradient(135deg,rgba(79,142,247,0.1),rgba(99,102,241,0.06))",
        border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"20px 24px", marginBottom:16,
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16
      }}>
        <div>
          <div style={{fontSize:12,color:"var(--text3)",fontWeight:600,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Total Net Worth</div>
          <div style={{fontFamily:"Syne",fontWeight:800,fontSize:38,lineHeight:1,color: netWorth >= 0 ? "var(--text)" : "var(--red)"}}>{fmt(netWorth)}</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,flexWrap:"wrap"}}>
            <span className={`change-badge ${nwGrowth >= 0 ? "pos" : "neg"}`}>{nwGrowth >= 0 ? "↑" : "↓"} {Math.abs(nwGrowth).toFixed(1)}% vs last month</span>
            <span style={{fontSize:12,color:"var(--text3)"}}>{fmt(netWorth - prevNW)} change</span>
          </div>
        </div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          {[
            {label:"Total Assets",      val:totalAssets, color:"var(--green)"},
            {label:"Total Liabilities", val:totalLiab,   color:"var(--red)"},
            {label:"Debt Ratio",        val:`${Math.round(debtRatio*100)}%`, color: debtRatio < 0.36 ? "var(--green)" : "var(--yellow)", raw:true},
          ].map(s => (
            <div key={s.label}>
              <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{s.label}</div>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:18,color:s.color}}>{s.raw ? s.val : fmt(s.val)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid-4 mb-4" style={{gap:12}}>
        {[
          {label:"Monthly Cash Flow",   val:fmt(cashflowNet), color: cashflowNet>=0?"var(--green)":"var(--red)", icon:"💵", sub:`${savingsRate}% savings rate`},
          {label:"Emergency Fund",      val:`${Math.round(emergencyPct*100)}%`, color:"var(--accent)", icon:"🛡️", sub: emergencyGoal ? `${fmt(emergencyGoal.current)} / ${fmt(emergencyGoal.target)}` : "No goal set"},
          {label:"Credit Score",        val:creditScore, color:"#a3e635", icon:"⭐", sub:scoreLabel(creditScore)},
          {label:"Funding Readiness",   val:fundingReady?"Ready":"Building", color:fundingReady?"var(--green)":"var(--yellow)", icon:"🚀", sub: fundingReady ? "Strong cash flow + emergency fund" : "Keep building savings"},
        ].map(k => (
          <div key={k.label} className="card" style={{padding:"14px 16px"}}>
            <div style={{fontSize:18,marginBottom:6}}>{k.icon}</div>
            <div className="card-title">{k.label}</div>
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:20,color:k.color}}>{k.val}</div>
            <div className="card-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start",marginBottom:16}}>
        {/* ── Net worth trend (reuses LineChart) ── */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15}}>Net Worth Trend</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span className="change-badge pos">↑ {fmt(nwGrowth >= 0 ? netWorth - prevNW : 0)} this month</span>
            </div>
          </div>
          <LineChart data={trendData} color="#4f8ef7" height={120} />
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            {trendData.map((d,i) => (
              <span key={i} style={{fontSize:9,color:"var(--text3)"}}>{d.month}</span>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
            {[{l:"6-Month Start",v:NET_WORTH_HISTORY[0].value},{l:"Current",v:netWorth},{l:"6-Mo Growth",v:netWorth - NET_WORTH_HISTORY[0].value}].map(r=>(
              <div key={r.l}>
                <div style={{fontSize:10,color:"var(--text3)",marginBottom:2}}>{r.l}</div>
                <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,color:r.l.includes("Growth") && r.v>=0?"var(--green)":r.l.includes("Growth")?"var(--red)":"var(--text)"}}>{fmtK(r.v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Asset vs Liability donut ── */}
        <div className="card" style={{textAlign:"center"}}>
          <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:12,textAlign:"left"}}>Asset Allocation</div>
          <div className="donut-wrap">
            <DonutChart data={allocData} size={150} thickness={26} />
            <div className="donut-center">
              <div style={{fontSize:10,color:"var(--text3)"}}>Assets</div>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:16}}>{fmtK(totalAssets)}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:10,textAlign:"left"}}>
            {allocData.map(d=>(
              <div key={d.label} style={{display:"flex",alignItems:"center",gap:7,justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                  <span style={{fontSize:12,color:"var(--text2)"}}>{d.label}</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:12,fontWeight:600}}>{fmt(d.value)}</span>
                  <span style={{fontSize:11,color:"var(--text3)"}}>{Math.round(d.value/totalAssets*100)}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Liability mini donut */}
          {liabData.length > 0 && (
            <>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,margin:"16px 0 10px",textAlign:"left"}}>Liabilities</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,textAlign:"left"}}>
                {liabData.map(d=>(
                  <div key={d.label} style={{display:"flex",alignItems:"center",gap:7,justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                      <span style={{fontSize:12,color:"var(--text2)"}}>{d.label}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--red)"}}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Asset vs Liability bar comparison ── */}
      <div className="card mb-4">
        <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:12}}>Assets vs Liabilities</div>
        {[
          {label:"Assets",      val:totalAssets, max:totalAssets, color:"var(--green)"},
          {label:"Liabilities", val:totalLiab,   max:totalAssets, color:"var(--red)"},
          {label:"Net Worth",   val:netWorth,    max:totalAssets, color:"var(--accent)"},
        ].map(r=>(
          <div key={r.label} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:500}}>{r.label}</span>
              <span style={{fontSize:13,fontWeight:700,color:r.color}}>{fmt(r.val)}</span>
            </div>
            <div className="progress-bar" style={{height:8}}>
              <div className="progress-fill" style={{width:`${Math.max(0,Math.min(100,(r.val/r.max)*100))}%`,background:r.color}}/>
            </div>
          </div>
        ))}
        <div style={{marginTop:8,padding:"10px 12px",background: debtRatio < 0.36 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", borderRadius:9, border:`1px solid ${debtRatio < 0.36 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`}}>
          <span style={{fontSize:12,color: debtRatio < 0.36 ? "var(--green)" : "var(--yellow)",fontWeight:600}}>
            {debtRatio < 0.36 ? "✓ Healthy debt ratio" : "⚠ Debt ratio above recommended 36%"} — {Math.round(debtRatio*100)}% of assets
          </span>
        </div>
      </div>

      {/* ── Expandable asset categories ── */}
      <div className="grid-2" style={{gap:16}}>
        <div>
          <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:10}}>Assets</div>
          {ASSET_CATS.map(c => (
            <Card key={c.key} catKey={c.key} label={c.label} icon={c.icon} color={c.color}
              value={c.value} connected={c.connected} connectLabel={c.connectLabel} detail={c.detail} />
          ))}
        </div>
        <div>
          <div style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:10}}>Liabilities</div>
          {LIAB_CATS.map(c => (
            <Card key={c.key} catKey={c.key} label={c.label} icon={c.icon} color={c.color}
              value={c.value} connected={c.connected} connectLabel={c.connectLabel} detail={c.detail} />
          ))}
          {/* Monthly performance */}
          <div style={{marginTop:16,fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:10}}>Monthly Performance</div>
          <div className="card" style={{padding:16}}>
            {[
              {label:"Income",           val:MOCK.income,       color:"var(--green)"},
              {label:"Spending",         val:MOCK.spending,     color:"var(--red)"},
              {label:"Net Cash Flow",    val:cashflowNet,       color:cashflowNet>=0?"var(--green)":"var(--red)"},
              {label:"Savings Rate",     val:`${savingsRate}%`, color:"var(--accent)", raw:true},
              {label:"Debt Payments",    val:carLiab/12 + studentLiab/12, color:"var(--yellow)"},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:12,color:"var(--text2)"}}>{r.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:r.color}}>{r.raw ? r.val : fmt(r.val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
// Grouped sidebar nav
const NAV_GROUPS = [
  { label: "Main", items: [
    { id:"dashboard",    icon:"⊞", label:"Dashboard"    },
    { id:"net-worth",    icon:"💎", label:"Net Worth"    },
    { id:"budget",       icon:"◎", label:"Budget"        },
    { id:"transactions", icon:"⇅", label:"Transactions"  },
    { id:"bills",        icon:"📋", label:"Bills"         },
    { id:"calendar",     icon:"📅", label:"Calendar"      },
  ]},
  { label: "Wealth", items: [
    { id:"portfolio",     icon:"📈", label:"Portfolio"     },
    { id:"profit-lock",   icon:"🔒", label:"Profit Lock"   },
    { id:"credit-score",  icon:"⭐", label:"Credit Score"  },
    { id:"goals",         icon:"🎯", label:"Goals"         },
    { id:"reports",       icon:"📊", label:"Reports"       },
  ]},
  { label: "Tools", items: [
    { id:"ai-coach",     icon:"✦",  label:"AI Coach"      },
    { id:"settings",     icon:"⚙",  label:"Settings"      },
  ]},
];

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

// Bottom nav: 5 primary pages
const BOTTOM_NAV = [
  { id:"dashboard",    icon:"⊞", label:"Home"   },
  { id:"budget",       icon:"◎", label:"Budget" },
  { id:"calendar",     icon:"📅", label:"Cal"   },
  { id:"bills",        icon:"📋", label:"Bills" },
  { id:"ai-coach",     icon:"✦",  label:"Coach" },
];

// FAB overflow pages (not in bottom nav)
const FAB_PAGES = [
  { id:"net-worth",     icon:"💎", label:"Net Worth"    },
  { id:"transactions",  icon:"⇅", label:"Transactions"  },
  { id:"portfolio",     icon:"📈", label:"Portfolio"     },
  { id:"profit-lock",   icon:"🔒", label:"Profit Lock"   },
  { id:"credit-score",  icon:"⭐", label:"Credit Score"  },
  { id:"goals",         icon:"🎯", label:"Goals"         },
  { id:"reports",       icon:"📊", label:"Reports"       },
  { id:"settings",      icon:"⚙",  label:"Settings"      },
];

const PAGE_TITLES = {
  "credit-score":"Credit Score", "reports":"Reports", "profit-lock":"Profit Lock", "net-worth":"Net Worth Command Center", dashboard:"Dashboard", budget:"Budget", transactions:"Transactions",
  bills:"Bills & Subscriptions", calendar:"Calendar", portfolio:"Portfolio",
  goals:"Goals", reports:"Reports", "ai-coach":"AI Coach", settings:"Settings",
};

export default function WealthPilotOS() {
  const { user, loading, login, signup, logout } = useAuth();
  const acct = useAccounts();
  const { mode, setMode, config: modeConfig, suggestion: modeSuggestion } = useMode();
  const [page, setPage]           = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [fabOpen, setFabOpen]     = useState(false);
  const [toasts, setToasts]       = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [modeOpen, setModeOpen]   = useState(false);
  const [liveDataLoading, setLiveDataLoading] = useState(true);
  const [liveDataError, setLiveDataError] = useState("");
  const [liveData, setLiveData] = useState({
    accounts: [],
    bills: [],
    transactions: [],
    budgets: [],
    portfolio: { ...MOCK.portfolio, connected: false, holdings: [], totalValue: 0, dayChange: 0, dayChangePct: 0 },
    creditScore: null,
  });
  const [liveStatus, setLiveStatus] = useState({
    accounts: { loading: true, error: false },
    transactions: { loading: true, error: false },
    bills: { loading: true, error: false },
    budgets: { loading: true, error: false },
    calendarEvents: { loading: true, error: false },
    creditScore: { loading: true, error: false },
    portfolio: { loading: true, error: false },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLiveDataLoading(true);
      setLiveDataError("");
      const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback; } };
      const accounts = await safe(async () => {
        const res = await fetch("/api/accounts");
        if (!res.ok) throw new Error("accounts unavailable");
        const payload = await res.json();
        return ensureArray(payload?.data ?? payload, []);
      }, acct.accounts);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const bills = ensureArray(await safe(() => billsApi.list(), []), []);
      const transactions = ensureArray(await safe(() => txApi.list(), []), []);
      const budgets = ensureArray(await safe(() => budgetsApi.list(currentMonth, currentYear), []), []);
      const portfolio = await safe(async () => {
        const p = await portfolioApi.list();
        if (Array.isArray(p)) {
          const totalValue = p.reduce((s, h) => s + (h.value || 0), 0);
          return { ...MOCK.portfolio, connected: p.length > 0, holdings: p, totalValue };
        }
        return p || MOCK.portfolio;
      }, MOCK.portfolio);
      const creditScore = await safe(() => creditScoreApi.get(), null);
      setLiveData({
        accounts: ensureArray(accounts, acct.accounts),
        bills,
        transactions,
        budgets,
        portfolio,
        creditScore
      });
    };
    fetchData();
  }, [acct.accounts]);

  const addToast = (msg, type="info") => {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3000);
  };

  // Alert engine — uses live account + bill + budget data
  const alertEngine = useAlerts({
    accounts:     liveData.accounts.length ? liveData.accounts : acct.accounts,
    bills:        liveData.bills,
    budget:       liveData.budgets,
    transactions: liveData.transactions,
    portfolio:    liveData.portfolio,
    goals:        INIT_GOALS,
    mode,
  });

  // Auth handler for AuthGate
  const handleAuth = async (mode, email, password, name) => {
    if (mode === "login")  await login(email, password);
    if (mode === "signup") await signup(email, password, name);
  };

  // Show auth gate if not logged in (null = still loading)
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#0a0b0e",display:"flex",alignItems:"center",justifyContent:"center",color:"#f0f2f7",fontFamily:"sans-serif"}}>
      Loading…
    </div>
  );
  if (!user) return <AuthGate onAuth={handleAuth} />;

  const showPage = (id) => { setPage(id); setFabOpen(false); };

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard setPage={showPage} accounts={liveData.accounts.length ? liveData.accounts : acct.accounts} syncing={acct.syncing} lastSync={acct.lastSync} onRefresh={acct.refresh} bills={liveData.bills} budget={liveData.budgets} transactions={liveData.transactions} portfolio={liveData.portfolio} creditScore={liveData.creditScore} status={liveStatus} />;
      case "net-worth":    return <NetWorthPage accounts={acct.accounts} totalCash={acct.totalCash} creditDebt={acct.creditDebt} />;
      case "budget":       return <BudgetPage modeConfig={modeConfig} budgets={liveData.budgets} />;
      case "transactions": return <TransactionsPage transactions={liveData.transactions} />;
      case "bills":        return <BillsPage />;
      case "calendar":     return <CalendarPage addToast={addToast} />;
      case "portfolio":    return <PortfolioPage portfolioData={liveData.portfolio} />;
      case "profit-lock":  return <ProfitLockPage addToast={addToast} />;
      case "credit-score": return <CreditScorePage addToast={addToast} initialScore={liveData.creditScore} />;
      case "goals":        return <GoalsPage addToast={addToast} modeConfig={modeConfig} />;
      case "reports":      return <ReportsPage />;
      case "ai-coach":     return <AICoachPage modeConfig={modeConfig} />;
      case "settings":     return <SettingsPage addToast={addToast} user={user} />;
      default:             return <Dashboard setPage={showPage} />;
    }
  };

 return (
  <>
    <style>{css}</style>

    <Toast toasts={toasts} />

    <div className="app">
        {/* ── Desktop Sidebar ── */}
        <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-logo" style={{cursor:"pointer"}} onClick={() => setCollapsed(c => !c)}>
            <div className="logo-mark">W</div>
            <div className="logo-text">Wealth<span>Pilot</span> OS</div>
          </div>

          <div className="nav">
            {NAV_GROUPS.map((g, gi) => (
              <div key={gi}>
                <div className="nav-group-label">{g.label}</div>
                {g.items.map(n => (
                  <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>showPage(n.id)}>
                    <span className="nav-icon">{n.icon}</span>
                    <span>{n.label}</span>
                  </div>
                ))}
                {gi < NAV_GROUPS.length-1 && <div className="nav-divider"/>}
              </div>
            ))}
          </div>

          <div className="sidebar-bottom">
            <div className="nav-item" style={{cursor:"default"}}>
              <span className="nav-icon">👤</span>
              <span style={{fontSize:13,fontWeight:500}}>{user?.user_metadata?.name || user?.name || user?.email || "WealthPilot User"}</span>
            </div>
            <div className="plan-badge">✦ Pro Plan</div>
            <div className="nav-item" style={{marginTop:4,color:"var(--red)"}} onClick={logout}>
              <span className="nav-icon">⎋</span>
              <span>Sign Out</span>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <div className="main">
          <div className="topbar">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="logo-mark" style={{display:"none"}} id="mobile-logo">W</div>
              <div className="page-title">{PAGE_TITLES[page]}</div>
            </div>
            <div className="topbar-right">
              {page==="dashboard"&&(
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text2)"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block"}}/>
                  <span className="plaid-sync-text" style={{whiteSpace:"nowrap"}}>Plaid synced 2m ago</span>
                </div>
              )}
              <div className="badge badge-red" style={{fontWeight:700}}>UI VERSION: 2026-05-11-3</div>
              {/* Mode selector */}
              <div style={{position:"relative"}}>
                {modeOpen && <div style={{position:"fixed",inset:0,zIndex:299}} onClick={()=>setModeOpen(false)}/>}
                <button className="mode-pill" onClick={()=>setModeOpen(o=>!o)}
                  style={{background:modeConfig.bg, borderColor:modeConfig.border, color:modeConfig.color}}>
                  {modeConfig.icon} {modeConfig.label}
                </button>
                {modeOpen && (
                  <div className="mode-dropdown">
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:"var(--text3)",padding:"4px 12px 8px"}}>Financial Mode</div>
                    {modeSuggestion && (
                      <div style={{margin:"0 4px 8px",padding:"8px 10px",borderRadius:9,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.25)"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--yellow)",marginBottom:2}}>💡 AI Suggestion</div>
                        <div style={{fontSize:10,color:"var(--text2)",lineHeight:1.4}}>{modeSuggestion.reason}</div>
                        <button className="btn btn-ghost btn-sm" style={{marginTop:6,padding:"2px 8px",fontSize:10,color:"var(--yellow)",borderColor:"rgba(245,158,11,0.3)"}}
                          onClick={()=>{ setMode(modeSuggestion.suggest); setModeOpen(false); addToast(`Switched to ${MODES[modeSuggestion.suggest].label} mode`,"info"); }}>
                          Switch to {MODES[modeSuggestion.suggest]?.label} →
                        </button>
                      </div>
                    )}
                    {Object.values(MODES).map(m => (
                      <div key={m.id} className={`mode-option ${mode===m.id?"active":""}`}
                        onClick={()=>{ setMode(m.id); setModeOpen(false); addToast(`Mode: ${m.label}`,"info"); }}>
                        <span className="mode-icon">{m.icon}</span>
                        <div>
                          <div className="mode-label" style={{color:m.color}}>{m.label}</div>
                          <div className="mode-tagline">{m.tagline}</div>
                        </div>
                        {mode===m.id && <span style={{marginLeft:"auto",color:m.color,fontSize:12}}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn btn-ghost btn-sm alert-bell" onClick={()=>setAlertOpen(o=>!o)}>
                🔔
                {alertEngine.unread > 0 && (
                  <span className={`alert-badge ${alertEngine.critical===0?"warning":""}`}>
                    {alertEngine.unread > 9 ? "9+" : alertEngine.unread}
                  </span>
                )}
              </button>
              <div className="avatar">AC</div>
            </div>
          </div>

          {/* Mode banner */}
          <div className="mode-banner" style={{background:modeConfig.bg, color:modeConfig.color}}>
            <span style={{fontSize:14}}>{modeConfig.icon}</span>
            <span style={{fontWeight:700}}>{modeConfig.label} Mode</span>
            <span style={{color:"var(--text2)",fontWeight:400}}>— {modeConfig.dashBanner}</span>
          </div>

          {page==="ai-coach" ? renderPage() : <div className="content">{renderPage()}</div>}
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="bottom-nav" style={{display:"none"}}>
          {BOTTOM_NAV.map(n => (
            <div key={n.id} className={`bottom-nav-item ${page===n.id?"active":""}`} onClick={()=>showPage(n.id)}>
              <div className="bnav-icon">{n.icon}</div>
              <div>{n.label}</div>
            </div>
          ))}
        </nav>

        {/* ── Mobile FAB (overflow pages) ── */}
        {fabOpen && <div style={{position:"fixed",inset:0,zIndex:198}} onClick={()=>setFabOpen(false)}/>}

        {/* ── Alert Center ── */}
        {alertOpen && <div style={{position:"fixed",inset:0,zIndex:499}} onClick={()=>setAlertOpen(false)}/>}
        {alertOpen && (
          <AlertCenter
            alerts={alertEngine.alerts}
            unread={alertEngine.unread}
            critical={alertEngine.critical}
            dismiss={alertEngine.dismiss}
            dismissAll={alertEngine.dismissAll}
            onClose={()=>setAlertOpen(false)}
          />
        )}
        <div className={`fab-menu ${fabOpen?"open":""}`}>
          {FAB_PAGES.map(n=>(
            <div key={n.id} className={`fab-menu-item ${page===n.id?"active":""}`} onClick={()=>showPage(n.id)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </div>
        <button className={`fab ${fabOpen?"open":""}`} onClick={()=>setFabOpen(o=>!o)}>+</button>
      </div>
    </>
  );
}
