-- ============================================================
-- 新建 wb_meetings 表（会议/面试记录库），结构同其他业务表 + 收紧 RLS
-- 在 Supabase 后台 → SQL Editor → 先 Ctrl+A 删空 → 粘贴 → Run
-- ============================================================

-- 1) 建表：id 主键 + data jsonb（整条记录）+ updated_at
create table if not exists public.wb_meetings (
  id text primary key,
  data jsonb,
  updated_at timestamptz default now()
);

-- 2) 开 RLS
alter table public.wb_meetings enable row level security;

-- 3) 删旧策略（若有），重建为「仅已登录用户可读写」
do $$
declare p text;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='wb_meetings' loop
    execute format('drop policy if exists %I on public.wb_meetings;', p);
  end loop;
end $$;

create policy authenticated_all_wb_meetings on public.wb_meetings
  for all to authenticated using (true) with check (true);

-- 4) 验证：看到一行 roles={authenticated} 即成功
select tablename, policyname, roles, cmd
from pg_policies
where schemaname='public' and tablename='wb_meetings';
