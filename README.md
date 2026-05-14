# Shred System

Full multi-user body recomposition tracker. Real auth, real database, infinite level system.

## File structure
```
/index.html          ← landing page (public)
/login.html          ← auth (public)
/onboarding.html     ← one-time setup (auth required)
/dashboard.html      ← home base (auth required)
/log.html            ← daily entry + history (auth required)
/progress.html       ← all charts + stats (auth required)
/levels.html         ← level system + goals (auth required)
/profile.html        ← edit stats + archives (auth required)
/css/shared.css      ← shared styles
/js/config.js        ← supabase keys
/js/auth.js          ← shared auth logic
/js/nav.js           ← bottom nav component
/js/levels.js        ← level defs + computation engine
```

---

## Deploy to GitHub + Vercel

### 1. Create GitHub repo
Go to github.com → New repository → name it `shred-system` → Create

### 2. Push files
```bash
cd path/to/shred-system
git init
git add .
git commit -m "initial build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shred-system.git
git push -u origin main
```

### 3. Connect Vercel
1. Go to vercel.com → sign in with GitHub
2. New Project → import `shred-system`
3. Framework: Other (static)
4. Click Deploy

Done. Your app is live.

### 4. Every future update
```bash
git add .
git commit -m "describe what changed"
git push
```
Vercel auto-deploys in ~30 seconds.

---

## Supabase — Email confirmation

By default Supabase requires email confirmation on signup.
To disable for easier testing:
Supabase dashboard → Authentication → Settings → uncheck "Enable email confirmations"

---

## Future: Coach view (V2)

The `coach_clients` table is already created and the `role` column exists on profiles.
When ready to build coach view:
1. Set `role = 'coach'` on coach accounts via Supabase dashboard
2. Build `/coach.html` that queries `coach_clients` joined with `daily_logs`
3. The RLS policy "Coach sees clients" is already active

---

## Making updates with Claude
1. Come back to Claude and describe what you want changed
2. Claude gives you the updated file(s)
3. Paste into your local files, then:
```bash
git add . && git commit -m "update" && git push
```
