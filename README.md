# AIMarg Backend

Express and TypeScript REST API backed by MongoDB.

## Requirements

- Node.js 20 or newer
- MongoDB reachable at `MONGODB_URI`

## Local Setup

```powershell
npm ci
Copy-Item .env.example .env
```

Set `MONGODB_URI` and replace both JWT secrets with separate random values of at least 32 characters. You can generate a value with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Start the API with `npm run dev`. The default local address is `http://127.0.0.1:5000`; `GET /health` checks API availability.

## Environment

- `CORS_ORIGIN`: comma-separated exact origins; local defaults cover web (`localhost:3000`) and Expo web (`localhost:8081`).
- `FRONTEND_URL`: web base URL used for password reset links.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: SMTP delivery settings for password reset.
- `AUTH_COOKIE_SAME_SITE`: `lax` by default. `none` is only allowed for production deployments using HTTPS.
- `TRUST_PROXY_HOPS`: set to the exact number of trusted reverse proxies in front of Express so rate limits use client IPs correctly.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: independent secrets, each at least 32 characters.

Never commit `.env`. The `.env.example` template is safe to commit.

## Scripts

- `npm run dev`: watch and run the TypeScript server
- `npm run build`: compile to `dist/`
- `npm start`: run the compiled server
- `npm run lint`: lint source files
- `npm test`: run Jest tests

Production deployment also requires a real SMTP provider, an exact production frontend origin, HTTPS, `HOST=0.0.0.0` when running in a container, and managed MongoDB backups.
