import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase";

// ── API CLIENT ────────────────────────────────────────────────────────────────
// LIVE: uncomment the import below and remove the stub block beneath it.
// Place api-client.js in the same directory as this file before enabling.
//
import { auth as authApi, bills as billsApi, calendarEvents as calApi, ai as aiApi, transactions as txApi, budgets as budgetsApi, portfolio as portfolioApi, creditScore as creditScoreApi, debts as debtsApi, plaid as plaidApi, reminders as remindersApi } from './api-client';
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



const getDueInDays = (bill, now = new Date()) => {
  if (bill?.dueDate) {
    const due = new Date(bill.dueDate);
    if (!Number.isNaN(due.getTime())) {
      return Math.ceil((due.setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / (1000*60*60*24));
    }
  }
  const dueDay = Number(bill?.dueDay);
  if (!Number.isFinite(dueDay) || dueDay <= 0) return 999;
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueThisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay);
  const due = dueThisMonth >= current ? dueThisMonth : new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  return Math.ceil((due - current) / (1000*60*60*24));
};

const buildRuleBasedMoneyMove = ({ income, upcomingBills = [], budget = [], spending = 0, goals = [], creditScoreValue = 0, creditUtilization = null, totalCash = 0 }) => {
  const highBudget = budget
    .map((item) => ({ ...item, pct: (Number(item?.spent || 0) / Math.max(1, Number(item?.limit || 0))) * 100 }))
    .filter((item) => Number(item.limit || 0) > 0)
    .sort((a, b) => b.pct - a.pct)[0];
  const dueSoonBill = upcomingBills
    .map((bill) => ({ ...bill, dueInDays: getDueInDays(bill) }))
    .filter((bill) => bill.dueInDays >= 0)
    .sort((a, b) => a.dueInDays - b.dueInDays)[0];
  const billTotal = upcomingBills.reduce((sum, bill) => sum + Number(bill?.amount || 0), 0);
  const leftAfterBills = Math.max(0, income - billTotal);
  const utilization = Number(creditUtilization);

  if (Number.isFinite(utilization) && utilization >= 0.35) {
    const paydown = Math.max(50, Math.round((utilization - 0.3) * 1000 / 10) * 10);
    return {
      source: 'rules',
      main: `Your utilization is ${Math.round(utilization * 100)}%. Pay ${fmt(paydown)} before your statement date.`,
      why: 'Lower utilization can improve your score and reduce borrowing risk.',
      actionLabel: 'Ask AI Coach',
      actionPage: 'ai-coach',
    };
  }

  if (dueSoonBill && dueSoonBill.dueInDays <= 3) {
    return {
      source: 'rules',
      main: `${dueSoonBill.name} is due in ${dueSoonBill.dueInDays} day${dueSoonBill.dueInDays === 1 ? '' : 's'}. Pay ${fmt(dueSoonBill.amount)} now to avoid a late fee.`,
      why: 'Staying current on bills protects cash flow and your credit profile.',
      actionLabel: 'Mark Bill Paid',
      actionPage: 'bills',
    };
  }

  if (highBudget && highBudget.pct >= 80) {
    const daysWindow = Math.max(1, Math.min(7, daysLeft));
    const remaining = Math.max(0, Number(highBudget.limit || 0) - Number(highBudget.spent || 0));
    return {
      source: 'rules',
      main: `You spent ${Math.round(highBudget.pct)}% of your ${highBudget.category} budget. Limit spending to ${fmt(remaining / daysWindow)} for the next ${daysWindow} days.`,
      why: 'Pacing spending now helps you avoid budget overruns before month-end.',
      actionLabel: 'View Budget',
      actionPage: 'budget',
    };
  }

  if (leftAfterBills > 0) {
    const saveAmt = Math.max(25, Math.round((leftAfterBills * 0.3) / 5) * 5);
    const essentials = Math.max(50, Math.round((leftAfterBills * 0.45) / 5) * 5);
    return {
      source: 'rules',
      main: `You have ${fmt(leftAfterBills)} left after bills. Put ${fmt(saveAmt)} toward savings and keep ${fmt(essentials)} for food and gas.`,
      why: 'Automating a split between savings and essentials keeps progress consistent.',
      actionLabel: goals.length ? 'Add Goal' : 'Add Goal',
      actionPage: 'goals',
    };
  }

  if (!upcomingBills.length) {
    return {
      source: 'rules',
      main: 'No upcoming bills found. Add your recurring bills so your plan is accurate.',
      why: 'Reliable due dates make your cash-flow guidance and reminders smarter.',
      actionLabel: 'Add Bill',
      actionPage: 'bills',
    };
  }

  if (!budget.length) {
    return {
      source: 'rules',
      main: 'You do not have budget categories yet. Set one up to unlock targeted spending coaching.',
      why: 'Category limits are needed for next-best-move recommendations.',
      actionLabel: 'Add Category',
      actionPage: 'budget',
    };
  }

  return {
    source: 'rules',
    main: `Your score is ${creditScoreValue}. Keep paying on time and monitor balances weekly.`,
    why: 'Small weekly actions build long-term financial momentum.',
    actionLabel: 'Ask AI Coach',
    actionPage: 'ai-coach',
  };
};
const incomeToMonthly = (entry) => {
  const amount = Number(entry?.amount || 0);
  switch ((entry?.frequency || '').toLowerCase()) {
    case 'weekly': return amount * 4.33;
    case 'bi-weekly': return amount * 2.17;
    case 'twice per month': return amount * 2;
    case 'monthly': return amount;
    case 'one-time': {
      const d = entry?.next_pay_date ? new Date(entry.next_pay_date) : null;
      const now = new Date();
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? amount : 0;
    }
    case 'custom': return Number(entry?.monthly_estimate || 0);
    default: return amount;
  }
};
const today = new Date();
const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfWeek = (date = new Date()) => {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};

function safeToSpend() {
  const totalCash = MOCK.accounts.filter(a => a.type !== "credit").reduce((s, a) => s + a.balance, 0);
  const upcomingBills = MOCK.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const avgDaily = MOCK.spending / 30;
  return Math.max(0, totalCash - upcomingBills - avgDaily * daysLeft * 0.5);
}



function calculateFinancialHealthScore({ budget = [], bills = [], accounts = [], income = 0, spending = 0, creditDebt = 0, creditScore = null, netWorth = null, transactions = [] }) {
  const todayDate = new Date();
  const currentDay = todayDate.getDate();
  const components = [];
  const tips = [];

  const safeBudget = Array.isArray(budget) ? budget : [];
  if (safeBudget.length > 0) {
    const usageRatios = safeBudget
      .filter((b) => Number(b?.limit) > 0)
      .map((b) => Math.max(0, Number(b?.spent || 0)) / Math.max(1, Number(b?.limit || 1)));
    if (usageRatios.length > 0) {
      const avgUsage = usageRatios.reduce((sum, ratio) => sum + ratio, 0) / usageRatios.length;
      const budgetScore = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, avgUsage - 0.7) * 120)));
      components.push({ weight: 1.3, score: budgetScore });
      const nearMax = safeBudget.find((b) => Number(b?.limit) > 0 && (Number(b?.spent || 0) / Number(b?.limit || 1)) >= 0.9);
      if (nearMax) tips.push(`Your ${nearMax.category || "budget"} budget is almost maxed out.`);
    }
  }

  const safeBills = Array.isArray(bills) ? bills : [];
  if (safeBills.length > 0) {
    const paidBills = safeBills.filter((b) => b?.paid).length;
    const dueBills = safeBills.filter((b) => Number(b?.dueDay || 0) <= currentDay).length;
    const onTimeRate = dueBills > 0 ? paidBills / dueBills : paidBills / safeBills.length;
    const billScore = Math.max(0, Math.min(100, Math.round(onTimeRate * 100)));
    components.push({ weight: 1.2, score: billScore });
    if (safeBills.some((b) => !b?.paid)) tips.push("Pay upcoming bills on time to protect your score.");
  }

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const savingsBalance = safeAccounts.filter((a) => a?.type === 'savings').reduce((sum, a) => sum + Number(a?.balance || 0), 0);
  const monthlyNeed = Math.max(1, Number(spending || 0));
  if (savingsBalance > 0 || monthlyNeed > 1) {
    const emergencyCoverageMonths = savingsBalance / monthlyNeed;
    const savingsProgress = Math.max(0, Math.min(100, Math.round((emergencyCoverageMonths / 6) * 100)));
    components.push({ weight: 1.1, score: savingsProgress });
    if (emergencyCoverageMonths < 1) tips.push("Build your emergency fund to cover at least one month of expenses.");
    else if (emergencyCoverageMonths < 3) tips.push("Keep growing savings toward a 3-month emergency fund target.");
  }

  const debtAmount = Math.abs(Math.min(0, Number(creditDebt || 0)));
  if (debtAmount > 0 && income > 0) {
    const dti = debtAmount / Number(income);
    const dtiScore = Math.max(0, Math.min(100, Math.round(100 - dti * 180)));
    components.push({ weight: 1, score: dtiScore });
    if (dti > 0.35) tips.push("Lower debt-to-income by paying down high-interest balances.");
  }

  const scoreValue = Number(creditScore?.latest?.score || creditScore?.score || 0);
  if (scoreValue > 0) {
    const normalizedCredit = Math.max(0, Math.min(100, Math.round(((scoreValue - 300) / 550) * 100)));
    components.push({ weight: 0.9, score: normalizedCredit });
    if (scoreValue < 700) tips.push("Lower credit utilization to improve your financial health.");
  }

  if (typeof netWorth === 'number' && Number.isFinite(netWorth)) {
    const nwScore = netWorth >= 0 ? Math.min(100, Math.round(50 + Math.min(netWorth / 2000, 50))) : Math.max(0, Math.round(50 + netWorth / 2000));
    components.push({ weight: 0.7, score: nwScore });
  }

  if (income <= 0) tips.push("Add income to improve your score accuracy.");

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const finalScore = totalWeight > 0
    ? Math.round(components.reduce((sum, c) => sum + (c.score * c.weight), 0) / totalWeight)
    : 0;

  const status = finalScore >= 90 ? 'Excellent'
    : finalScore >= 75 ? 'Strong'
    : finalScore >= 60 ? 'Improving'
    : finalScore >= 40 ? 'Needs Attention'
    : 'Critical';

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    status,
    tips: (tips.length ? tips : [
      'Add income to improve your score accuracy.',
      'Pay upcoming bills on time to protect your score.',
      'Lower credit utilization to improve your financial health.',
    ]).slice(0, 3),
  };
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
  ai: "I can still coach you right now with practical steps for budget, bills, savings, debt payoff, and credit planning.",
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

const ONBOARDING_STORAGE_KEY = 'wp_onboarding_state';
const ONBOARDING_GOALS = ["Save money", "Pay debt", "Build credit", "Invest", "Prepare for funding", "Track net worth"];

function OnboardingWizard({ onComplete, onSkip }) {
  const steps = ["Welcome", "Income", "Bills", "Accounts", "Categories", "Credit Score", "Goal"];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    monthlyIncome: "",
    billName: "",
    billAmount: "",
    billDueDay: "",
    accountMethod: "plaid",
    accountName: "",
    accountBalance: "",
    categoryName: "",
    creditScore: "",
    goal: ONBOARDING_GOALS[0],
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || '{}');
      if (Number.isInteger(saved.step)) setStep(saved.step);
      if (saved.form && typeof saved.form === 'object') setForm(prev => ({ ...prev, ...saved.form }));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ completed: false, step, form })); } catch {}
  }, [step, form]);

  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));
  const finish = () => onComplete(form);

  return (
    <div className="card" style={{maxWidth:640,margin:"18px auto"}}>
      <div className="card-title">Setup Wizard · Step {step + 1} of {steps.length}</div>
      <div className="text-sm text-muted" style={{marginBottom:12}}>{steps[step]}</div>
      {step===0 && <p className="text-sm">Welcome to WealthPilot. Let’s set up your financial workspace in a minute.</p>}
      {step===1 && <input className="input" placeholder="Monthly income (USD)" value={form.monthlyIncome} onChange={(e)=>setForm(f=>({...f,monthlyIncome:e.target.value}))} />}
      {step===2 && <div style={{display:"grid",gap:8}}><input className="input" placeholder="Bill name" value={form.billName} onChange={(e)=>setForm(f=>({...f,billName:e.target.value}))} /><input className="input" placeholder="Amount" value={form.billAmount} onChange={(e)=>setForm(f=>({...f,billAmount:e.target.value}))} /><input className="input" placeholder="Due day (1-31)" value={form.billDueDay} onChange={(e)=>setForm(f=>({...f,billDueDay:e.target.value}))} /></div>}
      {step===3 && <div style={{display:"grid",gap:8}}><select className="input" value={form.accountMethod} onChange={(e)=>setForm(f=>({...f,accountMethod:e.target.value}))}><option value="plaid">Connect bank with Plaid</option><option value="manual">Enter account manually</option></select>{form.accountMethod==="manual" && <><input className="input" placeholder="Account name" value={form.accountName} onChange={(e)=>setForm(f=>({...f,accountName:e.target.value}))} /><input className="input" placeholder="Starting balance" value={form.accountBalance} onChange={(e)=>setForm(f=>({...f,accountBalance:e.target.value}))} /></>}</div>}
      {step===4 && <input className="input" placeholder="Budget category (example: Groceries)" value={form.categoryName} onChange={(e)=>setForm(f=>({...f,categoryName:e.target.value}))} />}
      {step===5 && <input className="input" placeholder="Credit score (optional)" value={form.creditScore} onChange={(e)=>setForm(f=>({...f,creditScore:e.target.value}))} />}
      {step===6 && <select className="input" value={form.goal} onChange={(e)=>setForm(f=>({...f,goal:e.target.value}))}>{ONBOARDING_GOALS.map(g=><option key={g} value={g}>{g}</option>)}</select>}

      <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
        {step>0 && <button className="btn btn-ghost btn-sm" onClick={prev}>Back</button>}
        {step<steps.length-1 ? <button className="btn btn-primary btn-sm" onClick={next}>Continue</button> : <button className="btn btn-primary btn-sm" onClick={finish}>Finish Setup</button>}
        {[3,5].includes(step) && <button className="btn btn-ghost btn-sm" onClick={next}>Skip</button>}
        <button className="btn btn-ghost btn-sm" onClick={onSkip}>Skip all for now</button>
      </div>
    </div>
  );
}


// ─── AUTH HOOK ────────────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser]       = useState(null);   // null = loading, false = logged out
  const [loading, setLoading] = useState(false);

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
const AUTH_DISABLED_MESSAGE = "Login is temporarily disabled while we stabilize the dashboard. Please try again soon.";

function AuthGate({ onAuth }) {
  const [mode, setMode]       = useState("login");   // "login" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async () => {
    setError(AUTH_DISABLED_MESSAGE);
    return;
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
        <div style={{fontSize:12,color:"#fbbf24",marginBottom:16,border:"1px solid rgba(251,191,36,0.35)",background:"rgba(251,191,36,0.08)",borderRadius:10,padding:"10px 12px"}}>
          {AUTH_DISABLED_MESSAGE}
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

function Dashboard(props = {}) {
  const { setPage, accounts, totalCash = 0, creditDebt = 0, syncing, lastSync, onRefresh, bills = [], budget = [], transactions = [], portfolio = MOCK.portfolio, creditScore = null, manualIncomeEntries = [] } = props;
  const safeAccounts = pickCollection(accounts, ["accounts"], []);
  const safeBills = pickCollection(bills, ["bills"], []);
  const safeBudget = pickCollection(budget, ["budgets", "budget"], []);
  const safeTransactions = pickCollection(transactions, ["transactions"], []);
  const netWorth = totalCash + creditDebt + (portfolio?.totalValue || 0);
  const bankIncome = safeTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const manualMonthlyIncome = (manualIncomeEntries || []).reduce((sum, i) => sum + incomeToMonthly(i), 0);
  const income = bankIncome + manualMonthlyIncome;
  const spending = safeTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const upcomingBills = safeBills.filter(b => !b.paid);
  const totalSpent = safeBudget.reduce((s, b) => s + (b.spent || 0), 0);
  const safe = Math.max(0, totalCash - upcomingBills.reduce((s, b) => s + b.amount, 0) - (spending / 30) * daysLeft * 0.5);
  const spendPct = income > 0 ? Math.round((spending / income) * 100) : 0;
  const creditScoreValue = creditScore?.latest?.score || 742;
  const billRunway = upcomingBills.reduce((s, b) => s + b.amount, 0);
  const portfolioPnl = portfolio?.dayChangePct ?? 0;
  const creditLimitEstimate = safeAccounts.filter((a) => a.type === "credit").reduce((sum, account) => sum + Number(account?.limit || 0), 0);
  const creditBalance = Math.abs(safeAccounts.filter((a) => a.type === "credit").reduce((sum, account) => sum + Math.min(0, Number(account?.balance || 0)), 0));
  const creditUtilization = creditLimitEstimate > 0 ? creditBalance / creditLimitEstimate : null;
  const [moneyMove, setMoneyMove] = useState(() => buildRuleBasedMoneyMove({ income, upcomingBills, budget: safeBudget, spending, goals: [], creditScoreValue, creditUtilization, totalCash }));

  useEffect(() => {
    const fallback = buildRuleBasedMoneyMove({ income, upcomingBills, budget: safeBudget, spending, goals: [], creditScoreValue, creditUtilization, totalCash });
    let active = true;
    setMoneyMove(fallback);

    const fetchAiMove = async () => {
      try {
        const prompt = `Generate one concise next-best money move for today. Return JSON only with keys: main, why, actionLabel. Allowed actionLabel values: Add Bill, Add Category, Add Goal, Mark Bill Paid, View Budget, Ask AI Coach.`;
        const context = { income, spending, budgets: safeBudget, bills: upcomingBills, creditScore: creditScoreValue, creditUtilization, accountBalances: safeAccounts.map((a) => ({ name: a.name, type: a.type, balance: a.balance })), upcomingDueDates: upcomingBills.map((b) => ({ name: b.name, dueDay: b.dueDay, dueDate: b.dueDate, amount: b.amount })) };
        const result = await aiApi.chat(prompt, [], 'steady', context);
        const content = result?.content || result?.message || result?.reply || '';
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        if (!active || !parsed?.main) return;
        const actionMap = { 'Add Bill': 'bills', 'Add Category': 'budget', 'Add Goal': 'goals', 'Mark Bill Paid': 'bills', 'View Budget': 'budget', 'Ask AI Coach': 'ai-coach' };
        setMoneyMove({ source: 'ai', main: parsed.main, why: parsed.why || fallback.why, actionLabel: actionMap[parsed.actionLabel] ? parsed.actionLabel : 'Ask AI Coach', actionPage: actionMap[parsed.actionLabel] || 'ai-coach' });
      } catch (_) {}
    };

    fetchAiMove();
    return () => { active = false; };
  }, [income, spending, safeBudget, upcomingBills, creditScoreValue, creditUtilization, totalCash, safeAccounts]);

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
          {income <= 0 && <div className="text-sm text-muted">Add income to start your plan.</div>}
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

      <div className="card" style={{padding:18,borderRadius:18,background:"linear-gradient(135deg, rgba(56,189,248,0.14), rgba(147,51,234,0.08))",border:"1px solid rgba(56,189,248,0.35)"}}>
        <div className="section-header" style={{marginBottom:6}}>
          <div className="section-title">Today’s Money Move</div>
          <span className="badge badge-gray" style={{fontSize:10}}>{moneyMove?.source === 'ai' ? 'AI' : 'Offline rules'}</span>
        </div>
        <div style={{fontFamily:"Syne",fontWeight:700,fontSize:18,lineHeight:1.35,marginBottom:8}}>{moneyMove?.main}</div>
        <div className="text-sm text-muted" style={{marginBottom:14}}>{moneyMove?.why}</div>
        <button className="btn btn-primary" onClick={() => setPage(moneyMove?.actionPage || 'ai-coach')}>{moneyMove?.actionLabel || 'Ask AI Coach'}</button>
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
            {safeBudget.length===0 && <div className="text-sm text-muted">Create your first budget category.</div>}
          </div>
        </div>
        <div className="card" style={{padding:18,borderRadius:18}}>
          <div className="section-header"><div className="section-title">Upcoming Bills</div><button className="btn btn-ghost btn-sm" onClick={() => setPage("bills")}>All →</button></div>
          {upcomingBills.slice(0,4).map(b => <div key={b.id} className="bill-item"><div className="bill-icon">{CATEGORY_ICONS[b.category] || "💳"}</div><div className="bill-info"><div className="bill-name">{b.name}</div><div className="bill-due">Due day {b.dueDay}</div></div><div className="bill-amount">{fmt(b.amount)}</div></div>)}
          {upcomingBills.length===0 && <div className="empty-state"><div className="icon">🧾</div><p className="text-sm">Add your first bill.</p></div>}
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
          {!creditScore?.latest?.score && <div className="card-sub">Add your credit score to track progress.</div>}
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => setPage("credit-score")}>Open Tracker</button>
        </div>
        <div className="card" style={{padding:16,borderRadius:16,background:"linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.02))"}}>
          <div className="card-title">Bill Calendar</div>
          <div className="card-value">{upcomingBills.length}</div>
          <div className="card-sub">{fmt(billRunway)} due this cycle</div>
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => setPage("calendar")}>View Calendar</button>
        </div>
        <div className="card" style={{padding:16,borderRadius:16,background:"linear-gradient(135deg, rgba(20,184,166,0.14), rgba(56,189,248,0.04))"}}>
          <div className="card-title">Weekly Money Report</div>
          <div className="card-value">Ready</div>
          <div className="card-sub">Your Weekly Money Report is ready.</div>
          <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => setPage("reports")}>Open Report</button>
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

function BudgetPage({ modeConfig, budgets = [], onAddCategory }) {
  const totalLimit = budgets.reduce((s, b) => s + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const suggestions = modeConfig?.budgetSuggestions || [];
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [voiceUnsupported, setVoiceUnsupported] = useState("");
  const startVoiceForCategory = () => {
    const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SR) return setVoiceUnsupported("Voice input is not supported in this browser yet.");
    setVoiceUnsupported("");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      const amount = (text.match(/\$?\s?(\d+(?:\.\d{1,2})?)/) || [])[1];
      const cat = (text.match(/called ([a-z ]+)/i) || [])[1];
      if (cat) setCategory(cat.trim());
      if (amount) setLimit(amount);
    };
    rec.start();
  };
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
          <button className="btn btn-primary btn-sm" onClick={()=>setOpen(v=>!v)}>+ Add Category</button>
        </div>
        {open && (
          <div style={{display:"grid",gap:8,marginBottom:12}}>
            <input className="form-input" placeholder="Category name" value={category} onChange={(e)=>setCategory(e.target.value)} />
            <input className="form-input" placeholder="Monthly limit" value={limit} onChange={(e)=>setLimit(e.target.value)} />
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-ghost btn-sm" onClick={startVoiceForCategory}>🎤 Voice</button>
              <button className="btn btn-primary btn-sm" onClick={async ()=>{ const ok = await onAddCategory?.({ category, limit }); if (ok) { setCategory(""); setLimit(""); setOpen(false); } }}>Save Category</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>setOpen(false)}>Cancel</button>
            </div>
            {voiceUnsupported && <div className="text-xs" style={{color:"var(--yellow)"}}>{voiceUnsupported}</div>}
          </div>
        )}
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
                  <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:6}}>
                    <button className="btn btn-ghost btn-sm" disabled={savingId===b.id} onClick={async()=>{
                      const raw = window.prompt(`Set new monthly limit for ${b.category}:`, String(b.limit || 0));
                      const next = Number(raw);
                      if (!Number.isFinite(next) || next <= 0) return addToast?.('Please enter a valid limit greater than 0.', 'error');
                      try { setSavingId(b.id); await onUpdateBudget?.(b.id, next); addToast?.('Budget updated.', 'success'); } catch (e) { addToast?.(e?.message || 'Unable to update budget.', 'error'); } finally { setSavingId(null); }
                    }}>Edit</button>
                    <button className="btn btn-ghost btn-sm" disabled={savingId===b.id} style={{color:"var(--red)"}} onClick={async()=>{
                      if (!window.confirm(`Delete budget category "${b.category}"?`)) return;
                      try { setSavingId(b.id); await onDeleteBudget?.(b.id); addToast?.('Budget category deleted.', 'success'); } catch (e) { addToast?.(e?.message || 'Unable to delete budget.', 'error'); } finally { setSavingId(null); }
                    }}>Delete</button>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(b)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={()=>onDeleteCategory?.(b.id)}>Delete</button>
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


function DebtPlannerPage({ debts = [], setDebts, addToast }) {
  const [draft, setDraft] = useState({ name:'', type:'credit card', balance:'', minimumPayment:'', apr:'', dueDate:'', lender:'', notes:'', priority:1 });
  const [method, setMethod] = useState('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);
  const debtTypes = ['credit card','personal loan','auto loan','student loan','collection','BNPL','other'];
  const safeDebts = ensureArray(debts, []);
  const totalDebt = safeDebts.reduce((s,d)=>s+Number(d.balance||0),0);
  const totalMin = safeDebts.reduce((s,d)=>s+Number(d.minimumPayment||0),0);
  const sorted = [...safeDebts].sort((a,b)=> method==='snowball' ? Number(a.balance||0)-Number(b.balance||0) : method==='avalanche' ? Number(b.apr||0)-Number(a.apr||0) : Number(a.priority||999)-Number(b.priority||999));
  const nextDebt = sorted.find(d=>Number(d.balance||0)>0);
  const monthlyBudget = Math.max(0,totalMin + Number(extraPayment||0));
  const estMonths = monthlyBudget>0 ? Math.ceil(totalDebt / monthlyBudget) : null;
  const estPayoffDate = estMonths ? new Date(new Date().setMonth(new Date().getMonth()+estMonths)).toLocaleDateString() : 'Add minimum/extra payments';
  const estimatedInterestSaved = method==='avalanche' && safeDebts.some(d=>Number(d.apr||0)>0) ? Math.max(0, extraPayment*0.15*12) : null;

  const persist = async (next) => { setDebts(next); try { localStorage.setItem('wp_debts', JSON.stringify(next)); } catch {} };
  const addDebt = async () => { const payload = { ...draft, id: Date.now(), balance:Number(draft.balance||0), minimumPayment:Number(draft.minimumPayment||0), apr:Number(draft.apr||0), priority:Number(draft.priority||999) }; if (!payload.name || payload.balance<=0) return; try { const created = await debtsApi.create(payload); const next=[...safeDebts, created||payload]; await persist(next); addToast?.('Debt added.','success'); } catch { await persist([...safeDebts,payload]); addToast?.('Debt added locally.','info'); } };

  return <div className="grid-2" style={{gap:16}}><div className="card"><div className="card-title">Add Debt</div>
    <input className="input" placeholder="Debt name" value={draft.name} onChange={e=>setDraft(v=>({...v,name:e.target.value}))}/>
    <select className="input" value={draft.type} onChange={e=>setDraft(v=>({...v,type:e.target.value}))}>{debtTypes.map(t=><option key={t} value={t}>{t}</option>)}</select>
    <input className="input" placeholder="Balance" value={draft.balance} onChange={e=>setDraft(v=>({...v,balance:e.target.value}))}/>
    <input className="input" placeholder="Minimum payment" value={draft.minimumPayment} onChange={e=>setDraft(v=>({...v,minimumPayment:e.target.value}))}/>
    <input className="input" placeholder="APR %" value={draft.apr} onChange={e=>setDraft(v=>({...v,apr:e.target.value}))}/>
    <input className="input" type="date" value={draft.dueDate} onChange={e=>setDraft(v=>({...v,dueDate:e.target.value}))}/>
    <input className="input" placeholder="Lender/Creditor" value={draft.lender} onChange={e=>setDraft(v=>({...v,lender:e.target.value}))}/>
    <input className="input" placeholder="Notes" value={draft.notes} onChange={e=>setDraft(v=>({...v,notes:e.target.value}))}/>
    <input className="input" placeholder="Custom priority (1=highest)" value={draft.priority} onChange={e=>setDraft(v=>({...v,priority:e.target.value}))}/>
    <button className="btn btn-primary" onClick={addDebt}>Save Debt</button></div>
    <div className="card"><div className="card-title">Payoff Planner</div>
      <div className="text-sm" style={{marginBottom:8}}>Educational planning tool only — no legal or financial guarantees.</div>
      <select className="input" value={method} onChange={e=>setMethod(e.target.value)}><option value="snowball">Snowball (smallest balance first)</option><option value="avalanche">Avalanche (highest APR first)</option><option value="custom">Custom priority</option></select>
      <input className="input" placeholder="Extra monthly payment" value={extraPayment} onChange={e=>setExtraPayment(Number(e.target.value||0))}/>
      <div>Total debt: <b>{fmt(totalDebt||0)}</b></div><div>Total minimum payments: <b>{fmt(totalMin||0)}</b></div><div>Estimated payoff date: <b>{estPayoffDate}</b></div>
      <div>Recommended next debt: <b>{nextDebt ? `${nextDebt.name} (${fmt(nextDebt.balance||0)})` : 'None'}</b></div>
      {estimatedInterestSaved!==null && <div>Estimated interest saved (illustrative): <b>{fmt(estimatedInterestSaved)}</b></div>}
      <div style={{marginTop:10}}>{sorted.map((d,i)=><div key={d.id||i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}><span>{i+1}. {d.name} · {d.type}</span><span>{fmt(d.minimumPayment||0)} min · {Number(d.apr||0)}% APR</span></div>)}</div>
    </div></div>;
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
            {filtered.length===0 && <tr><td colSpan="5"><EmptyState message="No transactions found for this filter." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillsPage({ bills = [], onAddBill, onUpdateBills }) {
  const [localBills, setLocalBills] = useState(ensureArray(bills, []));
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [autopay, setAutopay] = useState(false);
  const [error, setError] = useState("");
  const [voiceUnsupported, setVoiceUnsupported] = useState("");
  const normalizedBills = localBills.map(b => ({ ...b, dueDay: b.dueDay ?? b.due_day ?? 1, paid: Boolean(b.paid) }));
  const unpaid = normalizedBills.filter(b => !b.paid);
  const paid = normalizedBills.filter(b => b.paid);
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);
  const totalPaid = paid.reduce((s, b) => s + b.amount, 0);

  useEffect(() => {
    setLocalBills(ensureArray(bills, []));
  }, [bills]);

  const toggle = async (id) => {
    const bill = localBills.find(b => b.id === id);
    const updated = { ...bill, paid: !bill.paid };
    const next = localBills.map(b => b.id === id ? updated : b);
    setLocalBills(next);
    onUpdateBills?.(next);
    try { await billsApi.update(id, { paid: updated.paid }); } catch { setError(FRIENDLY_ERRORS.settings); }
  };
  const startVoiceForBill = () => {
    const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SR) return setVoiceUnsupported("Voice input is not supported in this browser yet.");
    setVoiceUnsupported("");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      const amt = (text.match(/\$?\s?(\d+(?:\.\d{1,2})?)/) || [])[1];
      const due = (text.match(/due on (?:the )?(\d{1,2})/i) || [])[1];
      const billName = text.replace(/add my/i, "").replace(/for.*/i, "").trim();
      if (billName) setName(billName);
      if (amt) setAmount(amt);
      if (due) setDueDay(due);
    };
    rec.start();
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
          <div className="card-value">{normalizedBills.filter(b => b.autopay).length}</div>
          <div className="card-sub">of {normalizedBills.length} total bills</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">Upcoming Bills</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setOpen(v=>!v)}>+ Add Bill</button>
          </div>
          {open && (
            <div style={{display:"grid",gap:8,marginBottom:12}}>
              <input className="form-input" placeholder="Bill name" value={name} onChange={(e)=>setName(e.target.value)} />
              <input className="form-input" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} />
              <input className="form-input" placeholder="Due day (1-31)" value={dueDay} onChange={(e)=>setDueDay(e.target.value)} />
              <label className="text-sm text-muted" style={{display:"flex",gap:6,alignItems:"center"}}><input type="checkbox" checked={autopay} onChange={(e)=>setAutopay(e.target.checked)} /> Autopay enabled</label>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-ghost btn-sm" onClick={startVoiceForBill}>🎤 Voice</button>
                <button className="btn btn-primary btn-sm" onClick={async ()=>{ const ok = await onAddBill?.({ name, amount, dueDay, autopay }); if (ok) { setName(""); setAmount(""); setDueDay(""); setAutopay(false); setOpen(false); } }}>Save Bill</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setOpen(false)}>Cancel</button>
              </div>
              {voiceUnsupported && <div className="text-xs" style={{color:"var(--yellow)"}}>{voiceUnsupported}</div>}
            </div>
          )}
          {error && <div className="text-xs text-red" style={{marginBottom:8}}>{error}</div>}
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
  const [connectState, setConnectState] = useState({ status: connected ? "connected" : "not_configured", message: connected ? "Brokerage connected." : "SnapTrade credentials missing." });
  const handleSnapTradeConnect = async () => {
    setConnectState({ status: "loading", message: "Connecting to SnapTrade..." });
    try {
      const res = await fetch('/api/portfolio/sync', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || 'SnapTrade is not configured.');
      setConnectState({ status: "connected", message: data?.message || "SnapTrade connected." });
    } catch (e) {
      setConnectState({ status: "error", message: e?.message || "Unable to connect SnapTrade. Use manual holdings as fallback." });
    }
  };
  return (
    <div>
      <div className="portfolio-placeholder mb-4">
        <div style={{fontSize:32, marginBottom:12}}>🔗</div>
        <h3>Connect Your Brokerage</h3>
        <p style={{fontSize:13, color:"var(--text2)", marginBottom:16, maxWidth:400, margin:"0 auto 16px"}}>
          Sync your Webull, TD Ameritrade, or any SnapTrade-supported brokerage to see your portfolio here in real time.
        </p>
        <div className="flex items-center gap-3" style={{justifyContent:"center", flexWrap:"wrap"}}>
          <button className="btn btn-primary" onClick={handleSnapTradeConnect} disabled={connectState.status === "loading"}>🔌 {connectState.status === "loading" ? "Connecting..." : "Connect via SnapTrade"}</button>
          <button className="btn btn-ghost" onClick={()=>window.alert("Webull direct sync is not available yet. You can connect supported brokerages through SnapTrade, upload a CSV, or enter holdings manually.")}>📊 Connect Webull</button>
        </div>
        <p className="text-xs text-muted" style={{marginTop:8}}>
          Status: {connectState.status.replace('_',' ')} · {connectState.message}
        </p>
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
  const [aiMode, setAiMode] = useState("offline");
  const [aiErrorFallback, setAiErrorFallback] = useState(false);
  const [voiceState, setVoiceState] = useState("idle");
  const [voiceUnsupported, setVoiceUnsupported] = useState("");
  const [confirmIntent, setConfirmIntent] = useState(null);
  const bottomRef = useRef(null);
  const voiceRef = useRef(null);

  const suggestions = [
    "What should I do today?",
    "What bill is due next?",
    "How can I save money this week?",
    "How do I improve my credit score?",
    "Can I afford this?",
    "Create a savings plan",
  ];

  const coachContext = {
    incomeTotal: Number(MOCK.income || 0),
    budgetSummary: (MOCK.budget || []).map(b => ({ category: b.category, limit: Number(b.limit || 0), spent: Number(b.spent || 0) })),
    billsSummary: (MOCK.bills || []).map(b => ({ name: b.name, amount: Number(b.amount || 0), dueDay: b.dueDay ?? null, paid: Boolean(b.paid) })),
    accountsSummary: (MOCK.accounts || []).map(a => ({ name: a.name, type: a.type, balance: Number(a.balance || 0) })),
    goalsSummary: (INIT_GOALS || []).map(g => ({ name: g.name, target: Number(g.target || 0), current: Number(g.current || 0) })),
    creditScore: 742,
    utilization: Number(MOCK.accounts?.find(a => a.type === "credit")?.balance ? (Math.abs(Number(MOCK.accounts.find(a => a.type === "credit").balance || 0)) / 5000) * 100 : 0),
    debtSummary: { totalDebt: Number(MOCK.studentLoan || 0) + Number(MOCK.carLoan || 0) + Math.abs(Number(MOCK.accounts?.find(a=>a.type==="credit")?.balance || 0)) },
    netWorth: Number(MOCK.netWorth || 0),
    upcomingReminders: (MOCK.bills || []).filter(b => !b.paid).map(b => ({ title: `${b.name} bill`, dueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(b.dueDay || 1).padStart(2, "0")}` })),
  };

  const detectVoiceIntent = (text) => {
    const t = text.toLowerCase();
    const amount = Number(((t.match(/\$\s?(\d+(?:\.\d{1,2})?)/) || [])[1] || (t.match(/for\s+(\d+(?:\.\d{1,2})?)/) || [])[1] || 0));
    const day = Number((t.match(/due on (?:the )?(\d{1,2})/) || [])[1] || 0);
    const daysBefore = Number((t.match(/(\d+)\s+days?\s+before/) || [])[1] || 0);
    if (t.includes("add my") && t.includes("bill")) return { type:"bill", summary:"Add recurring bill", payload:{ name:text.replace(/add my/i,"").replace(/for.*/i,"").trim(), amount:amount||"", dueDay:day||"", recurrence:"monthly" } };
    if (t.includes("create a goal") || t.includes("save $")) return { type:"goal", summary:"Create savings goal", payload:{ name:(t.match(/for ([a-z ]+)/i)||[])[1]?.trim() || "New Savings Goal", target:amount||"" } };
    if (t.includes("what") && t.includes("budget left")) return { type:"budget_left", summary:"Check remaining budget", payload:{ category:(t.match(/(?:my|what'?s my)\s+([a-z ]+)\s+budget/i)||[])[1]?.trim() || "overall" } };
    if (t.includes("remind me") && t.includes("before it")) return { type:"bill_reminder", summary:"Create bill reminder", payload:{ billName:(t.match(/about my ([a-z ]+) bill/i)||[])[1]?.trim() || "Bill", daysBefore:daysBefore||3 } };
    if (t.includes("add a new category") || t.includes("add a category")) return { type:"category", summary:"Add budget category", payload:{ name:(t.match(/called ([a-z ]+)/i)||[])[1]?.trim()||"", limit:amount||"", period:"monthly" } };
    return null;
  };

  const runVoiceAction = async (intent) => {
    if (!intent) return;
    const now = new Date();
    if (intent.type === "bill") {
      await billsApi.create({ name: intent.payload.name || "New Bill", amount: Number(intent.payload.amount || 0), due_day: Number(intent.payload.dueDay || 1), autopay: false });
      setMessages(m => [...m, { role: "assistant", content: `Done — I added "${intent.payload.name}" for ${fmt(Number(intent.payload.amount || 0))} due on day ${intent.payload.dueDay || 1} each month.` }]);
      return;
    }
    if (intent.type === "goal") {
      setMessages(m => [...m, { role: "assistant", content: `Goal drafted: save ${fmt(Number(intent.payload.target || 0))} for ${intent.payload.name}. I can now build a weekly contribution plan in chat.` }]);
      return;
    }
    if (intent.type === "budget_left") {
      const category = String(intent.payload.category || "").trim().toLowerCase();
      const target = coachContext.budgetSummary.find(b => (b.category || "").toLowerCase() === category);
      const left = target ? Math.max(0, Number(target.limit || 0) - Number(target.spent || 0)) : coachContext.budgetSummary.reduce((sum, b) => sum + Math.max(0, Number(b.limit || 0) - Number(b.spent || 0)), 0);
      const label = target?.category || "Overall";
      setMessages(m => [...m, { role: "assistant", content: `${label} budget left this week (est.): ${fmt(left)}. Want me to suggest where to trim spending next?` }]);
      return;
    }
    if (intent.type === "bill_reminder") {
      const bill = coachContext.billsSummary.find(b => (b.name || "").toLowerCase().includes(String(intent.payload.billName || "").toLowerCase()));
      const dueDay = Number(bill?.dueDay || 1);
      const remindDay = Math.max(1, dueDay - Number(intent.payload.daysBefore || 3));
      await calApi.create({ title: `${bill?.name || intent.payload.billName} bill reminder`, amount: 0, due_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(remindDay).padStart(2, "0")}`, type: "reminder", status: "upcoming", autopay: false, recurring: "monthly", notes: `Reminder ${intent.payload.daysBefore || 3} days before due date.` });
      setMessages(m => [...m, { role: "assistant", content: `Done — I added a reminder for your ${bill?.name || intent.payload.billName} bill ${intent.payload.daysBefore || 3} days before its due date.` }]);
      return;
    }
    if (intent.type === "category") {
      await budgetsApi.create({ category: intent.payload.name, limit: Number(intent.payload.limit || 0), month: now.getMonth() + 1, year: now.getFullYear() });
      setMessages(m => [...m, { role: "assistant", content: `Done — I added a ${intent.payload.name} budget category with a ${fmt(Number(intent.payload.limit || 0))} monthly limit.` }]);
    }
  };

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Calls /api/ai/chat — Anthropic key stays server-side
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const result  = await aiApi.chat(text, history, modeConfig?.id, coachContext);
      const reply   = result?.reply || null;
      setAiMode(result?.mode || "offline");
      setAiErrorFallback(result?.mode === "error_fallback");

      if (reply) {
        setMessages(m => [...m, { role: "assistant", content: reply }]);
      }
    } catch {
      setAiMode("offline");
      setAiErrorFallback(true);
      setMessages(m => [...m, { role: "assistant", content: "I can still coach you right now: tell me your next bill, budget category, or savings goal and I’ll suggest the next best action." }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SR) {
      setVoiceUnsupported("Voice input is not supported in this browser yet.");
      setVoiceState("unsupported");
      return;
    }
    setVoiceUnsupported("");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setVoiceState("listening");
    rec.onend = () => setVoiceState("idle");
    rec.onerror = () => setVoiceState("idle");
    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      const intent = detectVoiceIntent(transcript);
      if (intent) setConfirmIntent(intent);
    };
    voiceRef.current = rec;
    rec.start();
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 68px)"}}>
      <div style={{padding:"12px 20px 0", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
        <div className="ai-badge"><div className="ai-dot" />AI Coach · {aiMode === "online" ? "Online AI mode" : "Offline coach mode"}</div>
        <span className="text-xs text-muted">{aiErrorFallback ? "Using reliable fallback guidance" : "Your finances are analyzed in real time"}</span>
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

      {confirmIntent && (
        <div className="card" style={{margin:"0 20px 12px",padding:12,border:"1px solid rgba(79,142,247,0.4)"}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Voice action detected: {confirmIntent.summary}</div>
          <div className="text-xs text-muted" style={{marginBottom:8}}>Review and confirm before saving.</div>
          <pre style={{margin:0,fontSize:11,whiteSpace:"pre-wrap"}}>{JSON.stringify(confirmIntent.payload, null, 2)}</pre>
          <div style={{marginTop:8,display:"flex",gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmIntent(null)}>Dismiss</button>
            <button className="btn btn-primary btn-sm" onClick={async () => { try { await runVoiceAction(confirmIntent); } catch { setInput(`Please help me ${confirmIntent.summary.toLowerCase()} with these details: ${JSON.stringify(confirmIntent.payload)}`); } finally { setConfirmIntent(null); } }}>Run action</button>
          </div>
        </div>
      )}
      <div className="chat-input-wrap">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask your AI coach anything about your finances..." />
        <button className="btn btn-ghost" onClick={startVoice} disabled={voiceState === "listening"}>{voiceState === "listening" ? "🎙 Listening…" : "🎤 Mic"}</button>
        <button className="btn btn-primary" onClick={() => send(input)} disabled={loading || !input.trim()}>Send</button>
      </div>
      {voiceUnsupported && <div style={{padding:"8px 20px",fontSize:12,color:"var(--yellow)"}}>{voiceUnsupported}</div>}
    </div>
  );
}

function CalculatorPage({ budgets = [], bills = [], accounts = [], manualIncomeEntries = [], transactions = [] }) {
  const [itemName, setItemName] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("need");
  const [paymentMethod, setPaymentMethod] = useState("cash/debit");

  const numericCost = Number(cost || 0);
  const safeBudgets = ensureArray(budgets, []);
  const safeBills = ensureArray(bills, []);
  const safeAccounts = ensureArray(accounts, []);
  const safeIncome = ensureArray(manualIncomeEntries, []);
  const safeTx = ensureArray(transactions, []);
  const categoryBudget = safeBudgets.find((b) => (b.category || "").toLowerCase() === String(category || "").toLowerCase());
  const categoryRemaining = categoryBudget ? Math.max(0, Number(categoryBudget.limit || 0) - Number(categoryBudget.spent || 0)) : 0;
  const totalCash = safeAccounts.filter(a => ["checking", "savings", "cash"].includes(String(a.type || "").toLowerCase())).reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalIncome = safeIncome.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const debtObligations = safeBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const savingsGoalMonthly = (INIT_GOALS || []).reduce((sum, g) => sum + (Number(g.target || 0) - Number(g.current || 0)) / 12, 0);
  const remainingCashAfter = totalCash - numericCost;
  const nextDueDay = safeBills.map((b) => Number(b.dueDay || b.due_day || 99)).sort((a, b) => a - b)[0];
  const now = new Date();
  const daysToPayday = Math.max(1, 14 - (now.getDate() % 14));
  const weeklySpendRate = safeTx.slice(0, 20).reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0) / 4 || 1;
  const futurePressure = debtObligations + Math.max(0, savingsGoalMonthly);
  const liquidityBuffer = totalCash - futurePressure;

  const result = (() => {
    if (!itemName || !Number.isFinite(numericCost) || numericCost <= 0) return null;
    const urgencyPenalty = urgency === "want" ? 0.8 : urgency === "need" ? 1 : urgency === "investment" ? 1.05 : 1.2;
    const methodPenalty = paymentMethod === "credit card" ? 0.95 : paymentMethod === "financing" ? 0.85 : paymentMethod === "unknown" ? 0.9 : 1;
    const affordabilityScore = (liquidityBuffer - numericCost) * urgencyPenalty * methodPenalty;
    const budgetImpact = categoryBudget ? (numericCost / Math.max(1, categoryBudget.limit || 1)) * 100 : 0;
    const timingHint = remainingCashAfter < 0
      ? `Wait ${daysToPayday} days until payday.`
      : nextDueDay && now.getDate() <= nextDueDay
        ? `Consider buying after bill due dates around day ${nextDueDay}.`
        : "Timing looks okay this week.";
    const saferAlternative = numericCost > weeklySpendRate
      ? "Split this into two payments only if no fees apply."
      : "Use cash/debit to avoid interest and keep spending visible.";

    let verdict = "Maybe";
    if (affordabilityScore > 150 && remainingCashAfter > 100) verdict = "Yes";
    if (affordabilityScore < 0 || (categoryBudget && numericCost > categoryRemaining && urgency === "want")) verdict = "No";

    return {
      verdict,
      budgetImpact,
      categoryRemainingAfter: Math.max(0, categoryRemaining - numericCost),
      remainingCashAfter,
      timingHint,
      saferAlternative,
      message: verdict === "Yes"
        ? `You can afford this, but it leaves only ${fmt(Math.max(0, categoryRemaining - numericCost))} in ${category || "this"} budget.`
        : verdict === "No"
          ? "This may hurt your budget this week."
          : "Maybe — review your due dates and category limits before buying.",
    };
  })();

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Calculator</div>
      </div>
      <div className="card mb-4">
        <div className="card-title">Can I Afford This?</div>
        <div className="text-sm text-muted mb-3">Quickly check if a purchase fits your budget using your income, bills, due dates, goals, and debt obligations.</div>
        <div className="grid-2">
          <div><label className="field-label">Item name</label><input className="input" value={itemName} onChange={(e)=>setItemName(e.target.value)} placeholder="Example: Running shoes" /></div>
          <div><label className="field-label">Cost</label><input className="input" type="number" min="0" value={cost} onChange={(e)=>setCost(e.target.value)} placeholder="0.00" /></div>
          <div><label className="field-label">Category</label><input className="input" value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Shopping, Groceries, Transport..." /></div>
          <div>
            <label className="field-label">Urgency</label>
            <select className="input" value={urgency} onChange={(e)=>setUrgency(e.target.value)}>
              <option value="need">Need</option><option value="want">Want</option><option value="emergency">Emergency</option><option value="investment">Investment</option>
            </select>
          </div>
          <div>
            <label className="field-label">Payment method</label>
            <select className="input" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
              <option value="cash/debit">Cash/debit</option><option value="credit card">Credit card</option><option value="financing">Financing</option><option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>
      {result && (
        <div className="card">
          <div className="section-title">Result: {result.verdict}</div>
          <div className="text-sm" style={{marginBottom:8}}>{result.message}</div>
          <div className="text-sm text-muted">Impact on category budget: {categoryBudget ? `${result.budgetImpact.toFixed(1)}% used · ${fmt(result.categoryRemainingAfter)} remaining` : "No category match found yet."}</div>
          <div className="text-sm text-muted">Impact on remaining cash: {fmt(result.remainingCashAfter)} after purchase.</div>
          <div className="text-sm text-muted">Better timing suggestion: {result.timingHint}</div>
          <div className="text-sm text-muted">Safer alternative: {result.saferAlternative}</div>
        </div>
      )}
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
function SettingsPage({ addToast, user, currentPlan = 'free', billingStatus = 'free', setPricingOpen, manualIncomeEntries = [], setManualIncomeEntries, manualAccounts = [], setManualAccounts, onRestartSetup }) {
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

  const [twoFactorSetupMethod, setTwoFactorSetupMethod] = useState('email');
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);

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
    currentPlan: currentPlan,
  });


  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [balanceFormAccountId, setBalanceFormAccountId] = useState(null);
  const [incomeTopUpAccountId, setIncomeTopUpAccountId] = useState(null);
  const [balanceInput, setBalanceInput] = useState('');
  const [incomeTopUpInput, setIncomeTopUpInput] = useState('');
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [incomeForm, setIncomeForm] = useState({ source_name:'', amount:'', frequency:'Weekly', next_pay_date:'', payment_method:'Cash', notes:'', monthly_estimate:'' });
  const [accountForm, setAccountForm] = useState({ account_name:'', account_type:'Cash', starting_balance:'0', income_source_name:'', income_amount:'', income_frequency:'Weekly', payment_method:'Cash', next_pay_date:'', notes:'' });
  const MAX_ACCOUNTS = currentPlan === 'free' ? 1 : 6;

  const [reminderPrefs, setReminderPrefs] = useState({ categories: [], frequency: 'both', reminderTime: '09:00', phoneNumber: '', inAppEnabled: true });
  const [reminderLoading, setReminderLoading] = useState(false);
  const twilioReady = Boolean(process?.env?.NEXT_PUBLIC_TWILIO_ENABLED === 'true');
  useEffect(() => {
    try {
      const savedReminders = JSON.parse(localStorage.getItem('wp_reminders') || 'null');
      const savedSecurity = JSON.parse(localStorage.getItem('wp_security_settings') || 'null');
      if (savedReminders) setReminderPrefs((p) => ({ ...p, ...savedReminders }));
      if (savedSecurity) setToggles((t) => ({ ...t, ...savedSecurity }));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem('wp_reminders', JSON.stringify(reminderPrefs)); } catch {} }, [reminderPrefs]);
  useEffect(() => { try { localStorage.setItem('wp_security_settings', JSON.stringify({ twoFactor: toggles.twoFactor, privacyMode: toggles.privacyMode })); } catch {} }, [toggles.twoFactor, toggles.privacyMode]);

  const saveIncome = () => {
    const entry = { id: editingIncomeId || Date.now(), user_id: user?.id || 'local-user', source_name: incomeForm.source_name, amount: Number(incomeForm.amount||0), frequency: incomeForm.frequency, next_pay_date: incomeForm.next_pay_date, payment_method: incomeForm.payment_method, notes: incomeForm.notes, monthly_estimate: Number(incomeForm.monthly_estimate||0), created_at: new Date().toISOString() };
    if (editingIncomeId) setManualIncomeEntries((manualIncomeEntries||[]).map(x => x.id === editingIncomeId ? entry : x));
    else setManualIncomeEntries([...(manualIncomeEntries||[]), entry]);
    setIncomeFormOpen(false);
    setEditingIncomeId(null);
    setIncomeForm({ source_name:'', amount:'', frequency:'Weekly', next_pay_date:'', payment_method:'Cash', notes:'', monthly_estimate:'' });
  };


  const addIncomeToManualAccount = (accountId) => {
    const amt = Number(incomeTopUpInput || 0);
    if (!amt || amt <= 0) return addToast && addToast("Income amount must be greater than 0.", "error");
    setManualAccounts((manualAccounts||[]).map(a => a.id === accountId ? { ...a, balance: Number(a.balance||0) + amt } : a));
    setIncomeTopUpAccountId(null);
    setIncomeTopUpInput('');
    addToast && addToast(`Added ${fmt(amt)} to account balance`, 'success');
  };

  const updateManualAccountBalance = (accountId) => {
    const next = Number(balanceInput || 0);
    if (Number.isNaN(next)) return addToast && addToast("Please enter a valid number.", "error");
    setManualAccounts((manualAccounts||[]).map(a => a.id === accountId ? { ...a, balance: next } : a));
    setBalanceFormAccountId(null);
    setBalanceInput('');
    addToast && addToast('Account balance updated', 'success');
  };
  const saveManualAccount = () => {
    const isNew = !editingAccountId;
    if (isNew && totalConnectedAccounts >= MAX_ACCOUNTS) {
      addToast && addToast(`You can connect up to ${MAX_ACCOUNTS} accounts. Remove one to add another.`, 'error');
      return;
    }
    const acc = { id: editingAccountId || Date.now(), name: accountForm.account_name, type: (accountForm.account_type||'other').toLowerCase(), balance: Number(accountForm.starting_balance||0), institution: 'Manual', last4: '0000', manual: true };
    const income = { id: Date.now()+1, user_id: user?.id || 'local-user', source_name: accountForm.income_source_name || accountForm.account_name, amount: Number(accountForm.income_amount||0), frequency: accountForm.income_frequency, next_pay_date: accountForm.next_pay_date, payment_method: accountForm.payment_method, notes: accountForm.notes, monthly_estimate: 0, created_at: new Date().toISOString() };
    if (editingAccountId) setManualAccounts((manualAccounts||[]).map(x => x.id === editingAccountId ? acc : x));
    else setManualAccounts([...(manualAccounts||[]), acc]);
    if (income.amount > 0) setManualIncomeEntries([...(manualIncomeEntries||[]), income]);
    setAccountFormOpen(false);
    setEditingAccountId(null);
  };

  const toggle = async (k) => {
    if (k !== 'twoFactor') {
      setToggles(t => ({ ...t, [k]: !t[k] }));
      return;
    }

    if (!user?.email) {
      addToast && addToast('Unable to update 2FA without a signed-in email.', 'error');
      return;
    }

    setTwoFactorBusy(true);
    try {
      if (!toggles.twoFactor) {
        await authApi.enableTwoFactor(user.email);
        await authApi.sendTwoFactorCode(user.email);
        setToggles(t => ({ ...t, twoFactor: true }));
        addToast && addToast('2FA enabled. A verification code was sent via email.', 'success');
      } else {
        await authApi.disableTwoFactor(user.email);
        setToggles(t => ({ ...t, twoFactor: false }));
        addToast && addToast('2FA disabled.', 'success');
      }
    } catch {
      addToast && addToast('Unable to update two-factor authentication.', 'error');
    } finally {
      setTwoFactorBusy(false);
    }
  };
  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const plaid = usePlaidConnect({
    onSuccess: async () => {
      addToast && addToast('Bank connected successfully!', 'success');
    },
    onExit: () => {},
  });

  const totalConnectedAccounts = (manualAccounts || []).length + (plaid.accounts || []).length;

  useEffect(() => { plaid.fetchLinkToken(); }, []);

  const handlePlaidConnect = () => {
    if (totalConnectedAccounts >= MAX_ACCOUNTS) {
      addToast && addToast(`You can connect up to ${MAX_ACCOUNTS} accounts. Remove one to add another.`, 'error');
      return;
    }
    if (!plaid.linkToken) { plaid.fetchLinkToken(); return; }
    plaid.open();
  };


  useEffect(() => {
    (async () => {
      try {
        const data = await remindersApi.getPreferences();
        if (data) setReminderPrefs({
          categories: Array.isArray(data.categories) ? data.categories : [],
          frequency: data.frequency || 'both',
          reminderTime: data.reminder_time || '09:00',
          phoneNumber: data.phone_number || '',
          inAppEnabled: data.in_app_enabled !== false,
        });
      } catch {}
    })();
  }, []);

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
      <div className="card" style={{marginBottom:12}}>
        <div className="card-title">Setup</div>
        <div className="text-sm text-muted" style={{marginBottom:10}}>Need to run onboarding again?</div>
        <button className="btn btn-ghost btn-sm" onClick={onRestartSetup}>Restart setup</button>
      </div>
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
              {!plaid.connected ? (
                <>
                  <button className="btn btn-primary" onClick={handlePlaidConnect} disabled={plaid.loading} style={{width:'100%',justifyContent:'center'}}>
                    {plaid.loading ? 'Initializing…' : 'Connect with Plaid'}
                  </button>
                  <button className='btn btn-ghost' style={{width:'100%',justifyContent:'center',marginTop:8}} onClick={()=>window.alert('Teller connection is not configured yet. Add your Teller application credentials and certificate setup to enable live bank syncing.')}>
                    Connect with Teller
                  </button>
                  {plaid.error && <div style={{marginTop:8,fontSize:12,color:'var(--yellow)'}}>{plaid.error}</div>}
                </>
              ) : <>{plaid.accounts.map(a => <div key={a.id} className="integration-card" style={{marginBottom:8}}><div className="int-icon">{a.type === 'checking' ? '🏦' : a.type === 'savings' ? '💰' : '💳'}</div><div className="int-info"><div className="int-name">{a.name}</div><div className="int-status">{a.institution} · ••••{a.last4}</div></div><div style={{fontFamily:'Syne',fontWeight:700,fontSize:14}}>{fmt(a.balance)}</div></div>)}</>}
            </div>
            <div className="integration-card"><div className="int-icon">📊</div><div className="int-info"><div className="int-name">Webull / SnapTrade</div><div className="int-status">Brokerage sync placeholder</div></div><span className="badge badge-yellow">Coming soon</span></div>
          </div>

          <div className="card settings-section">
            <h3>4. Connect Your Income</h3>
            <div className="setting-desc" style={{marginBottom:10}}>Sync your bank account for automatic tracking, or enter your income manually if you do not use a bank account.</div>
            <div className="setting-desc" style={{marginBottom:10}}>No bank account? No problem. You can still use WealthPilot OS by entering your income manually. You can connect a bank later anytime.</div>
            <div className="grid-2" style={{gap:10}}>
              <div className="integration-card"><div className="int-icon">🏦</div><div className="int-info"><div className="int-name">Sync Bank Account</div><div className="int-status">Securely connect your bank account to automatically track income, spending, and bills.</div></div><button className="btn btn-ghost btn-sm" onClick={handlePlaidConnect} disabled={totalConnectedAccounts >= MAX_ACCOUNTS}>Connect Bank</button></div>
              <div className="integration-card"><div className="int-icon">✍️</div><div className="int-info"><div className="int-name">Manual Income Entry</div><div className="int-status">Enter your income yourself. Great for cash income, gig work, self-employed users, or anyone without a bank account.</div></div><button className="btn btn-ghost btn-sm" onClick={()=>setIncomeFormOpen(v=>!v)}>Enter Manually</button></div>
            </div>
            {incomeFormOpen && <div style={{marginTop:10,display:'grid',gap:8}}><input className="form-input" placeholder="Income source name" value={incomeForm.source_name} onChange={e=>setIncomeForm(f=>({...f,source_name:e.target.value}))}/><input className="form-input" placeholder="Income amount" value={incomeForm.amount} onChange={e=>setIncomeForm(f=>({...f,amount:e.target.value}))}/><select className="form-select" value={incomeForm.frequency} onChange={e=>setIncomeForm(f=>({...f,frequency:e.target.value}))}>{['Weekly','Bi-weekly','Monthly','Twice per month','One-time','Custom'].map(o=><option key={o}>{o}</option>)}</select>{incomeForm.frequency==='Custom' && <input className="form-input" placeholder="Custom monthly estimate" value={incomeForm.monthly_estimate} onChange={e=>setIncomeForm(f=>({...f,monthly_estimate:e.target.value}))}/>}<input className="form-input" type="date" value={incomeForm.next_pay_date} onChange={e=>setIncomeForm(f=>({...f,next_pay_date:e.target.value}))}/><select className="form-select" value={incomeForm.payment_method} onChange={e=>setIncomeForm(f=>({...f,payment_method:e.target.value}))}>{['Cash','Check','Prepaid card','App payment','Other'].map(o=><option key={o}>{o}</option>)}</select><input className="form-input" placeholder="Notes" value={incomeForm.notes} onChange={e=>setIncomeForm(f=>({...f,notes:e.target.value}))}/><button className="btn btn-primary" onClick={saveIncome}>Save Income</button></div>}
            <div style={{marginTop:10}}>{(manualIncomeEntries||[]).map(i=><div key={i.id} className="integration-card" style={{marginBottom:6}}><div className="int-info"><div className="int-name">{i.source_name}</div><div className="int-status">{fmt(i.amount)} · {i.frequency} · Est monthly {fmt(incomeToMonthly(i))} · {i.payment_method}</div></div><div style={{display:'flex',gap:6}}><button className="btn btn-ghost btn-sm" onClick={()=>{setEditingIncomeId(i.id);setIncomeForm({ source_name:i.source_name||'', amount:String(i.amount||''), frequency:i.frequency||'Weekly', next_pay_date:i.next_pay_date||'', payment_method:i.payment_method||'Cash', notes:i.notes||'', monthly_estimate:String(i.monthly_estimate||'') });setIncomeFormOpen(true);}}>Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setManualIncomeEntries((manualIncomeEntries||[]).filter(x=>x.id!==i.id))}>Delete</button></div></div>)}</div>
          </div>

          <div className="card settings-section">
            <h3>5. Add Another Account</h3>
            <div className="setting-desc" style={{marginBottom:10}}>Connect a bank account or add one manually.</div>
            <div className="setting-desc" style={{marginBottom:10}}>Connected accounts: {totalConnectedAccounts}/{MAX_ACCOUNTS}</div>
            <div className="grid-2" style={{gap:10}}>
              <div className="integration-card"><div className="int-icon">🏦</div><div className="int-info"><div className="int-name">Sync Bank Account</div><div className="int-status">Connect another bank account for automatic income, spending, bills, and balance tracking.</div></div><button className="btn btn-ghost btn-sm" onClick={handlePlaidConnect} disabled={totalConnectedAccounts >= MAX_ACCOUNTS}>Connect Bank</button></div>
              <div className="integration-card"><div className="int-icon">💼</div><div className="int-info"><div className="int-name">Add Manual Account</div><div className="int-status">Create a manual account for cash income, prepaid cards, check income, gig work, or users without a bank account.</div></div><button className="btn btn-ghost btn-sm" onClick={()=>setAccountFormOpen(v=>!v)} disabled={totalConnectedAccounts >= MAX_ACCOUNTS}>Add Manual Account</button></div>
            </div>
            {accountFormOpen && <div style={{marginTop:10,display:'grid',gap:8}}><input className="form-input" placeholder="Account name" value={accountForm.account_name} onChange={e=>setAccountForm(f=>({...f,account_name:e.target.value}))}/><select className="form-select" value={accountForm.account_type} onChange={e=>setAccountForm(f=>({...f,account_type:e.target.value}))}>{['Cash','Checking','Savings','Prepaid Card','Gig Work','Business Income','Other'].map(o=><option key={o}>{o}</option>)}</select><input className="form-input" placeholder="Starting balance" value={accountForm.starting_balance} onChange={e=>setAccountForm(f=>({...f,starting_balance:e.target.value}))}/><input className="form-input" placeholder="Income source name" value={accountForm.income_source_name} onChange={e=>setAccountForm(f=>({...f,income_source_name:e.target.value}))}/><input className="form-input" placeholder="Income amount" value={accountForm.income_amount} onChange={e=>setAccountForm(f=>({...f,income_amount:e.target.value}))}/><select className="form-select" value={accountForm.income_frequency} onChange={e=>setAccountForm(f=>({...f,income_frequency:e.target.value}))}>{['Weekly','Bi-weekly','Monthly','Twice per month','One-time','Custom'].map(o=><option key={o}>{o}</option>)}</select><select className="form-select" value={accountForm.payment_method} onChange={e=>setAccountForm(f=>({...f,payment_method:e.target.value}))}>{['Cash','Check','Prepaid card','App payment','Other'].map(o=><option key={o}>{o}</option>)}</select><input className="form-input" type="date" value={accountForm.next_pay_date} onChange={e=>setAccountForm(f=>({...f,next_pay_date:e.target.value}))}/><input className="form-input" placeholder="Notes" value={accountForm.notes} onChange={e=>setAccountForm(f=>({...f,notes:e.target.value}))}/><button className="btn btn-primary" onClick={saveManualAccount}>Save Account</button></div>}
            <div style={{marginTop:10}}>{(manualAccounts||[]).map(a=><div key={a.id} className="integration-card" style={{marginBottom:6,display:'grid',gap:8}}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div className="int-info"><div className="int-name">{a.name}</div><div className="int-status">{a.type} · {fmt(a.balance)}</div></div><div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}><button className="btn btn-ghost btn-sm" onClick={()=>{setIncomeTopUpAccountId(a.id);setIncomeTopUpInput('');}}>+ Income</button><button className="btn btn-ghost btn-sm" onClick={()=>{setBalanceFormAccountId(a.id);setBalanceInput(String(a.balance||0));}}>Update Balance</button><button className="btn btn-ghost btn-sm" onClick={()=>{setEditingAccountId(a.id);setAccountForm({ account_name:a.name||'', account_type:a.type||'Cash', starting_balance:String(a.balance||0), income_source_name:'', income_amount:'', income_frequency:'Weekly', payment_method:'Cash', next_pay_date:'', notes:'' });setAccountFormOpen(true);}}>Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setManualAccounts((manualAccounts||[]).filter(x=>x.id!==a.id))}>Delete</button></div></div>{incomeTopUpAccountId===a.id && <div style={{display:'flex',gap:8}}><input className="form-input" placeholder="Income amount" value={incomeTopUpInput} onChange={e=>setIncomeTopUpInput(e.target.value)} /><button className="btn btn-primary btn-sm" onClick={()=>addIncomeToManualAccount(a.id)}>Apply</button><button className="btn btn-ghost btn-sm" onClick={()=>setIncomeTopUpAccountId(null)}>Cancel</button></div>}{balanceFormAccountId===a.id && <div style={{display:'flex',gap:8}}><input className="form-input" placeholder="New balance" value={balanceInput} onChange={e=>setBalanceInput(e.target.value)} /><button className="btn btn-primary btn-sm" onClick={()=>updateManualAccountBalance(a.id)}>Save</button><button className="btn btn-ghost btn-sm" onClick={()=>setBalanceFormAccountId(null)}>Cancel</button></div>}</div>)}</div>
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
            <h3>6. Security</h3>
            {renderToggleRow('twoFactor','Require two-factor authentication at login','Add a verification step before login is completed.')}
            <div className="setting-row">
              <div>
                <div className="setting-label">2FA setup method</div>
                <div className="setting-desc">Email verification code is available now. Authenticator app can be added when backend support is ready.</div>
              </div>
              <select
                value={twoFactorSetupMethod}
                onChange={(e) => setTwoFactorSetupMethod(e.target.value)}
                disabled={twoFactorBusy}
                style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,minWidth:200}}
              >
                <option value="email">Email code (available)</option>
                <option value="authenticator" disabled>Authenticator app (coming soon)</option>
              </select>
            </div>
          </div>

          <div className="card settings-section">
            <h3>7. Budget Preferences</h3>
            <div className="setting-row"><div><div className="setting-label">Monthly budget reset day</div><div className="setting-desc">Calendar day to reset budget tracking.</div></div><input value={form.budgetResetDay} onChange={(e)=>updateField('budgetResetDay',e.target.value)} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,width:70}} /></div>
            {renderToggleRow('autoCategorize','Auto-categorize transactions','Apply smart categories to new transactions.')}
            {renderToggleRow('rolloverBudget','Rollover unused budget','Carry remaining funds into next month.')}
            {renderSelectRow('Spending alert sensitivity','Threshold level for spend warnings.','spendingSensitivity',['Low','Medium','High'])}
            {renderSelectRow('Budget method selector','Framework for allocations.','budgetMethod',['50/30/20','Zero-based','Envelope','Pay Yourself First'])}
          </div>

          <div className="card settings-section">
            <h3>8. Privacy & Security</h3>
            {renderToggleRow('privacyMode','Privacy mode / hide balances','Mask balances and sensitive amounts on screen.')}
            {renderSelectRow('Session timeout selector','Auto sign-out period when inactive.','sessionTimeout',['15 minutes','30 minutes','1 hour','4 hours'])}
            <div className="setting-row"><div><div className="setting-label">Export my data</div><div className="setting-desc">Download your account records as CSV/JSON.</div></div><button className="btn btn-ghost btn-sm">Export</button></div>
            <div className="setting-row"><div><div className="setting-label">Delete my data</div><div className="setting-desc">Permanently remove stored financial profile data.</div></div><button className="btn btn-danger btn-sm">Delete Data</button></div>
            <div className="setting-row"><div><div className="setting-label">Connected data permissions</div><div className="setting-desc">Review what data each integration can access.</div></div><button className="btn btn-ghost btn-sm">Review</button></div>
          </div>

          <div className="card settings-section">
            <h3>9. Appearance</h3>
            {renderToggleRow('darkMode','Dark mode toggle','Premium low-glare experience for night usage.')}
            {renderSelectRow('Accent color selector','Set your interface highlight color.','accentColor',['Electric Blue','Emerald','Violet','Rose'])}
            {renderToggleRow('compactMode','Compact mode toggle','Reduce spacing to fit more content.')}
            {renderToggleRow('hideNetWorthWidget','Show/hide dashboard widgets · Net Worth','Control Net Worth card visibility.')}
            {renderToggleRow('hideBudgetWidget','Show/hide dashboard widgets · Budget','Control Budget card visibility.')}
            {renderToggleRow('hidePortfolioWidget','Show/hide dashboard widgets · Portfolio','Control Portfolio card visibility.')}
          </div>


          <div className="card settings-section">
            <h3>10. Budget Reminders (Text + In-App)</h3>
            {!twilioReady && <div className="setting-desc" style={{marginBottom:10}}>SMS reminders require Twilio setup. In-app reminders are active.</div>}
            <div className="setting-row"><div><div className="setting-label">Categories (max 4)</div><div className="setting-desc">Comma-separated category names to include in reminders.</div></div><input value={reminderPrefs.categories.join(', ')} onChange={(e)=>setReminderPrefs(p=>({ ...p, categories: e.target.value.split(',').map(v=>v.trim()).filter(Boolean).slice(0,4) }))} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,minWidth:220}} /></div>
            <div className="setting-row"><div><div className="setting-label">Reminder schedule</div><div className="setting-desc">Daily, weekly, or both.</div></div><select value={reminderPrefs.frequency} onChange={(e)=>setReminderPrefs(p=>({ ...p, frequency: e.target.value }))} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,minWidth:140}}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="both">Both</option></select></div>
            <div className="setting-row"><div><div className="setting-label">Reminder time</div><div className="setting-desc">24-hour HH:mm.</div></div><input type="time" value={reminderPrefs.reminderTime} onChange={(e)=>setReminderPrefs(p=>({ ...p, reminderTime:e.target.value }))} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12}} /></div>
            <div className="setting-row"><div><div className="setting-label">Phone number</div><div className="setting-desc">Used for SMS delivery when Twilio is configured.</div></div><input value={reminderPrefs.phoneNumber} onChange={(e)=>setReminderPrefs(p=>({ ...p, phoneNumber:e.target.value }))} style={{background:'var(--bg3)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 10px',fontSize:12,minWidth:170}} /></div>
            <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
              <button className="btn btn-primary btn-sm" disabled={reminderLoading} onClick={async()=>{try{setReminderLoading(true);await remindersApi.savePreferences(reminderPrefs);addToast?.('Reminder preferences saved.','success');}catch(e){addToast?.(e?.message||'Unable to save reminder preferences.','error');}finally{setReminderLoading(false);}}}>Save Reminders</button>
              <button className="btn btn-ghost btn-sm" disabled={reminderLoading} onClick={async()=>{try{setReminderLoading(true);const r=await remindersApi.sendTest();addToast?.(r?.notice || 'Test reminder processed.','success');}catch(e){addToast?.(e?.message||'Unable to send test reminder.','error');}finally{setReminderLoading(false);}}}>Send Test Text</button>
            </div>
          </div>

          <div className="card settings-section">
            <h3>10. Billing</h3>
            <div className="setting-row"><div><div className="setting-label">Current plan</div><div className="setting-desc">{form.currentPlan} · status: {billingStatus}</div></div><span className="badge badge-green">Active</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}><button className="btn btn-primary btn-sm" onClick={()=>setPricingOpen?.(true)}>Upgrade</button><button className="btn btn-ghost btn-sm">Manage Subscription</button><button className="btn btn-danger btn-sm">Cancel Subscription</button></div>
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

  if (typeof loading !== "undefined" && loading) return <LoadingCard message="Loading calendar…" />;
  return (
    <div>
      {typeof error !== "undefined" && error && <ErrorNotice message={error} />}
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
  const [smartCreditState, setSmartCreditState] = useState({ status: "not_configured", message: "SmartCredit credentials not configured." });
  const hasHistory = history.length > 0;
  const latest  = hasHistory ? history[history.length - 1] : null;
  const prev    = history.length > 1 ? history[history.length - 2] : null;
  const trend   = hasHistory && prev ? latest.score - prev.score : 0;
  const latestScore = hasHistory ? latest.score : null;
  const color   = hasHistory ? scoreColor(latestScore) : "#8892a4";

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

  if (typeof loading !== "undefined" && loading) return <LoadingCard message="Loading credit score…" />;
  return (
    <div>
      {typeof error !== "undefined" && error && <ErrorNotice message={error} />}
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
          <button className="btn btn-ghost" style={{width:"100%",marginTop:8,justifyContent:"center"}} onClick={connectSmartCredit} disabled={smartCreditState.status==="loading"}>{smartCreditState.status==="loading" ? "Connecting..." : "Connect SmartCredit"}</button>
          <div className="text-xs text-muted" style={{marginTop:6}}>Status: {smartCreditState.status.replace('_',' ')} · {smartCreditState.message}</div>
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
              const active = latestScore !== null && latestScore >= b.min && latestScore <= b.max;
              const pct = latestScore === null ? 0 : Math.min(100, Math.max(0, (latestScore - b.min) / (b.max - b.min) * 100));
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

  if (typeof loading !== "undefined" && loading) return <LoadingCard message="Loading goals…" />;
  return (
    <div>
      {typeof error !== "undefined" && error && <ErrorNotice message={error} />}
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceUnsupported, setVoiceUnsupported] = useState("");

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
  const startVoiceForGoal = () => {
    const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SR) return setVoiceUnsupported("Voice input is not supported in this browser yet.");
    setVoiceUnsupported("");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      const amt = (text.match(/\$?\s?(\d+(?:\.\d{1,2})?)/) || [])[1];
      const goalName = (text.match(/for ([a-z ]+)/i) || [])[1];
      if (goalName) setForm((f) => ({ ...f, name: goalName.trim() }));
      if (amt) setForm((f) => ({ ...f, target: amt }));
    };
    rec.start();
  };

  const addContrib = (id, amt) => {
    setGoals(gs => gs.map(g => g.id===id ? {...g, current: Math.min(g.target, g.current+amt)} : g));
    addToast&&addToast(`+${fmt(amt)} added ✓`,"success");
  };

  if (typeof loading !== "undefined" && loading) return <LoadingCard message="Loading goals…" />;
  return (
    <div>
      {typeof error !== "undefined" && error && <ErrorNotice message={error} />}
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
              <button className="btn btn-ghost" onClick={startVoiceForGoal}>🎤 Voice</button>
              <button className="btn btn-primary" style={{flex:1,justifyContent:"center"}} onClick={save}>
                {editing ? "Save Changes" : "Create Goal"}
              </button>
              {editing && <button className="btn btn-danger" onClick={()=>del(editing.id)}>Delete</button>}
            </div>
            {voiceUnsupported && <div className="text-xs" style={{marginTop:8,color:"var(--yellow)"}}>{voiceUnsupported}</div>}
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

function ReportsPage(props = {}) {
  const { accounts = [], bills = [], budget = [], transactions = [], portfolio = MOCK.portfolio, creditScore = null, debts = [] } = props;
  const [period, setPeriod] = useState("6m");
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [delivery, setDelivery] = useState({ inApp: true, email: false, sms: false });

  const safeAccounts = pickCollection(accounts, ["accounts"], []);
  const safeBills = pickCollection(bills, ["bills"], []);
  const safeBudget = pickCollection(budget, ["budgets", "budget"], []);
  const safeTransactions = pickCollection(transactions, ["transactions"], []);
  const safeDebts = pickCollection(debts, ["debts"], []);

  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  const thisWeekTx = safeTransactions.filter((t) => {
    const d = new Date(t.date);
    return !Number.isNaN(d.getTime()) && d >= weekStart && d <= weekEnd;
  });

  const generateWeeklyReport = useCallback(async () => {
    const incomeReceived = thisWeekTx.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
    const upcomingBills = safeBills.filter((b) => !b.paid).sort((a,b) => getDueInDays(a)-getDueInDays(b)).slice(0,5);
    const billsPaid = safeBills.filter((b) => b.paid);
    const overspendingAlerts = safeBudget.filter((b) => Number(b.spent||0) > Number(b.limit||0)).map((b) => `${b.category}: ${fmt((b.spent||0)-(b.limit||0))} over`);
    const budgetLeft = safeBudget.map((b) => ({ category: b.category, left: Math.max(0, Number(b.limit||0) - Number(b.spent||0)) }));
    const savingsGoal = INIT_GOALS.find((g) => g.type === 'emergency') || INIT_GOALS[0];
    const debtTotal = safeDebts.reduce((s, d) => s + Number(d.balance || 0), 0) || Math.abs((safeAccounts||[]).filter((a)=>a.type==='credit').reduce((s,a)=>s+Math.min(0,Number(a.balance||0)),0));
    const debtTarget = debtTotal > 0 ? debtTotal + 5000 : 5000;
    const creditLimitEstimate = safeAccounts.filter((a) => a.type === 'credit').reduce((sum, a) => sum + Number(a.limit || 0), 0);
    const creditBalance = Math.abs(safeAccounts.filter((a)=>a.type==='credit').reduce((sum,a)=>sum + Math.min(0, Number(a.balance||0)),0));
    const utilization = creditLimitEstimate > 0 ? creditBalance / creditLimitEstimate : null;
    const netWorth = safeAccounts.reduce((s, a) => s + Number(a.balance || 0), 0) + Number(portfolio?.totalValue || 0);
    const subscriptions = safeTransactions.filter((t) => /netflix|spotify|hulu|apple|prime|planet fitness|gym/i.test(String(t.name || ''))).slice(0,6);

    const base = {
      createdAt: new Date().toISOString(),
      weekRange: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
      incomeReceived,
      billsPaid,
      upcomingBills,
      budgetLeft,
      overspendingAlerts,
      savingsGoalProgress: { name: savingsGoal?.name || 'Savings Goal', current: Number(savingsGoal?.current || 0), target: Number(savingsGoal?.target || 1) },
      debtPayoffProgress: { paidPct: Math.round(((debtTarget - debtTotal) / debtTarget) * 100), remaining: Math.max(0, debtTotal) },
      creditScore: creditScore?.latest?.score || 742,
      creditUtilization: utilization,
      netWorth,
      portfolioSnapshot: portfolio?.connected ? { total: Number(portfolio?.totalValue || 0), change: Number(portfolio?.dayChangePct || 0) } : null,
      subscriptions,
      actionPlan: [
        upcomingBills[0] ? `Pay ${upcomingBills[0].name} (${fmt(upcomingBills[0].amount)})` : 'Review recurring bills and due dates',
        overspendingAlerts[0] ? `Reduce ${safeBudget.find((b)=>Number(b.spent||0)>Number(b.limit||0))?.category || 'high'} spending` : 'Keep category spending inside budget limits',
        utilization && utilization > 0.3 ? 'Pay down credit card balance before statement close' : 'Continue on-time payments to build credit',
      ],
      delivery,
    };

    if (aiApi?.chat) {
      try {
        const prompt = 'Write a friendly weekly money summary in under 120 words. Mention wins and 2 next actions.';
        const context = { ...base };
        const res = await aiApi.chat(prompt, [], 'steady', context);
        base.friendlySummary = res?.content || res?.reply || res?.message || '';
      } catch {
        base.friendlySummary = `Great work this week. You brought in ${fmt(base.incomeReceived)} and kept moving forward on your plan. Focus next week on ${base.actionPlan[0].toLowerCase()} and ${base.actionPlan[1].toLowerCase()}.`;
      }
    } else {
      base.friendlySummary = `Weekly recap: income ${fmt(base.incomeReceived)}, remaining debt ${fmt(base.debtPayoffProgress.remaining)}, and net worth ${fmt(base.netWorth)}. Next: ${base.actionPlan.join('; ')}.`;
    }

    setWeeklyReports((prev) => [base, ...prev]);
  }, [thisWeekTx, safeBills, safeBudget, safeDebts, safeAccounts, portfolio, creditScore, delivery, weekStart, weekEnd]);

  useEffect(() => {
    if (!weeklyReports.length) generateWeeklyReport();
  }, [generateWeeklyReport, weeklyReports.length]);

  const currentWeekly = weeklyReports[0];
  const months = period === "3m" ? REPORT_MONTHS.slice(-3) : period === "6m" ? REPORT_MONTHS.slice(-6) : REPORT_MONTHS;
  const nwMonths = period === "3m" ? NET_WORTH_HISTORY.slice(-3) : period === "6m" ? NET_WORTH_HISTORY.slice(-6) : NET_WORTH_HISTORY;
  const avgIncome = Math.round(months.reduce((s,m)=>s+m.income,0)/months.length);
  const avgSpending = Math.round(months.reduce((s,m)=>s+m.spending,0)/months.length);
  const avgSavings = avgIncome - avgSpending;
  const savingsRate = Math.round((avgSavings/avgIncome)*100);
  const nwStart = nwMonths[0].value; const nwEnd = nwMonths[nwMonths.length-1].value; const nwGain = nwEnd - nwStart;

  return <div style={{display:'grid',gap:14}}>
    <div className="card" style={{padding:16,borderRadius:16,border:'1px solid rgba(16,185,129,0.35)',background:'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.05))'}}>
      <div className="section-header"><div className="section-title">Current Week Report</div><button className="btn btn-primary btn-sm" onClick={generateWeeklyReport}>Generate Report</button></div>
      {currentWeekly && <div style={{marginTop:10,display:'grid',gap:8,fontSize:12}}>
        <div><strong>{currentWeekly.weekRange}</strong></div><div>{currentWeekly.friendlySummary}</div>
        <div>Income received: <strong>{fmt(currentWeekly.incomeReceived)}</strong> · Bills paid: <strong>{currentWeekly.billsPaid.length}</strong> · Upcoming bills: <strong>{currentWeekly.upcomingBills.length}</strong></div>
        <div>Credit score: <strong>{currentWeekly.creditScore}</strong> · Utilization: <strong>{currentWeekly.creditUtilization==null?'N/A':`${Math.round(currentWeekly.creditUtilization*100)}%`}</strong> · Net worth: <strong>{fmt(currentWeekly.netWorth)}</strong></div>
        <div>Savings goal: <strong>{Math.round((currentWeekly.savingsGoalProgress.current/Math.max(1,currentWeekly.savingsGoalProgress.target))*100)}%</strong> · Debt payoff: <strong>{currentWeekly.debtPayoffProgress.paidPct}%</strong></div>
        <div>Subscriptions detected: {currentWeekly.subscriptions.length ? currentWeekly.subscriptions.map(s=>s.name).join(', ') : 'None detected'}.</div>
        <div>Next week action plan: {currentWeekly.actionPlan.join(' · ')}</div>
      </div>}
    </div>
    <div className="card" style={{padding:16,borderRadius:16}}>
      <div className="section-title" style={{marginBottom:10}}>Delivery Options</div>
      <label><input type="checkbox" checked={delivery.inApp} onChange={(e)=>setDelivery(d=>({...d,inApp:e.target.checked}))}/> In-app</label>{' '}
      <label><input type="checkbox" checked={delivery.email} onChange={(e)=>setDelivery(d=>({...d,email:e.target.checked}))}/> Email (if service exists)</label>{' '}
      <label><input type="checkbox" checked={delivery.sms} onChange={(e)=>setDelivery(d=>({...d,sms:e.target.checked}))}/> SMS (if Twilio exists)</label>
    </div>
    <div className="card" style={{padding:16,borderRadius:16}}><div className="section-title" style={{marginBottom:10}}>Previous Reports History</div>{weeklyReports.slice(1).length===0?<div className="text-sm text-muted">No previous reports yet.</div>:weeklyReports.slice(1).map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>{r.weekRange} · Income {fmt(r.incomeReceived)} · Net worth {fmt(r.netWorth)}</div>)}</div>
  </div>;
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

  if (typeof loading !== "undefined" && loading) return <LoadingCard message="Loading bills…" />;
  return (
    <div>
      {typeof error !== "undefined" && error && <ErrorNotice message={error} />}
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

const LEARNING_CENTER_STORAGE_KEY = "wp_learning_center_completed";
const LEARNING_CATEGORIES = ["Budgeting","Saving","Debt payoff","Credit building","Investing basics","Business funding","Net worth","App tutorials"];
const STARTER_LESSONS = [
  { id:"low-income-budget", category:"Budgeting", title:"How to budget with low income", description:"Build a simple budget that protects essentials first.", readTime:"4 min", actionStep:"List your top 3 must-pay expenses and set spending caps for everything else.", content:["Start with needs: housing, food, transport, and minimum debt payments.","Use a weekly spending limit for flexible categories like food and shopping.","Track every expense for 7 days to see where small leaks happen.","If money is tight, reduce variable costs first before touching essentials."] },
  { id:"save-first-1000", category:"Saving", title:"How to save your first $1,000", description:"Use small automated habits to reach your first milestone.", readTime:"3 min", actionStep:"Set up an automatic transfer today, even if it is only $10 per week.", content:["Pick a starter emergency goal of $1,000.","Automate transfers right after payday so saving happens first.","Cut one repeat expense and move that amount directly into savings.","Use windfalls like tax refunds or gifts to accelerate progress."] },
  { id:"lower-credit-utilization", category:"Credit building", title:"How to lower credit utilization", description:"Reduce utilization to support a healthier credit score.", readTime:"4 min", actionStep:"Make an extra card payment before your statement closing date.", content:["Credit utilization is your balance divided by your credit limit.","Aim to keep each card below 30%, and ideally below 10%.","Pay down high-balance cards first to lower your ratio faster.","Request a credit limit increase only if you can avoid extra spending."] },
  { id:"avoid-late-fees", category:"Credit building", title:"How to avoid late fees", description:"Create a simple system so bills are paid on time.", readTime:"3 min", actionStep:"Turn on due-date reminders for at least your top 3 bills.", content:["Set reminders 7 days and 2 days before each due date.","Use autopay for minimum payments when possible.","Keep a small bill buffer in checking to prevent overdrafts.","Paying on time protects both your cash and your credit history."] },
  { id:"snowball-vs-avalanche", category:"Debt payoff", title:"Snowball vs avalanche debt payoff", description:"Choose the debt strategy that fits your behavior and goals.", readTime:"5 min", actionStep:"Pick one method and write your debt payment order today.", content:["Snowball: pay smallest balance first for quick wins.","Avalanche: pay highest interest rate first to save more money.","Both methods require minimum payments on all debts.","Consistency matters more than picking the perfect method."] },
  { id:"business-funding-prep", category:"Business funding", title:"How to prepare for business funding", description:"Get your records funding-ready before you apply.", readTime:"5 min", actionStep:"Gather your last 3 months of business statements and revenue records.", content:["Separate personal and business finances.","Track monthly revenue, expenses, and cash flow trends.","Keep debt balances and payment history organized.","Prepare a clear plan for how funds will be used and repaid."] },
  { id:"track-net-worth", category:"Net worth", title:"How to track net worth", description:"Measure progress by tracking assets and liabilities monthly.", readTime:"4 min", actionStep:"Log your current assets and debts, then set a monthly check-in date.", content:["Net worth equals assets minus liabilities.","Track the same accounts each month for consistency.","Watch trend direction over time, not just one month.","Use net worth tracking to guide debt payoff and saving priorities."] },
  { id:"use-ai-coach", category:"App tutorials", title:"How to use the AI Coach", description:"Ask better prompts to get practical money guidance quickly.", readTime:"2 min", actionStep:"Ask AI Coach: 'What is my next best money move this week?'", content:["Be specific with questions, timelines, and dollar amounts.","Ask for one action you can complete in 15 minutes.","Use follow-up prompts to adjust advice to your real constraints.","Turn useful advice into reminders or goals immediately."] },
];

function LearningCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeLessonId, setActiveLessonId] = useState(STARTER_LESSONS[0].id);
  const [completedLessons, setCompletedLessons] = useState([]);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(LEARNING_CENTER_STORAGE_KEY) || "[]"); if (Array.isArray(saved)) setCompletedLessons(saved); } catch { setCompletedLessons([]); } }, []);
  useEffect(() => { try { localStorage.setItem(LEARNING_CENTER_STORAGE_KEY, JSON.stringify(completedLessons)); } catch {} }, [completedLessons]);
  const visibleLessons = selectedCategory === "All" ? STARTER_LESSONS : STARTER_LESSONS.filter((lesson) => lesson.category === selectedCategory);
  const activeLesson = STARTER_LESSONS.find((lesson) => lesson.id === activeLessonId) || visibleLessons[0] || STARTER_LESSONS[0];
  const completedCount = completedLessons.length;
  const percentComplete = Math.round((completedCount / STARTER_LESSONS.length) * 100);
  const recommended = STARTER_LESSONS.find((lesson) => !completedLessons.includes(lesson.id)) || STARTER_LESSONS[0];
  const markComplete = (lessonId) => setCompletedLessons((prev) => prev.includes(lessonId) ? prev : [...prev, lessonId]);

  return <div className="page-wrap">
    <div className="grid-3 mb-4">
      <div className="stat-card"><div className="label">Lessons completed</div><div className="value">{completedCount} / {STARTER_LESSONS.length}</div></div>
      <div className="stat-card"><div className="label">Percentage complete</div><div className="value">{percentComplete}%</div></div>
      <div className="stat-card"><div className="label">Recommended next lesson</div><div className="value" style={{fontSize:14}}>{recommended.title}</div></div>
    </div>
    <div className="card mb-4"><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["All", ...LEARNING_CATEGORIES].map((category) => <button key={category} className={`btn btn-sm ${selectedCategory===category ? "btn-primary" : "btn-ghost"}`} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div></div>
    <div className="grid-2" style={{alignItems:"start"}}>
      <div className="card"><div className="section-title mb-3">Lessons</div>{visibleLessons.map((lesson) => {
        const done = completedLessons.includes(lesson.id);
        return <div key={lesson.id} className="transaction-item" style={{cursor:"pointer",border:activeLesson?.id===lesson.id?"1px solid var(--accent)":"1px solid transparent"}} onClick={() => setActiveLessonId(lesson.id)}><div><div className="transaction-title">{lesson.title}</div><div className="transaction-date">{lesson.description}</div><div className="transaction-date">{lesson.category} • {lesson.readTime}</div></div><div style={{fontSize:12,color:done?"var(--green)":"var(--text2)"}}>{done ? "Completed" : "Not started"}</div></div>;
      })}</div>
      <div className="card"><div className="section-title">{activeLesson.title}</div><div className="text-sm text-muted mb-3">{activeLesson.description}</div><div className="text-sm mb-3">Estimated reading time: <strong>{activeLesson.readTime}</strong></div><div className="text-sm" style={{display:"grid",gap:8}}>{activeLesson.content.map((line, idx) => <div key={idx}>• {line}</div>)}</div><div style={{marginTop:14,padding:"10px 12px",borderRadius:10,background:"var(--bg3)",border:"1px solid var(--border2)"}}><div style={{fontWeight:700,marginBottom:6}}>Action step</div><div className="text-sm">{activeLesson.actionStep}</div></div><button className="btn btn-primary" style={{marginTop:14}} onClick={() => markComplete(activeLesson.id)} disabled={completedLessons.includes(activeLesson.id)}>{completedLessons.includes(activeLesson.id) ? "Completed" : "Mark complete"}</button></div>
    </div>
  </div>;
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
    { id:"learning-center", icon:"📚", label:"Learning Center" },
    { id:"settings",     icon:"⚙",  label:"Settings"      },
  ]},
];

const PLAN_RANK = { free: 0, pro: 1, premium: 2 };
const BILLING_STATUSES = new Set(['free', 'pro', 'premium', 'canceled', 'past_due']);
const FEATURE_GATES = { 'ai-coach': 'pro', reports: 'pro', 'debt-planner': 'pro', 'net-worth': 'pro', portfolio: 'premium', 'profit-lock': 'premium' };
const normalizePlan = (plan) => String(plan || 'free').toLowerCase();
const canAccessPlan = (plan, required = 'free') => (PLAN_RANK[normalizePlan(plan)] ?? 0) >= (PLAN_RANK[required] ?? 0);

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
  { id:"debt-planner",  icon:"🧮", label:"Debt Planner"  },
  { id:"learning-center", icon:"📚", label:"Learning Center" },
  { id:"settings",      icon:"⚙",  label:"Settings"      },
];

const PAGE_TITLES = {
  "credit-score":"Credit Score", "reports":"Reports", "profit-lock":"Profit Lock", "net-worth":"Net Worth Command Center", dashboard:"Dashboard", budget:"Budget", transactions:"Transactions",
  bills:"Bills & Subscriptions", "debt-planner":"Debt Payoff Planner", calendar:"Calendar", portfolio:"Portfolio",
  goals:"Goals", reports:"Reports", "ai-coach":"AI Coach", "learning-center":"Learning Center", settings:"Settings",
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
  const [pricingOpen, setPricingOpen] = useState(false);
  const [billingStatus, setBillingStatus] = useState('free');
  const [liveDataLoading, setLiveDataLoading] = useState(true);
  const [liveDataError, setLiveDataError] = useState("");
  const [liveData, setLiveData] = useState({
    accounts: [],
    bills: [],
    transactions: [],
    budgets: [],
    portfolio: { ...MOCK.portfolio, connected: false, holdings: [], totalValue: 0, dayChange: 0, dayChangePct: 0 },
    creditScore: null,
    debts: [],
  });
  const [manualIncomeEntries, setManualIncomeEntries] = useState([]);
  const [manualAccounts, setManualAccounts] = useState([]);
  const [onboarding, setOnboarding] = useState({ completed: false, step: 0 });
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
    try {
      const savedIncome = JSON.parse(localStorage.getItem('wp_manual_income') || localStorage.getItem('wp_manual_income_entries') || '[]');
      const savedAccounts = JSON.parse(localStorage.getItem('wp_accounts') || localStorage.getItem('wp_manual_accounts') || '[]');
      setManualIncomeEntries(Array.isArray(savedIncome) ? savedIncome : []);
      setManualAccounts(Array.isArray(savedAccounts) ? savedAccounts : []);
      const localBudgets = JSON.parse(localStorage.getItem('wp_budget_categories') || localStorage.getItem('wp_local_budgets') || '[]');
      const localBills = JSON.parse(localStorage.getItem('wp_bills') || localStorage.getItem('wp_local_bills') || '[]');
      const localDebts = JSON.parse(localStorage.getItem('wp_debts') || '[]');
      if (Array.isArray(localBudgets) && localBudgets.length) setLiveData(prev => ({ ...prev, budgets: localBudgets }));
      if (Array.isArray(localBills) && localBills.length) setLiveData(prev => ({ ...prev, bills: localBills }));
      if (Array.isArray(localDebts) && localDebts.length) setLiveData(prev => ({ ...prev, debts: localDebts }));
    } catch {
      setManualIncomeEntries([]);
      setManualAccounts([]);
    }
    try {
      const saved = JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || '{}');
      if (saved && typeof saved === 'object') setOnboarding({ completed: Boolean(saved.completed), step: Number(saved.step || 0) });
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem('wp_manual_income', JSON.stringify(manualIncomeEntries || [])); } catch {} }, [manualIncomeEntries]);
  useEffect(() => { try { localStorage.setItem('wp_accounts', JSON.stringify(manualAccounts || [])); } catch {} }, [manualAccounts]);
  useEffect(() => {
    const fetchData = async () => {
      setLiveDataLoading(true);
      setLiveDataError("");
      try {
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
        const debts = ensureArray(await safe(() => debtsApi.list(), []), []);
        setLiveData({
          accounts: ensureArray(accounts, acct.accounts),
          bills: bills.length ? bills : ensureArray(JSON.parse(localStorage.getItem('wp_bills') || localStorage.getItem('wp_local_bills') || '[]'), []),
          transactions,
          budgets: budgets.length ? budgets : ensureArray(JSON.parse(localStorage.getItem('wp_budget_categories') || localStorage.getItem('wp_local_budgets') || '[]'), []),
          portfolio,
          creditScore,
          debts: debts.length ? debts : ensureArray(JSON.parse(localStorage.getItem('wp_debts') || '[]'), [])
        });
      } catch (e) {
        console.error("Live data fetch failed", e);
        setLiveDataError("Unable to refresh live account data. Showing available data.");
      } finally {
        setLiveDataLoading(false);
      }
    };
    fetchData();
  }, [acct.accounts]);

  const addToast = (msg, type="info") => {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3000);
  };
  const refreshBudgets = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const budgets = ensureArray(await budgetsApi.list(currentMonth, currentYear), []);
    setLiveData((d) => ({ ...d, budgets }));
  };

  const addBudgetCategory = async ({ category, limit }) => {
    try {
      const now = new Date();
      await budgetsApi.create({ category, limit, month: now.getMonth() + 1, year: now.getFullYear() });
      await refreshBudgets();
      addToast("Budget category added.", "success");
    } catch {
      addToast("Unable to add budget category.", "error");
    }
  };

  const updateBudgetCategory = async (id, limit) => {
    try {
      await budgetsApi.update(id, limit);
      await refreshBudgets();
      addToast("Budget category updated.", "success");
    } catch {
      addToast("Unable to update budget category.", "error");
    }
  };

  const deleteBudgetCategory = async (id) => {
    try {
      await budgetsApi.remove(id);
      await refreshBudgets();
      addToast("Budget category deleted.", "success");
    } catch {
      addToast("Unable to delete budget category.", "error");
    }
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
  const currentPlan = normalizePlan(user?.plan || user?.user_metadata?.plan || MOCK.user.plan || 'free');
  useEffect(() => {
    if (BILLING_STATUSES.has(currentPlan)) setBillingStatus(currentPlan);
  }, [currentPlan]);

  const showPage = (id) => {
    const requiredPlan = FEATURE_GATES[id];
    if (requiredPlan && !canAccessPlan(currentPlan, requiredPlan)) {
      addToast(`This feature requires the ${requiredPlan} plan.`, "info");
      setPricingOpen(true);
      return;
    }
    setPage(id);
    setFabOpen(false);
  };

  const handleAddCategory = async (input = {}) => {
    const category = String(input.category || "").trim();
    const limit = Number(input.limit || 0);
    if (!category || !Number.isFinite(limit) || limit <= 0) return false;
    const now = new Date();
    const draft = { id: Date.now(), category, limit, spent: 0, month: now.getMonth()+1, year: now.getFullYear(), color: '#4f8ef7' };
    try {
      const created = await budgetsApi.create({ category: draft.category, limit: draft.limit, month: draft.month, year: draft.year });
      setLiveData(prev => ({ ...prev, budgets: [...ensureArray(prev.budgets, []), created || draft] }));
      return true;
    } catch {
      setLiveData(prev => {
        const fallback = [...ensureArray(prev.budgets, []), draft];
        try { localStorage.setItem('wp_budget_categories', JSON.stringify(fallback)); } catch {}
        return { ...prev, budgets: fallback };
      });
      return true;
    }
  };

  const handleAddBill = async (input = {}) => {
    const name = String(input.name || "").trim();
    const amount = Number(input.amount || 0);
    const dueDay = Number(input.dueDay || 0);
    const autopay = Boolean(input.autopay);
    if (!name || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(dueDay) || dueDay < 1 || dueDay > 31) {
      return false;
    }
    const draft = { id: Date.now(), name, amount, dueDay, due_day: dueDay, autopay, paid: false, category: 'Bills' };
    try {
      const created = await billsApi.create({ name: draft.name, amount: draft.amount, due_day: dueDay, autopay });
      setLiveData(prev => ({ ...prev, bills: [...ensureArray(prev.bills, []), created ? { ...created, dueDay: created.dueDay ?? created.due_day } : draft] }));
      return true;
    } catch {
      setLiveData(prev => {
        const fallback = [...ensureArray(prev.bills, []), draft];
        try { localStorage.setItem('wp_bills', JSON.stringify(fallback)); } catch {}
        return { ...prev, bills: fallback };
      });
      return true;
    }
  };

  const dashboardProps = {
    setPage: showPage,
    accounts: [...(liveData.accounts.length ? liveData.accounts : acct.accounts), ...(manualAccounts || [])],
    totalCash: acct.totalCash,
    creditDebt: acct.creditDebt,
    syncing: acct.syncing,
    lastSync: acct.lastSync,
    onRefresh: acct.refresh,
    bills: liveData.bills,
    budget: liveData.budgets,
    transactions: liveData.transactions,
    portfolio: liveData.portfolio,
    creditScore: liveData.creditScore,
    manualIncomeEntries,
    status: liveStatus,
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard {...dashboardProps} />;
      case "net-worth":    return <NetWorthPage accounts={acct.accounts} totalCash={acct.totalCash} creditDebt={acct.creditDebt} />;
      case "budget":       return <BudgetPage modeConfig={modeConfig} budgets={liveData.budgets} onAddCategory={handleAddCategory} />;
      case "transactions": return <TransactionsPage transactions={liveData.transactions} />;
      case "bills":        return <BillsPage bills={liveData.bills} onAddBill={handleAddBill} onUpdateBills={(next)=>setLiveData(prev=>({...prev,bills:next}))} />;
      case "debt-planner": return <DebtPlannerPage debts={liveData.debts} setDebts={(next)=>setLiveData(prev=>({...prev, debts: next}))} addToast={addToast} />;
      case "calendar":     return <CalendarPage addToast={addToast} />;
      case "portfolio":    return <PortfolioPage portfolioData={liveData.portfolio} />;
      case "net-worth":    return <NetWorthPage accounts={[...(liveData.accounts.length ? liveData.accounts : acct.accounts), ...(manualAccounts || [])]} totalCash={acct.totalCash} creditDebt={acct.creditDebt} />;
      case "profit-lock":  return <ProfitLockPage addToast={addToast} />;
      case "credit-score": return <CreditScorePage addToast={addToast} initialScore={liveData.creditScore} />;
      case "goals":        return <GoalsPage addToast={addToast} modeConfig={modeConfig} />;
      case "reports":      return <ReportsPage accounts={[...(liveData.accounts.length ? liveData.accounts : acct.accounts), ...(manualAccounts || [])]} bills={liveData.bills} budget={liveData.budgets} transactions={liveData.transactions} portfolio={liveData.portfolio} creditScore={liveData.creditScore} debts={liveData.debts} />;
      case "ai-coach":     return <AICoachPage modeConfig={modeConfig} />;
      case "learning-center": return <LearningCenterPage />;
      case "settings":     return <SettingsPage addToast={addToast} user={user} currentPlan={currentPlan} billingStatus={billingStatus} setPricingOpen={setPricingOpen} manualIncomeEntries={manualIncomeEntries} setManualIncomeEntries={setManualIncomeEntries} manualAccounts={manualAccounts} setManualAccounts={setManualAccounts} onRestartSetup={() => { setOnboarding({ completed: false, step: 0 }); try { localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ completed: false, step: 0, form: {} })); } catch {} setPage("dashboard"); }} />;
      default:             return <Dashboard {...dashboardProps} />;
    }
  };

  const completeOnboarding = async (formData = {}) => {
    if (Number(formData.monthlyIncome) > 0) {
      setManualIncomeEntries(prev => [...prev, { id: Date.now(), source_name: 'Primary income', amount: Number(formData.monthlyIncome), frequency: 'Monthly', created_at: new Date().toISOString() }]);
    }
    if (formData.billName && Number(formData.billAmount) > 0) {
      setLiveData(prev => ({ ...prev, bills: [...ensureArray(prev.bills, []), { id: Date.now()+1, name: formData.billName, amount: Number(formData.billAmount), dueDay: Number(formData.billDueDay || 1), paid: false, category: 'Bills' }] }));
    }
    if (formData.categoryName) {
      setLiveData(prev => ({ ...prev, budgets: [...ensureArray(prev.budgets, []), { id: Date.now()+2, category: formData.categoryName, limit: 0, spent: 0, color: '#4f8ef7' }] }));
    }
    if (formData.accountMethod === 'manual' && formData.accountName) {
      setManualAccounts(prev => [...prev, { id: Date.now()+3, name: formData.accountName, type: 'checking', balance: Number(formData.accountBalance || 0), institution: 'Manual', last4: '0000', manual: true }]);
    }
    if (Number(formData.creditScore) > 0) {
      setLiveData(prev => ({ ...prev, creditScore: { latest: { score: Number(formData.creditScore) } } }));
    }
    const nextState = { completed: true, step: 6, goal: formData.goal || ONBOARDING_GOALS[0] };
    setOnboarding(nextState);
    try { localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextState)); } catch {}
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
            <div className="plan-badge">✦ {currentPlan} · {billingStatus}</div>
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

          {!onboarding.completed ? (
            <div className="content">
              <OnboardingWizard onComplete={completeOnboarding} onSkip={() => { setOnboarding({ completed: true, step: 0 }); try { localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ completed: true, step: 0 })); } catch {} }} />
            </div>
          ) : (page==="ai-coach" ? renderPage() : <div className="content">{renderPage()}</div>)}
        </div>

        {pricingOpen && (
          <div style={{position:"fixed", inset:0, zIndex:600, background:"rgba(2,6,23,0.72)", display:"flex", alignItems:"center", justifyContent:"center"}} onClick={()=>setPricingOpen(false)}>
            <div className="card" style={{width:"min(980px, 94%)", maxHeight:"90vh", overflow:"auto"}} onClick={(e)=>e.stopPropagation()}>
              <div className="section-title">Subscription plans</div>
              <div className="grid-3" style={{marginTop:12}}>
                {[
                  { id:'free', price:'$0/mo', items:['manual budget','manual bills','3 budget categories','1 manual account','basic AI Coach/offline coach','basic credit score entry','basic goals']},
                  { id:'pro', price:'$9.99/mo', items:['unlimited categories','up to 6 bank accounts with Plaid','AI Coach','voice commands','SMS reminders','debt payoff planner','credit utilization tracker','net worth tracker','weekly money report']},
                  { id:'premium', price:'$19.99/mo', items:['everything in Pro','SmartCredit sync','SnapTrade portfolio sync','advanced AI recommendations','funding readiness score','advanced reports','priority features']},
                ].map((plan) => (
                  <div key={plan.id} className="card">
                    <div style={{fontWeight:700,textTransform:'capitalize'}}>{plan.id}</div>
                    <div className="text-sm mb-2">{plan.price}</div>
                    <ul className="text-sm">{plan.items.map((item) => <li key={item}>{item}</li>)}</ul>
                    <button className="btn btn-primary btn-sm" style={{marginTop:8}} onClick={async()=>{
                      if (plan.id === 'free') { setPricingOpen(false); return; }
                      const res = await fetch('/api/billing/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan: plan.id }) });
                      const data = await res.json();
                      if (data?.url) window.location.href = data.url;
                      else addToast(data?.message || 'Billing setup required.', 'info');
                    }}>Upgrade</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
  const connectSmartCredit = async () => {
    setSmartCreditState({ status: "loading", message: "Connecting SmartCredit..." });
    try {
      await creditScoreApi.get();
      setSmartCreditState({ status: "connected", message: "Credit provider reachable." });
    } catch (e) {
      setSmartCreditState({ status: "error", message: e?.message || "Connection failed. Manual score entry available." });
    }
  };
