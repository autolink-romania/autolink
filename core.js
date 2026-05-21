// ═══ STATE ═══
let cars=[];
let currentUser = null;
let selCarId=null;
let curAgent='manager';
let chatHistory=[];

const DN={rca:'RCA',itp:'ITP',rov:'Rovinietă',ext:'Extinctor',trz:'Trusă Medicală'};
const MOCK={
  'B123ABC':{brand:'Dacia',model:'Logan',year:2018,km:112000,vin:'UU1LSDAAC47742123'},
  'B456DEF':{brand:'Volkswagen',model:'Golf',year:2016,km:145000,vin:'WVWZZZ1KZAW123456'},
  'CJ99ABC':{brand:'BMW',model:'Seria 3',year:2015,km:189000,vin:'WBA3A5C5XDF126235'},
  'TM12XYZ':{brand:'Renault',model:'Megane',year:2019,km:78000,vin:'VF1KZ0C0H12345678'},
  'IS55ZZZ':{brand:'Ford',model:'Focus',year:2017,km:134000,vin:'WF0EXXGBDE1234567'},
};

const AUTOASSIST_KNOWLEDGE = `
=== PLATFORMA AUTOASSIST — CUNOȘTINȚE COMPLETE ===

DESCRIERE: AutoAssist este prima platformă digitală din România care combină managementul complet al mașinilor personale și de firmă cu inteligență artificială. Fondată în 2026.

MISIUNE: "Asistentul tău auto — mereu disponibil, mereu corect"

FUNCȚIONALITĂȚI PRINCIPALE:
1. GARAJ VIRTUAL — adaugi mașini prin numărul de înmatriculare, datele se completează automat
2. DOCUMENTE AUTO — gestionare RCA, ITP, Rovinietă, Extinctor cu alerte la 30, 15, 7, 3, 1 zi înainte
3. ASIGURĂRI RCA — reînnoiești sau faci RCA prin parteneri autorizați ASF: Allianz, Euroins, Groupama, Omniasig, Generali, GRAWE, Uniqa
4. CARVERTICAL — verificare istorică mașini SH cu reducere -20% (cea mai mare de pe piață)
5. PROGRAMARE ITP — găsești stații autorizate RAR în zona ta
6. VÂNZARE MAȘINI — anunț completat automat, publicare pe OLX și Autovit cu promovare 7 zile gratuită
7. ASISTENȚĂ RUTIERĂ — firme partenere în raza 50-100km, 50 RON comision per colaborare
8. MENTENANȚĂ — urmărire interval schimb ulei, programare service, comandă piese ePiesa/AutoKarma
9. CALCULATOR COSTURI — calculează costul real anual al mașinii tale
10. MODUL EV — calculator autonomie, stații încărcare, avantaje mașini electrice
11. ASISTENT VOCAL AI — răspunsuri rapide pentru șoferi
12. AGENȚI AI — Manager, Juridic, Auto, Cod, Documente

PREȚURI:
- Plan Gratuit: până la 2 mașini, alerte la 30 și 7 zile, verificare RCA de bază
- Plan Premium: 49 RON/an (≈4 RON/lună)
- Raport verificare SH (Checklist Mecanic): 10 RON
- Primul raport SH gratuit la înregistrare
- Prima verificare CarVertical gratuită la înregistrare
- Primul anunț vânzare gratuit

SURSE DE VENIT AUTOASSIST:
- Comision RCA: negociat cu partenerii autorizați ASF
- Comision CarVertical: 3-8 EUR per verificare
- Comision vânzare mașini: 20-50 RON per anunț (de la OLX/Autovit)
- Abonament Premium: 49 RON/an
- Asistență rutieră: 50 RON per colaborare confirmată
- Raport SH: 10 RON per raport
- Programare ITP: 15-25 RON comision per programare

PARTENERI:
- Brokeri RCA: Allianz, Euroins, Groupama, Omniasig, Generali, GRAWE, Uniqa
- Verificare istorică: CarVertical (reducere -20% exclusiv AutoAssist)
- Publicare anunțuri: OLX.ro, Autovit.ro, Storia.ro
- Piese auto: ePiesa, AutoKarma
- Stații ITP autorizate RAR în zona ta
- Firme asistență rutieră: AutoAssist România, Road Help 24/7, Tractări Express

ASPECT LEGAL:
- Formă juridică: AutoAssist SRL (în curs de înregistrare)
- Coduri CAEN: 6201 (software), 6311 (date), 5829 (produse software), 6312 (portaluri web)
- GDPR compliant, Termeni și Condiții complete
- Înregistrare marcă la OSIM în curs

TEHNOLOGIE:
- Frontend: HTML/CSS/JavaScript (în prezent), React Native (viitor pentru mobil)
- Backend: în dezvoltare cu Node.js
- AI: Claude API (Anthropic) - claude-sonnet-4-5
- Baze de date: localStorage (în prezent), Supabase (viitor)
- Hosting: Vercel (viitor)

PIAȚĂ ȘI CONCURENȚĂ:
- Principali concurenți: autoMinder (flote), MyCar Assistant (GPS), Alerte Mașină (basic)
- Avantaj competitiv: singurii cu AI real integrat + toate serviciile într-o singură aplicație
- Piață țintă: 8+ milioane șoferi din România
- Trend global: AI în automotive (Google Gemini în mașini GM, 2026)

FONDATOR: Anonim (mecanic auto cu experiență, locuiește în Olanda)
WEBSITE: www.autoassist.ro (în dezvoltare)
EMAIL: office@autoassist.ro
`;

function buildAgentPrompt(agent) {
  const today = new Date();

  // ── GARAJ ──
  let carCtx = '';
  if (typeof cars !== 'undefined' && cars.length > 0) {
    carCtx = '\n\n== GARAJUL UTILIZATORULUI ==\n' + cars.map(c => {
      const docs = c.docs || {};
      const mnt  = c.mnt  || {};
      const daysUntil = v => v ? Math.ceil((new Date(v) - today) / 864e5) : null;
      const fmt = v => { const d = daysUntil(v); return v ? `${v} (${d > 0 ? d + ' zile' : 'EXPIRAT'})` : 'necunoscut'; };

      const lines = [
        `• ${c.brand||''} ${c.model||''} ${c.year||''} | Nr: ${c.plate||'?'} | Km: ${c.km||'?'}`,
        `  Combustibil: ${c.fuel||'?'} | Motor: ${c.engine||'?'} | VIN: ${c.vin||'?'}`,
        `  RCA: ${fmt(docs.rca)} | ITP: ${fmt(docs.itp)} | Rovinietă: ${fmt(docs.rov)||'?'}`,
        `  Extinctor: ${fmt(docs.ext)||'?'} | Trusă: ${fmt(docs.trz)||'?'}`,
        mnt.oilLast ? `  Ulei: schimbat la ${mnt.oilLast}km, interval ${mnt.oilInt||'?'}km, km actuali ${c.km||'?'} → mai sunt ${mnt.oilLast && mnt.oilInt ? (mnt.oilLast + mnt.oilInt - (c.km||0)) + 'km' : '?'}` : '',
        c.notes ? `  Note: ${c.notes}` : '',
      ].filter(Boolean).join('\n');
      return lines;
    }).join('\n\n');
    carCtx += '\n\nAi acces complet la datele de mai sus. Folosește-le direct fără să ceri utilizatorului să le repete.';
  } else {
    carCtx = '\n\nUtilizatorul nu are mașini adăugate în garaj.';
  }

  // ── BAZA DE CUNOȘTINȚE PLATFORMA ──
  const platformCtx = '\n\n== PLATFORMA AUTOASSIST ==\nEști integrat în AutoAssist — platformă română de management auto cu: Garaj virtual, Documente (RCA/ITP/Rovinietă), Asigurări RCA, CarVertical, Vânzare mașini, Service & Mentenanță, Asistență rutieră, Calculator costuri, Modul EV, Asistent vocal. Premium: 49 RON/an.';

  // ── INSTRUCȚIUNI GENERALE ──
  const now = new Date();
  const dateCtx = `\n\nData și ora curentă: ${now.toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} ora ${now.toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'})}. Locație implicită utilizator: România.`;
  const general = '\n\nPOȚI RĂSPUNDE LA ORICE ÎNTREBARE — nu doar auto. Ești un AI complet. Dacă primești [Context din internet] sau [Vreme actuală] în mesaj, folosește acele date direct. Pentru vreme, dacă nu ai date live în context, spune temperatura aproximativă pentru sezonul și locația menționată bazat pe climatele tipice. Nu refuza niciodată o întrebare — răspunde cu ce știi. Răspunzi în română, natural, fără markdown excesiv.';

  const base = {
    manager:   `Ești Agentul Manager AutoAssist — asistentul principal al utilizatorului. Ai acces la garajul lui și poți ajuta cu orice: mașini, documente, legislație, sfaturi generale, întrebări de zi cu zi. Ești prietenos, direct și util.`,
    auto:      `Ești Agentul Auto & Service — mecanic virtual expert. Ajuți cu defecțiuni, reparații, piese, întreținere, costuri service. Ai acces la datele mașinilor utilizatorului și le folosești direct.`,
    documente: `Ești Agentul Documente — specialist RCA, ITP, rovinietă, asigurări. Știi exact ce documente are utilizatorul, când expiră și ce trebuie făcut. Ajuți cu proceduri, amenzi, termene. La finalul oricărui răspuns despre termene legale, amenzi sau proceduri oficiale, adaugă scurt: "⚠️ Verifică datele actualizate pe drpciv.ro sau politiarutiera.ro."`,
    juridic:   `Ești Agentul Juridic — expert legislație auto română 2026, contracte vânzare, drepturi consumatori, amenzi, contestații, GDPR auto. Răspunzi clar și util, menționezi când e nevoie de avocat real. La finalul oricărui răspuns despre legi, amenzi sau drepturi, adaugă scurt: "⚠️ Legislația se poate modifica — verifică pe legislatie.just.ro sau consultă un avocat pentru cazuri complexe."`,
    vanzare:   `Ești Agentul Vânzare — expert vânzare mașini SH în România. Ai acces la mașinile din garajul utilizatorului și poți ajuta direct cu prețuri, descrieri pentru OLX/Autovit, acte necesare, negociere, evitare escrocherii.`,
    itp:       `Ești Agentul ITP & Service — expert ITP, RAR, pregătire mașină, revisii periodice. Știi exact când expiră ITP-ul utilizatorului și ce trebuie verificat.`,
  };

  return (base[agent] || base.manager) + carCtx + platformCtx + dateCtx + general;
}

const AGENT_PROMPTS={manager:'',auto:'',documente:'',juridic:'',vanzare:'',itp:''};

const AGENT_NAMES={manager:'Agent Manager',auto:'Agent Auto & Service',documente:'Agent Documente',juridic:'Agent Juridic',vanzare:'Agent Vânzare',itp:'Agent ITP & Service'};
const AGENT_ICONS={manager:'🧠',auto:'🔧',documente:'📄',juridic:'⚖️',vanzare:'💰',itp:'🔬'};

// ═══ PREMIUM SYSTEM ═══
function isPremium() {
  return (currentUser && currentUser.premium === true) || false;
}

// Limite gratuit
const FREE_LIMITS = {
  agenti_msg: 5,      // +1 mesaj de rămas bun
  vocal_queries: 3,
  masini: 1,
};

function getLimitKey(type) {
  const today = new Date().toDateString();
  const uid = currentUser ? currentUser.id : 'guest';
  return `aa_limit_${uid}_${type}_${today}`;
}

function getUsage(type) {
  return parseInt(localStorage.getItem(getLimitKey(type)) || '0');
}

function incrementUsage(type) {
  const key = getLimitKey(type);
  const val = getUsage(type) + 1;
  localStorage.setItem(key, val);
  return val;
}

function canUse(type) {
  if(isPremium()) return true;
  const usage = getUsage(type);
  return usage < FREE_LIMITS[type];
}

function isLastFreeMsg(type) {
  if(isPremium()) return false;
  return getUsage(type) === FREE_LIMITS[type];
}

function showUpgradeModal(reason) {
  const msg = {
    agenti_msg: 'Ai folosit toate cele 5 mesaje gratuite de azi. Revino mâine sau activează Premium pentru conversații nelimitate!',
    vocal_queries: 'Ai folosit cele 3 întrebări vocale gratuite de azi. Activează Premium pentru acces nelimitat!',
    masini: 'Planul gratuit permite o singură mașină. Activează Premium pentru mașini nelimitate!',
    export_pdf: 'Exportul dosarului auto este disponibil doar în planul Premium.',
    sms: 'Alertele SMS sunt disponibile doar în planul Premium.',
    raport_ai: 'Raportul AI de stare mașină este disponibil doar în planul Premium.',
  };
  const el = document.getElementById('upgrade-modal-text');
  if(el) el.textContent = msg[reason] || 'Activează Premium pentru acces nelimitat!';
  openM('upgrade');
}


function loadSavedKey() {
  const savedKey = localStorage.getItem('autoassist-api-key');
  if(savedKey) {
    const el = document.getElementById('api-key');
    if(el) el.value = savedKey;
    const st = document.getElementById('key-status');
    if(st) {
      st.style.display='block';
      st.style.background='rgba(0,232,154,0.1)';
      st.style.border='1px solid rgba(0,232,154,0.25)';
      st.style.color='var(--green)';
      st.textContent='✅ API Key activ — Agenții AI funcționează!';
    }
  }
}

// ─── NAVIGARE CU HISTORY API ───
let _navStack = ['dashboard'];
function _applySection(sec){
  if(!document.getElementById('sec-'+sec)) sec='dashboard';
  // Salvez pagina curentă (dacă userul e logat, nu pe landing)
  if(sec !== 'landing') localStorage.setItem('aa_last_sec', sec);
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  document.getElementById('sec-'+sec).classList.add('active');

  // Ascunde sidebar și header pe landing page
  const sidebar = document.querySelector('.sidebar');
  const mainEl = document.querySelector('.main');
  if(sec === 'landing') {
    if(sidebar) sidebar.style.display = 'none';
    if(mainEl) { mainEl.style.marginLeft = '0'; mainEl.style.paddingTop = '0'; }
  } else {
    if(sidebar) sidebar.style.display = '';
    if(mainEl) { mainEl.style.marginLeft = ''; mainEl.style.paddingTop = ''; }
  }

  document.querySelectorAll('.ni').forEach(n=>{if(n.getAttribute('onclick')?.includes("'"+sec+"'"))n.classList.add('active');});
  if(sec==='itp'){populateITPCars();checkITPPremium();}
  if(sec==='costuri') populateCostCars();
  if(sec==='asistent') { setTimeout(loadVoices, 200); }
  if(sec==='mentenanta') { populateMntSelects(); mntTab('istoric'); }
  if(sec==='anvelope') { populateMntSelects(); updateAnvLink(); }
  if(sec==='setari') { renderDashConfigList(); }
  if(sec==='docpersonale') { docTab('buletin'); loadDocData('buletin'); renderAltDocs(); }
  if(sec==='dashboard'){showSeasonalAlert();loadDashVanzari();renderDashCustomCards();}
  if(sec==='setari') setTimeout(loadSavedKey,100);
  if(sec==='setari') setTimeout(()=>{ if(typeof initSMSSettings==='function') initSMSSettings(); },150);
  if(sec==='asigurari') setTimeout(resetRcaModal, 50);
  if(sec==='verif-nr') setTimeout(()=>{ if(typeof renderVerifRecent==='function') renderVerifRecent(); }, 100);
  if(sec==='peco') setTimeout(()=>{ if(typeof loadFuelPrices==='function') loadFuelPrices(); }, 200);
  if(sec==='vanzare'){loadVanzCars();vanzLoadLista();document.getElementById('vanz-step1').style.display='block';document.getElementById('vanz-step2').style.display='none';document.getElementById('vanz-step3').style.display='none';}
  renderAll(); 
  // Nu face scroll la top pentru sectiuni cu iframe (asigurari)
  if(sec !== 'asigurari') window.scrollTo(0,0);
}
function goTo(sec){
  _navStack.push(sec);
  try { history.pushState({sec:sec,idx:_navStack.length-1},'',window.location.pathname+'#'+sec); } catch(e){}
  _applySection(sec);
}
window.addEventListener('popstate',function(e){
  let sec=(e.state&&e.state.sec)?e.state.sec:'dashboard';
  if(e.state&&e.state.idx!==undefined) _navStack=_navStack.slice(0,e.state.idx+1);
  // Dacă userul e logat și back-ul duce la landing, redirectează la dashboard
  if(sec==='landing' && currentUser) sec='dashboard';
  // Dacă suntem pe asigurari și se face popstate, împinge înapoi starea curentă
  // pentru a preveni navigarea accidentală cu swipe
  const curSec = document.querySelector('.sec.active')?.id?.replace('sec-','');
  if(curSec === 'asigurari' && sec !== 'asigurari') {
    // Lasă să navigheze normal
  }
  _applySection(sec);
});
function setBN(el){document.querySelectorAll('.bn').forEach(b=>b.classList.remove('active'));el.classList.add('active');}
function openMore(){document.getElementById('msheet').classList.add('open');}
function closeMBg(e){if(e.target.classList.contains('msheet-bg')||e.target===document.getElementById('msheet'))document.getElementById('msheet').classList.remove('open');}
function closeMD(){document.getElementById('msheet').classList.remove('open');}

// ═══ MODAL ═══
function openM(id){
  document.getElementById('mo-'+id).classList.add('open');
  if(id==='login'||id==='signup') document.body.classList.add('auth-open');
}
function closeM(id){
  document.getElementById('mo-'+id).classList.remove('open');
  if(id==='login'||id==='signup'){
    if(!document.querySelector('.mo.mo-auth.open')) document.body.classList.remove('auth-open');
  }
  if(id==='add-car'){
    ['m-pl','m-br','m-mo','m-yr','m-km','m-rc','m-it','m-rv','m-ex','m-tr','m-oi','m-ol','m-vin','m-engine','m-color'].forEach(i=>{let e=document.getElementById(i);if(e)e.value='';});
    const acord=document.getElementById('m-acord'); if(acord) acord.checked=false;;
    const inf=document.getElementById('m-inf');if(inf)inf.style.display='none';
  }
}

// ═══ AUTO-FILL ═══
const VEHICUL_API = 'https://www.autoassist.ro/api/vehicul';

// Cache pentru a nu repeta cereri
const _apiCache = {};

function autoFill(inputId, infoId) {
  const raw = document.getElementById(inputId).value;
  const val = raw.replace(/\s/g,'').toUpperCase();
  const info = document.getElementById(infoId);
  if(!info) return;
  if(val.length < 5) { info.style.display='none'; return; }

  // MOCK pentru date demo
  const d = MOCK[val];
  if(d) {
    info.style.display='block';
    info.innerHTML='<span style="color:var(--green)">✅ <strong>'+d.brand+' '+d.model+' ('+d.year+')</strong> · VIN: '+d.vin+'</span>';
    if(inputId==='m-pl'){
      document.getElementById('m-br').value=d.brand;
      document.getElementById('m-mo').value=d.model;
      document.getElementById('m-yr').value=d.year;
      document.getElementById('m-km').value=d.km;
    }
    return;
  }

  if(val.length < 6) { info.style.display='none'; return; }

  // Dacă avem în cache, folosim imediat
  if(_apiCache[val]) {
    _applyApiResult(inputId, infoId, _apiCache[val]);
    return;
  }

  info.style.display='block';
  info.innerHTML='<span style="color:var(--amber)">⏳ Se verifică '+val+' în bazele de date...</span>';

  fetch(VEHICUL_API+'?nr='+encodeURIComponent(val))
    .then(r=>r.json())
    .then(data=>{
      _apiCache[val] = data;
      _applyApiResult(inputId, infoId, data);
    })
    .catch(()=>{
      info.innerHTML='<span style="color:var(--t3)">⚠️ Completează manual — verificarea automată indisponibilă momentan</span>';
    });
}

function _applyApiResult(inputId, infoId, data) {
  const info = document.getElementById(infoId);
  if(!info) return;

  // Construim mesajul de status
  let html = '<div style="display:flex;flex-direction:column;gap:4px">';

  // Județ
  if(data.judet) html += '<span style="color:var(--green);font-weight:700">📍 '+data.judet+'</span>';

  // RCA
  if(data.rca?.valid === true) {
    html += '<span style="color:var(--green)">🛡️ RCA valid până la <strong>'+data.rca.expira+'</strong>';
    if(data.rca.asigurator) html += ' · '+data.rca.asigurator;
    if(data.rca.zileRamase <= 30) html += ' <span style="color:var(--amber)">⚠️ '+data.rca.zileRamase+' zile</span>';
    html += '</span>';
    // Auto-completare câmp RCA dacă suntem în modal adaugă mașină
    if(inputId==='m-pl' && data.rca.expira) {
      const rcaEl = document.getElementById('m-rc');
      if(rcaEl && !rcaEl.value) rcaEl.value = data.rca.expira;
    }
  } else if(data.rca?.valid === false) {
    html += '<span style="color:var(--red)">🛡️ RCA '+data.rca.mesaj+'</span>';
  } else {
    html += '<span style="color:var(--t3)">🛡️ RCA — '+( data.rca?.mesaj||'verificare manuală necesară')+'</span>';
  }

  // Rovinietă
  if(data.rovinieta?.valid === true) {
    html += '<span style="color:var(--green)">🛣️ Rovinietă validă până la <strong>'+data.rovinieta.expira+'</strong>';
    if(data.rovinieta.zileRamase <= 15) html += ' <span style="color:var(--amber)">⚠️ '+data.rovinieta.zileRamase+' zile</span>';
    html += '</span>';
    if(inputId==='m-pl' && data.rovinieta.expira) {
      const rovEl = document.getElementById('m-rv');
      if(rovEl && !rovEl.value) rovEl.value = data.rovinieta.expira;
    }
  } else if(data.rovinieta?.valid === false) {
    html += '<span style="color:var(--red)">🛣️ Rovinietă '+data.rovinieta.mesaj+'</span>';
  } else {
    html += '<span style="color:var(--t3)">🛣️ Rovinietă — verificare manuală necesară</span>';
  }

  // ITP
  if(data.itp?.valid === true) {
    html += '<span style="color:var(--green)">🔬 ITP valid până la <strong>'+data.itp.expira+'</strong></span>';
    if(inputId==='m-pl' && data.itp.expira) {
      const itpEl = document.getElementById('m-it');
      if(itpEl && !itpEl.value) itpEl.value = data.itp.expira;
    }
  } else if(data.itp?.valid === false) {
    html += '<span style="color:var(--red)">🔬 ITP expirat!</span>';
  } else if(data.itp?.necesitaVIN) {
    html += '<span style="color:var(--t3)">🔬 ITP — introdu VIN din talon pentru verificare automată</span>';
  }

  html += '</div>';
  info.style.display='block';
  info.innerHTML=html;
}

function populateITPCars(){
  const sel=document.getElementById('itp-car');
  if(!sel)return;
  sel.innerHTML='<option value="">-- Selectează mașina --</option>';
  cars.forEach(c=>sel.innerHTML+=`<option value="${c.id}">${c.plate} — ${c.brand} ${c.model}</option>`);
}

// ═══ CARS ═══
// ═══ OCR TALON ═══
async function ocrTalon(input) {
  const file = input.files[0];
  if (!file) return;
  const status = document.getElementById('ocr-status');
  status.style.display = 'block';
  status.style.background = 'rgba(79,125,255,0.1)';
  status.style.color = 'var(--t2)';
  status.textContent = '⏳ Se analizează talonul... (5-10 secunde)';

  try {
    // Convertesc imaginea în base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const mediaType = file.type || 'image/jpeg';

    // Trimit la Claude API prin Edge Function
    const res = await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/asistent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGNrbmp1cWRqZnh0cXJxaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzI5NDcsImV4cCI6MjA1OTEwODk0N30.5YhiDJmZ4SKSCkm9H4d5FdBWZ0fJuWkSBhCL5bVFYxE'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        system: 'Ești un sistem OCR specializat pentru cărți de identitate ale vehiculelor românești. Extrage datele și returnează DOAR JSON valid, fără explicații.',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 }
            },
            {
              type: 'text',
              text: 'Aceasta este cartea de identitate a unui vehicul (talon). Extrage toate datele vizibile și returnează DOAR un JSON cu structura: {"nr_inmatriculare":"","marca":"","model":"","an_fabricatie":"","serie_sasiu":"","motor_cmc":"","combustibil":"","culoare":"","masa":"","locuri":""}'
            }
          ]
        }]
      })
    });

    const data = await res.json();
    const reply = data.reply || '';
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Nu am putut extrage datele');

    const d = JSON.parse(jsonMatch[0]);

    // Completez câmpurile din modal
    if (d.nr_inmatriculare) { const el = document.getElementById('m-pl'); if(el) el.value = d.nr_inmatriculare.toUpperCase().replace(/\s/g,''); }
    if (d.marca) { const el = document.getElementById('m-br'); if(el) el.value = d.marca; }
    if (d.model) { const el = document.getElementById('m-mo'); if(el) el.value = d.model; }
    if (d.an_fabricatie) { const el = document.getElementById('m-yr'); if(el) el.value = d.an_fabricatie; }
    if (d.serie_sasiu) { const el = document.getElementById('m-vin'); if(el) el.value = d.serie_sasiu; }
    if (d.motor_cmc) { const el = document.getElementById('m-engine'); if(el) el.value = d.motor_cmc; }
    if (d.combustibil) { const el = document.getElementById('m-fuel'); if(el) { Array.from(el.options).forEach(o => { if(o.text.toLowerCase().includes(d.combustibil.toLowerCase())) el.value = o.value; }); } }
    if (d.culoare) { const el = document.getElementById('m-color'); if(el) el.value = d.culoare; }

    const filled = Object.values(d).filter(v=>v).length;
    status.style.background = 'rgba(0,232,154,0.1)';
    status.style.color = 'var(--green)';
    status.textContent = `✅ Am extras ${filled} câmpuri din talon! Poza a fost salvată în Documente. Verifică și completează ce lipsește.`;

    // Salvez poza talonului în documente personale
    try {
      const docKey = 'doc_talon_' + (currentUser?.id || 'local');
      const talonDoc = {
        tip: 'talon',
        label: 'Carte identitate vehicul',
        data: 'data:' + mediaType + ';base64,' + base64,
        dataAdaugare: new Date().toISOString(),
        numarInmatriculare: d.nr_inmatriculare || document.getElementById('m-pl')?.value || ''
      };
      const existingDocs = JSON.parse(localStorage.getItem(docKey) || '[]');
      existingDocs.unshift(talonDoc);
      if(existingDocs.length > 10) existingDocs.splice(10);
      localStorage.setItem(docKey, JSON.stringify(existingDocs));

      // Salvez și în Supabase dacă e logat
      if(supabaseClient && currentUser) {
        supabaseClient.from('documente_personale').upsert({
          user_id: currentUser.id,
          tip: 'talon',
          nr_inmatriculare: d.nr_inmatriculare || '',
          imagine_url: null, // se poate adăuga Supabase Storage mai târziu
          date_extrase: JSON.stringify(d),
          created_at: new Date().toISOString()
        }).then(()=>{});
      }
    } catch(e) { console.log('Eroare salvare doc talon:', e); }

  } catch(e) {
    status.style.background = 'rgba(255,59,59,0.1)';
    status.style.color = 'var(--red)';
    status.textContent = '❌ Nu am putut citi talonul. Încearcă o poză mai clară sau completează manual.';
    console.error('OCR error:', e);
  }

  input.value = '';
}

// Poze mașină
window._carFotos = {1: null, 2: null};

function previewCarFoto(input, nr) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    // Comprimez imaginea
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      window._carFotos[nr] = compressed;
      // Preview
      const imgEl = document.getElementById('m-foto'+nr+'-img');
      const textEl = document.getElementById('m-foto'+nr+'-text');
      if(imgEl) { imgEl.src = compressed; imgEl.style.display = 'block'; }
      if(textEl) textEl.style.display = 'none';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addCar(){
  if(!isPremium() && cars.length >= FREE_LIMITS.masini) { showUpgradeModal('masini'); return; }
  const plate=document.getElementById('m-pl').value.trim().toUpperCase();
  if(!plate){alert('Introdu numărul de înmatriculare!');return;}
  const acord=document.getElementById('m-acord');
  if(!acord?.checked){alert('Te rugăm să confirmi acordul înainte de a adăuga mașina.');return;}
  const fotos = [];
  if(window._carFotos[1]) fotos.push(window._carFotos[1]);
  if(window._carFotos[2]) fotos.push(window._carFotos[2]);
  cars.push({
    id:Date.now(),plate,
    brand:document.getElementById('m-br').value||'Necunoscut',
    model:document.getElementById('m-mo').value||'',
    year:document.getElementById('m-yr').value||'',
    km:parseInt(document.getElementById('m-km').value)||0,
    vin:document.getElementById('m-vin')?.value||'',
    engine:document.getElementById('m-engine')?.value||'',
    fuel:document.getElementById('m-fuel')?.value||'',
    color:document.getElementById('m-color')?.value||'',
    fotos,
    docs:{rca:document.getElementById('m-rc').value,itp:document.getElementById('m-it').value,rov:document.getElementById('m-rv').value,ext:document.getElementById('m-ex').value,trz:document.getElementById('m-tr').value},
    mnt:{oilInt:parseInt(document.getElementById('m-oi').value)||10000,oilLast:parseInt(document.getElementById('m-ol').value)||0},
    added:new Date().toISOString().split('T')[0]
  });
  // Reset poze
  window._carFotos = {1: null, 2: null};
  [1,2].forEach(n => {
    const imgEl = document.getElementById('m-foto'+n+'-img');
    const textEl = document.getElementById('m-foto'+n+'-text');
    if(imgEl) { imgEl.src=''; imgEl.style.display='none'; }
    if(textEl) textEl.style.display='block';
  });
  save();closeM('add-car');renderAll();
}
async function delCar(id){
  if(!confirm('Ștergi mașina din garaj?'))return;
  cars=cars.filter(c=>c.id!==id);
  save();renderAll();
  if(supabaseClient && currentUser) {
    try { await supabaseClient.from('cars').delete().eq('id', id).eq('user_id', currentUser.id); } catch(e) {}
  }
}
function save(){const _uid = currentUser?.id || 'local';
  localStorage.setItem('autoassist-cars-'+_uid, JSON.stringify(cars));
  localStorage.setItem('autoassist-cars',JSON.stringify(cars));}

// ═══ HELPERS ═══
function dl(d){if(!d)return null;return Math.ceil((new Date(d)-new Date())/864e5);}
function cls(d){if(d===null)return'ok';if(d<=7)return'danger';if(d<=30)return'warn';return'ok';}
function dT(d){if(d===null)return'—';if(d<0)return`Exp.(${Math.abs(d)}z)`;if(d===0)return'Azi!';return`${d}z`;}
function cntAl(){let n=0;cars.forEach(c=>Object.values(c.docs).forEach(v=>{const d=dl(v);if(d!==null&&d<=30)n++;}));return n;}

// ═══ RENDER ═══
function renderAll(){
  rStats();rDC();rDA();rGaraj();rDocs();rMnt();rVanzC();renderDashCustomCards();
  const al=cntAl();
  document.getElementById('nb-c').textContent=cars.length;
  document.getElementById('nb-a').textContent=al;
  document.getElementById('nb-a').style.display=al?'':'none';
  const bd=document.getElementById('bd-d');if(bd)bd.className='bn-dot'+(al?' show':'');
}

function rStats(){
  let al=0,ok=0,cr=0;
  cars.forEach(c=>Object.values(c.docs).forEach(v=>{const d=dl(v);if(d===null)return;if(d>30)ok++;else if(d<=7){cr++;al++;}else al++;}));
  document.getElementById('s-c').textContent=cars.length;
  document.getElementById('s-a').textContent=al;
  document.getElementById('s-o').textContent=ok;
  document.getElementById('s-r').textContent=cr;
}

function rDC(){
  const el=document.getElementById('d-c');
  if(!cars.length){el.innerHTML=`<div class="empty"><div class="ei">🚗</div><h3>Garajul E Gol</h3><p>Adaugă prima mașină prin numărul de înmatriculare</p><button class="btn btn-primary btn-sm" onclick="openM('add-car')">+ Adaugă</button></div>`;return;}
  el.innerHTML=cars.slice(0,3).map(c=>`<div class="ar" onclick="goTo('garaj')" style="cursor:pointer" onmouseover="this.style.background='rgba(79,125,255,0.07)'" onmouseout="this.style.background=''"><div class="ai2 g">🚗</div><div class="ainf"><div class="at2" style="font-family:'Bebas Neue';letter-spacing:2px;font-size:15px">${c.plate}</div><div class="as2">${c.brand} ${c.model}${c.year?' ('+c.year+')':''}</div></div><div style="color:var(--accent);font-size:12px;font-weight:600">→</div></div>`).join('');
}

function rDA(){
  const el=document.getElementById('d-al');
  const items=[];
  cars.forEach(c=>Object.entries(c.docs).forEach(([k,v])=>{const d=dl(v);if(d!==null&&d<=30)items.push({c,k,d});}));
  items.sort((a,b)=>a.d-b.d);
  if(!items.length){el.innerHTML=`<div class="empty"><div class="ei">✅</div><p style="color:var(--t2)">Toate documentele sunt în regulă!</p></div>`;return;}
  el.innerHTML=items.slice(0,5).map(({c,k,d})=>{const cc=d<=7?'d':'w';return`<div class="ar"><div class="ai2 ${cc}">${d<=7?'🚨':'⚠️'}</div><div class="ainf"><div class="at2">${DN[k]} — ${c.plate}</div><div class="as2">${c.brand} ${c.model}</div></div><div class="db ${cc}">${d<0?'Exp.':d+'z'}</div></div>`;}).join('');
}

function rGaraj(){
  const el=document.getElementById('cars-grid');
  if(!cars.length){el.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="ei">🏠</div><h3>Garajul Tău E Gol</h3><p>Adaugă prima mașină prin numărul de înmatriculare</p><button class="btn btn-primary" onclick="openM('add-car')">+ Adaugă mașină</button></div>`;return;}
  el.innerHTML=cars.map(c=>{
    const pills=Object.entries(c.docs).map(([k,v])=>{const d=dl(v);return`<span class="pill ${cls(d)}"><span class="pd"></span>${DN[k]}: ${dT(d)}</span>`;}).join('');
    const urgent = Object.values(c.docs).some(v=>{const d=dl(v);return d!==null&&d<=30;});
    const foto = c.fotos?.[0];
    return`<div class="cc" onclick="openCar(${c.id})" style="cursor:pointer;transition:transform 0.15s,box-shadow 0.15s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
      ${foto?`<img src="${foto}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:10px">`:''}
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <div class="cp">${c.plate}</div>
          <div class="cm">${c.brand} ${c.model}${c.year?' · '+c.year:''}${c.km?' · '+c.km.toLocaleString()+' km':''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${urgent?'<span style="font-size:18px">⚠️</span>':'<span style="font-size:18px;color:var(--green)">✅</span>'}
          <button onclick="event.stopPropagation();delCar(${c.id})" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:20px;line-height:1" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--t3)'">×</button>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin:10px 0 4px">${pills}</div>
      <div style="font-size:11px;color:var(--t3);margin-top:8px">Apasă pentru detalii complete →</div>
    </div>`;
  }).join('');
}

function openCar(id) {
  const car = cars.find(c=>c.id==id);
  if(!car) return;
  renderCarPage(car);
  goTo('masina');
}

function renderCarPage(car) {
  const body = document.getElementById('masina-page-body');
  if(!body) return;
  const today = new Date();
  const daysUntil = v => v ? Math.ceil((new Date(v)-today)/864e5) : null;
  const statusColor = d => d===null?'var(--t3)':d>30?'var(--green)':d>7?'var(--amber)':'var(--red)';
  const statusLabel = d => d===null?'Necunoscut':d>30?`${d} zile`:d>0?`⚠️ ${d} zile`:'⛔ EXPIRAT';

  const docs = [
    {key:'rca', label:'RCA', icon:'🛡️', val:car.docs?.rca},
    {key:'itp', label:'ITP', icon:'🔬', val:car.docs?.itp},
    {key:'rov', label:'Rovinietă', icon:'🛣️', val:car.docs?.rov},
    {key:'ext', label:'Extinctor', icon:'🧯', val:car.docs?.ext},
    {key:'trz', label:'Trusă Medicală', icon:'🏥', val:car.docs?.trz},
  ];

  const mnt = car.mnt || {};
  const kmRamasi = mnt.oilLast && mnt.oilInt ? (mnt.oilLast + mnt.oilInt - (car.km||0)) : null;
  const oilPct = mnt.oilLast && mnt.oilInt ? Math.min(100, Math.round(((car.km||0)-mnt.oilLast)/mnt.oilInt*100)) : 0;

  body.innerHTML = `
    <!-- Header mașină -->
    <div style="background:linear-gradient(135deg,rgba(200,150,12,0.12),rgba(79,125,255,0.06));border:1px solid rgba(200,150,12,0.2);border-radius:16px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-family:'Bebas Neue';font-size:32px;color:#f0b429;letter-spacing:2px">${car.plate}</div>
          <div style="font-size:18px;font-weight:700;color:var(--text)">${car.brand} ${car.model} ${car.year||''}</div>
          <div style="font-size:13px;color:var(--t2);margin-top:4px">${car.fuel||''} ${car.engine?'· '+car.engine:''} ${car.vin?'· VIN: '+car.vin:''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Bebas Neue';font-size:28px;color:var(--text)">${car.km?car.km.toLocaleString()+' km':'- km'}</div>
          <div style="font-size:11px;color:var(--t3)">Kilometraj</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn-green btn-sm" onclick="goTo('asigurari')">🛡️ Reînnoire RCA</button>
        <button class="btn btn-ghost btn-sm" onclick="goTo('itp')">🔬 Programare ITP</button>
        <button class="btn btn-ghost btn-sm" onclick="goTo('mentenanta')">🔧 Service</button>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openVanz(${car.id})">💰 Vând mașina</button>
        <button class="btn btn-sm" id="raport-btn-${car.id}" onclick="generateCarReport(${car.id})" style="background:rgba(240,180,41,0.15);border:1px solid rgba(240,180,41,0.3);color:#f0b429;font-size:11px">🤖 Raport AI <span style="font-size:8px;background:#f0b429;color:#000;padding:1px 4px;border-radius:4px;font-weight:800">PRO</span></button>
      </div>
    </div>

    <!-- Documente -->
    <div class="card" style="margin-bottom:16px">
      <div class="ch"><span class="ct">📋 Documente</span><button class="btn btn-ghost btn-sm" onclick="goTo('documente')" style="font-size:11px">Toate documentele →</button></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${docs.map(d=>{
          const days = daysUntil(d.val);
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--s2);border-radius:10px;border-left:3px solid ${statusColor(days)}">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${d.icon}</span>
              <div>
                <div style="font-weight:600;font-size:13px">${d.label}</div>
                <div style="font-size:11px;color:var(--t3)">${d.val||'Necompletat'}</div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:700;font-size:13px;color:${statusColor(days)}">${statusLabel(days)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <button class="btn btn-ghost btn-full" style="margin-top:12px;font-size:12px" onclick="openM('add-car')">✏️ Editează documente</button>
    </div>

    <!-- Mentenanță -->
    <div class="card" style="margin-bottom:16px">
      <div class="ch"><span class="ct">🔧 Mentenanță</span></div>
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:13px;color:var(--t2)">Schimb ulei</span>
          <span style="font-size:13px;font-weight:600;color:${kmRamasi!==null?(kmRamasi>2000?'var(--green)':kmRamasi>0?'var(--amber)':'var(--red)'):'var(--t3)'}">${kmRamasi!==null?(kmRamasi>0?kmRamasi.toLocaleString()+' km rămași':'⛔ Depășit cu '+Math.abs(kmRamasi).toLocaleString()+' km'):'Necompletat'}</span>
        </div>
        ${mnt.oilLast&&mnt.oilInt?`<div style="background:var(--s2);border-radius:6px;height:8px;overflow:hidden"><div style="height:100%;width:${oilPct}%;background:${oilPct<70?'var(--green)':oilPct<90?'var(--amber)':'var(--red)'};transition:width 0.5s"></div></div>`:''}
        ${mnt.oilLast?`<div style="font-size:11px;color:var(--t3);margin-top:4px">Schimbat la ${mnt.oilLast.toLocaleString()} km · Interval ${(mnt.oilInt||10000).toLocaleString()} km</div>`:''}
      </div>
      <button class="btn btn-ghost btn-sm" onclick="goTo('mentenanta')" style="font-size:12px">📖 Jurnal complet service →</button>
    </div>

    <!-- Jurnal rapid combustibil -->
    <div class="card" style="margin-bottom:16px">
      <div class="ch"><span class="ct">⛽ Jurnal Combustibil</span><button class="btn btn-ghost btn-sm" onclick="goTo('mentenanta')" style="font-size:11px">Vezi tot →</button></div>
      <div id="car-fuel-mini" style="font-size:13px;color:var(--t3);padding:8px 0">Se încarcă...</div>
    </div>

    <!-- Info vehicul -->
    <div class="card" style="margin-bottom:16px">
      <div class="ch"><span class="ct">ℹ️ Informații vehicul</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[
          ['Nr. înmatriculare', car.plate],
          ['Marcă', car.brand],
          ['Model', car.model],
          ['An fabricație', car.year||'-'],
          ['Combustibil', car.fuel||'-'],
          ['Motor', car.engine||'-'],
          ['Kilometraj', car.km?car.km.toLocaleString()+' km':'-'],
          ['VIN', car.vin||'-'],
          ['Adăugat', car.added||'-'],
        ].map(([l,v])=>`<div style="background:var(--s2);border-radius:8px;padding:10px"><div style="font-size:10px;color:var(--t3);margin-bottom:2px">${l}</div><div style="font-size:13px;font-weight:600;color:var(--text)">${v}</div></div>`).join('')}
      </div>
    </div>

    <!-- Acțiuni periculoase -->
    <div style="margin-top:8px;text-align:center">
      <button onclick="if(confirm('Ești sigur că vrei să ștergi ${car.brand} ${car.model} (${car.plate})?')){delCar(${car.id});goTo('garaj')}" style="background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer;text-decoration:underline">🗑️ Șterge mașina din garaj</button>
    </div>
  `;

  // Încarcă jurnal combustibil mini
  loadFuelMini(car.id);
}

function loadFuelMini(carId) {
  const el = document.getElementById('car-fuel-mini');
  if(!el) return;
  const key = 'fuel_log_' + carId;
  const log = JSON.parse(localStorage.getItem(key)||'[]');
  if(!log.length) { el.textContent = 'Nicio înregistrare. Adaugă din secțiunea Mentenanță.'; return; }
  const last3 = log.slice(-3).reverse();
  el.innerHTML = last3.map(e=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--b1)">
    <span style="color:var(--t2)">${e.date||'-'} · ${e.liters||0}L</span>
    <span style="font-weight:600">${e.total?e.total+' RON':'-'}</span>
  </div>`).join('') + `<div style="font-size:11px;color:var(--t3);margin-top:6px">${log.length} înregistrări totale</div>`;
}


function rDocs(){
  const el=document.getElementById('docs-body');
  if(!cars.length){el.innerHTML=`<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--t3)">Adaugă o mașină pentru a vedea documentele</td></tr>`;return;}
  const cm={ok:'var(--green)',warn:'var(--amber)',danger:'var(--red)'};
  const im={ok:'✅',warn:'⚠️',danger:'🚨'};
  const lm={ok:'Valid',warn:'Atenție',danger:'Critic'};
  const rows=[];
  cars.forEach(c=>Object.entries(c.docs).forEach(([k,v])=>{
    const d=dl(v);const cc=cls(d);
    const actLinks={
      rca:`<button class="btn btn-green btn-sm" onclick="goTo('asigurari')">🛡️ Asigurare RCA</button>`,
      itp:`<button class="btn btn-green btn-sm" onclick="goTo('itp')">🔬 Programează ITP</button>`,
      rov:`<button class="btn btn-green btn-sm" onclick="window.open('https://www.erovinieta.ro','_blank')">🔄 Reînnoiește Rovinietă</button>`,
      ext:`<button class="btn btn-green btn-sm" onclick="window.open('https://www.epiesa.ro/extinctoare-auto','_blank')">🧯 Cumpără Extinctor</button>`,
      trz:`<button class="btn btn-green btn-sm" onclick="window.open('https://www.epiesa.ro/truse-medicale-auto','_blank')">🩺 Cumpără Trusă</button>`
    };
    const act=cc!=='ok'?(actLinks[k]||`<button class="btn btn-green btn-sm" onclick="goTo('asigurari')">🛡️ Acționează</button>`):`<span style="color:var(--t3)">—</span>`;
    rows.push(`<tr><td><strong style="font-family:'Bebas Neue';letter-spacing:2px;font-size:15px">${c.plate}</strong><br><span style="font-size:11px;color:var(--t2)">${c.brand} ${c.model}</span></td><td style="font-weight:600">${DN[k]}</td><td style="font-family:'JetBrains Mono';font-size:12px">${v||'—'}</td><td style="font-family:'JetBrains Mono';font-size:12px">${d!==null?(d<0?`<span style="color:var(--red);font-weight:700">Expirat (${Math.abs(d)}z)</span>`:`${d} zile`):'—'}</td><td><span class="sts" style="background:${cm[cc]}18;color:${cm[cc]}">${im[cc]} ${lm[cc]}</span></td><td>${act}</td></tr>`);
  }));
  el.innerHTML=rows.join('');
}

function rMnt(){
  const el=document.getElementById('mnt-c');
  if(!cars.length){el.innerHTML=`<div class="empty"><div class="ei">🔧</div><h3>Nicio Mașină</h3><p>Adaugă o mașină pentru mentenanță</p><button class="btn btn-primary" onclick="openM('add-car')">+ Adaugă</button></div>`;return;}
  el.innerHTML=`<div class="g3">${cars.map(c=>{
    const next=c.mnt.oilLast+c.mnt.oilInt;const rem=next-c.km;
    const pct=Math.min(100,Math.max(0,((c.km-c.mnt.oilLast)/c.mnt.oilInt)*100));
    const col=rem<=500?'var(--red)':rem<=2000?'var(--amber)':'var(--green)';
    return`<div class="card" style="margin:0"><div class="cp" style="font-size:17px">${c.plate}</div><div class="cm">${c.brand} ${c.model}</div><div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="color:var(--t2);font-weight:600">🛢️ Schimb ulei</span><span style="color:${col};font-weight:800;font-family:'JetBrains Mono'">${rem>0?rem.toLocaleString()+' km':'⚠️ Depășit!'}</span></div><div class="kmb"><div class="kmf" style="width:${pct}%"></div></div><div style="font-size:11px;color:var(--t3);margin-top:3px;font-family:'JetBrains Mono'">Interval: ${c.mnt.oilInt.toLocaleString()} km · Actual: ${c.km.toLocaleString()} km</div></div><div style="display:flex;gap:7px;margin-top:12px"><button class="btn btn-ghost btn-sm" style="flex:1" onclick="comPiese('${c.plate}')">🛒 Piese</button><button class="btn btn-green btn-sm" style="flex:1" onclick="goTo('itp')">🔬 ITP</button></div></div>`;
  }).join('')}</div>`;
}

function rVanzC(){
  const el=document.getElementById('vanz-c');if(!el)return;
  if(!cars.length){el.innerHTML=`<div class="empty"><div class="ei">🚗</div><h3>Nicio Mașină</h3><p>Adaugă o mașină mai întâi</p><button class="btn btn-primary btn-sm" onclick="openM('add-car')">+ Adaugă</button></div>`;return;}
  el.innerHTML=`<div class="g3">${cars.map(c=>`<div class="cc"><div class="cp">${c.plate}</div><div class="cm">${c.brand} ${c.model} ${c.year||''} ${c.km?'· '+c.km.toLocaleString()+' km':''}</div><button class="btn btn-primary btn-full btn-sm" style="margin-top:10px" onclick="openVanz(${c.id})">💰 Publică anunț de vânzare</button></div>`).join('')}</div>`;
}


// ═══ VERIFICARE NUMĂR ÎNMATRICULARE ═══
let _verifData = null;

async function verificaNr() {
  const input = document.getElementById('verif-plate-input');
  if(!input) return;
  const plate = input.value.replace(/\s/g,'').toUpperCase();
  if(plate.length < 4) { 
    input.style.borderColor = 'var(--red)';
    setTimeout(()=>input.style.borderColor='',1500);
    return; 
  }

  // Salvez în istoric recent
  saveVerifRecent(plate);

  document.getElementById('verif-result').style.display = 'none';
  document.getElementById('verif-error').style.display = 'none';
  document.getElementById('verif-loading').style.display = 'block';

  try {
    // Încerc API-ul propriu mai întâi
    let data = null;
    try {
      const r = await fetch(VEHICUL_API + '?nr=' + encodeURIComponent(plate));
      if(r.ok) data = await r.json();
    } catch(e) {}

    // Dacă API-ul propriu nu merge, încerc direct sursele publice prin edge function
    if(!data || data.error) {
      data = await verificaViaSupabase(plate);
    }

    document.getElementById('verif-loading').style.display = 'none';
    if(data) {
      _verifData = {...data, plate};
      renderVerifResult(plate, data);
    } else {
      showVerifError(plate);
    }
  } catch(e) {
    document.getElementById('verif-loading').style.display = 'none';
    showVerifError(plate);
  }
}

async function verificaViaSupabase(plate) {
  try {
    const res = await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/asistent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGNrbmp1cWRqZnh0cXJxaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzI5NDcsImV4cCI6MjA1OTEwODk0N30.5YhiDJmZ4SKSCkm9H4d5FdBWZ0fJuWkSBhCL5bVFYxE'
      },
      body: JSON.stringify({
        messages: [{role:'user', content: `Numărul de înmatriculare este ${plate}. Verifică RCA pe aida.ro și rovinietă pe erovinieta.ro și returnează datele în format JSON: {rca:{valid:bool,expira:'YYYY-MM-DD',asigurator:'',zileRamase:N}, rovinieta:{valid:bool,expira:'YYYY-MM-DD',zileRamase:N}, itp:{valid:bool,expira:'YYYY-MM-DD'}, judet:''}. Răspunde DOAR cu JSON-ul, nimic altceva.`}],
        system: 'Ești un API de verificare vehicule. Returnezi DOAR JSON valid, fără explicații.',
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        searchQuery: `RCA rovinietă ${plate} verificare`
      })
    });
    const d = await res.json();
    const reply = d.reply || '';
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if(jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch(e) {}
  return null;
}

function renderVerifResult(plate, data) {
  document.getElementById('verif-result').style.display = 'block';

  // Header
  const header = document.getElementById('verif-header');
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px">
      <div style="font-family:'Bebas Neue';font-size:28px;color:#f0b429;letter-spacing:2px">${plate}</div>
      ${data.judet?`<div style="background:var(--s2);padding:4px 12px;border-radius:20px;font-size:13px;color:var(--t2)">📍 ${data.judet}</div>`:''}
      ${data.brand?`<div style="font-size:14px;font-weight:600;color:var(--text)">${data.brand} ${data.model||''} ${data.year||''}</div>`:''}
    </div>`;

  // Docs overview
  const docs = document.getElementById('verif-docs');
  const items = [
    {icon:'🛡️', label:'RCA', d:data.rca},
    {icon:'🛣️', label:'Rovinietă', d:data.rovinieta},
    {icon:'🔬', label:'ITP', d:data.itp},
  ];
  docs.innerHTML = items.map(i=>{
    const valid = i.d?.valid;
    const days = i.d?.zileRamase;
    const color = valid===true?(days<=30?'var(--amber)':'var(--green)'):valid===false?'var(--red)':'var(--t3)';
    const icon2 = valid===true?(days<=30?'⚠️':'✅'):valid===false?'⛔':'❓';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--s2);border-radius:10px;border-left:3px solid ${color}">
      <span style="font-weight:600">${i.icon} ${i.label}</span>
      <span style="color:${color};font-weight:700">${icon2} ${valid===true?(i.d.expira||'Valid'):valid===false?'Expirat':'Necunoscut'}</span>
    </div>`;
  }).join('');

  // RCA detalii
  renderVerifCard('rca', data.rca, {
    actions: `<button class="btn btn-green btn-sm" onclick="goTo('asigurari')">🛡️ Reînnoire RCA</button>`
  });

  // Rovinieta detalii
  renderVerifCard('rov', data.rovinieta, {
    actions: `<button class="btn btn-ghost btn-sm" onclick="window.open('https://www.erovinieta.ro','_blank')">🔄 Reînnoire Rovinietă</button>`
  });

  // ITP detalii
  renderVerifCard('itp', data.itp, {});

  // Buton adaugă în garaj
  const addBtn = document.getElementById('verif-add-btn');
  if(addBtn) addBtn.style.display = 'flex';
}

function renderVerifCard(type, d, opts) {
  const badge = document.getElementById('verif-'+type+'-badge');
  const body = document.getElementById('verif-'+type+'-body');
  const actions = document.getElementById('verif-'+type+'-actions');
  if(!body) return;

  if(!d) {
    if(badge) badge.innerHTML = '<span style="font-size:11px;color:var(--t3)">Nedisponibil</span>';
    body.innerHTML = '<p style="font-size:13px;color:var(--t3)">Verificarea automată nu a returnat date pentru acest număr.</p>';
    return;
  }

  const color = d.valid===true?(d.zileRamase<=30?'var(--amber)':'var(--green)'):d.valid===false?'var(--red)':'var(--t3)';
  if(badge) badge.innerHTML = `<span style="font-size:12px;font-weight:700;color:${color}">${d.valid===true?'✅ Valid':d.valid===false?'⛔ Expirat':'❓'}</span>`;

  let html = '';
  if(d.expira) html += `<div style="margin-bottom:8px"><span style="font-size:12px;color:var(--t3)">Expiră:</span> <strong>${d.expira}</strong></div>`;
  if(d.zileRamase !== undefined) html += `<div style="margin-bottom:8px"><span style="font-size:12px;color:var(--t3)">Zile rămase:</span> <strong style="color:${color}">${d.zileRamase} zile</strong></div>`;
  if(d.asigurator) html += `<div style="margin-bottom:8px"><span style="font-size:12px;color:var(--t3)">Asigurator:</span> <strong>${d.asigurator}</strong></div>`;
  if(!html) html = '<p style="font-size:13px;color:var(--t3)">Date limitate disponibile.</p>';
  
  body.innerHTML = html;
  if(actions && opts.actions) actions.innerHTML = opts.actions;
}

function showVerifError(plate) {
  const el = document.getElementById('verif-error');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="card" style="text-align:center;padding:24px">
      <div style="font-size:40px;margin-bottom:12px">⚠️</div>
      <div style="font-weight:700;margin-bottom:8px">Verificarea automată indisponibilă momentan</div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:16px">Serverul de verificare este temporar indisponibil. Poți verifica manual:</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <a href="https://www.aida.info.ro/verificare-rca" target="_blank" class="btn btn-ghost btn-sm">🛡️ Verifică RCA pe AIDA</a>
        <a href="https://www.erovinieta.ro" target="_blank" class="btn btn-ghost btn-sm">🛣️ Verifică Rovinietă</a>
        <a href="https://www.drpciv.ro" target="_blank" class="btn btn-ghost btn-sm">🔬 Verifică ITP pe DRPCIV</a>
      </div>
    </div>`;
}

function addCarFromVerif() {
  if(!_verifData) return;
  const d = _verifData;
  // Pre-completez câmpurile din modal add-car
  openM('add-car');
  setTimeout(()=>{
    const pl = document.getElementById('m-pl');
    if(pl) { pl.value = d.plate; pl.dispatchEvent(new Event('input')); }
    if(d.rca?.expira) { const e=document.getElementById('m-rc'); if(e) e.value=d.rca.expira; }
    if(d.rovinieta?.expira) { const e=document.getElementById('m-rv'); if(e) e.value=d.rovinieta.expira; }
    if(d.itp?.expira) { const e=document.getElementById('m-it'); if(e) e.value=d.itp.expira; }
  }, 300);
}

function saveVerifRecent(plate) {
  const key = 'aa_verif_recent';
  let list = JSON.parse(localStorage.getItem(key)||'[]');
  list = [plate, ...list.filter(p=>p!==plate)].slice(0,5);
  localStorage.setItem(key, JSON.stringify(list));
  renderVerifRecent();
}

function renderVerifRecent() {
  const el = document.getElementById('verif-recent');
  if(!el) return;
  const list = JSON.parse(localStorage.getItem('aa_verif_recent')||'[]');
  if(!list.length) return;
  el.innerHTML = `<div style="font-size:11px;color:var(--t3);margin-bottom:6px">Recente:</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${list.map(p=>`<button class="btn btn-ghost btn-sm" onclick="document.getElementById('verif-plate-input').value='${p}';verificaNr()" style="font-size:12px;letter-spacing:1px;font-weight:700">${p}</button>`).join('')}
    </div>`;
}
