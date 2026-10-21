-- Planner: start times and trailer space for each job.
-- Run in Supabase → SQL Editor after 0001_init.sql.

alter table public.jobs
  add column start_time time,
  -- Share of one trailer load (1 = full trailer). Only needed for custom-price jobs;
  -- preset load sizes use ¼ / ½ / ¾ / 1 automatically.
  add column load_fraction numeric(4,2) check (load_fraction is null or (load_fraction > 0 and load_fraction <= 10));

-- j.* is expanded when a view is created, so rebuild it to pick up the new columns.
drop view public.job_summary;
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

grant select on public.job_summary to authenticated;
