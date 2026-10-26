-- Meu Treino — banco de dados (cole no SQL Editor do Supabase e clique em Run)

create table if not exists public.registros (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chave text not null,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, chave)
);

-- Cada usuário só enxerga e altera os próprios dados
alter table public.registros enable row level security;

drop policy if exists "ler os proprios" on public.registros;
drop policy if exists "inserir os proprios" on public.registros;
drop policy if exists "alterar os proprios" on public.registros;
drop policy if exists "apagar os proprios" on public.registros;

create policy "ler os proprios" on public.registros
  for select to authenticated using (auth.uid() = user_id);

create policy "inserir os proprios" on public.registros
  for insert to authenticated with check (auth.uid() = user_id);

create policy "alterar os proprios" on public.registros
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "apagar os proprios" on public.registros
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.registros to authenticated;
