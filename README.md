# 🌍 Geography API

A RESTful API built with **NestJS**, **TypeORM**, and **PostgreSQL** for managing geographical data across three domain layers: **Continents**, **Countries**, and **Cities**.

---

## 📑 Table of Contents

- [Overview](#overview)
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
  - [Continents](#continents-controller)
  - [Countries](#countries-controller)
  - [Cities](#cities-controller)
- [Database](#database)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Start the Database](#start-the-database)
  - [Run the Application](#run-the-application)
- [Testing](#testing)
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

## Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:cov
```

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
