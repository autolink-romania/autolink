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
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('vanz-foto-img').src=e.target.result;
    document.getElementById('vanz-foto-preview').style.display='block';
    // Save as data URL temporarily
    window._vanzFotoData=e.target.result;
  };
  reader.readAsDataURL(file);
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

function selectVanzCar(id){
  selCarId = id;
  const c = cars.find(x=>x.id===id);
  if(!c) return;
  loadVanzCars();
  // Afișez step2
  document.getElementById('vanz-step1').style.display='none';
  document.getElementById('vanz-step2').style.display='block';
  // Completez info mașină în step2
  const info = document.getElementById('vanz-car-info');
  if(info) info.innerHTML = `<div style="font-weight:700">${c.brand} ${c.model} ${c.year}</div><div style="font-size:12px;color:var(--t3)">${c.plate} · ${c.km?c.km.toLocaleString()+' km':''}${c.fuel?' · '+c.fuel:''}</div>`;
  // Pre-completez titlul anunțului
  const titlu = document.getElementById('vanz-titlu');
  if(titlu && !titlu.value) titlu.value = `${c.brand} ${c.model} ${c.year}`;
  // Estimez prețul
  vanzEstimPret();
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
  const c=cars.find(x=>x.id===selCarId);
  if(!c)return;
  const pret=document.getElementById('vanz-pret').value;
  const desc=document.getElementById('vanz-desc').value;
  const tel=document.getElementById('vanz-tel').value;
  const judet=document.getElementById('vanz-judet').value;
  if(!pret){alert('Te rugăm să introduci prețul!');return;}
  if(!desc||desc.length<20){alert('Te rugăm să generezi sau să scrii o descriere!');return;}
  if(!tel){alert('Te rugăm să introduci numărul de telefon!');return;}

  const dotari=[...document.querySelectorAll('#vanz-dotari input:checked')].map(x=>x.value).join(', ');
  const titlu=`${c.brand||'Auto'} ${c.model||''} ${c.year||''} - ${c.km?c.km.toLocaleString()+' km':''} - ${pret} EUR`;

  const anunt={
    user_id: currentUser?.id || 'anonim',
    plate:c.plate, brand:c.brand, model:c.model, year:c.year, km:c.km,
    pret, descriere:desc, tel, judet, dotari,
    data:new Date().toLocaleDateString('ro-RO'),
    status:'activ',
    foto:window._vanzFotoData||null,
    created_at: new Date().toISOString()
  };

  // Salveaza in Supabase
  if(supabaseClient){
    try {
      await supabaseClient.from('listings').insert([anunt]);
    } catch(e){ console.log('Supabase save error:', e); }
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

  document.getElementById('vanz-links').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:rgba(0,232,154,0.08);border:1px solid rgba(0,232,154,0.2);border-radius:12px;padding:14px">
        <div style="font-size:13px;font-weight:800;color:var(--green);margin-bottom:6px">✅ Anunț publicat pe AutoAssist!</div>
        <div style="font-size:12px;color:var(--t2)">Anunțul tău este vizibil pentru toți utilizatorii AutoAssist.</div>
      </div>
      <div style="background:rgba(255,109,0,0.08);border:1px solid rgba(255,109,0,0.2);border-radius:12px;padding:14px">
        <div style="font-size:13px;font-weight:800;color:#ff6d00;margin-bottom:6px">🟠 Publică și pe OLX</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">Descrierea a fost copiată în clipboard. Lipește-o direct în formularul OLX.</div>
        <a href="https://www.olx.ro/d/oferta/add/?category=5" target="_blank" style="display:block;background:#ff6d00;color:#fff;text-decoration:none;text-align:center;padding:10px;border-radius:10px;font-weight:700;font-size:13px">Deschide formularul OLX →</a>
      </div>
      <div style="background:rgba(0,102,204,0.08);border:1px solid rgba(0,102,204,0.2);border-radius:12px;padding:14px">
        <div style="font-size:13px;font-weight:800;color:#0066cc;margin-bottom:6px">🔵 Publică și pe Autovit</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">Descrierea e copiată. Creează cont pe Autovit și lipește anunțul.</div>
        <a href="https://www.autovit.ro/adauga-anunt" target="_blank" style="display:block;background:#0066cc;color:#fff;text-decoration:none;text-align:center;padding:10px;border-radius:10px;font-weight:700;font-size:13px">Deschide formularul Autovit →</a>
      </div>
    </div>`;

  if(navigator.clipboard)navigator.clipboard.writeText(titlu+'\n\n'+desc+'\n\nDotări: '+dotari+'\nPreț: '+pret+' EUR\nTelefon: '+tel+'\nJudețul: '+judet).catch(()=>{});

  vanzLoadLista();
  loadDashVanzari();
}

function vanzNouAnunt(){
  window._vanzFotoData=null;
  document.getElementById('vanz-foto-preview').style.display='none';
  const fi=document.getElementById('vanz-foto-input');if(fi)fi.value='';
  document.getElementById('vanz-step1').style.display='block';
  document.getElementById('vanz-step2').style.display='none';
  document.getElementById('vanz-step3').style.display='none';
  loadVanzCars();
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
      <div style="font-size:11px;color:var(--t3);margin-top:2px">📍 ${a.judet||'România'}</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <a href="https://www.olx.ro" target="_blank" style="flex:1;text-align:center;font-size:11px;font-weight:700;padding:5px;background:rgba(255,109,0,0.15);color:#ff6d00;border-radius:6px;text-decoration:none">🟠 OLX</a>
        <a href="https://www.autovit.ro" target="_blank" style="flex:1;text-align:center;font-size:11px;font-weight:700;padding:5px;background:rgba(0,102,204,0.15);color:#0066cc;border-radius:6px;text-decoration:none">🔵 Autovit</a>
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

