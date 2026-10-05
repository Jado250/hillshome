# Hillshome Tours Company LTD: website

Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL. No PHP. No payments.

## Run locally
```bash
npm install
cp .env.example .env        # set DATABASE_URL and AUTH_SECRET (openssl rand -base64 48)
npx prisma migrate dev --name init
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='choose-a-strong-one' npm run db:seed
npm run dev                 # http://localhost:3000, admin at /admin/login
npm test    
```

## Built so far
- Schema, seed (demo data labelled `[DEMO]`, tramway hidden until confirmed, empty contact/about placeholders)
- Public site: home, about, services + detail, tours + detail (DB-driven, search), projects, contact, privacy/terms placeholders, 404/error, sitemap, robots
- Request system: category picker, six Zod-validated forms, upload checks (type, extension, magic bytes, size), reference numbers via atomic counter, confirmation page, rate limit, same-origin check
- Auth: argon2 hashing, signed httpOnly session cookie, middleware, RBAC (SUPER_ADMIN / ADMIN / STAFF)
- Admin: dashboard stats, requests list (search/status filter), request detail (status, assign, notes, history), audit log, quote API
- Tests: reference format, validation, credential blocking, upload checks, role permissions

## Not built yet
Tours/Services/Gallery/Staff/Reports/Settings admin screens, quote screens, attachment download route, admin tour image upload, Playwright tests, integration tests against a live DB, production deployment guide.

## Notes
- Contact details, About text and social links are editable `SiteSetting` rows (empty until the company supplies them).
- Local uploads go to `UPLOAD_DIR`; `src/lib/storage.ts` is the swap point for S3/R2.
- The in-memory rate limiter suits one server instance; use Redis for several.
