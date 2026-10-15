# Numeracount client portal

A Next.js client document portal with email link sign-in, staff-managed client access, and private Box-backed file spaces.

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The public site and sign-in page work without credentials; signing in and using the portal require the services below.

## Required services

1. Create a Supabase project. Run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor. In Authentication → Sign In / Providers, keep Email enabled. The portal uses the default **Magic link or OTP** link template, so no custom SMTP or template editing is needed for limited owner testing. In Authentication → URL Configuration, set the Site URL to the deployed domain and allow `https://numeracount.com/auth/callback` as a redirect URL. Supabase's built-in email service is restricted and cannot be assumed to deliver to arbitrary clients; a production email sender is required before client launch.
2. In the existing Box Developer Console, register a **User** app using **OAuth 2.0**. Enable read/write access to files and folders. Set its redirect URI to `https://numeracount.com/api/box/callback` (or the exact Vercel deployment origin during setup). This route allows a trusted staff member to connect their own Box account. The portal then creates a dedicated `Numeracount Client Portal` root folder inside that account. The earlier Client Credentials Grant app requires a Box enterprise administrator and is not used by this workflow.
3. Add every value in [`.env.example`](.env.example) to `.env.local` and to Vercel environment variables. Set `SITE_URL` to the public site origin, such as `https://numeracount.com`. Generate `BOX_TOKEN_ENCRYPTION_KEY` with `openssl rand -hex 32` and enter the resulting value only in Vercel or a local `.env.local`; never put it in chat or GitHub. Keep `SUPABASE_SERVICE_ROLE_KEY`, `BOX_CLIENT_SECRET`, and the encryption key server-side. Never put them in `NEXT_PUBLIC_*` variables or commit them.
4. Sign in once with the staff email. In Supabase SQL editor, run the commented promotion statement in [`supabase/schema.sql`](supabase/schema.sql) with that exact email. Staff access must be granted explicitly; ordinary sign-ins receive no client access until a staff member creates their space.
5. In Vercel, import this GitHub repository and use the Next.js framework preset. Add `numeracount.com` and optionally `www.numeracount.com` as production domains. Follow Vercel's displayed DNS records in GoDaddy; do not guess DNS values. Enable HTTPS and verify the domain resolves to the deployed site. Once deployed, staff sign in and select **Connect Box** in the portal to authorize the Box User app.

The server stores client metadata (name, email, Box folder ID) and encrypted Box OAuth tokens in Supabase. Files remain in the connected Box account. A signed-in client can access only the space matching their verified email; staff can access all spaces. Downloads pass through a permission-checked server route. Direct uploads are limited to 10 MB. Box and Supabase service credentials are never sent to browsers. If Box access is revoked or refresh expires, staff must reconnect Box.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

After configuring the services, test the complete flow: staff signs in, creates a client space, receives confirmation of the invitation, uploads a file; the client signs in using an email link, sees only their space, downloads that file, and uploads one back. Also verify a different signed-in client cannot open the first client's URL.

## Current limits

This first version supports one staff organization, one email address per client space, and files up to 10 MB. It does not yet include multi-user client teams, deletion, file previews, or audit reports. Box OAuth and production email delivery must be verified before using the portal with real documents.
