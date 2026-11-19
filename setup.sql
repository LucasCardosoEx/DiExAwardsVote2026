-- =====================================================================
--  The Game Awards DiEx Edition — banco de dados
--  Cole tudo no Supabase → SQL Editor → Run (uma vez só)
-- =====================================================================

-- Perfis: nick e avatar vêm do Discord no login
create table if not exists public.perfis (
  id            uuid primary key references auth.users(id) on delete cascade,
  nick          text not null,
  avatar        text,
  atualizado_em timestamptz not null default now()
);

-- Votos: um por pessoa por categoria
create table if not exists public.votos (
  user_id    uuid not null references public.perfis(id) on delete cascade,
  categoria  text not null,
  indicado   text not null,
  votado_em  timestamptz not null default now(),
  primary key (user_id, categoria)
);

-- Segurança: todo mundo vê, cada um só mexe no que é seu
alter table public.perfis enable row level security;
alter table public.votos  enable row level security;

create policy "perfis visiveis"      on public.perfis for select using (true);
create policy "cria proprio perfil"  on public.perfis for insert to authenticated with check (auth.uid() = id);
create policy "edita proprio perfil" on public.perfis for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "votos visiveis"       on public.votos for select using (true);
create policy "vota por si"          on public.votos for insert to authenticated with check (auth.uid() = user_id);
create policy "muda proprio voto"    on public.votos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "remove proprio voto"  on public.votos for delete to authenticated using (auth.uid() = user_id);

grant select on public.perfis, public.votos to anon, authenticated;
grant insert, update on public.perfis to authenticated;
grant insert, update, delete on public.votos to authenticated;

-- Atualização em tempo real das bolinhas
alter publication supabase_realtime add table public.perfis, public.votos;
