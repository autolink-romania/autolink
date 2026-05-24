
// Localități principale per județ
const LOCALITATI = {
  'Alba':['Alba Iulia','Sebeș','Aiud','Blaj','Cugir','Ocna Mureș','Câmpeni','Zlatna','Teiuș','Abrud'],
  'Arad':['Arad','Lipova','Ineu','Curtici','Pecica','Nădlac','Chișineu-Criș','Sebiș','Pâncota'],
  'Argeș':['Pitești','Câmpulung','Curtea de Argeș','Mioveni','Costești','Ștefănești','Topoloveni','Morărești'],
  'Bacău':['Bacău','Onești','Moinești','Comănești','Slănic-Moldova','Buhuși','Dărmănești','Târgu Ocna'],
  'Bihor':['Oradea','Salonta','Beiuș','Marghita','Aleșd','Valea lui Mihai','Ștei','Nucet'],
  'Bistrița-Năsăud':['Bistrița','Năsăud','Beclean','Sângeorz-Băi'],
  'Botoșani':['Botoșani','Dorohoi','Darabani','Săveni','Flămânzi','Bucecea'],
  'Brăila':['Brăila','Ianca','Făurei'],
  'Brașov':['Brașov','Făgăraș','Săcele','Codlea','Zărnești','Râșnov','Predeal','Ghimbav','Rupea','Victoria'],
  'Buzău':['Buzău','Râmnicu Sărat','Nehoiu','Pogoanele'],
  'Călărași':['Călărași','Oltenița','Budești','Lehliu Gară','Fundulea'],
  'Caraș-Severin':['Reșița','Caransebeș','Bocșa','Oravița','Băile Herculane','Moldova Nouă','Anina'],
  'Cluj':['Cluj-Napoca','Turda','Câmpia Turzii','Dej','Gherla','Huedin','Florești','Baciu','Apahida'],
  'Constanța':['Constanța','Mangalia','Medgidia','Cernavodă','Năvodari','Eforie','Techirghiol','Ovidiu','Murfatlar'],
  'Covasna':['Sfântu Gheorghe','Târgu Secuiesc','Covasna','Întorsura Buzăului'],
  'Dâmbovița':['Târgoviște','Moreni','Pucioasa','Găești','Titu','Fieni'],
  'Dolj':['Craiova','Băilești','Calafat','Segarcea','Filiaș','Bechet'],
  'Galați':['Galați','Tecuci','Târgu Bujor','Berești'],
  'Giurgiu':['Giurgiu','Bolintin-Vale','Mihăilești'],
  'Gorj':['Târgu Jiu','Motru','Rovinari','Târgu Cărbunești','Novaci','Turceni'],
  'Harghita':['Miercurea Ciuc','Odorheiu Secuiesc','Gheorgheni','Toplița','Cristuru Secuiesc','Bălan','Vlăhița'],
  'Hunedoara':['Deva','Hunedoara','Petroșani','Lupeni','Vulcan','Orăștie','Brad','Simeria','Uricani','Petrila'],
  'Ialomița':['Slobozia','Fetești','Urziceni','Țăndărei','Amara'],
  'Iași':['Iași','Pașcani','Hârlău','Târgu Frumos','Podu Iloaiei'],
  'Ilfov':['Voluntari','Pantelimon','Buftea','Popești-Leordeni','Bragadiru','Chitila','Otopeni','Măgurele','Jilava','Tunari'],
  'Maramureș':['Baia Mare','Sighetu Marmației','Borșa','Vișeu de Sus','Câmpulung la Tisa','Seini','Tăuții-Măgherăuș'],
  'Mehedinți':['Drobeta-Turnu Severin','Orșova','Strehaia','Vânju Mare'],
  'Mureș':['Târgu Mureș','Sighișoara','Reghin','Târnăveni','Luduș','Sovata'],
  'Neamț':['Piatra Neamț','Roman','Târgu Neamț','Bicaz','Roznov'],
  'Olt':['Slatina','Caracal','Balș','Scornicești','Corabia','Drăgănești-Olt'],
  'Prahova':['Ploiești','Câmpina','Sinaia','Bușteni','Azuga','Băicoi','Boldești-Scăieni','Breaza','Mizil','Urlați','Vălenii de Munte'],
  'Sălaj':['Zalău','Șimleul Silvaniei','Jibou','Cehu Silvaniei'],
  'Satu Mare':['Satu Mare','Carei','Negrești-Oaș','Tășnad'],
  'Sibiu':['Sibiu','Mediaș','Cisnădie','Copșa Mică','Dumbrăveni','Avrig','Ocna Sibiului','Agnita'],
  'Suceava':['Suceava','Fălticeni','Rădăuți','Câmpulung Moldovenesc','Vatra Dornei','Gura Humorului','Siret'],
  'Teleorman':['Alexandria','Roșiori de Vede','Turnu Măgurele','Zimnicea','Videle'],
  'Timiș':['Timișoara','Lugoj','Sânnicolau Mare','Jimbolia','Deta','Buziaș','Recaș'],
  'Tulcea':['Tulcea','Babadag','Măcin','Sulina','Isaccea'],
  'Vâlcea':['Râmnicu Vâlcea','Drăgășani','Băile Olănești','Băile Govora','Horezu','Călimănești'],
  'Vaslui':['Vaslui','Bârlad','Huși','Negrești'],
  'Vrancea':['Focșani','Adjud','Mărășești','Panciu','Odobești'],
  'București':['Sector 1','Sector 2','Sector 3','Sector 4','Sector 5','Sector 6']
};

function vanzUpdateLocalitati(){
  const judet = document.getElementById('vanz-judet').value;
  const sel = document.getElementById('vanz-localitate');
  if(!sel) return;
  const lista = LOCALITATI[judet] || [];
  if(!lista.length){
    sel.innerHTML='<option value="">Selectează mai întâi județul...</option>';
    return;
  }
  sel.innerHTML = '<option value="">Selectează localitatea...</option>' +
    lista.map(l=>`<option>${l}</option>`).join('');
}

// ═══ CV ═══
function deschideCV(){
  const v=(document.getElementById('cv-in')||{}).value||'';
  const base='https://www.carvertical.com/ro/getting-started?vin='+encodeURIComponent(v)+'&utm_source=autoassist&utm_medium=referral&promo=AUTOASSIST20';
  window.open(base,'_blank');
  showNotification('🔗 CarVertical -20%!','Reducere aplicată automat prin AutoAssist!');
}
function cumpRaport(){alert('✅ Raport Verificare SH — 10 RON\n\nRedirecționare spre plată securizată...\nRaportul PDF complet este trimis instant pe email!\n\n🔧 AutoAssist — Mecanicul tău din buzunar!');}

// ═══ VANZARE ═══
function vanzFotoPreview(input){
  const files = Array.from(input.files);
  if(!files.length) return;
  if(!window._vanzFotos) window._vanzFotos = [];
  const slot = parseInt(input.dataset.slot ?? window._vanzFotos.findIndex(f=>!f));
  const startSlot = isNaN(slot) || slot < 0 ? window._vanzFotos.length : slot;
  files.slice(0, 9 - startSlot).forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      window._vanzFotos[startSlot + i] = e.target.result;
      _vanzSaveFotos();
      renderVanzGalerie();
    };
    reader.readAsDataURL(file);
  });
  input.value='';
  input.dataset.slot='';
}

function loadVanzCars(){
  const el = document.getElementById('vanz-c');
  if(!el) return;
  if(!cars || !cars.length){
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--t3)">Nu ai mașini în garaj. Adaugă o mașină mai întâi.</div>';
    return;
  }
  el.innerHTML = cars.map(c => `
    <div onclick="selectVanzCar(${c.id})" style="display:flex;align-items:center;gap:12px;padding:14px;border:2px solid ${selCarId===c.id?'var(--accent)':'var(--b2)'};border-radius:12px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;background:${selCarId===c.id?'rgba(79,125,255,0.08)':'var(--s2)'}">
      <div style="font-size:28px">🚗</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:15px">${c.brand||''} ${c.model||''} ${c.year||''}</div>
        <div style="font-size:12px;color:var(--t3)">${c.plate} · ${c.km?c.km.toLocaleString()+' km':'- km'}</div>
      </div>
      <div style="font-size:20px">${selCarId===c.id?'✅':''}</div>
    </div>`).join('');
}

// Array global cu pozele selectate pentru anunț
window._vanzFotos = [];

function selectVanzCar(id){
  selCarId = id;
  const c = cars.find(x=>x.id===id);
  if(!c) return;

  // Show/hide steps PRIMA DATĂ
  document.getElementById('vanz-step1').style.display='none';
  document.getElementById('vanz-step2').style.display='block';
  document.getElementById('vanz-step3').style.display='none';

  // Poze
  const _savedFotos = _vanzLoadFotos();
  window._vanzFotos = c.fotos && c.fotos.length ? [...c.fotos] : (_savedFotos.length ? _savedFotos : []);

  // Deblocheaza toate campurile
  document.querySelectorAll('#vanz-step2 input, #vanz-step2 textarea, #vanz-step2 select').forEach(el=>el.disabled=false);

  // Precompletare date masina (campuri editabile)
  const _set=(id,val)=>{const el=document.getElementById(id);if(el&&(val||val===0))el.value=val;};
  _set('vanz-brand', c.brand);
  _set('vanz-model', c.model);
  _set('vanz-an', c.year);
  _set('vanz-km', c.km);
  // Detalii tehnice - campurile corecte din garaj
  _set('vanz-culoare', c.color||c.culoare);
  _set('vanz-combustibil', c.fuel||c.combustibil);
  _set('vanz-motor', c.engine||c.motor);
  _set('vanz-putere', c.power||c.putere);
  _set('vanz-vin', c.vin);
  _set('vanz-pret', c.pret_vanzare);
  const cutieEl=document.getElementById('vanz-cutie');
  if(cutieEl&&(c.cutie||c.transmission)) cutieEl.value=c.cutie||c.transmission;

  // Precompletare judet + localitate
  const judetEl=document.getElementById('vanz-judet');
  if(judetEl && c.judet) {
    judetEl.value = c.judet;
    vanzUpdateLocalitati();
    setTimeout(()=>{
      const loc=document.getElementById('vanz-localitate');
      if(loc && c.localitate) loc.value=c.localitate;
    },60);
  }

  renderVanzGalerie();
  vanzEstimPret();
  setTimeout(()=>{ try{vanzRenderTarif();}catch(e){} }, 150);
}

function renderVanzGalerie(){
  const el = document.getElementById('vanz-galerie-garaj');
  if(!el) return;
  if(!window._vanzFotos) window._vanzFotos = [];
  const MAX = 9;
  el.innerHTML = Array.from({length:MAX}).map((_, i) => {
    const f = window._vanzFotos[i];
    return f
      ? `<div style="position:relative;height:90px;border-radius:8px;overflow:hidden">
          <img src="${f}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="vanzLightbox(${i})">
          <button onclick="vanzStergeFoto(${i})" style="position:absolute;top:3px;right:3px;background:rgba(0,0,0,0.75);border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
        </div>`
      : `<div style="height:90px;background:var(--s2);border:2px dashed var(--b2);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--t3);transition:border-color 0.15s" onclick="document.getElementById('vanz-foto-input').dataset.slot='${i}';document.getElementById('vanz-foto-input').click()" onmouseover="this.style.borderColor='rgba(79,125,255,0.5)'" onmouseout="this.style.borderColor='var(--b2)'">
          <span style="font-size:28px;line-height:1">+</span>
          <span style="font-size:10px;margin-top:2px">Foto ${i+1}</span>
        </div>`;
  }).join('');
  if(window._vanzFotos[0]) window._vanzFotoData = window._vanzFotos[0];
}

function vanzLightbox(startIdx){
  const fotos = (window._vanzFotos||[]).filter(Boolean);
  if(!fotos.length) return;
  // Mapez indexul real în lista de poze existente
  const existing = [];
  (window._vanzFotos||[]).forEach((f,i)=>{ if(f) existing.push({f,i}); });
  let cur = existing.findIndex(e=>e.i===startIdx);
  if(cur<0) cur=0;

  const render = () => {
    const lb = document.getElementById('vanz-lb');
    if(!lb) return;
    lb.querySelector('#vanz-lb-img').src = existing[cur].f;
    lb.querySelector('#vanz-lb-count').textContent = `${cur+1} / ${existing.length}`;
    lb.querySelector('#vanz-lb-prev').style.opacity = cur===0?'0.3':'1';
    lb.querySelector('#vanz-lb-next').style.opacity = cur===existing.length-1?'0.3':'1';
  };

  if(!document.getElementById('vanz-lb')){
    document.body.insertAdjacentHTML('beforeend', `
      <div id="vanz-lb" style="position:fixed;inset:0;background:rgba(0,0,0,0.96);z-index:9999;display:flex;align-items:center;justify-content:center" onclick="if(event.target===this)document.getElementById('vanz-lb').remove()">
        <button onclick="document.getElementById('vanz-lb').remove()" style="position:fixed;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:22px;z-index:10001">×</button>
        <button id="vanz-lb-prev" onclick="vanzLbNav(-1)" style="position:fixed;left:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:none;color:#fff;width:52px;height:52px;border-radius:50%;cursor:pointer;font-size:28px;z-index:10001;transition:background 0.15s" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">‹</button>
        <img id="vanz-lb-img" style="max-width:calc(100vw - 140px);max-height:88vh;border-radius:10px;object-fit:contain;display:block">
        <button id="vanz-lb-next" onclick="vanzLbNav(1)" style="position:fixed;right:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:none;color:#fff;width:52px;height:52px;border-radius:50%;cursor:pointer;font-size:28px;z-index:10001;transition:background 0.15s" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">›</button>
        <div id="vanz-lb-count" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.6);font-size:14px;background:rgba(0,0,0,0.5);padding:4px 14px;border-radius:20px;z-index:10001"></div>
      </div>`);
    // Keyboard navigation
    document.getElementById('vanz-lb').addEventListener('keydown', e=>{
      if(e.key==='ArrowLeft') vanzLbNav(-1);
      if(e.key==='ArrowRight') vanzLbNav(1);
      if(e.key==='Escape') document.getElementById('vanz-lb')?.remove();
    });
  }
  window._vanzLbData = existing;
  window._vanzLbCur = cur;
  render();
}

function vanzLbNav(dir){
  const existing = window._vanzLbData||[];
  window._vanzLbCur = Math.max(0, Math.min(existing.length-1, (window._vanzLbCur||0)+dir));
  const lb = document.getElementById('vanz-lb');
  if(!lb) return;
  lb.querySelector('#vanz-lb-img').src = existing[window._vanzLbCur].f;
  lb.querySelector('#vanz-lb-count').textContent = `${window._vanzLbCur+1} / ${existing.length}`;
  lb.querySelector('#vanz-lb-prev').style.opacity = window._vanzLbCur===0?'0.3':'1';
  lb.querySelector('#vanz-lb-next').style.opacity = window._vanzLbCur===existing.length-1?'0.3':'1';
}

function vanzStergeFoto(idx){
  window._vanzFotos[idx] = null;
  _vanzSaveFotos();
  renderVanzGalerie();
}

function _vanzSaveFotos(){
  try{ localStorage.setItem('vanz_fotos_draft', JSON.stringify(window._vanzFotos||[])); }catch(e){}
}

function _vanzLoadFotos(){
  try{ return JSON.parse(localStorage.getItem('vanz_fotos_draft')||'[]'); }catch(e){ return []; }
}

function selectVanzFoto(idx) {
  window._vanzFotoData = window._vanzFotos[idx];
  document.getElementById('vanz-foto-img').src = window._vanzFotos[idx];
  document.querySelectorAll('#vanz-galerie-garaj img').forEach((el,i) => {
    el.style.borderColor = i===idx ? 'var(--accent)' : 'var(--b2)';
  });
}

function openVanz(id){
  goTo('vanzare');
  setTimeout(function(){ selectVanzCar(id); }, 200);
}

function vanzBack(){
  document.getElementById('vanz-step1').style.display='block';
  document.getElementById('vanz-step2').style.display='none';
  document.getElementById('vanz-step3').style.display='none';
}

function vanzEstimPret(){
  const c=cars.find(x=>x.id===selCarId);
  if(!c||!c.year)return;
  const age=new Date().getFullYear()-c.year;
  const km=c.km||80000;
  let base=12000;
  if(age>10) base=4500;
  else if(age>7) base=7000;
  else if(age>4) base=11000;
  else if(age>2) base=16000;
  else base=20000;
  if(km>200000) base*=0.65;
  else if(km>150000) base*=0.75;
  else if(km>100000) base*=0.85;
  else if(km<50000) base*=1.1;
  base=Math.round(base/500)*500;
  const baseMax=Math.round(base*1.15/500)*500;
  document.getElementById('vanz-pret-hint').textContent=`💡 Estimare piață: ${base.toLocaleString()} - ${baseMax.toLocaleString()} EUR`;
}

async function vanzGenDesc(){
  const c=cars.find(x=>x.id===selCarId);
  if(!c)return;
  const ta=document.getElementById('vanz-desc');
  const dotari=[...document.querySelectorAll('#vanz-dotari input:checked')].map(x=>x.value).join(', ');
  const pret=document.getElementById('vanz-pret').value;
  const localitate=(document.getElementById('vanz-localitate')||{}).value||'';
  const judet=(document.getElementById('vanz-judet')||{}).value||'';
  ta.value='✨ Se generează descrierea cu AI...';
  ta.disabled=true;
  const _brand=(document.getElementById('vanz-brand')||{}).value||c.brand||'Auto';
  const _model=(document.getElementById('vanz-model')||{}).value||c.model||'';
  const _an=(document.getElementById('vanz-an')||{}).value||c.year||'';
  const _km=(document.getElementById('vanz-km')||{}).value||c.km||'';
  const prompt=`Generează un anunț de vânzare profesional și atractiv în română pentru:
Mașină: ${_brand} ${_model} ${_an}
Kilometraj: ${_km?parseInt(_km).toLocaleString()+' km':'necunoscut'}
Combustibil: ${c.fuel||'Benzină'}
Dotări: ${dotari||'standard'}
Preț: ${pret?pret+' EUR':'negociabil'}
Locație: ${localitate?localitate+', ':''}${judet}

Anunțul să fie de 150-200 cuvinte, să evidențieze punctele forte, să sune natural și să inspire încredere. Nu include date de contact.`;
  try{
    const resp=await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/asistent',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:[{role:'user',content:prompt}],system:'Ești un expert în vânzări auto. Generezi anunțuri profesionale și atractive.'})
    });
    const data=await resp.json();
    ta.value=data.reply||data.content?.[0]?.text||'Nu s-a putut genera. Scrie manual.';
  }catch(e){
    ta.value=`${c.brand||'Autoturism'} ${c.model||''} ${c.year||''} spre vânzare, ${c.km?c.km.toLocaleString()+' km':''}, stare foarte bună. ${dotari?'Dotări: '+dotari+'.':''} Preț ${pret?pret+' EUR':'negociabil'}. Serios, fără vicii ascunse.`;
  }finally{
    ta.disabled=false;
  }
}

async function vanzPublica(){
  // Verificare Premium
  if(!(typeof isPremium==='function' && isPremium())){
    showUpgradeModal('Publicarea anunțurilor este disponibilă doar pentru utilizatorii Premium. Activează Premium pentru 49 RON/an și publică nelimitat!');
    return;
  }
  // Dacă e a 2-a mașină (20 RON), momentan notificăm că plata vine
  if(window._vanzCostPublicare===20){
    showNotification('💳 Plată necesară','Sistemul de plăți online (20 RON) va fi disponibil în curând. Anunțul va fi publicat după implementare.');
    return;
  }
  const c=cars.find(x=>x.id===selCarId);
  if(!c)return;
  const pret=document.getElementById('vanz-pret').value;
  const desc=document.getElementById('vanz-desc').value;
  const tel=document.getElementById('vanz-tel').value;
  const judet=document.getElementById('vanz-judet').value;
  const localitate=(document.getElementById('vanz-localitate')||{}).value||'';
  const indicatii=(document.getElementById('vanz-indicatii')||{}).value||'';
  if(!pret){alert('Te rugăm să introduci prețul!');return;}
  if(!desc||desc.length<20){alert('Te rugăm să generezi sau să scrii o descriere!');return;}
  if(!tel){alert('Te rugăm să introduci numărul de telefon!');return;}
  if(!judet){alert('Te rugăm să selectezi județul!');return;}

  const brand=(document.getElementById('vanz-brand')||{}).value||c.brand||'Auto';
  const model=(document.getElementById('vanz-model')||{}).value||c.model||'';
  const an=(document.getElementById('vanz-an')||{}).value||c.year||'';
  const km=(document.getElementById('vanz-km')||{}).value||c.km||'';
  const dotari=[...document.querySelectorAll('#vanz-dotari input:checked')].map(x=>x.value).join(', ');
  const titlu=`${brand} ${model} ${an}${km?' - '+parseInt(km).toLocaleString()+' km':''} - ${pret} EUR`;
  const locatie = [localitate, judet].filter(Boolean).join(', ');

  const anunt={
    user_id: currentUser?.id || 'anonim',
    plate:c.plate, brand:c.brand, model:c.model, year:c.year, km:c.km,
    pret, descriere:desc, tel, judet, localitate, indicatii, dotari,
    data:new Date().toLocaleDateString('ro-RO'),
    status:'activ',
    foto:(window._vanzFotos&&window._vanzFotos.length)?window._vanzFotos[0]:null,
    fotos: window._vanzFotos||[],
    created_at: new Date().toISOString()
  };

  // Salveaza in Supabase
  if(supabaseClient && currentUser){
    try {
      const {data, error} = await supabaseClient.from('listings').insert([anunt]);
      if(error) {
        console.error('Supabase listings error:', error);
        showNotification('⚠️ Avertisment', 'Anunțul a fost salvat local dar nu în cloud: ' + error.message);
      }
    } catch(e){ console.error('Supabase save error:', e); }
  } else if(!currentUser) {
    showNotification('⚠️ Neautentificat', 'Anunțul e salvat local. Loghează-te pentru a-l publica în cloud.');
  }
  // Salveaza si local ca backup
  const anunturi=JSON.parse(localStorage.getItem('vanz_anunturi')||'[]');
  anunturi.push({...anunt, id:Date.now()});
  localStorage.setItem('vanz_anunturi',JSON.stringify(anunturi));

  document.getElementById('vanz-step2').style.display='none';
  document.getElementById('vanz-step3').style.display='block';
  document.getElementById('vanz-confirm-info').innerHTML=`
    <strong>${titlu}</strong><br>
    📍 ${judet} · 📞 ${tel}<br>
    <span style="color:var(--gold)">Promovare activă 7 zile</span>`;

  // Badge documente verificate
  const hasRCA = c.docs?.rca && new Date(c.docs.rca) > new Date();
  const hasITP = c.docs?.itp && new Date(c.docs.itp) > new Date();
  const hasVIN = c.vin;
  const badges = [
    hasRCA ? '🛡️ RCA Valid' : null,
    hasITP ? '🔬 ITP Valid' : null,
    hasVIN ? '🔍 VIN Verificabil' : null,
  ].filter(Boolean);

  document.getElementById('vanz-links').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="background:linear-gradient(135deg,rgba(0,232,154,0.12),rgba(0,232,154,0.04));border:1px solid rgba(0,232,154,0.3);border-radius:14px;padding:18px">
        <div style="font-size:15px;font-weight:800;color:var(--green);margin-bottom:6px">✅ Anunț publicat pe AutoAssist!</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:12px">Anunțul tău este activ și vizibil pentru toți utilizatorii AutoAssist România.</div>
        ${badges.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${badges.map(b=>`<span style="background:rgba(0,232,154,0.15);color:var(--green);font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid rgba(0,232,154,0.3)">${b}</span>`).join('')}</div>` : ''}
        <div style="font-size:11px;color:var(--t3)">💡 Anunțurile cu documente verificate primesc de 3x mai multe contacte</div>
      </div>

      <div style="background:var(--s2);border:1px solid var(--b2);border-radius:14px;padding:16px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">📋 Copiază anunțul</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">Poți distribui anunțul oriunde vrei — WhatsApp, Facebook, prieteni.</div>
        <button class="btn btn-ghost btn-sm btn-full" onclick="copyVanzText()">📋 Copiază textul anunțului</button>
      </div>

      <div style="background:var(--s2);border:1px solid var(--b2);border-radius:14px;padding:16px">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">👁️ Vizualizează anunțul</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">Vezi cum arată anunțul tău în marketplace-ul AutoAssist.</div>
        <button class="btn btn-primary btn-sm btn-full" onclick="goTo('vanzare');setTimeout(()=>{document.getElementById('vanz-step1').style.display='block';document.getElementById('vanz-step2').style.display='none';document.getElementById('vanz-step3').style.display='none';vanzLoadLista();},100)">🚗 Vezi marketplace AutoAssist</button>
      </div>
    </div>`;

  const culoare=(document.getElementById('vanz-culoare')||{}).value||'';
  const combustibil=(document.getElementById('vanz-combustibil')||{}).value||'';
  const motor=(document.getElementById('vanz-motor')||{}).value||'';
  const putere=(document.getElementById('vanz-putere')||{}).value||'';
  const vin=(document.getElementById('vanz-vin')||{}).value||'';
  const cutie=(document.getElementById('vanz-cutie')||{}).value||'';
  const specs=[culoare,combustibil,cutie,motor?motor+'cm³':'',putere?putere+'CP':''].filter(Boolean).join(' · ');
  window._vanzTextAnunt = titlu+'\n'+(specs?specs+'\n':'')+'\n'+desc+'\n\nDotări: '+dotari+'\nPreț: '+pret+' EUR\nTelefon: '+tel+'\nLocație: '+(localitate?localitate+', ':'')+judet+(indicatii?'\nOrientare: '+indicatii:'')+(vin?'\nVIN: '+vin:'')+'\n\nVăzut pe AutoAssist.ro — platforma de management auto';
  if(navigator.clipboard) navigator.clipboard.writeText(window._vanzTextAnunt).catch(()=>{});

  vanzLoadLista();
  loadDashVanzari();
}

function copyVanzText() {
  const text = window._vanzTextAnunt || '';
  if(navigator.clipboard) {
    navigator.clipboard.writeText(text).then(()=>showNotification('✅ Copiat!','Textul anunțului a fost copiat în clipboard.')).catch(()=>{});
  }
}

function vanzNouAnunt(){
  window._vanzFotoData=null;
  window._vanzFotos=[];
  localStorage.removeItem('vanz_fotos_draft');
  document.getElementById('vanz-foto-preview').style.display='none';
  document.getElementById('vanz-galerie-garaj').innerHTML='';
  const fi=document.getElementById('vanz-foto-input');if(fi)fi.value='';
  document.getElementById('vanz-step1').style.display='block';
  document.getElementById('vanz-step2').style.display='none';
  document.getElementById('vanz-step3').style.display='none';
  loadVanzCars();
}

async function vanzRenderTarif(){
  const el=document.getElementById('vanz-tarif-block');
  const btn=document.querySelector('[onclick="vanzPublica()"]');
  if(!el)return;
  const prem = isPremium();

  if(!prem){
    // Nu e premium — nu poate posta
    el.style.background='rgba(255,184,48,0.07)';el.style.border='1px solid rgba(255,184,48,0.25)';
    el.innerHTML=`<div style="font-size:13px;font-weight:700;color:var(--amber)">⭐ Publicarea necesită Premium</div>
      <div style="font-size:12px;color:var(--t2);margin-top:4px">Activează Premium (49 RON/an) pentru a publica anunțuri pe AutoAssist.</div>
      <button class="btn btn-primary btn-sm" onclick="showUpgradeModal()" style="margin-top:8px">🔓 Activează Premium — 49 RON/an</button>`;
    if(btn){btn.textContent='🔒 Necesită Premium';btn.disabled=true;btn.style.opacity='0.5';}
    return;
  }

  // E premium — verifică câte anunțuri active are
  let nrActiv=0;
  if(supabaseClient && currentUser){
    try{
      const {data}=await supabaseClient.from('listings').select('id').eq('user_id',currentUser.id).eq('status','activ');
      if(data) nrActiv=data.length;
    }catch(e){}
  }
  if(!nrActiv){
    const loc=JSON.parse(localStorage.getItem('vanz_anunturi')||'[]');
    nrActiv=loc.filter(a=>a.status==='activ').length;
  }

  if(nrActiv===0){
    // Prima mașină — gratis
    el.style.background='rgba(0,232,154,0.07)';el.style.border='1px solid rgba(0,232,154,0.2)';
    el.innerHTML=`<div style="font-size:13px;font-weight:700;color:var(--green)">✅ Prima mașină — publicare GRATUITĂ</div>
      <div style="font-size:12px;color:var(--t2);margin-top:4px">Inclus în abonamentul Premium. Promovare 7 zile pe AutoAssist.ro.</div>`;
    if(btn){btn.textContent='🚀 Publică Anunțul Acum — GRATUIT';btn.disabled=false;btn.style.opacity='1';}
    window._vanzCostPublicare=0;
  } else {
    // A 2-a+ mașină — 20 RON
    el.style.background='rgba(255,184,48,0.07)';el.style.border='1px solid rgba(255,184,48,0.25)';
    el.innerHTML=`<div style="font-size:13px;font-weight:700;color:var(--amber)">💳 Promovare anunț suplimentar — 20 RON</div>
      <div style="font-size:12px;color:var(--t2);margin-top:4px">Ai deja ${nrActiv} anunț${nrActiv>1?'uri':''} activ${nrActiv>1?'e':''}. Fiecare mașină suplimentară costă <strong>20 RON</strong> — include promovare 7 zile.</div>
      <div style="font-size:11px;color:var(--t3);margin-top:4px">Plata va fi disponibilă după lansarea sistemului de plăți.</div>`;
    if(btn){btn.textContent='💳 Plătește 20 RON și Promovează';btn.disabled=false;btn.style.opacity='1';}
    window._vanzCostPublicare=20;
  }
}

async function vanzLoadLista(){
  const el=document.getElementById('vanz-lista');
  const statActiv=document.getElementById('vanz-stat-activ');
  const statTotal=document.getElementById('vanz-stat-total');

  let anunturi=[];
  if(supabaseClient && currentUser){
    try {
      const {data}=await supabaseClient
        .from('listings')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at',{ascending:false});
      if(data) anunturi=data;
    } catch(e){}
  }
  // Fallback localStorage
  if(!anunturi.length){
    anunturi=JSON.parse(localStorage.getItem('vanz_anunturi')||'[]');
  }

  if(statActiv)statActiv.textContent=anunturi.filter(a=>a.status==='activ').length;
  if(statTotal)statTotal.textContent=anunturi.length;

  if(!anunturi.length){el.innerHTML='<div style="text-align:center;padding:24px;color:var(--t3);font-size:13px">Nu ai anunțuri active momentan.</div>';return;}
  el.innerHTML=anunturi.map(a=>`
    <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
        <div style="font-size:13px;font-weight:700">${a.brand||''} ${a.model||''} ${a.year||''}</div>
        <span style="background:rgba(0,232,154,0.15);color:var(--green);font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">ACTIV</span>
      </div>
      <div style="font-size:12px;color:var(--t2)">${a.plate||''} · ${a.km?Number(a.km).toLocaleString()+' km':''}</div>
      <div style="font-size:13px;font-weight:800;color:var(--gold);margin-top:4px">${a.pret} EUR</div>
      <div style="font-size:11px;color:var(--t3);margin-top:2px">📍 ${a.judet||'România'} · ${a.data||''}</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button onclick="vanzSterge('${a.id}')" style="flex:1;font-size:11px;font-weight:700;padding:5px;background:rgba(255,59,59,0.1);color:#ff3b3b;border:none;border-radius:6px;cursor:pointer">🗑️ Șterge</button>
      </div>
    </div>`).join('');
}

async function vanzSterge(id){
  if(!confirm('Ștergi anunțul?'))return;
  if(supabaseClient && currentUser){
    try { await supabaseClient.from('listings').delete().eq('id',id).eq('user_id',currentUser.id); } catch(e){}
  }
  let anunturi=JSON.parse(localStorage.getItem('vanz_anunturi')||'[]');
  anunturi=anunturi.filter(a=>String(a.id)!==String(id));
  localStorage.setItem('vanz_anunturi',JSON.stringify(anunturi));
  vanzLoadLista();
  loadDashVanzari();
}

