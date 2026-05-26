# Personal Finance Tracker

A minimal, fully functional single-page finance tracker for college students.

## Features

- Mock login and editable profile with currency preference
- Income and expense logging with recent transactions
- Dynamic total balance, income, and expense summaries
- Monthly budgets with progress bars and 90% warning alerts
- Savings goals with allocation controls and progress bars
- Expense donut chart and income vs. expenses bar chart
- CSV export for transaction history
- LocalStorage persistence
- Browser data migration that updates older demo profile data to Makishaa
- Clear action feedback for adding, deleting, exporting, allocating, logging out, and resetting demo data

## Run Locally

This project can run as a zero-setup static MVP:

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:5173
```

If the browser is already open from an older version, refresh the page once. The app will migrate the saved profile name in LocalStorage automatically. You can also use `Profile > Reset Demo Data` inside the dashboard.

The `package.json` also includes Vite scripts for a standard React workflow once dependencies are installed:

```powershell
npm install
npm run dev
```
