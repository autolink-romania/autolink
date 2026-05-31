// ═══ PIESE AUTO ═══
const AUTODOC_AFILIAT = 'AFILIAT_ID';
const AUTODOC_BASE = 'https://www.autodoc24.ro';

const BRAND_SLUG = {
  'Audi':'audi','BMW':'bmw','Mercedes':'mercedes-benz','Mercedes-Benz':'mercedes-benz',
  'Volkswagen':'volkswagen','VW':'volkswagen','Dacia':'dacia','Renault':'renault',
  'Ford':'ford','Opel':'opel','Peugeot':'peugeot','Citroën':'citroen','Citroen':'citroen',
  'Toyota':'toyota','Honda':'honda','Hyundai':'hyundai','Kia':'kia','KIA':'kia',
  'Skoda':'skoda','Škoda':'skoda','Seat':'seat','SEAT':'seat','Fiat':'fiat',
  'Volvo':'volvo','Mazda':'mazda','Nissan':'nissan','Mitsubishi':'mitsubishi',
  'Suzuki':'suzuki','Subaru':'subaru','Jeep':'jeep','Alfa Romeo':'alfa-romeo',
  'Lancia':'lancia','Chrysler':'chrysler','Dodge':'dodge','Lexus':'lexus',
  'Infiniti':'infiniti','Jaguar':'jaguar','Land Rover':'land-rover','Mini':'mini',
  'Porsche':'porsche','Chevrolet':'chevrolet','Saab':'saab','Lada':'lada',
};

function getModelSlug(model) {
  if(!model) return '';
  return model.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');
}

// Intervale implicite per categorie (km)
const CATEGORII_PIESE = [
  { id:'ulei-motor',        label:'Ulei motor',         icon:'🛢️', slug:'ulei-motor',         color:'#f0b429', kmDefault:10000, priority:1 },
  { id:'filtre-ulei',       label:'Filtru ulei',         icon:'🔧', slug:'filtre-ulei',         color:'#ffa502', kmDefault:10000, priority:1 },
  { id:'filtru-habitaclu',  label:'Filtru habitaclu',    icon:'🌬️', slug:'filtru-habitaclu',    color:'#00b4d8', kmDefault:15000, priority:2 },
  { id:'filtre-aer',        label:'Filtru aer',          icon:'💨', slug:'filtre-aer',          color:'#4f7dff', kmDefault:20000, priority:2 },
  { id:'filtru-combustibil',label:'Filtru combustibil',  icon:'⛽', slug:'filtru-combustibil',  color:'#a259ff', kmDefault:30000, priority:3 },
  { id:'placute-frana',     label:'Plăcuțe frână',       icon:'🔴', slug:'placute-frana',       color:'#ff4757', kmDefault:30000, priority:3 },
  { id:'bujii',             label:'Bujii',               icon:'⚡', slug:'bujii',               color:'#ffb300', kmDefault:40000, priority:4 },
  { id:'baterie',           label:'Baterie auto',        icon:'🔋', slug:'baterie-auto',        color:'#00c864', kmDefault:50000, priority:5 },
  { id:'discuri-frana',     label:'Discuri frână',       icon:'⭕', slug:'discuri-frana',       color:'#ff6b35', kmDefault:60000, priority:5 },
  { id:'curea-distributie', label:'Distribuție',         icon:'⚙️', slug:'kit-distributie',     color:'#7c5cfc', kmDefault:60000, priority:6 },
  { id:'amortizoare',       label:'Amortizoare',         icon:'🔩', slug:'amortizoare',         color:'#9e9e9e', kmDefault:80000, priority:7 },
  { id:'accesorii',         label:'Accesorii',           icon:'🛒', slug:'accesorii-auto',      color:'#2ed573', kmDefault:0,     priority:9 },
];

// Opțiuni interval disponibile (km)
const KM_OPTIONS = [5000,7500,10000,12500,15000,20000,25000,30000,40000,50000,60000,80000,100000];

// ── Citire/scriere config per mașină per piesă ──
function getPieseConfig(carId) {
  return JSON.parse(localStorage.getItem('piese_cfg_'+carId)||'{}');
}
function savePieseConfig(carId, cfg) {
  localStorage.setItem('piese_cfg_'+carId, JSON.stringify(cfg));
}
function getCatConfig(carId, catId) {
  const cfg = getPieseConfig(carId);
  return cfg[catId] || {};
}
function saveCatConfig(carId, catId, data) {
  const cfg = getPieseConfig(carId);
  cfg[catId] = { ...cfg[catId], ...data };
  savePieseConfig(carId, cfg);
}

function buildAutodocUrl(brand, model, categorie) {
  const brandSlug = BRAND_SLUG[brand] || brand?.toLowerCase().replace(/\s+/g,'-') || '';
  const modelSlug = getModelSlug(model);
  let url = AUTODOC_BASE;
  if(brandSlug && modelSlug && categorie) url += `/${brandSlug}/${modelSlug}/${categorie}/`;
  else if(brandSlug && modelSlug) url += `/${brandSlug}/${modelSlug}/`;
  else if(brandSlug) url += `/${brandSlug}/`;
  if(AUTODOC_AFILIAT !== 'AFILIAT_ID') url += `?aff=${AUTODOC_AFILIAT}`;
  return url;
}

function initPiese() { renderPieseCarTabs(); }

function renderPieseCarTabs() {
  const tabsEl = document.getElementById('piese-car-tabs');
  if(!tabsEl) return;
  if(!cars || !cars.length) {
    tabsEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--t3)"><div style="font-size:32px;margin-bottom:8px">🚗</div><div>Nu ai mașini în garaj. <button class="btn btn-ghost btn-sm" onclick="goTo('garaj')">Adaugă o mașină</button></div></div>`;
    return;
  }
  if(!window._pieseCarId || !cars.find(c=>c.id==window._pieseCarId)) window._pieseCarId = cars[0].id;

  tabsEl.innerHTML = cars.map(c => {
    const isActive = String(c.id) === String(window._pieseCarId);
    return `<button onclick="pieseSelectCar(${c.id})" style="
      display:flex;align-items:center;gap:10px;padding:10px 16px;
      border-radius:12px;border:2px solid ${isActive?'var(--accent)':'var(--b2)'};
      background:${isActive?'rgba(79,125,255,0.12)':'var(--s2)'};
      cursor:pointer;flex-shrink:0;transition:all 0.15s;white-space:nowrap;min-width:140px">
      <span style="font-size:26px;line-height:1">🚗</span>
      <div style="text-align:left;flex:1">
        <div style="font-weight:700;font-size:13px;color:${isActive?'var(--accent)':'var(--t1)'}">${c.plate}</div>
        <div style="font-size:10px;color:var(--t3);margin-top:1px">${c.brand} ${c.model} ${c.year||''}</div>
      </div>
    </button>`;
  }).join('');

  renderPieseGrid();
}

function pieseSelectCar(carId) {
  window._pieseCarId = carId;
  renderPieseCarTabs();
}

function renderPieseGrid() {
  const el = document.getElementById('piese-grid');
  const headerEl = document.getElementById('piese-car-header');
  if(!el) return;
  const car = cars.find(c=>c.id==window._pieseCarId);
  if(!car) return;

  if(headerEl) {
    headerEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;padding:16px;background:linear-gradient(135deg,rgba(79,125,255,0.1),rgba(124,92,252,0.06));border:1px solid rgba(79,125,255,0.2);border-radius:14px;margin-bottom:16px">
        <div style="font-size:36px">🚗</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:16px;color:var(--t1)">${car.brand} ${car.model} ${car.year||''}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">${car.plate}${car.vin?' · VIN: '+car.vin:''}${car.fuel?' · '+car.fuel:''}</div>
          <div style="font-size:12px;color:var(--accent);margin-top:4px;font-weight:600">📍 ${car.km?Number(car.km).toLocaleString()+' km actuali':'Km nespecificați'}</div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div style="background:rgba(0,200,100,0.12);border:1px solid rgba(0,200,100,0.25);color:var(--green);font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px">✓ Mașina ta</div>
          <button onclick="pieseResetConfig('${car.id}')" style="background:none;border:none;color:var(--t3);font-size:10px;cursor:pointer;text-decoration:underline">Resetează intervale</button>
        </div>
      </div>`;
  }

  const km = parseInt(car.km || 0);
  const cfg = getPieseConfig(car.id);

  const categoriiCalc = CATEGORII_PIESE.map(cat => {
    const catCfg = cfg[cat.id] || {};
    const interval = catCfg.interval || cat.kmDefault;
    const ultimaKm = catCfg.ultimaKm ? parseInt(catCfg.ultimaKm) : null;
    const ultimaData = catCfg.ultimaData || null;

    let urgenta = 0, kmRamasi = null, pct = 0;
    if(interval > 0 && km > 0) {
      const bazaKm = ultimaKm !== null ? ultimaKm : 0;
      const parcursi = km - bazaKm;
      kmRamasi = interval - parcursi;
      pct = Math.min(100, Math.round(parcursi / interval * 100));
      if(kmRamasi <= 0) urgenta = 2;
      else if(kmRamasi <= interval * 0.2) urgenta = 1;
    }
    return { ...cat, interval, ultimaKm, ultimaData, urgenta, kmRamasi, pct };
  }).sort((a,b) => b.urgenta - a.urgenta || a.priority - b.priority);

  const scadente = categoriiCalc.filter(c=>c.urgenta===2).length;
  const curand = categoriiCalc.filter(c=>c.urgenta===1).length;

  el.innerHTML = `
    ${(scadente||curand) ? `
    <div style="background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.2);border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
      <span style="font-size:20px">💡</span>
      <div style="font-size:13px;color:var(--t2)">
        ${scadente?`<strong style="color:var(--red)">${scadente} scadent${scadente===1?'':'e'}</strong> `:''}
        ${curand?`<strong style="color:var(--amber)">${curand} în curând</strong> `:''}
        pentru ${car.brand} ${car.model} la ${km.toLocaleString()} km
        ${!km?'<span style="color:var(--t3)"> — adaugă km mașinii pentru calcule precise</span>':''}
      </div>
    </div>` : km?`
    <div style="background:rgba(0,200,100,0.06);border:1px solid rgba(0,200,100,0.15);border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
      <span style="font-size:20px">✅</span>
      <div style="font-size:13px;color:var(--t2)">Totul în regulă pentru ${car.brand} ${car.model} la ${km.toLocaleString()} km</div>
    </div>`:''}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px">
      ${categoriiCalc.map(cat => {
        if(cat.id==='accesorii') {
          const url = buildAutodocUrl(car.brand, car.model, cat.slug);
          return `<div onclick="deschidePiesa('${url}','${cat.label}','${car.brand} ${car.model}')" style="
            position:relative;background:var(--s2);border-radius:14px;padding:16px;
            cursor:pointer;border:1.5px solid var(--b2);transition:all 0.15s;text-align:center"
            onmouseover="this.style.borderColor='${cat.color}'" onmouseout="this.style.borderColor='var(--b2)'">
            <div style="font-size:28px;margin-bottom:6px">${cat.icon}</div>
            <div style="font-weight:700;font-size:12px;color:var(--t1);margin-bottom:3px">${cat.label}</div>
            <div style="font-size:10px;color:var(--t3)">Vezi pe AutoDoc →</div>
          </div>`;
        }

        const badgeHtml = cat.urgenta===2
          ? `<div style="position:absolute;top:8px;left:8px;background:var(--red);color:#fff;font-size:9px;font-weight:800;padding:2px 7px;border-radius:6px">SCADENT</div>`
          : cat.urgenta===1
          ? `<div style="position:absolute;top:8px;left:8px;background:var(--amber);color:#000;font-size:9px;font-weight:800;padding:2px 7px;border-radius:6px">CURÂND</div>`
          : cat.ultimaKm
          ? `<div style="position:absolute;top:8px;left:8px;background:var(--green);color:#fff;font-size:9px;font-weight:800;padding:2px 7px;border-radius:6px">OK</div>`
          : '';

        const barColor = cat.urgenta===2?'var(--red)':cat.urgenta===1?'var(--amber)':'var(--green)';
        const barHtml = cat.interval>0 ? `
          <div style="background:var(--s3);border-radius:3px;height:4px;overflow:hidden;margin:6px 0 4px">
            <div style="width:${cat.pct}%;height:100%;background:${barColor};border-radius:3px;transition:width 0.4s"></div>
          </div>
          <div style="font-size:9px;color:${cat.urgenta>0?barColor:'var(--t3)'};font-weight:600">
            ${cat.kmRamasi!==null?(cat.kmRamasi<=0?`⛔ Depășit cu ${Math.abs(cat.kmRamasi).toLocaleString()} km`:`${cat.kmRamasi.toLocaleString()} km rămași`):'Interval: '+cat.interval.toLocaleString()+' km'}
          </div>` : '';

        const ultimaInfo = cat.ultimaKm||cat.ultimaData ? `
          <div style="font-size:9px;color:var(--t3);margin-top:3px">
            ${cat.ultimaKm?'La: '+Number(cat.ultimaKm).toLocaleString()+' km':''}
            ${cat.ultimaData?' · '+cat.ultimaData:''}
          </div>` : `<div style="font-size:9px;color:var(--t3);margin-top:3px">Neinregistrat</div>`;

        const url = buildAutodocUrl(car.brand, car.model, cat.slug);
        return `
          <div style="position:relative;background:var(--s2);border-radius:14px;padding:14px;
            border:1.5px solid ${cat.urgenta===2?'rgba(255,71,87,0.3)':cat.urgenta===1?'rgba(240,180,41,0.3)':'var(--b2)'};transition:all 0.15s">
            ${badgeHtml}
            <!-- Buton configurare -->
            <button onclick="event.stopPropagation();deschideConfigPiesa('${car.id}','${cat.id}')" style="
              position:absolute;top:8px;right:8px;background:var(--s3);border:none;
              color:var(--t3);font-size:12px;width:22px;height:22px;border-radius:6px;
              cursor:pointer;display:flex;align-items:center;justify-content:center" title="Configurează intervalul">⚙️</button>
            <div style="text-align:center;margin-bottom:8px;margin-top:4px">
              <div style="font-size:26px;margin-bottom:4px">${cat.icon}</div>
              <div style="font-weight:700;font-size:12px;color:var(--t1)">${cat.label}</div>
            </div>
            ${barHtml}
            ${ultimaInfo}
            <button onclick="deschidePiesa('${url}','${cat.label}','${car.brand} ${car.model}')" style="
              width:100%;margin-top:8px;padding:6px;background:rgba(79,125,255,0.1);
              border:1px solid rgba(79,125,255,0.2);border-radius:8px;color:var(--accent);
              font-size:10px;font-weight:700;cursor:pointer">
              🛒 AutoDoc →
            </button>
          </div>`;
      }).join('')}
    </div>

    <div style="margin-top:16px;padding:12px 16px;background:var(--s2);border-radius:12px;display:flex;gap:10px;align-items:flex-start">
      <span style="font-size:18px;flex-shrink:0">🔍</span>
      <div style="font-size:11px;color:var(--t3);line-height:1.5">
        AutoDoc verifică compatibilitatea pieselor cu <strong>${car.brand} ${car.model} ${car.year||''}</strong>.
        ${car.vin?`VIN: <strong>${car.vin}</strong> — folosește-l pe AutoDoc pentru precizie maximă.`:'Adaugă VIN-ul în Garaj pentru filtrare precisă.'}
        <br>Apasă ⚙️ pe orice piesă pentru a seta intervalul și data ultimei schimbări.
      </div>
    </div>`;
}

// ── Modal configurare piesă ──
function deschideConfigPiesa(carId, catId) {
  const cat = CATEGORII_PIESE.find(c=>c.id===catId);
  const car = cars.find(c=>c.id==carId);
  if(!cat||!car) return;
  const catCfg = getCatConfig(carId, catId);
  const intervalCurent = catCfg.interval || cat.kmDefault;
  const ultimaKm = catCfg.ultimaKm || '';
  const ultimaData = catCfg.ultimaData || '';

  const optionsHtml = KM_OPTIONS.map(k =>
    `<option value="${k}" ${k===intervalCurent?'selected':''}>${k.toLocaleString()} km</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:0';
  overlay.innerHTML = `
    <div style="background:var(--s1);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div>
          <div style="font-size:22px;margin-bottom:2px">${cat.icon} ${cat.label}</div>
          <div style="font-size:12px;color:var(--t3)">${car.brand} ${car.model} ${car.year||''} · ${car.plate}</div>
        </div>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:var(--s2);border:none;color:var(--t2);font-size:20px;width:32px;height:32px;border-radius:50%;cursor:pointer">×</button>
      </div>

      <!-- Interval -->
      <div class="fg">
        <label class="fl">⏱️ Interval schimbare</label>
        <select class="fi" id="cfg-interval-sel">
          ${optionsHtml}
          <option value="custom" ${!KM_OPTIONS.includes(intervalCurent)?'selected':''}>Altul (personalizat)</option>
        </select>
        <div id="cfg-interval-custom-wrap" style="display:${!KM_OPTIONS.includes(intervalCurent)?'block':'none'};margin-top:8px">
          <input class="fi" id="cfg-interval-custom" type="number" placeholder="ex: 15000"
            value="${!KM_OPTIONS.includes(intervalCurent)?intervalCurent:''}" style="margin:0">
        </div>
      </div>

      <!-- Ultima schimbare - km -->
      <div class="fr" style="margin-top:4px">
        <div class="fg" style="margin:0">
          <label class="fl">📍 Ultima schimbare (km)</label>
          <input class="fi" id="cfg-ultima-km" type="number" placeholder="ex: 245000" value="${ultimaKm}"
            oninput="cfgValidateKm(this,'${car.km||0}')">
          <div id="cfg-km-hint" style="font-size:11px;margin-top:3px"></div>
        </div>
        <div class="fg" style="margin:0">
          <label class="fl">📅 Data ultimei schimbări</label>
          <input class="fi" id="cfg-ultima-data" type="date" value="${ultimaData}">
        </div>
      </div>

      <!-- Preview calcul -->
      <div id="cfg-preview" style="margin-top:12px;padding:12px;background:var(--s2);border-radius:10px;font-size:12px;color:var(--t2)">
        Completează datele pentru a vedea calculul.
      </div>

      <div style="display:flex;gap:8px;margin-top:16px">
        <button onclick="cfgSterge('${carId}','${catId}',this)" class="btn btn-ghost btn-sm" style="flex:1;color:var(--t3)">🗑 Șterge date</button>
        <button onclick="cfgSalveaza('${carId}','${catId}',this.closest('div[style*=fixed]'))" class="btn btn-primary btn-sm" style="flex:2">💾 Salvează</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });

  // Listener select interval
  const sel = overlay.querySelector('#cfg-interval-sel');
  const customWrap = overlay.querySelector('#cfg-interval-custom-wrap');
  sel.addEventListener('change', () => {
    customWrap.style.display = sel.value==='custom' ? 'block' : 'none';
    cfgUpdatePreview(car.km, cat.kmDefault);
  });

  // Listeners pentru preview live
  ['cfg-ultima-km','cfg-ultima-data','cfg-interval-custom'].forEach(id => {
    overlay.querySelector('#'+id)?.addEventListener('input', () => cfgUpdatePreview(car.km, cat.kmDefault));
  });

  // Preview inițial
  cfgUpdatePreview(car.km, cat.kmDefault);
}

function cfgValidateKm(input, carKm) {
  const km = parseInt(input.value);
  const hint = document.getElementById('cfg-km-hint');
  if(!hint||!km) { if(hint) hint.innerHTML=''; return; }
  if(carKm && km > parseInt(carKm)) {
    hint.innerHTML = `<span style="color:var(--amber)">⚠️ Mai mare decât km actuali ai mașinii (${Number(carKm).toLocaleString()} km)</span>`;
  } else {
    hint.innerHTML = `<span style="color:var(--green)">✓ OK</span>`;
  }
  cfgUpdatePreview(carKm, 0);
}

function cfgUpdatePreview(carKm, defaultKm) {
  const prev = document.getElementById('cfg-preview');
  if(!prev) return;
  const selEl = document.getElementById('cfg-interval-sel');
  const customEl = document.getElementById('cfg-interval-custom');
  const ultimaKmEl = document.getElementById('cfg-ultima-km');
  if(!selEl) return;

  let interval = selEl.value==='custom'
    ? parseInt(customEl?.value||defaultKm)
    : parseInt(selEl.value||defaultKm);
  const ultimaKm = parseInt(ultimaKmEl?.value||0);
  const km = parseInt(carKm||0);

  if(!interval||interval<=0) { prev.innerHTML='Setează intervalul.'; return; }
  if(!km) { prev.innerHTML=`Interval: <strong>${interval.toLocaleString()} km</strong>. Adaugă km mașinii pentru calcul complet.`; return; }

  const parcursi = ultimaKm ? km - ultimaKm : km;
  const ramasi = interval - parcursi;
  const pct = Math.min(100,Math.round(parcursi/interval*100));
  const color = ramasi<=0?'var(--red)':ramasi<=interval*0.2?'var(--amber)':'var(--green)';

  prev.innerHTML = `
    <div style="margin-bottom:8px;font-weight:600">
      ${ramasi<=0
        ? `<span style="color:var(--red)">⛔ Scadent — depășit cu ${Math.abs(ramasi).toLocaleString()} km</span>`
        : `<span style="color:${color}">${ramasi<=interval*0.2?'⚠️':'✅'} Mai sunt ${ramasi.toLocaleString()} km până la schimbare</span>`}
    </div>
    <div style="background:var(--s3);border-radius:4px;height:6px;overflow:hidden;margin-bottom:6px">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s"></div>
    </div>
    <div style="font-size:11px;color:var(--t3)">
      ${ultimaKm?`Ultima schimbare: ${ultimaKm.toLocaleString()} km · `:''}
      Km actuali: ${km.toLocaleString()} km ·
      Interval: ${interval.toLocaleString()} km ·
      Utilizat: ${pct}%
    </div>`;
}

function cfgSalveaza(carId, catId, overlayEl) {
  const selEl = document.getElementById('cfg-interval-sel');
  const customEl = document.getElementById('cfg-interval-custom');
  const ultimaKmEl = document.getElementById('cfg-ultima-km');
  const ultimaDataEl = document.getElementById('cfg-ultima-data');

  const cat = CATEGORII_PIESE.find(c=>c.id===catId);
  let interval = selEl?.value==='custom'
    ? parseInt(customEl?.value||cat?.kmDefault||10000)
    : parseInt(selEl?.value||cat?.kmDefault||10000);

  if(!interval||interval<1000) { showNotification('❌','Intervalul trebuie să fie cel puțin 1.000 km.'); return; }

  saveCatConfig(carId, catId, {
    interval,
    ultimaKm: ultimaKmEl?.value ? parseInt(ultimaKmEl.value) : null,
    ultimaData: ultimaDataEl?.value || null,
  });

  if(overlayEl) overlayEl.remove();
  renderPieseGrid();
  showNotification('✅ Salvat!', `Interval ${interval.toLocaleString()} km setat pentru ${CATEGORII_PIESE.find(c=>c.id===catId)?.label}`);
}

function cfgSterge(carId, catId, btn) {
  btn.textContent='Sigur?';
  btn.onclick = () => {
    saveCatConfig(carId, catId, { interval:null, ultimaKm:null, ultimaData:null });
    btn.closest('div[style*=fixed]')?.remove();
    renderPieseGrid();
    showNotification('🗑 Resetat', 'S-au șters datele pentru această piesă.');
  };
}

function pieseResetConfig(carId) {
  if(!confirm('Ștergi toate intervalele personalizate pentru această mașină?')) return;
  localStorage.removeItem('piese_cfg_'+carId);
  renderPieseGrid();
  showNotification('🔄 Resetat', 'Toate intervalele au revenit la valorile implicite.');
}

function deschidePiesa(url, categorie, masina) {
  const stats = JSON.parse(localStorage.getItem('piese_clicks')||'[]');
  stats.unshift({ url, categorie, masina, data: new Date().toISOString() });
  localStorage.setItem('piese_clicks', JSON.stringify(stats.slice(0,50)));
  window.open(url, '_blank');
  showNotification('🛒 '+categorie, 'Se deschide AutoDoc pentru '+masina);
}

function pieseCautaLiber() {
  const q = document.getElementById('piese-search-input')?.value?.trim();
  if(!q) return;
  const car = cars.find(c=>c.id==window._pieseCarId);
  const brandSlug = car?(BRAND_SLUG[car.brand]||car.brand?.toLowerCase()):'';
  const modelSlug = car?getModelSlug(car.model):'';
  let url = AUTODOC_BASE;
  if(brandSlug&&modelSlug) url += `/${brandSlug}/${modelSlug}/?search=${encodeURIComponent(q)}`;
  else url += `/cautare/?query=${encodeURIComponent(q)}`;
  if(AUTODOC_AFILIAT!=='AFILIAT_ID') url += `&aff=${AUTODOC_AFILIAT}`;
  window.open(url, '_blank');
}
