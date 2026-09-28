const KEY='learning_realm_save_v2';
const defaultState={level:5,xp:340,gold:350,energy:82,knowledge:12,done:2,streak:1,quests:[],bag:{energyPotion:2,xpScroll:1,knowledgeGem:1},equipped:['focus','notebook'],skills:['focus'],quiz:{correct:0,total:0}};
const questSeed=[
 {t:'完成數學作業',d:'完成今天老師指定的數學題目',g:50,x:60,e:12},
 {t:'背 10 個英文單字',d:'記住並測驗今天的單字',g:35,x:45,e:8},
 {t:'閱讀 20 分鐘',d:'選一本書或文章並記錄 3 個重點',g:30,x:40,e:10},
 {t:'整理明天的待辦事項',d:'花 5 分鐘規劃明天的事情',g:20,x:25,e:5},
 {t:'完成一項個人目標',d:'完成今天最想做的一件事',g:70,x:80,e:18}
];
const items={
 energyPotion:{name:'能量藥水',desc:'恢復 25 能量。',price:45,use(){state.energy=Math.min(100,state.energy+25);return '能量 +25';}},
 xpScroll:{name:'經驗卷軸',desc:'使用後立即獲得 50 XP。',price:70,use(){gainXP(50);return 'XP +50';}},
 knowledgeGem:{name:'知識寶石',desc:'立即獲得 3 知識點。',price:80,use(){state.knowledge+=3;return '知識 +3';}}
};
const equipment={focus:{name:'專注力帽',slot:'HEAD',effect:'任務 XP +5%'},notebook:{name:'冒險者筆記本',slot:'OFF-HAND',effect:'知識 +10%'},sword:{name:'鍵盤之劍',slot:'WEAPON',effect:'任務金幣 +8%'}};
const skills=[
 {id:'focus',name:'專注',cost:0,need:0,desc:'基礎技能。已自動解鎖。'},
 {id:'time',name:'時間管理',cost:8,need:5,desc:'完成任務時額外獲得 5 能量。'},
 {id:'expression',name:'表達',cost:12,need:5,desc:'試煉答對時額外獲得 10 XP。'},
 {id:'goal',name:'目標達成',cost:18,need:6,desc:'任務獎勵金幣 +10%。'},
 {id:'deep',name:'深度學習',cost:25,need:10,desc:'試煉答對時額外獲得 1 知識點。'},
 {id:'master',name:'學習大師',cost:40,need:10,desc:'每次升級額外獲得 30 G。'}
];
const questions=[
 {q:'如果直線斜率為 2，x 增加 3，y 會增加多少？',a:['2','3','5','6'],c:3},
 {q:'英文單字 experience 最接近哪個意思？',a:['經驗','實驗室','例外','期待'],c:0},
 {q:'光合作用主要利用哪一種能量？',a:['聲音能量','光能','機械能','核能'],c:1},
 {q:'三角形內角和是多少？',a:['90°','180°','270°','360°'],c:1},
 {q:'「因為下雨，所以我帶傘」中的「所以」主要表示什麼關係？',a:['轉折','因果結果','並列','假設'],c:1}
];
let state=load();let quizIndex=0;let answered=false;
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s)return {...defaultState,...s,bag:{...defaultState.bag,...s.bag},quiz:{...defaultState.quiz,...s.quiz}}}catch(e){}return {...defaultState,quests:questSeed.map(q=>({...q,c:false}))};}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function $(id){return document.getElementById(id)}
function gainXP(n){state.xp+=Math.max(0,n);while(state.xp>=500){state.xp-=500;state.level++;state.gold+=state.skills.includes('master')?30:0;log('LEVEL UP! 你升到 LV.'+String(state.level).padStart(2,'0'));}}
function log(t){$('eventLog').innerHTML='SYSTEM LOG<br>'+t+'<br><br>'+new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}
function render(){
 $('levelTop').textContent='LV.'+String(state.level).padStart(2,'0');$('levelSide').textContent='LV.'+String(state.level).padStart(2,'0');$('levelHome').textContent=String(state.level).padStart(2,'0');
 $('goldTop').textContent=state.gold+' G';$('goldHome').textContent=state.gold+' G';$('energyTop').textContent='ENERGY '+state.energy+'/100';$('energyHome').textContent=state.energy+' / 100';$('knowledgeHome').textContent=state.knowledge+' P';$('knowledgeSide').textContent=state.knowledge;$('streakSide').textContent=state.streak+' 天';$('doneSide').textContent=state.done;$('xpText').textContent=state.xp+' / 500 XP';$('xpBar').style.width=(state.xp/5)+'%';
 const active=state.quests.filter(q=>q.c).length;$('mainText').textContent=active+' / 5';$('mainBar').style.width=Math.min(100,active/5*100)+'%';renderQuests();renderShop();renderBag();renderSkills();renderArenaStats();save();
}
function renderQuests(){
 $('questList').innerHTML=state.quests.map((q,i)=>`<div class="quest ${q.c?'done':''}"><button class="check" ${q.c?'disabled':''} data-q="${i}">${q.c?'✓':'○'}</button><div class="quest-info"><b>${escapeHTML(q.t)}</b><small>${escapeHTML(q.d)} · 消耗 ${q.e} 能量</small></div><span class="reward">+${q.g} G · +${q.x} XP</span></div>`).join('');
 document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>completeQuest(Number(b.dataset.q)));
}
function completeQuest(i){const q=state.quests[i];if(!q||q.c)return;if(state.energy<q.e){log('能量不足，先使用能量藥水。');return}state.energy-=q.e;q.c=true;state.done++;let gold=q.g,xp=q.x;if(state.equipped.includes('sword'))gold=Math.ceil(gold*1.08);if(state.skills.includes('goal'))gold=Math.ceil(gold*1.10);if(state.equipped.includes('focus'))xp=Math.ceil(xp*1.05);state.gold+=gold;gainXP(xp);state.knowledge+=1;if(state.skills.includes('time'))state.energy=Math.min(100,state.energy+5);state.streak=Math.max(1,state.streak);log('任務完成：'+q.t+' / +'+gold+' G / +'+xp+' XP');render();}
function addQuest(){const t=prompt('輸入任務名稱');if(!t||!t.trim())return;state.quests.push({t:t.trim(),d:'自訂任務 · 完成後取得獎勵',g:30,x:35,e:8,c:false});render();}
function triggerEvent(){const events=[['發現隱藏寶箱！','gold',60],['靈感爆發！','xp',45],['知識碎片掉落！','knowledge',2],['休息時間！','energy',20]];const e=events[Math.floor(Math.random()*events.length)];if(e[1]==='gold')state.gold+=e[2];if(e[1]==='xp')gainXP(e[2]);if(e[1]==='knowledge')state.knowledge+=e[2];if(e[1]==='energy')state.energy=Math.min(100,state.energy+e[2]);log('RANDOM EVENT：'+e[0]+' / +'+e[2]+' '+e[1].toUpperCase());render();}
function renderShop(){$('shopList').innerHTML=Object.entries(items).map(([id,it])=>`<article class="shopitem"><span class="tag">ITEM</span><h3>${it.name}</h3><p>${it.desc}</p><div class="row"><span class="cost">${it.price} G</span><button data-buy="${id}">購買</button></div><button class="ghost" data-use="${id}">使用 1 個</button></article>`).join('');document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));document.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>useItem(b.dataset.use));}
function buy(id){const it=items[id];if(state.gold<it.price){log('金幣不足。');return}state.gold-=it.price;state.bag[id]=(state.bag[id]||0)+1;log('購買 '+it.name+' ×1');render();}
function useItem(id){if(!(state.bag[id]>0)){log('背包裡沒有 '+items[id].name);return}state.bag[id]--;const msg=items[id].use();log('使用 '+items[id].name+'：'+msg);render();}
function renderBag(){let equipped=state.equipped.map(id=>{const e=equipment[id];return `<div class="equipitem"><span>${e.name}<small> · ${e.slot}</small></span><span class="tag">${e.effect}</span></div>`}).join('');if(state.equipped.includes('notebook'))equipped+=`<div class="equipitem"><span>鍵盤之劍</span><button class="ghost" data-equip="sword">裝備</button></div>`;else if(!state.equipped.includes('sword'))equipped+=`<div class="equipitem"><span>鍵盤之劍</span><button class="ghost" data-equip="sword">裝備</button></div>`;else equipped+=`<div class="equipitem"><span>鍵盤之劍</span><button class="ghost" data-unequip="sword">卸下</button></div>`;$('equippedList').innerHTML=equipped;$('equipPower').textContent='POWER '+(state.equipped.length*10);$('bagList').innerHTML=Object.entries(state.bag).map(([id,n])=>`<div class="bagitem"><span>${items[id].name}</span><b>×${n}</b></div>`).join('')||'<p>背包是空的。</p>';document.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>equip(b.dataset.equip));document.querySelectorAll('[data-unequip]').forEach(b=>b.onclick=()=>unequip(b.dataset.unequip));}
function equip(id){if(!state.equipped.includes(id))state.equipped.push(id);log('已裝備 '+equipment[id].name);render();}function unequip(id){state.equipped=state.equipped.filter(x=>x!==id);log('已卸下 '+equipment[id].name);render();}
function renderSkills(){$('skillList').innerHTML=skills.map(s=>{const unlocked=state.skills.includes(s.id),can=state.knowledge>=s.cost&&state.level>=s.need&&!unlocked;return `<article class="skill ${unlocked?'':'locked'}"><span class="tag">${unlocked?'UNLOCKED':'LOCKED'}</span><h3>${s.name}</h3><p>${s.desc}</p><small>需求：LV.${s.need} · ${s.cost} 知識</small>${!unlocked?`<button ${can?'':'disabled'} data-skill="${s.id}">${can?'解鎖':'條件不足'}</button>`:'<p class="success">已解鎖</p>'}</article>`}).join('');document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>unlockSkill(b.dataset.skill));}
function unlockSkill(id){const s=skills.find(x=>x.id===id);if(!s||state.skills.includes(id)||state.knowledge<s.cost||state.level<s.need)return;state.knowledge-=s.cost;state.skills.push(id);log('技能解鎖：'+s.name);render();}
function renderArena(){const q=questions[quizIndex%questions.length];$('questionCount').textContent='QUESTION '+String((quizIndex%questions.length)+1).padStart(2,'0');$('question').textContent=q.q;$('arenaReward').textContent='+25 XP · +15 G';$('quizResult').textContent='選一個答案開始試煉。';$('nextQuestion').disabled=true;answered=false;$('answers').innerHTML=q.a.map((a,i)=>`<button data-a="${i}">${escapeHTML(a)}</button>`).join('');document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.a)));}
function answer(i){if(answered)return;answered=true;const q=questions[quizIndex%questions.length];state.quiz.total++;const bs=[...document.querySelectorAll('[data-a]')];bs.forEach((b,n)=>{b.disabled=true;if(n===q.c)b.classList.add('correct');if(n===i&&i!==q.c)b.classList.add('wrong')});if(i===q.c){state.quiz.correct++;let xp=25;if(state.skills.includes('expression'))xp+=10;gainXP(xp);state.gold+=15;state.knowledge+=state.skills.includes('deep')?2:1;$('quizResult').innerHTML='<span class="success">答對！ +'+xp+' XP · +15 G</span>'}else{$('quizResult').innerHTML='<span class="danger">答錯了，看看正確答案再挑戰下一題。</span>'}$('nextQuestion').disabled=false;render();renderArenaStats();}
function renderArenaStats(){$('arenaStats').textContent='本次答對 '+state.quiz.correct+' 題 / '+state.quiz.total+' 題';}
function nextQuestion(){quizIndex++;renderArena();}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function page(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.p===id));if(id==='arena')renderArena();}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>page(b.dataset.p));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>page(b.dataset.go));$('randomEventBtn').onclick=triggerEvent;$('addQuestBtn').onclick=addQuest;$('nextQuestion').onclick=nextQuestion;$('resetBtn').onclick=()=>{if(confirm('確定要清除所有遊戲進度嗎？')){localStorage.removeItem(KEY);state=load();log('存檔已重置');render();renderArena()}};render();renderArena();
