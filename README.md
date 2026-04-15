# 🌍 Geography API

> **Live instance →** `http://35.194.53.58` &nbsp;·&nbsp; **Interactive docs →** `http://35.194.53.58/api`

![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-blue?logo=postgresql)
![GKE](https://img.shields.io/badge/GKE-us--central1-blue?logo=googlecloud)
![Cloud Build](https://img.shields.io/badge/CI%2FCD-Cloud%20Build-orange?logo=googlecloud)

A RESTful API built with **NestJS**, **TypeORM**, and **PostgreSQL** that models the physical and demographic structure of the world through a three-level hierarchy: **Continents → Countries → Cities**.

**v2** introduces versioned routes (`/api/v2/...`) and a **linked-list API chaining** endpoint (`POST /api/v2/chain`) that lets multiple independent microservices pass a payload through a chain — each enriching it with its own domain-specific data.

---

## 📑 Table of Contents

- [Live Instance](#-live-instance)
- [System Architecture](#-system-architecture)
  - [GCP Deployment Architecture](#gcp-deployment-architecture)
  - [CI/CD Pipeline](#cicd-pipeline)
- [Linked-List API Chain](#-linked-list-api-chain)
  - [Concept](#concept)
  - [Multi-service Flow](#multi-service-chain-flow)
  - [How meta evolves](#how-meta-evolves-through-the-chain)
  - [Request Format](#request-format)
  - [Integration for Peers](#integration-example-for-peers)
- [Domain Model](#-domain-model)
  - [ERD](#entity-relationship-diagram)
  - [Entities](#entities)
- [API Endpoints](#-api-endpoints)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [GCP Reference](#-gcp-reference)
- [Scripts](#-scripts)

---

## 🟢 Live Instance

| | |
|---|---|
| **Base URL** | `http://35.194.53.58` |
| **Swagger UI** | `http://35.194.53.58/api` |
| **Cloud** | GCP — GKE `us-central1` |
| **Replicas** | 3 × NestJS pods |
| **Database** | Cloud SQL PostgreSQL 13 |

```bash
# Quick smoke tests — no setup required
curl http://35.194.53.58/api/v2/continents
curl http://35.194.53.58/api/v2/countries
curl http://35.194.53.58/api/v2/cities
curl http://35.194.53.58/api/v2/chain          # GET saved terminal results
```

---

## 🏗 System Architecture

### GCP Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     GCP Project: geography-api-493315                    │
│                                                                          │
│  GitHub: cubito1080/devops                                               │
│  push to master ──────────────────────────────────────────────────────► │
│                                      │ Cloud Build Trigger               │
│                                      ▼                                   │
│  ┌────────────────────┐    ┌──────────────────────┐                      │
│  │  Artifact Registry │◄───│    Cloud Build        │                      │
│  │  geography-api     │    │    cloudbuild.yaml    │                      │
│  │  us-central1       │    │                       │                      │
│  │  [image:$SHA]      │    │  1. docker build      │                      │
│  └────────┬───────────┘    │  2. docker push       │                      │
│           │                │  3. sed IMAGE_URI     │                      │
│           │                │  4. kubectl apply k8s/│                      │
│           │                └───────────┬───────────┘                      │
│           │                            │                                  │
│           │                            ▼                                  │
│           │     ┌──────────────────────────────────────┐                  │
│           │     │  GKE Cluster: geography-cluster       │                  │
│           │     │  Region: us-central1  (3 nodes)       │                  │
│           │     │                                        │                 │
│           └────►│  Namespace: geography-api              │                 │
│                 │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │                 │
│                 │  │  Pod 1  │ │  Pod 2  │ │  Pod 3  │  │                 │
│                 │  │ :3000   │ │ :3000   │ │ :3000   │  │                 │
│                 │  └────┬────┘ └────┬────┘ └────┬────┘  │                 │
│                 │       └───────────┴────────────┘       │                 │
│                 │                LoadBalancer             │                 │
│                 │          35.194.53.58 : 80              │                 │
│                 └──────────────────┬─────────────────────┘                 │
│                                    │                                       │
│                 ┌──────────────────▼─────────────────────┐                 │
│                 │  Cloud SQL  (geography-db)               │                │
│                 │  PostgreSQL 13  ·  db-f1-micro           │                │
│                 │  IP: 34.10.221.217:5432                  │                │
│                 │  DB: geography_db   User: jero           │                │
│                 └─────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────────────────┘
                                  ▲
                        Internet / Browser / curl
                        http://35.194.53.58
```

### CI/CD Pipeline

Every `git push` to `master` triggers the full pipeline automatically — zero manual steps:

```
git push origin master
        │
        ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Cloud Build  (~3–5 min total)                                        │
│                                                                       │
│  Step 1 ── docker build -t ...artifact-registry.../img:$SHA .        │
│  Step 2 ── docker push  ...artifact-registry.../img:$SHA             │
│  Step 3 ── sed s|IMAGE_URI_PLACEHOLDER|...:$SHA| deployment.yaml     │
│  Step 4 ── gcloud get-credentials → kubectl apply -f k8s/            │
└──────────────────────────────────────────────┬────────────────────────┘
                                               │
                                               ▼
                       ┌────────────────────────────────────┐
                       │  GKE rolling update  — 3 replicas  │
                       │  ✅  Zero-downtime deployment       │
                       └────────────────────────────────────┘
```

---

## 🔗 Linked-List API Chain

### Concept

The `POST /api/v2/chain` endpoint implements a **linked-list traversal pattern** across independent microservices. Think of each API as a singly-linked list node:

```
┌──────────────────────────────────────────┐
│  API Node                                │
│                                          │
│  value  →  enriches payload with data   │
│  next   →  meta.siguiente  (URL)         │
└──────────────────────────────────────────┘
```

Each API node:
1. Receives the shared JSON payload
2. Reads `meta.siguiente` (the "next pointer")
3. Fetches its own domain data and **embeds** it under `payload.<domain>` (e.g. `payload.geografia`)
4. Updates `meta`: `antes = origen`, `origen = "api-geografia"`
5. If `siguiente ≠ null` → **HTTP POST** the enriched payload to that URL and return whatever comes back
6. If `siguiente = null` → **saves to DB** and returns the final accumulated payload to the original caller

---

### Multi-service Chain Flow

```
Client                Geography API            Peer API B            Peer API C
  │                   (this repo)                                  (siguiente=null)
  │  POST /api/v2/chain    │                        │                    │
  │ ──────────────────────►│                        │                    │
  │  {siguiente: API_B}    │                        │                    │
  │                        │  ① enriches with:     │                    │
  │                        │   payload.geografia    │                    │
  │                        │     continent          │                    │
  │                        │     country            │                    │
  │                        │     city               │                    │
  │                        │  ② POST to siguiente ─►│                    │
  │                        │                        │  ① enriches        │
  │                        │                        │  ② POST ──────────►│
  │                        │                        │                    │ siguiente=null
  │                        │                        │                    │ ① enriches
  │◄───────────────────────┼────────────────────────┼────────────────────│ ② RETURNS
  │   final accumulated JSON                                              │
```

---

### How `meta` evolves through the chain

```
Request from client      After Geography API       After Peer B (soporte)
────────────────────     ─────────────────────     ──────────────────────
meta: {                  meta: {                   meta: {
  antes:     null          antes:    "client"         antes:    "api-geografia"
  origen:    "client"      origen:   "api-geografia"  origen:   "api-soporte"
  siguiente: "API_B"       siguiente: "API_B"          siguiente: "API_C"
}                        }                          }
                         payload: {                 payload: {
                           geografia: {               geografia: { ... } ✓
                             continent: { ... }        soporte: {
                             country:   { ... }          solicitante: {}
                             city:      { ... }          ticket:      {}
                           }                             comentario:  {}
                         }                           ◄── }
                                                    }
```

---

### Request Format

```
POST http://35.194.53.58/api/v2/chain
Content-Type: application/json
```

```json
{
  "meta": {
    "antes":     null,
    "origen":    "my-api",
    "siguiente": "http://NEXT_PEER_IP/api/v2/chain"
  },
  "continent_id": 1,
  "country_id":   1,
  "city_id":      1
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `meta.antes` | `string \| null` | No | Previous node name — set automatically |
| `meta.origen` | `string` | Yes | The caller's name. Overwritten to `"api-geografia"` by this API |
| `meta.siguiente` | `string \| null` | No | URL to forward to. `null` = this is the last node |
| `continent_id` | `number` | No | Specific continent. Defaults to first in DB |
| `country_id` | `number` | No | Specific country. Defaults to first in DB |
| `city_id` | `number` | No | Specific city. Defaults to first in DB |

---

### Terminal Node Response (`siguiente = null`)

```json
{
  "meta": {
    "antes":     "my-api",
    "origen":    "api-geografia",
    "siguiente": null
  },
  "payload": {
    "geografia": {
      "continent": {
        "continent_id": 1,
        "name":         "Europe",
        "net_area":     10530000,
        "geology":      ["Precambrian shields", "Paleozoic fold belts", "Alpine orogeny"],
        "structure":    ["Baltic Shield", "East European Platform", "Hercynian massifs"],
        "change_ratio": 0.01,
        "population":   447000000
      },
      "country": {
        "country_id":       1,
        "name":             "France",
        "population":       68000000,
        "net_area":         551695,
        "political_system": ["Unitary semi-presidential republic"],
        "economical_index": { "gdp_trillion_usd": 2.78, "gini": 31.5 },
        "languages":        ["French"]
      },
      "city": {
        "city_id":          1,
        "city_name":        "Paris",
        "population":       2161000,
        "net_area":         105,
        "economical_index": { "gdp_billion_usd": 709.0 },
        "languages":        ["French"]
      }
    }
  }
}
```

---

### Integration Example (for peers)

**Group chain order: Geography (GCP) → Soporte (AWS) → Fútbol**

**Scenario A — Call us as the last node in your chain**

Your API forwards its enriched payload to us; we attach geo data under `payload.geografia` and return.

```bash
curl -X POST http://35.194.53.58/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "antes":     "your-previous-api",
      "origen":    "your-api-name",
      "siguiente": null
    },
    "payload": {}
  }'
```

**Scenario B — Start the full group chain here**

We enrich first (geo data), then POST to Soporte, which adds support data, then forwards to Fútbol.

```bash
curl -X POST http://35.194.53.58/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "antes":     null,
      "origen":    "client",
      "siguiente": "http://13.59.49.180:8000/api/v2/integracion/"
    },
    "continent_id": 1,
    "country_id":   1,
    "city_id":      1,
    "payload": {}
  }'
```

> **Windows PowerShell:** use `curl.exe` and write JSON to a file, then pass it with `-d @payload.json`.

---

## 🗃 Domain Model

### Entity Relationship Diagram

```mermaid
erDiagram
    CONTINENT {
        int     continent_id  PK
        string  name
        int     net_area
        jsonb   geology
        jsonb   structure
        float   change_ratio
        bigint  population
    }

    COUNTRY {
        int     country_id    PK
        int     continent_id  FK
        string  name
        bigint  population
        int     net_area
        jsonb   political_system
        jsonb   economical_index
        jsonb   languages
    }

    CITY {
        int    city_id          PK
        int    country_id       FK
        string city_name
        jsonb  economical_index
        jsonb  languages
        int    population
        int    net_area
    }

    CONTINENT ||--o{ COUNTRY : "has many"
    COUNTRY   ||--o{ CITY    : "has many"
```

### Hierarchy

```
Continent
│   name · net_area · geology[] · structure[] · change_ratio · population
│
└── Country  (continent_id FK)
│       name · population · net_area · political_system[] · economical_index{} · languages[]
│
    └── City  (country_id FK)
            city_name · population · net_area · economical_index{} · languages[]
```

### Entities

#### Continent

| Column | Type | Description |
|---|---|---|
| `continent_id` | `integer` PK | Auto-increment |
| `name` | `string` | e.g. `"Europe"` |
| `net_area` | `number` | Surface area (km²) |
| `geology` | `jsonb string[]` | Rock types, chemical composition, material age |
| `structure` | `jsonb string[]` | Tectonic organisation and plate connectivity |
| `change_ratio` | `float` | Fixed rate of change (area, geology, structure) |
| `population` | `bigint` | Current population |

#### Country

| Column | Type | Description |
|---|---|---|
| `country_id` | `integer` PK | Auto-increment |
| `continent_id` | `integer` FK | → `continent.continent_id` |
| `name` | `string` | e.g. `"France"` |
| `population` | `bigint` | Population count |
| `net_area` | `number` | Land area (km²) |
| `political_system` | `jsonb string[]` | Governance model |
| `economical_index` | `jsonb object` | e.g. `{ "gdp_trillion_usd": 2.78, "gini": 31.5 }` |
| `languages` | `jsonb string[]` | Official/spoken languages |

#### City

| Column | Type | Description |
|---|---|---|
| `city_id` | `integer` PK | Auto-increment |
| `country_id` | `integer` FK | → `country.country_id` |
| `city_name` | `string` | e.g. `"Paris"` |
| `population` | `number` | City population |
| `net_area` | `number` | City area (km²) |
| `economical_index` | `jsonb object` | e.g. `{ "gdp_billion_usd": 709 }` |
| `languages` | `jsonb string[]` | Languages spoken in the city |

---

## 📡 API Endpoints

**Production:** `http://35.194.53.58`
**Local:** `http://localhost:3000`
**Swagger UI:** `<base>/api`

---

### v1 — CRUD

#### `/continents`

| Method | Path | Description |
|---|---|---|
| `GET` | `/continents` | List all continents |
| `GET` | `/continents/:id` | Get one continent |
| `POST` | `/continents` | Create a continent |
| `PATCH` | `/continents/:id` | Partial update |
| `PUT` | `/continents/:id` | Full replace |
| `DELETE` | `/continents/:id` | Delete |

#### `/countries`

| Method | Path | Description |
|---|---|---|
| `GET` | `/countries` | List all countries |
| `GET` | `/countries/:id` | Get one country |
| `POST` | `/countries` | Create a country |
| `PATCH` | `/countries/:id` | Partial update |
| `PUT` | `/countries/:id` | Full replace |
| `DELETE` | `/countries/:id` | Delete |

#### `/cities`

| Method | Path | Description |
|---|---|---|
| `GET` | `/cities` | List all cities |
| `GET` | `/cities/:id` | Get one city |
| `POST` | `/cities` | Create a city |
| `PATCH` | `/cities/:id` | Partial update |
| `PUT` | `/cities/:id` | Full replace |
| `DELETE` | `/cities/:id` | Delete |

---

### v2 — CRUD

Same methods as v1, under `/api/v2/`:

| Resource | v2 Base Path |
|---|---|
| Continents | `/api/v2/continents` |
| Countries | `/api/v2/countries` |
| Cities | `/api/v2/cities` |

---

### v2 — Chain

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v2/chain` | Enrich payload with geo data under `payload.geografia` and forward to next node |
| `GET` | `/api/v2/chain` | List all saved terminal chain results (newest first) |
| `GET` | `/api/v2/chain/:id` | Get one saved chain result by id |

See [Linked-List API Chain](#-linked-list-api-chain) for full docs.

---

### Create Payload Examples

<details>
<summary><strong>POST /continents</strong></summary>

```json
{
  "name":         "Africa",
  "net_area":     30370000,
  "geology":      ["Precambrian cratons", "Rift valleys", "Volcanic belts"],
  "structure":    ["African Plate", "Nubian Plate", "East African Rift System"],
  "change_ratio": 0.005,
  "population":   1400000000
}
```
</details>

<details>
<summary><strong>POST /countries</strong></summary>

```json
{
  "continent_id":     1,
  "name":             "Portugal",
  "population":       10000000,
  "net_area":         92320,
  "political_system": ["Unitary semi-presidential republic"],
  "economical_index": { "gdp_billion_usd": 238, "gini": 33.5 },
  "languages":        ["Portuguese"]
}
```
</details>

<details>
<summary><strong>POST /cities</strong></summary>

```json
{
  "country_id":       1,
  "city_name":        "Lisbon",
  "population":       545000,
  "net_area":         85,
  "economical_index": { "gdp_billion_usd": 85 },
  "languages":        ["Portuguese"]
}
```
</details>

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (Node.js 20 / TypeScript 5) |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL 13 |
| Validation | class-validator + class-transformer |
| API Docs | Swagger / OpenAPI (`@nestjs/swagger`) |
| Containerisation | Docker + Docker Compose |
| Testing | Jest + Supertest |
| Linting | ESLint + typescript-eslint |
| Formatting | Prettier |
| CI/CD | GCP Cloud Build |
| Hosting | GKE (Google Kubernetes Engine) |
| Container Registry | GCP Artifact Registry |
| Database (prod) | GCP Cloud SQL |

---

## 📁 Project Structure

```
devops/
├── src/
│   ├── main.ts                        ← Bootstrap (port 3000, Swagger setup)
│   ├── app.module.ts                  ← Root module
│   ├── seed.ts                        ← DB seeder (run once)
│   │
│   ├── continent/
│   │   ├── continent.entity.ts
│   │   ├── continent.service.ts
│   │   ├── continent.controller.ts    ← v1  /continents
│   │   ├── continent.v2.controller.ts ← v2  /api/v2/continents
│   │   ├── continent.module.ts
│   │   └── dto/
│   │       ├── create-continent.dto.ts
│   │       └── update-continent.dto.ts
│   │
│   ├── country/               (same structure as continent/)
│   ├── city/                  (same structure as continent/)
│   │
│   └── chain/
│       ├── chain.controller.ts  ← POST /api/v2/chain
│       ├── chain.service.ts     ← enrichment + HTTP forward logic
│       └── chain.module.ts
│
├── k8s/
│   ├── namespace.yaml           ← geography-api namespace
│   ├── deployment.yaml          ← 3 replicas, reads DATABASE_URL from secret
│   ├── service.yaml             ← LoadBalancer port 80 → 3000
│   └── secret.example.yaml     ← reference for creating the K8s secret
│
├── cloudbuild.yaml              ← CI/CD pipeline (4 steps)
├── Dockerfile                   ← Multi-stage Node 20 build
├── docker-compose.yml           ← Local stack (app + postgres)
└── .env.example                 ← All env vars + full GCP infrastructure reference
```

---

## 🚀 Local Development

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | `node -v` |
| npm | ≥ 10 | bundled with Node 20 |
| Docker Desktop | any recent | Docker Compose v2 required |

---

### Option A — Docker (recommended for peers)

No Node.js setup required beyond the seed step.

```bash
# 1. Clone
git clone https://github.com/cubito1080/devops.git
cd devops

# 2. Start API + DB in Docker
docker compose up -d

# Wait ~15 seconds, then verify both containers are healthy
docker compose ps

# 3. Seed the database (first time only)
#    Linux / macOS:
DATABASE_URL=postgresql://jero:123@localhost:5433/geography_db npm run seed

#    Windows PowerShell:
$env:DATABASE_URL="postgresql://jero:123@localhost:5433/geography_db"; npm run seed

# 4. Test
curl http://localhost:3000/continents
curl http://localhost:3000/api/v2/continents

# 5. Tear down
docker compose down      # stop (keeps data)
docker compose down -v   # stop + delete all data
```

---

### Option B — Local App + Docker DB

```bash
# 1. Install dependencies
npm install

# 2. Start only Postgres
docker compose up -d postgres

# 3. Create .env (uncomment the LOCAL line)
cp .env.example .env
# DATABASE_URL=postgresql://jero:123@localhost:5433/geography_db

# 4. Seed (first time only)
npm run seed

# 5. Start with hot-reload
npm run start:dev
# API:    http://localhost:3000
# Swagger: http://localhost:3000/api
```

---

### Local DB Credentials

| | |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `geography_db` |
| User | `jero` |
| Password | `123` |

```bash
# psql locally
psql -h localhost -p 5433 -U jero -d geography_db

# psql via Docker
docker exec -it devops-postgres-1 psql -U jero -d geography_db
```

---

### Chain Smoke Tests

```bash
# Terminal node — saves to DB and returns enriched payload
curl -X POST http://localhost:3000/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{"meta":{"antes":null,"origen":"test","siguiente":null},"payload":{}}'

# With specific IDs
curl -X POST http://localhost:3000/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{"meta":{"antes":null,"origen":"test","siguiente":null},"continent_id":2,"country_id":5,"city_id":5,"payload":{}}'

# Forward to Soporte API (group chain)
curl -X POST http://localhost:3000/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{"meta":{"antes":null,"origen":"client","siguiente":"http://13.59.49.180:8000/api/v2/integracion/"},"continent_id":1,"country_id":1,"city_id":1,"payload":{}}'

# View saved terminal results
curl http://localhost:3000/api/v2/chain

# View one result by id
curl http://localhost:3000/api/v2/chain/1
```

---

## ☁️ GCP Reference

### Live Infrastructure

| Resource | Value |
|---|---|
| **Project ID** | `geography-api-493315` |
| **Project Number** | `492692263761` |
| **Region** | `us-central1` |
| **GKE Cluster** | `geography-cluster` — 3 nodes, e2-medium |
| **Service IP** | `35.194.53.58:80` |
| **K8s Namespace** | `geography-api` |
| **K8s Secret** | `geography-api-secret` (key: `DATABASE_URL`) |
| **Artifact Registry** | `us-central1-docker.pkg.dev/geography-api-493315/geography-api` |
| **Cloud SQL Instance** | `geography-db` — PostgreSQL 13, db-f1-micro |
| **Cloud SQL IP** | `34.10.221.217:5432` |
| **Cloud Build SA** | `492692263761@cloudbuild.gserviceaccount.com` |
| **GitHub Trigger** | push to `^master$` → `cloudbuild.yaml` |

---

### Trigger a Redeploy

```bash
git commit --allow-empty -m ':rocket: chore: redeploy'
git push origin master
```

---

### Recreate from Scratch (disaster recovery)

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project geography-api-493315

# 2. Connect kubectl
gcloud container clusters get-credentials geography-cluster \
  --region=us-central1 --project=geography-api-493315

# 3. Recreate namespace + secret
kubectl create namespace geography-api
kubectl create secret generic geography-api-secret \
  --namespace=geography-api \
  --from-literal=DATABASE_URL='postgresql://jero:Geo1234!@34.10.221.217:5432/geography_db'

# 4. Trigger deploy
git commit --allow-empty -m ':rocket: chore: redeploy'
git push origin master
```

---

### Seed Cloud SQL

```bash
cp .env .env.backup
printf 'DATABASE_URL=postgresql://jero:Geo1234!@34.10.221.217:5432/geography_db\nNODE_ENV=production\nPORT=3000\n' > .env
npm run seed
cp .env.backup .env
```

---

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Start compiled app |
| `npm run start:dev` | Watch mode with hot-reload |
| `npm run start:prod` | Start production build from `dist/` |
| `npm run seed` | Seed the database with sample geographic data |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier format all source files |
| `npm run test` | Run unit tests (Jest) |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Generate coverage report |

