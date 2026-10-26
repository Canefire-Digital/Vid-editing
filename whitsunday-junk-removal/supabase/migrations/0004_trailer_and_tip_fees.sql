-- Trailer dimensions + tip fees for the website price calculator.
-- Run in Supabase → SQL Editor after 0003_site_extras.sql.

alter table public.settings
  -- 12 × 6 ft cage trailer, loaded to 1.2 m ≈ 8.0 m³
  add column trailer_length_m numeric(5,2) not null default 3.66,
  add column trailer_width_m numeric(5,2) not null default 1.83,
  add column trailer_height_m numeric(5,2) not null default 1.2,
  add column trailer_atm_kg int not null default 2000,
  -- From the compliance plate. Payload = ATM − tare.
  add column trailer_tare_kg int,
  -- Council commercial rate ($ per tonne over the weighbridge)
  add column tip_rate_per_tonne numeric(8,2),
  -- Tip weight already covered by the full-load price; anything heavier is charged at the tip rate
  add column tip_included_kg_full_load int,
  -- Per-item council fees, e.g. {"mattress": 25, "tyre": 10}. Missing = "confirmed on quote".
  add column tip_item_fees jsonb not null default '{}'::jsonb;
