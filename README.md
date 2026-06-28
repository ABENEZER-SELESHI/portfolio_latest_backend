# Portfolio Backend API

Express + TypeScript + PostgreSQL + Prisma REST API for the Abenezer Seleshi portfolio CMS.

## Quick Start

### 1. Start PostgreSQL

Your system has Docker but **not** the Compose plugin (`docker compose` will fail). Use one of these:

**Option A — project script (recommended)**

```bash
# From project root
chmod +x scripts/start-postgres.sh
./scripts/start-postgres.sh
```

**Option B — single Docker command**

```bash
docker run -d --name portfolio_postgres \
  -e POSTGRES_USER=portfolio \
  -e POSTGRES_PASSWORD=portfolio_secret \
  -e POSTGRES_DB=portfolio_db \
  -p 5433:5432 \
  postgres:16-alpine
```

Port **5433** is used because PostgreSQL may already be running on **5432** on your machine.

**Option C — Docker Compose** (only if installed)

```bash
sudo apt install docker-compose-v2   # or docker-compose-plugin
docker compose up -d postgres
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Ensure DATABASE_URL uses port 5433 (see .env.example)

npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API: `http://localhost:5000/api/v1`

Default admin: `admin@portfolio.local` / `ChangeMe123!`

## Contact email (Brevo)

1. In [Brevo](https://app.brevo.com), verify your sender email under **Senders & IP**.
2. Create an **API key** under **SMTP & API → API keys** (`xkeysib-…`). This is **not** the SMTP key (`xsmtpsib-…`).
3. Set values in `backend/.env` (see `.env.example`):

```env
BREVO_API_KEY=your-xkeysib-api-key
EMAIL_TRANSPORT=brevo-api
SMTP_FROM=ebenezerseleshi@gmail.com
CONTACT_RECIPIENT=ebenezerseleshi@gmail.com
```

4. Test: `npm run test:email`
5. Restart the backend: `npm run dev`

`SMTP_FROM` must be a **verified sender** in Brevo.

For SMTP relay instead of the API, set `EMAIL_TRANSPORT=smtp` and add `SMTP_SERVER`, `SMTP_USERNAME`, `SMTP_PASSWORD`.

### How contact delivery works

| Field | Value |
|-------|--------|
| **To** | `CONTACT_RECIPIENT` (`ebenezerseleshi@gmail.com`) — you receive the message |
| **From (display)** | Visitor's name (sent through your verified Brevo address) |
| **Reply-To** | Email address from the contact form — use **Reply** in Gmail to answer them |

Brevo cannot send mail *from* random addresses (e.g. `visitor@gmail.com`) without verifying them. **Reply-To** is the standard way to reply directly to the person who filled out the form.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `unknown shorthand flag: 'd' in -d` | Compose plugin missing — use `./scripts/start-postgres.sh` instead |
| `Can't reach database server at localhost:5433` | Run `./scripts/start-postgres.sh` or `docker start portfolio_postgres` |
| `P1000: Authentication failed` on 5432 | Wrong port — use **5433** in `DATABASE_URL`, not 5432 |
| `Key not found` / 401 from Brevo | Use **API key** (`xkeysib-…`) as `BREVO_API_KEY`, not the SMTP key (`xsmtpsib-…`) |
| Logs say delivered, inbox empty (SMTP) | Switch to `brevo-api` + `BREVO_API_KEY`, run `npm run test:email`, check Brevo **Transactional → Logs** and Gmail spam |

Check DB container: `docker ps` — look for `portfolio_postgres` on `0.0.0.0:5433->5432/tcp`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run tests |
| `npm run prisma:migrate` | Apply migrations |
| `npm run test:email` | Send a test contact email via Brevo |

## Documentation

- [API Reference](../docs/API.md)
- [Database](../docs/DATABASE.md)
- [Architecture](../docs/ARCHITECTURE.md)
