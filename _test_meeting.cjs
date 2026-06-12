const fs = require('fs');
const mkEl = () => { const el = { _html:'', classList:{add(){},remove(){},toggle(){},contains(){return false}}, dataset:{}, style:{}, setAttribute(){}, getAttribute(){return null}, appendChild(){}, addEventListener(){}, querySelector(){return mkEl()}, querySelectorAll(){return[]}, focus(){}, closest(){return null}, insertAdjacentHTML(){}, remove(){} }; Object.defineProperty(el,'innerHTML',{get(){return el._html},set(v){el._html=v}}); Object.defineProperty(el,'value',{get(){return el._v||''},set(v){el._v=v}}); Object.defineProperty(el,'textContent',{get(){return el._t||''},set(v){el._t=v}}); return el; };
const rv = mkEl();
global.document = { querySelector:(s)=> s==='#routeView'?rv:mkEl(), querySelectorAll:()=>[], getElementById:()=>mkEl(), createElement:()=>mkEl(), addEventListener(){}, body:mkEl() };
global.window = { WorkbenchAuth:{isEnabled:()=>false,requireLogin:async()=>{},getToken:()=>'k',getUser:()=>null}, location:{reload(){}}, addEventListener(){}, matchMedia:()=>({matches:false,addEventListener(){}}) };
const s = {};
s['workbench.meetings.v1'] = JSON.stringify([
  {id:'m1',category:'周会',date:'2026-06-10',title:'第24周招聘周会',content:'本周完成3个岗位初筛。AI应用岗推进到终面阶段，预计下周发offer。客服部仍缺2人，需加快。讨论了校招进度安排，整体平稳。',summary:''},
  {id:'m2',category:'面试',date:'2026-05-20',title:'张三终面',content:'技术能力扎实，项目经验丰富，沟通顺畅，建议录用。',summary:''},
]);
global.localStorage = { getItem:(k)=>s[k]||null, setItem:(k,v)=>{s[k]=v}, removeItem:(k)=>{delete s[k]} };
global.fetch = async()=>({ ok:true, json:async()=>[], text:async()=>'' });
let app = fs.readFileSync('app.js','utf8').replace(/url: ?'https:\/\/[^']*'/, "url: ''").replace(/key: ?'sb_publishable_[^']*'/, "key: ''");
eval(fs.readFileSync('store.js','utf8'));
const { createWorkbenchStore, WorkbenchStoreAdapters } = globalThis;
eval(app);
setTimeout(() => {
  // 摘要函数测试
  const long = '本周完成3个岗位初筛。AI应用岗推进到终面阶段，预计下周发offer。客服部仍缺2人，需加快。讨论了校招进度安排，整体平稳。';
  const sum = summarizeMeeting(long, 50);
  console.log('摘要:', sum);
  console.log('摘要长度<=约50+省略:', sum.length <= 55);
  console.log('短文本原样:', summarizeMeeting('能力扎实，建议录用。') === '能力扎实，建议录用。');
  // 复盘页渲染
  renderRoute('review');
  const h = rv._html;
  console.log('含会议库标题:', h.includes('会议 / 面试记录库'));
  console.log('含分类chip:', h.includes('data-meeting-cat'));
  console.log('含会议卡:', h.includes('data-kind="meeting"'));
  console.log('含周报复盘卡:', h.includes('周报复盘'));
  console.log('含月份分组:', h.includes('meeting-month-head'));
  // 编辑表单
  state.meetingEditingId = '__new__';
  renderRoute('review');
  console.log('新增表单含分类下拉:', rv._html.includes('name="category"'));
  console.log('新增表单含原文框:', rv._html.includes('name="content"'));
  state.meetingEditingId = null;
  // 全路由
  let ok = true;
  for (const r of ['overview','recruitment','events','offers','review','knowledge','settings']) {
    try { renderRoute(r); if (!rv._html) { ok=false; console.log('EMPTY',r); } } catch(e){ ok=false; console.log('FAIL',r,e.message); }
  }
  console.log(ok ? '全路由 PASS' : '有问题');
}, 120);
