-- =====================================================================
--  OPCIONAL — trava o prazo da votação também no banco
--
--  O site já fecha a votação sozinho às 21h de 10/12 (js/config.js).
--  Este script faz o Supabase recusar votos depois do prazo, mesmo que
--  alguém tente votar por fora do site.
--
--  Cole no Supabase → SQL Editor → Run (uma vez só).
--  Para mudar o prazo depois, troque a data nas três regras e rode de novo.
-- =====================================================================

drop policy if exists "vota por si"         on public.votos;
drop policy if exists "muda proprio voto"   on public.votos;
drop policy if exists "remove proprio voto" on public.votos;

create policy "vota por si" on public.votos
  for insert to authenticated
  with check (auth.uid() = user_id and now() < '2026-12-10 21:00:00-03');

create policy "muda proprio voto" on public.votos
  for update to authenticated
  using (auth.uid() = user_id and now() < '2026-12-10 21:00:00-03')
  with check (auth.uid() = user_id and now() < '2026-12-10 21:00:00-03');

create policy "remove proprio voto" on public.votos
  for delete to authenticated
  using (auth.uid() = user_id and now() < '2026-12-10 21:00:00-03');
