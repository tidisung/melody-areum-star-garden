# Family backend

Cloudflare Worker API with a Sites-managed D1 binding `DB`. The frontend remains on GitHub Pages.

Runtime secrets: `ADMIN_LINK_KEY` and `ADMIN_PIN`; provision via Sites environment settings. Never commit the admin link. The private local `.private/아빠-접속링크.txt` contains the owner's bootstrap link.

- Admin link + PIN creates a revocable 12-hour admin session.
- Admin issues single-use child pairing links, expiring after one hour.
- Child device sessions expire after one year and can be revoked by the admin.
- Tokens are random 256-bit secrets; only SHA-256 token digests are stored in D1.
- Every balance change is authorized and calculated on the server.
- D1 batches atomically update a revision-checked snapshot, append events and record an idempotency key.
- Events and completed request IDs are retained without a rolling cap.
- Child history and wish cards are restricted to that child; both children's balances are visible for gifting.
- Legacy import requires admin approval and an untouched database; original browser data is not erased.
- Export includes the full accumulated event history. Store backups securely.

Build: `node scripts/build-api.mjs`
Test: `node tests/cloud.test.mjs` (Node 24, built-in SQLite).
Migrations are in `drizzle/`; Sites applies them at deployment.

The `.openai/hosting.json` now describes the API Worker. The static frontend in `dist/` is still published separately to `gh-pages`. The generated `dist/server/` is ignored by Git and does not go to GitHub Pages.
