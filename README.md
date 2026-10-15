# Numeracount client portal

A Next.js client document portal with email code sign-in, staff-managed client access, and private Box-backed file spaces.

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The public site and sign-in page work without credentials; signing in and using the portal require the services below.

## Required services

1. Create a Supabase project. Run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor. In Authentication → Providers → Email, enable email OTP. Set the email template to include `{{ .Token }}` so clients receive a numeric code. Configure production SMTP for reliable delivery and set the project Site URL to the deployed domain.
2. Register a Box **Custom App** using **Server Authentication (Client Credentials Grant)**. Enable read/write access to files and folders, then have a Box enterprise administrator authorize the app. Create a dedicated root folder for client spaces and give the app access to it. Use its folder ID as `BOX_ROOT_FOLDER_ID`. Box configuration depends on your enterprise policies; verify the app can create folders, upload, list, and download before inviting clients.
3. Add every value in [`.env.example`](.env.example) to `.env.local` and to Vercel environment variables. Keep `SUPABASE_SERVICE_ROLE_KEY` and all `BOX_*` values server-side. Never put them in `NEXT_PUBLIC_*` variables or commit them.
4. Sign in once with the staff email. In Supabase SQL editor, run the commented promotion statement in [`supabase/schema.sql`](supabase/schema.sql) with that exact email. Staff access must be granted explicitly; ordinary sign-ins receive no client access until a staff member creates their space.
5. In Vercel, import this GitHub repository and use the Next.js framework preset. Add `numeracount.com` and optionally `www.numeracount.com` as production domains. Follow Vercel's displayed DNS records in GoDaddy; do not guess DNS values. Enable HTTPS and verify the domain resolves to the deployed site.

The server stores client metadata (name, email, Box folder ID) in Supabase. Files remain in Box. A signed-in client can access only the space matching their verified email; staff can access all spaces. Downloads pass through a permission-checked server route. Direct uploads are limited to 10 MB. Box and Supabase service credentials are never sent to browsers.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

After configuring the services, test the complete flow: staff signs in, creates a client space, receives confirmation of the invitation, uploads a file; the client signs in using an email code, sees only their space, downloads that file, and uploads one back. Also verify a different signed-in client cannot open the first client's URL.

## Current limits

This first version supports one staff organization, one email address per client space, and files up to 10 MB. It does not yet include multi-user client teams, deletion, file previews, or audit reports. Box app authorization and production email delivery must be configured before using the portal with real documents.
