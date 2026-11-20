-- =====================================================================
--  PAINEL DO ADMIN — rode uma vez no Supabase → SQL Editor → Run
--
--  ANTES de rodar: entre no site pelo menos uma vez com a conta ArthasEx
--  (o script usa o seu perfil para saber quem é o admin).
--
--  Cria:
--   - admins:     quem pode abrir o painel e mudar as coisas
--   - controle:   votação aberta/encerrada + prazo (botões do painel)
--   - vencedores: o vencedor de cada categoria
--  E troca as regras dos votos para respeitar o "controle".
--  Se você rodou o prazo.sql antes, este script substitui ele.
--
--  Pode rodar de novo sempre que eu mandar uma versão nova:
--  não apaga votos, vencedores nem o estado da votação.
-- =====================================================================

-- ---------- Tabelas ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.controle (
  id             int primary key default 1 check (id = 1),
  votacao_aberta boolean not null default true,
  encerra_em     timestamptz default '2026-12-10 21:00:00-03'
);
insert into public.controle (id) values (1) on conflict (id) do nothing;

create table if not exists public.vencedores (
  categoria   text primary key,
  indicado    text not null,
  definido_em timestamptz not null default now()
);

-- ---------- Funções de apoio ----------
create or replace function public.eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.votacao_liberada() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select votacao_aberta and (encerra_em is null or now() < encerra_em)
       from public.controle where id = 1),
    true);
$$;

grant execute on function public.eh_admin(), public.votacao_liberada() to anon, authenticated;

-- ---------- Segurança ----------
alter table public.admins     enable row level security;
alter table public.controle   enable row level security;
alter table public.vencedores enable row level security;

drop policy if exists "ve se e admin"        on public.admins;
drop policy if exists "controle visivel"     on public.controle;
drop policy if exists "admin muda controle"  on public.controle;
drop policy if exists "vencedores visiveis"  on public.vencedores;
drop policy if exists "admin cria vencedor"  on public.vencedores;
drop policy if exists "admin muda vencedor"  on public.vencedores;
drop policy if exists "admin tira vencedor"  on public.vencedores;

create policy "ve se e admin"       on public.admins     for select to authenticated using (auth.uid() = user_id);
create policy "controle visivel"    on public.controle   for select using (true);
create policy "admin muda controle" on public.controle   for update to authenticated using (public.eh_admin()) with check (public.eh_admin());
-- vencedores só aparecem para todos depois que a votação encerra (o admin vê sempre)
create policy "vencedores visiveis" on public.vencedores for select
  using (public.eh_admin() or not public.votacao_liberada());
create policy "admin cria vencedor" on public.vencedores for insert to authenticated with check (public.eh_admin());
create policy "admin muda vencedor" on public.vencedores for update to authenticated using (public.eh_admin()) with check (public.eh_admin());
create policy "admin tira vencedor" on public.vencedores for delete to authenticated using (public.eh_admin());

grant select on public.admins to authenticated;
grant select on public.controle, public.vencedores to anon, authenticated;
grant update on public.controle to authenticated;
grant insert, update, delete on public.vencedores to authenticated;

-- ---------- Votos respeitam o painel (encerrar / reabrir / prazo) ----------
drop policy if exists "vota por si"         on public.votos;
drop policy if exists "muda proprio voto"   on public.votos;
drop policy if exists "remove proprio voto" on public.votos;

create policy "vota por si" on public.votos for insert to authenticated
  with check (auth.uid() = user_id and public.votacao_liberada());
create policy "muda proprio voto" on public.votos for update to authenticated
  using (auth.uid() = user_id and public.votacao_liberada())
  with check (auth.uid() = user_id and public.votacao_liberada());
create policy "remove proprio voto" on public.votos for delete to authenticated
  using (auth.uid() = user_id and public.votacao_liberada());

-- ---------- Tempo real ----------
do $$ begin
  alter publication supabase_realtime add table public.controle;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.vencedores;
exception when duplicate_object then null; end $$;

-- ---------- Você como admin ----------
insert into public.admins (user_id)
select id from public.perfis where lower(nick) = 'arthasex'
on conflict do nothing;

-- Confira: deve aparecer UMA linha, com o seu nick.
select a.user_id, p.nick from public.admins a join public.perfis p on p.id = a.user_id;
