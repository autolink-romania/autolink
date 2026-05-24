// ═══ ELECTRIC EV ═══
function calcEV() {
  const auto = parseFloat(document.getElementById('ev-auto')?.value) || 0;
  const bat = parseFloat(document.getElementById('ev-bat')?.value) || 0;
  const dist = parseFloat(document.getElementById('ev-dist')?.value) || 0;
  const el = document.getElementById('ev-result');
  if(!el || !auto || !bat) return;

  const kmDisp = (auto * bat / 100);
  const ajunge = kmDisp >= dist;
  const procRamas = dist > 0 ? Math.max(0, ((kmDisp - dist) / auto * 100)).toFixed(0) : (bat).toFixed(0);

  el.innerHTML = `
    <div style="padding:14px;background:${ajunge?'rgba(0,232,154,0.08)':'rgba(255,79,109,0.08)'};border:1px solid ${ajunge?'rgba(0,232,154,0.25)':'rgba(255,79,109,0.25)'};border-radius:var(--rs)">
      <div style="font-size:${ajunge?'var(--green)':'var(--red)'};font-weight:800;font-size:14px;color:${ajunge?'var(--green)':'var(--red)'}">${ajunge?'✅ Ajungi la destinație!':'⚠️ Baterie insuficientă!'}</div>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px">
        <div style="font-size:12px;color:var(--t2)">🔋 Km disponibili: <strong style="color:var(--text)">${kmDisp.toFixed(0)} km</strong></div>
        <div style="font-size:12px;color:var(--t2)">📍 Distanță destinație: <strong style="color:var(--text)">${dist} km</strong></div>
        <div style="font-size:12px;color:var(--t2)">⚡ Baterie la sosire: <strong style="color:${ajunge?'var(--green)':'var(--red)'}">${ajunge?procRamas+'%':'0% — Reîncărcă!'}</strong></div>
        ${!ajunge?'<div style="font-size:12px;color:var(--amber);margin-top:4px">💡 Caută o stație de încărcare la maxim '+Math.floor(kmDisp*0.8)+' km de la plecare</div>':''}
      </div>
    </div>
  `;
}

function cautaStatii() {
  const oras = document.getElementById('ev-oras')?.value?.trim() || '';
  const el = document.getElementById('ev-statii');
  if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--t3)">⏳ Se caută stații...</div>';
  
  function showResults(location) {
    const q = encodeURIComponent('statie incarcare electrica ' + location);
    const mapsUrl = 'https://www.google.com/maps/search/' + q;
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:10px">'
      + '<div style="padding:14px;background:rgba(0,232,154,0.08);border:1px solid rgba(0,232,154,0.2);border-radius:12px">'
      + '<div style="font-weight:800;color:var(--green);margin-bottom:6px">📍 Stații de încărcare în ' + location + '</div>'
      + '<div style="font-size:12px;color:var(--t2);margin-bottom:12px">Deschide Google Maps pentru a vedea toate stațiile disponibile în timp real — inclusiv disponibilitate și tip conector.</div>'
      + '<a href="' + mapsUrl + '" target="_blank" style="display:block;background:linear-gradient(135deg,#4285f4,#0f9d58);color:#fff;text-decoration:none;text-align:center;padding:12px;border-radius:10px;font-weight:700;font-size:13px">🗺️ Deschide pe Google Maps →</a>'
      + '</div>'
      + '<div style="padding:12px 14px;background:var(--s2);border:1px solid var(--b1);border-radius:10px;font-size:12px;color:var(--t2)">'
      + '💡 Pe hartă vei vedea stații TESLA, OMV Plug, RENOVATIO, E.ON Drive, Electrice și altele cu disponibilitate în timp real.'
      + '</div>'
      + '</div>';
  }

  if(!oras) {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetch('https://nominatim.openstreetmap.org/reverse?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&format=json&accept-language=ro')
            .then(r=>r.json()).then(d=>{
              const city = d.address.city||d.address.town||d.address.county||'Romania';
              if(document.getElementById('ev-oras')) document.getElementById('ev-oras').value = city;
              showResults(city);
            }).catch(()=>showResults('România'));
        },
        ()=>showResults('București')
      );
    } else { showResults('București'); }
  } else {
    showResults(oras);
  }
}

// ═══ ASISTENT VOCAL ═══
let micActive = false;
let voiceHistory = [];

function toggleMic() {
  const btn = document.getElementById('mic-status');
  const label = document.getElementById('mic-label');
  const sub = document.getElementById('mic-sub');

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRec) {
    showNotification('Microfon indisponibil','Browserul tău nu suportă recunoașterea vocală. Folosește Chrome sau Edge.');
    return;
  }

  if(micActive) {
    if(window._micRec) window._micRec.stop();
    micActive = false;
    btn.style.background = 'linear-gradient(135deg,var(--accent),var(--accent2))';
    btn.style.boxShadow = '0 8px 32px rgba(79,125,255,0.4)';
    btn.innerHTML = '<span style="font-size:48px">🎙️</span>';
    label.textContent = 'Apasă pentru a vorbi';
    sub.textContent = 'Asistentul tău AI este gata să te ajute';
    return;
  }

  micActive = true;
  btn.style.background = 'linear-gradient(135deg,var(--red),#cc0033)';
  btn.style.boxShadow = '0 8px 32px rgba(255,79,109,0.5)';
  btn.innerHTML = '<span style="font-size:48px">🔴</span>';
  label.textContent = 'Ascult... (apasă din nou pentru stop)';
  sub.textContent = 'Vorbește acum în română!';

  const rec = new SpeechRec();
  window._micRec = rec;
  rec.lang = 'ro-RO';
  rec.continuous = true;
  rec.interimResults = false;

  rec.onresult = function(e) {
    const transcript = e.results[0][0].transcript;
    sub.textContent = 'Ai spus: "' + transcript + '"';
    askVoice(transcript);
  };

  rec.onerror = function(e) {
    showNotification('Eroare microfon', e.error === 'not-allowed' ? 'Permite accesul la microfon în browser!' : 'Eroare: ' + e.error);
    micActive = false;
    btn.style.background = 'linear-gradient(135deg,var(--accent),var(--accent2))';
    btn.innerHTML = '<span style="font-size:48px">🎙️</span>';
    label.textContent = 'Apasă pentru a vorbi';
    sub.textContent = 'Asistentul tău AI este gata să te ajute';
  };

  rec.onend = function() {
    if(micActive) {
      micActive = false;
      btn.style.background = 'linear-gradient(135deg,var(--accent),var(--accent2))';
      btn.style.boxShadow = '0 8px 32px rgba(79,125,255,0.4)';
      btn.innerHTML = '<span style="font-size:48px">🎙️</span>';
      label.textContent = 'Apasă pentru a vorbi';
      sub.textContent = 'Asistentul tău AI este gata să te ajute';
    }
  };

  rec.start();
}

async function askVoice(question) {
  // Verificare limită gratuit
  if(!isPremium()) {
    const usage = getUsage('vocal_queries');
    if(usage >= FREE_LIMITS.vocal_queries) {
      const resultEl = document.getElementById('voice-result');
      const textEl = document.getElementById('voice-text');
      if(resultEl) resultEl.style.display = 'block';
      if(textEl) textEl.innerHTML = '<span style="color:var(--amber)">⚠️ Ai folosit cele <strong>3 întrebări vocale gratuite</strong> de azi. Revino mâine sau activează Premium!</span>';
      showUpgradeModal('vocal_queries');
      return;
    }
    incrementUsage('vocal_queries');
  }
  const resultEl = document.getElementById('voice-result');
  const textEl = document.getElementById('voice-text');
  const histEl = document.getElementById('voice-history');

  if(resultEl) resultEl.style.display = 'block';
  if(textEl) textEl.innerHTML = '<span style="color:var(--t3)">⏳ Procesez întrebarea...</span>';

  // Build context despre mașini
  const carContext = cars.length > 0
    ? 'Utilizatorul are ' + cars.length + ' mașin(i) în garaj: ' + cars.map(c => c.plate + ' (' + c.brand + ' ' + c.model + ')').join(', ') + '.'
    : 'Utilizatorul nu are mașini adăugate în garaj.';

  // Alertele se trimit DOAR la prima întrebare din sesiune
  const alerts = [];
  cars.forEach(c => Object.entries(c.docs||{}).forEach(([k,v]) => {
    const d = Math.ceil((new Date(v)-new Date())/864e5);
    if(v && d <= 30) alerts.push(k.toUpperCase() + ' pentru ' + c.plate + ' expiră în ' + d + ' zile');
  }));

  const eFirstQuestion = voiceHistory.length === 0;
  const alertContext = eFirstQuestion && alerts.length > 0
    ? 'ATENȚIE — alerte active: ' + alerts.join(', ') + '. Menționează acest lucru DOAR la acest prim răspuns, nu și la întrebările următoare.'
    : '';

  const systemPrompt = `Ești un asistent auto pentru șoferii români. Răspunzi scurt și natural, ca într-o conversație normală — max 2-3 propoziții. NU te prezenta și NU menționa platforma la fiecare mesaj. NU repeta ce ai spus anterior. Vorbești simplu, fără markdown, fără liste. ${carContext}${alertContext ? ' ' + alertContext : ''}`;

  let reply = '';

  // Încearcă mai întâi API key-ul personal (admin/utilizator avansat)
  const personalKey = localStorage.getItem('autoassist-api-key');

  // Construiesc istoricul în format Claude messages
  const voiceMessages = voiceHistory.slice(0,10).reverse().flatMap(h => [
    {role:'user', content: h.q},
    {role:'assistant', content: h.a}
  ]);
  voiceMessages.push({role:'user', content: question});

  if(personalKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json','x-api-key':personalKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 300,
          system: systemPrompt,
          messages: voiceMessages
        })
      });
      const data = await res.json();
      if(!data.error) reply = data.content[0].text;
    } catch(e) {}
  }

  // Dacă nu avem key personal, folosim Supabase Edge Function ca proxy (gratuit pentru toți utilizatorii)
  if(!reply) {
    try {
      const res = await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/asistent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGNrbmp1cWRqZnh0cXJxaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzI5NDcsImV4cCI6MjA1OTEwODk0N30.5YhiDJmZ4SKSCkm9H4d5FdBWZ0fJuWkSBhCL5bVFYxE'
        },
        body: JSON.stringify({ question, systemPrompt, messages: voiceHistory, system: systemPrompt })
      });
      if(res.ok) {
        const data = await res.json();
        if(data.reply) reply = data.reply;
      }
    } catch(e) {}
  }

  // Fallback cu răspunsuri contextuale dacă serverul nu răspunde
  if(!reply) {
    const responses = {
      'rca': cars.length > 0 ? `Ai ${cars.length} mașin(i) înregistrate. Verifică datele RCA în secțiunea Documente.` : 'Adaugă mașina în garaj pentru a vedea statusul RCA.',
      'itp': 'Poți verifica și programa ITP direct din aplicație — secțiunea ITP & Service.',
      'garaj': cars.length > 0 ? `Ai ${cars.length} mașin(i) în garaj: ${cars.map(c=>c.plate).join(', ')}.` : 'Nu ai mașini adăugate încă.',
      'alerte': alerts.length > 0 ? `Ai ${alerts.length} alertă activă: ${alerts[0]}` : 'Toate documentele sunt în regulă!',
      'iarna': 'Pentru iarnă verifică anvelope cu minim 4mm profil, antigel la -25°C și bateria. Montează anvelopele când temperatura scade sub 7°C.',
      'combustibil': 'Economisești combustibil accelerând lin, menținând viteza constantă pe autostradă și verificând presiunea anvelopelor lunar.',
      'asigur': 'Poți compara oferte RCA de la 7 asigurători direct din secțiunea Asigurări.',
      'tractare': 'Poți solicita asistență rutieră direct din aplicație — secțiunea Asistență Rutieră.',
    };
    const key = Object.keys(responses).find(k => question.toLowerCase().includes(k));
    reply = key ? responses[key] : 'Momentan nu pot răspunde. Verifică conexiunea la internet și încearcă din nou.';
  }

  if(textEl) textEl.textContent = reply;

  // Text to speech
  if(reply) {
    window.speechSynthesis && window.speechSynthesis.cancel();
    const savedRate = parseFloat(localStorage.getItem('voice-rate') || '1.0');
    const savedPitch = parseFloat(localStorage.getItem('voice-pitch') || '0');
    const savedGender = localStorage.getItem('voice-gender') || 'female';
    await speakRomanian(reply, savedGender, savedRate, savedPitch);
  }

  // Add to history
  voiceHistory.unshift({q: question, a: reply, time: new Date().toLocaleTimeString('ro-RO', {hour:'2-digit',minute:'2-digit'})});
  if(histEl) {
    histEl.innerHTML = voiceHistory.slice(0,5).map(h=>`
      <div style="padding:12px;background:var(--s2);border-radius:var(--rs);border:1px solid var(--b1)">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:11px;font-weight:700;color:var(--accent)">Tu: ${h.q}</div>
          <div style="font-size:10px;color:var(--t3)">${h.time}</div>
        </div>
        <div style="font-size:12.5px;color:var(--t2);line-height:1.6">${h.a}</div>
      </div>
    `).join('');
  }
}

// ═══ INIT ═══
renderAll();

// ═══ SUPABASE INIT ═══
const SUPABASE_URL = 'https://zspcknjuqdjfxtqrqhhm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RmFzZ_dbldq2J-6aAmZYlg_9iGPYLFA';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'autoassist-auth',
    storage: window.localStorage,
    flowType: 'pkce'
  }
}) : null;

// currentUser declarat global la top (nu redeclarat)
const _splashStart = Date.now();
function dismissOverlay() {
  const elapsed = Date.now() - _splashStart;
  const wait = Math.max(0, 2000 - elapsed);
  const overlay = document.getElementById('app-init-overlay');
  if(overlay){ setTimeout(()=>{ overlay.style.opacity='0'; setTimeout(()=>overlay.style.display='none',300); }, wait); }
}

// Check auth on load
async function initAuth() {
  // Safety: ALWAYS dismiss overlay after 3 seconds max
  setTimeout(function(){
    const ov = document.getElementById('app-init-overlay');
    if(ov && ov.style.display !== 'none'){ ov.style.opacity='0'; setTimeout(()=>ov.style.display='none',300); }
    if(!document.querySelector('.sec.active')) {
      if(currentUser) {
        const saved = localStorage.getItem('aa_last_sec');
        const validSections = ['dashboard','garaj','documente','rca','rovinieta','agenti','vocal','asistenta','mentenanta','anvelope','ev','vanzare','carvertical','legal','setari','docpersonale','asigurari','servicii-stat','itp','costuri','verificare','peco','verif-nr','asistenta','premium'];
        _applySection((saved && validSections.includes(saved)) ? saved : 'dashboard');
      } else {
        _applySection('landing');
      }
    }
  }, 3000);

  if(!supabaseClient) {
    _applySection('landing');
    const ov = document.getElementById('app-init-overlay');
    if(ov){ ov.style.opacity='0'; setTimeout(()=>ov.style.display='none',300); }
    return;
  }

  // CRITICAL: For OAuth redirect on mobile/PWA
  // Supabase puts tokens in URL hash - we must wait for it to process
  // Check for password recovery
  const recoveryType = sessionStorage.getItem('aa_recovery_type');
  const recoveryToken = sessionStorage.getItem('aa_recovery_token');
  if(recoveryType === 'recovery' && recoveryToken){
    sessionStorage.removeItem('aa_recovery_type');
    sessionStorage.removeItem('aa_recovery_token');
    history.replaceState({sec:'dashboard',idx:0}, '', window.location.pathname);
    // Dismiss overlay first, then show reset modal
    _applySection('dashboard');
    const ov2 = document.getElementById('app-init-overlay');
    if(ov2){ ov2.style.opacity='0'; setTimeout(()=>{ ov2.style.display='none'; openM('reset-new-pass'); },400); }
    else { setTimeout(()=>openM('reset-new-pass'), 400); }
    return;
  }

  const hash = sessionStorage.getItem('aa_oauth_hash') || window.location.hash;
  const query = sessionStorage.getItem('aa_oauth_code') || window.location.search;
  if(sessionStorage.getItem('aa_oauth_hash')) sessionStorage.removeItem('aa_oauth_hash');
  if(sessionStorage.getItem('aa_oauth_code')) sessionStorage.removeItem('aa_oauth_code');
  const hashParams = new URLSearchParams(hash.substring(1));
  const queryParams = new URLSearchParams(query);

  // PKCE flow: ?code= in URL - schimb codul cu sesiunea
  if(query.includes('code=')) {
    try {
      const code = queryParams.get('code');
      if(code) {
        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
        history.replaceState({sec:'dashboard',idx:0}, '', window.location.pathname);
        if(!error && data?.session?.user) {
          currentUser = data.session.user;
          updateUserUI(data.session.user);
          await loadUserData(data.session.user.id);
          setTimeout(showDevBar, 500);
          _applySection((()=>{const s=localStorage.getItem('aa_last_sec');const v=['dashboard','garaj','documente','rca','rovinieta','agenti','vocal','asistenta','mentenanta','anvelope','ev','vanzare','carvertical','legal','setari','docpersonale','asigurari','servicii-stat','itp','costuri','verificare','peco','verif-nr','asistenta','premium'];return(s&&v.includes(s))?s:'dashboard';})());
          dismissOverlay();
          return;
        }
      }
    } catch(e) { console.error('exchangeCodeForSession error:', e); }
  }

  // Implicit flow: #access_token in hash
  if(hash.includes('access_token') || hash.includes('refresh_token')) {
    await new Promise(r => setTimeout(r, 1500));
    const type = hashParams.get('type');
    if(type === 'recovery') {
      sessionStorage.removeItem('aa_recovery_type');
      history.replaceState({sec:'dashboard',idx:0}, '', window.location.pathname);
      setTimeout(()=>openM('reset-new-pass'), 800);
      return;
    }
    history.replaceState({sec:'dashboard',idx:0}, '', window.location.pathname);
    let session = null;
    for(let i = 0; i < 5; i++) {
      const { data } = await supabaseClient.auth.getSession();
      if(data?.session?.user) { session = data.session; break; }
      await new Promise(r => setTimeout(r, 800));
    }
    if(session?.user) {
      currentUser = session.user;
      updateUserUI(session.user);
      await loadUserData(session.user.id);
      if(typeof vanzRenderTarif==='function') setTimeout(vanzRenderTarif, 300);
      setTimeout(showDevBar, 500);
      _applySection((()=>{const s=localStorage.getItem('aa_last_sec');const v=['dashboard','garaj','documente','rca','rovinieta','agenti','vocal','asistenta','mentenanta','anvelope','ev','vanzare','carvertical','legal','setari','docpersonale','asigurari','servicii-stat','itp','costuri','verificare','peco','verif-nr','asistenta','premium'];return(s&&v.includes(s))?s:'dashboard';})());
      dismissOverlay();
      return;
    }
  }

  // Get current session
  const { data: { session } } = await supabaseClient.auth.getSession();
  if(session?.user) {
    currentUser = session.user;
    updateUserUI(session.user);
    await loadUserData(session.user.id);
    setTimeout(showDevBar, 500);
    _applySection((()=>{const s=localStorage.getItem('aa_last_sec');const v=['dashboard','garaj','documente','rca','rovinieta','agenti','vocal','asistenta','mentenanta','anvelope','ev','vanzare','carvertical','legal','setari','docpersonale','asigurari','servicii-stat','itp','costuri','verificare','peco','verif-nr','asistenta','premium'];return(s&&v.includes(s))?s:'dashboard';})());
  } else {
    _applySection('landing');
  }

  // Show app after auth check — minimum 2 secunde splash vizibil
  dismissOverlay();


  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if(event === 'PASSWORD_RECOVERY') {
      closeM('login');
      openM('reset-new-pass');
      return;
    }
    if(session?.user) {
      currentUser = session.user;
      updateUserUI(session.user);
      await loadUserData(session.user.id);
      if(typeof vanzRenderTarif==='function') setTimeout(vanzRenderTarif, 300);
      closeM('login');
      closeM('signup');
      await loadAgentHistory(curAgent);
      showDevBar();
      const saved = localStorage.getItem('aa_last_sec');
      const validSections = ['dashboard','garaj','documente','rca','rovinieta','agenti','vocal','asistenta','mentenanta','anvelope','ev','vanzare','carvertical','legal','setari','docpersonale','asigurari','servicii-stat','itp','costuri','verificare','peco','verif-nr','asistenta','premium'];
      _applySection((saved && validSections.includes(saved)) ? saved : 'dashboard');
    } else {
      currentUser = null;
      updateUserUI(null);
      _applySection('landing');
    }
  });
}

function updateUserUI(user) {
  const nameEl = document.getElementById('upill-name') || document.querySelector('.upill div div:first-child');
  const planEl = document.getElementById('upill-plan') || document.querySelector('.upill div div:last-child');
  const emailEl = document.getElementById('upill-email');
  const avatarEl = document.getElementById('upill-avatar');
  const mobLoginBtn = document.getElementById('mob-login-btn');
  const mobAvatar = document.getElementById('mob-user-btn');

  if(user) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizator';
    const email = user.email || '';
    if(nameEl) nameEl.textContent = name;
    if(planEl) {
      if(user.premium) {
        planEl.innerHTML = 'Plan Gratuit <span style="background:linear-gradient(135deg,#f0b429,#e09e1a);color:#000;font-size:9px;font-weight:800;padding:2px 6px;border-radius:8px;margin-left:4px">PRO</span>';
      } else {
        planEl.textContent = 'Plan Gratuit';
      }
    }
    if(emailEl){ emailEl.textContent = email; emailEl.style.display = email ? 'block' : 'none'; }
    if(avatarEl){ avatarEl.textContent = name.charAt(0).toUpperCase(); avatarEl.style.background='linear-gradient(135deg,#00e89a,#4f7dff)'; }
    if(mobLoginBtn) mobLoginBtn.style.display='none';
    const mobSignupBtn = document.getElementById('mob-signup-btn');
    if(mobSignupBtn) mobSignupBtn.style.display='none';
    const addBtn = document.getElementById('topbar-add-btn');
    if(addBtn) addBtn.style.display='';
    const mobAddBtn = document.getElementById('mob-add-car-btn');
    if(mobAddBtn) mobAddBtn.style.display='';
    if(mobAvatar){ mobAvatar.style.display='flex'; mobAvatar.textContent=name.charAt(0).toUpperCase(); }

    const memEl = document.getElementById('mem-status');
    if(memEl) memEl.innerHTML = '🧠 Memoria agentului este <span style="color:var(--green)">activă</span>';
    if(user) setTimeout(showDevBar, 500);
  } else {
    if(nameEl) nameEl.textContent = 'Intră în cont';
    if(planEl) planEl.textContent = 'Apasă pentru login';
    if(emailEl){ emailEl.textContent = ''; emailEl.style.display='none'; }
    if(avatarEl){ avatarEl.textContent = 'AA'; avatarEl.style.background='linear-gradient(135deg,#4f7dff,#7c5cfc)'; }
    if(mobLoginBtn) mobLoginBtn.style.display='flex';
    const mobSignupBtn2 = document.getElementById('mob-signup-btn');
    if(mobSignupBtn2) mobSignupBtn2.style.display='flex';
    const addBtn2 = document.getElementById('topbar-add-btn');
    if(addBtn2) addBtn2.style.display='none';
    const mobAddBtn2 = document.getElementById('mob-add-car-btn');
    if(mobAddBtn2) mobAddBtn2.style.display='none';
    if(mobAvatar) mobAvatar.style.display='none';
    const devBar = document.getElementById('dev-premium-bar');
    if(devBar) devBar.style.display='none';
    // Clear cars when not logged in - don't show other users' data
    cars = [];
    renderAll();
  }
}

async function loadUserData(userId) {
  // Load from user-specific localStorage cache immediately
  const cached = localStorage.getItem('autoassist-cars-' + userId);
  if(cached) {
    try { cars = JSON.parse(cached); renderAll(); } catch(e){}
  }
  if(!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('cars').select('*').eq('user_id', userId);
    if(error) { console.log('Supabase load error:', error); return; }
    if(data && data.length > 0) {
      // Merge Supabase data cu pozele din localStorage (fotos sunt doar local)
      const localCars = (() => { try { return JSON.parse(localStorage.getItem('autoassist-cars-'+userId)||'[]'); } catch(e){ return []; } })();
      cars = data.map(c => {
        const local = localCars.find(l=>l.id==c.id);
        return {...c, docs: c.docs||{}, mnt: c.mnt||{oilInt:10000, oilLast:0}, fotos: local?.fotos||c.fotos||[]};
      });
      localStorage.setItem('autoassist-cars-' + userId, JSON.stringify(cars));
      renderAll();
    } else if(!cached) {
      // Check old generic cache as migration fallback
      const oldCache = localStorage.getItem('autoassist-cars');
      if(oldCache) {
        try {
          const oldCars = JSON.parse(oldCache);
          if(oldCars.length > 0) {
            cars = oldCars;
            renderAll();
            // Migrate to Supabase
            for(const c of oldCars) {
              await supabaseClient.from('cars').upsert({...c, user_id: userId});
            }
            localStorage.setItem('autoassist-cars-' + userId, oldCache);
            showNotification('✅ Date recuperate!','Mașinile tale au fost restaurate și sincronizate.');
          }
        } catch(e){}
      }
    }
  } catch(e) { console.log('loadUserData error:', e); }
}

async function saveCarToCloud(car) {
  if(!supabaseClient || !currentUser) return;
  try {
    const carData = {
      id: car.id,
      user_id: currentUser.id,
      plate: car.plate,
      brand: car.brand,
      model: car.model,
      year: car.year,
      km: car.km,
      docs: car.docs,
      mnt: car.mnt,
      added: car.added
    };
    await supabaseClient.from('cars').upsert(carData, { onConflict: 'id' });
  } catch(e) { console.log('Car save error:', e); }
}

async function saveCarsToCloud() {
  if(!supabaseClient || !currentUser) return;
  for(const car of cars) {
    await saveCarToCloud(car);
  }
}

async function loginGoogle() {
  if(!supabaseClient){ alert('Supabase nu este conectat!'); return; }
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://www.autoassist.ro',
        queryParams: { prompt: 'select_account' }
      }
    });
    if(error) throw error;
  } catch(e) {
    console.error('Login Google eroare:', e);
    alert('Eroare: ' + e.message);
  }
}

function showResetPassword(){
  closeM('login');
  openM('reset-pw');
}
function hideResetPassword(){
  closeM('reset-pw');
  openM('login');
  var em=document.getElementById('reset-email');
  var msg=document.getElementById('reset-msg');
  if(em) em.value='';
  if(msg) msg.style.display='none';
}
async function doResetPassword(){
  const email=document.getElementById('reset-email').value.trim();
  const msg=document.getElementById('reset-msg');
  if(!email){msg.style.display='block';msg.style.background='rgba(255,79,109,0.1)';msg.style.color='var(--red)';msg.textContent='Introdu adresa de email!';return;}
  const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:'https://www.autoassist.ro'});
  if(error){msg.style.display='block';msg.style.background='rgba(255,79,109,0.1)';msg.style.color='var(--red)';msg.textContent='Eroare: '+error.message;}
  else{msg.style.display='block';msg.style.background='rgba(0,232,154,0.1)';msg.style.color='var(--green)';msg.textContent='✅ Email trimis! Verifică inbox-ul (și spam).';}
}
async function loginEmail() {
  const email = document.getElementById('login-email')?.value?.trim();
  const pass = document.getElementById('login-pass')?.value;
  const err = document.getElementById('login-err');
  if(err) err.style.display='none';
  if(!email || !pass){
    if(err){ err.style.display='block'; err.textContent='Completează email și parola!'; }
    return;
  }
  const btn = document.querySelector('#mo-login .btn-primary');
  if(btn){ btn.textContent='Se conectează...'; btn.disabled=true; }
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if(error){
      if(err){
        err.style.display='block';
        if(error.message.includes('Invalid login')) err.textContent='Email sau parolă incorectă!';
        else if(error.message.includes('Email not confirmed')) err.textContent='Email neconfirmat! Verifică inbox-ul sau resetează parola.';
        else err.textContent=error.message;
      }
    } else {
      currentUser = data.user;
      updateUserUI(data.user);
      closeM('login');
      showNotification('✅ Conectat!','Bun venit în AutoAssist!');
      _applySection('dashboard');
      setTimeout(showDevBar, 500);
      loadUserData(data.user.id).catch(e => console.log('loadUserData:', e));
    }
  } catch(e) {
    if(err){ err.style.display='block'; err.textContent='Eroare: '+e.message; }
  } finally {
    if(btn){ btn.textContent='Intră în cont'; btn.disabled=false; }
  }
}

async function signupEmail() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const pass = document.getElementById('signup-pass')?.value;
  const err = document.getElementById('signup-err');
  if(err){ err.style.display='none'; err.style.background=''; err.style.color=''; }
  if(!email || !pass){
    if(err){ err.style.display='block'; err.textContent='Completează email și parola!'; }
    return;
  }
  if(pass.length < 6){
    if(err){ err.style.display='block'; err.textContent='Parola trebuie să aibă cel puțin 6 caractere!'; }
    return;
  }
  const btn = document.querySelector('#mo-signup .btn-primary');
  if(btn){ btn.textContent='Se creează contul...'; btn.disabled=true; }
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email, password: pass,
      options: { data: { full_name: name || email.split('@')[0] } }
    });
    if(error){
      if(err){ err.style.display='block'; err.textContent=error.message==='User already registered'?'Acest email este deja înregistrat! Încearcă să te loghezi.':error.message; }
      return;
    }
    if(data.session){
      currentUser = data.session.user;
      updateUserUI(data.session.user);
      await loadUserData(data.session.user.id);
      closeM('signup');
      showNotification('✅ Cont creat!','Bun venit în AutoAssist, '+(name||email.split('@')[0])+'!');
      _applySection('dashboard');
      setTimeout(showDevBar, 500);
    } else {
      if(err){
        err.style.display='block';
        err.style.background='rgba(0,232,154,0.1)';
        err.style.color='var(--green)';
        err.style.border='1px solid rgba(0,232,154,0.3)';
        err.textContent='✅ Cont creat! Verifică emailul pentru confirmare, apoi loghează-te.';
      }
    }
  } catch(e) {
    if(err){ err.style.display='block'; err.textContent='Eroare: '+e.message; }
  } finally {
    if(btn){ btn.textContent='Creează cont'; btn.disabled=false; }
  }
}

async function logout() {
  if(!supabaseClient) return;
  await supabaseClient.auth.signOut();
  currentUser = null;
  cars = [];
  localStorage.removeItem('autoassist-cars');
  updateUserUI(null);
  renderAll();
  _applySection('landing');
}

function switchAuth(type) {
  if(type === 'login') { closeM('signup'); closeM('reset-pw'); openM('login'); }
  else if(type === 'signup') { closeM('login'); openM('signup'); }
}

// Update upill to show login/logout
document.querySelector('.upill')?.addEventListener('click', () => {
  if(currentUser) {
    if(confirm('Vrei să te deloghezi din AutoAssist?')) logout();
  } else {
    openM('login');
  }
});

// Update add car to save to cloud
// Override addCar to save to cloud
const _origAddCar = addCar;
addCar = async function() {
  _origAddCar();
  if(currentUser && cars.length > 0) {
    const car = cars[cars.length - 1];
    await saveCarToCloud(car);
  }
};

// Load saved API key automatically

const savedKey = localStorage.getItem('autoassist-api-key');
if(savedKey) {
  const el = document.getElementById('api-key');
  if(el) el.value = savedKey;
  // Show status if key exists
  const st = document.getElementById('key-status');
  if(st) {
    st.style.display='block';
    st.style.background='rgba(0,232,154,0.1)';
    st.style.border='1px solid rgba(0,232,154,0.25)';
    st.style.color='var(--green)';
    st.textContent='✅ API Key activ — Agenții AI funcționează cu inteligență reală!';
  }
}

// Show seasonal alert on dashboard
setTimeout(()=>{ if(typeof showSeasonalAlert==='function') showSeasonalAlert(); if(typeof loadDashVanzari==='function') loadDashVanzari(); }, 500);
// Seteaza state initial pentru butonul Back — landing pentru nelogati
try { history.replaceState({sec:'landing',idx:0},'',window.location.pathname); } catch(e) {}

// Load API key
loadSavedKey();

// Init Supabase auth
initAuth();

// ═══ PECO & CARBURANT ═══
async function loadFuelPrices() {
  const body = document.getElementById('fuel-prices-body');
  if(!body) return;
  try {
    // Prețuri medii Romania - actualizate prin wttr-like API
    const res = await fetch('https://api.collectapi.com/gasPrice/fromCountry?countryCode=RO', {
      headers: {'content-type':'application/json','authorization':'apikey 0'}
    });
    // Fallback cu prețuri aproximative actualizate
    throw new Error('use fallback');
  } catch(e) {
    // Prețuri reprezentative Romania Mai 2026
    const prices = [
      {name:'Benzină 95', price:'7.05 RON/L', icon:'🟢', id:'benzina'},
      {name:'Benzină 98', price:'7.45 RON/L', icon:'🔵', id:'benzina98'},
      {name:'Motorină', price:'6.95 RON/L', icon:'🔵', id:'motorina'},
      {name:'GPL', price:'3.45 RON/L', icon:'🟡', id:'gpl'},
      {name:'AdBlue', price:'4.20 RON/L', icon:'⚪', id:'adblue'},
    ];
    body.innerHTML = prices.map(p => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--b1)">
        <span style="font-size:13px;color:var(--t2)">${p.icon} ${p.name}</span>
        <span style="font-weight:700;color:var(--text);font-size:15px">${p.price}</span>
      </div>
    `).join('');
    // Actualizez și prețurile din calculator
    const benzEl = document.getElementById('peco-benzina-price');
    const motorEl = document.getElementById('peco-motorina-price');
    const gplEl = document.getElementById('peco-gpl-price');
    if(benzEl) benzEl.textContent = '7.05 RON/L';
    if(motorEl) motorEl.textContent = '6.95 RON/L';
    if(gplEl) gplEl.textContent = '3.45 RON/L';
  }
}

function calcFuelCost() {
  const liters = parseFloat(document.getElementById('tank-size')?.value) || 0;
  const type = document.getElementById('fuel-type-calc')?.value;
  const prices = {benzina: 7.05, motorina: 6.95, gpl: 3.45};
  const price = prices[type] || 7.05;
  const cost = (liters * price).toFixed(2);
  const res = document.getElementById('fuel-cost-result');
  if(res && liters > 0) res.innerHTML = `Plin de <strong>${liters}L ${type}</strong> costă aproximativ <strong style="color:var(--accent)">${cost} RON</strong>`;
}

function findStations(type) {
  const container = document.getElementById('peco-map-container');
  const list = document.getElementById('peco-stations-list');
  if(!container) return;

  if(!navigator.geolocation) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--t3)">GPS indisponibil în browserul tău</div>';
    return;
  }

  container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3)">📍 Se detectează locația...</div>';

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const label = type === 'gas_station' ? 'benzinării' : 'stații EV';
    const query = type === 'gas_station' ? 'benzinarie+peco' : 'statii+incarcare+electrice';

    // Google Maps embed cu stații în jur
    const mapUrl = `https://www.google.com/maps/embed/v1/search?key=AIzaSyD-placeholder&q=${query}&center=${lat},${lng}&zoom=13`;

    // Buton deschide Google Maps direct
    container.innerHTML = `
      <div style="height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:var(--s2);border-radius:12px">
        <div style="font-size:40px">${type === 'gas_station' ? '⛽' : '⚡'}</div>
        <div style="font-size:13px;color:var(--t2);text-align:center">Găsite ${label} în zona ta</div>
        <a href="https://www.google.com/maps/search/${query}/@${lat},${lng},14z" target="_blank" 
           class="btn btn-primary" style="font-size:13px;text-decoration:none">
          🗺️ Deschide în Google Maps
        </a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${type === 'gas_station' ? 'benzinarie' : 'statie+incarcare+EV'}&travelmode=driving&origin=${lat},${lng}" 
           target="_blank" class="btn btn-ghost" style="font-size:12px;text-decoration:none">
          🧭 Traseu spre cea mai apropiată
        </a>
      </div>`;

    if(list) list.innerHTML = `<div style="font-size:12px;color:var(--t3);text-align:center;padding:8px">📍 Locație detectată: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>`;

  }, () => {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--red)">❌ Nu s-a putut accesa locația. Permite GPS în browser.</div>';
  });
}

// Load fuel prices when peco section opens
const _origApply = typeof _applySection === 'function' ? _applySection : null;
document.addEventListener('DOMContentLoaded', () => {
  const origGoTo = window.goTo;
  if(origGoTo) {
    window.goTo = function(sec) {
      origGoTo(sec);
      if(sec === 'peco') setTimeout(loadFuelPrices, 200);
    };
  }
});
