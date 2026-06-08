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
npm run prisma:migrate
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

Aplicar migraciones locales y regenerar Prisma Client:

```bash
npm run prisma:migrate
```

Aplicar migraciones en un ambiente ya preparado:

```bash
npm run prisma:migrate:deploy
```

Regenerar Prisma Client sin cambiar la base de datos:

```bash
npm run prisma:generate
```

Abrir Prisma Studio:

```bash
npm run prisma:studio
```

## Ejemplos de requests

Login:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"Password123!"}'
```

Guardar el access token:

```bash
TOKEN="access-token"
```

Crear restaurante:

```bash
curl -X POST http://localhost:3001/restaurants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Restaurant","slug":"demo-restaurant"}'
```

Listar restaurantes:

```bash
curl http://localhost:3001/restaurants \
  -H "Authorization: Bearer $TOKEN"
```

Ver restaurante por ID:

```bash
curl http://localhost:3001/restaurants/$RESTAURANT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Actualizar restaurante:

```bash
curl -X PATCH http://localhost:3001/restaurants/$RESTAURANT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Restaurant Updated"}'
```

Desactivar restaurante:

```bash
curl -X PATCH http://localhost:3001/restaurants/$RESTAURANT_ID/deactivate \
  -H "Authorization: Bearer $TOKEN"
```

Crear sucursal:

```bash
curl -X POST http://localhost:3001/restaurants/$RESTAURANT_ID/branches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Centro","slug":"centro"}'
```

Listar sucursales por restaurante:

```bash
curl http://localhost:3001/restaurants/$RESTAURANT_ID/branches \
  -H "Authorization: Bearer $TOKEN"
```

Ver sucursal por ID:

```bash
curl http://localhost:3001/restaurants/$RESTAURANT_ID/branches/$BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"
```

Actualizar sucursal:

```bash
curl -X PATCH http://localhost:3001/restaurants/$RESTAURANT_ID/branches/$BRANCH_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Centro Updated"}'
```

Desactivar sucursal:

```bash
curl -X PATCH http://localhost:3001/restaurants/$RESTAURANT_ID/branches/$BRANCH_ID/deactivate \
  -H "Authorization: Bearer $TOKEN"
```

## Estado actual

Esta base solo incluye configuracion inicial, scripts, frontend minimo, backend minimo y una conexion basica a PostgreSQL desde NestJS usando Prisma. Los modulos de negocio se agregaran despues.
