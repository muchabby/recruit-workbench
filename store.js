/* ===========================================================
   数据仓库层 store.js
   目的：把数据读写收口到一个可替换的适配器后面。
   现在跑 LocalStorageAdapter（数据在本机浏览器），
   等腾讯云 CloudBase 就绪，只需实现 CloudBaseAdapter 并切换，
   业务代码（app.js）一行不用动。

   设计要点：
   - store 内部持有一份缓存（cache），各集合是数组（review 是单例对象）。
   - app.js 的 state.* 直接引用 cache 的同一个数组 → 渲染读取保持同步、零改动。
   - 写入按「单条记录」粒度：save(collection, record) / remove(collection, id)。
     这样多人同时改不同记录不会互相覆盖（关键：避免整组 last-writer-wins 冲突）。
   - replaceAll 只给导入/清空用。
   - 缓存改动是同步的（就地增删改，保持数组引用不变）；落盘是异步的，
     失败走 onError 回调（app.js 注册成 toast）。
   =========================================================== */
(function (global) {
  'use strict';

  // 业务集合定义：name 是逻辑集合名，key 是 localStorage 键，kind 区分数组/单例
  const COLLECTIONS = [
    { name: 'recruitments', key: 'workbench.recruitments.v4', kind: 'list' },
    { name: 'offers',       key: 'workbench.offers.v2',       kind: 'list' },
    { name: 'events',       key: 'workbench.events.v1',       kind: 'list' },
    { name: 'knowledge',    key: 'workbench.knowledge.v1',    kind: 'list' },
    { name: 'review',       key: 'workbench.review.v1',       kind: 'single' }
  ];
  const byName = Object.fromEntries(COLLECTIONS.map((c) => [c.name, c]));
  const cloneVal = (v) => JSON.parse(JSON.stringify(v));

  // ---------- 适配器：LocalStorage（当前默认） ----------
  // 接口约定（CloudBase 适配器照此实现即可）：
  //   loadOne(col)                       -> 读整个集合（list 返回数组 / single 返回对象或 null）
  //   persistList(col, fullArray, change)-> 落盘一个 list 集合
  //   persistSingle(col, value)          -> 落盘一个单例集合
  //   change = { op:'save'|'remove', record?, id? } 给远端做单条 upsert/delete 用，
  //            LocalStorage 用不到（它整组写），CloudBase 会用到。
  function LocalStorageAdapter(seed) {
    const read = (key, fallback) => {
      try { return JSON.parse(global.localStorage.getItem(key) || 'null') ?? cloneVal(fallback); }
      catch { return cloneVal(fallback); }
    };
    return {
      name: 'local',
      async loadOne(col) {
        // 种子兜底只在本地适配器里：键不存在时回填示例数据
        const fallback = col.kind === 'list' ? (seed[col.name] || []) : (seed[col.name] || null);
        return read(col.key, fallback);
      },
      async persistList(col, fullArray /*, change */) {
        global.localStorage.setItem(col.key, JSON.stringify(fullArray));
      },
      async persistSingle(col, value) {
        global.localStorage.setItem(col.key, JSON.stringify(value));
      },
      async clearOne(col) {
        global.localStorage.removeItem(col.key);
      }
    };
  }

  // ---------- 适配器：CloudBase（待接入的空壳） ----------
  // 接入步骤（等账号/SDK就绪）：
  //   1. 引入 CloudBase JS SDK，app.init({ env }) 拿到 db。
  //   2. 每个集合对应一个 db.collection(col.name)。
  //   3. loadOne：list 用 .get() 取全部 doc；single 取固定 doc（如 _id='current'）。
  //   4. persistList 用 change：op==='save' 时 collection.doc(record.id).set(record)（upsert 单条）；
  //      op==='remove' 时 collection.doc(id).remove()。——不要整组覆盖，避免冲突。
  //   5. persistSingle：collection.doc('current').set(value)。
  //   6. 登录：用飞书免登换 CloudBase 自定义登录票据，登录态拿不到就抛错（onError 提示重登）。
  function CloudBaseAdapter(/* config */) {
    const notReady = () => { throw new Error('CloudBase 适配器尚未接入，请先完成账号与登录配置'); };
    return {
      name: 'cloudbase',
      async loadOne() { notReady(); },
      async persistList() { notReady(); },
      async persistSingle() { notReady(); },
      async clearOne() { notReady(); }
    };
  }

  // ---------- 适配器：Supabase（沿用雷达站那套：REST + publishable key + RLS） ----------
  // 表结构（每集合一张表，统一 schema）：id text 主键 / data jsonb 整条记录 / updated_at。
  // 按记录读写：save→单条 upsert，remove→单条 delete，replaceAll→清表后批量插（仅导入/清空用）。
  // 单例 review 存固定一行 id='current'。
  // config: { url, key }  url 形如 https://xxxx.supabase.co；key 用 publishable（sb_publishable_ 开头，可公开放前端，靠 RLS 兜）。
  // ⚠️ 验证阶段 RLS anon 读写全开 = 谁拿到页面就能读写。正式录真实信息前必须收紧 RLS + 配合登录。
  function SupabaseAdapter(config, fetchImpl) {
    const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
    if (!f) throw new Error('当前环境没有 fetch');
    const base = `${String(config.url).replace(/\/$/, '')}/rest/v1`;
    const key = config.key;
    // apikey 头始终用 publishable key（PostgREST 用它路由项目）；
    // Authorization 头每次请求动态取：登录后是用户 JWT（数据库识别为 authenticated），
    // 未登录回退 publishable key（收紧 RLS 后会被数据库拒，正是我们要的）。
    // config.getToken 由 app.js 接 WorkbenchAuth.getToken 注入；没传则退化为旧行为（用 key）。
    const getToken = (typeof config.getToken === 'function') ? config.getToken : () => key;
    const headers = () => ({
      apikey: key,
      Authorization: `Bearer ${getToken() || key}`,
      'Content-Type': 'application/json'
    });
    const table = (col) => `wb_${col.name}`;
    const SINGLE_ID = 'current';

    const req = async (url, opts, what) => {
      const res = await f(url, opts);
      if (!res.ok) {
        let detail = '';
        try { detail = await res.text(); } catch { /* ignore */ }
        throw new Error(`${what} 失败：${res.status} ${detail.slice(0, 120)}`);
      }
      return res;
    };
    const upsert = (col, rows) => req(
      `${base}/${table(col)}?on_conflict=id`,
      { method: 'POST', headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) },
      `写入 ${col.name}`
    );

    return {
      name: 'supabase',
      async loadOne(col) {
        if (col.kind === 'single') {
          const res = await req(`${base}/${table(col)}?id=eq.${SINGLE_ID}&select=data`, { headers: headers() }, `加载 ${col.name}`);
          const rows = await res.json();
          return rows[0]?.data ?? null;
        }
        const res = await req(`${base}/${table(col)}?select=data`, { headers: headers() }, `加载 ${col.name}`);
        const rows = await res.json();
        return rows.map((r) => r.data);
      },
      async persistList(col, fullArray, change) {
        const c = change || {};
        if (c.op === 'remove') {
          await req(`${base}/${table(col)}?id=eq.${encodeURIComponent(c.id)}`, { method: 'DELETE', headers: headers() }, `删除 ${col.name}`);
          return;
        }
        if (c.op === 'replaceAll') {
          // 清表（id 非空即全部）再批量插入
          await req(`${base}/${table(col)}?id=not.is.null`, { method: 'DELETE', headers: headers() }, `清空 ${col.name}`);
          if (fullArray.length) await upsert(col, fullArray.map((r) => ({ id: r.id, data: r })));
          return;
        }
        // 默认按单条 upsert（op==='save'）
        await upsert(col, [{ id: c.record.id, data: c.record }]);
      },
      async persistSingle(col, value) {
        await upsert(col, [{ id: SINGLE_ID, data: value }]);
      },
      async clearOne(col) {
        await req(`${base}/${table(col)}?id=not.is.null`, { method: 'DELETE', headers: headers() }, `清空 ${col.name}`);
      }
    };
  }

  // ---------- 仓库主体 ----------
  function createWorkbenchStore({ adapter, seed } = {}) {
    const seedData = seed || {};
    const useAdapter = adapter || LocalStorageAdapter(seedData);
    const cache = {}; // { recruitments:[], offers:[], ..., review:{} }
    let onError = () => {};

    // 落盘失败统一入口：不打断用户操作（缓存已改），仅提示
    const fireSave = (promise, ctx) => {
      Promise.resolve(promise).catch((err) => {
        try { onError(err, ctx); } catch { /* 忽略回调自身异常 */ }
      });
    };

    return {
      COLLECTIONS,
      adapterName: useAdapter.name,
      onError(fn) { if (typeof fn === 'function') onError = fn; },

      // 启动时拉全部集合进缓存。返回缓存引用，app.js 把 state.* 指过去。
      async loadAll() {
        for (const col of COLLECTIONS) {
          const data = await useAdapter.loadOne(col);
          if (col.kind === 'list') cache[col.name] = Array.isArray(data) ? data : [];
          else cache[col.name] = data || null;
        }
        return cache;
      },

      // 取某集合的缓存引用（app.js 用来把 state 指向同一数组，保持同步）
      get(name) { return cache[name]; },

      // 单条 upsert（按 id）。同步改缓存就地保持数组引用，再异步落盘。
      save(name, record) {
        const col = byName[name];
        if (!col) throw new Error(`未知集合：${name}`);
        if (col.kind === 'single') {
          cache[name] = record;
          fireSave(useAdapter.persistSingle(col, record), { name, op: 'save' });
          return record;
        }
        const list = cache[name] || (cache[name] = []);
        const idx = list.findIndex((r) => r && r.id === record.id);
        if (idx >= 0) list[idx] = record;        // 就地替换，保持数组引用
        else list.unshift(record);               // 新增置顶
        fireSave(useAdapter.persistList(col, list, { op: 'save', record }), { name, op: 'save', id: record.id });
        return record;
      },

      // 删单条（按 id）。就地删，保持数组引用。
      remove(name, id) {
        const col = byName[name];
        if (!col || col.kind !== 'list') throw new Error(`集合不支持删单条：${name}`);
        const list = cache[name] || (cache[name] = []);
        const idx = list.findIndex((r) => r && r.id === id);
        if (idx >= 0) list.splice(idx, 1);       // splice 就地删，引用不变
        fireSave(useAdapter.persistList(col, list, { op: 'remove', id }), { name, op: 'remove', id });
      },

      // 批量替换整个集合：仅供导入/清空。会换掉数组引用，调用方需重新把 state 指过来。
      replaceAll(name, value) {
        const col = byName[name];
        if (!col) throw new Error(`未知集合：${name}`);
        if (col.kind === 'single') {
          cache[name] = value;
          fireSave(useAdapter.persistSingle(col, value), { name, op: 'replaceAll' });
        } else {
          cache[name] = Array.isArray(value) ? value : [];
          fireSave(useAdapter.persistList(col, cache[name], { op: 'replaceAll' }), { name, op: 'replaceAll' });
        }
        return cache[name];
      }
    };
  }

  // 暴露给 app.js（浏览器全局）与测试（CommonJS）
  global.createWorkbenchStore = createWorkbenchStore;
  global.WorkbenchStoreAdapters = { LocalStorageAdapter, CloudBaseAdapter, SupabaseAdapter };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createWorkbenchStore, LocalStorageAdapter, CloudBaseAdapter, SupabaseAdapter, COLLECTIONS };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
