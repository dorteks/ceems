Backend setup and API endpoints

Quick start (local development):

1. Copy the example env and set your database connection:

```bash
cp .env.example .env
# edit .env and set DATABASE_URL
```

2. Install dependencies (pnpm/npm/yarn):

```bash
pnpm install
```

3. Generate Prisma client and create the database migration (or use `prisma db push`):

```bash
npx prisma generate
# Optionally create a migration if you want migrations stored
npx prisma migrate dev --name init
```

4. Run the dev server:

```bash
pnpm dev
```

API endpoints added:

- `GET /api/customers?page=1&size=50` — list customers (server-side pagination)
- `POST /api/customers` — create a customer (JSON body)

Notes:

- The Prisma schema with several enums and a `Customer` model was added under `prisma/schema.prisma`.
- Adjust the schema to match your final ERD before running migrations.
