-- ブラウザから読み書きできないときは SQL Editor で実行
-- RLS が有効でポリシーがない場合に使う

alter table public.questions enable row level security;

create policy "Allow public read"
  on public.questions for select
  using (true);

create policy "Allow public insert"
  on public.questions for insert
  with check (true);

create policy "Allow public delete"
  on public.questions for delete
  using (true);

create policy "Allow public update"
  on public.questions for update
  using (true)
  with check (true);
