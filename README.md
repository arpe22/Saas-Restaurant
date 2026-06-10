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
npm run prisma:seed
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

Sembrar permisos iniciales:

```bash
npm run prisma:seed
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

Crear usuario:

```bash
curl -X POST http://localhost:3001/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"Password123!","firstName":"Staff","lastName":"User"}'
```

Listar usuarios del restaurante actual:

```bash
curl http://localhost:3001/users \
  -H "Authorization: Bearer $TOKEN"
```

Ver usuario por ID:

```bash
curl http://localhost:3001/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

Actualizar usuario:

```bash
curl -X PATCH http://localhost:3001/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Staff Updated"}'
```

Asignar sucursal a usuario:

```bash
curl -X PATCH http://localhost:3001/users/$USER_ID/branch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"branchId\":\"$BRANCH_ID\"}"
```

Cambiar contraseña:

```bash
curl -X PATCH http://localhost:3001/users/$USER_ID/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"NewPassword123!"}'
```

Bloquear usuario:

```bash
curl -X PATCH http://localhost:3001/users/$USER_ID/block \
  -H "Authorization: Bearer $TOKEN"
```

Desactivar usuario:

```bash
curl -X PATCH http://localhost:3001/users/$USER_ID/deactivate \
  -H "Authorization: Bearer $TOKEN"
```

Crear rol:

```bash
curl -X POST http://localhost:3001/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"manager","description":"Restaurant manager"}'
```

Listar roles del restaurante actual:

```bash
curl http://localhost:3001/roles \
  -H "Authorization: Bearer $TOKEN"
```

Editar rol:

```bash
curl -X PATCH http://localhost:3001/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated role description"}'
```

Desactivar rol:

```bash
curl -X PATCH http://localhost:3001/roles/$ROLE_ID/deactivate \
  -H "Authorization: Bearer $TOKEN"
```

Asignar permisos a un rol:

```bash
curl -X POST http://localhost:3001/roles/$ROLE_ID/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionKeys":["roles.manage","users.manage"]}'
```

Quitar permisos de un rol:

```bash
curl -X DELETE http://localhost:3001/roles/$ROLE_ID/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionKeys":["users.manage"]}'
```

Asignar rol a usuario:

```bash
curl -X POST http://localhost:3001/users/$USER_ID/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"roleId\":\"$ROLE_ID\"}"
```

Quitar rol a usuario:

```bash
curl -X DELETE http://localhost:3001/users/$USER_ID/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Estado actual

Esta base incluye configuracion inicial, scripts, frontend minimo, conexion a PostgreSQL desde NestJS usando Prisma y modulos backend iniciales para autenticacion, restaurantes, sucursales, roles, permisos y usuarios.
