-- ============================================================
-- 工作台 · 收紧 RLS（登录后才能读写）
-- 在 Supabase 后台 → 左侧 SQL Editor → 新建查询，整段粘贴运行。
-- 作用：把原来「anon 全开」改成「只有已登录用户（authenticated）能读写」。
-- 运行后，没登录的人调接口会被数据库拒（401/权限不足），网页上则卡在登录框。
-- ============================================================

do $$
declare
  t text;
  tables text[] := array['wb_recruitments','wb_offers','wb_events','wb_knowledge','wb_review'];
begin
  foreach t in array tables loop
    -- 确保 RLS 开着
    execute format('alter table public.%I enable row level security;', t);

    -- 删掉这张表上所有旧策略（含验证阶段 anon 全开的那些）
    execute (
      select coalesce(string_agg(format('drop policy if exists %I on public.%I;', policyname, t), ' '), '')
      from pg_policies where schemaname = 'public' and tablename = t
    );

    -- 新建策略：仅已登录用户（authenticated）可读写
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true);',
      'authenticated_all_' || t,
      t
    );
  end loop;
end $$;

-- 验证：列出每张表现在的策略，确认 roles 是 {authenticated}、没有 anon
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('wb_recruitments','wb_offers','wb_events','wb_knowledge','wb_review')
order by tablename, policyname;
