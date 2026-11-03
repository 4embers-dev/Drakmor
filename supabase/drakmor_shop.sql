-- Run once in Supabase SQL Editor for Drakmor.
create table if not exists public.drakmor_players (
 user_id uuid primary key references auth.users(id) on delete cascade,
 gold integer not null default 100 check(gold>=0),
 level integer not null default 1 check(level>=1),
 equipped_weapon text,
 created_at timestamptz not null default now()
);
create table if not exists public.drakmor_inventory (
 user_id uuid not null references auth.users(id) on delete cascade,
 weapon_name text not null,
 acquired_at timestamptz not null default now(),
 primary key(user_id,weapon_name)
);
create table if not exists public.drakmor_weapons (
 name text primary key,
 level integer not null,
 bonus integer not null,
 price integer not null
);
insert into public.drakmor_weapons(name,level,bonus,price) values
('Koka zobens',1,1,50),('Dzelzs zobens',2,2,80),('Karavīra zobens',3,4,120),
('Stiprais zobens',4,6,170),('Tērauda zobens',5,8,250),('Kaujas cirvis',6,10,320),
('Divroču zobens',7,12,400),('Karaliskais asmens',8,14,500),('Sarga cirvis',9,16,620),
('Elites zobens',10,18,750),('Ēnu duncis',11,20,900),('Vilka asmens',12,22,1100),
('Kara kapātājs',13,24,1350),('Drakona zobens',14,26,1600),('Sātana cirvis',15,28,1900),
('Gaismas asmens',16,30,2300),('Ledus zobens',17,32,2800),('Vētras cirvis',18,34,3400),
('Leģionāra zobens',19,36,4000),('Drakmora asmens',20,40,5000)
on conflict(name) do update set level=excluded.level,bonus=excluded.bonus,price=excluded.price;
alter table public.drakmor_players enable row level security;
alter table public.drakmor_inventory enable row level security;
alter table public.drakmor_weapons enable row level security;
revoke all on public.drakmor_players,public.drakmor_inventory,public.drakmor_weapons from anon,authenticated;
create or replace function public.drakmor_shop_state() returns jsonb
language plpgsql security definer set search_path=public as $$
declare p public.drakmor_players%rowtype; items jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.drakmor_players(user_id) values(auth.uid()) on conflict do nothing;
 select * into p from public.drakmor_players where user_id=auth.uid();
 select coalesce(jsonb_agg(weapon_name),'[]'::jsonb) into items from public.drakmor_inventory where user_id=auth.uid();
 return jsonb_build_object('gold',p.gold,'level',p.level,'equipped',p.equipped_weapon,'owned',items);
end $$;
create or replace function public.drakmor_buy_weapon(weapon_name text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare p public.drakmor_players%rowtype; w public.drakmor_weapons%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.drakmor_players(user_id) values(auth.uid()) on conflict do nothing;
 select * into p from public.drakmor_players where user_id=auth.uid() for update;
 select * into w from public.drakmor_weapons where name=weapon_name;
 if not found then return jsonb_build_object('ok',false,'message','Ierocis nav atrasts.'); end if;
 if exists(select 1 from public.drakmor_inventory where user_id=auth.uid() and drakmor_inventory.weapon_name=w.name) then
 return jsonb_build_object('ok',false,'message','Šis ierocis jau pieder tev.'); end if;
 if p.level<w.level then return jsonb_build_object('ok',false,'message','Nepietiekams līmenis.'); end if;
 if p.gold<w.price then return jsonb_build_object('ok',false,'message','Nepietiek zelta.'); end if;
 update public.drakmor_players set gold=gold-w.price where user_id=auth.uid();
 insert into public.drakmor_inventory(user_id,weapon_name) values(auth.uid(),w.name);
 return jsonb_build_object('ok',true,'message','Ierocis nopirkts!');
end $$;
create or replace function public.drakmor_equip_weapon(weapon_name text) returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.drakmor_inventory where user_id=auth.uid() and drakmor_inventory.weapon_name=drakmor_equip_weapon.weapon_name) then
 return jsonb_build_object('ok',false,'message','Ierocis nav tavā inventārā.'); end if;
 update public.drakmor_players set equipped_weapon=drakmor_equip_weapon.weapon_name where user_id=auth.uid();
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.drakmor_shop_state(),public.drakmor_buy_weapon(text),public.drakmor_equip_weapon(text) from public,anon;
grant execute on function public.drakmor_shop_state(),public.drakmor_buy_weapon(text),public.drakmor_equip_weapon(text) to authenticated;
