# Whitsunday Junk Removal

Public website (`/`) and team dashboard (`/admin`) for Whitsunday Junk Removal.
Next.js 16 · Supabase (database, logins, photo/receipt storage) · Netlify · Resend (email).

---

## 1. Supabase (database + logins) — ~10 min

1. Create a project at [supabase.com](https://supabase.com). Region: **Sydney**.
2. **SQL Editor → New query** → paste all of `supabase/migrations/0001_init.sql` → **Run**.
3. **Authentication → Sign In / Providers → Email**: turn **"Allow new users to sign up" OFF**.
   (Nobody can create an account from outside — you add the three of you by hand.)
4. **Authentication → Users → Add user → Create new user** — once each for Alex, Lucas and Kobi.
   Tick **Auto Confirm User**.
5. Open `supabase/setup_team.sql`, put in the three emails you just used, run it in the SQL Editor.
   This links each login to the business. A login that isn't linked sees nothing.
6. **Project Settings → API Keys**: copy the URL, the **publishable** key and the **secret** key for step 2.

> ⚠️ **Plan:** the free plan pauses after a week of no use and has **no backups**.
> The ATO wants 5 years of records — move to **Pro** before you rely on it, or at minimum
> download the year-end report, CSVs and receipts ZIP (Reports page) every quarter.

## 2. Netlify (hosting)

1. **Add new site → Import from Git** → pick this repo.
2. **Base directory:** `whitsunday-junk-removal` (only while it lives inside the Vid-editing repo).
3. **Environment variables** (Site configuration → Environment variables) — see `.env.example`:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from Supabase |
   | `SUPABASE_SECRET_KEY` | from Supabase — **never** share or commit this |
   | `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com.au` (no trailing slash) |
   | `RESEND_API_KEY` | from Resend (step 4) |
   | `EMAIL_FROM` | `Whitsunday Junk Removal <accounts@yourdomain.com.au>` |

4. Deploy.

## 3. Domain (.com.au)

1. Netlify → **Domain management → Add a domain** → follow the DNS steps (easiest: point the
   domain's nameservers to Netlify).
2. Update `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy.
3. Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://yourdomain.com.au`
   - Redirect URLs: `https://yourdomain.com.au/auth/callback`
   (needed for "Forgot password" emails).

## 4. Email (sending invoices) — Resend

1. Sign up at [resend.com](https://resend.com) → **Domains → Add domain** → add the DNS records it gives you
   (in Netlify DNS if you moved nameservers). Wait for "Verified".
2. **API Keys → Create** → put it in `RESEND_API_KEY` on Netlify, set `EMAIL_FROM`, redeploy.
3. Until this is done, "Email invoice" shows a clear message — you can still **Download PDF** and send it yourself.

## 5. First login

Go to `/login` → **Settings**, and fill in ABN, phone, email, bank details, and the next invoice number
(if you've already issued invoices elsewhere, set it one higher than your last).
Put your email in "Send website quote alerts to" to get pinged when someone fills in the website form.

---

## How the money works

- **Income** = payments actually received (cash basis). Unpaid invoices aren't income yet.
- **Profit** = income − all expenses. Each partner's share is exactly ⅓.
- **Expense paid personally** → still a business expense, plus it's owed back to that partner until
  you tick "Paid back" (Partners page).
- **Tax set-aside** = this FY's share × the rate in Settings (default 20%). An estimate — confirm with your accountant.
- **GST turnover** = invoices issued (ex GST, excluding drafts/void) in the last 12 months. Alert at $60k, must register within 21 days of hitting $75k.
- Invoices can't be deleted, only **voided** — numbers never get reused.
- Every create/edit/delete is in the **Activity log** with who did it.

## Local development

```bash
npm install
npx supabase start      # needs Docker; applies the migration
cp .env.example .env.local   # fill in from `npx supabase status`
npm run dev
```
