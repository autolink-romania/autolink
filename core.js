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

const AGENT_PROMPTS={
  manager:`Ești Agentul Manager al platformei AutoAssist. Coordonezi echipa de agenți (Auto, Documente, Juridic, Vânzare, ITP). Răspunzi la orice întrebare despre AutoAssist. Ești prietenos, profesionist și concis. Răspunzi în română.`,
  auto:`Ești Agentul Auto și Service — mecanic virtual expert. Ajuți cu defecțiuni, reparații, piese, întreținere, intervale service, costuri orientative pentru șoferii români. Răspunzi în română cu sfaturi clare.`,
  documente:`Ești Agentul Documente — specialist în RCA, ITP, rovinietă, extinctor, trusă, talon, permis, buletin. Ajuți utilizatorul să înțeleagă termenele, amenzile și procedurile. Răspunzi în română.`,
  juridic:`Ești Agentul Juridic — expert în legislație auto română 2026, contracte vânzare auto, drepturi consumatori, amenzi, contestații. Nu înlocuiești un avocat pentru cazuri complexe. Răspunzi în română.`,
  vanzare:`Ești Agentul Vânzare — expert în vânzarea mașinilor SH în România. Ajuți cu prețuri corecte, descrieri, platforme (OLX, Autovit), acte necesare, negociere, evitarea escrocheriilor. Răspunzi în română.`,
  itp:`Ești Agentul ITP și Service — expert în ITP, programări, pregătirea mașinii, stații RAR autorizate, revisii periodice. Ajuți utilizatorul să nu pice ITP-ul. Răspunzi în română.`
};

const AGENT_NAMES={manager:'Agent Manager',auto:'Agent Auto & Service',documente:'Agent Documente',juridic:'Agent Juridic',vanzare:'Agent Vânzare',itp:'Agent ITP & Service'};
const AGENT_ICONS={manager:'🧠',auto:'🔧',documente:'📄',juridic:'⚖️',vanzare:'💰',itp:'🔬'};

// ═══ NAV ═══
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
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  document.getElementById('sec-'+sec).classList.add('active');

  // Ascunde sidebar și header pe landing page
  const sidebar = document.querySelector('.sidebar');
  const mainEl = document.querySelector('.main');
  const overlay = document.getElementById('app-init-overlay');
  if(sec === 'landing') {
    if(sidebar) sidebar.style.display = 'none';
    if(mainEl) { mainEl.style.marginLeft = '0'; mainEl.style.paddingTop = '0'; mainEl.style.display = ''; }
    if(overlay) overlay.style.display = 'flex';
  } else if(sec === 'servicii-stat') {
    if(sidebar) sidebar.style.display = '';
    if(mainEl) mainEl.style.display = 'none';
    if(overlay) overlay.style.display = 'none';
  } else {
    if(sidebar) sidebar.style.display = '';
    if(mainEl) { mainEl.style.marginLeft = ''; mainEl.style.paddingTop = ''; mainEl.style.display = ''; }
    if(overlay) overlay.style.display = 'none';
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
  if(sec==='asigurari') setTimeout(resetRcaModal, 50);
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
    ['m-pl','m-br','m-mo','m-yr','m-km','m-rc','m-it','m-rv','m-ex','m-tr','m-oi','m-ol'].forEach(i=>{let e=document.getElementById(i);if(e)e.value='';});
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
function addCar(){
  const plate=document.getElementById('m-pl').value.trim().toUpperCase();
  if(!plate){alert('Introdu numărul de înmatriculare!');return;}
  cars.push({
    id:Date.now(),plate,
    brand:document.getElementById('m-br').value||'Necunoscut',
    model:document.getElementById('m-mo').value||'',
    year:document.getElementById('m-yr').value||'',
    km:parseInt(document.getElementById('m-km').value)||0,
    docs:{rca:document.getElementById('m-rc').value,itp:document.getElementById('m-it').value,rov:document.getElementById('m-rv').value,ext:document.getElementById('m-ex').value,trz:document.getElementById('m-tr').value},
    mnt:{oilInt:parseInt(document.getElementById('m-oi').value)||10000,oilLast:parseInt(document.getElementById('m-ol').value)||0},
    added:new Date().toISOString().split('T')[0]
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
    return`<div class="cc"><div style="display:flex;justify-content:space-between;align-items:start"><div><div class="cp">${c.plate}</div><div class="cm">${c.brand} ${c.model}${c.year?' · '+c.year:''}${c.km?' · '+c.km.toLocaleString()+' km':''}</div></div><button onclick="delCar(${c.id})" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:20px;line-height:1;transition:color 0.15s" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--t3)'">×</button></div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">${pills}</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-green btn-sm" onclick="goTo('asigurari')">🛡️ Asigurare RCA</button><button class="btn btn-ghost btn-sm" onclick="goTo('itp')">🔬 ITP</button><button class="btn btn-ghost btn-sm" onclick="openVanz(${c.id})">💰 Vând</button><button class="btn btn-ghost btn-sm" onclick="goTo('mentenanta')">🔧 Service</button></div></div>`;
  }).join('');
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



function statDeschide(url) {
  window.open(url, '_blank', 'noopener');
}
