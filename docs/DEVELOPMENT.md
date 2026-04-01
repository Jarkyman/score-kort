# Development Guide

A lightweight public site that shows up-to-date scorecard data for Danish golf clubs. Built with React, Cloudflare Pages, and D1.

## Prerequisites

- Node.js (v18+)
- npm

## Getting Started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Setup Local Database (D1):**

    Initialize the local D1 database schema and seed it with data.

    ```bash
    # Apply schema
    npx wrangler d1 execute score-kort-db --local --file=db/scorekort_schema.sql

    # Seed data
    npx wrangler d1 execute score-kort-db --local --file=db/scorekort_seed.sql
    ```

3.  **Run Development Server:**

    Start the Vite development server with Cloudflare Pages/D1 binding support.

    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:8788` (Wrangler proxy with D1 bindings).
    Vite HMR runs on `http://localhost:5173`.

## Project Structure

-   `src/`: React frontend code.
-   `functions/`: Cloudflare Pages Functions (API).
-   `db/`: Database schema and seed files.
-   `public/`: Static assets.

## Deployment

This project is designed to be deployed to Cloudflare Pages.

1.  Create a Cloudflare Pages project.
2.  Create a D1 database in the Cloudflare dashboard.
3.  Update `wrangler.toml` with the correct `database_id`.
4.  Deploy using Wrangler or connect your Git repository to Cloudflare Pages.

## Database Management

There is no public API for modifying data. All changes are made directly via Wrangler CLI or the Cloudflare Dashboard.

### Quick Fix (single record)

Run SQL directly against the remote database:

```bash
npx wrangler d1 execute score-kort-db --remote --command "UPDATE tees SET tee_name = 'Gul' WHERE tee_id = 123"
```

### Run a SQL file

```bash
npx wrangler d1 execute score-kort-db --remote --file=db/my_fix.sql
```

### Full Re-seed

If you make larger changes to the CSV source files:

1.  Update files in `csv-files/`.
2.  Regenerate `db/scorekort_seed.sql`.
3.  Apply to remote:

    ```bash
    npx wrangler d1 execute score-kort-db --remote --file=db/scorekort_schema.sql
    npx wrangler d1 execute score-kort-db --remote --file=db/scorekort_seed.sql
    ```

### Cloudflare Dashboard

You can also run queries directly at [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → D1** → select your database.

> **Tip:** Use `--local` instead of `--remote` to test changes on your local database first.
