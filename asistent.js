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
  // Reset input
  const _inp=document.getElementById('chat-in');
  if(_inp){_inp.disabled=false;_inp.placeholder='Scrie un mesaj...';}
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
  window._dashAnunturi = anunturi;
  el.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:4px">
    ${anunturi.map((a,ai)=>{
      const emoji=carEmojis[a.brand]||'🚗';
      const esteAlMeu=a.user_id===currentUser?.id;
      return `<div onclick="showAnuntModal(window._dashAnunturi[${ai}])" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
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
  // Dacă userul a închis-o în această sesiune, nu o mai arătăm
  if(sessionStorage.getItem('seasonal-dismissed')) { el.style.display='none'; return; }
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
  el.style.display = 'flex';
  el.style.background = bg;
  el.style.borderColor = border;
  el.innerHTML = `<span style="font-size:24px">${icon}</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:${color}">Alertă Sezonieră AutoAssist</div><div style="font-size:12px;color:var(--t2);margin-top:2px">${msg}</div></div><button onclick="sessionStorage.setItem('seasonal-dismissed','1');this.parentElement.style.display='none'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:18px">×</button>`;
}


function showAnuntModal(a) {
  if(!a) return;
  document.getElementById('mo-anunt')?.remove();
  const fotos = (a.fotos&&a.fotos.filter(Boolean).length ? a.fotos.filter(Boolean) : (a.foto?[a.foto]:[]));
  window._anuntFotos = fotos;
  window._anuntCurFoto = 0;

  const specs = [
    {icon:'🛣️', label:'Kilometraj', val: a.km ? Number(a.km).toLocaleString()+' km' : null},
    {icon:'⛽', label:'Combustibil', val: a.combustibil||null},
    {icon:'⚙️', label:'Cutie viteze', val: a.cutie||null},
    {icon:'🔧', label:'Motor', val: a.motor ? a.motor+'cm³' : null},
    {icon:'💪', label:'Putere', val: a.putere ? a.putere+' CP' : null},
    {icon:'🎨', label:'Culoare', val: a.culoare||a.color||null},
    {icon:'📅', label:'An fabricație', val: a.year||null},
    {icon:'🪑', label:'Nr. locuri', val: a.locuri||null},
  ].filter(s=>s.val);

  const dotariList = a.dotari ? a.dotari.split(',').map(d=>d.trim()).filter(Boolean) : [];
  const mapQuery = encodeURIComponent((a.localitate?a.localitate+', ':'')+( a.judet||''));
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const mapEmbed = `https://maps.googleapis.com/maps/api/staticmap?center=${mapQuery}&zoom=12&size=400x160&markers=${mapQuery}&key=AIzaSyD-PLACEHOLDER`;

  const html = `
    <div id="mo-anunt" style="position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;overflow-y:auto;padding:20px 16px" onclick="if(event.target===this)document.getElementById('mo-anunt').remove()">
      <div style="background:var(--s1);border:1px solid var(--b2);border-radius:20px;max-width:680px;margin:0 auto;position:relative" onclick="event.stopPropagation()">
        <button onclick="document.getElementById('mo-anunt').remove()" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.5);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:18px;z-index:1">×</button>

        <!-- GALERIE POZE -->
        <div style="border-radius:20px 20px 0 0;overflow:hidden;background:#000;position:relative">
          <div style="height:280px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative" onclick="anuntLbOpen()">
            <img id="anunt-modal-img" src="${fotos.length?fotos[0]:'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/>'}" style="width:100%;height:100%;object-fit:${fotos.length?'cover':'contain'}">
            ${!fotos.length?`<div style="position:absolute;font-size:80px">🚗</div>`:''}
            ${fotos.length>1?`<div style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.7);color:#fff;font-size:12px;padding:3px 10px;border-radius:10px" id="anunt-modal-count">1/${fotos.length}</div>`:''}
            <div style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.8);color:#f0b429;font-size:22px;font-weight:900;padding:6px 16px;border-radius:10px">${a.pret} EUR</div>
          </div>
          ${fotos.length>1?`
          <button onclick="anuntModalNav(-1)" style="position:absolute;left:10px;top:130px;background:rgba(0,0,0,0.6);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:24px">‹</button>
          <button onclick="anuntModalNav(1)" style="position:absolute;right:10px;top:130px;background:rgba(0,0,0,0.6);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:24px">›</button>
          <div style="display:flex;gap:6px;padding:10px;overflow-x:auto;background:#111">
            ${fotos.map((f,i)=>`<img src="${f}" onclick="anuntThumb(${i})" id="anunt-thumb-${i}" style="width:70px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer;flex-shrink:0;border:2px solid ${i===0?'#f0b429':'transparent'};opacity:${i===0?'1':'0.6'};transition:all 0.15s">`).join('')}
          </div>`:''}
        </div>

        <div style="padding:20px">
          <!-- TITLU & PRET -->
          <div style="font-size:22px;font-weight:900;margin-bottom:4px">${a.brand||''} ${a.model||''} ${a.year||''}</div>
          ${a.vin?`<div style="font-size:11px;color:var(--t3);font-family:'JetBrains Mono';margin-bottom:12px">VIN: ${a.vin}</div>`:'<div style="margin-bottom:12px"></div>'}

          <!-- SPECIFICATII TEHNICE -->
          ${specs.length?`
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-bottom:16px;padding:14px;background:var(--s2);border-radius:12px">
            ${specs.map(s=>`<div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:18px">${s.icon}</span>
              <div><div style="font-size:10px;color:var(--t3);font-weight:600">${s.label}</div><div style="font-size:13px;font-weight:700">${s.val}</div></div>
            </div>`).join('')}
          </div>`:''}

          <!-- DESCRIERE -->
          ${a.descriere?`
          <div style="margin-bottom:16px">
            <div style="font-size:13px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:8px">📝 DESCRIERE</div>
            <div style="font-size:13px;color:var(--t2);line-height:1.7;white-space:pre-line">${a.descriere}</div>
          </div>`:''}

          <!-- DOTARI -->
          ${dotariList.length?`
          <div style="margin-bottom:16px">
            <div style="font-size:13px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:8px">✅ DOTĂRI</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${dotariList.map(d=>`<span style="background:rgba(0,232,154,0.08);border:1px solid rgba(0,232,154,0.2);color:var(--green);font-size:12px;padding:4px 10px;border-radius:20px">✓ ${d}</span>`).join('')}
            </div>
          </div>`:''}

          <!-- LOCATIE -->
          ${(a.judet||a.localitate)?`
          <div style="margin-bottom:16px">
            <div style="font-size:13px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:8px">📍 LOCAȚIE</div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--s2);border-radius:10px">
              <div>
                <div style="font-size:14px;font-weight:700">${a.localitate?a.localitate+', ':''}${a.judet||''}</div>
                ${a.indicatii?`<div style="font-size:12px;color:var(--t3);margin-top:2px">🗺️ ${a.indicatii}</div>`:''}
              </div>
              <a href="${mapUrl}" target="_blank" style="background:var(--accent);color:#fff;font-size:12px;font-weight:700;padding:8px 14px;border-radius:8px;text-decoration:none;white-space:nowrap">🗺️ Vezi pe hartă</a>
            </div>
          </div>`:''}

          <!-- CARVERTICAL -->
          <div style="margin-bottom:16px;padding:12px;background:rgba(255,140,32,0.07);border:1px solid rgba(255,140,32,0.2);border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--amber)">🔍 Raport Istoric Auto</div>
              <div style="font-size:11px;color:var(--t3);margin-top:2px">Verifică km reali, accidente, proprietari anteriori</div>
            </div>
            <a href="https://www.carvertical.com/ro/landing?vin=${a.vin||''}&campaign=AUTOASSIST20" target="_blank" style="background:var(--amber);color:#000;font-size:12px;font-weight:800;padding:8px 14px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0">CV -20%</a>
          </div>

          <!-- CONTACT -->
          <div style="font-size:13px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:10px">📞 CONTACT VÂNZĂTOR</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
            <a href="tel:${a.tel}" style="display:flex;align-items:center;justify-content:center;gap:8px;background:var(--green);color:#000;font-weight:800;padding:14px;border-radius:12px;text-decoration:none;font-size:14px">📞 Sună acum</a>
            <a href="sms:${a.tel}?body=${encodeURIComponent('Bună ziua! Sunt interesat de anunțul dvs. cu '+a.brand+' '+a.model+' '+a.year+' la prețul de '+a.pret+' EUR. Vă rog să mă contactați. Mulțumesc!')}" style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(79,125,255,0.15);border:1px solid rgba(79,125,255,0.3);color:var(--accent);font-weight:800;padding:14px;border-radius:12px;text-decoration:none;font-size:14px">💬 Trimite SMS</a>
          </div>
          <a href="https://wa.me/4${a.tel?.replace(/[^0-9]/g,'')}?text=${encodeURIComponent('Bună ziua! Sunt interesat de anunțul cu '+a.brand+' '+a.model+' '+a.year+' - '+a.pret+' EUR. Văzut pe AutoAssist.ro')}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(37,211,102,0.12);border:1px solid rgba(37,211,102,0.3);color:#25d366;font-weight:800;padding:12px;border-radius:12px;text-decoration:none;font-size:14px;width:100%;box-sizing:border-box">🟢 Contactează pe WhatsApp</a>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
}

function anuntThumb(idx) {
  const fotos = window._anuntFotos||[];
  window._anuntCurFoto = idx;
  const img = document.getElementById('anunt-modal-img');
  const cnt = document.getElementById('anunt-modal-count');
  if(img) img.src = fotos[idx];
  if(cnt) cnt.textContent = `${idx+1}/${fotos.length}`;
  // Update thumbnail borders
  fotos.forEach((_,i)=>{
    const t = document.getElementById('anunt-thumb-'+i);
    if(t){ t.style.borderColor = i===idx?'#f0b429':'transparent'; t.style.opacity = i===idx?'1':'0.6'; }
  });
}

function anuntModalNav(dir) {
  const fotos = window._anuntFotos||[];
  const next = Math.max(0, Math.min(fotos.length-1, (window._anuntCurFoto||0)+dir));
  anuntThumb(next);
}


function anuntModalNav(dir) {
  const fotos = window._anuntFotos||[];
  window._anuntCurFoto = Math.max(0, Math.min(fotos.length-1, (window._anuntCurFoto||0)+dir));
  const img = document.getElementById('anunt-modal-img');
  const cnt = document.getElementById('anunt-modal-count');
  if(img) img.src = fotos[window._anuntCurFoto];
  if(cnt) cnt.textContent = `${window._anuntCurFoto+1}/${fotos.length}`;
}

function anuntLbOpen() {
  const fotos = window._anuntFotos||[];
  if(!fotos.length) return;
  const cur = window._anuntCurFoto||0;
  document.getElementById('anunt-lb')?.remove();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="anunt-lb" style="position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:10000;display:flex;align-items:center;justify-content:center" onclick="if(event.target===this)document.getElementById('anunt-lb').remove()">
      <button onclick="document.getElementById('anunt-lb').remove()" style="position:fixed;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:22px;z-index:10002">×</button>
      <button onclick="anuntLbNav(-1)" style="position:fixed;left:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:none;color:#fff;width:52px;height:52px;border-radius:50%;cursor:pointer;font-size:28px;z-index:10002">‹</button>
      <img id="anunt-lb-img" src="${fotos[cur]}" style="max-width:calc(100vw - 140px);max-height:88vh;object-fit:contain;border-radius:10px">
      <button onclick="anuntLbNav(1)" style="position:fixed;right:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:none;color:#fff;width:52px;height:52px;border-radius:50%;cursor:pointer;font-size:28px;z-index:10002">›</button>
      <div id="anunt-lb-cnt" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.6);font-size:14px;background:rgba(0,0,0,0.5);padding:4px 14px;border-radius:20px;z-index:10002">${cur+1}/${fotos.length}</div>
    </div>`);
  window._anuntLbCur = cur;
}

function anuntLbNav(dir) {
  const fotos = window._anuntFotos||[];
  window._anuntLbCur = Math.max(0, Math.min(fotos.length-1, (window._anuntLbCur||0)+dir));
  const img = document.getElementById('anunt-lb-img');
  const cnt = document.getElementById('anunt-lb-cnt');
  if(img) img.src = fotos[window._anuntLbCur];
  if(cnt) cnt.textContent = `${window._anuntLbCur+1}/${fotos.length}`;
}

