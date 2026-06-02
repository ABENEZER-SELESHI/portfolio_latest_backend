# Portfolio Backend API

Express + TypeScript + PostgreSQL + Prisma REST API for the Abenezer Seleshi portfolio CMS.

## Quick Start

```bash
# From project root
docker compose up -d postgres

cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API: `http://localhost:5000/api/v1`

Default admin: `admin@portfolio.local` / `ChangeMe123!`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run tests |
| `npm run prisma:migrate` | Apply migrations |

## Documentation

- [API Reference](../docs/API.md)
- [Database](../docs/DATABASE.md)
- [Architecture](../docs/ARCHITECTURE.md)
