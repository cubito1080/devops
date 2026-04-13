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
- [AWS Deployment (EKS)](#aws-deployment-eks)
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

    subgraph AWS["☁️ AWS — EKS Cluster (us-east-1)"]
        subgraph K8s["Kubernetes (EKS)"]
            GeoAPI["🌍 Geography API\n(NestJS)\n/api/v2/chain"]
        end
        ECR["🐳 ECR\nContainer Registry"]
        CodePipeline["🔄 CodePipeline\nCI/CD"]
        CodeBuild["🔨 CodeBuild\nbuildspec.yml"]
        RDS["🗄️ RDS / Aurora\nPostgreSQL"]
        CodePipeline --> CodeBuild --> ECR --> K8s
        K8s --> RDS
    end

    subgraph Azure["☁️ Azure"]
        SupportAPI["🛠️ Support API\n/api/v2/chain"]
    end

    subgraph GCP["☁️ Google Cloud"]
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

### AWS Deployment Overview

| Component | Service |
|---|---|
| Container Registry | Amazon ECR |
| Kubernetes cluster | Amazon EKS (3 replicas) |
| CI/CD pipeline | AWS CodePipeline + CodeBuild |
| Database | Amazon RDS PostgreSQL (or Aurora) |
| Ingress | AWS Load Balancer Controller (ALB) |

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

## AWS Deployment (EKS)

The application is deployed to **Amazon EKS** via **AWS CodePipeline + CodeBuild**.

### Pipeline Flow

```
GitHub repo push
  → AWS CodePipeline (source stage)
  → AWS CodeBuild (buildspec.yml)
      ├── docker build + docker push → ECR
      └── kubectl apply k8s/ → EKS cluster
```

### Required AWS Setup (manual — no Terraform/CDK)

1. **ECR repository**: Create a private repo named `geography-api`
2. **EKS cluster**: Create a cluster named `geography-cluster` (or update `EKS_CLUSTER_NAME` in `buildspec.yml`)
3. **CodeBuild IAM role**: Attach `AmazonEKSWorkerNodePolicy`, `AmazonEC2ContainerRegistryPowerUser`, and `eks:DescribeCluster`
4. **EKS aws-auth**: Add the CodeBuild IAM role to the cluster's `aws-auth` ConfigMap
5. **K8s Secret**: Create the database credentials secret before first deploy:
   ```bash
   kubectl create secret generic geography-api-secret \
     --namespace=geography-api \
     --from-literal=DATABASE_URL='postgres://user:password@host:5432/dbname'
   ```
6. **AWS Load Balancer Controller**: Install in the cluster for Ingress/ALB support

### CodeBuild Environment Variables

| Variable | Description |
|---|---|
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |
| `AWS_DEFAULT_REGION` | e.g. `us-east-1` |
| `ECR_REPO_NAME` | ECR repository name (default: `geography-api`) |
| `EKS_CLUSTER_NAME` | EKS cluster name (default: `geography-cluster`) |

### Manual Deploy (kubectl only)

```bash
# Apply manifests directly
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml -n geography-api
kubectl apply -f k8s/service.yaml -n geography-api
kubectl apply -f k8s/ingress.yaml -n geography-api
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

- Node.js ≥ 20
- Docker & Docker Compose
- WSL2 (if on Windows) or a Unix-compatible shell

---

### Installation

```bash
npm install
```

---

### Environment Variables

Create a `.env` file at the project root (not committed to source control):

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=jero
DB_PASSWORD=123
DB_NAME=geography_db
```

---

### Start the Database

```bash
docker compose up -d
```

This starts the PostgreSQL container on host port `5433`.

---

### Run the Application

```bash
# Development
npm run start

# Watch mode (auto-restart on file changes)
npm run start:dev

# Production (requires prior build)
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

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
