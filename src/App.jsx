import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Bell,
  Download,
  Landmark,
  LogOut,
  PiggyBank,
  Plus,
  Save,
  Target,
  Trash2,
  UserRound,
  Wallet
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const FinanceContext = createContext(null);
const categories = ["Food", "Rent", "Entertainment", "Transport", "Books", "Salary", "Freelance", "Other"];
const budgetCategories = ["Food", "Entertainment", "Transport", "Books", "Rent"];
const palette = ["#047857", "#0891b2", "#f59e0b", "#dc2626", "#6366f1", "#14b8a6", "#84cc16"];
const storageKey = "student-finance-tracker";
const fallbackName = "Makishaa";
const previousDemoName = ["Nis", "han", "th"].join("");
const defaultState = {
  user: { name: fallbackName, currency: "USD" },
  isLoggedIn: false,
  transactions: [
    { id: crypto.randomUUID(), amount: 1200, type: "Income", category: "Salary", date: new Date().toISOString().slice(0, 10), description: "Part-time campus job" },
    { id: crypto.randomUUID(), amount: 84, type: "Expense", category: "Food", date: new Date().toISOString().slice(0, 10), description: "Groceries and meals" },
    { id: crypto.randomUUID(), amount: 42, type: "Expense", category: "Transport", date: new Date().toISOString().slice(0, 10), description: "Metro pass" }
  ],
  budgets: { Food: 220, Entertainment: 120, Transport: 90, Books: 150, Rent: 600 },
  goals: [
    { id: crypto.randomUUID(), name: "New Laptop", target: 1000, saved: 250 }
  ]
};

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return defaultState;
    const parsed = { ...defaultState, ...JSON.parse(saved) };
    // Migrate older demo data saved in the browser without exposing that value in the UI.
    const savedName = parsed.user?.name?.trim();
    const shouldReplaceName = !savedName || savedName.toLowerCase() === previousDemoName.toLowerCase();
    return {
      ...parsed,
      user: {
        ...defaultState.user,
        ...parsed.user,
        name: shouldReplaceName ? fallbackName : parsed.user.name
      },
      budgets: { ...defaultState.budgets, ...parsed.budgets }
    };
  } catch {
    return defaultState;
  }
}

function FinanceProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => {
    const update = (patch) => setState((current) => ({ ...current, ...patch }));
    const notify = (message) => {
      setNotice(message);
      window.clearTimeout(window.financeNoticeTimer);
      window.financeNoticeTimer = window.setTimeout(() => setNotice(""), 2800);
    };
    return {
      ...state,
      notice,
      notify,
      login: (name) => update({ isLoggedIn: true, user: { ...state.user, name: name || state.user.name } }),
      logout: () => {
        update({ isLoggedIn: false });
        notify("Signed out. Your finance data is still saved on this browser.");
      },
      updateProfile: (user) => {
        update({ user: { ...state.user, ...user } });
        notify("Profile updated.");
      },
      addTransaction: (transaction) => {
        update({ transactions: [{ ...transaction, id: crypto.randomUUID() }, ...state.transactions] });
        notify(`${transaction.type} added.`);
      },
      removeTransaction: (id) => {
        update({ transactions: state.transactions.filter((item) => item.id !== id) });
        notify("Transaction deleted.");
      },
      setBudget: (category, amount) =>
        update({ budgets: { ...state.budgets, [category]: Number(amount) || 0 } }),
      addGoal: (goal) => {
        update({ goals: [{ ...goal, id: crypto.randomUUID(), saved: 0 }, ...state.goals] });
        notify("Savings goal added.");
      },
      allocateGoal: (id, amount) => {
        if (!Number(amount)) {
          notify("Enter an amount before saving to a goal.");
          return;
        }
        update({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, saved: Math.min(goal.target, goal.saved + (Number(amount) || 0)) }
              : goal
          )
        });
        notify("Funds allocated to goal.");
      },
      removeGoal: (id) => {
        update({ goals: state.goals.filter((goal) => goal.id !== id) });
        notify("Savings goal deleted.");
      },
      resetDemoData: () => {
        localStorage.removeItem(storageKey);
        setState({ ...defaultState, isLoggedIn: true });
        notify("Demo data reset.");
      }
    };
  }, [state, notice]);

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

function useFinance() {
  return useContext(FinanceContext);
}

function formatMoney(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value || 0);
}

function LoginScreen() {
  const { login } = useFinance();
  const [name, setName] = useState("");

  return (
    <main className="min-h-screen bg-mint px-5 py-10 text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest shadow-soft">
            <Wallet size={18} /> Student Money Desk
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            Personal Finance Tracker
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Track income, expenses, budgets, and savings in one quiet dashboard made for college life.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {["Login & Profile", "Income and Expenses", "Budgets", "Savings Goals"].map((item) => (
              <div key={item} className="border-l-4 border-forest bg-white/80 p-4 font-semibold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
        <form
          className="card p-6 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            login(name);
          }}
        >
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Mock login</p>
              <h2 className="mt-2 text-2xl font-bold">Welcome back</h2>
            </div>
            <UserRound className="text-forest" />
          </div>
          <label className="mb-4 block text-sm font-semibold text-slate-700">
            Name
            <input className="field mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
          <label className="mb-6 block text-sm font-semibold text-slate-700">
            Password
            <input className="field mt-2" type="password" placeholder="Any password works" />
          </label>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-emerald-700">
            <Landmark size={18} /> Enter Dashboard
          </button>
        </form>
      </section>
    </main>
  );
}

function SummaryCards() {
  const { transactions, user } = useFinance();
  const income = transactions.filter((item) => item.type === "Income").reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = transactions.filter((item) => item.type === "Expense").reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expenses;
  const cards = [
    { label: "Total Balance", value: balance, icon: Wallet, tone: "bg-forest text-white" },
    { label: "Income", value: income, icon: ArrowUpCircle, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Expenses", value: expenses, icon: ArrowDownCircle, tone: "bg-rose-50 text-rose-700" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className={`rounded-xl p-5 ${tone}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold opacity-80">{label}</span>
            <Icon size={22} />
          </div>
          <p className="mt-4 text-3xl font-bold">{formatMoney(value, user.currency)}</p>
        </div>
      ))}
    </div>
  );
}

function ProfilePanel() {
  const { user, updateProfile, logout, resetDemoData } = useFinance();
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Profile</h2>
        <button type="button" className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Name
          <input className="field mt-2" value={user.name} onChange={(event) => updateProfile({ name: event.target.value })} />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Currency
          <select className="field mt-2" value={user.currency} onChange={(event) => updateProfile({ currency: event.target.value })}>
            {["USD", "INR", "EUR", "GBP", "AUD"].map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" className="mt-4 w-full rounded-lg border border-emerald-200 bg-mint px-4 py-2 text-sm font-semibold text-forest transition hover:bg-emerald-100" onClick={resetDemoData}>
        Reset Demo Data
      </button>
    </section>
  );
}

function TransactionPanel() {
  const { transactions, addTransaction, removeTransaction, user, notify } = useFinance();
  const [form, setForm] = useState({
    amount: "",
    type: "Expense",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    description: ""
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center gap-2">
        <Plus className="text-forest" size={20} />
        <h2 className="text-lg font-bold">Income & Expense Tracker</h2>
      </div>
      <form
        className="grid gap-3 lg:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!Number(form.amount)) {
            notify("Enter a transaction amount first.");
            return;
          }
          addTransaction({ ...form, amount: Number(form.amount) });
          setForm({ ...form, amount: "", description: "" });
        }}
      >
        <input className="field lg:col-span-1" aria-label="Transaction amount" required type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(event) => update("amount", event.target.value)} />
        <select className="field" aria-label="Transaction type" value={form.type} onChange={(event) => update("type", event.target.value)}>
          <option>Expense</option>
          <option>Income</option>
        </select>
        <select className="field" aria-label="Transaction category" value={form.category} onChange={(event) => update("category", event.target.value)}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input className="field" aria-label="Transaction date" required type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
        <input className="field lg:col-span-2" aria-label="Transaction description" placeholder="Short description" value={form.description} onChange={(event) => update("description", event.target.value)} />
        <button type="submit" className="rounded-lg bg-forest px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 lg:col-span-6">
          Add Transaction
        </button>
      </form>
      <div className="scrollbar-thin mt-5 max-h-72 overflow-auto">
        {transactions.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
            <div className={`rounded-full p-2 ${item.type === "Income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {item.type === "Income" ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{item.description || item.category}</p>
              <p className="text-sm text-slate-500">{item.category} - {item.date}</p>
            </div>
            <p className={`font-bold ${item.type === "Income" ? "text-emerald-700" : "text-rose-700"}`}>
              {item.type === "Income" ? "+" : "-"}{formatMoney(item.amount, user.currency)}
            </p>
            <button type="button" className="icon-btn" onClick={() => removeTransaction(item.id)} aria-label={`Delete ${item.description || item.category} transaction`} title="Delete transaction">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function BudgetPanel() {
  const { transactions, budgets, setBudget, user } = useFinance();
  const spentByCategory = useMemo(() => {
    return transactions
      .filter((item) => item.type === "Expense")
      .reduce((acc, item) => ({ ...acc, [item.category]: (acc[item.category] || 0) + Number(item.amount) }), {});
  }, [transactions]);

  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center gap-2">
        <Landmark className="text-forest" size={20} />
        <h2 className="text-lg font-bold">Budget Planner</h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Budget limits save automatically when edited.</p>
        {budgetCategories.map((category) => {
          const limit = budgets[category] || 0;
          const spent = spentByCategory[category] || 0;
          const percent = limit ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
          return (
            <div key={category}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{category}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{formatMoney(spent, user.currency)} / {formatMoney(limit, user.currency)}</span>
                  <input className="field w-28 py-2" aria-label={`${category} monthly budget`} type="number" min="0" value={limit} onChange={(event) => setBudget(category, event.target.value)} onBlur={() => {}} />
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${percent >= 90 ? "bg-amber-500" : "bg-forest"}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function GoalsPanel() {
  const { goals, addGoal, allocateGoal, removeGoal, user, notify } = useFinance();
  const [goal, setGoal] = useState({ name: "", target: "" });
  const [allocations, setAllocations] = useState({});

  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center gap-2">
        <Target className="text-forest" size={20} />
        <h2 className="text-lg font-bold">Savings Goals</h2>
      </div>
      <form
        className="mb-5 grid gap-3 sm:grid-cols-[1fr_140px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!goal.name || !Number(goal.target)) {
            notify("Enter a goal name and target amount.");
            return;
          }
          addGoal({ name: goal.name, target: Number(goal.target) });
          setGoal({ name: "", target: "" });
        }}
      >
        <input className="field" required placeholder="Goal name" value={goal.name} onChange={(event) => setGoal({ ...goal, name: event.target.value })} />
        <input className="field" required type="number" min="1" placeholder="Target" value={goal.target} onChange={(event) => setGoal({ ...goal, target: event.target.value })} />
        <button type="submit" className="rounded-lg bg-forest px-4 py-3 font-semibold text-white">
          Add Goal
        </button>
      </form>
      <div className="space-y-4">
        {goals.map((item) => {
          const percent = Math.min(100, Math.round((item.saved / item.target) * 100));
          return (
            <div key={item.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-slate-500">{formatMoney(item.saved, user.currency)} saved of {formatMoney(item.target, user.currency)}</p>
                </div>
                <button type="button" className="icon-btn" onClick={() => removeGoal(item.id)} aria-label={`Delete ${item.name} goal`} title="Delete goal">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <input className="field py-2" aria-label={`Allocate funds to ${item.name}`} type="number" min="0.01" placeholder="Allocate funds" value={allocations[item.id] || ""} onChange={(event) => setAllocations({ ...allocations, [item.id]: event.target.value })} />
                <button type="button" className="icon-btn" onClick={() => { allocateGoal(item.id, allocations[item.id]); setAllocations({ ...allocations, [item.id]: "" }); }} aria-label={`Save allocation to ${item.name}`} title="Save allocation">
                  <Save size={17} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReportsPanel() {
  const { transactions } = useFinance();
  const expenseBreakdown = useMemo(() => {
    const data = transactions
      .filter((item) => item.type === "Expense")
      .reduce((acc, item) => ({ ...acc, [item.category]: (acc[item.category] || 0) + Number(item.amount) }), {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);
  const monthly = useMemo(() => {
    const data = {};
    transactions.forEach((item) => {
      const day = item.date?.slice(5) || "Today";
      data[day] = data[day] || { day, Income: 0, Expense: 0 };
      data[day][item.type] += Number(item.amount);
    });
    return Object.values(data).sort((a, b) => a.day.localeCompare(b.day));
  }, [transactions]);

  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="text-forest" size={20} />
        <h2 className="text-lg font-bold">Reports & Charts</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 rounded-lg border border-slate-100 p-3">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                {expenseBreakdown.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-lg border border-slate-100 p-3">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Income" fill="#047857" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function AlertsExportPanel() {
  const { transactions, budgets, user, notify } = useFinance();
  const alerts = useMemo(() => {
    const spent = transactions
      .filter((item) => item.type === "Expense")
      .reduce((acc, item) => ({ ...acc, [item.category]: (acc[item.category] || 0) + Number(item.amount) }), {});
    return Object.entries(budgets)
      .filter(([category, limit]) => limit > 0 && (spent[category] || 0) / limit >= 0.9)
      .map(([category, limit]) => ({ category, limit, spent: spent[category] || 0 }));
  }, [transactions, budgets]);

  function exportCsv() {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = transactions.map((item) => [item.date, item.type, item.category, item.amount, item.description]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-finance-transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify("Transaction CSV exported.");
  }

  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="text-forest" size={20} />
          <h2 className="text-lg font-bold">Export / Alerts</h2>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-mint px-4 py-2 font-semibold text-forest" onClick={exportCsv}>
          <Download size={17} /> Export CSV
        </button>
      </div>
      {alerts.length ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.category} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <AlertTriangle size={20} />
              <p className="text-sm">
                <strong>{alert.category}</strong> is at {Math.round((alert.spent / alert.limit) * 100)}% of budget: {formatMoney(alert.spent, user.currency)} spent.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No budget alerts right now.</p>
      )}
    </section>
  );
}

function Dashboard() {
  const { user, notice } = useFinance();
  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Personal Finance Tracker</p>
            <h1 className="mt-2 text-3xl font-bold">Hi, {user.name || "Student"}</h1>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-mint px-4 py-2 font-semibold text-forest">
            <PiggyBank size={18} /> College-ready money plan
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
        {notice && (
          <div className="rounded-lg border border-emerald-200 bg-mint px-4 py-3 text-sm font-semibold text-forest" role="status">
            {notice}
          </div>
        )}
        <SummaryCards />
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <TransactionPanel />
            <BudgetPanel />
            <ReportsPanel />
          </div>
          <aside className="grid content-start gap-5">
            <ProfilePanel />
            <GoalsPanel />
            <AlertsExportPanel />
          </aside>
        </div>
      </div>
    </main>
  );
}

function App() {
  const { isLoggedIn } = useFinance();
  return isLoggedIn ? <Dashboard /> : <LoginScreen />;
}

createRoot(document.getElementById("root")).render(
  <FinanceProvider>
    <App />
  </FinanceProvider>
);
