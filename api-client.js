// api-client.js
// Thin fetch wrapper. All API calls go through here.
// Token stored in localStorage. Replace with httpOnly cookies in production.

const BASE = '/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken  = () => (typeof window !== 'undefined' ? localStorage.getItem('wp_token') : null);
export const setToken  = (t) => { if (typeof window !== 'undefined') localStorage.setItem('wp_token', t); };
export const clearToken = () => { if (typeof window !== 'undefined') localStorage.removeItem('wp_token'); };

// ── Core fetch ────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error('Unexpected server response. Please try again.');
    }
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid server response. Please try again.');
  }

  if (!res.ok) {
    const message = payload?.message || payload?.error || 'Request failed. Please try again.';
    const e = new Error(message);
    e.code = payload?.code;
    e.status = res.status;
    e.details = payload;
    throw e;
  }
  return payload.data;
}

const get    = (path)         => request(path);
const post   = (path, body)   => request(path, { method: 'POST',   body });
const put    = (path, body)   => request(path, { method: 'PUT',    body });
const del    = (path)         => request(path, { method: 'DELETE' });

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
};

const normalizeBill = (bill = {}) => ({
  ...bill,
  dueDay: Number(pick(bill, 'dueDay', 'due_day') ?? 0),
  amount: Number(pick(bill, 'amount', 'amount_due') ?? 0),
  amountDue: Number(pick(bill, 'amountDue', 'amount_due', 'amount') ?? 0),
  minimumPayment: Number(pick(bill, 'minimumPayment', 'minimum_payment') ?? 0),
});

const normalizeTransaction = (tx = {}) => ({
  ...tx,
  transactionDate: pick(tx, 'transactionDate', 'transaction_date', 'date') ?? null,
  accountId: pick(tx, 'accountId', 'account_id') ?? null,
  categoryId: pick(tx, 'categoryId', 'category_id') ?? null,
});

const normalizeAccount = (account = {}) => ({
  ...account,
  creditLimit: Number(pick(account, 'creditLimit', 'credit_limit') ?? 0),
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  signup: (email, password, name) => post('/auth/signup', { email, password, name }),
  login:  (email, password)       => post('/auth/login',  { email, password }),
  logout: ()                      => post('/auth/logout', {}),
  me:     ()                      => get('/users/me'),
  enableTwoFactor: (email)        => post('/auth/2fa/enable', { email }),
  disableTwoFactor: (email)       => post('/auth/2fa/disable', { email }),
  sendTwoFactorCode: (email)      => post('/auth/2fa/send-code', { email }),
  verifyTwoFactorCode: (email, code) => post('/auth/2fa/verify', { email, code }),
};


// ── Accounts ──────────────────────────────────────────────────────────────
export const accounts = {
  list: async () => {
    const data = await get('/accounts');
    return (Array.isArray(data) ? data : []).map(normalizeAccount);
  },
  create: (data) => post('/accounts', data),
};

// ── Bills ─────────────────────────────────────────────────────────────────────
export const bills = {
  list:   async ()    => (await get('/bills') || []).map(normalizeBill),
  create: (data)      => post('/bills', data),
  update: (id, data)  => put(`/bills/${id}`, data),
  remove: (id)        => del(`/bills/${id}`),
};

// ── Calendar Events ───────────────────────────────────────────────────────────
export const calendarEvents = {
  list:   (month, year) => get(`/calendar-events?month=${month}&year=${year}`),
  create: (data)        => post('/calendar-events', data),
  update: (id, data)    => put(`/calendar-events/${id}`, data),
  remove: (id)          => del(`/calendar-events/${id}`),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactions = {
  list:           async (params = {}) => {
    const data = await get(`/transactions?${new URLSearchParams(params)}`);
    const rows = Array.isArray(data) ? data : (data?.transactions || []);
    return rows.map(normalizeTransaction);
  },
  create:         (data)        => post('/transactions', data),
  updateCategory: (id, cat)     => put(`/transactions/${id}`, { category: cat }),
};

// ── Budgets ───────────────────────────────────────────────────────────────────
export const budgets = {
  list:   (month, year) => get(`/budgets?month=${month}&year=${year}`),
  create: (data)        => post('/budgets', data),
  update: (id, limit)   => put(`/budgets/${id}`, { limit }),
  remove: (id)          => del(`/budgets/${id}`),
};

// ── Debts ─────────────────────────────────────────────────────────────────────
export const debts = {
  list:   ()          => get('/debts'),
  create: (data)      => post('/debts', data),
  update: (id, data)  => put(`/debts/${id}`, data),
  remove: (id)        => del(`/debts/${id}`),
};

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolio = {
  list: async () => {
    const data = await get('/portfolio');
    return data || { holdings: [], summary: { totalValue: 0, dayChangePct: 0 }, connected: false };
  },
  sync: ()     => post('/portfolio/sync', {}),
  add:  (data) => post('/portfolio', data),
};

// ── Credit Score ──────────────────────────────────────────────────────────────
export const creditScore = {
  get:    ()     => get('/credit-score'),
  record: (data) => post('/credit-score', data),
};


export const creditReport = {
  scan: async (file, onProgress) => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/credit-report/scan`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const payload = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) return resolve(payload.data);
          reject(new Error(payload?.error || 'Request failed. Please try again.'));
        } catch {
          reject(new Error('Unexpected server response. Please try again.'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload.'));
      xhr.send(form);
    });
  },
  save: (scanData) => post('/credit-report/save', { scanData }),
};

export const scanCreditReportPdf = (file, onProgress) => creditReport.scan(file, onProgress);
export const saveCreditReportScan = (scanData) => creditReport.save(scanData);

// ── AI Coach ──────────────────────────────────────────────────────────────────
export const ai = {
  chat: (message, history, mode, context) => post('/ai/chat', { message, history, ...(mode ? { mode } : {}), ...(context ? { context } : {}) }),
};

// ── Plaid ─────────────────────────────────────────────────────────────────────
export const plaid = {
  getLinkToken:  ()              => post('/plaid/link-token', {}),
  exchange:      (public_token)  => post('/plaid/exchange', { public_token }),
  sync:          ()              => post('/plaid/sync', {}),
};

// ── Reminders ─────────────────────────────────────────────────────────────────

export const reminders = {
  getPreferences: () => get('/reminders/preferences'),
  savePreferences: (data) => post('/reminders/preferences', data),
  sendTest: () => post('/reminders/test', {}),
  sendBudgetSummary: (userId) => post('/reminders/send-budget-summary', { userId }),
};

export const getHealthStatus = () => get('/health');
