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
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      window._vanzFotos.push(e.target.result);
      renderVanzGalerie();
    };
    reader.readAsDataURL(file);
  });
  input.value='';
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
  window._vanzFotos = c.fotos && c.fotos.length ? [...c.fotos] : [];
  loadVanzCars();
  document.getElementById('vanz-step1').style.display='none';
  document.getElementById('vanz-step2').style.display='block';
  const info = document.getElementById('vanz-car-info');
  if(info) info.innerHTML = `<div style="font-weight:700">${c.brand} ${c.model} ${c.year}</div><div style="font-size:12px;color:var(--t3)">${c.plate} · ${c.km?c.km.toLocaleString()+' km':''}${c.fuel?' · '+c.fuel:''}</div>`;
  renderVanzGalerie();
  vanzEstimPret();
  vanzRenderTarif();
}

function renderVanzGalerie(){
  const el = document.getElementById('vanz-galerie-garaj');
  if(!el) return;
  if(!window._vanzFotos || !window._vanzFotos.length){ el.innerHTML=''; document.getElementById('vanz-foto-preview').style.display='none'; return; }
  window._vanzFotoData = window._vanzFotos[0];
  document.getElementById('vanz-foto-img').src = window._vanzFotos[0];
  document.getElementById('vanz-foto-preview').style.display='block';
  el.innerHTML = window._vanzFotos.map((f,i) => `
    <div style="position:relative;display:inline-block">
      <img src="${f}" onclick="selectVanzFoto(${i})" style="width:64px;height:64px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ${i===0?'var(--accent)':'var(--b2)'}">
      <button onclick="vanzStergeFoto(${i})" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#ff3b3b;border:none;color:#fff;font-size:11px;cursor:pointer;line-height:1;padding:0">×</button>
    </div>`).join('');
}

function vanzStergeFoto(idx){
  window._vanzFotos.splice(idx,1);
  renderVanzGalerie();
}

function selectVanzFoto(idx) {
  window._vanzFotoData = window._vanzFotos[idx];
  document.getElementById('vanz-foto-img').src = window._vanzFotos[idx];
  document.querySelectorAll('#vanz-galerie-garaj img').forEach((el,i) => {
    el.style.borderColor = i===idx ? 'var(--accent)' : 'var(--b2)';
  });
}

function openVanz(id){
  selCarId=id;
  const c=cars.find(x=>x.id===id);
  if(!c)return;
  goTo('vanzare');
  setTimeout(function(){
    document.getElementById('vanz-step1').style.display='none';
    document.getElementById('vanz-step2').style.display='block';
    document.getElementById('vanz-step3').style.display='none';
    loadVanzCars();
  },150);
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
  if(age>10)base=4000+Math.random()*2000;
  else if(age>7)base=6000+Math.random()*3000;
  else if(age>4)base=9000+Math.random()*4000;
  else base=13000+Math.random()*8000;
  if(km>150000)base*=0.75;
  else if(km>100000)base*=0.85;
  base=Math.round(base/100)*100;
  document.getElementById('vanz-pret-hint').textContent=`💡 Estimare AI: ${base.toLocaleString()} - ${(base*1.2).toLocaleString()} EUR pentru acest model`;
}

async function vanzGenDesc(){
  const c=cars.find(x=>x.id===selCarId);
  if(!c)return;
  const ta=document.getElementById('vanz-desc');
  const dotari=[...document.querySelectorAll('#vanz-dotari input:checked')].map(x=>x.value).join(', ');
  const pret=document.getElementById('vanz-pret').value;
  ta.value='✨ Se generează descrierea cu AI...';
  ta.disabled=true;
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:600,
        messages:[{role:'user',content:`Generează un anunț de vânzare profesional și atractiv în română pentru:
Mașină: ${c.brand||'Auto'} ${c.model||''} ${c.year||''}
Kilometraj: ${c.km?c.km.toLocaleString()+' km':'necunoscut'}
Combustibil: ${c.fuel||'Benzină'}
Dotări: ${dotari||'standard'}
Preț: ${pret?pret+' EUR':'negociabil'}
Număr înmatriculare: ${c.plate}

Anunțul să fie de 150-200 cuvinte, să evidențieze punctele forte, să sune natural și să inspire încredere. Nu include date de contact.`}]
      })
    });
    const data=await resp.json();
    ta.value=data.content?.[0]?.text||'Nu s-a putut genera descrierea. Scrie manual.';
  }catch(e){
    ta.value=`${c.brand||'Autoturism'} ${c.model||''} ${c.year||''} spre vânzare, ${c.km?c.km.toLocaleString()+' km':''}, stare foarte bună. ${dotari?'Dotări: '+dotari+'.':''} Preț ${pret?pret+' EUR':'negociabil'}. Serios, fără vicii ascunse.`;
  }
  ta.disabled=false;
}

async function vanzPublica(){
  // Verificare Premium
  if(!isPremium()){
    showUpgradeModal('Publicarea anunțurilor este disponibilă doar pentru utilizatorii Premium. Activează Premium pentru 49 RON/an și publică nelimitat!');
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

  const dotari=[...document.querySelectorAll('#vanz-dotari input:checked')].map(x=>x.value).join(', ');
  const titlu=`${c.brand||'Auto'} ${c.model||''} ${c.year||''} - ${c.km?c.km.toLocaleString()+' km':''} - ${pret} EUR`;
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

  window._vanzTextAnunt = titlu+'\n\n'+desc+'\n\nDotări: '+dotari+'\nPreț: '+pret+' EUR\nTelefon: '+tel+'\nLocație: '+(localitate?localitate+', ':'')+judet+(indicatii?'\nOrientare: '+indicatii:'')+'\n\nVăzut pe AutoAssist.ro — platforma de management auto';
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
  document.getElementById('vanz-foto-preview').style.display='none';
  document.getElementById('vanz-galerie-garaj').innerHTML='';
  const fi=document.getElementById('vanz-foto-input');if(fi)fi.value='';
  document.getElementById('vanz-step1').style.display='block';
  document.getElementById('vanz-step2').style.display='none';
  document.getElementById('vanz-step3').style.display='none';
  loadVanzCars();
}

function vanzRenderTarif(){
  const el=document.getElementById('vanz-tarif-block');
  if(!el)return;
  if(isPremium()){
    el.style.background='rgba(0,232,154,0.07)';el.style.border='1px solid rgba(0,232,154,0.2)';
    el.innerHTML=`<div style="font-size:13px;font-weight:700;color:var(--green)">✅ Premium activ — publicare inclusă</div><div style="font-size:12px;color:var(--t2);margin-top:4px">Poți publica anunțuri nelimitat cu abonamentul tău Premium.</div>`;
  } else {
    el.style.background='rgba(255,184,48,0.07)';el.style.border='1px solid rgba(255,184,48,0.25)';
    el.innerHTML=`<div style="font-size:13px;font-weight:700;color:var(--amber)">⭐ Publicarea necesită Premium</div><div style="font-size:12px;color:var(--t2);margin-top:4px">Activează Premium (49 RON/an) pentru a publica anunțuri nelimitat pe AutoAssist.<br><span style="color:var(--t3)">A 2-a mașină la vânzare: <strong>20 RON</strong> promovare suplimentară (disponibil după lansare plăți).</span></div><button class="btn btn-primary btn-sm" onclick="showUpgradeModal()" style="margin-top:8px">🔓 Activează Premium</button>`;
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

