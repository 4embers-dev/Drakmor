-- Drakmor 5.0: server-authoritative catalog read API.
-- Safe additive migration: does not delete or rewrite player or inventory data.
-- Run in Supabase SQL Editor AFTER existing supabase/drakmor_shop.sql.
create or replace function public.drakmor_shop_catalog()
returns table(category text, name text, level integer, bonus integer, price integer, icon text, purchasable boolean)
language sql stable security definer
set search_path = ''
as $$
  select 'Ieroči'::text, w.name::text, w.level, w.bonus, w.price,
         case when lower(w.name) like '%cirv%' or lower(w.name) like '%kapātāj%' then '🪓'
              when lower(w.name) like '%dunc%' then '🗡️'
              else '⚔️' end::text, true
  from public.drakmor_weapons as w
  where auth.uid() is not null
  order by w.level, w.name;
$$;
revoke all on function public.drakmor_shop_catalog() from public, anon;
grant execute on function public.drakmor_shop_catalog() to authenticated;
