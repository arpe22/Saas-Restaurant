# Restaurant SaaS

Base inicial para un sistema SaaS multi-restaurante con monorepo, NestJS, Next.js, PostgreSQL, Prisma y Docker Compose.

## Estructura

```txt
restaurant-saas/
  apps/
    api/
    web/
  packages/
    shared/
  docker-compose.yml
  README.md
  .env.example
```

## Requisitos

- Node.js 22 o superior
- npm 10 o superior
- Docker Desktop

## Instalacion

```bash
npm install
cp .env.example .env
npm run db:up
npm run prisma:generate
npm run prisma:push
```

En Windows PowerShell, si no tienes `cp`, usa:

```powershell
Copy-Item .env.example .env
```

## Desarrollo

Levantar backend y frontend:

```bash
npm run dev
```

O por separado:

```bash
npm run dev:api
npm run dev:web
```

- API: http://localhost:3001
- Web: http://localhost:3000
- Health check API: http://localhost:3001/health
- Prueba de base de datos: http://localhost:3001/database/health

## Base de datos

Levantar PostgreSQL:

```bash
npm run db:up
```

Ver logs:

```bash
npm run db:logs
```

Apagar contenedores:

```bash
npm run db:down
```

## Prisma

El esquema inicial vive en `apps/api/prisma/schema.prisma`.

Generar Prisma Client:

```bash
npm run prisma:generate
```

Sincronizar el esquema inicial con PostgreSQL:

```bash
npm run prisma:push
```

## Estado actual

Esta base solo incluye configuracion inicial, scripts, frontend minimo, backend minimo y una conexion basica a PostgreSQL desde NestJS usando Prisma. Los modulos de negocio se agregaran despues.
