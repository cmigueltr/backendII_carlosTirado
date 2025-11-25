# Proyecto Backend - Auth & Users (Entrega parcial)

## Setup
1. cp .env.example .env -> completar variables
2. npm install
3. npm run dev

## Endpoints principales
- POST /api/sessions/register
- POST /api/sessions/login
- GET  /api/sessions/current (Authorization: Bearer <token>)
- CRUD: /api/users

## Notas
- Passwords en DB son hashes generados con bcrypt.hashSync.
- Passport configurado con estrategias: local, jwt, current.
