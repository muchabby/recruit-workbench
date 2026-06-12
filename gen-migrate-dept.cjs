// 生成迁移 SQL：给 29 条 offer 加 deptGroup，并把 department 规范化为标准子部门名。
// 复用 app.js 里真实的 normalizeDept 逻辑（截取片段 eval），保证和前端归类完全一致。
const fs = require('fs');
const src = fs.readFileSync('app.js', 'utf8');
const start = src.indexOf('const DEPT_TAXONOMY');
let i = src.indexOf('function offerGroupOf'); let depth = 0, j = src.indexOf('{', i);
for (let k = j; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (depth === 0) { j = k; break; } } }
eval(src.slice(start, j + 1)); // 注入 DEPT_TAXONOMY / normalizeDept 等

// 原始 29 条（department 用招聘时的原始写法，让 normalizeDept 来规范化）
const raw = [
  ['offer-001','2026-06-09','赵承远','M98','UE开发工程师','正编','拒绝offer','内推','放弃入职',''],
  ['offer-002','2026-06-08','谭栩','技术中台-运营支撑','测试工程师','正编','接受offer','BOSS','待入职',''],
  ['offer-003','2026-06-03','孙博','M72','测试工程师','外包','接受offer','BOSS','待入职',''],
  ['offer-004','2026-06-01','石玉龙','技术中台-数据工具开发组','Java开发工程师(AI方向)','正编','接受offer','BOSS','已入职',''],
  ['offer-005','2026-06-01','陈威帆','运营-客服部','VIP客服专员','正编','拒绝offer','BOSS','放弃入职',''],
  ['offer-006','2026-05-27','王泽政','技术中台-前端组','网站测试工程师','正编','接受offer','外包转正','已入职',''],
  ['offer-007','2026-05-26','罗俊杰','技术中台','全栈开发工程师','外包','接受offer','BOSS','已入职',''],
  ['offer-008','2026-05-09','邹家为','M72','测试工程师','外包','接受offer','BOSS','已入职',''],
  ['offer-009','2026-04-15','梁子扬','运营-客服部','VIP客服专员','正编','接受offer','BOSS','已入职',''],
  ['offer-010','2026-04-13','梁芸耀','技术中台','运维工程师','正编','接受offer','BOSS','已入职',''],
  ['offer-011','2026-04-09','田晓雨','技术中台','AIGC视觉设计实习生','实习生','拒绝offer','BOSS','放弃入职',''],
  ['offer-012','2026-03-26','魏宇','技术中台','应用开发工程师','正编','拒绝offer','BOSS','放弃入职',''],
  ['offer-013','2026-03-20','卢凯','运营-客服部','VIP客服专员','正编','接受offer','供应商/猎头','已入职','4.21入职'],
  ['offer-014','2026-03-20','李婧华','技术中台-客户端组','客户端开发工程师','正编','接受offer','BOSS','已入职','校招生提前入职'],
  ['offer-015','2026-03-19','吴冠杰','技术中台-前端组','web开发工程师','实习生','接受offer','招聘官网','已入职',''],
  ['offer-016','2026-02-28','蒋逸灵','技术中台','AIGC组长','正编','拒绝offer','BOSS','放弃入职','薪资不满足预期'],
  ['offer-017','2026-02-25','肖扬','公共部门-行政部','物业行政实习生','实习生','接受offer','BOSS','已入职',''],
  ['offer-018','2026-02-24','柯景耀','新加坡发行部','视觉设计实习生','实习生','接受offer','用人部门推荐','已入职','之前实习过'],
  ['offer-019','2026-02-16','马晓甲','M72','项目管理','正编','接受offer','BOSS','放弃入职','家里有其他突发情况'],
  ['offer-020','2026-02-06','朱旺','P36','客户端开发工程师','正编','拒绝offer','招聘官网','放弃入职',''],
  ['offer-021','2026-01-28','杨子宜','运营-客服部','VIP客服专员','正编','接受offer','供应商/猎头','已入职',''],
  ['offer-022','2026-01-27','钟梓桐','公共部门-企管部','企管部实习生','实习生','接受offer','BOSS','已入职',''],
  ['offer-023','2026-01-27','郑植中','运营-客服部','VIP客服专员','正编','接受offer','供应商/猎头','已入职',''],
  ['offer-024','2026-01-26','朱茵茵','运营-客服部','VIP客服实习生','实习生','接受offer','校企资源','已入职',''],
  ['offer-025','2026-01-20','石奇','运营-客服部','VIP客服专员','正编','接受offer','BOSS','已入职',''],
  ['offer-026','2026-01-19','孙龙飞','信息技术中心','运维工程师','正编','拒绝offer','BOSS','放弃入职',''],
  ['offer-027','2026-01-16','张泽嘉','公共部门-IT部','IT工程师','正编','接受offer','BOSS','已入职',''],
  ['offer-028','2026-01-13','丁松筠','M98','执行主程','正编','接受offer','供应商/猎头','放弃入职','决定去创业'],
  ['offer-029','2026-01-12','谢轲','运营-客服部','VIP客服专员','正编','接受offer','BOSS','已入职',''],
];

const records = raw.map((r) => {
  const norm = normalizeDept(r[3]);
  return {
    id: r[0], plannedDate: r[1], name: r[2],
    deptGroup: norm.group,      // 大类
    department: norm.dept,      // 规范化后的标准子部门名
    title: r[4], roleType: r[5], processStatus: r[6], channel: r[7], finalStatus: r[8], note: r[9]
  };
});

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const lines = [];
lines.push('-- 迁移：给 29 条 Offer 加部门大类(deptGroup) + 规范化 department 子部门名');
lines.push('delete from public.wb_offers where id is not null;');
lines.push('insert into public.wb_offers (id, data) values');
lines.push(records.map((rec) => `  (${q(rec.id)}, ${q(JSON.stringify(rec))}::jsonb)`).join(',\n') + ';');
lines.push('');
lines.push('select count(*) from public.wb_offers;');
fs.writeFileSync('迁移offer部门.sql', lines.join('\n'), 'utf8');

// 顺带打印归类汇总，便于核对
const sum = {};
records.forEach((r) => { sum[r.deptGroup] = (sum[r.deptGroup] || 0) + 1; });
console.log('归类汇总：', JSON.stringify(sum, null, 0));
console.log('生成完成，共', records.length, '条');
