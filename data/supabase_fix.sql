-- 登録・削除ができないときに Supabase SQL Editor で実行
-- 「Run」を1回押すだけ

-- RLS を無効化（初学者向け・いちばん確実）
alter table public.questions disable row level security;

-- anon ロールに権限付与
grant select, insert, update, delete on public.questions to anon;
grant select, insert, update, delete on public.questions to authenticated;
