# Money Manager Front

React frontend for the Money Manager household budget tool. Talks to the FastAPI backend to show income/expense summaries, category breakdowns, and transaction history.

Backend repository: [money_manager](https://github.com/RedFalcon72/money_manager)

## Features

- Dashboard with income/expense/balance summary, category breakdown pie chart, and recent transactions
- Date range switching (this month / last month / custom)
- Transaction list with date and category filtering, inline category editing
- CSV import via drag-and-drop or file picker, with import history
- Light/dark theme
- Income/expense color scheme (income red / expense green,income green / expense red)

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- Recharts
- React Router

## Setup

```bash
npm install
```

## Usage

Start the backendBackend repository: [money_manager](https://github.com/RedFalcon72/money_manager) first, then the frontend.

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API docs: http://127.0.0.1:8000/docs

The frontend expects the backend at http://127.0.0.1:8000 by default.
Set `VITE_API_BASE_URL` to override.

## Project Structure

```text
.
├── eslint.config.js
├── index.html
├── LICENCE
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
└── src/
	├── App.tsx
	├── index.css
	├── main.tsx
	├── assets/
	└── components/
		├── Dashboard.tsx
		├── Import.tsx
		├── Settings.tsx
		└── Transactions.tsx
```

## License

All Rights Reserved. See LICENSE for details.
