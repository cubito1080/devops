# 🌍 Geography API

A RESTful API built with **NestJS**, **TypeORM**, and **PostgreSQL** for managing geographical data across three domain layers: **Continents**, **Countries**, and **Cities**.

Version **v2** introduces versioned routes (`/api/v2/...`) and a **API Chaining** endpoint (`POST /api/v2/chain`) that enables linked-list style payload enrichment across multiple microservices.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Domain Model](#domain-model)
  - [Continent](#continent)
  - [Country](#country)
  - [City](#city)
- [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
  - [CreateContinentDto](#createcontinentdto)
  - [CreateCityDto](#createcitydto)
- [API Endpoints](#api-endpoints)
  - [v1 — Continents](#continents-controller)
  - [v1 — Countries](#countries-controller)
  - [v1 — Cities](#cities-controller)
  - [v2 — Continents](#continents-v2)
  - [v2 — Countries](#countries-v2)
  - [v2 — Cities](#cities-v2)
  - [v2 — Chain](#chain-v2)
- [Chain Payload Format](#chain-payload-format)
- [Database](#database)
- [GCP Deployment (GKE)](#gcp-deployment-gke)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Start the Database](#start-the-database)
  - [Run the Application](#run-the-application)
- [Linting & Formatting](#linting--formatting)
- [Scripts Reference](#scripts-reference)

---

## Overview

The Geography API models the physical and demographic structure of the world through a three-level hierarchy:

```
Continent
  └── Country  (many-to-one → Continent)
        └── City  (many-to-one → Country)
```

Each layer stores rich domain-specific data such as geological composition, economic indicators, political systems, and demographic statistics.

---

## Architecture

### Multicloud API Chain

The v2 `chain` endpoint implements a **linked-list style API chaining** pattern. Each service in the chain enriches the shared payload with its own domain data and forwards it to the next service.

```mermaid
flowchart LR
    Client -->|POST /api/v2/chain| GeoAPI

    subgraph GCP_own["☁️ GCP — GKE Cluster (us-central1)"]
        subgraph K8s["Kubernetes (GKE)"]
            GeoAPI["🌍 Geography API\n(NestJS)\n/api/v2/chain"]
        end
        ArtifactReg["🐳 Artifact Registry\nContainer Registry"]
        CloudBuild["🔨 Cloud Build\ncloudbuild.yaml"]
        CloudSQL["🗄️ Cloud SQL\nPostgreSQL"]
        CloudBuild --> ArtifactReg --> K8s
        K8s --> CloudSQL
    end

    subgraph Azure["☁️ Azure"]
        SupportAPI["🛠️ Support API\n/api/v2/chain"]
    end

    subgraph GCP_other["☁️ Google Cloud (peer)"]
        SportsAPI["⚽ Sports API\n/api/v2/chain"]
    end

    GeoAPI -->|meta.siguiente| SupportAPI
    SupportAPI -->|meta.siguiente| SportsAPI
    SportsAPI -->|meta.siguiente = null — final response| Client
```

### Chain Flow

1. **Client** sends `POST /api/v2/chain` with an optional `meta.siguiente` URL
2. **Geography API** (this repo) fetches continent + country + city from the DB and embeds them in the payload
3. Updates `meta`: `antes = meta.origen`, `origen = "api-geografia"`, `siguiente` unchanged
4. If `meta.siguiente` is set → **forwards** the enriched payload via HTTP POST to that URL
5. The next API repeats the same pattern, accumulating data
6. When `meta.siguiente = null` the final API returns the complete chained payload to the original caller

### GCP Deployment Overview

| Component | GCP Service |
|---|---|
| Container Registry | Artifact Registry |
| Kubernetes cluster | GKE — Google Kubernetes Engine (3 replicas) |
| CI/CD pipeline | Cloud Build (`cloudbuild.yaml`) |
| Database | Cloud SQL for PostgreSQL |
| Public access | GKE `LoadBalancer` Service — GKE provisions a public IP automatically |

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Framework        | NestJS 11 (Node.js / TypeScript)    |
| ORM              | TypeORM 0.3                         |
| Database         | PostgreSQL 13                       |
| Validation       | class-validator + class-transformer |
| Containerisation | Docker Compose                      |
| Testing          | Jest + Supertest                    |
| Linting          | ESLint + typescript-eslint          |
| Formatting       | Prettier                            |

---

## Project Structure

```
src/
├── app.module.ts            # Root module — wires all feature modules
├── main.ts                  # Bootstrap entry point (port 3000)
│
├── continent/
│   ├── continent.entity.ts  # TypeORM entity
│   ├── continent.service.ts # Business logic / repository access
│   ├── continent.controller.ts
│   ├── continent.module.ts
│   └── dto/
│       ├── create-continent.dto.ts
│       └── update-contient.dto.ts
│
├── country/
│   ├── country.entity.ts
│   ├── country.service.ts
│   ├── country.controller.ts
│   ├── country.module.ts
│   └── dto/
│       ├── create-continent.dto.ts
│       └── update-continent.dto.ts
│
└── city/
    ├── city.entity.ts
    ├── city.service.ts
    ├── city.controller.ts
    ├── city.module.ts
    └── dto/
        ├── create-city.dto.ts
        └── update-city.dto.ts

test/
└── app.e2e-spec.ts          # End-to-end tests
```

---

## Entity Relationship Diagram

```mermaid
erDiagram
    CONTINENT {
        int continent_id PK
        string name
        int net_area
        jsonb geology
        jsonb structure
        float change_ratio
        int population
    }

    COUNTRY {
        int country_id PK
        int continent_id FK
        string name
        bigint population
        int net_area
        jsonb political_system
        jsonb economical_index
        jsonb languages
    }

    CITY {
        int city_id PK
        int country_id FK
        string city_name
        jsonb economical_index
        jsonb languages
        int population
        int net_area
    }

    CONTINENT ||--o{ COUNTRY : "has"
    COUNTRY ||--o{ CITY : "has"
```

---

## Domain Model

### Continent

Represents a major landmass. Stores geological and structural metadata.

| Column         | Type      | Description                                                                              |
|----------------|-----------|------------------------------------------------------------------------------------------|
| `continent_id` | `integer` | Auto-incremented primary key                                                             |
| `name`         | `string`  | Continent name (e.g. `"Africa"`)                                                         |
| `net_area`     | `number`  | Total surface area (km²)                                                                 |
| `geology`      | `jsonb`   | Array of strings describing chemical composition, rock types, and material age           |
| `structure`    | `jsonb`   | Array of strings describing tectonic organisation and plate connectivity                 |
| `change_ratio` | `number`  | Fixed rate at which the continent changes in area, geology, and structure                |
| `population`   | `number`  | Current population count                                                                 |

---

### Country

Represents a sovereign nation. Belongs to a **Continent** via `ManyToOne`.

| Column             | Type      | Description                                                    |
|--------------------|-----------|----------------------------------------------------------------|
| `country_id`       | `integer` | Auto-incremented primary key                                   |
| `continent_id`     | `integer` | Foreign key → `Continent.continent_id`                         |
| `name`             | `string`  | Country name                                                   |
| `population`       | `bigint`  | Population count                                               |
| `net_area`         | `number`  | Total land area (km²)                                          |
| `political_system` | `jsonb`   | Array of strings describing governance model and institutions  |
| `economical_index` | `jsonb`   | Key-value map of economic indicators (e.g. `{ "gdp": 21430 }`) |
| `languages`        | `jsonb`   | Array of official/spoken languages                             |

---

### City

Represents a municipality. Belongs to a **Country** via `ManyToOne`.

| Column             | Type      | Description                                                  |
|--------------------|-----------|--------------------------------------------------------------|
| `city_id`          | `integer` | Auto-incremented primary key                                 |
| `country_id`       | `integer` | Foreign key → `Country.country_id`                           |
| `city_name`        | `string`  | City name                                                    |
| `economical_index` | `jsonb`   | Key-value map of economic indicators                         |
| `languages`        | `jsonb`   | Array of languages spoken in the city                        |
| `population`       | `number`  | City population count                                        |
| `net_area`         | `number`  | City area (km²)                                              |

---

## Data Transfer Objects (DTOs)

All DTOs use `class-validator` decorators. Validation is enforced via NestJS `ValidationPipe`.

### CreateContinentDto

```typescript
{
  name: string;          // @IsString
  net_area: number;      // @IsNumber
  geology: string[];     // @IsArray + @IsString each
  structure: string[];   // @IsArray + @IsString each
  change_ratio: number;  // @IsNumber
  population: number;    // @IsNumber
}
```

### CreateCityDto

```typescript
{
  country_id: number;                   // @IsNumber
  city_name: string;                    // @IsString
  economical_index: Record<string, number>; // @IsObject
  languages: string[];                  // @IsArray + @IsString each
  population: number;                   // @IsNumber
  net_area: number;                     // @IsNumber
}
```

> `Update*` DTOs extend the corresponding `Create*` DTO with all fields made optional via `PartialType`.

---

## API Endpoints

The server listens on **port 3000** by default.

### Continents Controller

Base path: `/continents`

| Method   | Path               | Description                     |
|----------|--------------------|---------------------------------|
| `GET`    | `/continents`      | Return all continents           |
| `GET`    | `/continents/:id`  | Return a single continent by ID |
| `POST`   | `/continents`      | Create a new continent          |
| `PUT`    | `/continents/:id`  | Replace a continent by ID       |
| `DELETE` | `/continents/:id`  | Delete a continent by ID        |

---

### Countries Controller

Base path: `/countries`

| Method   | Path               | Description                    |
|----------|--------------------|--------------------------------|
| `GET`    | `/countries`       | Return all countries           |
| `GET`    | `/countries/:id`   | Return a single country by ID  |
| `POST`   | `/countries`       | Create a new country           |
| `PUT`    | `/countries/:id`   | Replace a country by ID        |
| `DELETE` | `/countries/:id`   | Delete a country by ID         |

---

### Cities Controller

Base path: `/cities`

| Method   | Path           | Description                 |
|----------|----------------|-----------------------------|
| `GET`    | `/cities`      | Return all cities           |
| `GET`    | `/cities/:id`  | Return a single city by ID  |
| `POST`   | `/cities`      | Create a new city           |
| `PUT`    | `/cities/:id`  | Replace a city by ID        |
| `DELETE` | `/cities/:id`  | Delete a city by ID         |

---

### Continents v2

Base path: `/api/v2/continents`

| Method   | Path                       | Description                         |
|----------|----------------------------|-------------------------------------|
| `GET`    | `/api/v2/continents`       | Return all continents               |
| `GET`    | `/api/v2/continents/:id`   | Return a single continent by ID     |
| `POST`   | `/api/v2/continents`       | Create a new continent              |
| `PATCH`  | `/api/v2/continents/:id`   | Partial update of a continent       |
| `PUT`    | `/api/v2/continents/:id`   | Replace a continent by ID           |
| `DELETE` | `/api/v2/continents/:id`   | Delete a continent by ID            |

---

### Countries v2

Base path: `/api/v2/countries`

| Method   | Path                      | Description                       |
|----------|---------------------------|-----------------------------------|
| `GET`    | `/api/v2/countries`       | Return all countries              |
| `GET`    | `/api/v2/countries/:id`   | Return a single country by ID     |
| `POST`   | `/api/v2/countries`       | Create a new country              |
| `PATCH`  | `/api/v2/countries/:id`   | Partial update of a country       |
| `PUT`    | `/api/v2/countries/:id`   | Replace a country by ID           |
| `DELETE` | `/api/v2/countries/:id`   | Delete a country by ID            |

---

### Cities v2

Base path: `/api/v2/cities`

| Method   | Path                   | Description                   |
|----------|------------------------|-------------------------------|
| `GET`    | `/api/v2/cities`       | Return all cities             |
| `GET`    | `/api/v2/cities/:id`   | Return a single city by ID    |
| `POST`   | `/api/v2/cities`       | Create a new city             |
| `PATCH`  | `/api/v2/cities/:id`   | Partial update of a city      |
| `PUT`    | `/api/v2/cities/:id`   | Replace a city by ID          |
| `DELETE` | `/api/v2/cities/:id`   | Delete a city by ID           |

---

### Chain v2

| Method | Path              | Description                                                   |
|--------|-------------------|---------------------------------------------------------------|
| `POST` | `/api/v2/chain`   | Enrich payload with geo data and forward to next API in chain |

---

## Chain Payload Format

### Request body

```json
{
  "meta": {
    "antes": null,
    "origen": "client",
    "siguiente": "https://support-api.example.com/api/v2/chain"
  },
  "continent_id": 1,
  "country_id": 1,
  "city_id": 1
}
```

| Field | Type | Description |
|---|---|---|
| `meta.antes` | `string \| null` | Name/URL of the previous API (set automatically) |
| `meta.origen` | `string` | Name of the current API origin |
| `meta.siguiente` | `string \| null` | URL to forward to, or `null` to end the chain |
| `continent_id` | `number` (optional) | Pick a specific continent; falls back to first in DB |
| `country_id` | `number` (optional) | Pick a specific country; falls back to first in DB |
| `city_id` | `number` (optional) | Pick a specific city; falls back to first in DB |

### Response (when `siguiente = null`)

The enriched payload is returned directly:

```json
{
  "meta": {
    "antes": "client",
    "origen": "api-geografia",
    "siguiente": null
  },
  "continent": { ... },
  "country": { ... },
  "city": { ... }
}
```

When `meta.siguiente` is set, this API POSTs the enriched payload to that URL and returns whatever the downstream API ultimately responds with.

---

## GCP Deployment (GKE)

The application is deployed to **Google Kubernetes Engine (GKE)** via **Cloud Build**.

> **New to GCP?** Think of it this way:
> - **Google Cloud Project** = your billing/resource container (like an AWS account)
> - **Artifact Registry** = where Docker images are stored (like ECR)
> - **GKE** = managed Kubernetes cluster (like EKS)
> - **Cloud Build** = runs your pipeline when you push code (like CodePipeline + CodeBuild merged into one)
> - **Cloud SQL** = managed PostgreSQL database (like RDS)

### Pipeline Flow

```
GitHub repo push
  → Cloud Build trigger fires (cloudbuild.yaml)
      ├── docker build + docker push → Artifact Registry
      └── kubectl apply k8s/ → GKE cluster
```

### Step-by-step GCP Setup (one time only)

#### 1. Create a GCP Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top bar) → **New Project**
3. Give it a name (e.g. `geography-api`) and note the **Project ID** — you'll use this everywhere
4. Enable billing on the project

#### 2. Enable required APIs
In the GCP console, navigate to **APIs & Services → Library** and enable:
- **Artifact Registry API**
- **Kubernetes Engine API**
- **Cloud Build API**
- **Cloud SQL Admin API** (if using Cloud SQL)

Or enable all at once with the CLI:
```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  container.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com
```

#### 3. Create the Artifact Registry repository
This is where your Docker images will be stored.
```bash
gcloud artifacts repositories create geography-api \
  --repository-format=docker \
  --location=us-central1 \
  --description="Geography API images"
```

The image URI will be:
`us-central1-docker.pkg.dev/YOUR_PROJECT_ID/geography-api/geography-api`

#### 4. Create the GKE cluster
```bash
gcloud container clusters create geography-cluster \
  --region=us-central1 \
  --num-nodes=1 \
  --machine-type=e2-medium
```

> `--num-nodes=1` creates 1 node **per zone** in the region (3 zones = 3 nodes total). The Deployment requests 3 replicas which will spread across them.

#### 5. Grant Cloud Build permission to deploy to GKE
Cloud Build runs as a service account. You need to give it permission to push images and deploy to the cluster.

```bash
# Find your Cloud Build service account email:
# It looks like: PROJECT_NUMBER@cloudbuild.gserviceaccount.com
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')

# Grant Kubernetes Developer role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/container.developer"

# Grant Artifact Registry Writer role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

#### 6. Create the database secret in the cluster
Before the first deploy, create the Kubernetes secret that holds the database connection string.

```bash
# First, point kubectl at your GKE cluster:
gcloud container clusters get-credentials geography-cluster \
  --region=us-central1 \
  --project=YOUR_PROJECT_ID

# Create the namespace first:
kubectl apply -f k8s/namespace.yaml

# Create the secret:
kubectl create secret generic geography-api-secret \
  --namespace=geography-api \
  --from-literal=DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/geography_db'
```

For **Cloud SQL**, the connection string uses the Cloud SQL Auth Proxy socket format:
```
postgresql://USER:PASSWORD@/geography_db?host=/cloudsql/PROJECT_ID:us-central1:INSTANCE_NAME
```

#### 7. Connect Cloud Build to your GitHub repo
1. In GCP Console → **Cloud Build → Triggers**
2. Click **Connect Repository** → choose GitHub → authenticate → select this repo
3. Click **Create Trigger** with these settings:
   - **Event**: Push to a branch
   - **Branch**: `^main$` (or `^master$`)
   - **Build configuration**: `cloudbuild.yaml`
4. Under **Substitution variables**, add:

| Variable | Value |
|---|---|
| `_REGION` | `us-central1` |
| `_REPO_NAME` | `geography-api` |
| `_GKE_CLUSTER` | `geography-cluster` |
| `_GKE_REGION` | `us-central1` |

From this point on, every push to the branch triggers a full build + deploy automatically.

### Manual Deploy (kubectl only, no Cloud Build)

If you want to deploy manually without the pipeline:

```bash
# 1. Point kubectl at the cluster (run once per machine)
gcloud container clusters get-credentials geography-cluster \
  --region=us-central1 \
  --project=YOUR_PROJECT_ID

# 2. Build and push the image yourself
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/geography-api/geography-api:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/geography-api/geography-api:latest

# 3. Apply manifests (no Ingress needed)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml -n geography-api
kubectl apply -f k8s/service.yaml -n geography-api

# 4. Check that everything is running
kubectl get pods -n geography-api
kubectl get service geography-api -n geography-api   # shows the public IP
```

### Get the public URL after deploy

```bash
# The EXTERNAL-IP column shows the load balancer IP (may take 1-2 minutes to appear)
kubectl get service geography-api -n geography-api

# Once you have the IP, hit your API on port 80:
curl http://EXTERNAL_IP/continents
curl http://EXTERNAL_IP/api/v2/continents
```

---

## Database

The project uses **PostgreSQL 13** managed through Docker Compose.

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_USER: jero
      POSTGRES_PASSWORD: 123
      POSTGRES_DB: geography_db
    ports:
      - '5433:5432'        # host:container — connect via port 5433 locally
    volumes:
      - geography_data:/var/lib/postgresql/data
```

TypeORM is configured to synchronise the schema automatically in development (`synchronize: true`). **Never use `synchronize: true` in production** — use migrations instead.

---

## Getting Started

### Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js | 20 | `node -v` to verify |
| npm | 10 | bundled with Node 20 |
| Docker Desktop | any recent | Docker Compose v2 required |
| WSL2 | — | Windows only, needed for the seed script |

---

### Option A — Full Docker Stack (recommended for peers)

Run the database **and** the application inside Docker. No local Node.js install required beyond seeding.

**1. Clone and enter the repo**

```bash
git clone <repo-url>
cd devops
```

**2. Start all containers**

```bash
docker compose up -d
```

This builds the app image and starts two containers:

| Container | Service | Port |
|---|---|---|
| `devops-app-1` | NestJS API | `localhost:3000` |
| `devops-postgres-1` | PostgreSQL 13 | `localhost:5433` |

Wait ~15 seconds for the healthcheck to pass. Verify with:

```bash
docker compose ps
# Both containers should show "Up ... (healthy)"
```

**3. Seed the database**

```bash
# Linux / macOS
DATABASE_URL=postgresql://jero:123@localhost:5433/geography_db npm run seed

# Windows (WSL)
wsl -e bash -c "cd /mnt/c/path/to/devops && DATABASE_URL=postgresql://jero:123@localhost:5433/geography_db npm run seed"
```

**4. Verify the API is responding**

```bash
curl http://localhost:3000/continents
# → JSON array of continents

curl http://localhost:3000/api/v2/continents
# → same, through the v2 route
```

**5. Tear down**

```bash
docker compose down          # stops containers, keeps postgres volume
docker compose down -v       # stops containers and deletes all data
```

---

### Option B — Local Development (app outside Docker)

The database runs in Docker, the NestJS app runs locally with hot-reload.

**1. Install dependencies**

```bash
npm install
```

**2. Start only the database**

```bash
docker compose up -d postgres
```

**3. Create a `.env` file** at the project root:

```env
DATABASE_URL=postgresql://jero:123@localhost:5433/geography_db
NODE_ENV=development
PORT=3000
```

> The app reads a single `DATABASE_URL` connection string — individual `DB_*` variables are **not** used.

**4. Seed the database** (first time only)

```bash
DATABASE_URL=postgresql://jero:123@localhost:5433/geography_db npm run seed
```

**5. Run the application**

```bash
# Watch mode — auto-restarts on file changes (recommended)
npm run start:dev

# Standard start (compiled output)
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

---

### Connecting to PostgreSQL directly

If you need to inspect the database with a client (e.g. DBeaver, psql, TablePlus):

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `geography_db` |
| Username | `jero` |
| Password | `123` |

```bash
# psql (if installed locally)
psql -h localhost -p 5433 -U jero -d geography_db

# psql via Docker
docker exec -it devops-postgres-1 psql -U jero -d geography_db
```

---

### Quick smoke test

After seeding, run these to confirm all layers are working:

```bash
# v1 routes
curl http://localhost:3000/continents
curl http://localhost:3000/countries
curl http://localhost:3000/cities

# v2 CRUD routes
curl http://localhost:3000/api/v2/continents
curl http://localhost:3000/api/v2/countries
curl http://localhost:3000/api/v2/cities

# Chain — terminal node (no forwarding)
curl -X POST http://localhost:3000/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{"meta":{"antes":null,"origen":"test","siguiente":null}}'

# Chain — specific entities by ID
curl -X POST http://localhost:3000/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{"meta":{"antes":null,"origen":"test","siguiente":null},"continent_id":1,"country_id":1,"city_id":1}'

# Chain — forwarding to another API (replace URL with the next service)
curl -X POST http://localhost:3000/api/v2/chain \
  -H "Content-Type: application/json" \
  -d '{"meta":{"antes":null,"origen":"test","siguiente":"https://next-api.example.com/api/v2/chain"}}'
```

> **Windows PowerShell note:** use `curl.exe` instead of `curl`, and use a JSON file (`-d @payload.json`) to avoid quoting issues.

---

## Linting & Formatting

```bash
# Lint and auto-fix all TypeScript source files
npm run lint

# Format all source files with Prettier
npm run format
```

ESLint is configured with `typescript-eslint` type-aware rules (`recommendedTypeChecked`). Key rules active:

- `@typescript-eslint/no-floating-promises` — warns on unhandled promises
- `@typescript-eslint/no-unsafe-argument` — warns on untyped arguments
- `@typescript-eslint/no-explicit-any` — off (permissive)

---

## Scripts Reference

| Script            | Description                                     |
|-------------------|-------------------------------------------------|
| `npm run build`   | Compile TypeScript to `dist/`                   |
| `npm run start`   | Start compiled app                              |
| `npm run start:dev` | Start in watch mode                           |
| `npm run start:prod` | Start production build                       |
| `npm run lint`    | ESLint with auto-fix                            |
| `npm run format`  | Prettier format                                 |
| `npm run test`    | Run unit tests                                  |
| `npm run test:e2e` | Run end-to-end tests                           |
| `npm run test:cov` | Generate coverage report                       |
