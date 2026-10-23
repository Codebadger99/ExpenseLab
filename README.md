# ExpenseLab

ExpenseLab is a personal finance web app for bringing everyday money decisions
into one place. Record income and expenses, set a monthly spending target, plan
category budgets, track savings goals, and reflect on purchases. The dashboard
turns that information into monthly summaries, spending charts, and insights.

The application has two parts:

- **Frontend:** a responsive React single-page app for the public landing page,
  account flows, onboarding, and signed-in workspace.
- **Backend:** a NestJS REST API that authenticates users and stores each
  account's financial data in PostgreSQL through Prisma.

## Screenshots

### Landing page design

The design preview shows the landing page's desktop layout and feature sections.

![ExpenseLab landing page design preview](frontend/designs/ExpenseLab%20%C2%B7%20Landing%20page.png)

### Workspace preview

This dashboard-style preview is included on the landing page to illustrate the
monthly overview. Its figures are sample presentation data, not a signed-in
account or live database contents.

![ExpenseLab monthly workspace preview](frontend/src/assets/Workspace%20preview.png)

## What the website does

### Accounts and first-time setup

Create an account with a name, email address, and password, or sign in to an
existing account. New accounts are guided through a short setup:

1. Choose a whole-number monthly spending target.
2. Allocate that target across spending categories.
3. Continue to the workspace and adjust the target or budgets later.

If a password is forgotten, request a time-limited reset code by email and
choose a new password. Email delivery requires SMTP settings on the backend.
Account deletion is available in account settings. To confirm, type `DELETE`;
the request uses your active sign-in session.

### Overview

The Overview page brings the current month into focus. It includes key totals
and spending context, a daily spending chart, a category pie chart, budget
progress, and savings goal progress. The category breakdown pairs the chart
with readable category names and amounts. Pie charts are static; charts that
show trends or payment methods can provide hover details.

### Transactions

Record expenses and income with an amount, description, date, and payment
method. Expenses also have a category and a need-or-want choice; income records
have an income source. Dates cannot be in the future. The transaction list can
be searched and filtered, and each transaction has a details view with edit and
delete actions.

The list paginates automatically: 20 transactions per page on larger screens
and 10 on mobile and tablet layouts.

### Budgets and goals

Budgets set monthly spending limits by category and show spending against each
limit. Savings goals have a name and target; record contributions to update
progress toward the goal. Both can be changed as priorities evolve.

### Journal

The Journal pairs expense transactions with a review entry. Open an expense to
see its details, write why you made the purchase, choose whether it was worth
it, and optionally leave a note to your future self. An entry remains in
**Needs review** until you choose a worth-it response and save it.

### Insights and notifications

Insights summarizes patterns such as daily spending, needs versus wants,
payment methods, and top merchants for a selected month. Budget notifications
appear in the notification center; mark alerts individually or all at once.

### Responsive layout and themes

The public site and workspace adapt to desktop, tablet, and mobile screens.
Navigation, dialogs, filters, charts, and transaction pagination are arranged
for smaller viewports. Light and dark themes are available.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS, Recharts |
| Backend | NestJS, TypeScript, class-validator |
| Data access | Prisma |
| Database | PostgreSQL |
| Authentication | JWT access tokens and bcrypt password hashing |

## Requirements

- Node.js and npm
- PostgreSQL
- An SMTP account if you want to use password-reset email

Run the frontend and backend in separate terminals. Commands below are shown
from the repository root unless noted.

## Local setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

Create a PostgreSQL database (for example, `expenselab`) and create
`backend/.env` with your local connection settings:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/expenselab?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

`PORT` defaults to `3000`; `FRONTEND_URL` defaults to `http://localhost:5173`.
`JWT_SECRET` should be a strong, private value. Never commit real credentials
or `.env` files.

Apply the checked-in database migrations:

```bash
npx prisma migrate deploy
```

For password-reset emails, also configure the following in `backend/.env`.
Use the SMTP values supplied by your mail provider.

```dotenv
SMTP_HOST="your-smtp-host"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
MAIL_FROM="you@example.com"
```

If your provider uses port `587` with STARTTLS, set `SMTP_PORT=587` and
`SMTP_SECURE=false`.

### 2. Install frontend dependencies

Open another terminal at the repository root:

```bash
cd frontend
npm install
```

The frontend API client uses `http://localhost:3000` by default. To use a
different backend URL, create `frontend/.env`:

```dotenv
VITE_API_URL="http://localhost:3000"
```

Restart the Vite server after changing frontend environment variables.

### 3. Start both applications

In the backend terminal, from `backend/`:

```bash
npm run start:dev
```

In the frontend terminal, from `frontend/`:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.
The backend API is usually available at `http://localhost:3000`.

## Useful commands

Run each command from its corresponding directory.

### Frontend (`frontend/`)

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create the production bundle
npm run lint      # Run ESLint
npm run preview   # Preview a production build locally
```

### Backend (`backend/`)

```bash
npm run start:dev # Start NestJS in watch mode
npm run build     # Compile the backend
npm run lint      # Run Oxlint
npm test          # Run unit tests
npm run test:e2e  # Run end-to-end tests
```

When changing the Prisma schema, create and apply a migration during
development with `npx prisma migrate dev --name describe_change`. To apply
existing migrations in another environment, use `npx prisma migrate deploy`.

## API overview

The frontend calls the backend REST API. Workspace endpoints are authenticated
with the user's JWT; the API validates request DTOs and scopes financial records
to the signed-in user.

| Area | Routes |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `DELETE /auth/account` |
| Transactions | `GET /transaction`, `GET /transaction/:id`, `POST /transaction`, `PATCH /transaction/:id`, `DELETE /transaction/:id` |
| Budgets | `GET /budget`, `PATCH /budget` |
| Goals | `GET /goal`, `GET /goal/:id`, `POST /goal`, `PATCH /goal/:id`, `DELETE /goal/:id` |
| Journal | `GET /journal`, `POST /journal`, `PATCH /journal/:id` |
| Analytics | `GET /analytics/overview`, `GET /analytics/categories`, `GET /analytics/trends`, `GET /analytics/statistics`, `GET /analytics/needs-wants`, `GET /analytics/payment-methods`, `GET /analytics/merchants/top`, `GET /analytics/insights` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read-all`, `PATCH /notifications/:id/read` |
| User settings | `GET /users/me`, `PATCH /users/me/monthly-track-amount` |

Analytics routes accept a `month` query parameter in `YYYY-MM` format. The
monthly overview and insights are calculated from the authenticated user's
data.

## Project structure

```text
ExpenseLab/
├── README.md
├── docs/
│   └── screenshots/        # Captured website screenshots
├── backend/
│   ├── prisma/
│   │   ├── migrations/     # Versioned PostgreSQL schema changes
│   │   └── schema.prisma   # Database models and relationships
│   └── src/
│       ├── auth/           # Registration, login, and password reset
│       ├── transaction/    # Income and expense records
│       ├── budget/         # Category spending limits
│       ├── goal/           # Savings goals and contributions
│       ├── journal/        # Purchase reflections
│       ├── analytics/      # Overview and insight calculations
│       └── notification/   # Budget alerts
└── frontend/
    └── src/
        ├── components/     # Shared charts, forms, and workspace UI
        ├── lib/            # API client, types, formatting, and helpers
        ├── pages/          # Landing, auth, and workspace pages
        └── dashboard.tsx   # Signed-in workspace shell and navigation
```

## Data and privacy notes

- Financial records belong to the account that created them.
- Passwords are stored as bcrypt hashes; authentication uses JWTs.
- Keep database credentials, JWT secrets, and SMTP credentials out of source
  control.
- The public landing-page workspace graphic contains sample display figures.
  It does not represent a user's account data.
