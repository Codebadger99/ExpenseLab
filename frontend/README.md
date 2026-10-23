# ExpenseLab Frontend

The frontend is a responsive React single-page application built with
TypeScript, Vite, and React Router. It contains the public landing page,
account flows, onboarding, and the signed-in workspace.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Set the API URL in a local `.env` file:

```dotenv
VITE_API_URL="http://localhost:3000"
```

For deployment, configure `VITE_API_URL` in the frontend hosting environment
to point to the public backend URL. Vite embeds this value when it builds the
app, so changing it requires a new frontend deployment.

## Checks

```bash
npm run lint
npm run build
```

## Where to look

- `src/App.tsx` defines routes and the signed-in session.
- `src/dashboard.tsx` provides the shared workspace shell and navigation.
- `src/pages/` contains the page-level screens.
- `src/components/` contains shared application components.
- `src/lib/` contains API access, types, and shared data helpers.
- `src/App.css` contains the application styles.
- `public/favicon.svg` is the browser-tab icon.
