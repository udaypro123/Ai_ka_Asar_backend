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
- `GOOGLE_CLIENT_IDS`: comma-separated Google OAuth client IDs for the web, Android, and iOS clients. The backend verifies ID tokens against these audiences; never put client secrets in either app.
- `STORAGE_PROVIDER`: `local` (default) or `cloudinary`.
- `STORAGE_ACCOUNT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`: provider credentials. For Cloudinary, use the cloud name as the account, API key as access key, and API secret as secret key.
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

## File storage

Resume files use a provider adapter selected by `STORAGE_PROVIDER`. Local disk
storage works for development. Cloudinary uses `STORAGE_ACCOUNT`,
`STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY`. Each uploaded file stores its
provider and key, so existing Cloudinary files remain downloadable. Supporting
another provider requires an adapter implementing upload, delete, and download;
changing credential variable names alone cannot make a different provider
compatible.

Legacy `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` remain accepted as a migration fallback. Move the
values into the generic storage variables and remove the legacy names after
deploying the updated configuration.

## Google Sign-in

Create OAuth client IDs in Google Cloud Console for the web origin and each native app (Android package `com.AIMarg.app` and iOS bundle ID `com.AIMarg.app`). Enable the Google identity/OAuth consent configuration and add the deployed web origin to its authorized JavaScript origins. Configure all resulting client IDs in backend `GOOGLE_CLIENT_IDS` (comma-separated), web `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and the Expo public client ID variables shown in `AIMarg_mobile/.env.example`. Android mobile sign-in sends a Google access token; the backend validates it with Google and checks its audience against `GOOGLE_CLIENT_IDS`. The Android client must match the app's signing certificate SHA-1. iOS mobile sign-in uses an ID token. Keep OAuth client secrets private; these flows use public clients.

Signup requests may select `USER` or `HR`; all other client-supplied roles are rejected. Google signup applies the selected role only to newly created accounts and never changes roles on an existing account.
