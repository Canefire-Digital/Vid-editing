-- Website extras: Google profile links, insurance badge, hours,
-- public before/after gallery, and photos on website quote requests.
-- Run in Supabase → SQL Editor after 0002_planner.sql.

alter table public.settings
  add column google_profile_url text,
  add column google_review_url text,
  add column insured boolean not null default false,
  add column insurance_note text,
  add column business_hours text;

-- Only photos the team ticks "Show on website" ever appear publicly.
alter table public.job_photos
  add column show_on_website boolean not null default false;

alter table public.quote_requests
  add column photo_paths text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quote-photos', 'quote-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Customers' uploads go in through the server (secret key); only the team can view them.
create policy "team reads quote photos" on storage.objects for select to authenticated
  using (bucket_id = 'quote-photos' and public.is_team());
create policy "team deletes quote photos" on storage.objects for delete to authenticated
  using (bucket_id = 'quote-photos' and public.is_team());
