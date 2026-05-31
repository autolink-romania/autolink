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
    // Dacă era o valoare selectată, păstreaz-o
    if(cur) { sel.value = cur; }
    // Altfel, dacă există o singură mașină, selecteaz-o automat
    else if(cars.length === 1) { sel.value = cars[0].id; }
    // Dacă există mașina returnToCarId, selecteaz-o
    else if(window._returnToCarId) {
      const found = cars.find(c=>c.id==window._returnToCarId);
      if(found) sel.value = found.id;
    }
  });
  // Actualizează lista după populare
  renderMntList();
}

// ═══ JURNAL SERVICE ═══
function mntCarChange() {
  const carId = document.getElementById('mnt-car-sel')?.value;
  const hintEl = document.getElementById('mnt-km-hint');
  const kmEl = document.getElementById('mnt-km');
  if(!hintEl) return;
  if(!carId) { hintEl.innerHTML = ''; return; }
  const car = cars.find(c=>c.id==carId);
  if(car && car.km) {
    hintEl.innerHTML = `<span style="color:var(--t3)">ℹ️ ${car.brand} ${car.model} are <strong style="color:var(--t2)">${Number(car.km).toLocaleString()} km</strong> în garaj</span>`;
  } else {
    hintEl.innerHTML = `<span style="color:var(--t3)">ℹ️ Km necunoscut pentru această mașină — actualizează din Garaj</span>`;
  }
  if(kmEl && kmEl.value) mntKmValidate();
}

function mntTipChange() {
  const tip = document.getElementById('mnt-tip').value;
  const extraDiv = document.getElementById('mnt-extra-div');
  if(extraDiv) extraDiv.style.display = (tip === 'Revizie completă' || tip === 'Altele') ? 'block' : 'none';
}

function mntKmValidate() {
  const carId = document.getElementById('mnt-car-sel')?.value;
  const kmEl = document.getElementById('mnt-km');
  const hintEl = document.getElementById('mnt-km-hint');
  if(!kmEl || !hintEl || !carId) return;
  const km = parseInt(kmEl.value);
  if(!km) { hintEl.innerHTML = ''; return; }
  const car = cars.find(c=>c.id==carId);
  if(!car || !car.km) { hintEl.innerHTML = ''; return; }
  const carKm = parseInt(car.km);
  if(km > carKm) {
    hintEl.innerHTML = `<span style="color:var(--amber)">⚠️ Atenție: introduci ${km.toLocaleString()} km, dar mașina are ${carKm.toLocaleString()} km înregistrați. Verifică dacă ai actualizat kilometrajul mașinii.</span>`;
  } else if(km < carKm) {
    // Verifică și față de ultima intervenție
    const mntList = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
    const lastKm = mntList.length ? Math.max(...mntList.map(m=>parseInt(m.km||0))) : 0;
    if(km < lastKm) {
      hintEl.innerHTML = `<span style="color:var(--red)">❌ ${km.toLocaleString()} km este mai mic decât ultima intervenție înregistrată (${lastKm.toLocaleString()} km). Verifică dacă ai tastat corect.</span>`;
    } else {
      hintEl.innerHTML = `<span style="color:var(--green)">✅ OK — intervenție la ${km.toLocaleString()} km (mașina are acum ${carKm.toLocaleString()} km)</span>`;
    }
  } else {
    hintEl.innerHTML = `<span style="color:var(--green)">✅ Km corecți — identic cu kilometrajul curent al mașinii</span>`;
  }
}

function addMnt() {
  const car = document.getElementById('mnt-car-sel').value;
  const tip = document.getElementById('mnt-tip').value;
  const data = document.getElementById('mnt-data').value;
  const km = document.getElementById('mnt-km').value;
  const cost = document.getElementById('mnt-cost').value;
  const obs = document.getElementById('mnt-obs').value;
  const furnizor = document.getElementById('mnt-furnizor')?.value || '';
  const detalii = document.getElementById('mnt-detalii')?.value || '';
  const factura = window._mntFacturaData || null;
  const facturaName = window._mntFacturaName || null;
  if(!car || !tip || !data) { showNotification('Completează','Selectează mașina, tipul și data.'); return; }

  // Validare km
  if(km) {
    const carObj = cars.find(c=>c.id==car);
    const mntList = JSON.parse(localStorage.getItem('mnt_'+car)||'[]');
    const lastKm = mntList.length ? Math.max(...mntList.map(m=>parseInt(m.km||0))) : 0;
    if(parseInt(km) < lastKm) {
      const ok = confirm(`⚠️ Atenție!\n\nAi introdus ${Number(km).toLocaleString()} km, dar ultima intervenție a fost la ${lastKm.toLocaleString()} km.\n\nEste posibil să fie o greșeală de tastare. Continui oricum?`);
      if(!ok) return;
    }
    if(carObj && carObj.km && parseInt(km) > parseInt(carObj.km)) {
      const ok = confirm(`⚠️ Atenție!\n\nAi introdus ${Number(km).toLocaleString()} km, dar mașina are ${Number(carObj.km).toLocaleString()} km în garaj.\n\nDacă ai actualizat kilometrajul recent, ignoră acest mesaj. Continui?`);
      if(!ok) return;
    }
  }

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
  mntList.unshift({ id: Date.now(), tip, data, km: km||null, cost: cost||null, obs: obs||'', furnizor, detalii, factura, facturaName });
  localStorage.setItem('mnt_'+car, JSON.stringify(mntList));
  ['mnt-data','mnt-km','mnt-cost','mnt-obs','mnt-furnizor','mnt-detalii'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  window._mntFacturaData = null; window._mntFacturaName = null;
  const prevEl = document.getElementById('mnt-factura-preview');
  if(prevEl) prevEl.innerHTML = '';
  const hintEl2 = document.getElementById('mnt-km-hint');
  if(hintEl2) hintEl2.innerHTML = '';
  renderMntList();

  // Oferă actualizare km mașină dacă km introduși sunt mai mari decât ce e în garaj
  const carObj2 = cars.find(c=>c.id==car);
  if(km && carObj2 && (!carObj2.km || parseInt(km) > parseInt(carObj2.km))) {
    showMntKmUpdatePrompt(car, parseInt(km), carObj2, tip);
  } else {
    showNotification('✅ Salvat!', tip + ' înregistrată cu succes.');
  }
}

function showMntKmUpdatePrompt(carId, kmNou, carObj, tip) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--s1);border-radius:20px;padding:28px;width:100%;max-width:380px;text-align:center">
      <div style="font-size:36px;margin-bottom:12px">🚗</div>
      <div style="font-size:17px;font-weight:800;color:var(--t1);margin-bottom:8px">Actualizezi kilometrajul mașinii?</div>
      <div style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:20px">
        Ai înregistrat intervenția la <strong style="color:var(--accent)">${kmNou.toLocaleString()} km</strong>.<br>
        ${carObj.km ? `Mașina are acum <strong>${Number(carObj.km).toLocaleString()} km</strong> în garaj.` : 'Mașina nu are kilometraj înregistrat.'}<br><br>
        Vrei să actualizezi kilometrajul la <strong style="color:var(--green)">${kmNou.toLocaleString()} km</strong>?
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('div[style*=fixed]').remove();showNotification('✅ Salvat!','${tip.replace(/'/g,"\\'")} înregistrată. Km nemodificați.')" class="btn btn-ghost btn-sm" style="flex:1">Nu, lasă cum e</button>
        <button onclick="mntUpdateCarKm('${carId}',${kmNou},this.closest('div[style*=fixed]'),'${tip.replace(/'/g,"\\'")}');" class="btn btn-primary btn-sm" style="flex:2">✅ Da, actualizează la ${kmNou.toLocaleString()} km</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function mntUpdateCarKm(carId, kmNou, overlayEl, tip) {
  const carObj = cars.find(c=>c.id==carId);
  if(carObj) {
    carObj.km = kmNou;
    save();
    if(typeof renderAll === 'function') renderAll();
  }
  if(overlayEl) overlayEl.remove();
  showNotification('✅ Salvat & actualizat!', `${tip} înregistrată. Kilometraj actualizat la ${kmNou.toLocaleString()} km.`);
}

function mntFacturaUpload(input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    window._mntFacturaData = e.target.result;
    window._mntFacturaName = file.name;
    const prev = document.getElementById('mnt-factura-preview');
    if(prev) prev.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(0,200,100,0.1);border-radius:8px;margin-top:6px">
      <span style="font-size:20px">${file.type.includes('pdf')?'📄':'🖼️'}</span>
      <span style="font-size:12px;color:var(--t2);flex:1">${file.name}</span>
      <button onclick="window._mntFacturaData=null;window._mntFacturaName=null;this.parentElement.parentElement.innerHTML='';document.getElementById('mnt-factura-input').value=''" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px">×</button>
    </div>`;
  };
  reader.readAsDataURL(file);
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

  // Buton raport service
  const car = cars.find(c=>c.id==carId);
  const raportBtn = `<div style="display:flex;gap:8px;margin-bottom:12px">
    <button onclick="exportRaportService('${carId}')" class="btn btn-ghost btn-sm" style="flex:1;font-size:12px">📄 Descarcă PDF</button>
    <button onclick="copyRaportService('${carId}')" class="btn btn-ghost btn-sm" style="flex:1;font-size:12px">📋 Copiază text</button>
  </div>`;

  el.innerHTML = raportBtn + graficHtml + list.map(m => `
    <div onclick="openMntDetail('${carId}',${m.id})" style="background:var(--s2);border-radius:12px;padding:14px;margin-bottom:8px;border-left:3px solid var(--accent);cursor:pointer;transition:opacity 0.15s" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
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
          <div style="font-size:10px;color:var(--t3);margin-top:2px">atingeți pentru detalii</div>
        </div>
      </div>
    </div>`).join('');

  renderReminderAuto();
}

function openMntDetail(carId, id) {
  const list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  const m = list.find(x=>x.id===id);
  if(!m) return;
  const car = cars.find(c=>c.id==carId);

  const facturaHtml = m.factura ? `
    <div style="margin-top:10px;background:var(--s3);border-radius:10px;padding:12px">
      <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:8px">📎 FACTURĂ / BON</div>
      ${m.factura.startsWith('data:image') 
        ? `<img src="${m.factura}" style="width:100%;border-radius:8px;cursor:pointer" onclick="openImgLightbox('${m.factura}')">`
        : `<button onclick="mntOpenFactura('${m.factura}','${m.facturaName||'factura'}')" class="btn btn-ghost btn-sm" style="width:100%">📄 ${m.facturaName||'Deschide factură'}</button>`
      }
    </div>` : '';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:0';
  overlay.innerHTML = `
    <div style="background:var(--s1);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="font-family:'Bebas Neue';font-size:22px;letter-spacing:1.5px;color:var(--accent)">🔧 Detalii Intervenție</div>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:var(--s2);border:none;color:var(--t2);font-size:20px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center">×</button>
      </div>
      <div style="background:var(--s2);border-radius:14px;padding:16px;margin-bottom:12px">
        <div style="font-size:18px;font-weight:800;color:var(--t1);margin-bottom:12px">${m.tip}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--s3);border-radius:10px;padding:12px">
            <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:4px">DATA</div>
            <div style="font-size:15px;font-weight:700">📅 ${m.data||'—'}</div>
          </div>
          <div style="background:var(--s3);border-radius:10px;padding:12px">
            <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:4px">KILOMETRAJ</div>
            <div style="font-size:15px;font-weight:700">📍 ${m.km?Number(m.km).toLocaleString()+' km':'—'}</div>
          </div>
          <div style="background:var(--s3);border-radius:10px;padding:12px">
            <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:4px">COST</div>
            <div style="font-size:15px;font-weight:800;color:var(--amber)">${m.cost?Number(m.cost).toLocaleString()+' RON':'—'}</div>
          </div>
          <div style="background:var(--s3);border-radius:10px;padding:12px">
            <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:4px">SERVICE</div>
            <div style="font-size:13px;font-weight:700">🏪 ${m.furnizor||'—'}</div>
          </div>
        </div>
        ${m.detalii?`<div style="margin-top:10px;background:var(--s3);border-radius:10px;padding:12px">
          <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:4px">DETALII LUCRĂRI</div>
          <div style="font-size:13px;color:var(--t2);line-height:1.5">${m.detalii}</div>
        </div>`:''}
        ${m.obs?`<div style="margin-top:10px;background:var(--s3);border-radius:10px;padding:12px">
          <div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:1px;margin-bottom:4px">OBSERVAȚII</div>
          <div style="font-size:13px;color:var(--t2);line-height:1.5">${m.obs}</div>
        </div>`:''}
        ${facturaHtml}
      </div>
      <div style="font-size:11px;color:var(--t3);text-align:center;margin-bottom:14px">${car?car.plate+' — '+car.brand+' '+car.model:''}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="openEditMnt('${carId}',${m.id},this.closest('div[style*=fixed]'))" class="btn btn-ghost btn-sm" style="flex:1;min-width:100px">✏️ Editează</button>
        <button onclick="delMntConfirm('${carId}',${m.id},this)" class="btn btn-sm" style="flex:1;min-width:100px;background:rgba(255,71,87,0.15);color:var(--red);border:1px solid rgba(255,71,87,0.3)">🗑 Șterge</button>
        <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-primary btn-sm" style="flex:2;min-width:120px">✓ Închide</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });
}

function mntOpenFactura(dataUrl, name) {
  const blob = fetch(dataUrl).then(r=>r.blob()).then(b=>{
    const url = URL.createObjectURL(b);
    window.open(url, '_blank');
  });
}

function openImgLightbox(src) {
  const lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  lb.innerHTML = `<img src="${src}" style="max-width:95vw;max-height:90vh;border-radius:10px;box-shadow:0 0 40px rgba(0,0,0,0.8)">`;
  lb.onclick = () => lb.remove();
  document.body.appendChild(lb);
}

function openEditMnt(carId, id, overlayEl) {
  const list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  const m = list.find(x=>x.id===id);
  if(!m) return;
  if(overlayEl) overlayEl.remove();

  const TIPURI = ['Schimb ulei + filtru','Schimb anvelope','Frâne față','Frâne spate','Distribuție','Filtru aer','Filtru habitaclu','Baterie','Bujii','Amortizoare','Revizie completă','Altele'];
  const showExtra = m.tip === 'Revizie completă' || m.tip === 'Altele';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:0';
  overlay.innerHTML = `
    <div style="background:var(--s1);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;max-height:92vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="font-family:'Bebas Neue';font-size:22px;letter-spacing:1.5px;color:var(--accent)">✏️ Editează Intervenția</div>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:var(--s2);border:none;color:var(--t2);font-size:20px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center">×</button>
      </div>
      <div class="fg"><label class="fl">Tip intervenție</label>
        <select class="fi" id="edit-mnt-tip" onchange="editMntTipChange(this)">
          ${TIPURI.map(t=>`<option ${t===m.tip?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div id="edit-mnt-extra-div" style="display:${showExtra?'block':'none'}">
        <div class="fg"><label class="fl">Detalii lucrări efectuate</label>
          <textarea class="fi" id="edit-mnt-detalii" rows="3" placeholder="Ex: schimb ulei motor 5W40, filtru ulei, filtru aer, bujii NGK, verificare frâne...">${m.detalii||''}</textarea>
        </div>
      </div>
      <div class="fr">
        <div class="fg" style="margin:0"><label class="fl">Data</label><input class="fi" id="edit-mnt-data" type="date" value="${m.data||''}"></div>
        <div class="fg" style="margin:0"><label class="fl">Km</label><input class="fi" id="edit-mnt-km" type="number" value="${m.km||''}" placeholder="85000"></div>
      </div>
      <div class="fr">
        <div class="fg" style="margin:0"><label class="fl">Cost (RON)</label><input class="fi" id="edit-mnt-cost" type="number" value="${m.cost||''}" placeholder="350"></div>
        <div class="fg" style="margin:0"><label class="fl">Service / Furnizor</label><input class="fi" id="edit-mnt-furnizor" value="${m.furnizor||''}" placeholder="Service Auto X"></div>
      </div>
      <div class="fg"><label class="fl">Observații</label><input class="fi" id="edit-mnt-obs" value="${m.obs||''}" placeholder="Piesă originală, garanție 1 an..."></div>
      <div class="fg"><label class="fl">📎 Factură / Bon (opțional)</label>
        <div style="border:2px dashed var(--b1);border-radius:10px;padding:14px;text-align:center;cursor:pointer" onclick="document.getElementById('edit-mnt-factura-input').click()">
          <div style="font-size:24px">📎</div>
          <div style="font-size:12px;color:var(--t3)">${m.facturaName?'📄 '+m.facturaName:'Atașează factură sau bon (JPG, PNG, PDF)'}</div>
          <input type="file" id="edit-mnt-factura-input" accept="image/*,application/pdf" style="display:none" onchange="editMntFacturaUpload(this)">
        </div>
        <div id="edit-mnt-factura-preview"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-ghost btn-sm" style="flex:1">Anulează</button>
        <button onclick="saveEditMnt('${carId}',${m.id},this.closest('div[style*=fixed]'))" class="btn btn-primary btn-sm" style="flex:2">💾 Salvează modificările</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });
  window._editMntFactura = m.factura || null;
  window._editMntFacturaName = m.facturaName || null;
}

function editMntTipChange(sel) {
  const extra = document.getElementById('edit-mnt-extra-div');
  if(extra) extra.style.display = (sel.value === 'Revizie completă' || sel.value === 'Altele') ? 'block' : 'none';
}

function editMntFacturaUpload(input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    window._editMntFactura = e.target.result;
    window._editMntFacturaName = file.name;
    const prev = document.getElementById('edit-mnt-factura-preview');
    if(prev) prev.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(0,200,100,0.1);border-radius:8px;margin-top:6px">
      <span>${file.type.includes('pdf')?'📄':'🖼️'}</span>
      <span style="font-size:12px;flex:1">${file.name}</span>
    </div>`;
  };
  reader.readAsDataURL(file);
}

function saveEditMnt(carId, id, overlayEl) {
  const tip = document.getElementById('edit-mnt-tip').value;
  const data = document.getElementById('edit-mnt-data').value;
  const km = document.getElementById('edit-mnt-km').value;
  const cost = document.getElementById('edit-mnt-cost').value;
  const furnizor = document.getElementById('edit-mnt-furnizor').value;
  const obs = document.getElementById('edit-mnt-obs').value;
  const detalii = document.getElementById('edit-mnt-detalii')?.value || '';
  if(!tip || !data) { showNotification('Completează','Tipul și data sunt obligatorii.'); return; }

  let list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  const idx = list.findIndex(x=>x.id===id);
  if(idx === -1) return;
  list[idx] = { ...list[idx], tip, data, km:km||null, cost:cost||null, furnizor, obs, detalii,
    factura: window._editMntFactura ?? list[idx].factura,
    facturaName: window._editMntFacturaName ?? list[idx].facturaName
  };
  localStorage.setItem('mnt_'+carId, JSON.stringify(list));
  if(overlayEl) overlayEl.remove();
  renderMntList();
  showNotification('✅ Actualizat!', tip + ' a fost modificată.');
}

function _buildRaportService(carId) {
  const list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  const car = cars.find(c=>c.id==carId);
  if(!car || !list.length) return null;
  const totalCost = list.filter(m=>m.cost).reduce((s,m)=>s+parseFloat(m.cost||0),0);
  const sorted = [...list].sort((a,b)=>new Date(a.data)-new Date(b.data));
  let txt = '';
  txt += '═══════════════════════════════════════════\n';
  txt += '   RAPORT ISTORIC SERVICE — AUTOASSIST\n';
  txt += '═══════════════════════════════════════════\n';
  txt += `Generat: ${new Date().toLocaleDateString('ro-RO')} | www.autoassist.ro\n\n`;
  txt += `VEHICUL: ${car.brand} ${car.model} ${car.year||''}\n`;
  txt += `NR. ÎNMATRICULARE: ${car.plate}\n`;
  txt += `KILOMETRAJ CURENT: ${car.km?car.km.toLocaleString()+' km':'—'}\n`;
  if(car.vin) txt += `VIN: ${car.vin}\n`;
  if(car.fuel) txt += `COMBUSTIBIL: ${car.fuel}\n`;
  txt += `TOTAL INTERVENȚII: ${list.length}\n`;
  txt += `TOTAL CHELTUIELI SERVICE: ${totalCost.toLocaleString()} RON\n`;
  txt += '\n───────────────────────────────────────────\n';
  txt += 'ISTORICUL INTERVENȚIILOR (cronologic):\n';
  txt += '───────────────────────────────────────────\n\n';
  sorted.forEach((m,i) => {
    txt += `${i+1}. ${m.tip}\n`;
    txt += `   Data: ${m.data||'—'}\n`;
    if(m.km) txt += `   Km la intervenție: ${Number(m.km).toLocaleString()} km\n`;
    if(m.cost) txt += `   Cost: ${Number(m.cost).toLocaleString()} RON\n`;
    if(m.furnizor) txt += `   Service: ${m.furnizor}\n`;
    if(m.detalii) txt += `   Lucrări: ${m.detalii}\n`;
    if(m.obs) txt += `   Observații: ${m.obs}\n`;
    if(m.factura) txt += `   📎 Factură atașată: DA\n`;
    txt += '\n';
  });
  txt += '═══════════════════════════════════════════\n';
  txt += `TOTAL CHELTUIELI: ${totalCost.toLocaleString()} RON\n`;
  txt += '═══════════════════════════════════════════\n';
  txt += 'AutoAssist — Asistentul & Managerul tău auto\n';
  txt += 'www.autoassist.ro\n';
  return { txt, car };
}

// Funcție publică folosită și din vanzare
function getRaportServiceText(carId) {
  const result = _buildRaportService(carId);
  return result ? result.txt : null;
}

async function exportRaportService(carId) {
  const list = JSON.parse(localStorage.getItem('mnt_'+carId)||'[]');
  const car = cars.find(c=>c.id==carId);
  if(!car || !list.length) { showNotification('❌ Eroare', 'Nu există intervenții de exportat.'); return; }

  const totalCost = list.filter(m=>m.cost).reduce((s,m)=>s+parseFloat(m.cost||0),0);
  const sorted = [...list].sort((a,b)=>new Date(a.data)-new Date(b.data));
  const genDate = new Date().toLocaleDateString('ro-RO');

  const rows = sorted.map((m,i) => `
    <div class="row ${i%2===0?'row-odd':'row-even'}">
      <div class="row-num">${i+1}</div>
      <div class="row-body">
        <div class="row-tip">${m.tip}</div>
        <div class="row-meta">
          ${m.data ? `<span>📅 ${m.data}</span>` : ''}
          ${m.km ? `<span>📍 ${Number(m.km).toLocaleString()} km</span>` : ''}
          ${m.furnizor ? `<span>🏪 ${m.furnizor}</span>` : ''}
          ${m.factura ? `<span class="badge-factura">📎 Factură atașată</span>` : ''}
        </div>
        ${m.detalii ? `<div class="row-detalii"><strong>Lucrări:</strong> ${m.detalii}</div>` : ''}
        ${m.obs ? `<div class="row-obs"><strong>Observații:</strong> ${m.obs}</div>` : ''}
      </div>
      ${m.cost ? `<div class="row-cost">${Number(m.cost).toLocaleString()} RON</div>` : '<div class="row-cost-empty"></div>'}
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>Raport Service — ${car.plate}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f0f4ff; color:#1a1a2e; }
  .page { max-width:800px; margin:0 auto; background:#fff; }

  /* HEADER */
  .header { background:linear-gradient(135deg,#0f0f1e 0%,#1a1a3e 100%); padding:32px 36px 28px; position:relative; overflow:hidden; }
  .header::before { content:''; position:absolute; left:0; top:0; bottom:0; width:5px; background:linear-gradient(to bottom,#4f7dff,#a259ff); }
  .header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
  .logo { font-size:28px; font-weight:900; color:#f0b429; letter-spacing:-0.5px; }
  .logo span { color:#fff; font-weight:300; font-size:16px; display:block; margin-top:2px; letter-spacing:0; }
  .header-date { text-align:right; color:#8888aa; font-size:12px; }
  .header-date strong { color:#aaaacc; display:block; font-size:13px; }
  .header-title { color:#fff; font-size:22px; font-weight:700; letter-spacing:0.5px; }
  .header-sub { color:#6666aa; font-size:12px; margin-top:4px; }

  /* CARD VEHICUL */
  .vehicle-card { margin:24px 36px; background:linear-gradient(135deg,#f0f4ff,#e8eeff); border:1.5px solid #c0cfff; border-radius:14px; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; gap:20px; }
  .vehicle-left .name { font-size:22px; font-weight:800; color:#1a1a3e; margin-bottom:8px; }
  .vehicle-left .details { display:flex; flex-wrap:wrap; gap:12px; }
  .vehicle-left .detail { font-size:13px; color:#4a4a6a; }
  .vehicle-left .detail strong { color:#1a1a3e; }
  .vehicle-left .vin { font-size:11px; color:#8888aa; margin-top:6px; font-family:monospace; }
  .vehicle-stats { display:flex; gap:16px; flex-shrink:0; }
  .stat-box { text-align:center; background:#fff; border-radius:10px; padding:12px 16px; border:1px solid #dde3ff; min-width:80px; }
  .stat-box .val { font-size:20px; font-weight:800; color:#4f7dff; }
  .stat-box .lbl { font-size:10px; color:#8888aa; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }
  .stat-box.gold .val { color:#f0b429; }

  /* SECTIUNE TITLU */
  .section-title { margin:0 36px 0; background:linear-gradient(90deg,#4f7dff,#7c5cfc); border-radius:10px 10px 0 0; padding:10px 20px; color:#fff; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; }

  /* INTERVENTII */
  .rows-wrap { margin:0 36px; border:1px solid #dde3ff; border-top:none; border-radius:0 0 10px 10px; overflow:hidden; }
  .row { display:flex; align-items:flex-start; gap:14px; padding:14px 16px; border-bottom:1px solid #eeeeff; }
  .row:last-child { border-bottom:none; }
  .row-odd { background:#f8f9ff; }
  .row-even { background:#fff; }
  .row-num { width:28px; height:28px; background:linear-gradient(135deg,#4f7dff,#7c5cfc); color:#fff; border-radius:50%; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
  .row-body { flex:1; min-width:0; }
  .row-tip { font-size:14px; font-weight:700; color:#1a1a3e; margin-bottom:5px; }
  .row-meta { display:flex; flex-wrap:wrap; gap:10px; font-size:12px; color:#6666aa; margin-bottom:4px; }
  .row-meta span { display:flex; align-items:center; gap:3px; }
  .badge-factura { background:#e6fff3; color:#00a86b; border:1px solid #b3f0d9; border-radius:4px; padding:1px 6px; font-size:11px; }
  .row-detalii { font-size:12px; color:#4a4a6a; margin-top:5px; line-height:1.5; }
  .row-obs { font-size:12px; color:#6a6a8a; margin-top:3px; font-style:italic; line-height:1.5; }
  .row-cost { flex-shrink:0; background:#f0b429; color:#1a1000; font-weight:800; font-size:13px; padding:6px 12px; border-radius:8px; text-align:center; white-space:nowrap; align-self:flex-start; margin-top:1px; }
  .row-cost-empty { width:80px; flex-shrink:0; }

  /* TOTAL */
  .total-bar { margin:0 36px; background:linear-gradient(135deg,#0f0f1e,#1a1a3e); border-radius:0 0 14px 14px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; margin-top:-1px; }
  .total-bar .lbl { color:#8888cc; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
  .total-bar .val { color:#f0b429; font-size:22px; font-weight:900; }

  /* FOOTER */
  .footer { margin:28px 36px 32px; display:flex; justify-content:space-between; align-items:center; padding-top:16px; border-top:1px solid #dde3ff; }
  .footer .left { font-size:11px; color:#8888aa; line-height:1.6; }
  .footer .left strong { color:#4f7dff; display:block; font-size:13px; margin-bottom:2px; }
  .footer .badge { background:linear-gradient(135deg,#4f7dff,#7c5cfc); color:#fff; font-size:11px; font-weight:700; padding:6px 14px; border-radius:20px; letter-spacing:0.5px; }

  @media print {
    body { background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .page { max-width:100%; }
    .header { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="logo">AutoAssist<span>www.autoassist.ro</span></div>
      <div class="header-date"><strong>Generat:</strong>${genDate}</div>
    </div>
    <div class="header-title">Raport Istoric Service</div>
    <div class="header-sub">Document generat automat — AutoAssist România</div>
  </div>

  <div class="vehicle-card">
    <div class="vehicle-left">
      <div class="name">${car.brand || ''} ${car.model || ''} ${car.year || ''}</div>
      <div class="details">
        <div class="detail">Nr. înmatriculare: <strong>${car.plate}</strong></div>
        <div class="detail">Kilometraj: <strong>${car.km ? Number(car.km).toLocaleString() + ' km' : '—'}</strong></div>
        ${car.fuel ? `<div class="detail">Combustibil: <strong>${car.fuel}</strong></div>` : ''}
        ${car.engine ? `<div class="detail">Motor: <strong>${car.engine} cm³</strong></div>` : ''}
        ${car.color ? `<div class="detail">Culoare: <strong>${car.color}</strong></div>` : ''}
      </div>
      ${car.vin ? `<div class="vin">VIN: ${car.vin}</div>` : ''}
    </div>
    <div class="vehicle-stats">
      <div class="stat-box">
        <div class="val">${list.length}</div>
        <div class="lbl">Intervenții</div>
      </div>
      <div class="stat-box gold">
        <div class="val">${totalCost.toLocaleString()}</div>
        <div class="lbl">RON total</div>
      </div>
    </div>
  </div>

  <div class="section-title">Istoricul intervențiilor (cronologic)</div>
  <div class="rows-wrap">${rows}</div>

  <div class="total-bar">
    <div class="lbl">Total cheltuieli service</div>
    <div class="val">${totalCost.toLocaleString()} RON</div>
  </div>

  <div class="footer">
    <div class="left">
      <strong>AutoAssist România</strong>
      Asistentul &amp; Managerul tău auto · www.autoassist.ro
    </div>
    <div class="badge">✓ Generat cu AutoAssist</div>
  </div>
</div>
</body>
</html>`;

  // Deschide în fereastră nouă și printează ca PDF
  const win = window.open('', '_blank', 'width=850,height=1100');
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
  };
  showNotification('✅ Se deschide PDF-ul!', 'Alege "Salvează ca PDF" în dialogul de printare.');
}

function copyRaportService(carId) {
  const result = _buildRaportService(carId);
  if(!result) { showNotification('❌ Eroare', 'Nu există intervenții de copiat.'); return; }
  navigator.clipboard.writeText(result.txt).then(()=>{
    showNotification('📋 Copiat!', 'Raportul service a fost copiat în clipboard.');
  }).catch(()=>{
    showNotification('❌ Eroare', 'Nu s-a putut copia. Încearcă exportul.');
  });
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
