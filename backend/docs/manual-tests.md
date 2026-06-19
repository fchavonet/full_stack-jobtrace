# JobTrace - Backend: manual validation

This document lists the manual validation steps for the JobTrace backend API.
<br>
The goal is to verify the main user flows before considering the backend stable.

## Environment

The backend can be tested in development with:

- Node.js
- Express
- PostgreSQL
- Prisma 6
- Docker Compose

To display the JSON response from a `curl` command in a readable format, it is recommended to use `jq`.

Install `jq` if it is not already available:

```bash
apt install jq -y
```

Then add ` | jq` at the end of any `curl` command that returns JSON.
<br>
This will format the JSON response and make it easier to read in the terminal.

## Prerequisites

From the project root, PostgreSQL must be running.

If Docker is managed from the host machine:

```bash
docker compose up -d database
```

From the backend directory, the API can be started with:

```bash
npm run dev
```

The API should start on port `4000`.

## 1. Health checks

### GET `/api/health`

**Goal:**

Verify that the API server is running.

**Command to run:**

```bash
curl -s http://localhost:4000/api/health | jq
```

**Expected result:**

```json
{
  "success": true,
  "message": "API is running.",
  "data": {
    "status": "ok"
  }
}
```

**Status:**

Validated:

### GET `/api/health/db`

**Goal:**

Verify that the API can connect to the PostgreSQL database through Prisma.

**Command to run:**

```bash
curl -s http://localhost:4000/api/health/db | jq
```

**Expected result:**

```json
{
  "success": true,
  "message": "Database connection is working.",
  "data": {
    "status": "ok"
  }
}
```

**Status:**

Validated:

## 2. Error handling

### Unknown route

**Goal:**

Verify that an unknown route returns a clean and consistent API error response.

**Command to run:**

```bash
curl -s http://localhost:4000/api/unknown | jq
```

**Expected result:**

```json
{
  "success": false,
  "message": "Route not found.",
  "errors": []
}
```

**Status:**

Validated:

## 3. Prisma checks

### Migration status

**Goal:**

Verify that the database schema is synchronized with the Prisma migration history.

**Command to run:**

From the backend directory:

```bash
npm run prisma:status
```

**Expected result:**

The database schema should be up to date with the local migrations.

Example:

```text
Database schema is up to date!
```

**Status:**

Validated:

---

### Prisma Client generation

**Goal:**

Verify that Prisma Client can be generated successfully from the current schema.

**Command to run:**

From the backend directory:

```bash
npm run prisma:generate
```

**Expected result:**

```text
Generated Prisma Client
```

**Status:**

Validated:

## 4. Current backend validation summary

The following backend foundation features have been manually validated:

- API startup.
- `GET /api/health`.
- `GET /api/health/db`.
- Unknown route handling.
- PostgreSQL connection.
- Prisma migration status.
- Prisma Client generation.
