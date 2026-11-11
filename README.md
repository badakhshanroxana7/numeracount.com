# Numeracount client portal

The public website is live. Keep `PORTAL_ENABLED=false` (or unset) until all launch checks pass. Pages, authentication callbacks, and portal APIs fail closed while disabled.

Client documents use the private Supabase bucket **Client-Documents**. Box is a separate staff archive; client file operations never use Box. Existing Box OAuth code remains staff-only and optional, and existing Box files are not copied or modified by this change.

## Setup

1. Configure the values in `.env.example` in the server environment. Supabase URL and anon key are public configuration; the service-role key stays server-only. Box variables are optional and needed only for the retained staff Box connection routes.
2. For a new database run `supabase/schema.sql`. For new and existing databases run `supabase/migrations/20261111_client_documents.sql` in Supabase SQL Editor. It preserves Box folder references, links client rows to matching Auth account IDs, sets a private 10 MB bucket, and enforces own-folder SELECT/INSERT with no UPDATE/DELETE for clients. It reports client rows still missing an Auth account.
3. Configure Supabase Auth Site URL as `https://www.numeracount.com`, allow its `/auth/callback`, and configure production email delivery. Promote only trusted staff using the commented SQL in schema.sql. New accounts default to client.
4. Staff create client spaces; the server invites or resolves the Auth account and stores its unique account ID. Authorization uses that ID, not a browser-supplied email or folder. Staff can access all client spaces; clients see only their own.

## File behavior

Storage paths are `<auth-user-id>/<random-uuid>_<sanitized-filename>`. Clients use their own authenticated session for listing, downloads, and signed upload authorization, so Supabase RLS also applies. Staff service-role access happens only after server-side staff and client-space authorization. Upload bytes go straight to Supabase through a short-lived signed upload capability; they do not hit Vercel's function body limit. The bucket enforces a 10 MB maximum. Unique names and `upsert:false` prevent replacement. Downloads force attachment and disable caching. The app exposes no delete, rename, move, or overwrite endpoint.

## Verification

```bash
npm ci
npm run typecheck
npm run build
```

Run the Storage integration check with Supabase URL, anon key and service role in the environment:

```bash
node scripts/test-storage.mjs
```

It creates two temporary confirmed Auth users and synthetic documents, verifies own-file access, cross-client and anonymous denials, signed upload, overwrite/move/delete denial, and bucket privacy/size limits. It removes only its own synthetic fixtures using the service role. It never sends email. Run only in the intended Supabase project.

Before opening the portal, also test staff creation/invitation, email-link login, client A/B space isolation and forged download/upload URLs through the app, staff upload/download, no delete access, and closed-portal behavior. Browser testing and live Supabase tests are required before launch. Passing a build is not a launch approval. Keep production closed throughout staging tests.

## Local development

```bash
cp .env.example .env.local
npm run dev
```

The homepage works without service credentials. Enable the portal only in a controlled local/preview environment for tests. Do not enable production until the complete flow passes.
