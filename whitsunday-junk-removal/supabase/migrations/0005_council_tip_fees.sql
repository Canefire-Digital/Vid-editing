-- Price calculator: council tip fees by material + per-item fees, and the big-tip discount.
-- Whitsunday Regional Council 2025-26 commercial fees (inc GST and waste levy).
-- Run in Supabase → SQL Editor after 0004_trailer_and_tip_fees.sql.

alter table public.settings
  add column if not exists tip_rates jsonb not null default
    '{"general": 400, "construction": 400, "green": 75, "stumps": 122, "concrete": 70, "metal": 0, "ewaste": 0}'::jsonb,
  add column if not exists tip_each_fees jsonb not null default
    '{"mattress": 54, "fridge": 13, "aircon": 16, "tyre": 12, "tyre_rim": 29, "tyre_4wd": 21, "tyre_4wd_rim": 52}'::jsonb,
  -- When the job's tip fees are over the threshold, the discount comes off the load price
  add column if not exists tip_discount_threshold numeric(8,2) not null default 100,
  add column if not exists tip_discount numeric(8,2) not null default 50;

-- Replaced by the per-material rates above
alter table public.settings
  drop column if exists tip_rate_per_tonne,
  drop column if exists tip_included_kg_full_load,
  drop column if exists tip_item_fees;
