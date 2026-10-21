-- Whitsunday Junk Removal — initial schema
-- Run this whole file once in Supabase → SQL Editor → New query.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────

-- "Today" in the Whitsundays (Queensland has no daylight saving).
create or replace function public.today_bne()
returns date language sql stable as $$
  select (now() at time zone 'Australia/Brisbane')::date;
$$;

-- ─────────────────────────────────────────────────────────────
-- Team (Alex, Lucas, Kobi)
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Only people with a profile row can see or touch any business data.
create or replace function public.is_team()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- Link an existing Supabase Auth user (created in Authentication → Users) to the team.
create or replace function public.add_team_member(p_email text, p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    raise exception 'No auth user with email %. Create the user in Authentication → Users first.', p_email;
  end if;
  insert into public.profiles (id, email, display_name)
  values (v_id, lower(p_email), p_name)
  on conflict (id) do update set display_name = excluded.display_name;
  return v_id;
end $$;
revoke execute on function public.add_team_member(text, text) from public, anon, authenticated;

-- created_by / updated_by / updated_at on every business table
create or replace function public.set_audit_fields()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
    new.created_at := coalesce(new.created_at, now());
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;

-- Full change history (who changed what, before and after)
create table public.activity_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text,
  action text not null,
  actor uuid references public.profiles (id) on delete set null,
  at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);
create index activity_log_record_idx on public.activity_log (table_name, record_id);
create index activity_log_at_idx on public.activity_log (at desc);

create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is not null and not exists (select 1 from public.profiles where id = v_actor) then
    v_actor := null;
  end if;
  if tg_op = 'DELETE' then
    insert into public.activity_log (table_name, record_id, action, actor, old_data)
    values (tg_table_name, old.id::text, 'delete', v_actor, to_jsonb(old));
    return old;
  elsif tg_op = 'UPDATE' then
    if to_jsonb(new) - 'updated_at' - 'updated_by' = to_jsonb(old) - 'updated_at' - 'updated_by' then
      return new;
    end if;
    -- invoice counter bumps are already visible on the invoice itself
    if tg_table_name = 'settings'
       and to_jsonb(new) - 'updated_at' - 'updated_by' - 'invoice_next_number'
         = to_jsonb(old) - 'updated_at' - 'updated_by' - 'invoice_next_number' then
      return new;
    end if;
    insert into public.activity_log (table_name, record_id, action, actor, old_data, new_data)
    values (tg_table_name, new.id::text, 'update', v_actor, to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into public.activity_log (table_name, record_id, action, actor, new_data)
    values (tg_table_name, new.id::text, 'create', v_actor, to_jsonb(new));
    return new;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Settings (single row)
-- ─────────────────────────────────────────────────────────────

create table public.settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Whitsunday Junk Removal',
  abn text,
  phone text,
  email text,
  postal_address text,
  bank_account_name text,
  bank_bsb text,
  bank_account_number text,
  invoice_prefix text not null default 'WJR-',
  invoice_next_number int not null default 1 check (invoice_next_number > 0),
  invoice_number_padding int not null default 4,
  invoice_footer text default 'Thanks for choosing a local business!',
  gst_registered boolean not null default false,
  gst_rate numeric(5,2) not null default 10,
  tax_set_aside_rate numeric(5,2) not null default 20,
  terms_real_estate int not null default 14,
  terms_commercial int not null default 14,
  terms_residential int not null default 0,
  price_full numeric(10,2) not null default 650,
  price_three_quarter numeric(10,2) not null default 500,
  price_half numeric(10,2) not null default 330,
  price_quarter numeric(10,2) not null default 180,
  quote_notify_email text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
insert into public.settings (id) values (1);

-- ─────────────────────────────────────────────────────────────
-- Clients (CRM)
-- ─────────────────────────────────────────────────────────────

create type public.client_type as enum ('real_estate', 'commercial', 'residential');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.client_type not null default 'residential',
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  payment_terms_days int not null default 0 check (payment_terms_days >= 0),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index clients_name_idx on public.clients (lower(name));

-- ─────────────────────────────────────────────────────────────
-- Jobs
-- ─────────────────────────────────────────────────────────────

create type public.job_status as enum ('quoted', 'booked', 'done', 'invoiced', 'paid');
create type public.load_size as enum ('full', 'three_quarter', 'half', 'quarter', 'custom');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_number int generated always as identity unique,
  client_id uuid not null references public.clients (id) on delete restrict,
  job_date date not null default public.today_bne(),
  address text,
  description text,
  load_size public.load_size not null default 'full',
  price numeric(10,2) not null default 0 check (price >= 0),
  status public.job_status not null default 'booked',
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index jobs_client_idx on public.jobs (client_id);
create index jobs_date_idx on public.jobs (job_date desc);

create table public.job_workers (
  job_id uuid not null references public.jobs (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (job_id, profile_id)
);

create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  kind text not null check (kind in ('before', 'after')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index job_photos_job_idx on public.job_photos (job_id);

-- ─────────────────────────────────────────────────────────────
-- Invoices & payments
-- ─────────────────────────────────────────────────────────────

create type public.invoice_status as enum ('draft', 'sent', 'paid', 'void');
create type public.payment_method as enum ('bank_transfer', 'cash');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  number_seq int not null unique,
  client_id uuid not null references public.clients (id) on delete restrict,
  job_id uuid references public.jobs (id) on delete set null,
  issue_date date not null default public.today_bne(),
  payment_terms_days int not null default 0,
  due_date date not null default public.today_bne(),
  gst_enabled boolean not null default false,
  gst_rate numeric(5,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  gst_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status public.invoice_status not null default 'draft',
  notes text,
  sent_at timestamptz,
  sent_to text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index invoices_client_idx on public.invoices (client_id);
create index invoices_job_idx on public.invoices (job_id);
create index invoices_issue_idx on public.invoices (issue_date desc);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  position int not null default 0,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  amount numeric(10,2) generated always as (round(quantity * unit_price, 2)) stored
);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  paid_on date not null default public.today_bne(),
  amount numeric(10,2) not null check (amount > 0),
  method public.payment_method not null default 'bank_transfer',
  reference text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index payments_invoice_idx on public.payments (invoice_id);
create index payments_paid_on_idx on public.payments (paid_on);

-- Allocate WJR-0001 style numbers atomically (row lock on settings).
create or replace function public.assign_invoice_number()
returns trigger language plpgsql security definer set search_path = '' as $$
declare s record;
begin
  if new.invoice_number is null or new.number_seq is null then
    select invoice_prefix, invoice_next_number, invoice_number_padding
      into s from public.settings where id = 1 for update;
    new.number_seq := s.invoice_next_number;
    new.invoice_number := s.invoice_prefix || lpad(s.invoice_next_number::text, s.invoice_number_padding, '0');
    update public.settings set invoice_next_number = s.invoice_next_number + 1 where id = 1;
  end if;
  return new;
end $$;

create or replace function public.recalc_invoice(p_invoice uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_sub numeric(10,2); v_inv record;
begin
  select gst_enabled, gst_rate into v_inv from public.invoices where id = p_invoice;
  if not found then return; end if;
  select coalesce(sum(amount), 0) into v_sub from public.invoice_items where invoice_id = p_invoice;
  update public.invoices
     set subtotal = v_sub,
         gst_amount = case when v_inv.gst_enabled then round(v_sub * v_inv.gst_rate / 100, 2) else 0 end,
         total = v_sub + case when v_inv.gst_enabled then round(v_sub * v_inv.gst_rate / 100, 2) else 0 end
   where id = p_invoice;
end $$;

create or replace function public.invoice_items_changed()
returns trigger language plpgsql as $$
begin
  perform public.recalc_invoice(coalesce(new.invoice_id, old.invoice_id));
  return null;
end $$;

create or replace function public.invoice_gst_changed()
returns trigger language plpgsql as $$
begin
  if new.gst_enabled is distinct from old.gst_enabled or new.gst_rate is distinct from old.gst_rate then
    perform public.recalc_invoice(new.id);
  end if;
  return null;
end $$;

-- Creating an invoice for a job moves the job to "invoiced".
create or replace function public.invoice_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.job_id is not null then
    update public.jobs set status = 'invoiced'
     where id = new.job_id and status in ('quoted', 'booked', 'done');
  end if;
  return null;
end $$;

-- Keep invoice + job status in step with payments received.
create or replace function public.sync_invoice_paid(p_invoice uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_total numeric(10,2); v_paid numeric(10,2); v_status public.invoice_status; v_job uuid;
begin
  select total, status, job_id into v_total, v_status, v_job from public.invoices where id = p_invoice;
  if not found or v_status = 'void' then return; end if;
  select coalesce(sum(amount), 0) into v_paid from public.payments where invoice_id = p_invoice;
  if v_paid >= v_total and v_total > 0 then
    update public.invoices set status = 'paid' where id = p_invoice and status <> 'paid';
    if v_job is not null then
      update public.jobs set status = 'paid' where id = v_job;
    end if;
  elsif v_status = 'paid' then
    update public.invoices set status = 'sent' where id = p_invoice;
    if v_job is not null then
      update public.jobs set status = 'invoiced' where id = v_job and status = 'paid';
    end if;
  end if;
end $$;

create or replace function public.payments_changed()
returns trigger language plpgsql as $$
begin
  perform public.sync_invoice_paid(coalesce(new.invoice_id, old.invoice_id));
  return null;
end $$;

create or replace function public.invoice_total_changed()
returns trigger language plpgsql as $$
begin
  if new.total is distinct from old.total then
    perform public.sync_invoice_paid(new.id);
  end if;
  return null;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Expenses & partner payouts
-- ─────────────────────────────────────────────────────────────

create type public.expense_category as enum ('fuel', 'dump_fees', 'insurance', 'advertising', 'equipment', 'other');

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default public.today_bne(),
  category public.expense_category not null,
  amount numeric(10,2) not null check (amount > 0),
  description text,
  supplier text,
  job_id uuid references public.jobs (id) on delete set null,
  receipt_path text,
  no_receipt boolean not null default false,
  -- null = paid from the business account; otherwise the partner who paid personally
  paid_by uuid references public.profiles (id) on delete restrict,
  reimbursed_on date,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  constraint expenses_reimbursed_needs_partner check (paid_by is not null or reimbursed_on is null),
  constraint expenses_receipt_or_flag check (receipt_path is not null or no_receipt)
);
create index expenses_date_idx on public.expenses (expense_date desc);
create index expenses_job_idx on public.expenses (job_id);
create index expenses_paid_by_idx on public.expenses (paid_by) where reimbursed_on is null;

create table public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete restrict,
  paid_on date not null default public.today_bne(),
  amount numeric(10,2) not null check (amount > 0),
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index partner_payouts_date_idx on public.partner_payouts (paid_on);

-- ─────────────────────────────────────────────────────────────
-- Quote requests from the public website
-- ─────────────────────────────────────────────────────────────

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  suburb text,
  load_size_guess text,
  preferred_date date,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index quote_requests_created_idx on public.quote_requests (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Triggers
-- ─────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['clients', 'jobs', 'job_photos', 'invoices', 'payments', 'expenses', 'partner_payouts', 'quote_requests'] loop
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.set_audit_fields()', t || '_audit_fields', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_activity()', t || '_activity', t);
  end loop;
end $$;

create trigger settings_audit_fields before update on public.settings
  for each row execute function public.set_audit_fields();
create trigger settings_activity after update on public.settings
  for each row execute function public.log_activity();

create trigger invoices_assign_number before insert on public.invoices
  for each row execute function public.assign_invoice_number();
create trigger invoices_created after insert on public.invoices
  for each row execute function public.invoice_created();
create trigger invoices_gst_changed after update on public.invoices
  for each row execute function public.invoice_gst_changed();
create trigger invoices_total_changed after update on public.invoices
  for each row execute function public.invoice_total_changed();
create trigger invoice_items_changed after insert or update or delete on public.invoice_items
  for each row execute function public.invoice_items_changed();
create trigger payments_changed after insert or update or delete on public.payments
  for each row execute function public.payments_changed();

-- ─────────────────────────────────────────────────────────────
-- Views (respect RLS of the caller)
-- ─────────────────────────────────────────────────────────────

create view public.invoice_summary with (security_invoker = true) as
select
  i.*,
  c.name as client_name,
  c.email as client_email,
  c.type as client_type,
  coalesce(p.paid, 0)::numeric(10,2) as amount_paid,
  (i.total - coalesce(p.paid, 0))::numeric(10,2) as balance,
  case
    when i.status = 'sent' and i.due_date < public.today_bne() and i.total - coalesce(p.paid, 0) > 0 then 'overdue'
    else i.status::text
  end as display_status
from public.invoices i
join public.clients c on c.id = i.client_id
left join (select invoice_id, sum(amount) as paid from public.payments group by invoice_id) p on p.invoice_id = i.id;

create view public.job_summary with (security_invoker = true) as
select
  j.*,
  c.name as client_name,
  c.type as client_type,
  coalesce(e.total, 0)::numeric(10,2) as expenses_total,
  (j.price - coalesce(e.total, 0))::numeric(10,2) as profit
from public.jobs j
join public.clients c on c.id = j.client_id
left join (select job_id, sum(amount) as total from public.expenses where job_id is not null group by job_id) e on e.job_id = j.id;

-- ─────────────────────────────────────────────────────────────
-- Row level security: team members only
-- ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.activity_log enable row level security;
alter table public.settings enable row level security;
alter table public.clients enable row level security;
alter table public.jobs enable row level security;
alter table public.job_workers enable row level security;
alter table public.job_photos enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.partner_payouts enable row level security;
alter table public.quote_requests enable row level security;

create policy "team reads profiles" on public.profiles for select to authenticated using (public.is_team());
create policy "edit own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "team reads activity" on public.activity_log for select to authenticated using (public.is_team());

create policy "team reads settings" on public.settings for select to authenticated using (public.is_team());
create policy "team updates settings" on public.settings for update to authenticated using (public.is_team()) with check (public.is_team());

do $$
declare t text;
begin
  -- full access (including delete)
  foreach t in array array['clients', 'jobs', 'job_workers', 'job_photos', 'invoice_items', 'payments', 'expenses', 'partner_payouts', 'quote_requests'] loop
    execute format('create policy "team full access" on public.%I for all to authenticated using (public.is_team()) with check (public.is_team())', t);
  end loop;
end $$;

-- Invoices are never deleted (5-year record keeping) — void them instead.
create policy "team reads invoices" on public.invoices for select to authenticated using (public.is_team());
create policy "team creates invoices" on public.invoices for insert to authenticated with check (public.is_team());
create policy "team updates invoices" on public.invoices for update to authenticated using (public.is_team()) with check (public.is_team());

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ─────────────────────────────────────────────────────────────
-- Storage: private buckets for job photos and receipts
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('job-photos', 'job-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('receipts', 'receipts', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
on conflict (id) do nothing;

create policy "team reads files" on storage.objects for select to authenticated
  using (bucket_id in ('job-photos', 'receipts') and public.is_team());
create policy "team uploads files" on storage.objects for insert to authenticated
  with check (bucket_id in ('job-photos', 'receipts') and public.is_team());
create policy "team updates files" on storage.objects for update to authenticated
  using (bucket_id in ('job-photos', 'receipts') and public.is_team());
-- Job photos can be removed; receipts are kept (ATO: 5 years).
create policy "team deletes job photos" on storage.objects for delete to authenticated
  using (bucket_id = 'job-photos' and public.is_team());
