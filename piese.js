// ═══ PIESE AUTO ═══
// Comision afiliat AutoDoc — înlocuiește AFILIAT_ID cu codul tău după aprobare
const AUTODOC_AFILIAT = 'AFILIAT_ID';
const AUTODOC_BASE = 'https://www.autodoc24.ro';

// Mapare brand → slug URL autodoc24.ro
const BRAND_SLUG = {
  'Audi': 'audi', 'BMW': 'bmw', 'Mercedes': 'mercedes-benz', 'Mercedes-Benz': 'mercedes-benz',
  'Volkswagen': 'volkswagen', 'VW': 'volkswagen', 'Dacia': 'dacia', 'Renault': 'renault',
  'Ford': 'ford', 'Opel': 'opel', 'Peugeot': 'peugeot', 'Citroën': 'citroen', 'Citroen': 'citroen',
  'Toyota': 'toyota', 'Honda': 'honda', 'Hyundai': 'hyundai', 'Kia': 'kia', 'KIA': 'kia',
  'Skoda': 'skoda', 'Škoda': 'skoda', 'Seat': 'seat', 'SEAT': 'seat', 'Fiat': 'fiat',
  'Volvo': 'volvo', 'Mazda': 'mazda', 'Nissan': 'nissan', 'Mitsubishi': 'mitsubishi',
  'Suzuki': 'suzuki', 'Subaru': 'subaru', 'Jeep': 'jeep', 'Alfa Romeo': 'alfa-romeo',
  'Lancia': 'lancia', 'Chrysler': 'chrysler', 'Dodge': 'dodge', 'Lexus': 'lexus',
  'Infiniti': 'infiniti', 'Jaguar': 'jaguar', 'Land Rover': 'land-rover', 'Mini': 'mini',
  'Porsche': 'porsche', 'Lamborghini': 'lamborghini', 'Ferrari': 'ferrari',
  'Chevrolet': 'chevrolet', 'Saab': 'saab', 'Lada': 'lada', 'Trabant': 'trabant',
};

// Mapare model → slug URL (pentru branduri comune)
function getModelSlug(model) {
  if(!model) return '';
  return model.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

// Categorii de piese cu icoane, slug URL și praguri km pentru sugestii
const CATEGORII_PIESE = [
  {
    id: 'filtre-ulei', label: 'Filtre ulei', icon: '🛢️',
    slug: 'filtre-ulei', color: '#f0b429',
    desc: 'Filtre ulei motor compatibile',
    kmSugerat: 10000, priority: 1
  },
  {
    id: 'filtre-aer', label: 'Filtre aer', icon: '💨',
    slug: 'filtre-aer', color: '#4f7dff',
    desc: 'Filtre aer motor și habitaclu',
    kmSugerat: 20000, priority: 2
  },
  {
    id: 'placute-frana', label: 'Plăcuțe frână', icon: '🔴',
    slug: 'placute-frana', color: '#ff4757',
    desc: 'Plăcuțe frână față și spate',
    kmSugerat: 30000, priority: 3
  },
  {
    id: 'discuri-frana', label: 'Discuri frână', icon: '⭕',
    slug: 'discuri-frana', color: '#ff6b35',
    desc: 'Discuri frână față și spate',
    kmSugerat: 60000, priority: 4
  },
  {
    id: 'ulei-motor', label: 'Ulei motor', icon: '🔧',
    slug: 'ulei-motor', color: '#ffa502',
    desc: 'Ulei motor toate vâscozitățile',
    kmSugerat: 10000, priority: 1
  },
  {
    id: 'bujii', label: 'Bujii', icon: '⚡',
    slug: 'bujii', color: '#ffb300',
    desc: 'Bujii originale și aftermarket',
    kmSugerat: 40000, priority: 5
  },
  {
    id: 'curea-distributie', label: 'Distribuție', icon: '⚙️',
    slug: 'kit-distributie', color: '#7c5cfc',
    desc: 'Kit distribuție complet',
    kmSugerat: 60000, priority: 6
  },
  {
    id: 'amortizoare', label: 'Amortizoare', icon: '🔩',
    slug: 'amortizoare', color: '#9e9e9e',
    desc: 'Amortizoare față și spate',
    kmSugerat: 80000, priority: 7
  },
  {
    id: 'baterie', label: 'Baterie auto', icon: '🔋',
    slug: 'baterie-auto', color: '#00c864',
    desc: 'Acumulatori auto',
    kmSugerat: 50000, priority: 5
  },
  {
    id: 'filtru-combustibil', label: 'Filtru combustibil', icon: '⛽',
    slug: 'filtru-combustibil', color: '#a259ff',
    desc: 'Filtre combustibil benzină/diesel',
    kmSugerat: 30000, priority: 3
  },
  {
    id: 'filtru-habitaclu', label: 'Filtru habitaclu', icon: '🌬️',
    slug: 'filtru-habitaclu', color: '#00b4d8',
    desc: 'Filtre polen / habitaclu',
    kmSugerat: 15000, priority: 2
  },
  {
    id: 'accesorii', label: 'Accesorii', icon: '🛒',
    slug: 'accesorii-auto', color: '#2ed573',
    desc: 'Accesorii și consumabile auto',
    kmSugerat: 0, priority: 9
  },
];

function buildAutodocUrl(brand, model, categorie) {
  const brandSlug = BRAND_SLUG[brand] || brand?.toLowerCase().replace(/\s+/g, '-') || '';
  const modelSlug = getModelSlug(model);
  let url = AUTODOC_BASE;
  if(brandSlug && modelSlug && categorie) {
    url += `/${brandSlug}/${modelSlug}/${categorie}/`;
  } else if(brandSlug && modelSlug) {
    url += `/${brandSlug}/${modelSlug}/`;
  } else if(brandSlug) {
    url += `/${brandSlug}/`;
  }
  // Adaugă tag afiliat dacă există
  if(AUTODOC_AFILIAT !== 'AFILIAT_ID') {
    url += `?aff=${AUTODOC_AFILIAT}`;
  }
  return url;
}

function initPiese() {
  renderPieseCarTabs();
}

function renderPieseCarTabs() {
  const tabsEl = document.getElementById('piese-car-tabs');
  if(!tabsEl) return;
  if(!cars || !cars.length) {
    tabsEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--t3)">
      <div style="font-size:32px;margin-bottom:8px">🚗</div>
      <div>Nu ai mașini în garaj. <button class="btn btn-ghost btn-sm" onclick="goTo('garaj')">Adaugă o mașină</button></div>
    </div>`;
    return;
  }

  if(!window._pieseCarId || !cars.find(c=>c.id==window._pieseCarId)) {
    window._pieseCarId = cars[0].id;
  }

  tabsEl.innerHTML = cars.map(c => {
    const isActive = String(c.id) === String(window._pieseCarId);
    return `<button onclick="pieseSelectCar(${c.id})" style="
      display:flex;align-items:center;gap:8px;padding:10px 16px;
      border-radius:12px;border:2px solid ${isActive?'var(--accent)':'var(--b2)'};
      background:${isActive?'rgba(79,125,255,0.12)':'var(--s2)'};
      cursor:pointer;flex-shrink:0;transition:all 0.15s;white-space:nowrap">
      <span style="font-size:18px">🚗</span>
      <div style="text-align:left">
        <div style="font-weight:700;font-size:13px;color:${isActive?'var(--accent)':'var(--t1)'}">${c.plate}</div>
        <div style="font-size:10px;color:var(--t3)">${c.brand} ${c.model} ${c.year||''}</div>
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

  // Header mașină
  if(headerEl) {
    const kmRamasi = car.mnt?.oilLast ? car.km - car.mnt.oilLast : null;
    headerEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;padding:16px;background:linear-gradient(135deg,rgba(79,125,255,0.1),rgba(124,92,252,0.06));border:1px solid rgba(79,125,255,0.2);border-radius:14px;margin-bottom:16px">
        <div style="font-size:36px">🚗</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:16px;color:var(--t1)">${car.brand} ${car.model} ${car.year||''}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">${car.plate}${car.vin?' · VIN: '+car.vin:''}${car.fuel?' · '+car.fuel:''}</div>
          <div style="font-size:12px;color:var(--accent);margin-top:4px;font-weight:600">📍 ${car.km?car.km.toLocaleString()+' km actuali':'Km nespecificați'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:var(--t3);margin-bottom:4px">Piese pentru</div>
          <div style="background:rgba(0,200,100,0.12);border:1px solid rgba(0,200,100,0.25);color:var(--green);font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px">✓ Mașina ta</div>
        </div>
      </div>`;
  }

  // Calculează categorii sugerate pe baza km
  const km = parseInt(car.km || 0);
  const mntList = JSON.parse(localStorage.getItem('mnt_'+car.id)||'[]');

  // Verifică ce s-a schimbat recent din jurnal
  const schimbateRecent = new Set();
  mntList.forEach(m => {
    const mKm = parseInt(m.km || 0);
    if(km - mKm < 5000) {
      if(m.tip?.toLowerCase().includes('ulei')) { schimbateRecent.add('filtre-ulei'); schimbateRecent.add('ulei-motor'); }
      if(m.tip?.toLowerCase().includes('fran')) { schimbateRecent.add('placute-frana'); schimbateRecent.add('discuri-frana'); }
      if(m.tip?.toLowerCase().includes('filtru aer')) schimbateRecent.add('filtre-aer');
      if(m.tip?.toLowerCase().includes('bujii')) schimbateRecent.add('bujii');
      if(m.tip?.toLowerCase().includes('distribu')) schimbateRecent.add('curea-distributie');
    }
  });

  // Sortează categoriile: sugerate (scadente) primele
  const categoriiCuPrioritati = CATEGORII_PIESE.map(cat => {
    let urgenta = 0;
    if(cat.kmSugerat > 0 && km > 0) {
      // Estimează când a fost ultima dată bazat pe jurnal
      const lastEntry = mntList.find(m => m.tip?.toLowerCase().includes(cat.label.toLowerCase().split(' ')[0]));
      const lastKm = lastEntry ? parseInt(lastEntry.km||0) : 0;
      const kmDeLaUltima = km - lastKm;
      if(kmDeLaUltima >= cat.kmSugerat) urgenta = 2; // depășit
      else if(kmDeLaUltima >= cat.kmSugerat * 0.8) urgenta = 1; // aproape
    }
    const proaspat = schimbateRecent.has(cat.id);
    return { ...cat, urgenta, proaspat };
  }).sort((a,b) => b.urgenta - a.urgenta || a.priority - b.priority);

  const sugerateCount = categoriiCuPrioritati.filter(c=>c.urgenta>0).length;

  el.innerHTML = `
    ${sugerateCount > 0 ? `
    <div style="background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.2);border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
      <span style="font-size:20px">💡</span>
      <div style="font-size:13px;color:var(--t2)"><strong style="color:var(--amber)">${sugerateCount} categori${sugerateCount===1?'e':'i'} recomandat${sugerateCount===1?'ă':'e'}</strong> pentru ${car.brand} ${car.model} la ${km.toLocaleString()} km</div>
    </div>` : ''}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
      ${categoriiCuPrioritati.map(cat => {
        const url = buildAutodocUrl(car.brand, car.model, cat.slug);
        const urgentLabel = cat.urgenta === 2
          ? `<div style="position:absolute;top:8px;right:8px;background:var(--red);color:#fff;font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;letter-spacing:0.5px">SCADENT</div>`
          : cat.urgenta === 1
          ? `<div style="position:absolute;top:8px;right:8px;background:var(--amber);color:#000;font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;letter-spacing:0.5px">CURÂND</div>`
          : cat.proaspat
          ? `<div style="position:absolute;top:8px;right:8px;background:var(--green);color:#fff;font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;letter-spacing:0.5px">RECENT</div>`
          : '';
        return `
          <div onclick="deschidePiesa('${url}','${cat.label}','${car.brand} ${car.model}')" style="
            position:relative;background:var(--s2);border-radius:14px;padding:16px;
            cursor:pointer;border:1.5px solid ${cat.urgenta>0?'rgba(240,180,41,0.3)':'var(--b2)'};
            transition:all 0.15s;text-align:center"
            onmouseover="this.style.borderColor='${cat.color}';this.style.background='rgba(79,125,255,0.06)'"
            onmouseout="this.style.borderColor='${cat.urgenta>0?'rgba(240,180,41,0.3)':'var(--b2)'}';this.style.background='var(--s2)'">
            ${urgentLabel}
            <div style="font-size:32px;margin-bottom:8px">${cat.icon}</div>
            <div style="font-weight:700;font-size:13px;color:var(--t1);margin-bottom:4px">${cat.label}</div>
            <div style="font-size:11px;color:var(--t3);line-height:1.3">${cat.desc}</div>
            <div style="margin-top:10px;font-size:10px;font-weight:700;color:var(--accent)">Vezi pe AutoDoc →</div>
          </div>`;
      }).join('')}
    </div>

    <!-- Info compatibilitate -->
    <div style="margin-top:20px;padding:14px 16px;background:var(--s2);border-radius:12px;display:flex;gap:12px;align-items:flex-start">
      <span style="font-size:20px;flex-shrink:0">🔍</span>
      <div>
        <div style="font-weight:700;font-size:13px;margin-bottom:4px">Compatibilitate garantată de AutoDoc</div>
        <div style="font-size:12px;color:var(--t3);line-height:1.5">
          AutoDoc verifică automat compatibilitatea pieselor cu <strong>${car.brand} ${car.model} ${car.year||''}</strong> pe site-ul lor. 
          ${car.vin?`VIN-ul mașinii tale (<strong>${car.vin}</strong>) poate fi folosit pe site pentru precizie maximă.`:'Adaugă VIN-ul în Garaj pentru filtrare și mai precisă.'}
        </div>
      </div>
    </div>

    <!-- Info afiliat -->
    <div style="margin-top:12px;padding:12px 16px;background:rgba(0,200,100,0.06);border:1px solid rgba(0,200,100,0.15);border-radius:12px;display:flex;gap:10px;align-items:center">
      <span style="font-size:18px">🤝</span>
      <div style="font-size:11px;color:var(--t3);line-height:1.5">
        AutoAssist colaborează cu AutoDoc — una din cele mai mari platforme de piese auto din Europa, cu livrare în România în 1-3 zile. Prețurile și disponibilitatea sunt gestionate direct de AutoDoc.
      </div>
    </div>`;
}

function deschidePiesa(url, categorie, masina) {
  // Tracking intern (pentru statistici viitoare)
  const stats = JSON.parse(localStorage.getItem('piese_clicks')||'[]');
  stats.unshift({ url, categorie, masina, data: new Date().toISOString() });
  localStorage.setItem('piese_clicks', JSON.stringify(stats.slice(0,50)));

  window.open(url, '_blank');
  showNotification('🛒 ' + categorie, 'Se deschide AutoDoc pentru ' + masina);
}

function pieseCautaLiber() {
  const q = document.getElementById('piese-search-input')?.value?.trim();
  if(!q) return;
  const car = cars.find(c=>c.id==window._pieseCarId);
  const brandSlug = car ? (BRAND_SLUG[car.brand] || car.brand?.toLowerCase()) : '';
  const modelSlug = car ? getModelSlug(car.model) : '';
  let url = AUTODOC_BASE;
  if(brandSlug && modelSlug) {
    url += `/${brandSlug}/${modelSlug}/?search=${encodeURIComponent(q)}`;
  } else {
    url += `/cautare/?query=${encodeURIComponent(q)}`;
  }
  if(AUTODOC_AFILIAT !== 'AFILIAT_ID') url += `&aff=${AUTODOC_AFILIAT}`;
  window.open(url, '_blank');
}
