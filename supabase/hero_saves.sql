-- DRAKMOR 4.0: katra lietotāja saglabātais varonis
create table if not exists public.hero_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint hero_save_object check (jsonb_typeof(state) = 'object'),
  constraint hero_save_size check (octet_length(state::text) < 32768)
);
alter table public.hero_saves enable row level security;
grant select, insert, update on public.hero_saves to authenticated;
drop policy if exists "hero_saves_select_own" on public.hero_saves;
drop policy if exists "hero_saves_insert_own" on public.hero_saves;
drop policy if exists "hero_saves_update_own" on public.hero_saves;
create policy "hero_saves_select_own" on public.hero_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "hero_saves_insert_own" on public.hero_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "hero_saves_update_own" on public.hero_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Šī ir prototipa saglabāšana. Klients var modificēt state JSON;
-- pirms publiska TOP, PvP un ekonomikas serverim jāvalidē visas atlīdzības.
