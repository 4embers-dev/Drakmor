-- Drakmor: palaid Supabase SQL Editor vienu reizi.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  hero_name text not null default 'Ceļinieks' check (char_length(hero_name) between 1 and 24),
  level integer not null default 1 check (level between 1 and 1000),
  xp integer not null default 0 check (xp >= 0),
  gold integer not null default 25 check (gold >= 0),
  wins integer not null default 0 check (wins >= 0),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Piezīme: šī ir kontu demonstrācijas shēma. Drošai publiskai RPG
-- zelta, XP un uzvaru izmaiņas jāpārceļ uz servera funkcijām,
-- jo klienta rakstīšanas tiesības ļautu krāpties.
