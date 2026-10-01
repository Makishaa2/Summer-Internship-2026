import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'finance.db');

let db;
try {
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(dbPath);
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch {}
} catch {
  const Database = (await import('better-sqlite3')).default;
  db = new Database(dbPath);
  try {
    db.pragma('journal_mode = WAL');
  } catch {}
}

const DEFAULT_USER = { name: 'Makishaa', currency: 'INR' };

const DEFAULT_BUDGETS = {
  Food: 220,
  Entertainment: 120,
  Transport: 90,
  Books: 150,
  Rent: 600
};

function getDefaultTransactions() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: crypto.randomUUID(),
      amount: 1200,
      type: 'Income',
      category: 'Salary',
      date: today,
      description: 'Part-time campus job'
    },
    {
      id: crypto.randomUUID(),
      amount: 84,
      type: 'Expense',
      category: 'Food',
      date: today,
      description: 'Groceries and meals'
    },
    {
      id: crypto.randomUUID(),
      amount: 42,
      type: 'Expense',
      category: 'Transport',
      date: today,
      description: 'Metro pass'
    }
  ];
}

function getDefaultGoals() {
  return [
    {
      id: crypto.randomUUID(),
      name: 'New Laptop',
      target: 1000,
      saved: 250
    }
  ];
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY,
      amount REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target REAL NOT NULL,
      saved REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM user_profile').get();
  if (!userCount || Number(userCount.count) === 0) {
    seedDatabase();
  } else {
    db.exec("UPDATE user_profile SET currency = 'INR' WHERE currency = 'USD';");
  }
}

export function seedDatabase() {
  db.exec(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM goals;
    DELETE FROM user_profile;
  `);

  const insertUser = db.prepare('INSERT INTO user_profile (id, name, currency) VALUES (1, ?, ?)');
  insertUser.run(DEFAULT_USER.name, DEFAULT_USER.currency);

  const insertBudget = db.prepare('INSERT INTO budgets (category, amount) VALUES (?, ?)');
  for (const [cat, amt] of Object.entries(DEFAULT_BUDGETS)) {
    insertBudget.run(cat, amt);
  }

  const insertTx = db.prepare(
    'INSERT INTO transactions (id, amount, type, category, date, description) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const tx of getDefaultTransactions()) {
    insertTx.run(tx.id, tx.amount, tx.type, tx.category, tx.date, tx.description);
  }

  const insertGoal = db.prepare(
    'INSERT INTO goals (id, name, target, saved) VALUES (?, ?, ?, ?)'
  );
  for (const goal of getDefaultGoals()) {
    insertGoal.run(goal.id, goal.name, goal.target, goal.saved);
  }
}

export function getUser() {
  const row = db.prepare('SELECT name, currency FROM user_profile WHERE id = 1').get();
  if (!row) {
    return { ...DEFAULT_USER };
  }
  return { name: row.name, currency: row.currency };
}

export function updateUser({ name, currency }) {
  const current = getUser();
  const nextName = name !== undefined && name !== null ? String(name).trim() : current.name;
  const nextCurrency = currency !== undefined && currency !== null ? String(currency).trim() : current.currency;

  db.prepare(`
    INSERT INTO user_profile (id, name, currency)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      currency = excluded.currency
  `).run(nextName, nextCurrency);

  return { name: nextName, currency: nextCurrency };
}

export function getTransactions() {
  const rows = db.prepare(
    'SELECT id, amount, type, category, date, description FROM transactions ORDER BY date DESC, created_at DESC, rowid DESC'
  ).all();

  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    type: r.type,
    category: r.category,
    date: r.date,
    description: r.description || ''
  }));
}

export function addTransaction({ id, amount, type, category, date, description }) {
  const txId = id || crypto.randomUUID();
  const txAmount = Number(amount) || 0;
  const txType = type === 'Income' ? 'Income' : 'Expense';
  const txCategory = category || 'Other';
  const txDate = date || new Date().toISOString().slice(0, 10);
  const txDesc = description !== undefined && description !== null ? String(description).trim() : '';

  db.prepare(`
    INSERT INTO transactions (id, amount, type, category, date, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(txId, txAmount, txType, txCategory, txDate, txDesc);

  return {
    id: txId,
    amount: txAmount,
    type: txType,
    category: txCategory,
    date: txDate,
    description: txDesc
  };
}

export function deleteTransaction(id) {
  const res = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  return { success: true, id, changes: res.changes };
}

export function getBudgets() {
  const rows = db.prepare('SELECT category, amount FROM budgets').all();
  const result = { ...DEFAULT_BUDGETS };
  for (const r of rows) {
    result[r.category] = Number(r.amount);
  }
  return result;
}

export function setBudget(category, amount) {
  const cat = String(category).trim();
  const amt = Math.max(0, Number(amount) || 0);

  db.prepare(`
    INSERT INTO budgets (category, amount)
    VALUES (?, ?)
    ON CONFLICT(category) DO UPDATE SET amount = excluded.amount
  `).run(cat, amt);

  return { category: cat, amount: amt };
}

export function getGoals() {
  const rows = db.prepare(
    'SELECT id, name, target, saved FROM goals ORDER BY created_at ASC, rowid ASC'
  ).all();

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    target: Number(r.target),
    saved: Number(r.saved)
  }));
}

export function addGoal({ id, name, target, saved = 0 }) {
  const goalId = id || crypto.randomUUID();
  const goalName = String(name || '').trim();
  const goalTarget = Math.max(1, Number(target) || 0);
  const goalSaved = Math.max(0, Number(saved) || 0);

  db.prepare(`
    INSERT INTO goals (id, name, target, saved)
    VALUES (?, ?, ?, ?)
  `).run(goalId, goalName, goalTarget, goalSaved);

  return {
    id: goalId,
    name: goalName,
    target: goalTarget,
    saved: goalSaved
  };
}

export function allocateGoal(id, amount) {
  const goal = db.prepare('SELECT id, name, target, saved FROM goals WHERE id = ?').get(id);
  if (!goal) {
    return null;
  }

  const addAmount = Number(amount) || 0;
  const currentSaved = Number(goal.saved) || 0;
  const target = Number(goal.target) || 0;
  const newSaved = Math.min(target, Math.max(0, currentSaved + addAmount));

  db.prepare('UPDATE goals SET saved = ? WHERE id = ?').run(newSaved, id);

  return {
    id: goal.id,
    name: goal.name,
    target,
    saved: newSaved
  };
}

export function deleteGoal(id) {
  const res = db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  return { success: true, id, changes: res.changes };
}

export function getFullState() {
  return {
    user: getUser(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    goals: getGoals()
  };
}

export function resetDatabase() {
  seedDatabase();
  return getFullState();
}

// Auto-initialize tables when imported
initDatabase();
