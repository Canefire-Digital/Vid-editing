-- Run AFTER creating the three logins in Supabase → Authentication → Users → "Add user"
-- (tick "Auto Confirm User"). Replace each email with the one you used for that person,
-- then run this in the SQL Editor. It links each login to the business.

select public.add_team_member('ALEX_LOGIN_EMAIL', 'Alex');
select public.add_team_member('LUCAS_LOGIN_EMAIL', 'Lucas');
select public.add_team_member('KOBI_LOGIN_EMAIL', 'Kobi');
