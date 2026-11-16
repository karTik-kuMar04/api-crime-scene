# API Crime Scene

A privacy-first browser network forensics tool. This repository is the initial monorepo foundation.

## Stack

- `apps/web`: Next.js App Router + TypeScript + Tailwind CSS
- `apps/api`: Fastify + TypeScript
- PostgreSQL 16 (provisioned by Docker Compose; not yet wired into application code)
- Docker / Docker Compose
- GitHub Actions CI

## Requirements

- Node.js 22+
- npm 10+
- Docker Desktop (for container workflow)

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health
- Versioned backend health: http://localhost:4000/api/v1/health

The first `npm install` creates `package-lock.json`. Commit that file so installs can be made reproducible.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/health
- PostgreSQL: localhost:5432

Stop services:

```bash
docker compose down
```

Remove the local database volume too (destructive):

```bash
docker compose down -v
```

## CI

GitHub Actions runs type-checking and production builds for both workspaces on pushes and pull requests to `main`.

After generating and committing `package-lock.json`, change the workflow's `npm install` to `npm ci` for lockfile-enforced CI.

## Current scope

This foundation intentionally contains only:
- A working Next.js application shell
- A Fastify API with health endpoints
- PostgreSQL container infrastructure for later use
- Dockerfiles and Compose orchestration
- GitHub Actions CI

HAR parsing, analysis, visualizations, persistence and authentication have not been implemented yet.
