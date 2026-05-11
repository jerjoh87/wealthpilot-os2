// api-client.js
// Thin fetch wrapper. All API calls go through here.
// Token stored in localStorage. Replace with httpOnly cookies in production.

const BASE = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api`
  : '/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken  = () => (typeof window !== 'undefined' ? localStorage.getItem('wp_token') : null);
export const setToken  = (t) => localStorage.setItem('wp_token', t);
export const clearToken = () => localStorage.removeItem('wp_token');

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

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

const get    = (path)         => request(path);
const post   = (path, body)   => request(path, { method: 'POST',   body });
const put    = (path, body)   => request(path, { method: 'PUT',    body });
const del    = (path)         => request(path, { method: 'DELETE' });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  signup: (email, password, name) => post('/auth/signup', { email, password, name }),
  login:  (email, password)       => post('/auth/login',  { email, password }),
  logout: ()                      => post('/auth/logout', {}),
  me:     ()                      => get('/users/me'),
};

// ── Bills ─────────────────────────────────────────────────────────────────────
export const bills = {
  list:   ()          => get('/bills'),
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
  list:           (params = {}) => get(`/transactions?${new URLSearchParams(params)}`),
  updateCategory: (id, cat)     => put(`/transactions/${id}`, { category: cat }),
};

// ── Budgets ───────────────────────────────────────────────────────────────────
export const budgets = {
  list:   (month, year) => get(`/budgets?month=${month}&year=${year}`),
  create: (data)        => post('/budgets', data),
  update: (id, limit)   => put(`/budgets/${id}`, { limit }),
};

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolio = {
  list: ()     => get('/portfolio'),
  sync: ()     => post('/portfolio/sync', {}),
  add:  (data) => post('/portfolio', data),
};

// ── Credit Score ──────────────────────────────────────────────────────────────
export const creditScore = {
  get:    ()     => get('/credit-score'),
  record: (data) => post('/credit-score', data),
};

// ── AI Coach ──────────────────────────────────────────────────────────────────
export const ai = {
  chat: (message, history, mode) => post('/ai/chat', { message, history, ...(mode ? { mode } : {}) }),
};

// ── Plaid ─────────────────────────────────────────────────────────────────────
export const plaid = {
  getLinkToken:  ()              => post('/plaid/link-token', {}),
  exchange:      (public_token)  => post('/plaid/exchange', { public_token }),
  sync:          ()              => post('/plaid/sync', {}),
};
