-- 灌入 29 条 Offer（先清空 wb_offers 再插入，列表 = 你的表格）
delete from public.wb_offers where id is not null;
insert into public.wb_offers (id, data) values
  ('offer-001', '{"id":"offer-001","plannedDate":"2026-06-09","name":"赵承远","department":"M98","title":"UE开发工程师","roleType":"正编","processStatus":"拒绝offer","channel":"内推","finalStatus":"放弃入职","note":""}'::jsonb),
  ('offer-002', '{"id":"offer-002","plannedDate":"2026-06-08","name":"谭栩","department":"技术中台-运营支撑","title":"测试工程师","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"待入职","note":""}'::jsonb),
  ('offer-003', '{"id":"offer-003","plannedDate":"2026-06-03","name":"孙博","department":"M72","title":"测试工程师","roleType":"外包","processStatus":"接受offer","channel":"BOSS","finalStatus":"待入职","note":""}'::jsonb),
  ('offer-004', '{"id":"offer-004","plannedDate":"2026-06-01","name":"石玉龙","department":"技术中台-数据工具开发组","title":"Java开发工程师(AI方向)","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-005', '{"id":"offer-005","plannedDate":"2026-06-01","name":"陈威帆","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"拒绝offer","channel":"BOSS","finalStatus":"放弃入职","note":""}'::jsonb),
  ('offer-006', '{"id":"offer-006","plannedDate":"2026-05-27","name":"王泽政","department":"技术中台-前端组","title":"网站测试工程师","roleType":"正编","processStatus":"接受offer","channel":"外包转正","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-007', '{"id":"offer-007","plannedDate":"2026-05-26","name":"罗俊杰","department":"技术中台","title":"全栈开发工程师","roleType":"外包","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-008', '{"id":"offer-008","plannedDate":"2026-05-09","name":"邹家为","department":"M72","title":"测试工程师","roleType":"外包","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-009', '{"id":"offer-009","plannedDate":"2026-04-15","name":"梁子扬","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-010', '{"id":"offer-010","plannedDate":"2026-04-13","name":"梁芸耀","department":"技术中台","title":"运维工程师","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-011', '{"id":"offer-011","plannedDate":"2026-04-09","name":"田晓雨","department":"技术中台","title":"AIGC视觉设计实习生","roleType":"实习生","processStatus":"拒绝offer","channel":"BOSS","finalStatus":"放弃入职","note":""}'::jsonb),
  ('offer-012', '{"id":"offer-012","plannedDate":"2026-03-26","name":"魏宇","department":"技术中台","title":"应用开发工程师","roleType":"正编","processStatus":"拒绝offer","channel":"BOSS","finalStatus":"放弃入职","note":""}'::jsonb),
  ('offer-013', '{"id":"offer-013","plannedDate":"2026-03-20","name":"卢凯","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"接受offer","channel":"供应商/猎头","finalStatus":"已入职","note":"4.21入职"}'::jsonb),
  ('offer-014', '{"id":"offer-014","plannedDate":"2026-03-20","name":"李婧华","department":"技术中台-客户端组","title":"客户端开发工程师","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":"校招生提前入职"}'::jsonb),
  ('offer-015', '{"id":"offer-015","plannedDate":"2026-03-19","name":"吴冠杰","department":"技术中台-前端组","title":"web开发工程师","roleType":"实习生","processStatus":"接受offer","channel":"招聘官网","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-016', '{"id":"offer-016","plannedDate":"2026-02-28","name":"蒋逸灵","department":"技术中台","title":"AIGC组长","roleType":"正编","processStatus":"拒绝offer","channel":"BOSS","finalStatus":"放弃入职","note":"薪资不满足预期"}'::jsonb),
  ('offer-017', '{"id":"offer-017","plannedDate":"2026-02-25","name":"肖扬","department":"公共部门-行政部","title":"物业行政实习生","roleType":"实习生","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-018', '{"id":"offer-018","plannedDate":"2026-02-24","name":"柯景耀","department":"新加坡发行部","title":"视觉设计实习生","roleType":"实习生","processStatus":"接受offer","channel":"用人部门推荐","finalStatus":"已入职","note":"之前实习过"}'::jsonb),
  ('offer-019', '{"id":"offer-019","plannedDate":"2026-02-16","name":"马晓甲","department":"M72","title":"项目管理","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"放弃入职","note":"家里有其他突发情况"}'::jsonb),
  ('offer-020', '{"id":"offer-020","plannedDate":"2026-02-06","name":"朱旺","department":"P36","title":"客户端开发工程师","roleType":"正编","processStatus":"拒绝offer","channel":"招聘官网","finalStatus":"放弃入职","note":""}'::jsonb),
  ('offer-021', '{"id":"offer-021","plannedDate":"2026-01-28","name":"杨子宜","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"接受offer","channel":"供应商/猎头","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-022', '{"id":"offer-022","plannedDate":"2026-01-27","name":"钟梓桐","department":"公共部门-企管部","title":"企管部实习生","roleType":"实习生","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-023', '{"id":"offer-023","plannedDate":"2026-01-27","name":"郑植中","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"接受offer","channel":"供应商/猎头","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-024', '{"id":"offer-024","plannedDate":"2026-01-26","name":"朱茵茵","department":"运营-客服部","title":"VIP客服实习生","roleType":"实习生","processStatus":"接受offer","channel":"校企资源","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-025', '{"id":"offer-025","plannedDate":"2026-01-20","name":"石奇","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-026', '{"id":"offer-026","plannedDate":"2026-01-19","name":"孙龙飞","department":"信息技术中心","title":"运维工程师","roleType":"正编","processStatus":"拒绝offer","channel":"BOSS","finalStatus":"放弃入职","note":""}'::jsonb),
  ('offer-027', '{"id":"offer-027","plannedDate":"2026-01-16","name":"张泽嘉","department":"公共部门-IT部","title":"IT工程师","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb),
  ('offer-028', '{"id":"offer-028","plannedDate":"2026-01-13","name":"丁松筠","department":"M98","title":"执行主程","roleType":"正编","processStatus":"接受offer","channel":"供应商/猎头","finalStatus":"放弃入职","note":"决定去创业"}'::jsonb),
  ('offer-029', '{"id":"offer-029","plannedDate":"2026-01-12","name":"谢轲","department":"运营-客服部","title":"VIP客服专员","roleType":"正编","processStatus":"接受offer","channel":"BOSS","finalStatus":"已入职","note":""}'::jsonb);

-- 验证：应返回 29
select count(*) from public.wb_offers;