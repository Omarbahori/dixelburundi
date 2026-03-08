# DIXEL Agency Site (Next.js + Admin)

This project runs as a real Node.js web app (not static export) so you can manage content from an in-site admin panel.

## Local Run

If `npm` is available on your machine:

```powershell
cd d:\1.DIXEL\WEBSITE\DIXEL
npm install

# set admin env (PowerShell example)
$env:ADMIN_EMAIL="admin@dixel.com"
$env:ADMIN_SECRET="replace-with-a-long-random-secret"
$env:ADMIN_PASSWORD_HASH_B64="replace-with-bcrypt-hash-base64"

npm run dev:local
```

Open:
- Site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

Do not run `npm run dev:local` on shared hosting.

### Admin Login Notes

- Use the same `ADMIN_EMAIL` + password/hash on local and Vercel if you want identical credentials.
- You can change password from Admin Dashboard -> Overview -> `ADMIN SECURITY`.
- Password changes are stored in `data/admin-credential.json`.

### Generate ADMIN_PASSWORD_HASH

```powershell
cd d:\1.DIXEL\WEBSITE\DIXEL
npm run gen:admin -- "YourStrongPasswordHere"
```

Copy the printed `ADMIN_PASSWORD_HASH_B64=...` into `ADMIN_PASSWORD_HASH_B64`.

## Content Storage

Content is stored in local JSON files:
- `data/site.json` for site content
- `data/admin-credential.json` for runtime admin credentials

## Production (cPanel "Setup Node.js App")

1. Upload the project to your server (or Git deploy).
2. In cPanel:
   - Open **Setup Node.js App**
   - Create an app (Node 20.9+ recommended)
   - Set **Application startup file** to `server.js`
   - Set environment variables:
     - `NODE_ENV=production`
     - `ADMIN_EMAIL=...`
     - `ADMIN_SECRET=...`
     - `ADMIN_PASSWORD_HASH_B64=...`
     - `CONTENT_STORAGE=file`
3. Run:
   - `npm install --production=false`
   - `npm run build:cpanel` (or `npm run build`)
4. Start/Restart the Node app.

### External Linux Build For cPanel

Your cPanel host is too constrained to run `next build` reliably. The safer deployment path is:

1. Build on Linux outside cPanel:
   - GitHub Actions on Ubuntu using `.github/workflows/build-cpanel-standalone.yml`
   - WSL Ubuntu
   - any Linux VPS or local Linux machine
2. Package the standalone artifact:
   - `npm ci`
   - `npm run build`
   - `npm run package:cpanel:standalone`
3. Zip the `.cpanel-deploy` directory and upload that zip to cPanel.
4. Extract it into your app root, for example `/home/dixelbur/dixel`.
5. Do not run `npm install` or `npm run build` on cPanel for that artifact.
6. Restart the Node app.

Linux build example:

```bash
npm ci
npm run build
npm run package:cpanel:standalone
cd .cpanel-deploy
zip -r ../dixel-cpanel-standalone-linux.zip .
```

The packaged artifact contains:
- root `server.js`
- `.next/standalone`
- `.next/static`
- `public`
- `data`

For GitHub Actions builds, add these repository secrets if your build reads Sanity content:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`

Runtime env vars still belong in cPanel:
- `NODE_ENV=production`
- `CONTENT_STORAGE=file`
- `ADMIN_EMAIL=...`
- `ADMIN_SECRET=...`
- `ADMIN_PASSWORD_HASH_B64=...`
- Sanity vars if you use CMS-backed pages

Prisma note:
- Prisma was not the root cause of the cPanel build crash.
- It is still removed in this branch to keep the deployment path smaller while the Linux artifact flow is being stabilized.
- Re-adding it later is possible once this deployment path is proven.

### Shared Hosting Safety Rules

- Run only: `npm run build:cpanel` and app start via `node server.js` (or cPanel start button).
- Never run on server: `npm run dev:local` or long-running local tooling.
- `server.js` is production-only and refuses to run without a built `.next/BUILD_ID`.

### Verify Single Process

After app start in cPanel Terminal:

```bash
ps -u "$USER" -o pid,ppid,cmd | grep -E "node .*server.js" | grep -v grep
```

Expected: one `node ... server.js` line for this app.

Admin entry:
- Footer copyright (e.g. `© 2026 DIXEL`) links to `/admin`.

## Case Studies CMS (Sanity)

Sanity Studio is available at `/studio`.

Set these environment variables:
- `NEXT_PUBLIC_SANITY_PROJECT_ID=...`
- `NEXT_PUBLIC_SANITY_DATASET=production`

Add content in this order:
1. Create a `Client` with `name`, `slug`, `logo`, `shortDescription`, and `services`.
2. Create a `Case Study` linked to that client:
   - Fill `introHeadline` and `introText`
   - Upload exactly two `coverImages`
   - Add `blocks` and set each block `order`
3. In each block, choose a block `type`:
   - `galleryGrid` for multi-image grid
   - `twoUp` for two side-by-side images
   - `fullWidth` for one large image
   - `text` for text-only content
   - For each block image you can control portfolio visibility:
     - `Show On Work Page`
     - `Show On Home Featured`
     - Optional: `Work Card Title`, `Work Category`
4. Create `Work Item` entries for portfolio cards:
   - Select `client`
   - Optionally select `caseStudy`
   - If `caseStudy` is empty, clicks will fall back to `/case-studies/[client.slug]`

Routing behavior:
- `/case-studies/[slug]` resolves by case-study slug first.
- If no case-study slug matches, it falls back to the latest case study for that client slug.
