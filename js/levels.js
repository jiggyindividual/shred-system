// levels.js — level definitions + goal computation engine

const LEVEL_DEFS = [
  {n:1,name:'Show up',tier:'Foundation',goals:[{id:'ld',label:'Log 20+ days',type:'log_days',target:20},{id:'wo',label:'Note 1+ workout',type:'workouts',target:1}]},
  {n:2,name:'Protein basics',tier:'Foundation',goals:[{id:'ld',label:'Log 22+ days',type:'log_days',target:22},{id:'p1',label:'Hit 0.8g/lb protein — 15 days',type:'prot_per_lb',threshold:0.8,target:15}]},
  {n:3,name:'Move daily',tier:'Foundation',goals:[{id:'ss',label:'7-day step streak above 7k',type:'step_streak',threshold:7000,target:7},{id:'as',label:'Avg 8k steps/month',type:'avg_steps',target:8000}]},
  {n:4,name:'Deficit locked',tier:'Foundation',goals:[{id:'ad',label:'Avg 500+ cal deficit/day',type:'avg_deficit',target:500},{id:'ms',label:'No more than 3 surplus days',type:'max_surplus',target:3}]},
  {n:5,name:'Protein elite',tier:'Intermediate',goals:[{id:'p2',label:'Hit 1g/lb protein — 18 days',type:'prot_per_lb',threshold:1.0,target:18},{id:'ef',label:'Deficit efficiency within 20%',type:'efficiency',target:20}]},
  {n:6,name:'Cardio discipline',tier:'Intermediate',goals:[{id:'ss2',label:'10-day streak above 10k steps',type:'step_streak',threshold:10000,target:10},{id:'as2',label:'Avg 9k steps/month',type:'avg_steps',target:9000},{id:'p3',label:'Hit 1g/lb protein — 20 days',type:'prot_per_lb',threshold:1.0,target:20}]},
  {n:7,name:'Macro awareness',tier:'Intermediate',goals:[{id:'ld7',label:'Log 26+ days',type:'log_days',target:26},{id:'ad7',label:'Avg 700+ cal deficit/day',type:'avg_deficit',target:700},{id:'p7',label:'Hit 1g/lb protein — 22 days',type:'prot_per_lb',threshold:1.0,target:22},{id:'ef7',label:'Deficit efficiency within 15%',type:'efficiency',target:15}]},
  {n:8,name:'Precision protocol',tier:'Elite',goals:[{id:'ld8',label:'Log 28+ days',type:'log_days',target:28},{id:'p8',label:'Hit 1g/lb protein — 24 days',type:'prot_per_lb',threshold:1.0,target:24},{id:'ss8',label:'10-day streak above 10k steps',type:'step_streak',threshold:10000,target:10},{id:'ad8',label:'Avg 1,000+ cal deficit/day',type:'avg_deficit',target:1000},{id:'ls8',label:'Lean mass score 80%+',type:'lean_score',target:80}]},
  {n:9,name:'Shred machine',tier:'Elite',goals:[{id:'ld9',label:'Log 29+ days',type:'log_days',target:29},{id:'p9',label:'Hit 1g/lb protein — 26 days',type:'prot_per_lb',threshold:1.0,target:26},{id:'ss9',label:'14-day streak above 12k steps',type:'step_streak',threshold:12000,target:14},{id:'ad9',label:'Avg 1,200+ cal deficit/day',type:'avg_deficit',target:1200},{id:'ef9',label:'Deficit efficiency within 12%',type:'efficiency',target:12},{id:'ls9',label:'Lean mass score 85%+',type:'lean_score',target:85}]},
  {n:10,name:'Competition mode',tier:'Elite',goals:[{id:'ld10',label:'Log every single day',type:'log_days',target:30},{id:'p10',label:'Hit 1.2g/lb protein — 28 days',type:'prot_per_lb',threshold:1.2,target:28},{id:'ss10',label:'14-day streak above 14k steps',type:'step_streak',threshold:14000,target:14},{id:'ad10',label:'Avg 1,400+ cal deficit/day',type:'avg_deficit',target:1400},{id:'ef10',label:'Deficit efficiency within 10%',type:'efficiency',target:10},{id:'ls10',label:'Lean mass score 90%+',type:'lean_score',target:90}]},
  {n:11,name:'The gauntlet',tier:'Competitor',goals:[{id:'ld11',label:'Log every day — no exceptions',type:'log_days',target:31},{id:'p11',label:'Hit 1.2g/lb protein — 30 days',type:'prot_per_lb',threshold:1.2,target:30},{id:'ss11',label:'21-day streak above 15k steps',type:'step_streak',threshold:15000,target:21},{id:'ad11',label:'Avg 1,600+ cal deficit/day',type:'avg_deficit',target:1600},{id:'ef11',label:'Deficit efficiency within 8%',type:'efficiency',target:8},{id:'ls11',label:'Lean mass score 92%+',type:'lean_score',target:92}]},
  {n:12,name:'Peak week protocol',tier:'Competitor',goals:[{id:'ld12',label:'Zero missed days',type:'log_days',target:31},{id:'p12',label:'Hit 1.5g/lb protein — 30 days',type:'prot_per_lb',threshold:1.5,target:30},{id:'ss12',label:'28-day streak above 15k steps',type:'step_streak',threshold:15000,target:28},{id:'ad12',label:'Avg 1,800+ cal deficit/day',type:'avg_deficit',target:1800},{id:'ef12',label:'Deficit efficiency within 5%',type:'efficiency',target:5},{id:'ls12',label:'Lean mass score 95%+',type:'lean_score',target:95}]}
];

function genLevel(n) {
  if (n <= LEVEL_DEFS.length) return LEVEL_DEFS[n - 1];
  const ex = n - LEVEL_DEFS.length;
  return {
    n, name: `Infinite L${n}`, tier: 'Infinite',
    goals: [
      {id:'ld', label:'Log every day', type:'log_days', target:31},
      {id:'p', label:`Hit ${(1.5+ex*0.05).toFixed(2)}g/lb protein — 30 days`, type:'prot_per_lb', threshold:1.5+ex*0.05, target:30},
      {id:'ss', label:`${(15000+ex*500).toLocaleString()}-step streak — 28 days`, type:'step_streak', threshold:15000+ex*500, target:28},
      {id:'ad', label:`Avg ${(1800+ex*100).toLocaleString()}+ cal deficit/day`, type:'avg_deficit', target:1800+ex*100},
      {id:'ef', label:`Deficit efficiency within ${Math.max(2,5-ex)}%`, type:'efficiency', target:Math.max(2,5-ex)},
      {id:'ls', label:`Lean mass score ${Math.min(99,95+ex)}%+`, type:'lean_score', target:Math.min(99,95+ex)}
    ]
  };
}

function computeRows(logs) {
  let cum = 0;
  return logs.map(d => {
    const deficit = (d.cal_out != null && d.cal_in != null) ? d.cal_out - d.cal_in : null;
    if (deficit != null) cum += deficit;
    return {
      ...d, deficit, cumDef: cum, estLbs: cum / 3500,
      protPerLb: (d.protein != null && d.weight != null && d.weight > 0) ? d.protein / d.weight : null
    };
  });
}

function goalProgress(g, rows) {
  const { type, target, threshold } = g;
  if (type === 'log_days') {
    const d = rows.filter(r => r.cal_in != null || r.weight != null).length;
    return { cur: d, max: target, pct: Math.min(100, Math.round(d/target*100)), done: d >= target };
  }
  if (type === 'prot_per_lb') {
    const d = rows.filter(r => r.protPerLb != null && r.protPerLb >= threshold).length;
    return { cur: d, max: target, pct: Math.min(100, Math.round(d/target*100)), done: d >= target };
  }
  if (type === 'step_streak') {
    let best = 0, cur = 0;
    const dots = rows.map(r => {
      if (r.steps != null && r.steps >= threshold) { cur++; best = Math.max(best, cur); return 'done'; }
      else { cur = 0; return r.steps != null ? 'miss' : 'empty'; }
    });
    return { cur: best, max: target, pct: Math.min(100, Math.round(best/target*100)), done: best >= target, dots };
  }
  if (type === 'avg_steps') {
    const s = rows.filter(r => r.steps != null);
    const avg = s.length ? Math.round(s.reduce((a,r) => a+r.steps, 0)/s.length) : 0;
    return { cur: avg, max: target, pct: Math.min(100, Math.round(avg/target*100)), done: avg >= target };
  }
  if (type === 'avg_deficit') {
    const s = rows.filter(r => r.deficit != null);
    const avg = s.length ? Math.round(s.reduce((a,r) => a+r.deficit, 0)/s.length) : 0;
    return { cur: avg, max: target, pct: Math.min(100, Math.round(avg/target*100)), done: avg >= target };
  }
  if (type === 'max_surplus') {
    const s = rows.filter(r => r.deficit != null && r.deficit < 0).length;
    return { cur: s, max: target, pct: s <= target ? 100 : Math.round(target/s*100), done: s <= target, inv: true };
  }
  if (type === 'efficiency') {
    const last = rows[rows.length-1];
    if (!last || last.cumDef === 0) return { cur: null, max: target, pct: 0, done: false };
    const wtr = rows.filter(r => r.weight != null);
    if (wtr.length < 2) return { cur: null, max: target, pct: 0, done: false };
    const pred = Math.abs(last.estLbs), act = Math.abs(wtr[0].weight - wtr[wtr.length-1].weight);
    const eff = pred > 0 ? Math.abs(Math.round((act-pred)/pred*100)) : null;
    if (eff == null) return { cur: null, max: target, pct: 0, done: false };
    return { cur: eff, max: target, pct: eff <= target ? 100 : Math.round(target/eff*100), done: eff <= target, inv: true };
  }
  if (type === 'lean_score') {
    const pr = rows.filter(r => r.protPerLb != null);
    const dr = rows.filter(r => r.deficit != null);
    const ap = pr.length ? pr.reduce((a,r) => a+r.protPerLb, 0)/pr.length : 0;
    const adf = dr.length ? dr.reduce((a,r) => a+r.deficit, 0)/dr.length : 0;
    const score = Math.round(Math.min(100,ap*80)*0.6 + Math.min(100,adf>0?Math.min(100,adf/2000*50+50):0)*0.4);
    return { cur: score, max: target, pct: Math.min(100,Math.round(score/target*100)), done: score >= target };
  }
  return { cur: 0, max: target, pct: 0, done: false };
}

function renderGoalsList(container, goals, rows) {
  const grs = goals.map(g => ({ g, r: goalProgress(g, rows) }));
  container.innerHTML = grs.map(({ g, r }) => {
    let pt = '';
    if (r.inv) pt = r.cur != null ? `${r.cur} (target ≤${r.max})` : 'Not enough data';
    else if (r.cur != null) pt = `${r.cur > 999 ? r.cur.toLocaleString() : r.cur} / ${r.max > 999 ? r.max.toLocaleString() : r.max}`;
    const dots = r.dots ? `<div class="streak-dots">${r.dots.slice(-21).map(d=>`<div class="sdot sdot-${d}"></div>`).join('')}</div>` : '';
    return `<div class="goal-row">
      <div class="goal-check ${r.done?'done':''}">
        ${r.done?'<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}
      </div>
      <div class="goal-body">
        <div class="goal-name ${r.done?'done-text':''}">${g.label}</div>
        <div class="goal-prog">${pt}</div>
        ${!r.done ? `<div class="goal-bar"><div class="goal-bar-fill" style="width:${r.pct}%"></div></div>` : ''}
        ${dots}
      </div>
    </div>`;
  }).join('');
  return grs;
}

function computeMonthStats(rows) {
  const dr = rows.filter(r => r.deficit != null);
  const wr = rows.filter(r => r.weight != null);
  const pr = rows.filter(r => r.protPerLb != null);
  const sr = rows.filter(r => r.steps != null);
  const last = rows[rows.length-1];
  const avgDef = dr.length ? Math.round(dr.reduce((a,r)=>a+r.deficit,0)/dr.length) : 0;
  const avgProt = pr.length ? +(pr.reduce((a,r)=>a+r.protPerLb,0)/pr.length).toFixed(2) : 0;
  const avgSteps = sr.length ? Math.round(sr.reduce((a,r)=>a+r.steps,0)/sr.length) : 0;
  const wtChange = wr.length >= 2 ? +(wr[0].weight - wr[wr.length-1].weight).toFixed(1) : null;
  const cumDef = last ? last.cumDef : 0;
  const estLbs = +(cumDef/3500).toFixed(2);
  const leanScore = pr.length ? Math.round(Math.min(100,avgProt*80)*0.6 + Math.min(100,avgDef>0?Math.min(100,avgDef/2000*50+50):0)*0.4) : null;
  let stepStreak = 0, cur = 0;
  rows.forEach(r => { if(r.steps!=null&&r.steps>=8000){cur++;stepStreak=Math.max(stepStreak,cur);}else cur=0; });
  const logged = rows.filter(r=>r.cal_in!=null||r.weight!=null).length;
  const daysInMonth = rows.length > 0 ? new Date(rows[0].date.substring(0,7)+'-01').getDate() : 30;
  const consistency = Math.round(logged/daysInMonth*100);
  let effPct = null;
  if (wr.length >= 2 && Math.abs(estLbs) > 0) {
    const actLbs = Math.abs(wr[0].weight - wr[wr.length-1].weight);
    effPct = Math.abs(Math.round((actLbs - Math.abs(estLbs)) / Math.abs(estLbs) * 100));
  }
  return { avgDef, avgProt, avgSteps, wtChange, cumDef, estLbs, leanScore, stepStreak, consistency, effPct };
}

function tierClass(tier) {
  const m = { 'Foundation':'tier-foundation', 'Intermediate':'tier-foundation', 'Elite':'tier-elite', 'Competitor':'tier-comp', 'Infinite':'tier-infinite' };
  return m[tier] || 'tier-elite';
}

function toast(msg, type='success') {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className='', 2800);
}
