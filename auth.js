/* ===========================================================
   登录模块 auth.js（路线 A：Supabase 邮箱登录 + 邀请制）
   目的：
   - 没登录就连数据接口都调不动（配合收紧后的 RLS：anon 被数据库直接拒）。
   - 登录后把用户的 JWT 提供给 store.js 的 Supabase 适配器，
     适配器每次请求用这个 token 当 Authorization，数据库识别为 authenticated 角色。

   对外暴露 window.WorkbenchAuth：
     configure({ url, key })  -> 用 app.js 里的同一份 Supabase 配置创建客户端
     requireLogin()           -> 启动闸门：有会话直接过；没会话弹登录框，登录成功后才 resolve
     getToken()               -> 返回当前用户 access_token，没登录则回退 publishable key（同步，给适配器用）
     getUser()                -> 返回当前登录用户（email 等），未登录返回 null
     signOut()                -> 登出并刷新页面（清掉内存里的数据）
     isEnabled()              -> 是否已配置（本机模式没配则返回 false，不拦截）

   依赖：index.html 先引入 @supabase/supabase-js（提供全局 window.supabase）。
   =========================================================== */
(function (global) {
  'use strict';

  let client = null;          // supabase-js 客户端，仅用于 auth
  let publishableKey = null;  // 未登录时的回退 key（apikey 头始终要有合法 key）
  let currentSession = null;  // 当前会话缓存（含 access_token），随 onAuthStateChange 更新
  let pendingResolve = null;  // requireLogin 的等待回调：登录成功后调用放行

  const $ = (sel) => document.querySelector(sel);

  // ---------- 登录遮罩 UI 控制 ----------
  function showOverlay() {
    const el = $('#loginOverlay');
    if (el) el.classList.add('show');
    const email = $('#loginEmail');
    if (email) setTimeout(() => email.focus(), 50);
  }
  function hideOverlay() {
    const el = $('#loginOverlay');
    if (el) el.classList.remove('show');
  }
  function setError(msg) {
    const el = $('#loginError');
    if (el) el.textContent = msg || '';
  }
  function setBusy(busy) {
    const btn = $('#loginSubmit');
    if (btn) {
      btn.disabled = busy;
      btn.textContent = busy ? '登录中…' : '登录';
    }
  }

  // 把 Supabase 错误转成中文人话
  function humanizeAuthError(err) {
    const m = (err && err.message) || '';
    if (/Invalid login credentials/i.test(m)) return '邮箱或密码不对，请重试。';
    if (/Email not confirmed/i.test(m)) return '该邮箱尚未确认，请联系管理员激活。';
    if (/network|fetch/i.test(m)) return '网络异常，请检查连接后重试。';
    return m || '登录失败，请重试。';
  }

  async function doSignIn() {
    if (!client) return;
    const email = ($('#loginEmail') && $('#loginEmail').value || '').trim();
    const password = ($('#loginPassword') && $('#loginPassword').value) || '';
    if (!email || !password) { setError('请输入邮箱和密码。'); return; }
    setError('');
    setBusy(true);
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) { setError(humanizeAuthError(error)); setBusy(false); return; }
      // 成功后 onAuthStateChange 会触发 SIGNED_IN → 更新会话、隐藏遮罩、放行
    } catch (err) {
      setError(humanizeAuthError(err));
      setBusy(false);
    }
  }

  function wireOverlayEvents() {
    const btn = $('#loginSubmit');
    if (btn) btn.addEventListener('click', doSignIn);
    const pw = $('#loginPassword');
    if (pw) pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSignIn(); });
    const email = $('#loginEmail');
    if (email) email.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const p = $('#loginPassword'); if (p) p.focus(); } });
  }

  const WorkbenchAuth = {
    // app.js 传入与数据适配器同一份 { url, key }
    configure(config) {
      if (!config || !config.url || !config.key) return; // 本机模式：不配，不拦截
      if (!global.supabase || !global.supabase.createClient) {
        console.error('未加载 @supabase/supabase-js，登录不可用');
        return;
      }
      publishableKey = config.key;
      client = global.supabase.createClient(config.url, config.key, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'workbench.auth' }
      });
      // 会话变化（登录/登出/token 自动刷新）统一在这里更新缓存
      client.auth.onAuthStateChange((event, session) => {
        currentSession = session || null;
        if (event === 'SIGNED_IN' && currentSession) {
          setBusy(false);
          hideOverlay();
          if (pendingResolve) { const r = pendingResolve; pendingResolve = null; r(); }
        }
        if (event === 'SIGNED_OUT') {
          currentSession = null;
        }
      });
    },

    isEnabled() { return !!client; },

    // 启动闸门：本机模式直接过；云端模式必须有会话才放行
    async requireLogin() {
      if (!client) return; // 没配 Supabase = 本机模式，不拦
      wireOverlayEvents();
      const { data } = await client.auth.getSession();
      currentSession = data && data.session ? data.session : null;
      if (currentSession) { hideOverlay(); return; }
      showOverlay();
      await new Promise((resolve) => { pendingResolve = resolve; });
    },

    // 适配器每次请求都调它拿当前 token；登录后是用户 JWT，未登录回退 publishable key
    getToken() {
      return (currentSession && currentSession.access_token) || publishableKey;
    },

    getUser() {
      return (currentSession && currentSession.user) || null;
    },

    async signOut() {
      if (!client) return;
      try { await client.auth.signOut(); } catch (e) { /* 忽略：无论如何都刷新 */ }
      // 刷新页面，清掉内存里已加载的数据，回到登录闸门
      global.location.reload();
    }
  };

  global.WorkbenchAuth = WorkbenchAuth;
})(typeof globalThis !== 'undefined' ? globalThis : this);
