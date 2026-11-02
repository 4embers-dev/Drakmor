-- DRAKMOR TOP 100: atgriež tikai publiskos varoņa rādītājus, nevis pilnu saglabāto state.
-- Palaist Supabase SQL Editor. Pagaidām prototips: state ir klienta kontrolēts.
create or replace function public.drakmor_leaderboard(ranking text default 'level')
returns table(hero_name text, hero_level integer, hero_wins integer, hero_gold integer)
language sql stable security definer set search_path = ''
as $$
  select
    left(coalesce(nullif(trim(h.state->>'name'), ''), 'Ceļinieks'), 32) as hero_name,
    least(9999, greatest(1, case when (h.state->>'level') ~ '^[0-9]{1,8}$' then (h.state->>'level')::integer else 1 end)) as hero_level,
    least(999999999, greatest(0, case when (h.state->>'wins') ~ '^[0-9]{1,9}$' then (h.state->>'wins')::integer else 0 end)) as hero_wins,
    least(999999999, greatest(0, case when (h.state->>'gold') ~ '^[0-9]{1,9}$' then (h.state->>'gold')::integer else 0 end)) as hero_gold
  from public.hero_saves h
  order by
    case when ranking = 'wins' then (case when (h.state->>'wins') ~ '^[0-9]{1,9}$' then (h.state->>'wins')::integer else 0 end) end desc nulls last,
    case when ranking = 'gold' then (case when (h.state->>'gold') ~ '^[0-9]{1,9}$' then (h.state->>'gold')::integer else 0 end) end desc nulls last,
    case when ranking not in ('wins','gold') then (case when (h.state->>'level') ~ '^[0-9]{1,8}$' then (h.state->>'level')::integer else 1 end) end desc nulls last,
    (case when (h.state->>'wins') ~ '^[0-9]{1,9}$' then (h.state->>'wins')::integer else 0 end) desc
  limit 100;
$$;
revoke all on function public.drakmor_leaderboard(text) from public, anon;
grant execute on function public.drakmor_leaderboard(text) to authenticated;
