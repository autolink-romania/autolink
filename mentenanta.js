// ═══ MENTENANȚĂ ═══
const CHECKLIST_ITEMS = [
  { id: 'cl1', text: 'Presiune anvelope verificată', icon: '🔵' },
  { id: 'cl2', text: 'Ulei motor — nivel OK', icon: '🟡' },
  { id: 'cl3', text: 'Lichid răcire — nivel OK', icon: '🔵' },
  { id: 'cl4', text: 'Lichid frâne — nivel OK', icon: '🔴' },
  { id: 'cl5', text: 'Lichid parbriz — plin', icon: '🔵' },
  { id: 'cl6', text: 'Lumini față/spate — funcționale', icon: '💡' },
  { id: 'cl7', text: 'Documente auto — la bord (RCA, ITP)', icon: '📋' },
  { id: 'cl8', text: 'Extinctor — prezent și valabil', icon: '🔥' },
  { id: 'cl9', text: 'Trusă medicală — prezentă și valabilă', icon: '🏥' },
  { id: 'cl10', text: 'Telefon încărcat / încărcător la bord', icon: '📱' },
  { id: 'cl11', text: 'GPS / rută planificată', icon: '🗺️' },
  { id: 'cl12', text: 'Bagaje asigurate corect', icon: '🧳' },
];

// Intervale standard mentenanță (km)
const MNT_INTERVALE = [
  { id: 'ulei', label: 'Schimb ulei + filtru', icon: '🛢️', interval: 10000, color: '#f0b429' },
  { id: 'filtru_aer', label: 'Filtru aer', icon: '💨', interval: 20000, color: '#4f7dff' },
  { id: 'filtru_combustibil', label: 'Filtru combustibil', icon: '⛽', interval: 30000, color: '#7c5cfc' },
  { id: 'filtru_habitaclu', label: 'Filtru habitaclu', icon: '🌬️', interval: 15000, color: '#00c864' },
  { id: 'distributie', label: 'Distribuție / Curea', icon: '⚙️', interval: 60000, color: '#ff4757' },
  { id: 'frane', label: 'Verificare frâne', icon: '🔴', interval: 30000, color: '#ff6b35' },
  { id: 'lichid_frane', label: 'Lichid frâne', icon: '🔵', interval: 40000, color: '#0288d1' },
  { id: 'bujii', label: 'Bujii', icon: '⚡', interval: 40000, color: '#ffb300' },
  { id: 'amortizoare', label: 'Verificare amortizoare', icon: '🔩', interval: 80000, color: '#9e9e9e' },
];

function mntTab(tab) {
  ['istoric','reminder','combustibil','checklist','anvelope2'].forEach(t => {
    const panel = document.getElementById('mnt-panel-'+t);
    const btn = document.getElementById('mnt-tab-'+t);
    if(panel) panel.style.display = t === tab ? 'block' : 'none';
    if(btn) {
      btn.style.background = t === tab ? 'var(--accent)' : 'var(--s2)';
      btn.style.color = t === tab ? '#fff' : 'var(--t1)';
    }
  });
  if(tab === 'checklist') renderChecklist();
  if(tab === 'istoric') { renderMntList(); renderReminderAuto(); }
  if(tab === 'combustibil') renderFuelList();
  if(tab === 'reminder') renderReminderList();
  if(tab === 'anvelope2') renderAnvelope2();
  populateMntSelects();
}

function populateMntSelects() {
  ['mnt-car-sel','rem-car-sel','fuel-car-sel','anv-car','anv2-car'].forEach(id => {
    const sel = document.getElementById(id);
    if(!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">-- Selectează --</option>';
    cars.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.plate} — ${c.brand} ${c.model}</option>`);
    if(cur) sel.value = cur;
  });
}

// ═══ JURNAL SERVICE ═══
function addMnt() {
  const car = document.getElementById('mnt-car-sel').value;
  const tip = document.getElementById('mnt-tip').value;
  const data = document.getElementById('mnt-data').value;
  const km = document.getElementById('mnt-km').value;
  const cost = document.getElementById('mnt-cost').value;
  const obs = document.getElementById('mnt-obs').value;
  const furnizor = document.getElementById('mnt-furnizor')?.value || '';
  if(!car || !tip || !data) { showNotification('Completează','Selectează mașina, tipul și data.'); return; }

  // Dacă e schimb ulei, actualizez oilLast pe mașină
  if((tip.toLowerCase().includes('ulei')) && km) {
    const carObj = cars.find(c=>c.id==car);
    if(carObj) {
      if(!carObj.mnt) carObj.mnt = {};
      carObj.mnt.oilLast = parseInt(km);
      save();
    }
  }

  const mntList = JSON.parse(localStorage.getItem('mnt_'+car)||'[]');
  mntList.unshift({ id: Date.now(), tip, data, km: km||null, cost: cost||null, obs: obs||'', furnizor });
  localStorage.setItem('mnt_'+car, JSON.stringify(mntList));
  ['mnt-data','mnt-km','mnt-cost','mnt-obs','mnt-furnizor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderMntList();
  showNotification('✅ Salvat!', tip + ' înregistrat cu succes.');
}

function renderMntList() {
  const sel = document.getElementById('mnt-car-sel');
  const carId = sel?.value;
  const el = document.getElementById('mnt-list');
  if(!el) return;
  if(!carId) { el.innerHTML = '<div class="empty"><div class="ei">🔧</div><p>Selectează o mașină pentru a vedea istoricul.</p></div>'; return; }
  const list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  if(!list.length) { el.innerHTML = '<div class="empty"><div class="ei">🔧</div><p>Nicio intervenție înregistrată încă.</p></div>'; renderReminderAuto(); return; }

  // Grafic costuri
  const withCost = list.filter(m=>m.cost&&parseFloat(m.cost)>0);
  let totalCost = withCost.reduce((s,m)=>s+parseFloat(m.cost),0);
  let graficHtml = '';
  if(withCost.length >= 2) {
    const maxC = Math.max(...withCost.map(m=>parseFloat(m.cost)));
    graficHtml = `<div style="margin-bottom:16px;padding:14px;background:var(--s2);border-radius:12px">
      <div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:10px">📊 COSTURI SERVICE</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:60px">
        ${[...withCost].reverse().slice(-8).map(m=>{
          const pct = maxC>0?parseFloat(m.cost)/maxC*100:0;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px" title="${m.tip}: ${m.cost} RON">
            <div style="width:100%;background:linear-gradient(to top,var(--accent),var(--accent2));border-radius:4px 4px 0 0;height:${pct}%;min-height:4px"></div>
            <div style="font-size:9px;color:var(--t3);white-space:nowrap;overflow:hidden;max-width:40px">${m.data?.slice(5)||''}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="text-align:center;margin-top:8px">
        <span style="font-weight:800;color:var(--gold)">${totalCost.toLocaleString()} RON</span>
        <span style="font-size:11px;color:var(--t3)"> total cheltuieli service</span>
      </div>
    </div>`;
  }

  el.innerHTML = graficHtml + list.map(m => `
    <div style="background:var(--s2);border-radius:12px;padding:14px;margin-bottom:8px;border-left:3px solid var(--accent)">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px">🔧 ${m.tip}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px">
            📅 ${m.data}${m.km?' · 📍 '+Number(m.km).toLocaleString()+' km':''}${m.furnizor?' · 🏪 '+m.furnizor:''}
          </div>
          ${m.obs?`<div style="font-size:11px;color:var(--t3);margin-top:4px;padding:6px;background:rgba(255,255,255,0.03);border-radius:6px">${m.obs}</div>`:''}
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:12px">
          ${m.cost?`<div style="font-weight:800;color:var(--amber);font-size:15px">${Number(m.cost).toLocaleString()} RON</div>`:''}
          <button onclick="delMnt('${carId}',${m.id})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px;margin-top:4px">🗑</button>
        </div>
      </div>
    </div>`).join('');

  renderReminderAuto();
}

// ═══ REMINDERE AUTOMATE DIN KM ═══
function renderReminderAuto() {
  const sel = document.getElementById('mnt-car-sel');
  const carId = sel?.value;
  const el = document.getElementById('mnt-reminder-auto');
  if(!el || !carId) return;
  const car = cars.find(c=>c.id==carId);
  if(!car || !car.km) { el.innerHTML = ''; return; }
  const mntList = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  const remSave = JSON.parse(localStorage.getItem('rem_auto_'+carId)||'{}');

  const items = MNT_INTERVALE.map(int => {
    const lastEntry = mntList.find(m=>m.tip&&m.tip.toLowerCase().includes(int.label.toLowerCase().split(' ')[0]));
    const lastKm = lastEntry ? parseInt(lastEntry.km||0) : (int.id==='ulei'&&car.mnt?.oilLast ? car.mnt.oilLast : 0);
    const nextKm = lastKm + (remSave[int.id]?.interval || int.interval);
    const ramasi = nextKm - car.km;
    const pct = Math.min(100, Math.max(0, (car.km - lastKm) / (remSave[int.id]?.interval || int.interval) * 100));
    const col = ramasi <= 0 ? 'var(--red)' : ramasi <= 2000 ? 'var(--amber)' : 'var(--green)';
    return { ...int, lastKm, nextKm, ramasi, pct, col };
  });

  el.innerHTML = `<div style="margin-top:16px;padding:14px;background:var(--s2);border-radius:12px">
    <div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:12px">🔔 REMINDER-URI AUTOMATE — ${car.plate} · ${car.km?.toLocaleString()} km</div>
    ${items.map(it=>`
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600">${it.icon} ${it.label}</span>
          <span style="font-size:12px;font-weight:700;color:${it.col}">${it.ramasi<=0?'⛔ Depășit cu '+Math.abs(it.ramasi).toLocaleString()+' km':it.ramasi.toLocaleString()+' km rămași'}</span>
        </div>
        <div style="background:var(--s3);border-radius:4px;height:5px;overflow:hidden">
          <div style="width:${it.pct}%;height:100%;background:${it.col};border-radius:4px;transition:width 0.5s"></div>
        </div>
        <div style="font-size:10px;color:var(--t3);margin-top:2px">Ultimul: ${it.lastKm?it.lastKm.toLocaleString()+' km':'necunoscut'} · Următor: ${it.nextKm.toLocaleString()} km · Interval: ${(it.interval/1000).toFixed(0)}k km</div>
      </div>`).join('')}
  </div>`;
}

function delMnt(carId, id) {
  let list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  list = list.filter(m => m.id !== id);
  localStorage.setItem('mnt_'+carId, JSON.stringify(list));
  renderMntList();
}

// ═══ REMINDERE MANUALE ═══
function addReminder() {
  const car = document.getElementById('rem-car-sel').value;
  const tip = document.getElementById('rem-tip').value;
  const km = document.getElementById('rem-km').value;
  const data = document.getElementById('rem-data').value;
  if(!car || !tip || (!km && !data)) { showNotification('Completează','Selectează mașina, tipul și km sau data.'); return; }
  const list = JSON.parse(localStorage.getItem('reminders_'+car)||'[]');
  list.push({ id: Date.now(), tip, km: km||null, data: data||null, activ: true });
  localStorage.setItem('reminders_'+car, JSON.stringify(list));
  document.getElementById('rem-km').value = '';
  document.getElementById('rem-data').value = '';
  renderReminderList();
  showNotification('🔔 Reminder setat!', tip);
}

function renderReminderList() {
  const sel = document.getElementById('rem-car-sel');
  const carId = sel?.value;
  const el = document.getElementById('rem-list');
  if(!el) return;
  if(!carId) { el.innerHTML = '<div class="empty"><div class="ei">⏰</div><p>Selectează o mașină.</p></div>'; return; }
  const list = JSON.parse(localStorage.getItem('reminders_'+carId)||'[]');
  const car = cars.find(c=>c.id==carId);
  if(!list.length) { el.innerHTML = '<div class="empty"><div class="ei">⏰</div><p>Niciun reminder activ.</p></div>'; return; }
  el.innerHTML = list.map(r => {
    const kmRamasi = r.km && car?.km ? parseInt(r.km) - car.km : null;
    const col = kmRamasi !== null ? (kmRamasi <= 0 ? 'var(--red)' : kmRamasi <= 2000 ? 'var(--amber)' : 'var(--green)') : 'var(--t2)';
    return `<div style="padding:14px;background:var(--s2);border-radius:12px;margin-bottom:8px;border-left:3px solid ${col}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:13px">🔔 ${r.tip}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px">
            ${r.km?`📍 La ${Number(r.km).toLocaleString()} km`:''}${r.data?' · 📅 '+r.data:''}
            ${kmRamasi!==null?`<span style="color:${col};font-weight:700;margin-left:8px">${kmRamasi<=0?'⛔ Depășit!':kmRamasi.toLocaleString()+' km rămași'}</span>`:''}
          </div>
        </div>
        <button onclick="delReminder('${carId}',${r.id})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:18px">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function delReminder(carId, id) {
  let list = JSON.parse(localStorage.getItem('reminders_'+carId)||'[]');
  list = list.filter(r => r.id !== id);
  localStorage.setItem('reminders_'+carId, JSON.stringify(list));
  renderReminderList();
}

// ═══ JURNAL COMBUSTIBIL ═══
function addFuel() {
  const car = document.getElementById('fuel-car-sel').value;
  const data = document.getElementById('fuel-data').value;
  const km = document.getElementById('fuel-km').value;
  const litri = document.getElementById('fuel-litri').value;
  const pret = document.getElementById('fuel-pret').value;
  const statie = document.getElementById('fuel-statie').value;
  const plin = document.getElementById('fuel-plin')?.checked !== false;
  if(!car || !data || !km || !litri) { showNotification('Completează','Selectează mașina, data, km și litri.'); return; }
  const list = JSON.parse(localStorage.getItem('fuel_'+car)||'[]');
  list.unshift({ id: Date.now(), data, km: parseFloat(km), litri: parseFloat(litri), pret: parseFloat(pret||0), statie: statie||'', total: parseFloat(litri)*parseFloat(pret||0), plin });
  localStorage.setItem('fuel_'+car, JSON.stringify(list));
  // Actualizez km pe mașină
  const carObj = cars.find(c=>c.id==car);
  if(carObj && parseFloat(km) > (carObj.km||0)) { carObj.km = parseFloat(km); save(); }
  ['fuel-data','fuel-km','fuel-litri','fuel-pret','fuel-statie'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderFuelList();
  showNotification('⛽ Alimentare salvată!', litri + 'L la ' + pret + ' RON/L');
}

function renderFuelList() {
  const sel = document.getElementById('fuel-car-sel');
  const carId = sel?.value;
  const statsEl = document.getElementById('fuel-stats');
  const listEl = document.getElementById('fuel-list');
  if(!listEl) return;
  if(!carId) { listEl.innerHTML = '<div class="empty"><div class="ei">⛽</div><p>Selectează o mașină.</p></div>'; return; }
  const list = JSON.parse(localStorage.getItem('fuel_'+carId)||'[]');
  if(!list.length) { listEl.innerHTML = '<div class="empty"><div class="ei">⛽</div><p>Nicio alimentare înregistrată.</p></div>'; if(statsEl) statsEl.innerHTML = ''; return; }

  const sorted = [...list].sort((a,b) => a.km - b.km);

  // Calcul consum per 100km între plinuri consecutive
  const consumuri = [];
  for(let i=1;i<sorted.length;i++){
    const prev=sorted[i-1], cur=sorted[i];
    if(cur.plin && prev.km && cur.km > prev.km) {
      const kmIntre = cur.km - prev.km;
      const consum = (cur.litri / kmIntre * 100).toFixed(1);
      consumuri.push({ data: cur.data, km: cur.km, consum: parseFloat(consum), kmIntre });
    }
  }
  const consumMediu = consumuri.length ? (consumuri.reduce((s,c)=>s+c.consum,0)/consumuri.length).toFixed(1) : null;
  const litriTotal = list.reduce((s,f)=>s+f.litri,0);
  const costTotal = list.reduce((s,f)=>s+f.total,0);
  const kmTotal = sorted.length>=2 ? sorted[sorted.length-1].km - sorted[0].km : 0;

  if(statsEl) {
    statsEl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        <div style="padding:12px;background:var(--s2);border-radius:10px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--accent)">${consumMediu||'—'}L</div>
          <div style="font-size:11px;color:var(--t3)">Consum/100km</div>
        </div>
        <div style="padding:12px;background:var(--s2);border-radius:10px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--green)">${litriTotal.toFixed(0)}L</div>
          <div style="font-size:11px;color:var(--t3)">Total alimentat</div>
        </div>
        <div style="padding:12px;background:var(--s2);border-radius:10px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--amber)">${costTotal.toFixed(0)} RON</div>
          <div style="font-size:11px;color:var(--t3)">Total cheltuit</div>
        </div>
      </div>
      ${consumuri.length>=2?`
      <div style="padding:14px;background:var(--s2);border-radius:10px;margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:1px;margin-bottom:10px">📈 CONSUM PER PLIN (L/100km)</div>
        <div style="display:flex;align-items:flex-end;gap:4px;height:50px">
          ${consumuri.slice(-8).map(c=>{
            const maxC=Math.max(...consumuri.map(x=>x.consum));
            const pct=maxC>0?c.consum/maxC*100:50;
            const col=c.consum<7?'var(--green)':c.consum<9?'var(--amber)':'var(--red)';
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px" title="${c.data}: ${c.consum}L/100km">
              <div style="font-size:8px;color:var(--t3)">${c.consum}</div>
              <div style="width:100%;background:${col};border-radius:3px 3px 0 0;height:${pct}%;min-height:4px"></div>
            </div>`;
          }).join('')}
        </div>
      </div>`:''}`;
  }

  listEl.innerHTML = list.map(f => `
    <div style="padding:12px;background:var(--s2);border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between">
      <div>
        <div style="font-weight:700;font-size:13px">⛽ ${f.litri}L${f.statie?' — '+f.statie:''}${f.plin?'<span style="font-size:10px;background:rgba(0,200,100,0.15);color:var(--green);padding:1px 6px;border-radius:6px;margin-left:6px">Plin</span>':''}</div>
        <div style="font-size:12px;color:var(--t2)">📅 ${f.data} · 📍 ${Number(f.km).toLocaleString()} km${f.pret?' · '+f.pret+' RON/L':''}</div>
      </div>
      <div style="text-align:right">
        ${f.total?`<div style="font-weight:700;color:var(--amber)">${f.total.toFixed(2)} RON</div>`:''}
        <button onclick="delFuel('${carId}',${f.id})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px">🗑</button>
      </div>
    </div>`).join('');
}

function delFuel(carId, id) {
  let list = JSON.parse(localStorage.getItem('fuel_'+carId)||'[]');
  list = list.filter(f => f.id !== id);
  localStorage.setItem('fuel_'+carId, JSON.stringify(list));
  renderFuelList();
}

// ═══ ANVELOPE 2.0 ═══
function renderAnvelope2() {
  const el = document.getElementById('mnt-panel-anvelope2');
  if(!el) return;
  populateMntSelects();
}

function saveAnvelope2() {
  const carId = document.getElementById('anv2-car')?.value;
  if(!carId) { showNotification('⚠️','Selectează mașina.'); return; }
  const car = cars.find(c=>c.id==carId);
  if(!car) return;
  const data = {
    sezon: document.getElementById('anv2-sezon')?.value,
    lat: document.getElementById('anv2-lat')?.value,
    prof: document.getElementById('anv2-prof')?.value,
    diam: document.getElementById('anv2-diam')?.value,
    dataMontare: document.getElementById('anv2-data-montare')?.value,
    uzura: document.getElementById('anv2-uzura')?.value,
    marca: document.getElementById('anv2-marca')?.value,
  };
  if(!car.anvelope) car.anvelope = {};
  car.anvelope[data.sezon] = data;
  // Marchez că a schimbat anvelopele - calculez când să alerteze din nou
  const luna = new Date().getMonth(); // 0-11
  const esteIarna = data.sezon === 'iarna';
  const dataUrmAvertizare = esteIarna
    ? new Date(new Date().getFullYear()+1, 2, 1).toISOString() // 1 martie an viitor
    : new Date(new Date().getFullYear(), 9, 1).toISOString(); // 1 octombrie an curent/viitor
  car.anvelope[data.sezon].urmatoareaAlerta = dataUrmAvertizare;
  save();
  showNotification('✅ Salvat!', `Anvelope ${data.sezon} înregistrate. Vei fi alertat la schimbul următor.`);
  renderAnvelope2();
}

// ═══ ALERTĂ SEZONIERĂ ANVELOPE ═══
function showSeasonalAlert() {
  const el = document.getElementById('seasonal-alert');
  if(!el) return;
  const luna = new Date().getMonth(); // 0=ian, 11=dec
  const anCurent = new Date().getFullYear();

  // Iarnă: oct(9) - mar(2), Vară: apr(3) - sep(8)
  const trebuieIarna = luna >= 9 || luna <= 2;
  const sezonNecesar = trebuieIarna ? 'iarna' : 'vara';
  const sezonLabel = trebuieIarna ? '❄️ Iarnă' : '☀️ Vară';

  // Verific dacă vreuna din mașini trebuie alertă
  const masiniDeSchimbat = cars.filter(car => {
    if(!car.anvelope) return true;
    const anv = car.anvelope[sezonNecesar];
    if(!anv) return true;
    // Verifică dacă alerta a fost amânată
    if(anv.urmatoareaAlerta && new Date(anv.urmatoareaAlerta) > new Date()) return false;
    return true;
  });

  if(!masiniDeSchimbat.length) { el.style.display='none'; return; }

  el.style.display = 'block';
  el.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(${trebuieIarna?'79,125,255':'240,180,41'},0.15),rgba(${trebuieIarna?'124,92,252':'255,140,0'},0.08));border:1px solid rgba(${trebuieIarna?'79,125,255':'240,180,41'},0.3);border-radius:14px;padding:16px;margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:32px">${trebuieIarna?'❄️':'☀️'}</span>
          <div>
            <div style="font-weight:800;font-size:15px">Schimbă anvelopele de ${sezonLabel}!</div>
            <div style="font-size:12px;color:var(--t2);margin-top:2px">${masiniDeSchimbat.map(c=>c.plate).join(', ')} — sezon ${sezonLabel.toLowerCase()} a început</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="marcheazaSchimbatAnvelope('${sezonNecesar}')" class="btn btn-primary btn-sm">✅ Am schimbat anvelopele</button>
          <button onclick="document.getElementById('seasonal-alert').style.display='none'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:20px;padding:0 4px">×</button>
        </div>
      </div>
    </div>`;
}

function marcheazaSchimbatAnvelope(sezon) {
  const trebuieIarna = sezon === 'iarna';
  // Calculez data următoarei alerte (sezonul opus)
  const urmatoareaAlerta = trebuieIarna
    ? new Date(new Date().getFullYear()+1, 9, 1).toISOString() // oct an viitor
    : new Date(new Date().getFullYear()+1, 2, 1).toISOString(); // mar an viitor

  cars.forEach(car => {
    if(!car.anvelope) car.anvelope = {};
    if(!car.anvelope[sezon]) car.anvelope[sezon] = {};
    car.anvelope[sezon].schimbatLa = new Date().toISOString().split('T')[0];
    car.anvelope[sezon].urmatoareaAlerta = urmatoareaAlerta;
  });
  save();
  const el = document.getElementById('seasonal-alert');
  if(el) {
    el.innerHTML = `<div style="background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);border-radius:14px;padding:14px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
      <span style="font-size:24px">✅</span>
      <div>
        <div style="font-weight:700;color:var(--green)">Anvelope ${sezon === 'iarna'?'de iarnă':'de vară'} marcate ca schimbate!</div>
        <div style="font-size:12px;color:var(--t3)">Nu vei mai primi această alertă până la ${sezon==='iarna'?'octombrie an viitor':'martie an viitor'}.</div>
      </div>
    </div>`;
    setTimeout(()=>{ if(el) el.style.display='none'; }, 5000);
  }
  showNotification('✅ Gata!', `Vei fi alertat la ${sezon==='iarna'?'octombrie':'martie'} anul viitor.`);
}

// ═══ CHECKLIST ═══
function renderChecklist() {
  const el = document.getElementById('checklist-items');
  const saved = JSON.parse(localStorage.getItem('checklist')||'{}');
  if(!el) return;
  el.innerHTML = CHECKLIST_ITEMS.map(item => `
    <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--s2);border-radius:var(--rs);cursor:pointer;margin-bottom:6px;${saved[item.id]?'opacity:0.6;':''}">
      <input type="checkbox" ${saved[item.id]?'checked':''} onchange="toggleChecklist('${item.id}',this.checked)" style="width:20px;height:20px;accent-color:var(--green);flex-shrink:0">
      <span style="font-size:18px">${item.icon}</span>
      <span style="font-size:14px;${saved[item.id]?'text-decoration:line-through;color:var(--t3)':''}">${item.text}</span>
    </label>`).join('');
  updateChecklistStatus();
}

function toggleChecklist(id, checked) {
  const saved = JSON.parse(localStorage.getItem('checklist')||'{}');
  saved[id] = checked;
  localStorage.setItem('checklist', JSON.stringify(saved));
  renderChecklist();
}

function updateChecklistStatus() {
  const saved = JSON.parse(localStorage.getItem('checklist')||'{}');
  const done = Object.values(saved).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const el = document.getElementById('checklist-status');
  if(!el) return;
  if(done === total) el.innerHTML = '<span style="color:var(--green)">✅ Totul verificat — drum bun!</span>';
  else el.innerHTML = `<span style="color:var(--t2)">${done}/${total} verificate</span>`;
}

function resetChecklist() {
  localStorage.removeItem('checklist');
  renderChecklist();
  showNotification('🔄 Resetat!', 'Checklist-ul a fost resetat.');
}

function shareChecklist() {
  const saved = JSON.parse(localStorage.getItem('checklist')||'{}');
  const text = '✅ Checklist AutoAssist:\n' + CHECKLIST_ITEMS.map(i => (saved[i.id]?'✅':'❌') + ' ' + i.text).join('\n');
  if(navigator.share) navigator.share({ title: 'Checklist AutoAssist', text });
  else navigator.clipboard?.writeText(text).then(() => showNotification('📋 Copiat!', 'Checklist-ul a fost copiat.'));
}

// ═══ ANVELOPE (VECHI - compatibilitate) ═══
function prefillAnvelope() {
  const carId = document.getElementById('anv-car')?.value;
  if(!carId) return;
  const car = cars.find(c => c.id == carId);
  if(car?.anv) {
    const parts = car.anv.split('/');
    if(parts[0]) document.getElementById('anv-lat').value = parts[0];
    if(parts[1]) document.getElementById('anv-prof').value = parts[1];
    if(parts[2]) document.getElementById('anv-diam').value = parts[2]?.replace('R','');
  }
  updateAnvLink();
}

function updateAnvLink() {
  const lat = document.getElementById('anv-lat')?.value;
  const prof = document.getElementById('anv-prof')?.value;
  const diam = document.getElementById('anv-diam')?.value;
  const sezon = document.getElementById('anv-sezon')?.value;
  const prev = document.getElementById('anv-preview');
  if(lat && prof && diam) {
    const dim = `${lat}/${prof} R${diam}`;
    if(prev) { prev.style.display='block'; prev.textContent = dim + (sezon==='vara'?' ☀️':sezon==='iarna'?' ❄️':' 🌤️'); }
    const sezonMap = { vara: 'summer', iarna: 'winter', all: 'allseason' };
    const anvLink = document.getElementById('anv-link-anvelope');
    const autodocLink = document.getElementById('anv-link-autodoc');
    const emagLink = document.getElementById('anv-link-emag');
    if(anvLink) anvLink.href = `https://www.anvelope.ro/anvelope-${sezon === 'iarna' ? 'iarna' : sezon === 'all' ? 'all-season' : 'vara'}/${lat}-${prof}-r${diam}/`;
    if(autodocLink) autodocLink.href = `https://ro.autodoc.ro/anvelope?width=${lat}&profile=${prof}&diameter=${diam}&season=${sezonMap[sezon]||'summer'}`;
    if(emagLink) emagLink.href = `https://www.emag.ro/anvelope/filter/latime-${lat},profil-${prof},diametru-janta-${diam}/c`;
  } else {
    if(prev) prev.style.display='none';
  }
}

// ═══ DASHBOARD CONFIGURABIL ═══
const DASH_ITEMS = [
  { id: 'asistent', icon: '🎙️', label: 'Asistent Vocal AI', desc: 'Acces rapid la asistentul vocal', gradient: 'linear-gradient(135deg,#4f7dff,#a259ff)', defaultOn: true },
  { id: 'mentenanta', icon: '🔧', label: 'Mentenanță & Service', desc: 'Istoric service și jurnal combustibil', gradient: 'linear-gradient(135deg,#00c864,#00a352)', defaultOn: true },
  { id: 'anvelope', icon: '🏎️', label: 'Anvelope', desc: 'Dimensiuni, calendar sezonier și comenzi', gradient: 'linear-gradient(135deg,#ff6b35,#f7931e)', defaultOn: true },
  { id: 'costuri', icon: '💸', label: 'Calculator Costuri', desc: 'Cât cheltuiești lunar cu mașina ta', gradient: 'linear-gradient(135deg,#ffb300,#ff8f00)', defaultOn: false },
  { id: 'electric', icon: '⚡', label: 'Mașini Electrice', desc: 'Stații EV și info hibrid', gradient: 'linear-gradient(135deg,#4fc3f7,#0288d1)', defaultOn: false },
  { id: 'verificare', icon: '🔍', label: 'Verificare Documente', desc: 'Verifică RCA, ITP, rovinietă orice mașină', gradient: 'linear-gradient(135deg,#7c5cfc,#a259ff)', defaultOn: false },
  { id: 'vanzare', icon: '💰', label: 'Vânzare Mașini', desc: 'Publică anunț și găsești cumpărători', gradient: 'linear-gradient(135deg,#ff4757,#ff6b81)', defaultOn: false },
  { id: 'agenti', icon: '🧠', label: 'Agenți AI', desc: 'Echipa ta de asistenți inteligenți', gradient: 'linear-gradient(135deg,#4f7dff,#7c5cfc)', defaultOn: false },
];

function getDashConfig() {
  const saved = JSON.parse(localStorage.getItem('dashConfig') || '{}');
  return DASH_ITEMS.map(item => ({ ...item, enabled: saved.hasOwnProperty(item.id) ? saved[item.id] : item.defaultOn }));
}

function saveDashConfig() {
  const config = {};
  DASH_ITEMS.forEach(item => { const cb = document.getElementById('dashcb-' + item.id); if(cb) config[item.id] = cb.checked; });
  localStorage.setItem('dashConfig', JSON.stringify(config));
  renderDashCustomCards();
  showNotification('✅ Dashboard salvat!', 'Configurarea ta a fost aplicată.');
}

function resetDashConfig() {
  localStorage.removeItem('dashConfig');
  renderDashConfigList();
  renderDashCustomCards();
  showNotification('🔄 Resetat!', 'Dashboard-ul a revenit la configurarea implicită.');
}

function renderDashConfigList() {
  const el = document.getElementById('dash-config-list');
  if(!el) return;
  const config = getDashConfig();
  el.innerHTML = config.map(item => `
    <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--s2);border-radius:var(--rs);cursor:pointer">
      <input type="checkbox" id="dashcb-${item.id}" ${item.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--accent);flex-shrink:0">
      <div style="width:36px;height:36px;border-radius:10px;background:${item.gradient};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${item.icon}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:13px">${item.label}</div><div style="font-size:11px;color:var(--t2)">${item.desc}</div></div>
    </label>`).join('');
}

function renderDashCustomCards() {
  const el = document.getElementById('dash-custom-cards');
  if(!el) return;
  const config = getDashConfig().filter(i => i.enabled);
  if(!config.length) { el.innerHTML = ''; return; }
  el.innerHTML = config.map(item => `
    <div class="card" style="margin-bottom:10px;cursor:pointer;background:linear-gradient(135deg,rgba(79,125,255,0.05),rgba(124,92,252,0.05));border-color:rgba(124,92,252,0.15)" onclick="goTo('${item.id}')">
      <div style="display:flex;align-items:center;gap:14px;padding:2px 0">
        <div style="width:48px;height:48px;background:${item.gradient};border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,0.25)">${item.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Bebas Neue';font-size:16px;letter-spacing:1.5px;color:var(--t1)">${item.label}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">${item.desc}</div>
        </div>
        <span class="btn btn-sm" style="background:${item.gradient};color:#fff;font-weight:700;flex-shrink:0">→</span>
      </div>
    </div>`).join('');
}

// ═══ CALCULATOR COSTURI ═══
function calcCosturi() {
  const km = parseFloat(document.getElementById('cost-km')?.value) || 0;
  const consum = parseFloat(document.getElementById('cost-consum')?.value) || 0;
  const pretComb = parseFloat(document.getElementById('cost-pret-comb')?.value) || 0;
  const rca = parseFloat(document.getElementById('cost-rca')?.value) || 0;
  const casco = parseFloat(document.getElementById('cost-casco')?.value) || 0;
  const itp = parseFloat(document.getElementById('cost-itp')?.value) || 0;
  const rov = parseFloat(document.getElementById('cost-rov')?.value) || 0;
  const serv = parseFloat(document.getElementById('cost-serv')?.value) || 0;
  const anv = parseFloat(document.getElementById('cost-anv')?.value) || 0;
  const parc = parseFloat(document.getElementById('cost-parc')?.value) || 0;
  const spal = parseFloat(document.getElementById('cost-spal')?.value) || 0;
  const combustibil = (km * consum / 100) * pretComb;
  const parcare = parc * 12;
  const spalatorie = spal * 12;
  const total = combustibil + rca + casco + itp + rov + serv + anv + parcare + spalatorie;
  const totalLuna = total / 12;
  const perKm = km > 0 ? total / km : 0;
  const el = document.getElementById('cost-output');
  if(!el || total === 0) return;
  const items = [
    {label:'⛽ Combustibil', val:combustibil, pct:total>0?combustibil/total*100:0},
    {label:'🛡️ RCA + CASCO', val:rca+casco, pct:total>0?(rca+casco)/total*100:0},
    {label:'📋 ITP + Rovinietă', val:itp+rov, pct:total>0?(itp+rov)/total*100:0},
    {label:'🔧 Service + Anvelope', val:serv+anv, pct:total>0?(serv+anv)/total*100:0},
    {label:'🅿️ Parcare + Spălătorie', val:parcare+spalatorie, pct:total>0?(parcare+spalatorie)/total*100:0},
  ];
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:11px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:1px">Total anual</div>
      <div style="font-family:'Bebas Neue';font-size:48px;letter-spacing:2px;color:var(--gold)">${Math.round(total).toLocaleString()} RON</div>
      <div style="display:flex;justify-content:center;gap:24px;margin-top:8px">
        <div style="text-align:center"><div style="font-size:11px;color:var(--t3)">Pe lună</div><div style="font-size:18px;font-weight:800;color:var(--accent)">${Math.round(totalLuna).toLocaleString()} RON</div></div>
        <div style="font-size:11px;color:var(--t3)">Per km</div><div style="font-size:18px;font-weight:800;color:var(--accent)">${perKm.toFixed(2)} RON</div></div>
    </div>
    ${items.filter(i=>i.val>0).map(i=>`
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="font-weight:600">${i.label}</span>
          <span style="font-weight:700">${Math.round(i.val).toLocaleString()} RON (${Math.round(i.pct)}%)</span>
        </div>
        <div style="background:var(--s3);border-radius:4px;height:6px;overflow:hidden">
          <div style="width:${i.pct}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px;transition:width 0.5s"></div>
        </div>
      </div>`).join('')}`;
}

function populateCostCars() {
  const sel = document.getElementById('cost-car');
  if(!sel) return;
  sel.innerHTML = '<option value="">-- Selectează din garaj --</option>';
  cars.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.plate} — ${c.brand} ${c.model}</option>`);
}
