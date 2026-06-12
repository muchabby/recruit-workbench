// 业务集合的存储键已收口到 store.js（COLLECTIONS）。app.js 不再直接碰它们的 localStorage。
const PREFS_STORAGE_KEY = 'workbench.prefs.v1'; // 筛选/视图等界面偏好（个人 UI 状态，始终本地）
const LAST_EXPORT_KEY = 'workbench.lastExport.v1'; // 上次导出备份的时间戳（始终本地）

const defaultData = {
  recruitments: [
    { id: 'job-1', requestTime: '2026-04-01', department: '吉比特', title: '法务专员（投融资及产品运营方向）', salaryRange: '待补充', priority: 'P1', businessContact: '周媛媛', profile: '法学专业，本科及以上；通过法考；3年以上法律工作经验。', jd: '投融资业务合规支持、产品运营业务合规支持，以及部门交办的日常法务工作。', reason: '支持投融资与产品运营的合规管理。', notes: '持续招聘。', process: ['简历筛选', '一面', '二面', '终面'], candidates: [] },
    { id: 'job-2', requestTime: '2026-03-25', department: '吉比特', title: '游戏合规专员', salaryRange: '待补充', priority: 'P2', businessContact: '曾晓莹', profile: '熟悉游戏合规、版号与监管要求。', jd: '负责版号申报、游戏内容合规、生态治理、监管政策跟进以及行业协会联络等。', reason: '加强游戏合规和内容审核能力。', notes: '持续招聘。', process: ['简历筛选', '一面', '二面'], candidates: [] },
    { id: 'job-3', requestTime: '2026-03-02', department: '吉比特研究院', title: 'AI应用开发工程师', salaryRange: '待补充', priority: 'P0', businessContact: '梁钰莹', profile: 'Python / TypeScript，熟悉 Web 开发、API、系统集成。', jd: '负责内部工具及业务系统开发维护，推进 AI 在日常开发流程中的落地。', reason: '补充 AI 应用开发与底层算法能力。', notes: '重点推进 AI 基础算法应用。', process: ['简历筛选', '技术面', '业务面', '终面'], candidates: [] }
  ],
  events: [
    { id: 'evt-1', title: '综合项目推进', category: '项目推进', status: '进行中', nextAction: '确认嘉宾名单', blocker: '嘉宾档期未确认', deadline: '', risk: 'danger', owner: '张三', description: '项目推进中，嘉宾档期是主要卡点。', subtasks: [{ id: 'st-1', text: '确定嘉宾名单', done: false }, { id: 'st-2', text: '场地预定', done: true }] },
    { id: 'evt-2', title: 'OA 系统更新', category: '系统更新', status: '进行中', nextAction: '等待接口确认', blocker: '跨团队接口未回', deadline: '', risk: 'warn', owner: '李四', description: '系统更新依赖外部接口确认。', subtasks: [{ id: 'st-3', text: '需求评审', done: true }, { id: 'st-4', text: '接口联调', done: false }, { id: 'st-5', text: '上线验收', done: false }] }
  ],
  knowledge: [
    { id: 'kn-1', title: '招聘流程', category: '文档', summary: '覆盖招聘完整流程与关键节点说明。', tags: ['流程', '招聘'], url: '' },
    { id: 'kn-2', title: '面试指南', category: '文档', summary: '沉淀题库、评分标准与沟通话术。', tags: ['面试', '指南'], url: '' }
  ],
  review: {
    title: '2026 年第 23 周复盘',
    summary: '本周招聘推进整体稳定，但高优先级岗位的时间协调和跨团队接口仍是主要卡点。',
    points: [
      { title: '关键成果', text: '完成 3 个岗位的初筛。' },
      { title: '主要卡点', text: '候选人时间安排冲突。' },
      { title: '下步建议', text: '优先解决终面时间冲突。' }
    ]
  },
  offers: [
    { id: 'offer-1', plannedDate: '2026-06-03', name: '孙博', department: 'M72', title: '测试工程师', roleType: '外包', processStatus: '接受offer', channel: 'Boss', finalStatus: '', note: '' },
    { id: 'offer-2', plannedDate: '2026-06-01', name: '石玉龙', department: '技术中心-数据工具开发组', title: 'Java开发工程师（AI方向）', roleType: '正编', processStatus: '接受offer', channel: 'Boss', finalStatus: '', note: '' }
  ]
};

// 数据仓库：填了 SUPABASE 就走云端共享（多设备同步，沿用雷达站那套），留空就用本机浏览器存储。
// 等 CloudBase 就绪也可换成 WorkbenchStoreAdapters.CloudBaseAdapter(cfg)，业务代码不动。
// ⚠️ 把下面 url+key 填上即切到云端。key 用 publishable（sb_publishable_ 开头，可公开放前端）；
//    验证阶段 RLS 全开，正式录真实信息前必须收紧 RLS + 配合登录。
const SUPABASE = {
  url: 'https://qgdduaeigmauukzluyqi.supabase.co', // 项目域名（/rest/v1 由适配器自动拼）
  key: 'sb_publishable_ioL98QfzWy3GJoVPeFCuEw_t16kUnOm'  // publishable key，可公开放前端，靠 RLS 兜
};
const wbSeed = {
  recruitments: defaultData.recruitments,
  offers: defaultData.offers,
  events: defaultData.events,
  knowledge: defaultData.knowledge,
  meetings: [],
  review: defaultData.review
};
// 登录模块用同一份 Supabase 配置。云端模式下：先 configure（建客户端），
// 适配器注入 getToken —— 每次请求带当前用户 JWT，未登录回退 publishable key（会被收紧后的 RLS 拒）。
if (SUPABASE.url && SUPABASE.key && window.WorkbenchAuth) {
  window.WorkbenchAuth.configure(SUPABASE);
}
const supabaseAdapterCfg = {
  ...SUPABASE,
  getToken: () => (window.WorkbenchAuth ? window.WorkbenchAuth.getToken() : SUPABASE.key)
};
const store = createWorkbenchStore({
  adapter: (SUPABASE.url && SUPABASE.key) ? WorkbenchStoreAdapters.SupabaseAdapter(supabaseAdapterCfg) : undefined,
  seed: wbSeed
});

const state = {
  route: 'overview',
  query: '',
  reminderView: 'today',
  riskFilter: 'all',
  offerView: 'all',
  offerDateFrom: '',
  offerDateTo: '',
  offerEditingId: null,
  departmentFilter: 'all',
  selectedRecruitmentId: null,
  editingRecruitmentId: null,
  eventEditingId: null,
  knowledgeEditingId: null,
  reviewEditing: false,
  meetingEditingId: null,    // 会议编辑中的 id（'__new__' 表示新建）
  meetingCategory: 'all',    // 会议分类筛选
  meetingDateFrom: '',       // 会议时间筛选 起
  meetingDateTo: '',         // 会议时间筛选 止
  recruitments: [],
  offerRecords: [],
  events: [],
  knowledge: [],
  meetings: [],
  review: null
};

let dragProjectId = null; // 看板拖拽中的项目 id

const els = {
  searchInput: document.querySelector('#searchInput'),
  refreshBtn: document.querySelector('#refreshBtn'),
  createBtn: document.querySelector('#createBtn'),
  aiBtn: document.querySelector('#aiBtn'),
  importFile: document.querySelector('#importFile'),
  routeView: document.querySelector('#routeView'),
  navItems: document.querySelectorAll('.nav-item'),
  drawer: document.querySelector('#drawer'),
  drawerBackdrop: document.querySelector('#drawerBackdrop'),
  closeDrawer: document.querySelector('#closeDrawer'),
  drawerType: document.querySelector('#drawerType'),
  drawerTitle: document.querySelector('#drawerTitle'),
  drawerBody: document.querySelector('#drawerBody')
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const clean = (value) => String(value ?? '').trim();
const safeText = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const loadJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') || clone(fallback); } catch { return clone(fallback); } };
const saveJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const badgeClass = (risk) => risk === 'danger' ? 'danger' : risk === 'warn' ? 'warn' : risk === 'ok' ? 'ok' : 'info';
// 链接规范化：有值但缺协议时补 https://，避免相对路径被当成站内地址打开。空值原样返回
const normalizeUrl = (value) => {
  const u = clean(value);
  if (!u) return '';
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u)) return u;
  return `https://${u}`;
};

// ---- 统一枚举（避免手敲文本写不一致）----
const PRIORITY_OPTIONS = ['P0', 'P1', 'P2'];
const JOB_LEVEL_OPTIONS = ['无', 'M', 'P', 'X']; // 职级：M=管理/P=专业/X=其他，无=未定
const ROLE_CATEGORY_OPTIONS = ['社招', '校招', '实习', '外包']; // 职位类型（多选）
const JOB_STATUS_SUGGEST = ['持续招聘', '已暂停', '已完成', '已关闭']; // 目前状态建议值（可输入新值）
const MEETING_CATEGORIES = ['周会', '面试', '项目会', '其他']; // 会议分类

// 规则抽取摘要：按句末标点切句，累加到约 maxLen 字停止。AI 接入前的兜底方案。
function summarizeMeeting(text, maxLen = 50) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLen) return clean;
  // 按中英文句末标点切句
  const sentences = clean.split(/(?<=[。！？!?；;])/).filter(Boolean);
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxLen) break;
    out += s;
  }
  // 一句话都超长，或没切出来 → 硬截断
  if (!out) out = clean.slice(0, maxLen);
  return out.length < clean.length ? out.replace(/[，,、]$/, '') + '…' : out;
}
const ROLE_TYPE_OPTIONS = ['正编', '外包', '实习', '实习生', '顾问'];
const CHANNEL_OPTIONS = ['BOSS', '内推', '猎头', '供应商/猎头', '官网投递', '招聘官网', '校招', '校企资源', '外包转正', '用人部门推荐', '其他'];
const OFFER_PROCESS_OPTIONS = ['沟通中', '已发offer', '接受offer', '拒绝offer', '放弃入职'];
const OFFER_FINAL_OPTIONS = ['', '待入职', '已入职', '放弃入职', '已离职', '未到岗'];
const EVENT_RISK_OPTIONS = [{ v: 'danger', t: '高（P0）' }, { v: 'warn', t: '中（P1）' }, { v: 'ok', t: '低（P2）' }];

// 部门分类体系：三大类 → 子部门/项目组清单。用于 Offer 部门两级联动 + 按部门快速查看分组。
const DEPT_TAXONOMY = {
  '公共部门': ['信息技术中心', '行政部', '人力资源部', '法律与公共事务部', '财务部', '企管部', '证券部', '审计部', '安全部', '总经理室', '采购运营部', 'IP运营部'],
  '研发部门': ['P01项目', 'ATM项目', 'MODX项目', 'M88项目', 'M95项目', 'T01项目', 'M71项目', 'M72项目', 'M98项目', 'N98项目', 'M81项目', 'P36项目', '技术中心', '音频部', '美术商务部'],
  '运营部门': ['运营总经理室', '摘星工作室', '不二工作室', '三重奏工作室', 'INJOY工作室', '新加坡发行部', '战略合作部', 'Global广告投放中心', '用户增长部', '广告投放中心', '市场媒介中心', '美宣中心', '技术中台部', '数据中心', '安全质量中心', '客服部', '广州天狐']
};
const DEPT_GROUPS = Object.keys(DEPT_TAXONOMY); // ['公共部门','研发部门','运营部门']
// 子部门名 → 大类的反查表
const SUBDEPT_TO_GROUP = (() => {
  const m = {};
  for (const g of DEPT_GROUPS) for (const d of DEPT_TAXONOMY[g]) m[d] = g;
  return m;
})();

// 把历史/口语化的部门写法归一到 { group:大类, dept:标准子部门 }。
// 兼容：带前缀（公共部门-/运营-/吉比特-雷霆游戏>）、项目代号（M98→M98项目）、
//       别名（IT部→信息技术中心、技术中台*→技术中台部）。查不到归「未分类」。
function normalizeDept(raw) {
  let s = String(raw || '').trim();
  if (!s) return { group: '未分类', dept: '未分类' };
  // 1) 剥常见前缀，取最后一段
  s = s.replace(/^吉比特[-－>＞]?雷霆游戏\s*[>＞]?\s*/i, '');
  s = s.replace(/^(公共部门|研发部门|运营部门|运营|研发|公共)\s*[-－>＞]\s*/i, '');
  s = s.split(/[-－>＞]/).pop().trim(); // 多级如「技术中台-数据工具开发组」取末段，再靠别名兜
  // 2) 已经是标准子部门名，直接命中
  if (SUBDEPT_TO_GROUP[s]) return { group: SUBDEPT_TO_GROUP[s], dept: s };
  // 3) 别名 / 模式映射
  if (/^IT部$|信息技术|信息中心/i.test(s)) return { group: '公共部门', dept: '信息技术中心' };
  if (/技术中台|运营支撑|数据工具|前端组|客户端组/.test(s) || /^技术中台/.test(String(raw))) return { group: '运营部门', dept: '技术中台部' };
  if (/客服/.test(s)) return { group: '运营部门', dept: '客服部' };
  if (/新加坡|发行/.test(s)) return { group: '运营部门', dept: '新加坡发行部' };
  // 4) 项目代号：M98 / P36 / ATM / T01 等 → 补「项目」后缀归研发
  const codeMatch = String(raw).match(/\b([A-Za-z]+\d+|ATM|MODX)\b/i);
  if (codeMatch) {
    const proj = codeMatch[1].toUpperCase() + '项目';
    if (SUBDEPT_TO_GROUP[proj]) return { group: '研发部门', dept: proj };
    return { group: '研发部门', dept: proj }; // 即便不在清单也归研发（项目代号特征明显）
  }
  // 5) 末段直接是某大类下的别名残留，再扫一遍包含关系
  for (const g of DEPT_GROUPS) {
    const hit = DEPT_TAXONOMY[g].find((d) => s.includes(d) || d.includes(s));
    if (hit) return { group: g, dept: hit };
  }
  return { group: '未分类', dept: s };
}

// 取一条 offer 的大类：优先用已存的 deptGroup，没有则用 normalizeDept 从 department 推。
function offerGroupOf(record) {
  if (record && DEPT_GROUPS.includes(record.deptGroup)) return record.deptGroup;
  return normalizeDept(record && record.department).group;
}
// 项目看板列
const KANBAN_STATUS = ['待开始', '进行中', '已完成', '搁置'];
const KANBAN_BADGE = { '待开始': 'info', '进行中': 'warn', '已完成': 'ok', '搁置': 'danger' };
// 旧 stage 文本 → 新 status 兼容映射
const normalizeStatus = (s) => KANBAN_STATUS.includes(s) ? s : (s === '推进中' ? '进行中' : (/完成|结束/.test(s || '') ? '已完成' : '进行中'));
// 候选人面试阶段（对接 OA 后这些阶段可与 OA 流程映射）
const CANDIDATE_STAGES = ['简历筛选', '一面', '二面', '终面', '已发Offer', '已入职', '淘汰'];
const STAGE_BADGE = { '简历筛选': 'info', '一面': 'info', '二面': 'warn', '终面': 'warn', '已发Offer': 'ok', '已入职': 'ok', '淘汰': 'danger' };

// 生成下拉 <option>；value 命中 current 时 selected
function optionTags(options, current) {
  return options.map((o) => {
    const v = typeof o === 'object' ? o.v : o;
    const t = typeof o === 'object' ? o.t : (o === '' ? '（未设置）' : o);
    return `<option value="${safeText(v)}" ${String(current || '') === String(v) ? 'selected' : ''}>${safeText(t)}</option>`;
  }).join('');
}

// 渠道候选 = 内置渠道 + 现有 Offer 用过的渠道（去重）。用于编辑表单的 datalist，支持手动新增。
function channelChoices() {
  const set = new Set(CHANNEL_OPTIONS.filter((c) => c)); // 去掉空项
  getOfferRecords().forEach((o) => { if (o && o.channel) set.add(o.channel); });
  return [...set];
}

function jobOpenDays(item) {
  if (!item.requestTime) return null;
  const start = new Date(item.requestTime);
  if (isNaN(start)) return null;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
}
// 时效等级：>60 天红、>45 天黄，否则正常
function jobAgeLevel(item) {
  const d = jobOpenDays(item);
  if (d === null) return null;
  if (d > 60) return { level: 'danger', days: d };
  if (d > 45) return { level: 'warn', days: d };
  return { level: 'ok', days: d };
}


async function initState() {
  await store.loadAll();
  pointStateToStore();
  restorePrefs();
  if (!state.selectedRecruitmentId && state.recruitments[0]) state.selectedRecruitmentId = state.recruitments[0].id;
}

// 把 state.* 指向 store 缓存的同一数组/对象。loadAll/replaceAll 后调用一次即可，
// 之后 mutation 改这些引用就是改缓存，store.save/remove 负责落盘。
function pointStateToStore() {
  state.recruitments = store.get('recruitments');
  state.offerRecords = store.get('offers');
  state.events = store.get('events');
  state.knowledge = store.get('knowledge');
  state.meetings = store.get('meetings');
  state.review = store.get('review');
}

// 界面偏好（筛选/视图）持久化：刷新后恢复上次选择
const PREF_KEYS = ['reminderView', 'offerView', 'offerDateFrom', 'offerDateTo', 'departmentFilter'];
function restorePrefs() {
  const saved = loadJSON(PREFS_STORAGE_KEY, {});
  PREF_KEYS.forEach((k) => { if (saved[k] !== undefined) state[k] = saved[k]; });
}
function savePrefs() {
  const payload = {};
  PREF_KEYS.forEach((k) => { payload[k] = state[k]; });
  saveJSON(PREFS_STORAGE_KEY, payload);
}

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// 轻提示：右下角浮层，2.4s 自动消失
function toast(message, kind = 'ok') {
  const stack = document.querySelector('#toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = message;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 240);
  }, 2400);
}

// 二次确认弹窗：返回 Promise<boolean>，替代浏览器原生 confirm
function confirmAction({ title = '确认操作', message = '确定要执行该操作吗？', okText = '确定' } = {}) {
  return new Promise((resolve) => {
    const layer = document.querySelector('#confirmLayer');
    const okBtn = document.querySelector('#confirmOk');
    const cancelBtn = document.querySelector('#confirmCancel');
    if (!layer || !okBtn || !cancelBtn) { resolve(window.confirm(message)); return; }
    document.querySelector('#confirmTitle').textContent = title;
    document.querySelector('#confirmMessage').textContent = message;
    okBtn.textContent = okText;
    layer.classList.add('open');
    layer.setAttribute('aria-hidden', 'false');
    const cleanup = (result) => {
      layer.classList.remove('open');
      layer.setAttribute('aria-hidden', 'true');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      document.querySelector('#confirmBackdrop')?.removeEventListener('click', onCancel);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    document.querySelector('#confirmBackdrop')?.addEventListener('click', onCancel);
  });
}

function renderTags(tags = []) {
  return tags.map((tag) => `<span class="tag">${safeText(tag)}</span>`).join('');
}

function filterRecruitments() {
  const q = state.query.toLowerCase();
  const rank = { P0: 0, P1: 1, P2: 2 };
  return state.recruitments.filter((item) => {
    const matchQuery = !q || [item.title, item.department, item.businessContact, item.priority].join(' ').toLowerCase().includes(q);
    const matchDept = state.departmentFilter === 'all' || item.department === state.departmentFilter;
    return matchQuery && matchDept;
  }).sort((a, b) => {
    const pr = (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
    if (pr) return pr;
    return (jobOpenDays(b) ?? -1) - (jobOpenDays(a) ?? -1); // 同优先级，开放越久越靠前
  });
}

function filterEvents() {
  const q = state.query.toLowerCase();
  return state.events.filter((item) => !q || [item.title, item.category, item.owner, item.blocker].join(' ').toLowerCase().includes(q));
}

function filterKnowledge() {
  const q = state.query.toLowerCase();
  return state.knowledge.filter((item) => !q || [item.title, item.category, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase().includes(q));
}

function filterOffers() {
  const q = state.query.toLowerCase();
  return state.offerRecords.filter((item) => {
    const matchQuery = !q || [item.name, item.department, item.title, item.channel, item.processStatus, item.finalStatus].join(' ').toLowerCase().includes(q);
    const matchView = state.offerView === 'all'
      || (state.offerView === 'pending' && !item.finalStatus)
      || (state.offerView === 'accepted' && item.processStatus === '接受offer')
      || (state.offerView === 'employed' && item.finalStatus === '已入职')
      || (state.offerView === 'declined' && /拒绝|放弃/.test(item.processStatus || item.finalStatus || ''));
    const fromOk = !state.offerDateFrom || item.plannedDate >= state.offerDateFrom;
    const toOk = !state.offerDateTo || item.plannedDate <= state.offerDateTo;
    return matchQuery && matchView && fromOk && toOk;
  }).sort((a, b) => String(b.plannedDate || '').localeCompare(String(a.plannedDate || ''))); // 按拟录用时间倒序，最新在上
}

function renderStatCards() {
  return `<div class="stats-grid">${[
    { label: '在招岗位', value: state.recruitments.length, note: '全部岗位' },
    { label: '重点岗位', value: state.recruitments.filter((item) => item.priority === 'P0').length, note: 'P0 级' },
    { label: '推进事项', value: state.events.length, note: '非招聘事项' },
    { label: 'Offer 记录', value: state.offerRecords.length, note: '录用台账' }
  ].map((item) => `<article class="stat-card"><div class="label">${safeText(item.label)}</div><div class="value">${safeText(item.value)}</div><div class="note">${safeText(item.note)}</div></article>`).join('')}</div>`;
}

// 汇总所有岗位下候选人，按阶段归并成漏斗
function buildRecruitFunnel() {
  const all = state.recruitments.flatMap((r) => r.candidates || []);
  const total = all.length;
  const inInterview = all.filter((c) => ['一面', '二面', '终面'].includes(c.stage)).length;
  const offered = all.filter((c) => c.stage === '已发Offer').length;
  const onboard = all.filter((c) => c.stage === '已入职').length;
  const dropped = all.filter((c) => c.stage === '淘汰').length;
  const rate = (n, d) => d ? Math.round((n / d) * 100) : 0;
  return {
    total, inInterview, offered, onboard, dropped,
    // 累计转化：进入面试及以后 / 总数
    reached: inInterview + offered + onboard,
    interviewRate: rate(inInterview + offered + onboard, total),
    offerRate: rate(offered + onboard, total),
    onboardRate: rate(onboard, total)
  };
}

function renderRecruitFunnel() {
  const f = buildRecruitFunnel();
  if (!f.total) return `<section class="panel section-card"><div class="panel-head"><div><h3>招聘漏斗</h3><p>各岗位候选人汇总（添加候选人后自动统计）</p></div></div><div class="job-desc">还没有候选人数据。去「招聘管理」选一个岗位，在候选人漏斗里添加候选人，这里就会自动出转化率。</div></section>`;
  const stages = [
    { label: '候选人总数', value: f.total, rate: '' },
    { label: '进入面试', value: f.reached, rate: `面试率 ${f.interviewRate}%` },
    { label: '已发 Offer', value: f.offered + f.onboard, rate: `Offer 率 ${f.offerRate}%` },
    { label: '已入职', value: f.onboard, rate: `入职率 ${f.onboardRate}%` },
    { label: '淘汰', value: f.dropped, rate: '' }
  ];
  return `<section class="panel section-card"><div class="panel-head"><div><h3>招聘漏斗</h3><p>全部岗位候选人汇总，按当前阶段统计</p></div></div><div class="funnel-cards">${stages.map((s) => `<div class="funnel-card"><div class="fc-value">${s.value}</div><div class="fc-label">${safeText(s.label)}</div>${s.rate ? `<div class="fc-rate">${safeText(s.rate)}</div>` : ''}</div>`).join('')}</div></section>`;
}

// 按渠道看 Offer 产出（环形图 + 图例）
function renderChannelAnalysis() {
  const records = state.offerRecords;
  if (!records.length) return '';
  const groups = {};
  records.forEach((r) => {
    const k = r.channel || '未标注';
    if (!groups[k]) groups[k] = { total: 0, onboard: 0 };
    groups[k].total += 1;
    if (r.finalStatus === '已入职') groups[k].onboard += 1;
  });
  const entries = Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
  const total = records.length;
  // 环形分段配色（玫粉主色系 + 辅助色，循环取用）
  const COLORS = ['#ec4899', '#d6336c', '#a855c7', '#f59e0b', '#15a06a', '#3b82f6', '#f472b6', '#8b5cf6', '#ef4444', '#0ea5e9', '#84cc16', '#fb923c'];
  let acc = 0;
  const segs = entries.map(([name, g], i) => {
    const start = (acc / total) * 360;
    acc += g.total;
    const end = (acc / total) * 360;
    return { name, count: g.total, onboard: g.onboard, color: COLORS[i % COLORS.length], start, end, pct: Math.round((g.total / total) * 100) };
  });
  const gradient = segs.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');
  // 图例改方卡：每渠道一张正方形卡，显示色点+渠道名+大百分比（鼠标悬浮看数量/入职）
  const legend = segs.map((s) => `<div class="donut-card" title="${safeText(s.name)}：${s.count} 个${s.onboard ? `，已入职 ${s.onboard}` : ''}"><span class="donut-card-dot" style="background:${s.color}"></span><span class="donut-card-name">${safeText(s.name)}</span><span class="donut-card-pct">${s.pct}%</span></div>`).join('');
  return `<section class="panel section-card"><div class="panel-head"><div><h3>渠道分析</h3><p>各招聘渠道的 Offer 产出占比</p></div></div><div class="donut-wrap"><div class="donut-chart" style="background:conic-gradient(${gradient})"><div class="donut-hole"><span class="donut-total">${total}</span><span class="donut-total-label">Offer 总数</span></div></div><div class="donut-cards">${legend}</div></div></section>`;
}


// 从真实数据派生 AI 优先建议：高风险/卡点事件、P0 岗位、待跟进 Offer
function buildReminders() {
  const reminders = [];
  state.events.filter((e) => e.risk === 'danger').forEach((e) => reminders.push({ id: e.id, title: e.title, description: e.blocker ? `卡点：${e.blocker}` : (e.description || '高风险事项'), owner: e.owner || '负责人', nextAction: e.nextAction || '尽快推进', risk: 'danger' }));
  state.recruitments.filter((r) => r.priority === 'P0').forEach((r) => reminders.push({ id: r.id, title: `优先推进：${r.title}`, description: `${r.department || ''} P0 岗位需优先补位。`, owner: r.businessContact || '招聘团队', nextAction: '安排面试', risk: 'warn' }));
  state.events.filter((e) => e.risk === 'warn').forEach((e) => reminders.push({ id: e.id, title: e.title, description: e.blocker ? `卡点：${e.blocker}` : (e.description || '推进中'), owner: e.owner || '负责人', nextAction: e.nextAction || '持续跟进', risk: 'warn' }));
  const pendingOffers = state.offerRecords.filter((o) => !o.finalStatus).length;
  if (pendingOffers) reminders.push({ id: 'offer-pending', title: '补齐 Offer 推进节奏', description: `还有 ${pendingOffers} 条 Offer 待确认结果。`, owner: '招聘团队', nextAction: '跟进候选人', risk: 'warn' });
  return reminders;
}

function renderReminderCards() {
  const all = buildReminders();
  const list = state.reminderView === 'today' ? all.filter((r) => r.risk === 'danger').concat(all.filter((r) => r.risk === 'warn')).slice(0, 2)
    : state.reminderView === 'week' ? all.filter((r) => r.risk !== 'danger')
    : all;
  const body = list.length ? list.map((item) => `<article class="priority-item" data-kind="reminder" data-id="${safeText(item.id)}"><span class="badge ${badgeClass(item.risk)}">${safeText(item.owner)}</span><div><strong>${safeText(item.title)}</strong><p>${safeText(item.description)}</p><p>下一步：${safeText(item.nextAction)}</p></div></article>`).join('') : '<div class="job-desc">当前没有需要优先处理的事项 🎉</div>';
  return `<section class="panel"><div class="panel-head"><div><h3>AI 优先处理建议</h3><p>系统自动识别当前最值得先推进的事项</p></div><div class="panel-tools"><button class="chip ${state.reminderView === 'today' ? 'active' : ''}" data-view="today">今日待办</button><button class="chip ${state.reminderView === 'week' ? 'active' : ''}" data-view="week">本周待办</button><button class="chip ${state.reminderView === 'all' ? 'active' : ''}" data-view="all">全部事项</button></div></div><div class="priority-list">${body}</div></section>`;
}

function renderJobCard(item) {
  const age = jobAgeLevel(item);
  const ageTag = age ? `<span class="badge ${age.level === 'ok' ? 'info' : age.level}">开放 ${age.days} 天${age.level === 'danger' ? ' ⚠ 老化' : age.level === 'warn' ? ' · 偏久' : ''}</span>` : '';
  const funnel = candidateFunnelText(item);
  const deptLine = [item.subDept, item.projectGroup].filter(Boolean).join(' / ') || item.department || '';
  const levelTag = (item.level && item.level !== '无') ? `<span class="badge info">职级 ${safeText(item.level)}</span>` : '';
  const statusTag = (item.status && item.status !== '持续招聘') ? `<span class="badge warn">${safeText(item.status)}</span>` : '';
  return `<article class="job-card ${state.selectedRecruitmentId === item.id ? 'selected' : ''}" role="button" tabindex="0" data-kind="recruitment" data-id="${safeText(item.id)}"><div class="job-card-head"><div><h4>${safeText(item.title)}</h4><p class="job-desc">${safeText(deptLine)}</p></div><span class="badge ${badgeClass(item.priority === 'P0' ? 'danger' : item.priority === 'P1' ? 'warn' : 'ok')}">${safeText(item.priority)}</span></div><div class="job-meta"><span>需求时间：${safeText(item.requestTime || '暂无')}</span><span>业务对接：${safeText(item.businessContact || '待补充')}</span><span>HRBP：${safeText(item.hrbp || '待补充')}</span></div><div class="tags">${ageTag}${levelTag}${statusTag}${funnel ? `<span class="badge ok">候选人 ${(item.candidates || []).length}</span>` : ''}</div>${funnel ? `<div class="funnel-mini">${funnel}</div>` : ''}</article>`;
}

// 岗位下候选人按阶段汇总，生成 mini 漏斗文字（无候选人返回空）
function candidateFunnelText(item) {
  const cands = item.candidates || [];
  if (!cands.length) return '';
  const counts = {};
  cands.forEach((c) => { counts[c.stage] = (counts[c.stage] || 0) + 1; });
  return CANDIDATE_STAGES.filter((s) => counts[s]).map((s) => `<span class="funnel-step"><b>${counts[s]}</b>${safeText(s)}</span>`).join('');
}
function getSelectedRecruitment() {
  return state.recruitments.find((item) => item.id === state.selectedRecruitmentId) || state.recruitments[0] || null;
}

function getOfferRecords() {
  return state.offerRecords.slice().sort((a, b) => String(b.plannedDate).localeCompare(String(a.plannedDate)));
}

function renderMarkdownBlock(value) {
  const text = clean(value);
  if (!text) return '<div class="markdown-body"><p>暂无</p></div>';
  return `<div class="markdown-body">${text.split('\n').map((line) => `<p>${safeText(line)}</p>`).join('')}</div>`;
}

function renderRecruitmentDetail(item) {
  if (!item) return '<div class="job-desc">暂无岗位</div>';
  const age = jobAgeLevel(item);
  const ageStr = age ? `已开放 ${age.days} 天${age.level === 'danger' ? '（已老化，建议优先攻坚 ⚠）' : age.level === 'warn' ? '（偏久，注意推进）' : ''}` : '暂无需求时间';
  const deptPath = [item.department, item.subDept, item.projectGroup].filter(Boolean).join(' / ') || '待补充';
  const roleTypes = (Array.isArray(item.roleTypes) ? item.roleTypes : []).join(' · ') || '待补充';
  // 兼容旧数据：若 profile（任职要求）还有内容则单独显示一块
  const profileBlock = clean(item.profile) ? `<div class="drawer-note"><strong>任职要求（旧）</strong>${renderMarkdownBlock(item.profile)}</div>` : '';
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">岗位详情</div><div class="drawer-grid"><div class="kv"><span>需求时间</span><strong>${safeText(item.requestTime || '暂无')}</strong></div><div class="kv"><span>开放时长</span><strong class="${age && age.level !== 'ok' ? (age.level === 'danger' ? 'age-danger' : 'age-warn') : ''}">${safeText(ageStr)}</strong></div><div class="kv"><span>部门 / 子部门 / 项目组</span><strong>${safeText(deptPath)}</strong></div><div class="kv"><span>职级</span><strong>${safeText(item.level || '无')}</strong></div><div class="kv"><span>优先级</span><strong>${safeText(item.priority || 'P1')}</strong></div><div class="kv"><span>目前状态</span><strong>${safeText(item.status || '持续招聘')}</strong></div><div class="kv"><span>职位类型</span><strong>${safeText(roleTypes)}</strong></div><div class="kv"><span>薪资范围</span><strong>${safeText(item.salaryRange || '待补充')}</strong></div><div class="kv"><span>业务对接</span><strong>${safeText(item.businessContact || '待补充')}</strong></div><div class="kv"><span>HRBP</span><strong>${safeText(item.hrbp || '待补充')}</strong></div></div></div>${renderCandidatePanel(item)}<div class="trend-card"><div class="trend-title">岗位说明</div><div class="drawer-note"><strong>岗位描述</strong>${renderMarkdownBlock(item.jd || '')}</div>${profileBlock}<div class="drawer-note"><strong>为什么招</strong>${renderMarkdownBlock(item.reason || '')}</div><div class="drawer-note"><strong>备注</strong>${renderMarkdownBlock(item.notes || '')}</div></div><div class="trend-card"><div class="trend-title">推进流程</div><ul class="plain-list">${(item.process || []).map((line) => `<li>${safeText(line)}</li>`).join('') || '<li>暂无</li>'}</ul></div><div class="drawer-actions"><button class="toolbar-btn highlight" type="button" data-action="open-edit">编辑岗位</button></div></div>`;
}

// 候选人板块：阶段汇总 + 列表（可改阶段/删除）+ 新增表单。数据存岗位的 candidates[]，留 oaId/source 扩展位待 OA 对接
function renderCandidatePanel(item) {
  const cands = item.candidates || [];
  const counts = {};
  cands.forEach((c) => { counts[c.stage] = (counts[c.stage] || 0) + 1; });
  const summary = CANDIDATE_STAGES.map((s) => `<span class="funnel-step ${counts[s] ? '' : 'dim'}"><b>${counts[s] || 0}</b>${safeText(s)}</span>`).join('');
  const rows = cands.length ? cands.map((c) => {
    const linkedOffer = state.offerRecords.find((o) => o.candidateId === c.id);
    const offerBadge = linkedOffer ? `<button type="button" class="cand-offer-link" data-offer-id="${safeText(linkedOffer.id)}" title="查看关联 Offer">📄 已生成Offer</button>` : '';
    return `<div class="candidate-pipe-row" data-cand-id="${safeText(c.id)}"><div class="cand-info"><strong>${safeText(c.name || '未命名')}</strong><span class="job-desc">${safeText(c.source || '—')}</span>${offerBadge}<input class="cand-note-input" type="text" data-cand-id="${safeText(c.id)}" value="${safeText(c.note || '')}" placeholder="备注（失焦保存）" /></div><div class="cand-stage"><select class="cand-stage-select" data-cand-id="${safeText(c.id)}">${optionTags(CANDIDATE_STAGES, c.stage)}</select></div><button class="icon-btn cand-del" type="button" data-cand-id="${safeText(c.id)}" title="移除候选人">×</button></div>`;
  }).join('') : '<div class="job-desc">还没有候选人，下方添加。后续可与 OA 简历库打通自动同步。</div>';
  return `<div class="trend-card"><div class="trend-title">候选人漏斗（${cands.length} 人）</div><div class="funnel-summary">${summary}</div><div class="candidate-pipe">${rows}</div><form class="cand-add-form" id="candAddForm"><input class="cand-add-name" name="name" type="text" placeholder="候选人姓名" /><select name="stage">${optionTags(CANDIDATE_STAGES, '简历筛选')}</select><select name="source">${optionTags(CHANNEL_OPTIONS, 'BOSS')}</select><button class="toolbar-btn strong" type="submit">添加</button></form></div>`;
}

function renderRecruitmentEditor(item = {}) {
  const value = {
    id: item.id || '',
    requestTime: item.requestTime || '',
    department: item.department || '',
    subDept: item.subDept || '',
    projectGroup: item.projectGroup || '',
    title: item.title || '',
    level: item.level || '无',
    salaryRange: item.salaryRange || '',
    priority: item.priority || 'P1',
    businessContact: item.businessContact || '',
    hrbp: item.hrbp || '',
    roleTypes: Array.isArray(item.roleTypes) ? item.roleTypes : (item.roleTypes ? [item.roleTypes] : []),
    status: item.status || '持续招聘',
    profile: item.profile || '',
    jd: item.jd || '',
    reason: item.reason || '',
    notes: item.notes || '',
    process: Array.isArray(item.process) ? item.process.join('\n') : (item.process || '')
  };
  // 职位类型多选勾选
  const roleTypeBoxes = ROLE_CATEGORY_OPTIONS.map((c) => `<label class="check-inline"><input type="checkbox" name="roleTypes" value="${safeText(c)}" ${value.roleTypes.includes(c) ? 'checked' : ''} /> ${safeText(c)}</label>`).join('');
  return `<form class="editor-form" id="recruitmentEditor"><input type="hidden" name="id" value="${safeText(value.id)}" /><div class="editor-grid"><label class="field"><span>需求时间</span><input name="requestTime" type="date" value="${safeText(value.requestTime)}" /></label><label class="field"><span>部门</span><input name="department" type="text" value="${safeText(value.department)}" placeholder="如 吉比特 / 吉比特研发 / 雷霆运营" /></label><label class="field"><span>子部门</span><input name="subDept" type="text" value="${safeText(value.subDept)}" placeholder="如 公共部门 / 技术中心 / 运营部门" /></label><label class="field"><span>项目组</span><input name="projectGroup" type="text" value="${safeText(value.projectGroup)}" placeholder="如 法务组 / 客服部" /></label><label class="field"><span>岗位名称</span><input name="title" type="text" value="${safeText(value.title)}" /></label><label class="field"><span>职级</span><select name="level">${optionTags(JOB_LEVEL_OPTIONS, value.level)}</select></label><label class="field"><span>优先级</span><select name="priority">${optionTags(PRIORITY_OPTIONS, value.priority)}</select></label><label class="field"><span>薪资范围</span><input name="salaryRange" type="text" value="${safeText(value.salaryRange)}" /></label><label class="field"><span>业务对接人</span><input name="businessContact" type="text" value="${safeText(value.businessContact)}" /></label><label class="field"><span>HRBP</span><input name="hrbp" type="text" value="${safeText(value.hrbp)}" /></label><label class="field"><span>目前状态</span><input name="status" type="text" list="jobStatusSuggest" value="${safeText(value.status)}" /><datalist id="jobStatusSuggest">${JOB_STATUS_SUGGEST.map((s) => `<option value="${safeText(s)}"></option>`).join('')}</datalist></label><label class="field field-span-2"><span>职位类型（可多选）</span><div class="check-row">${roleTypeBoxes}</div></label><label class="field field-span-2"><span>岗位描述（职责 + 任职要求）</span><textarea name="jd" rows="8">${safeText(value.jd)}</textarea></label><label class="field field-span-2"><span>为什么招</span><textarea name="reason" rows="3">${safeText(value.reason)}</textarea></label><label class="field field-span-2"><span>备注</span><textarea name="notes" rows="3">${safeText(value.notes)}</textarea></label><label class="field field-span-2"><span>面试流程（每行一条）</span><textarea name="process" rows="4">${safeText(value.process)}</textarea></label></div><div class="drawer-actions"><button class="toolbar-btn strong" type="submit">保存</button><button class="toolbar-btn" type="button" data-action="cancel-edit">取消</button>${item.id ? '<button class="toolbar-btn danger-btn" type="button" data-action="delete-recruitment">删除岗位</button>' : ''}</div></form>`;
}

function renderOfferSummaryCards(records) {
  const stats = {
    total: records.length,
    accepted: records.filter((item) => item.processStatus === '接受offer').length,
    employed: records.filter((item) => item.finalStatus === '已入职').length,
    pending: records.filter((item) => !item.finalStatus).length
  };
  return `<div class="kpi-grid large-kpi"><button class="kpi-card kpi-btn" type="button" data-offer-metric="all"><div class="label">记录总数</div><div class="value">${safeText(stats.total)}</div><div class="sub">全部 Offer 记录</div></button><button class="kpi-card kpi-btn" type="button" data-offer-metric="accepted"><div class="label">接受 Offer</div><div class="value">${safeText(stats.accepted)}</div><div class="sub">已经明确接受</div></button><button class="kpi-card kpi-btn" type="button" data-offer-metric="employed"><div class="label">已入职</div><div class="value">${safeText(stats.employed)}</div><div class="sub">已完成入职</div></button><button class="kpi-card kpi-btn" type="button" data-offer-metric="pending"><div class="label">待跟进</div><div class="value">${safeText(stats.pending)}</div><div class="sub">还要继续确认</div></button></div>`;
}

function renderOfferDepartmentCards(records) {
  // 按三大类（公共/研发/运营）归并；老数据用 normalizeDept 兜底推大类
  const groups = new Map();
  records.forEach((item) => {
    const key = offerGroupOf(item);
    if (!groups.has(key)) groups.set(key, { group: key, total: 0, accepted: 0, employed: 0, pending: 0 });
    const g = groups.get(key);
    g.total += 1;
    if (item.processStatus === '接受offer') g.accepted += 1;
    if (item.finalStatus === '已入职') g.employed += 1;
    if (!item.finalStatus) g.pending += 1;
  });
  // 固定顺序：公共→研发→运营，末尾追加「未分类」（若有）
  const order = [...DEPT_GROUPS, '未分类'];
  const list = order.filter((k) => groups.has(k)).map((k) => groups.get(k));
  if (!list.length) return '<div class="job-desc">暂无部门统计</div>';
  return `<div class="card-grid card-grid-large">${list.map((g) => `<article class="job-card dept-group-card" role="button" tabindex="0" data-offer-group="${safeText(g.group)}"><div class="job-card-head"><div><h4>${safeText(g.group)}</h4><p class="job-desc">总计 ${safeText(g.total)} 条 · 点开看子部门</p></div><span class="badge info">大类</span></div><div class="job-meta"><span>接受 ${safeText(g.accepted)}</span><span>已入职 ${safeText(g.employed)}</span><span>待跟进 ${safeText(g.pending)}</span></div></article>`).join('')}</div>`;
}

// 下钻：某大类下按子部门分组的明细（drawer 内）
function renderOfferGroupDetail(group, records) {
  const inGroup = records.filter((r) => offerGroupOf(r) === group);
  // 按子部门聚合
  const subMap = new Map();
  inGroup.forEach((r) => {
    const sub = (DEPT_GROUPS.includes(r.deptGroup) && r.department) ? r.department : normalizeDept(r.department).dept;
    if (!subMap.has(sub)) subMap.set(sub, []);
    subMap.get(sub).push(r);
  });
  const subBlocks = [...subMap.entries()].map(([sub, rows]) => {
    const employed = rows.filter((r) => r.finalStatus === '已入职').length;
    const list = rows.map((r) => {
      const st = r.finalStatus || r.processStatus || '待确认';
      const badge = /已入职/.test(st) ? 'ok' : /接受/.test(st) ? 'warn' : /拒绝|放弃/.test(st) ? 'danger' : 'info';
      return `<article class="candidate-row"><div><strong>${safeText(r.name)}</strong><div class="job-desc">${safeText(`${r.plannedDate || '暂无'} · ${r.title || '暂无岗位'}`)}</div></div><div>${safeText(r.channel || '暂无')}</div><div><span class="badge ${badge}">${safeText(st)}</span></div></article>`;
    }).join('');
    return `<div class="trend-card"><div class="trend-title">${safeText(sub)} <span class="job-desc">（${rows.length} 条 · 已入职 ${employed}）</span></div><div class="candidate-list">${list}</div></div>`;
  }).join('');
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">${safeText(group)}</div><div class="job-desc">共 ${safeText(inGroup.length)} 条，按子部门/项目组拆分如下</div></div>${subBlocks || '<div class="job-desc">该大类下暂无记录</div>'}</div>`;
}

function renderOfferRows(records) {
  if (!records.length) return '<div class="job-desc">暂无记录</div>';
  return records.map((record) => {
    const status = record.finalStatus || record.processStatus || '待确认';
    const badge = /已入职/.test(status) ? 'ok' : /接受/.test(status) ? 'warn' : /拒绝|放弃/.test(status) ? 'danger' : 'info';
    return `<article class="event-row" role="button" tabindex="0" data-kind="offer" data-id="${safeText(record.id)}"><span class="event-title">${safeText(record.plannedDate)}</span><span class="event-type">${safeText(record.name)}</span><span>${safeText(record.department || '暂无')}</span><span>${safeText(record.title || '暂无')}</span><span>${safeText(record.roleType || '暂无')}</span><span>${safeText(record.channel || '暂无')}</span><span><span class="badge ${badge}">${safeText(record.processStatus || '待确认')}</span></span><span><span class="badge ${badge}">${safeText(status)}</span></span></article>`;
  }).join('');
}

function renderOfferDetail(record) {
  const status = record.finalStatus || record.processStatus || '待确认';
  const fromCand = record.candidateId ? `<span class="badge info">来自候选人漏斗</span>` : '';
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">Offer 状态</div><div class="status-strip"><span class="badge ${/已入职/.test(status) ? 'ok' : /接受/.test(status) ? 'warn' : /拒绝|放弃/.test(status) ? 'danger' : 'info'}">当前：${safeText(status)}</span>${fromCand}<span class="job-desc">可以直接修改这条 Offer 的状态</span></div><div class="status-actions"><button class="toolbar-btn highlight" type="button" data-offer-status="接受offer" data-offer-id="${safeText(record.id)}">标记接受</button><button class="toolbar-btn strong" type="button" data-offer-status="已入职" data-offer-id="${safeText(record.id)}">标记已入职</button><button class="toolbar-btn danger-btn" type="button" data-offer-status="拒绝offer" data-offer-id="${safeText(record.id)}">标记拒绝</button><button class="toolbar-btn danger-btn" type="button" data-offer-status="放弃入职" data-offer-id="${safeText(record.id)}">标记放弃</button></div></div><div class="trend-card"><div class="trend-title">录用详情</div><div class="drawer-grid"><div class="kv"><span>拟录用时间</span><strong>${safeText(record.plannedDate || '暂无')}</strong></div><div class="kv"><span>姓名</span><strong>${safeText(record.name || '暂无')}</strong></div><div class="kv"><span>部门</span><strong>${safeText(record.department || '暂无')}</strong></div><div class="kv"><span>岗位名称</span><strong>${safeText(record.title || '暂无')}</strong></div><div class="kv"><span>岗位类型</span><strong>${safeText(record.roleType || '暂无')}</strong></div><div class="kv"><span>渠道</span><strong>${safeText(record.channel || '暂无')}</strong></div></div></div><div class="trend-card"><div class="trend-title">备注</div><div class="drawer-note"><p>${safeText(record.note || '暂无')}</p></div></div><div class="drawer-actions"><button class="toolbar-btn highlight" type="button" data-action="edit-offer" data-id="${safeText(record.id)}">编辑这条</button><button class="toolbar-btn" type="button" data-action="close-drawer">关闭</button></div></div>`;
}

function renderOfferMetricDetail(metric, records) {
  const labels = { all: '全部记录', accepted: '接受 offer', employed: '已入职', pending: '待跟进' };
  const filtered = metric === 'accepted' ? records.filter((item) => item.processStatus === '接受offer') : metric === 'employed' ? records.filter((item) => item.finalStatus === '已入职') : metric === 'pending' ? records.filter((item) => !item.finalStatus) : records;
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">${safeText(labels[metric] || 'Offer 明细')}</div><div class="job-desc">共 ${safeText(filtered.length)} 条</div><div class="candidate-list">${filtered.map((record) => `<article class="candidate-row"><div><strong>${safeText(record.name)}</strong><div class="job-desc">${safeText(`${record.plannedDate || '暂无'} · ${record.department || '暂无部门'}`)}</div></div><div>${safeText(record.title || '暂无')}</div><div>${safeText(record.channel || '暂无')}</div><div><span class="badge ${/已入职/.test(record.finalStatus || '') ? 'ok' : /接受/.test(record.processStatus || '') ? 'warn' : /拒绝|放弃/.test(record.finalStatus || record.processStatus || '') ? 'danger' : 'info'}">${safeText(record.finalStatus || record.processStatus || '待确认')}</span></div></article>`).join('') || '<div class="job-desc">暂无记录</div>'}</div></div></div>`;
}

function renderOfferEditForm(record = {}) {
  // 关联岗位下拉：选中后自动回填部门/岗位名，并存 jobId 作为关联键
  const jobOpts = `<option value="">（不关联，手动填写）</option>` + state.recruitments.map((r) => `<option value="${safeText(r.id)}" ${record.jobId === r.id ? 'selected' : ''}>${safeText(`${r.title}${r.department ? ' · ' + r.department : ''}`)}</option>`).join('');
  // 部门两级联动：大类已存用 deptGroup，否则从 department 推；子部门同理
  const curGroup = DEPT_GROUPS.includes(record.deptGroup) ? record.deptGroup : normalizeDept(record.department).group;
  const curDept = (DEPT_GROUPS.includes(record.deptGroup) && record.department) ? record.department : normalizeDept(record.department).dept;
  const groupOpts = `<option value="">（请选择大类）</option>` + DEPT_GROUPS.map((g) => `<option value="${safeText(g)}" ${curGroup === g ? 'selected' : ''}>${safeText(g)}</option>`).join('');
  const deptOpts = subDeptOptions(curGroup, curDept);
  return `<form class="editor-form" id="offerEditor" data-offer-id="${safeText(record.id || '')}"><div class="editor-grid"><label class="field field-span-2"><span>关联岗位（选了自动带出部门/岗位名）</span><select name="jobId" id="offerJobPicker">${jobOpts}</select></label><label class="field"><span>拟录用时间</span><input name="plannedDate" type="date" value="${safeText(record.plannedDate || '')}" /></label><label class="field"><span>姓名</span><input name="name" type="text" value="${safeText(record.name || '')}" /></label><label class="field"><span>部门大类</span><select name="deptGroup" id="offerDeptGroup">${groupOpts}</select></label><label class="field"><span>子部门 / 项目组</span><select name="department" id="offerDept">${deptOpts}</select></label><label class="field"><span>岗位名称</span><input name="title" id="offerTitle" type="text" value="${safeText(record.title || '')}" /></label><label class="field"><span>岗位类型</span><select name="roleType">${optionTags(ROLE_TYPE_OPTIONS, record.roleType)}</select></label><label class="field"><span>流程状态</span><select name="processStatus">${optionTags(OFFER_PROCESS_OPTIONS, record.processStatus)}</select></label><label class="field"><span>渠道（可选已有或直接输入新渠道）</span><input name="channel" type="text" list="channelChoices" value="${safeText(record.channel || '')}" placeholder="如 BOSS / 内推 / 自定义" /><datalist id="channelChoices">${channelChoices().map((c) => `<option value="${safeText(c)}"></option>`).join('')}</datalist></label><label class="field"><span>最终状态</span><select name="finalStatus">${optionTags(OFFER_FINAL_OPTIONS, record.finalStatus)}</select></label><label class="field field-span-2"><span>备注</span><textarea name="note" rows="4">${safeText(record.note || '')}</textarea></label></div><div class="drawer-actions"><button class="toolbar-btn strong" type="submit">保存</button><button class="toolbar-btn" type="button" data-action="cancel-offer-edit">取消</button><button class="toolbar-btn danger-btn" type="button" data-action="delete-offer">删除</button></div></form>`;
}

// 生成某大类下子部门的 option 标签；group 为空则给提示项
function subDeptOptions(group, selected) {
  const subs = DEPT_TAXONOMY[group] || [];
  const head = `<option value="">${group ? '（请选择子部门）' : '（请先选大类）'}</option>`;
  // 选中值不在清单里（老数据特殊写法）也补一个，避免丢失
  const extra = (selected && !subs.includes(selected)) ? `<option value="${safeText(selected)}" selected>${safeText(selected)}</option>` : '';
  return head + extra + subs.map((d) => `<option value="${safeText(d)}" ${selected === d ? 'selected' : ''}>${safeText(d)}</option>`).join('');
}

function renderKnowledgeDetail(item) {
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">文档信息</div><div class="drawer-grid"><div class="kv"><span>标题</span><strong>${safeText(item.title)}</strong></div><div class="kv"><span>类型</span><strong>${safeText(item.category)}</strong></div></div></div><div class="trend-card"><div class="trend-title">摘要</div><div class="drawer-note"><p>${safeText(item.summary)}</p></div><div class="drawer-note"><strong>标签</strong><div class="tags">${renderTags(item.tags || [])}</div></div></div><div class="trend-card"><div class="trend-title">来源</div><div class="drawer-note"><p>${safeText(item.url || '暂无来源链接')}</p></div></div><div class="drawer-actions">${item.url ? `<button class="toolbar-btn highlight" type="button" data-action="open-knowledge-link" data-url="${safeText(item.url)}">打开文档</button>` : ''}<button class="toolbar-btn strong" type="button" data-action="edit-knowledge" data-id="${safeText(item.id)}">编辑</button><button class="toolbar-btn" type="button" data-action="close-drawer">关闭</button></div></div>`;
}

function renderGenericDetail(item, title) {
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">${safeText(title || '详情')}</div><div class="drawer-grid"><div class="kv"><span>名称</span><strong>${safeText(item.title || item.name || '未命名')}</strong></div><div class="kv"><span>状态</span><strong>${safeText(item.status || item.stage || item.category || '暂无')}</strong></div></div></div><div class="trend-card"><div class="trend-title">说明</div><div class="drawer-note"><p>${safeText(item.description || item.summary || '暂无')}</p></div></div><div class="drawer-actions"><button class="toolbar-btn" type="button" data-action="close-drawer">关闭</button></div></div>`;
}
function renderOverviewPage() {
  return `${renderStatCards()}${renderRecruitFunnel()}${renderChannelAnalysis()}${renderReminderCards()}<section class="dashboard-grid"><section class="panel section-card"><div class="panel-head"><div><h3>招聘板块</h3><p>当前在招岗位与推进状态</p></div></div><div class="card-grid">${filterRecruitments().map(renderJobCard).join('') || '<div class="job-desc">暂无岗位</div>'}</div></section><section class="panel section-card"><div class="panel-head"><div><h3>Offer 产出</h3><p>录用台账概览</p></div></div>${renderOfferSummaryCards(getOfferRecords().slice(0, 4))}<div class="trend-card"><div class="trend-title">按部门快速看</div>${renderOfferDepartmentCards(getOfferRecords())}</div></section></section><section class="bottom-grid"><section class="panel section-card"><div class="panel-head"><div><h3>项目管理</h3><p>各状态项目数与进行中的重点</p></div></div>${renderProjectOverview()}</section><div class="stack-column"><section class="panel section-card"><div class="panel-head"><div><h3>复盘中心</h3><p>周复盘与 AI 自动摘要</p></div></div><div class="review-box"><div class="review-title">${safeText((state.review||{}).title || '暂无复盘')}</div><div class="review-summary">${safeText((state.review||{}).summary || '')}</div><div class="review-points">${((state.review||{}).points || []).map((item) => `<article class="review-point"><strong>${safeText(item.title)}</strong><div>${safeText(item.text)}</div></article>`).join('')}</div></div></section><section class="panel section-card"><div class="panel-head"><div><h3>知识库</h3><p>招聘信息、流程说明、规则沉淀</p></div></div><div class="knowledge-list">${filterKnowledge().map((item) => `<article class="knowledge-card" role="button" tabindex="0" data-kind="knowledge" data-id="${safeText(item.id)}"><div class="job-card-head"><h4>${safeText(item.title)}</h4><span class="badge ok">${safeText(item.category)}</span></div><p>${safeText(item.summary)}</p><div class="tags">${renderTags(item.tags || [])}</div></article>`).join('')}</div></section></div></section>`;
}

function renderRecruitmentPage() {
  const filtered = filterRecruitments();
  const departments = ['all', ...new Set(state.recruitments.map((item) => item.department).filter(Boolean))];
  const selected = getSelectedRecruitment();
  const detail = state.editingRecruitmentId ? renderRecruitmentEditor(getRecruitmentById(state.editingRecruitmentId) || selected || {}) : selected ? renderRecruitmentDetail(selected) : '<div class="job-desc">还没有岗位，先点“新建岗位”</div>';
  return `<section class="panel single-module recruitment-layout"><div class="panel-head"><div><h2>招聘管理</h2><p>左边看岗位和部门，右边直接看详情或编辑</p></div><div class="panel-tools"><button class="toolbar-btn highlight" type="button" data-action="add-recruitment">新建岗位</button></div></div><div class="recruitment-split"><aside class="recruitment-list"><div class="recruitment-list-head">在招岗位</div><div class="recruitment-filters">${departments.map((dept) => `<button class="filter-pill ${state.departmentFilter === dept ? 'active' : ''}" type="button" data-dept="${safeText(dept)}">${safeText(dept === 'all' ? '全部部门' : dept)}</button>`).join('')}</div><div class="recruitment-list-body">${filtered.map(renderJobCard).join('') || '<div class="job-desc">暂无岗位</div>'}</div></aside><section class="recruitment-detail">${detail}</section></div></section>`;
}

function renderEventEditor(item = {}) {
  const subtasksText = (item.subtasks || []).map((s) => `${s.done ? '[x] ' : ''}${s.text}`).join('\n');
  return `<form class="editor-form" id="eventEditor"><input type="hidden" name="id" value="${safeText(item.id || '')}" /><div class="editor-grid"><label class="field"><span>项目名称</span><input name="title" type="text" value="${safeText(item.title || '')}" /></label><label class="field"><span>类型</span><input name="category" type="text" value="${safeText(item.category || '')}" placeholder="如 项目推进 / 系统更新" /></label><label class="field"><span>状态</span><select name="status">${optionTags(KANBAN_STATUS, normalizeStatus(item.status))}</select></label><label class="field"><span>负责人</span><input name="owner" type="text" value="${safeText(item.owner || '')}" /></label><label class="field"><span>下一步动作</span><input name="nextAction" type="text" value="${safeText(item.nextAction || '')}" /></label><label class="field"><span>卡点</span><input name="blocker" type="text" value="${safeText(item.blocker || '')}" /></label><label class="field"><span>截止/里程碑日期</span><input name="deadline" type="date" value="${safeText(item.deadline || '')}" /></label><label class="field"><span>风险等级</span><select name="risk">${optionTags(EVENT_RISK_OPTIONS, item.risk || 'ok')}</select></label><label class="field field-span-2"><span>子任务（每行一条，已完成的行首加 [x]）</span><textarea name="subtasks" rows="4" placeholder="[x] 已完成的任务&#10;待办的任务">${safeText(subtasksText)}</textarea></label><label class="field field-span-2"><span>说明</span><textarea name="description" rows="3">${safeText(item.description || '')}</textarea></label></div><div class="drawer-actions"><button class="toolbar-btn strong" type="submit">保存</button><button class="toolbar-btn" type="button" data-action="cancel-event-edit">取消</button>${item.id ? '<button class="toolbar-btn danger-btn" type="button" data-action="delete-event">删除</button>' : ''}</div></form>`;
}

// 项目进度 = 已完成子任务 / 总子任务
function projectProgress(item) {
  const subs = item.subtasks || [];
  if (!subs.length) return null;
  return Math.round((subs.filter((s) => s.done).length / subs.length) * 100);
}

function renderProjectCard(item) {
  const prog = projectProgress(item);
  const subs = item.subtasks || [];
  const doneCount = subs.filter((s) => s.done).length;
  const progBar = prog !== null ? `<div class="proj-progress"><div class="proj-progress-bar" style="width:${prog}%"></div></div><div class="proj-progress-text">${doneCount}/${subs.length} 子任务 · ${prog}%</div>` : '';
  const meta = [];
  if (item.owner) meta.push(`👤 ${safeText(item.owner)}`);
  if (item.deadline) meta.push(`📅 ${safeText(item.deadline)}`);
  const blocker = item.blocker ? `<div class="proj-blocker">⚠ ${safeText(item.blocker)}</div>` : '';
  const next = item.nextAction ? `<div class="proj-next">下一步：${safeText(item.nextAction)}</div>` : '';
  return `<article class="proj-card" draggable="true" role="button" tabindex="0" data-kind="event" data-id="${safeText(item.id)}"><div class="proj-card-head"><strong>${safeText(item.title)}</strong>${item.risk && item.risk !== 'ok' ? `<span class="badge ${badgeClass(item.risk)}">${item.risk === 'danger' ? '高' : '中'}</span>` : ''}</div>${item.category ? `<div class="proj-cat">${safeText(item.category)}</div>` : ''}${progBar}${next}${blocker}<div class="proj-meta">${meta.join('　')}</div></article>`;
}

function renderProjectDetail(item) {
  const prog = projectProgress(item);
  const subs = item.subtasks || [];
  const subList = subs.length ? subs.map((s) => `<label class="sub-check"><input type="checkbox" data-proj-id="${safeText(item.id)}" data-sub-id="${safeText(s.id)}" ${s.done ? 'checked' : ''} /><span class="${s.done ? 'done' : ''}">${safeText(s.text)}</span></label>`).join('') : '<div class="job-desc">暂无子任务，编辑项目时可添加</div>';
  const moveBtns = KANBAN_STATUS.filter((st) => st !== normalizeStatus(item.status)).map((st) => `<button class="toolbar-btn" type="button" data-move-status="${safeText(st)}" data-proj-id="${safeText(item.id)}">移到「${safeText(st)}」</button>`).join('');
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">项目信息</div><div class="drawer-grid"><div class="kv"><span>状态</span><strong><span class="badge ${KANBAN_BADGE[normalizeStatus(item.status)]}">${safeText(normalizeStatus(item.status))}</span></strong></div><div class="kv"><span>负责人</span><strong>${safeText(item.owner || '待补充')}</strong></div><div class="kv"><span>类型</span><strong>${safeText(item.category || '—')}</strong></div><div class="kv"><span>截止/里程碑</span><strong>${safeText(item.deadline || '未设置')}</strong></div></div>${item.blocker ? `<div class="proj-blocker">⚠ 卡点：${safeText(item.blocker)}</div>` : ''}${item.nextAction ? `<div class="proj-next">下一步：${safeText(item.nextAction)}</div>` : ''}</div><div class="trend-card"><div class="trend-title">子任务${prog !== null ? `（${prog}%）` : ''}</div>${prog !== null ? `<div class="proj-progress"><div class="proj-progress-bar" style="width:${prog}%"></div></div>` : ''}<div class="sub-list">${subList}</div></div>${item.description ? `<div class="trend-card"><div class="trend-title">说明</div><div class="drawer-note"><p>${safeText(item.description)}</p></div></div>` : ''}<div class="trend-card"><div class="trend-title">切换状态</div><div class="status-actions">${moveBtns}</div></div><div class="drawer-actions"><button class="toolbar-btn strong" type="button" data-action="edit-project" data-id="${safeText(item.id)}">编辑项目</button><button class="toolbar-btn" type="button" data-action="close-drawer">关闭</button></div></div>`;
}

function renderProjectOverview() {
  const evts = state.events || [];
  if (!evts.length) return '<div class="job-desc">暂无项目，去「项目管理」新建。</div>';
  const counts = KANBAN_STATUS.map((st) => ({ st, n: evts.filter((e) => normalizeStatus(e.status) === st).length }));
  const summary = `<div class="proj-overview-counts">${counts.map((c) => `<div class="poc-item"><span class="badge ${KANBAN_BADGE[c.st]}">${safeText(c.st)}</span><b>${c.n}</b></div>`).join('')}</div>`;
  const active = evts.filter((e) => normalizeStatus(e.status) === '进行中').slice(0, 4);
  const cards = active.length ? `<div class="card-grid">${active.map(renderProjectCard).join('')}</div>` : '';
  return summary + cards;
}

function renderEventsPage() {
  const filtered = filterEvents();
  const editing = state.eventEditingId ? (state.eventEditingId === '__new__' ? {} : state.events.find((e) => e.id === state.eventEditingId) || {}) : null;
  const editor = editing ? `<div class="trend-card"><div class="trend-title">${editing.id ? '编辑项目' : '新建项目'}</div>${renderEventEditor(editing)}</div>` : '';
  const cols = KANBAN_STATUS.map((status) => {
    const items = filtered.filter((e) => normalizeStatus(e.status) === status);
    return `<div class="kanban-col" data-status="${safeText(status)}"><div class="kanban-col-head"><span class="badge ${KANBAN_BADGE[status]}">${safeText(status)}</span><span class="kanban-count">${items.length}</span></div><div class="kanban-col-body">${items.map(renderProjectCard).join('') || '<div class="kanban-empty">暂无</div>'}</div></div>`;
  }).join('');
  return `<section class="panel single-module"><div class="panel-head"><div><h2>项目管理</h2><p>看板视图：拖动卡片到目标列切换状态，或点开卡片用按钮切换</p></div><div class="panel-tools"><button class="toolbar-btn highlight" type="button" data-action="add-event">新建项目</button></div></div>${editor}<div class="kanban-board">${cols}</div></section>`;
}

function renderOffersPage() {
  const records = filterOffers();
  const latest = records[0];
  const statuses = [
    { key: 'all', label: '全部记录' },
    { key: 'pending', label: '待确认' },
    { key: 'accepted', label: '接受 offer' },
    { key: 'employed', label: '已入职' },
    { key: 'declined', label: '拒绝 / 放弃' }
  ];
  const editingRecord = state.offerEditingId ? getOfferRecords().find((item) => item.id === state.offerEditingId) : null;
  return `<section class="panel single-module"><div class="panel-head"><div><h2>Offer 产出</h2><p>录用台账和推进结果</p></div><div class="panel-tools"><label class="field short"><input type="date" id="offerDateFrom" value="${safeText(state.offerDateFrom)}" /></label><label class="field short"><input type="date" id="offerDateTo" value="${safeText(state.offerDateTo)}" /></label>${statuses.map((item) => `<button class="chip ${state.offerView === item.key ? 'active' : ''}" type="button" data-offer-view="${safeText(item.key)}">${safeText(item.label)}</button>`).join('')}</div></div>${renderOfferSummaryCards(records)}${state.offerEditingId ? `<div class="trend-card"><div class="trend-title">编辑记录</div>${renderOfferEditForm(editingRecord || records[0] || {})}</div>` : ''}<div class="trend-card"><div class="trend-title">按部门快速看</div>${renderOfferDepartmentCards(records)}</div><div class="trend-card"><div class="trend-title">录用明细</div><div class="job-desc">${latest ? `最新一条：${safeText(latest.plannedDate)} · ${safeText(latest.name)} · ${safeText(latest.title)}` : '暂无记录'}</div><div class="event-table-wrap"><div class="event-table-head"><span>拟录用时间</span><span>姓名</span><span>部门</span><span>岗位名称</span><span>岗位类型</span><span>渠道</span><span>状态</span><span>最终状态</span></div><div class="event-table">${renderOfferRows(records)}</div></div></div></section>`;
}

function renderReviewPage() {
  // 会议编辑态：整页表单
  if (state.meetingEditingId) {
    const editing = state.meetingEditingId === '__new__' ? {} : (state.meetings.find((m) => m.id === state.meetingEditingId) || {});
    return `<section class="panel single-module"><div class="panel-head"><div><h2>复盘中心</h2><p>${editing.id ? '编辑会议记录' : '新增会议记录'}</p></div></div>${renderMeetingEditor(editing)}</section>`;
  }
  const review = state.review || { title: '', summary: '', points: [] };
  // 周报复盘编辑态
  if (state.reviewEditing) {
    const pointsText = (review.points || []).map((p) => `${p.title}｜${p.text}`).join('\n');
    return `<section class="panel single-module"><div class="panel-head"><div><h2>复盘中心</h2><p>编辑周报复盘</p></div></div><form class="editor-form" id="reviewEditor"><label class="field"><span>复盘标题</span><input name="title" type="text" value="${safeText(review.title)}" /></label><label class="field"><span>总结概述</span><textarea name="summary" rows="3">${safeText(review.summary)}</textarea></label><label class="field"><span>复盘要点（每行一条，格式：要点标题｜要点内容）</span><textarea name="points" rows="6">${safeText(pointsText)}</textarea></label><div class="drawer-actions"><button class="toolbar-btn strong" type="submit">保存</button><button class="toolbar-btn" type="button" data-action="cancel-review-edit">取消</button></div></form></section>`;
  }
  // 正常态：顶部周报复盘卡 + 会议复盘库
  const reviewCard = `<div class="trend-card"><div class="trend-head-row"><div class="trend-title">周报复盘：${safeText(review.title || '暂无标题')}</div><button class="toolbar-btn" type="button" data-action="edit-review">编辑周报</button></div><div class="review-summary">${safeText(review.summary || '暂无总结')}</div><div class="review-points">${(review.points || []).map((item) => `<article class="review-point"><strong>${safeText(item.title)}</strong><div>${safeText(item.text)}</div></article>`).join('') || '<div class="job-desc">还没有复盘要点</div>'}</div></div>`;
  return `<section class="panel single-module"><div class="panel-head"><div><h2>复盘中心</h2><p>周报复盘 + 会议/面试记录库（AI 摘要）</p></div><div class="panel-tools"><button class="toolbar-btn highlight" type="button" data-action="add-meeting">新增会议记录</button></div></div>${reviewCard}${renderMeetingLibrary()}</section>`;
}

// 会议复盘库：分类 + 时间筛选 + 卡片网格（按日期倒序，月份分组）
function renderMeetingLibrary() {
  const cats = [{ key: 'all', label: '全部' }, ...MEETING_CATEGORIES.map((c) => ({ key: c, label: c }))];
  const chips = cats.map((c) => `<button class="chip ${state.meetingCategory === c.key ? 'active' : ''}" type="button" data-meeting-cat="${safeText(c.key)}">${safeText(c.label)}</button>`).join('');
  const list = filterMeetings();
  // 按月份分组
  const groups = new Map();
  list.forEach((m) => {
    const month = (m.date || '').slice(0, 7) || '未填日期';
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month).push(m);
  });
  const body = list.length
    ? [...groups.entries()].map(([month, items]) => `<div class="meeting-month"><div class="meeting-month-head">${safeText(month)}（${items.length}）</div><div class="meeting-grid">${items.map(renderMeetingCard).join('')}</div></div>`).join('')
    : '<div class="job-desc">还没有会议记录，点右上「新增会议记录」添加。粘贴会议原文后会自动生成约 50 字摘要。</div>';
  return `<div class="trend-card"><div class="trend-title">会议 / 面试记录库</div><div class="meeting-filters"><div class="chip-row">${chips}</div><div class="meeting-date-filter"><label class="field short"><input type="date" id="meetingDateFrom" value="${safeText(state.meetingDateFrom)}" /></label><span class="date-sep">~</span><label class="field short"><input type="date" id="meetingDateTo" value="${safeText(state.meetingDateTo)}" /></label></div></div>${body}</div>`;
}

function filterMeetings() {
  const q = state.query.toLowerCase();
  return (state.meetings || []).filter((m) => {
    const matchCat = state.meetingCategory === 'all' || m.category === state.meetingCategory;
    const fromOk = !state.meetingDateFrom || (m.date || '') >= state.meetingDateFrom;
    const toOk = !state.meetingDateTo || (m.date || '') <= state.meetingDateTo;
    const matchQ = !q || [m.title, m.category, m.summary, m.content].join(' ').toLowerCase().includes(q);
    return matchCat && fromOk && toOk && matchQ;
  }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

const MEETING_CAT_BADGE = { '周会': 'info', '面试': 'warn', '项目会': 'ok', '其他': 'plum' };
function renderMeetingCard(m) {
  const badge = MEETING_CAT_BADGE[m.category] || 'info';
  const summary = m.summary || summarizeMeeting(m.content) || '（暂无摘要）';
  return `<article class="meeting-card" role="button" tabindex="0" data-kind="meeting" data-id="${safeText(m.id)}"><div class="meeting-card-head"><span class="badge ${badge}">${safeText(m.category || '其他')}</span><span class="meeting-date">${safeText(m.date || '未填日期')}</span></div><h4 class="meeting-title">${safeText(m.title || '未命名会议')}</h4><p class="meeting-summary">${safeText(summary)}</p></article>`;
}

function renderMeetingDetail(m) {
  const badge = MEETING_CAT_BADGE[m.category] || 'info';
  const summary = m.summary || summarizeMeeting(m.content) || '（暂无摘要）';
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">会议信息</div><div class="drawer-grid"><div class="kv"><span>分类</span><strong><span class="badge ${badge}">${safeText(m.category || '其他')}</span></strong></div><div class="kv"><span>日期</span><strong>${safeText(m.date || '未填')}</strong></div><div class="kv"><span>标题</span><strong>${safeText(m.title || '未命名')}</strong></div></div></div><div class="trend-card"><div class="trend-title">AI 摘要（约 50 字）</div><div class="drawer-note meeting-summary-box"><p>${safeText(summary)}</p></div></div><div class="trend-card"><div class="trend-title">会议原文</div><div class="drawer-note">${renderMarkdownBlock(m.content || '')}</div></div><div class="drawer-actions"><button class="toolbar-btn highlight" type="button" data-action="edit-meeting" data-id="${safeText(m.id)}">编辑</button><button class="toolbar-btn danger-btn" type="button" data-action="delete-meeting" data-id="${safeText(m.id)}">删除</button><button class="toolbar-btn" type="button" data-action="close-drawer">关闭</button></div></div>`;
}

function renderMeetingEditor(m = {}) {
  const catOpts = MEETING_CATEGORIES.map((c) => `<option value="${safeText(c)}" ${m.category === c ? 'selected' : ''}>${safeText(c)}</option>`).join('');
  return `<form class="editor-form" id="meetingEditor" data-meeting-id="${safeText(m.id || '')}"><div class="editor-grid"><label class="field"><span>分类</span><select name="category">${catOpts}</select></label><label class="field"><span>会议日期</span><input name="date" type="date" value="${safeText(m.date || '')}" /></label><label class="field field-span-2"><span>会议标题</span><input name="title" type="text" value="${safeText(m.title || '')}" placeholder="如 第23周招聘周会 / 张三终面" /></label><label class="field field-span-2"><span>会议原文（粘贴完整内容，保存时自动生成约 50 字摘要）</span><textarea name="content" rows="10">${safeText(m.content || '')}</textarea></label><label class="field field-span-2"><span>摘要（留空则自动生成；也可手动改写）</span><textarea name="summary" rows="2" placeholder="留空自动生成">${safeText(m.summary || '')}</textarea></label></div><div class="drawer-actions"><button class="toolbar-btn strong" type="submit">保存</button><button class="toolbar-btn" type="button" data-action="cancel-meeting-edit">取消</button>${m.id ? '<button class="toolbar-btn danger-btn" type="button" data-action="delete-meeting-edit">删除</button>' : ''}</div></form>`;
}

function renderKnowledgeEditor(item = {}) {
  const tagsText = Array.isArray(item.tags) ? item.tags.join('、') : (item.tags || '');
  return `<form class="editor-form" id="knowledgeEditor"><input type="hidden" name="id" value="${safeText(item.id || '')}" /><div class="editor-grid"><label class="field"><span>标题</span><input name="title" type="text" value="${safeText(item.title || '')}" /></label><label class="field"><span>类型</span><input name="category" type="text" value="${safeText(item.category || '文档')}" /></label><label class="field field-span-2"><span>摘要</span><textarea name="summary" rows="3">${safeText(item.summary || '')}</textarea></label><label class="field field-span-2"><span>标签（顿号或逗号分隔）</span><input name="tags" type="text" value="${safeText(tagsText)}" /></label><label class="field field-span-2"><span>来源链接</span><input name="url" type="text" value="${safeText(item.url || '')}" /></label></div><div class="drawer-actions"><button class="toolbar-btn strong" type="submit">保存</button><button class="toolbar-btn" type="button" data-action="cancel-knowledge-edit">取消</button>${item.id ? '<button class="toolbar-btn danger-btn" type="button" data-action="delete-knowledge">删除</button>' : ''}</div></form>`;
}

function renderKnowledgePage() {
  const filtered = filterKnowledge();
  const editing = state.knowledgeEditingId ? (state.knowledgeEditingId === '__new__' ? {} : state.knowledge.find((k) => k.id === state.knowledgeEditingId) || {}) : null;
  const editor = editing ? `<div class="trend-card"><div class="trend-title">${editing.id ? '编辑文档' : '新建文档'}</div>${renderKnowledgeEditor(editing)}</div>` : '';
  return `<section class="panel single-module"><div class="panel-head"><div><h2>知识库</h2><p>系统文档、FAQ、流程与规则说明</p></div><div class="panel-tools"><button class="toolbar-btn highlight" type="button" data-action="add-knowledge">新建文档</button></div></div>${editor}<div class="knowledge-list knowledge-list-large">${filtered.map((item) => `<article class="knowledge-card" role="button" tabindex="0" data-kind="knowledge" data-id="${safeText(item.id)}"><div class="job-card-head"><h4>${safeText(item.title)}</h4><span class="badge ok">${safeText(item.category)}</span></div><p>${safeText(item.summary)}</p><div class="tags">${renderTags(item.tags || [])}</div></article>`).join('') || '<div class="job-desc">暂无文档，点“新建文档”添加</div>'}</div></section>`;
}

function renderSettingsPage() {
  const counts = `岗位 ${state.recruitments.length} · Offer ${state.offerRecords.length} · 事项 ${state.events.length} · 文档 ${state.knowledge.length}`;
  // 上次导出提示：未导出过/超过 7 天高亮提醒
  const lastIso = localStorage.getItem(LAST_EXPORT_KEY);
  let exportTip = '<span class="export-tip warn">还没导出过备份，建议先导出一份。</span>';
  if (lastIso) {
    const last = new Date(lastIso);
    const days = Math.floor((Date.now() - last.getTime()) / 86400000);
    const dateStr = lastIso.slice(0, 10);
    const ago = days <= 0 ? '今天' : `${days} 天前`;
    exportTip = days >= 7
      ? `<span class="export-tip warn">最近导出于 ${dateStr}（${ago}），已超过 7 天，建议尽快再导一份。</span>`
      : `<span class="export-tip ok">最近导出于 ${dateStr}（${ago}）。</span>`;
  }
  const storeMode = store.adapterName === 'supabase'
    ? '<strong>数据存储</strong><span>已连接 Supabase 云端，多设备/多人共享同一份数据。本地仅作离线兜底。</span>'
    : '<strong>数据存储</strong><span>当前为本机模式（localStorage），数据只在这台浏览器。填入 Supabase 配置后即切换为云端共享。</span>';
  // 登录状态块：云端模式且已登录时显示当前账号 + 退出登录按钮
  let accountBox = '';
  if (window.WorkbenchAuth && window.WorkbenchAuth.isEnabled()) {
    const user = window.WorkbenchAuth.getUser();
    const email = user && user.email ? safeText(user.email) : '已登录';
    accountBox = `<div class="settings-box"><strong>登录账号</strong><span>当前以 ${email} 登录。数据接口已要求登录，未登录无法读写。</span><div class="drawer-actions" style="margin-top:10px"><button class="toolbar-btn danger-btn" type="button" data-action="sign-out">退出登录</button></div></div>`;
  }
  return `<section class="panel single-module"><div class="panel-head"><div><h2>设置中心</h2><p>数据管理与备份</p></div></div><div class="trend-card"><div class="trend-title">数据备份</div><div class="job-desc">当前数据全部存在这台浏览器本地（${safeText(counts)}）。清浏览器缓存会丢失，建议定期导出备份。</div><div class="export-status">${exportTip}</div><div class="drawer-actions"><button class="toolbar-btn strong" type="button" data-action="export-data">导出备份（JSON）</button><button class="toolbar-btn highlight" type="button" data-action="import-data">从备份导入</button><button class="toolbar-btn danger-btn" type="button" data-action="clear-data">清空所有数据</button></div></div><div class="settings-placeholder">${accountBox}<div class="settings-box"><strong>提醒规则</strong><span>首页「AI 优先处理建议」已按真实数据派生：P0 岗位、高风险事件、待跟进 Offer。</span></div><div class="settings-box">${storeMode}</div><div class="settings-box"><strong>后续可扩展</strong><span>上云同步、飞书每日推送等能力可在此基础上接入。</span></div></div></section>`;
}

function renderAiSummary() {
  const p0 = state.recruitments.filter((r) => r.priority === 'P0');
  const danger = state.events.filter((e) => e.risk === 'danger');
  const pending = state.offerRecords.filter((o) => !o.finalStatus);
  const lines = [];
  if (p0.length) lines.push(`P0 岗位 ${p0.length} 个待优先推进：${p0.map((r) => r.title).join('、')}。`);
  if (danger.length) lines.push(`高风险事项 ${danger.length} 项：${danger.map((e) => e.title).join('、')}，需尽快处理卡点。`);
  if (pending.length) lines.push(`Offer 待跟进 ${pending.length} 条，建议加快确认。`);
  if (!lines.length) lines.push('当前没有突出风险，各模块推进平稳。');
  return `<div class="detail-stack"><div class="trend-card"><div class="trend-title">本期重点（按当前数据自动汇总）</div><div class="drawer-note">${lines.map((l) => `<p>· ${safeText(l)}</p>`).join('')}</div></div></div>`;
}

// 各路由顶栏搜索提示，贴合当前模块的搜索范围
const SEARCH_HINTS = {
  overview: '搜索岗位 / 项目 / 文档',
  recruitment: '搜索岗位名称 / 部门 / 对接人',
  events: '搜索项目 / 类型 / 负责人 / 卡点',
  offers: '搜索姓名 / 部门 / 岗位 / 渠道',
  knowledge: '搜索文档标题 / 摘要 / 标签',
  review: '当前页不支持搜索',
  settings: '当前页不支持搜索'
};

function renderRoute(route) {
  state.route = route;
  els.navItems.forEach((button) => button.classList.toggle('active', button.dataset.route === route));
  // 记录滚动位置，渲染后恢复，避免改候选人阶段/勾子任务等操作时跳回顶部
  const body = document.querySelector('.workspace-body');
  const prevScroll = body ? body.scrollTop : 0;
  const html = route === 'overview' ? renderOverviewPage() : route === 'recruitment' ? renderRecruitmentPage() : route === 'events' ? renderEventsPage() : route === 'offers' ? renderOffersPage() : route === 'review' ? renderReviewPage() : route === 'knowledge' ? renderKnowledgePage() : renderSettingsPage();
  els.routeView.innerHTML = html;
  if (body && prevScroll) body.scrollTop = prevScroll;
  // 顶栏搜索提示随模块变化；不支持搜索的页禁用输入框
  if (els.searchInput) {
    const noSearch = route === 'review' || route === 'settings';
    els.searchInput.placeholder = SEARCH_HINTS[route] || '搜索';
    els.searchInput.disabled = noSearch;
  }
  bindRouteEvents();
}

function openDrawer(item, type, bodyHtml) {
  els.drawerType.textContent = type || '详情';
  els.drawerTitle.textContent = item?.title || item?.name || '详情';
  els.drawerBody.innerHTML = bodyHtml || `<div class="drawer-note"><p>${safeText(item?.description || item?.summary || '暂无')}</p></div>`;
  els.drawer.classList.add('open');
  els.drawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  els.drawer.classList.remove('open');
  els.drawer.setAttribute('aria-hidden', 'true');
}
function upsertRecruitment(form) {
  const data = new FormData(form);
  const title = clean(data.get('title'));
  if (!title) { toast('请填写岗位名称', 'danger'); return; }
  const id = clean(data.get('id')) || `job-${Date.now()}`;
  const item = {
    id,
    requestTime: clean(data.get('requestTime')),
    department: clean(data.get('department')),
    subDept: clean(data.get('subDept')),
    projectGroup: clean(data.get('projectGroup')),
    title,
    level: clean(data.get('level')) || '无',
    salaryRange: clean(data.get('salaryRange')),
    priority: clean(data.get('priority')) || 'P1',
    businessContact: clean(data.get('businessContact')),
    hrbp: clean(data.get('hrbp')),
    roleTypes: data.getAll('roleTypes').map((v) => clean(v)).filter(Boolean),
    status: clean(data.get('status')) || '持续招聘',
    profile: clean(data.get('profile')),
    jd: clean(data.get('jd')),
    reason: clean(data.get('reason')),
    notes: clean(data.get('notes')),
    process: clean(data.get('process')).split('\n').map((line) => line.trim()).filter(Boolean),
    candidates: getRecruitmentById(id)?.candidates || []
  };
  store.save('recruitments', item); // 按 id upsert 进缓存并落盘
  state.selectedRecruitmentId = id;
  state.editingRecruitmentId = null;
  toast('岗位已保存');
  renderRoute('recruitment');
}

function getRecruitmentById(id) {
  return state.recruitments.find((item) => item.id === id) || null;
}

function deleteRecruitment(id) {
  store.remove('recruitments', id); // 就地删缓存并落盘，state.recruitments 引用不变
  if (state.selectedRecruitmentId === id) state.selectedRecruitmentId = state.recruitments[0]?.id || null;
  state.editingRecruitmentId = null;
  toast('岗位已删除');
  renderRoute('recruitment');
}

// ---- 候选人 CRUD（挂在岗位的 candidates[] 下）----
// 候选人结构预留 oaId/source，OA 对接后可据 oaId 做幂等同步
function addCandidate(jobId, form) {
  const job = getRecruitmentById(jobId);
  if (!job) return;
  const data = new FormData(form);
  const name = clean(data.get('name'));
  if (!name) { toast('请填写候选人姓名', 'danger'); return; }
  job.candidates = job.candidates || [];
  job.candidates.push({
    id: uid('cand'),
    name,
    stage: clean(data.get('stage')) || '简历筛选',
    source: clean(data.get('source')) || '',
    note: '',
    oaId: '' // 预留：OA 简历库 ID
  });
  store.save('recruitments', job); // 候选人嵌在岗位里，整条岗位 upsert
  toast(`已添加候选人「${name}」`);
  renderRoute('recruitment');
}

function updateCandidateStage(jobId, candId, stage) {
  const job = getRecruitmentById(jobId);
  const cand = job?.candidates?.find((c) => c.id === candId);
  if (!cand) return;
  cand.stage = stage;
  store.save('recruitments', job);
  // 推进到发 Offer / 入职阶段时，自动同步到 Offer 台账（幂等）
  const synced = syncCandidateToOffer(job, cand);
  toast(synced ? `已更新阶段：${stage}，并同步到 Offer 台账` : `已更新阶段：${stage}`);
  renderRoute('recruitment');
}

// 候选人 → Offer 台账同步：候选人到"已发Offer"/"已入职"时，在台账建/更新一条关联记录
// 用 offer.candidateId 做幂等键，重复推进不会生成多条。返回是否发生了同步
function syncCandidateToOffer(job, cand) {
  const stageToOffer = {
    '已发Offer': { processStatus: '已发offer', finalStatus: '' },
    '已入职': { processStatus: '接受offer', finalStatus: '已入职' }
  };
  const mapped = stageToOffer[cand.stage];
  if (!mapped) return false;
  let offer = state.offerRecords.find((o) => o.candidateId === cand.id);
  if (offer) {
    // 已有关联记录：只推进状态，不覆盖用户在台账里手填的部门/薪资等
    offer.processStatus = mapped.processStatus;
    if (mapped.finalStatus) offer.finalStatus = mapped.finalStatus;
  } else {
    offer = {
      id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      candidateId: cand.id,
      jobId: job.id,
      plannedDate: '',
      name: cand.name || '',
      deptGroup: normalizeDept(job.department).group, // 从岗位部门推大类，避免归「未分类」
      department: job.department || '',
      title: job.title || '',
      roleType: '',
      processStatus: mapped.processStatus,
      channel: cand.source || '',
      finalStatus: mapped.finalStatus,
      note: '由候选人漏斗自动生成'
    };
  }
  store.save('offers', offer); // upsert：已有则替换、没有则新增置顶
  return true;
}

// 备注保存：只存盘不重渲，避免失焦时输入框被重建、焦点丢失
function updateCandidateNote(jobId, candId, note) {
  const job = getRecruitmentById(jobId);
  const cand = job?.candidates?.find((c) => c.id === candId);
  if (!cand || cand.note === note) return;
  cand.note = note;
  store.save('recruitments', job);
  toast('备注已保存');
}

function deleteCandidate(jobId, candId) {
  const job = getRecruitmentById(jobId);
  if (!job) return;
  job.candidates = (job.candidates || []).filter((c) => c.id !== candId);
  store.save('recruitments', job);
  toast('已移除候选人');
  renderRoute('recruitment');
}

function upsertOffer(form) {
  const data = new FormData(form);
  const id = clean(form.dataset.offerId) || `offer-${Date.now()}`;
  const existing = state.offerRecords.find((record) => record.id === id);
  const name = clean(data.get('name'));
  if (!name) { toast('请填写候选人姓名', 'danger'); return false; }
  const item = {
    id,
    plannedDate: clean(data.get('plannedDate')),
    name,
    deptGroup: clean(data.get('deptGroup')),
    department: clean(data.get('department')),
    title: clean(data.get('title')),
    roleType: clean(data.get('roleType')),
    processStatus: clean(data.get('processStatus')),
    channel: clean(data.get('channel')),
    finalStatus: clean(data.get('finalStatus')),
    jobId: clean(data.get('jobId')), // 关联岗位 id（可空）
    candidateId: existing?.candidateId || '', // 保留候选人关联键，编辑不丢
    note: clean(data.get('note'))
  };
  // 部门大类兜底：只填了子部门没选大类时，用 normalizeDept 自动推
  if (!DEPT_GROUPS.includes(item.deptGroup)) {
    item.deptGroup = normalizeDept(item.department).group;
  }
  // 业务校验：拟录用日期不能早于关联岗位的需求时间
  if (item.plannedDate && item.jobId) {
    const job = getRecruitmentById(item.jobId);
    if (job?.requestTime && item.plannedDate < job.requestTime) {
      toast(`拟录用日期不能早于岗位需求时间（${job.requestTime}）`, 'danger');
      return false;
    }
  }
  // 状态纠正：已入职必然已接受 Offer，避免流程状态与最终状态自相矛盾
  if (item.finalStatus === '已入职' && item.processStatus !== '接受offer') {
    item.processStatus = '接受offer';
  }
  store.save('offers', item);
  state.offerEditingId = null;
  toast('Offer 已保存');
  renderRoute('offers');
  return true;
}

function deleteOffer(id) {
  store.remove('offers', id);
  state.offerEditingId = null;
  renderRoute('offers');
}

function updateOfferStatus(id, status) {
  const record = state.offerRecords.find((item) => item.id === id);
  if (!record) return;
  record.processStatus = status;
  if (status === '已入职') record.finalStatus = '已入职';
  if (/拒绝|放弃/.test(status)) record.finalStatus = status;
  store.save('offers', record);
  toast(`已标记为「${status}」`);
  renderRoute('offers');
}

// ---- 事件推进 CRUD ----
function upsertEvent(form) {
  const data = new FormData(form);
  const id = clean(data.get('id')) || uid('evt');
  const existing = state.events.find((e) => e.id === id);
  // 解析子任务：每行一条，行首 [x] 表示已完成；尽量保留旧子任务的 id
  const oldSubs = existing?.subtasks || [];
  const subtasks = clean(data.get('subtasks')).split('\n').map((line) => line.trim()).filter(Boolean).map((line, i) => {
    const done = /^\[x\]\s*/i.test(line);
    const text = line.replace(/^\[x\]\s*/i, '').replace(/^\[\s*\]\s*/, '');
    return { id: oldSubs[i]?.id || uid('st'), text, done };
  });
  const item = {
    id,
    title: clean(data.get('title')) || '未命名项目',
    category: clean(data.get('category')),
    status: clean(data.get('status')) || '待开始',
    nextAction: clean(data.get('nextAction')),
    blocker: clean(data.get('blocker')),
    deadline: clean(data.get('deadline')),
    risk: clean(data.get('risk')) || 'ok',
    owner: clean(data.get('owner')),
    description: clean(data.get('description')),
    subtasks
  };
  store.save('events', item);
  state.eventEditingId = null;
  toast('项目已保存');
  renderRoute('events');
}

// 切换项目状态（看板列）
function moveProject(id, status) {
  const p = state.events.find((e) => e.id === id);
  if (!p) return;
  p.status = status;
  store.save('events', p);
  toast(`已移到「${status}」`);
  renderRoute('events');
}

// 勾选/取消子任务
function toggleSubtask(projId, subId) {
  const p = state.events.find((e) => e.id === projId);
  const sub = p?.subtasks?.find((s) => s.id === subId);
  if (!sub) return;
  sub.done = !sub.done;
  // 全部完成自动归到已完成列；从已完成取消勾选则回到进行中
  if (p.subtasks.length && p.subtasks.every((s) => s.done)) p.status = '已完成';
  else if (normalizeStatus(p.status) === '已完成') p.status = '进行中';
  store.save('events', p);
  renderRoute('events');
}

function deleteEvent(id) {
  store.remove('events', id);
  state.eventEditingId = null;
  toast('项目已删除');
  renderRoute('events');
}

// ---- 知识库 CRUD ----
function upsertKnowledge(form) {
  const data = new FormData(form);
  const id = clean(data.get('id')) || uid('kn');
  const item = {
    id,
    title: clean(data.get('title')) || '未命名文档',
    category: clean(data.get('category')) || '文档',
    summary: clean(data.get('summary')),
    tags: clean(data.get('tags')).split(/[、,，]/).map((t) => t.trim()).filter(Boolean),
    url: normalizeUrl(data.get('url'))
  };
  store.save('knowledge', item);
  state.knowledgeEditingId = null;
  toast('文档已保存');
  renderRoute('knowledge');
}

function deleteKnowledge(id) {
  store.remove('knowledge', id);
  state.knowledgeEditingId = null;
  toast('文档已删除');
  renderRoute('knowledge');
}

// ---- 复盘保存 ----
function saveReview(form) {
  const data = new FormData(form);
  const points = clean(data.get('points')).split('\n').map((line) => {
    const [title, ...rest] = line.split(/[｜|]/);
    return { title: (title || '').trim(), text: rest.join('|').trim() };
  }).filter((p) => p.title || p.text);
  state.review = {
    title: clean(data.get('title')),
    summary: clean(data.get('summary')),
    points
  };
  state.reviewEditing = false;
  store.save('review', state.review); // 单例集合，整体写
  toast('复盘已保存');
  renderRoute('review');
}

function upsertMeeting(form) {
  const data = new FormData(form);
  const title = clean(data.get('title'));
  const content = clean(data.get('content'));
  if (!title && !content) { toast('请至少填写标题或会议原文', 'danger'); return false; }
  const id = clean(form.dataset.meetingId) || `mtg-${Date.now()}`;
  let summary = clean(data.get('summary'));
  if (!summary) summary = summarizeMeeting(content); // 留空则规则自动生成（AI 接入后换这里）
  const item = {
    id,
    category: clean(data.get('category')) || '其他',
    date: clean(data.get('date')),
    title: title || '未命名会议',
    content,
    summary,
    createdAt: getRecruitmentById ? (state.meetings.find((m) => m.id === id)?.createdAt || nowStamp()) : nowStamp()
  };
  store.save('meetings', item);
  state.meetingEditingId = null;
  toast('会议记录已保存');
  renderRoute('review');
  return true;
}

function deleteMeeting(id) {
  store.remove('meetings', id);
  state.meetingEditingId = null;
  renderRoute('review');
}

// 时间戳（避免直接 new Date() 在测试桩里出问题，浏览器正常用）
function nowStamp() {
  try { return new Date().toISOString().slice(0, 10); } catch { return ''; }
}

// ---- 数据导出 / 导入 / 清空 ----
function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    recruitments: state.recruitments,
    offers: state.offerRecords,
    events: state.events,
    knowledge: state.knowledge,
    review: state.review
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `工作台备份-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
  toast('已导出备份文件');
  if (state.route === 'settings') renderRoute('settings');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      // 导入走批量通道 replaceAll（整组替换），再把 state 指向新的缓存数组
      if (Array.isArray(obj.recruitments)) store.replaceAll('recruitments', obj.recruitments);
      if (Array.isArray(obj.offers)) store.replaceAll('offers', obj.offers);
      if (Array.isArray(obj.events)) store.replaceAll('events', obj.events);
      if (Array.isArray(obj.knowledge)) store.replaceAll('knowledge', obj.knowledge);
      if (obj.review && typeof obj.review === 'object') store.replaceAll('review', obj.review);
      pointStateToStore();
      state.selectedRecruitmentId = state.recruitments[0]?.id || null;
      toast('已从备份恢复数据');
      renderRoute(state.route);
    } catch {
      toast('导入失败：文件格式不对', 'danger');
    }
  };
  reader.readAsText(file);
}

async function clearAllData() {
  const ok = await confirmAction({ title: '清空所有数据', message: '将清除全部岗位、Offer、事件、知识库和复盘数据，并恢复为初始示例。此操作不可撤销，确定吗？', okText: '清空' });
  if (!ok) return;
  // 用默认示例数据整组替换（注意：CloudBase 适配器下这会覆盖共享库，是全员级高风险操作，已二次确认）
  store.replaceAll('recruitments', clone(defaultData.recruitments));
  store.replaceAll('offers', clone(defaultData.offers));
  store.replaceAll('events', clone(defaultData.events));
  store.replaceAll('knowledge', clone(defaultData.knowledge));
  store.replaceAll('review', clone(defaultData.review));
  pointStateToStore();
  state.selectedRecruitmentId = state.recruitments[0]?.id || null;
  toast('已清空并恢复初始数据');
  renderRoute(state.route);
}


function bindRouteEvents() {
  const root = els.routeView;
  if (state.route === 'overview') {
    root.querySelectorAll('[data-view]').forEach((chip) => chip.addEventListener('click', () => { state.reminderView = chip.dataset.view; savePrefs(); renderRoute('overview'); }));
    root.querySelectorAll('[data-risk]').forEach((chip) => chip.addEventListener('click', () => { state.riskFilter = chip.dataset.risk; renderRoute('overview'); }));
    root.querySelectorAll('[data-kind="recruitment"]').forEach((card) => card.addEventListener('click', () => { state.selectedRecruitmentId = card.dataset.id; state.departmentFilter = 'all'; renderRoute('recruitment'); }));
    root.querySelectorAll('[data-kind="knowledge"]').forEach((card) => {
      const item = state.knowledge.find((entry) => entry.id === card.dataset.id);
      if (item) card.addEventListener('click', () => openDrawer(item, '知识详情', renderKnowledgeDetail(item)));
    });
    root.querySelectorAll('[data-kind="event"]').forEach((row) => {
      const item = state.events.find((entry) => entry.id === row.dataset.id);
      if (item) row.addEventListener('click', () => openDrawer(item, '项目详情', renderProjectDetail(item)));
    });
    return;
  }

  if (state.route === 'recruitment') {
    root.querySelectorAll('[data-dept]').forEach((button) => button.addEventListener('click', () => { state.departmentFilter = button.dataset.dept; savePrefs(); renderRoute('recruitment'); }));
    root.querySelectorAll('[data-kind="recruitment"]').forEach((card) => card.addEventListener('click', () => { state.selectedRecruitmentId = card.dataset.id; state.editingRecruitmentId = null; renderRoute('recruitment'); }));
    root.querySelector('[data-action="add-recruitment"]')?.addEventListener('click', () => { state.editingRecruitmentId = '__new__'; renderRoute('recruitment'); });
    root.querySelector('#recruitmentEditor')?.addEventListener('submit', (event) => { event.preventDefault(); upsertRecruitment(event.currentTarget); });
    root.querySelector('[data-action="cancel-edit"]')?.addEventListener('click', () => { state.editingRecruitmentId = null; renderRoute('recruitment'); });
    root.querySelector('[data-action="delete-recruitment"]')?.addEventListener('click', async () => { const id = root.querySelector('#recruitmentEditor [name="id"]')?.value; if (id && await confirmAction({ title: '删除岗位', message: '确定删除该岗位？删除后不可恢复。', okText: '删除' })) deleteRecruitment(id); });
    root.querySelector('[data-action="open-edit"]')?.addEventListener('click', () => { const selected = getSelectedRecruitment(); if (selected) { state.editingRecruitmentId = selected.id; renderRoute('recruitment'); } });
    // 候选人：添加 / 改阶段 / 删除
    const jobId = state.selectedRecruitmentId;
    root.querySelector('#candAddForm')?.addEventListener('submit', (event) => { event.preventDefault(); addCandidate(jobId, event.currentTarget); });
    root.querySelectorAll('.cand-stage-select').forEach((sel) => sel.addEventListener('change', (event) => updateCandidateStage(jobId, event.target.dataset.candId, event.target.value)));
    root.querySelectorAll('.cand-note-input').forEach((inp) => inp.addEventListener('change', (event) => updateCandidateNote(jobId, event.target.dataset.candId, event.target.value.trim())));
    root.querySelectorAll('.cand-del').forEach((btn) => btn.addEventListener('click', async () => { if (await confirmAction({ title: '移除候选人', message: '确定从该岗位移除这名候选人？', okText: '移除' })) deleteCandidate(jobId, btn.dataset.candId); }));
    // 候选人反查关联 Offer：跳到台账并打开那条详情
    root.querySelectorAll('.cand-offer-link').forEach((btn) => btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const offer = state.offerRecords.find((o) => o.id === btn.dataset.offerId);
      if (!offer) { toast('关联的 Offer 记录已不存在', 'danger'); return; }
      renderRoute('offers');
      openDrawer(offer, 'Offer 详情', renderOfferDetail(offer));
    }));
    return;
  }

  if (state.route === 'offers') {
    root.querySelector('#offerDateFrom')?.addEventListener('change', (event) => { state.offerDateFrom = event.target.value; savePrefs(); renderRoute('offers'); });
    root.querySelector('#offerDateTo')?.addEventListener('change', (event) => { state.offerDateTo = event.target.value; savePrefs(); renderRoute('offers'); });
    root.querySelectorAll('[data-offer-view]').forEach((button) => button.addEventListener('click', () => { state.offerView = button.dataset.offerView; savePrefs(); renderRoute('offers'); }));
    root.querySelectorAll('[data-offer-metric]').forEach((button) => button.addEventListener('click', () => openDrawer({ title: 'Offer 明细' }, 'Offer 明细', renderOfferMetricDetail(button.dataset.offerMetric, getOfferRecords()))));
    root.querySelectorAll('[data-offer-group]').forEach((card) => card.addEventListener('click', () => openDrawer({ title: card.dataset.offerGroup }, `${card.dataset.offerGroup} · 子部门明细`, renderOfferGroupDetail(card.dataset.offerGroup, getOfferRecords()))));
    root.querySelectorAll('[data-kind="offer"]').forEach((row) => {
      const record = getOfferRecords().find((item) => item.id === row.dataset.id);
      if (record) row.addEventListener('click', () => openDrawer(record, 'Offer 详情', renderOfferDetail(record)));
    });
    root.querySelector('#offerEditor')?.addEventListener('submit', (event) => { event.preventDefault(); upsertOffer(event.currentTarget); });
    bindOfferJobPicker(root);
    root.querySelector('[data-action="cancel-offer-edit"]')?.addEventListener('click', () => { state.offerEditingId = null; renderRoute('offers'); });
    root.querySelector('[data-action="delete-offer"]')?.addEventListener('click', async () => { const id = clean(root.querySelector('#offerEditor')?.dataset.offerId); if (id && await confirmAction({ title: '删除 Offer', message: '确定删除这条 Offer 记录？删除后不可恢复。', okText: '删除' })) deleteOffer(id); });
    root.querySelectorAll('[data-offer-status]').forEach((button) => button.addEventListener('click', () => updateOfferStatus(button.dataset.offerId, button.dataset.offerStatus)));
    root.querySelector('[data-action="edit-offer"]')?.addEventListener('click', (event) => { const id = event.currentTarget?.dataset.id; if (id) { state.offerEditingId = id; renderRoute('offers'); } });
    return;
  }

  if (state.route === 'events') {
    root.querySelector('[data-action="add-event"]')?.addEventListener('click', () => { state.eventEditingId = '__new__'; renderRoute('events'); });
    root.querySelector('#eventEditor')?.addEventListener('submit', (event) => { event.preventDefault(); upsertEvent(event.currentTarget); });
    root.querySelector('[data-action="cancel-event-edit"]')?.addEventListener('click', () => { state.eventEditingId = null; renderRoute('events'); });
    root.querySelector('[data-action="delete-event"]')?.addEventListener('click', async () => { const id = root.querySelector('#eventEditor [name="id"]')?.value; if (id && await confirmAction({ title: '删除项目', message: '确定删除该项目？删除后不可恢复。', okText: '删除' })) deleteEvent(id); });
    // 看板卡片：点开详情抽屉（拖拽刚结束时不触发，避免误开）
    let justDragged = false;
    root.querySelectorAll('[data-kind="event"]').forEach((card) => {
      const item = state.events.find((entry) => entry.id === card.dataset.id);
      if (item) card.addEventListener('click', () => { if (justDragged) return; openDrawer(item, '项目详情', renderProjectDetail(item)); });
      // 拖拽源
      card.addEventListener('dragstart', (event) => {
        dragProjectId = card.dataset.id;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        try { event.dataTransfer.setData('text/plain', card.dataset.id); } catch {}
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        dragProjectId = null;
        justDragged = true;
        setTimeout(() => { justDragged = false; }, 0);
      });
    });
    // 列作为放置目标
    root.querySelectorAll('.kanban-col').forEach((col) => {
      col.addEventListener('dragover', (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; col.classList.add('drop-target'); });
      col.addEventListener('dragleave', () => col.classList.remove('drop-target'));
      col.addEventListener('drop', (event) => {
        event.preventDefault();
        col.classList.remove('drop-target');
        const id = dragProjectId || event.dataTransfer.getData('text/plain');
        const status = col.dataset.status;
        if (!id || !status) return;
        const proj = state.events.find((e) => e.id === id);
        if (proj && normalizeStatus(proj.status) === status) return; // 同列不动
        moveProject(id, status);
      });
    });
    return;
  }

  if (state.route === 'knowledge') {
    root.querySelector('[data-action="add-knowledge"]')?.addEventListener('click', () => { state.knowledgeEditingId = '__new__'; renderRoute('knowledge'); });
    root.querySelector('#knowledgeEditor')?.addEventListener('submit', (event) => { event.preventDefault(); upsertKnowledge(event.currentTarget); });
    root.querySelector('[data-action="cancel-knowledge-edit"]')?.addEventListener('click', () => { state.knowledgeEditingId = null; renderRoute('knowledge'); });
    root.querySelector('[data-action="delete-knowledge"]')?.addEventListener('click', async () => { const id = root.querySelector('#knowledgeEditor [name="id"]')?.value; if (id && await confirmAction({ title: '删除文档', message: '确定删除该文档？删除后不可恢复。', okText: '删除' })) deleteKnowledge(id); });
    root.querySelectorAll('[data-kind="knowledge"]').forEach((card) => {
      const item = state.knowledge.find((entry) => entry.id === card.dataset.id);
      if (item) card.addEventListener('click', () => openDrawer(item, '知识详情', renderKnowledgeDetail(item)));
    });
    return;
  }

  if (state.route === 'review') {
    root.querySelector('[data-action="edit-review"]')?.addEventListener('click', () => { state.reviewEditing = true; renderRoute('review'); });
    root.querySelector('[data-action="cancel-review-edit"]')?.addEventListener('click', () => { state.reviewEditing = false; renderRoute('review'); });
    root.querySelector('#reviewEditor')?.addEventListener('submit', (event) => { event.preventDefault(); saveReview(event.currentTarget); });
    // 会议库：新增/分类筛选/时间筛选/卡片点击/编辑表单
    root.querySelector('[data-action="add-meeting"]')?.addEventListener('click', () => { state.meetingEditingId = '__new__'; renderRoute('review'); });
    root.querySelectorAll('[data-meeting-cat]').forEach((btn) => btn.addEventListener('click', () => { state.meetingCategory = btn.dataset.meetingCat; renderRoute('review'); }));
    root.querySelector('#meetingDateFrom')?.addEventListener('change', (e) => { state.meetingDateFrom = e.target.value; renderRoute('review'); });
    root.querySelector('#meetingDateTo')?.addEventListener('change', (e) => { state.meetingDateTo = e.target.value; renderRoute('review'); });
    root.querySelectorAll('[data-kind="meeting"]').forEach((card) => {
      const m = state.meetings.find((x) => x.id === card.dataset.id);
      if (m) card.addEventListener('click', () => openDrawer(m, '会议详情', renderMeetingDetail(m)));
    });
    root.querySelector('#meetingEditor')?.addEventListener('submit', (event) => { event.preventDefault(); upsertMeeting(event.currentTarget); });
    root.querySelector('[data-action="cancel-meeting-edit"]')?.addEventListener('click', () => { state.meetingEditingId = null; renderRoute('review'); });
    root.querySelector('[data-action="delete-meeting-edit"]')?.addEventListener('click', async () => { const id = clean(root.querySelector('#meetingEditor')?.dataset.meetingId); if (id && await confirmAction({ title: '删除会议记录', message: '确定删除这条会议记录？删除后不可恢复。', okText: '删除' })) deleteMeeting(id); });
    return;
  }

  if (state.route === 'settings') {
    root.querySelector('[data-action="export-data"]')?.addEventListener('click', exportData);
    root.querySelector('[data-action="import-data"]')?.addEventListener('click', () => els.importFile?.click());
    root.querySelector('[data-action="clear-data"]')?.addEventListener('click', clearAllData);
    root.querySelector('[data-action="sign-out"]')?.addEventListener('click', async () => {
      if (await confirmAction({ title: '退出登录', message: '确定退出登录？退出后需重新登录才能查看数据。', okText: '退出' })) {
        window.WorkbenchAuth?.signOut();
      }
    });
  }
}

function handleCreate() {
  switch (state.route) {
    case 'recruitment': state.editingRecruitmentId = '__new__'; renderRoute('recruitment'); break;
    case 'offers': state.offerEditingId = null; renderRoute('offers'); openDrawer({ title: '新建 Offer' }, '新建 Offer', `<div class="trend-card"><div class="trend-title">新建 Offer</div>${renderOfferEditForm({})}</div>`); bindDrawerOfferForm(); break;
    case 'events': state.eventEditingId = '__new__'; renderRoute('events'); break;
    case 'knowledge': state.knowledgeEditingId = '__new__'; renderRoute('knowledge'); break;
    case 'review': state.meetingEditingId = '__new__'; renderRoute('review'); break;
    default: state.editingRecruitmentId = '__new__'; renderRoute('recruitment');
  }
}

// Offer 新建表单在抽屉里时，单独绑定它的提交/取消/删除
function bindDrawerOfferForm() {
  const body = els.drawerBody;
  body.querySelector('#offerEditor')?.addEventListener('submit', (event) => { event.preventDefault(); if (upsertOffer(event.currentTarget)) closeDrawer(); });
  body.querySelector('[data-action="cancel-offer-edit"]')?.addEventListener('click', closeDrawer);
  body.querySelector('[data-action="delete-offer"]')?.addEventListener('click', closeDrawer);
  bindOfferJobPicker(body);
}

// 关联岗位下拉 + 部门两级联动（root 可为 routeView 或 drawerBody）
function bindOfferJobPicker(root) {
  if (!root) return;
  const groupSel = root.querySelector('#offerDeptGroup');
  const deptSel = root.querySelector('#offerDept');
  // 大类变 → 重建子部门选项
  if (groupSel && deptSel) {
    groupSel.addEventListener('change', (event) => {
      deptSel.innerHTML = subDeptOptions(event.target.value, '');
    });
  }
  // 关联岗位变 → 用 normalizeDept 回填两级部门 + 岗位名
  const picker = root.querySelector('#offerJobPicker');
  if (picker) {
    picker.addEventListener('change', (event) => {
      const job = getRecruitmentById(event.target.value);
      if (!job) return;
      const title = root.querySelector('#offerTitle');
      if (title) title.value = job.title || '';
      if (groupSel && deptSel) {
        const { group, dept } = normalizeDept(job.department);
        if (DEPT_GROUPS.includes(group)) {
          groupSel.value = group;
          deptSel.innerHTML = subDeptOptions(group, dept);
        }
      }
    });
  }
}

function attachGlobalEvents() {
  els.searchInput?.addEventListener('input', (event) => { state.query = event.target.value.trim(); renderRoute(state.route); });
  els.refreshBtn?.addEventListener('click', async () => {
    // 重新从仓库拉取（共享数据集下，这样才能看到同事的改动），再渲染
    try { await store.loadAll(); pointStateToStore(); } catch (err) { console.error(err); toast('刷新失败，请重试', 'danger'); return; }
    renderRoute(state.route);
  });
  els.createBtn?.addEventListener('click', handleCreate);
  // 卡片键盘可达：聚焦后 Enter/Space 等同点击（卡片均带 role=button tabindex=0）
  els.routeView?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[role="button"][data-kind]');
    if (!card || !els.routeView.contains(card)) return;
    event.preventDefault();
    card.click();
  });
  els.aiBtn?.addEventListener('click', () => openDrawer({ title: 'AI 摘要' }, 'AI 摘要', renderAiSummary()));
  els.navItems.forEach((button) => button.addEventListener('click', () => renderRoute(button.dataset.route)));
  els.closeDrawer?.addEventListener('click', closeDrawer);
  els.drawerBackdrop?.addEventListener('click', closeDrawer);
  els.importFile?.addEventListener('change', (event) => { const file = event.target.files?.[0]; if (file) importData(file); event.target.value = ''; });
  // 抽屉内按钮委托：编辑知识、关闭
  els.drawerBody?.addEventListener('click', (event) => {
    const editKn = event.target.closest('[data-action="edit-knowledge"]');
    if (editKn) { closeDrawer(); state.knowledgeEditingId = editKn.dataset.id; renderRoute('knowledge'); return; }
    const editProj = event.target.closest('[data-action="edit-project"]');
    if (editProj) { closeDrawer(); state.eventEditingId = editProj.dataset.id; renderRoute('events'); return; }
    const moveBtn = event.target.closest('[data-move-status]');
    if (moveBtn) { closeDrawer(); moveProject(moveBtn.dataset.projId, moveBtn.dataset.moveStatus); return; }
    // Offer 详情抽屉里的状态/编辑按钮（详情渲染在抽屉内，需在此委托，否则点不动）
    const offerStatusBtn = event.target.closest('[data-offer-status]');
    if (offerStatusBtn) { closeDrawer(); updateOfferStatus(offerStatusBtn.dataset.offerId, offerStatusBtn.dataset.offerStatus); return; }
    const editOfferBtn = event.target.closest('[data-action="edit-offer"]');
    if (editOfferBtn) { closeDrawer(); state.offerEditingId = editOfferBtn.dataset.id; renderRoute('offers'); return; }
    // 会议详情抽屉里的编辑/删除
    const editMtg = event.target.closest('[data-action="edit-meeting"]');
    if (editMtg) { closeDrawer(); state.meetingEditingId = editMtg.dataset.id; renderRoute('review'); return; }
    const delMtg = event.target.closest('[data-action="delete-meeting"]');
    if (delMtg) { const id = delMtg.dataset.id; closeDrawer(); confirmAction({ title: '删除会议记录', message: '确定删除这条会议记录？删除后不可恢复。', okText: '删除' }).then((ok) => { if (ok) deleteMeeting(id); }); return; }
    if (event.target.closest('[data-action="close-drawer"]')) closeDrawer();
    const link = event.target.closest('[data-action="open-knowledge-link"]');
    if (link?.dataset.url) window.open(normalizeUrl(link.dataset.url), '_blank', 'noopener');
  });
  // 子任务勾选（checkbox 用 change 事件）
  els.drawerBody?.addEventListener('change', (event) => {
    const cb = event.target.closest('[data-sub-id]');
    if (cb) toggleSubtask(cb.dataset.projId, cb.dataset.subId);
  });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeDrawer(); } });
}

// 启动：先等数据从仓库加载完，再首屏渲染（避免空数据闪烁）。
// 落盘失败统一提示——缓存已改、界面照常，只告诉用户"没存上"，让其重试或检查网络（接 CloudBase 后尤为重要）。
(async function boot() {
  store.onError((err, ctx) => {
    console.error('保存失败', ctx, err);
    toast('保存失败，请重试或检查网络', 'danger');
  });
  // 登录闸门：云端模式下未登录会卡在这里弹登录框，登录成功才往下走加载数据。
  // 本机模式（没配 Supabase）requireLogin 直接返回，不拦截。
  if (window.WorkbenchAuth) {
    try { await window.WorkbenchAuth.requireLogin(); }
    catch (err) { console.error('登录流程异常', err); }
  }
  attachGlobalEvents();
  try {
    await initState();
  } catch (err) {
    console.error('数据加载失败', err);
    toast('数据加载失败，请刷新重试', 'danger');
  }
  renderRoute(state.route);
})();
