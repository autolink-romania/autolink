// ═══ ASISTENTA ═══
function sunF(nr){window.open('tel:'+nr.replace(/\s/g,''));}
function solAst(){
  const loc=document.getElementById('loc-in').value.trim();
  const tel=document.getElementById('ast-tel').value.trim();
  const def=document.querySelector('input[name="def"]:checked');
  if(!loc){showNotification('⚠️ Locație lipsă','Introdu locația ta exactă!');return;}
  if(!def){showNotification('⚠️ Selectează problema','Alege tipul de defecțiune!');return;}
  const tip=def.value;
  const urgente=['accident','incendiu','frane'];
  const isUrg=urgente.includes(tip);
  if(isUrg){
    const ok=confirm('?? URGENȚĂ — '+tip.toUpperCase()+'\n?? Locație: '+loc+'\n\nSunăm acum la 112?\nApasă OK pentru a forma 112!');
    if(ok) window.open('tel:112');
  } else {
    showNotification('✅ Solicitare trimisă!','Firmele din zona ta au primit solicitarea. Te contactează în câteva minute!');
    document.getElementById('ast-result').innerHTML='<div style="padding:16px;background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);border-radius:var(--rs);margin-top:12px"><div style="font-weight:800;color:var(--green);margin-bottom:8px">✅ Solicitare trimisă cu succes!</div><div style="font-size:12px;color:var(--t2);line-height:1.7">?? Locație: <strong>'+loc+'</strong><br>?? Problemă: <strong>'+tip+'</strong><br>⏱️ Timp estimat răspuns: <strong>15-30 minute</strong><br>Firmele disponibile te contactează la numărul introdus.</div></div>';
    if(tel){const smsUrl='sms:+40722111222?body='+encodeURIComponent('Solicitare asistenta: '+tip+' la '+loc+'. Tel: '+tel);window.open(smsUrl);}
  }
}

function confAst(){
  showNotification('✅ Mulțumim!','Bucuros că am putut ajuta! AutoAssist îți urește drum bun!');
  const el=document.getElementById('ast-result');
  if(el) el.innerHTML='<div style="padding:16px;background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);border-radius:var(--rs);margin-top:12px"><div style="font-weight:800;color:var(--green)">✅ Problema rezolvată!</div><div style="font-size:12px;color:var(--t2);margin-top:6px">Bucuros că te-am putut ajuta. Notează firma care te-a ajutat cu o recenzie!</div></div>';
}

// ═══ CLAUDE API AGENTS ═══
async function loadAgentHistory(agent, returnHTML=false) {
  let histData = [];
  
  if(supabaseClient && currentUser) {
    try {
      const { data, error } = await supabaseClient
        .from('chat_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('agent', agent)
        .order('created_at', { ascending: true })
        .limit(30);
      if(!error && data && data.length > 0) {
        histData = data;
        chatHistory = data.map(m => ({ role: m.role, content: m.content }));
      }
    } catch(e) {}
  }
  
  // Fallback localStorage
  if(histData.length === 0) {
    const localHist = JSON.parse(localStorage.getItem('chat_' + agent) || '[]');
    if(localHist.length > 0) {
      histData = localHist;
      chatHistory = localHist.map(m => ({ role: m.role, content: m.content }));
    }
  }
  
  const html = histData.length > 0 ? histData.map(m => {
    if(m.role === 'user') {
      return `<div class="msg user"><div class="mav user">👤</div><div class="mb"><div class="mn" style="text-align:right">Tu</div><div class="mbu">${m.content}</div></div></div>`;
    } else {
      const fmt = m.content.split('\n').join('<br>');
      return `<div class="msg ai"><div class="mav ai">${AGENT_ICONS[agent]||"🤖"}</div><div class="mb"><div class="mn">${AGENT_NAMES[agent]}</div><div class="mbu">${fmt}</div></div></div>`;
    }
  }).join('') : '';
  
  if(!returnHTML) {
    // Update chat UI directly
    const msgs = document.getElementById('chat-msgs');
    if(msgs && html) {
      const welcome = msgs.querySelector('.msg.ai');
      if(welcome) welcome.insertAdjacentHTML('afterend', html);
      msgs.scrollTop = msgs.scrollHeight;
    }
  }
  
  return html;
}

function addScrollBtn(msgs) {
  const btn = document.getElementById('scroll-down-btn');
  if(!btn) return;
  const update = () => {
    const atBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 60;
    btn.style.display = atBottom ? 'none' : 'flex';
  };
  msgs.addEventListener('scroll', update);
  setTimeout(update, 100);
}

function newConversation() {
  chatHistory = [];
  const agent = curAgent;
  localStorage.removeItem('chat_' + agent);
  if(supabaseClient && currentUser) {
    supabaseClient.from('chat_history').delete().eq('user_id', currentUser.id).eq('agent', agent).then(()=>{});
  }
  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML = `<div class="msg ai"><div class="mav ai">${AGENT_ICONS[agent]||"🤖"}</div><div class="mb"><div class="mn">${AGENT_NAMES[agent]}</div><div class="mbu">Conversație nouă pornită! Cu ce te pot ajuta? 🚀</div></div></div>`;
}

function showConvHistory() {
  const agents = {manager:'🧠 Manager',auto:'🚗 Auto & Service',documente:'📄 Documente',juridic:'⚖️ Juridic',vanzare:'💰 Vânzare',itp:'🔬 ITP & Service'};
  const body = document.getElementById('conv-history-body');
  if(!body) return;
  let html = '';
  let hasAny = false;
  Object.entries(agents).forEach(([key, label]) => {
    const hist = JSON.parse(localStorage.getItem('chat_' + key) || '[]');
    if(hist.length === 0) return;
    hasAny = true;
    const last = hist[hist.length-1];
    const lastTime = last.time ? new Date(last.time).toLocaleDateString('ro-RO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
    const preview = (last.content||'').slice(0,80) + ((last.content||'').length > 80 ? '...' : '');
    html += `<div style="border:1px solid var(--b2);border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:background 0.2s" 
      onmouseover="this.style.background='var(--s2)'" onmouseout="this.style.background=''"
      onclick="closeM('conv-history');document.querySelector('.achip[onclick*=\\'${key}\\']').click()">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-weight:700;color:var(--text)">${label}</span>
        <span style="font-size:11px;color:var(--t3)">${hist.length} mesaje · ${lastTime}</span>
      </div>
      <div style="font-size:12px;color:var(--t2);line-height:1.5">${preview}</div>
    </div>`;
  });
  body.innerHTML = hasAny ? html : '<div style="text-align:center;padding:32px;color:var(--t3)">Nu ai conversații salvate încă.</div>';
  openM('conv-history');
}

function updateAgentLimitUI() {
  const el = document.getElementById('agent-limit-status');
  if(!el) return;
  if(isPremium()) {
    el.innerHTML = '👑 <span style="color:#f0b429">Premium — mesaje nelimitate</span>';
  } else {
    const used = getUsage('agenti_msg');
    const left = Math.max(0, FREE_LIMITS.agenti_msg - used);
    el.innerHTML = left > 0
      ? `💬 ${left} mesaj${left === 1 ? '' : 'e'} gratuit${left === 1 ? '' : 'e'} rămase azi`
      : '⛔ Limită atinsă — <span style="color:#f0b429;cursor:pointer" onclick="showUpgradeModal(\'agenti_msg\')">activează Premium</span>';
  }
}

async function selAgent(btn,agent){
  document.querySelectorAll('.achip').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  curAgent=agent;chatHistory=[];
  updateAgentLimitUI();
  const msgs=document.getElementById('chat-msgs');
  
  // Load history
  let historyHTML = await loadAgentHistory(agent, true);
  
  const hasHistory = chatHistory.length > 0;
  const welcomeMsg = `<div class="msg ai"><div class="mav ai">${AGENT_ICONS[agent]||"🤖"}</div><div class="mb"><div class="mn">${AGENT_NAMES[agent]}</div><div class="mbu">Bună! Sunt <strong>${AGENT_NAMES[agent]}</strong>${hasHistory ? ' — am încărcat istoricul conversației noastre! 🧠' : '. Sunt gata să te ajut cu tot ce ai nevoie. Cu ce pot începe? 🚀'}</div></div></div>`;
  
  msgs.innerHTML = welcomeMsg + historyHTML;
  msgs.scrollTop = msgs.scrollHeight;
  // Buton scroll jos dacă există istoric
  addScrollBtn(msgs);
}
function chatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}
function autoH(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,100)+'px';}

function needsWebSearch(txt) {
  const lower = txt.toLowerCase();
  const triggers = [
    'acum','azi','astăzi','2024','2025','2026','actual','recent','ultimul','când','orar','program',
    'prețul','cât costă','curs valutar','euro','dolar','vremea','temperatura','vreme','știre','news',
    'probleme','defecțiuni','defecte','fiabilitate','review','păreri','recomand','merit','cumpăr',
    'motor','cutie viteze','turbo','uzura','consum real','specificații','comparatie','vs','recall',
    'amenda','amendă','lege','legislatie','legislație','cod rutier','puncte','permis',
    'cost','tarif','preț rca','preț itp','stiri','ce se intampla','ce s-a intamplat',
  ];
  return triggers.some(t => lower.includes(t));
}

function detectWeatherCity(txt) {
  // Verific și ultimele mesaje din chat pentru context
  const recentContext = chatHistory.slice(-4).map(m => m.content || '').join(' ').toLowerCase();
  const combined = txt.toLowerCase() + ' ' + recentContext;
  if(!combined.includes('vreme') && !combined.includes('temperatura') && !combined.includes('vremea') && !combined.includes('ploua') && !combined.includes('soare') && !combined.includes('meteo')) return null;
  const cities = ['bucurești','bucharest','cluj','timișoara','timisoara','iași','iasi','constanța','constanta','craiova','brașov','brasov','galați','galati','ploiești','ploiesti','oradea','sibiu','bacău','bacau','pitești','pitesti','arad','baia mare','buzău','buzau'];
  for(const c of cities) { if(combined.includes(c)) return c; }
  return 'Romania';
}

async function getWeatherDirect(city) {
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`, {mode:'cors'});
    if(res.ok) return await res.text();
  } catch(e) {}
  return null;
}

function buildSearchQuery(txt) {
  const lower = txt.toLowerCase();
  const carBrands = ['dacia','logan','sandero','duster','volkswagen','golf','passat','polo','bmw','mercedes','audi','renault','ford','opel','skoda','toyota','hyundai','kia','peugeot','citroen','fiat','seat','mazda','honda','nissan','volvo'];
  const hasBrand = carBrands.some(b => lower.includes(b));
  if(hasBrand) return txt + ' Romania';
  if(lower.includes('amend') || lower.includes('lege') || lower.includes('cod rutier')) return txt + ' Romania 2025';
  return txt;
}

async function sendMsg(){
  const inp=document.getElementById('chat-in');
  const txt=inp.value.trim();if(!txt)return;

  // Verificare limită gratuit
  if(!isPremium()) {
    const usage = getUsage('agenti_msg');
    if(usage >= FREE_LIMITS.agenti_msg + 1) {
      showUpgradeModal('agenti_msg');
      return;
    }
    if(usage === FREE_LIMITS.agenti_msg) {
      // Ultimul mesaj permis — mesaj de rămas bun
      incrementUsage('agenti_msg');
      const msgs = document.getElementById('chat-msgs');
      msgs.innerHTML += `<div class="msg user"><div class="mav user">👤</div><div class="mb"><div class="mn" style="text-align:right">Tu</div><div class="mbu">${txt.replace(/</g,'&lt;')}</div></div></div>`;
      msgs.innerHTML += `<div class="msg ai"><div class="mav ai">${AGENT_ICONS[curAgent]||'🤖'}</div><div class="mb"><div class="mn">${AGENT_NAMES[curAgent]}</div><div class="mbu">Ai atins limita de <strong>5 mesaje gratuite</strong> pe zi. Revin mâine cu răspunsuri proaspete! 😊<br><br>Pentru conversații nelimitate, activează <strong>Premium — 49 RON/an</strong>.</div></div></div>`;
      msgs.scrollTop = msgs.scrollHeight;
      inp.value = '';
      inp.disabled = true;
      inp.placeholder = 'Limită atinsă — revino mâine sau activează Premium';
      setTimeout(() => showUpgradeModal('agenti_msg'), 2000);
      return;
    }
    incrementUsage('agenti_msg');
  }
  inp.value='';inp.style.height='auto';
  const msgs=document.getElementById('chat-msgs');
  msgs.innerHTML+=`<div class="msg user"><div class="mav user">👤</div><div class="mb"><div class="mn" style="text-align:right">Tu</div><div class="mbu">${txt.replace(/</g,'&lt;')}</div></div></div>`;
  const tid='t'+Date.now();
  msgs.innerHTML+=`<div class="msg ai" id="${tid}"><div class="mav ai">${AGENT_ICONS[curAgent]||"🤖"}</div><div class="mb"><div class="mn">${AGENT_NAMES[curAgent]}</div><div class="mbu"><span style="display:inline-flex;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--t3);animation:bounce 1.1s infinite"></span><span style="width:7px;height:7px;border-radius:50%;background:var(--t3);animation:bounce 1.1s .18s infinite"></span><span style="width:7px;height:7px;border-radius:50%;background:var(--t3);animation:bounce 1.1s .36s infinite"></span></span></div></div></div>`;
  msgs.scrollTop=msgs.scrollHeight;

  // Web search — se face server-side în edge function
  const searchQuery = buildSearchQuery(txt);
  const weatherCity = detectWeatherCity(txt);
  
  // Încerc vreme direct din browser (wttr.in are CORS deschis)
  let directWeather = null;
  if(weatherCity) directWeather = await getWeatherDirect(weatherCity);
  
  chatHistory.push({role:'user', content: directWeather ? `${txt}\n\n[Vreme actuală ${weatherCity}: ${directWeather}]` : txt});
  try{
    const res=await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/asistent',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGNrbmp1cWRqZnh0cXJxaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzI5NDcsImV4cCI6MjA1OTEwODk0N30.5YhiDJmZ4SKSCkm9H4d5FdBWZ0fJuWkSBhCL5bVFYxE'},
      body:JSON.stringify({
        messages:chatHistory,
        system:buildAgentPrompt(curAgent),
        model:'claude-haiku-4-5-20251001',
        max_tokens:1024,
        question:txt,
        systemPrompt:buildAgentPrompt(curAgent),
        searchQuery:searchQuery,
        weatherCity:weatherCity
      })
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error.message);
    const reply=data.reply||(data.content&&data.content[0]&&data.content[0].text)||null;
    if(!reply) throw new Error(data.error?.message||'Răspuns invalid de la server');
    chatHistory.push({role:'assistant',content:reply});
    const t=document.getElementById(tid);
    if(t)t.querySelector('.mbu').innerHTML=reply.split('\n').join('<br>');
    showApiSt('✅ Agent conectat și activ cu Claude API','var(--green)');
    
    // Save to localStorage always (backup)
    const histKey = 'chat_' + curAgent;
    const existing = JSON.parse(localStorage.getItem(histKey) || '[]');
    existing.push({role:'user',content:txt,time:Date.now()});
    existing.push({role:'assistant',content:reply,time:Date.now()});
    // Keep only last 40 messages
    if(existing.length > 40) existing.splice(0, existing.length - 40);
    localStorage.setItem(histKey, JSON.stringify(existing));
    
    // Also save to Supabase if logged in
    if(supabaseClient && currentUser) {
      try {
        await supabaseClient.from('chat_history').insert([
          { user_id: currentUser.id, agent: curAgent, role: 'user', content: txt },
          { user_id: currentUser.id, agent: curAgent, role: 'assistant', content: reply }
        ]);
      } catch(e) { console.log('Supabase save error:', e); }
    }
    
  }catch(err){
    const t=document.getElementById(tid);
    if(t)t.querySelector('.mbu').innerHTML=`<span style="color:var(--red)">❌ Eroare: ${err.message}</span>`;
    showApiSt('❌ Eroare: '+err.message,'var(--red)');
  }
  msgs.scrollTop=msgs.scrollHeight;
  addScrollBtn(msgs);
  updateAgentLimitUI();
}

async function clearAgentHistory() {
  if(!confirm('Ștergi tot istoricul conversației cu ' + AGENT_NAMES[curAgent] + '?')) return;
  
  // Clear localStorage
  localStorage.removeItem('chat_' + curAgent);
  
  // Clear Supabase if logged in
  if(supabaseClient && currentUser) {
    try {
      await supabaseClient.from('chat_history')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('agent', curAgent);
    } catch(e) {}
  }
  
  chatHistory = [];
  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML = `<div class="msg ai"><div class="mav ai">${AGENT_ICONS[agent]||"🤖"}</div><div class="mb"><div class="mn">${AGENT_NAMES[curAgent]}</div><div class="mbu">Istoricul a fost șters. Bună! Sunt <strong>${AGENT_NAMES[curAgent]}</strong>. Cu ce pot începe? 🚀</div></div></div>`;
}

async function requestNotifPermission() {
  if(!('Notification' in window)) {
    alert('Browserul tău nu suportă notificări!');
    return;
  }
  const permission = await Notification.requestPermission();
  const el = document.getElementById('notif-status');
  if(permission === 'granted') {
    if(el) el.innerHTML = '✅ <span style="color:var(--green)">Notificările sunt active!</span> Vei fi alertat când documentele expiră.';
    showNotification('✅ AutoAssist', 'Notificările sunt activate! Vei fi alertat la expirarea documentelor.');
  } else {
    if(el) el.innerHTML = '❌ <span style="color:var(--red)">Notificările sunt blocate.</span> Activează din setările browserului.';
  }
}

function showApiSt(msg,color){
  const el=document.getElementById('api-status');
  if(el){el.style.display='block';el.style.background=color+'18';el.style.border='1px solid '+color+'44';el.style.color=color;el.textContent=msg;}
}

// ═══ SEASONAL ALERT ═══
async function loadDashVanzari(){
  const el=document.getElementById('dash-vanz-lista');
  if(!el)return;

  // Citeste din Supabase - anunturile TUTUROR utilizatorilor
  let anunturi=[];
  if(supabaseClient){
    try {
      const {data,error}=await supabaseClient
        .from('listings')
        .select('*')
        .eq('status','activ')
        .order('created_at',{ascending:false})
        .limit(6);
      if(data && data.length) anunturi=data;
    } catch(e){}
  }
  // Fallback la localStorage daca Supabase nu merge
  if(!anunturi.length){
    anunturi=JSON.parse(localStorage.getItem('vanz_anunturi')||'[]').filter(a=>a.status==='activ').slice(-6).reverse();
  }

  if(!anunturi.length){
    el.innerHTML=`<div style="text-align:center;padding:28px;color:var(--t3)">
      <div style="font-size:36px;margin-bottom:8px">🚗</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">Niciun anunț activ momentan</div>
      <div style="font-size:12px;margin-bottom:14px">Fii primul care vinde o mașină prin AutoAssist!</div>
      <button class="btn btn-primary btn-sm" onclick="goTo('vanzare')">+ Publică anunțul tău</button>
    </div>`;
    return;
  }

  const carEmojis={'Dacia':'🚗','Renault':'🚙','BMW':'🏎️','Mercedes':'🏎️','Volkswagen':'🚗','Audi':'🏎️','Toyota':'🚙','Ford':'🚗','Opel':'🚗','Peugeot':'🚗','Skoda':'🚗','Hyundai':'🚙','Kia':'🚙','Seat':'🚗','Fiat':'🚗'};
  el.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:4px">
    ${anunturi.map(a=>{
      const emoji=carEmojis[a.brand]||'🚗';
      const esteAlMeu=a.user_id===currentUser?.id;
      return `<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="height:110px;background:linear-gradient(135deg,rgba(79,125,255,0.12),rgba(200,150,12,0.08));display:flex;align-items:center;justify-content:center;position:relative;border-bottom:1px solid rgba(255,255,255,0.06);overflow:hidden">
          ${a.foto?`<img src="${a.foto}" style="width:100%;height:100%;object-fit:cover">`:`<div style="font-size:52px">${emoji}</div>`}
          ${esteAlMeu?`<div style="position:absolute;top:8px;left:8px;background:rgba(79,125,255,0.9);color:#fff;font-size:9px;font-weight:800;padding:2px 6px;border-radius:10px">AL MEU</div>`:''}
          <div style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.65);color:var(--gold);font-size:13px;font-weight:800;padding:3px 10px;border-radius:8px">${a.pret} EUR</div>
        </div>
        <div style="padding:10px 12px">
          <div style="font-size:14px;font-weight:800;margin-bottom:2px">${a.brand||''} ${a.model||''}</div>
          <div style="font-size:12px;color:var(--t2)">${a.year||''} · ${a.km?Number(a.km).toLocaleString()+' km':''}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:4px">📍 ${a.judet||'România'}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:4px">📞 ${a.tel||''}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function showSeasonalAlert() {
  const el = document.getElementById('seasonal-banner');
  if(!el) return;
  const month = new Date().getMonth() + 1;
  let icon, msg, bg, border, color;
  if(month >= 11 || month <= 2) {
    icon='❄️'; msg='Sezon de iarnă — Verifică anvelopele de iarnă, antigelul și bateria! Condus în siguranță.';
    bg='rgba(79,125,255,0.08)'; border='rgba(79,125,255,0.25)'; color='var(--accent)';
  } else if(month >= 3 && month <= 5) {
    icon='🌸'; msg='Primăvară — Acum e momentul să treci la anvelopele de vară și să faci revizia de sezon!';
    bg='rgba(0,232,154,0.08)'; border='rgba(0,232,154,0.25)'; color='var(--green)';
  } else if(month >= 6 && month <= 8) {
    icon='☀️'; msg='Sezon estival — Verifică lichidul de răcire, climatizarea și presiunea în anvelope înainte de drum lung!';
    bg='rgba(255,184,48,0.08)'; border='rgba(255,184,48,0.25)'; color='var(--amber)';
  } else {
    icon='🍂'; msg='Toamnă — Pregătește-te pentru iarnă: anvelopele de iarnă se montează când temperatura scade sub 7°C!';
    bg='rgba(255,115,0,0.08)'; border='rgba(255,115,0,0.25)'; color='var(--cv)';
  }
  el.style.background = bg;
  el.style.borderColor = border;
  el.innerHTML = `<span style="font-size:24px">${icon}</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:${color}">Alertă Sezonieră AutoAssist</div><div style="font-size:12px;color:var(--t2);margin-top:2px">${msg}</div></div><button onclick="this.parentElement.style.display='none'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:18px">×</button>`;
}

