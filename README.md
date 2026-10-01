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

### Fullstack (Backend + SQLite DB + Frontend)

Start the Express backend and SQLite database along with the frontend dev server:

```powershell
npm install
npm run dev
```

Or run the backend server directly (which serves both the API and the web application at `http://127.0.0.1:5000`):

```powershell
npm start
```

### Static Mode

This project can also run as a zero-setup static MVP:

```powershell
npm run dev:client
```

Then open:

```text
http://127.0.0.1:5173
```

If the browser is already open from an older version, refresh the page once. The app will sync with the SQLite database automatically. You can also use `Profile > Reset Demo Data` inside the dashboard.

## Backend & Database

- **Backend**: Express REST API (`server/index.js`, `server/routes.js`)
- **Database**: SQLite (`data/finance.db`) via `server/db.js` with auto-migration and demo seeding
- **API Endpoints**:
  - `GET /api/state` - Fetch full user state, transactions, budgets, and goals
  - `GET /api/user` & `PUT /api/user` - View and update user profile
  - `GET /api/transactions` & `POST /api/transactions` & `DELETE /api/transactions/:id` - Transaction CRUD
  - `GET /api/budgets` & `PUT /api/budgets/:category` - Budget management
  - `GET /api/goals` & `POST /api/goals` & `POST /api/goals/:id/allocate` & `DELETE /api/goals/:id` - Savings goal management
  - `POST /api/reset` - Reset demo data in the SQLite database

