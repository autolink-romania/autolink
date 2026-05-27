// ═══ CALCULATOR COSTURI ═══
function prefillCostCar() {
  const sel = document.getElementById('cost-car');
  const car = cars.find(c => c.id == sel.value);
  if(!car) return;
}

// ═══ DOCUMENTE PERSONALE ═══
function docTab(tab) {
  ['buletin','permis','talon','altele'].forEach(t => {
    const panel = document.getElementById('docpanel-'+t);
    const btn = document.getElementById('doctab-'+t);
    if(panel) panel.style.display = t === tab ? 'block' : 'none';
    if(btn) {
      btn.style.background = t === tab ? 'var(--accent)' : 'var(--s2)';
      btn.style.color = t === tab ? '#fff' : 'var(--t1)';
    }
  });
}

function processDoc(type, input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    // Arată preview
    const img = document.getElementById(type+'-img');
    const prev = document.getElementById(type+'-preview');
    if(img && prev) { img.src = dataUrl; prev.style.display = 'block'; }
    // Salvează poza în localStorage
    try { localStorage.setItem('doc_img_'+type, dataUrl); } catch(e) {}
    // Încearcă extragere date cu Claude Vision
    showNotification('🔍 Procesare...', 'Se extrag datele din document cu AI...');
    await extractDocData(type, dataUrl);
  };
  reader.readAsDataURL(file);
}

async function extractDocData(type, imageDataUrl) {
  const apiKey = localStorage.getItem('autoassist-api-key');
  const base64 = imageDataUrl.split(',')[1];
  const mimeType = imageDataUrl.split(';')[0].split(':')[1];

  const prompts = {
    buletin: 'Extrage din această imagine de buletin/carte de identitate românesc următoarele date în format JSON: { "nume": "", "cnp": "", "dob": "YYYY-MM-DD", "serie": "", "adresa": "", "judet": "", "exp": "YYYY-MM-DD" }. Răspunde DOAR cu JSON valid, fără alte cuvinte.',
    permis: 'Extrage din această imagine de permis auto românesc: { "nr": "", "data": "YYYY-MM-DD", "exp": "YYYY-MM-DD", "categorii": "", "elib": "" }. Răspunde DOAR cu JSON valid.',
    talon: 'Extrage din această imagine de talon/certificat de înmatriculare românesc: { "nr": "", "vin": "", "marca": "", "model": "", "an": "", "cmc": "", "kw": "", "combustibil": "", "culoare": "" }. Răspunde DOAR cu JSON valid.',
  };

  if(!apiKey || !prompts[type]) {
    showNotification('💡 Completare manuală', 'Introdu datele manual sau adaugă Claude API Key în Setări pentru extragere automată.');
    return;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
            { type: 'text', text: prompts[type] }
          ]
        }]
      })
    });
    const data = await res.json();
    if(data.content?.[0]?.text) {
      const json = JSON.parse(data.content[0].text.replace(/```json|```/g,'').trim());
      fillDocFields(type, json);
      showNotification('✅ Date extrase!', 'Verifică și corectează dacă e necesar.');
    }
  } catch(e) {
    showNotification('💡 Completare manuală', 'Introdu datele manual în câmpurile de mai jos.');
  }
}

function fillDocFields(type, data) {
  const map = {
    buletin: { 'bul-nume': data.nume, 'bul-cnp': data.cnp, 'bul-dob': data.dob, 'bul-serie': data.serie, 'bul-adresa': data.adresa, 'bul-judet': data.judet, 'bul-exp': data.exp },
    permis:  { 'perm-nr': data.nr, 'perm-data': data.data, 'perm-exp': data.exp, 'perm-cat': data.categorii, 'perm-elib': data.elib },
    talon:   { 'tal-nr': data.nr, 'tal-vin': data.vin, 'tal-marca': data.marca, 'tal-model': data.model, 'tal-an': data.an, 'tal-cmc': data.cmc, 'tal-kw': data.kw, 'tal-culoare': data.culoare },
  };
  const fields = map[type] || {};
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if(el && val) el.value = val;
  });
  // Setează combustibil separat pentru select
  if(type === 'talon' && data.combustibil) {
    const el = document.getElementById('tal-comb');
    if(el) { for(let o of el.options) { if(o.value.toLowerCase().includes(data.combustibil.toLowerCase())) { el.value = o.value; break; } } }
  }
  // Setează județ pentru buletin
  if(type === 'buletin' && data.judet) {
    const el = document.getElementById('bul-judet');
    if(el) { for(let o of el.options) { if(o.value.toLowerCase().includes(data.judet.toLowerCase())) { el.value = o.value; break; } } }
  }
}

function saveDocDate(type) {
  const fields = {
    buletin: ['bul-nume','bul-cnp','bul-dob','bul-serie','bul-adresa','bul-judet','bul-exp'],
    permis:  ['perm-nr','perm-data','perm-exp','perm-cat','perm-elib'],
    talon:   ['tal-nr','tal-vin','tal-marca','tal-model','tal-an','tal-cmc','tal-kw','tal-comb','tal-culoare'],
  };
  const data = {};
  (fields[type]||[]).forEach(id => {
    const el = document.getElementById(id);
    if(el) data[id] = el.value;
  });
  localStorage.setItem('docdate_'+type, JSON.stringify(data));
  const status = document.getElementById(type.substring(0,3)+'-status') || document.getElementById('tal-status') || document.getElementById('perm-status') || document.getElementById('bul-status');
  if(status) {
    status.style.display = 'block';
    status.style.background = 'rgba(0,232,154,0.1)';
    status.style.color = 'var(--green)';
    status.textContent = '✅ Date salvate cu succes!';
    setTimeout(() => status.style.display='none', 3000);
  }
  showNotification('✅ Salvat!', 'Datele din '+type+' sunt stocate și vor fi folosite la completarea automată.');
}

function loadDocData(type) {
  const saved = JSON.parse(localStorage.getItem('docdate_'+type)||'{}');
  Object.entries(saved).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if(el && val) el.value = val;
  });
  const img = localStorage.getItem('doc_img_'+type);
  if(img) {
    const imgEl = document.getElementById(type+'-img');
    const prev = document.getElementById(type+'-preview');
    if(imgEl && prev) {
      imgEl.src = img;
      prev.style.display = 'block';
      // Adaug butoane Vezi + Descarcă dacă nu există deja
      if(!document.getElementById('doc-actions-'+type)) {
        const actEl = document.createElement('div');
        actEl.id = 'doc-actions-'+type;
        actEl.style.cssText = 'display:flex;gap:8px;margin-top:8px;justify-content:center';
        actEl.innerHTML = `
          <button onclick="viewDocImg('${type}')" style="background:rgba(79,125,255,0.1);border:1px solid rgba(79,125,255,0.3);color:var(--accent);border-radius:8px;padding:7px 16px;cursor:pointer;font-size:12px;font-weight:700">👁️ Vizualizează</button>
          <button onclick="downloadDocImg('${type}')" style="background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);color:var(--green);border-radius:8px;padding:7px 16px;cursor:pointer;font-size:12px;font-weight:700">⬇️ Descarcă</button>
          <button onclick="deleteDocImg('${type}')" style="background:rgba(255,59,59,0.1);border:1px solid rgba(255,59,59,0.3);color:var(--red);border-radius:8px;padding:7px 16px;cursor:pointer;font-size:12px;font-weight:700">🗑️</button>`;
        prev.appendChild(actEl);
      }
    }
  }
}

function viewDocImg(type) {
  const img = localStorage.getItem('doc_img_'+type);
  if(!img) return;
  const names = {buletin:'Buletin/CI', permis:'Permis Auto', talon:'Talon Mașină'};
  document.getElementById('doc-viewer-modal')?.remove();
  const isPdf = img.startsWith('data:application/pdf');
  document.body.insertAdjacentHTML('beforeend', `
    <div id="doc-viewer-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)this.remove()">
      <div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;max-width:700px;width:100%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--b2)">
          <div style="font-weight:700">📄 ${names[type]||type}</div>
          <div style="display:flex;gap:8px">
            <button onclick="downloadDocImg('${type}')" style="background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);color:var(--green);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px;font-weight:700">⬇️ Descarcă</button>
            <button onclick="document.getElementById('doc-viewer-modal').remove()" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:22px">×</button>
          </div>
        </div>
        <div style="flex:1;overflow:auto;padding:16px;display:flex;align-items:center;justify-content:center;background:#111">
          ${isPdf
            ? `<iframe src="${img}" style="width:100%;height:70vh;border:none;border-radius:8px"></iframe>`
            : `<img src="${img}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:8px">`}
        </div>
      </div>
    </div>`);
}

function downloadDocImg(type) {
  const img = localStorage.getItem('doc_img_'+type);
  if(!img) return;
  const names = {buletin:'buletin', permis:'permis', talon:'talon'};
  const ext = img.startsWith('data:application/pdf') ? '.pdf' : '.jpg';
  const a = document.createElement('a');
  a.href = img;
  a.download = (names[type]||type) + ext;
  a.click();
}

function deleteDocImg(type) {
  if(!confirm('Ștergi documentul scanat?')) return;
  localStorage.removeItem('doc_img_'+type);
  const imgEl = document.getElementById(type+'-img');
  const prev = document.getElementById(type+'-preview');
  if(imgEl) imgEl.src = '';
  if(prev) prev.style.display = 'none';
  document.getElementById('doc-actions-'+type)?.remove();
}

function addCarFromTalon() {
  const nr = document.getElementById('tal-nr')?.value?.trim().toUpperCase().replace(/\s/g,'');
  const vin = document.getElementById('tal-vin')?.value?.trim();
  const marca = document.getElementById('tal-marca')?.value?.trim();
  const model = document.getElementById('tal-model')?.value?.trim();
  const an = document.getElementById('tal-an')?.value?.trim();
  if(!nr) { showNotification('⚠️','Completează numărul de înmatriculare.'); return; }
  // Pre-completează formularul de adăugare mașină
  openM('add-car');
  setTimeout(() => {
    const plEl = document.getElementById('m-pl');
    const brEl = document.getElementById('m-br');
    const moEl = document.getElementById('m-mo');
    const yrEl = document.getElementById('m-yr');
    if(plEl) { plEl.value = nr; autoFill('m-pl','m-inf'); }
    if(brEl && marca) brEl.value = marca;
    if(moEl && model) moEl.value = model;
    if(yrEl && an) yrEl.value = an;
  }, 300);
  showNotification('🚗 Date completate!', 'Verifică și adaugă mașina în garaj.');
}

// Funcție globală pentru auto-completare din documente personale
// Returnează DOAR datele permise pentru contextul specificat
function getDatePersonale(context) {
  const buletin = JSON.parse(localStorage.getItem('docdate_buletin')||'{}');
  const permis = JSON.parse(localStorage.getItem('docdate_permis')||'{}');
  const talon = JSON.parse(localStorage.getItem('docdate_talon')||'{}');

  // RCA — date proprietar cerute legal de asigurător
  if(context === 'rca') return {
    nume: buletin['bul-nume'] || '',
    adresa: buletin['bul-adresa'] || '',
    judet: buletin['bul-judet'] || '',
    cnp: buletin['bul-cnp'] || '',
    permisNr: permis['perm-nr'] || '',
  };

  // ITP — doar nume și contact pentru programare
  if(context === 'itp') return {
    nume: buletin['bul-nume'] || '',
    judet: buletin['bul-judet'] || '',
  };

  // Profil — nume și județ
  if(context === 'profil') return {
    nume: buletin['bul-nume'] || '',
    judet: buletin['bul-judet'] || '',
  };

  // Talon — date vehicul (nu date personale)
  if(context === 'talon') return {
    nr: talon['tal-nr'] || '',
    vin: talon['tal-vin'] || '',
    marca: talon['tal-marca'] || '',
    model: talon['tal-model'] || '',
    an: talon['tal-an'] || '',
  };

  // Default — nimic (protecție implicită)
  return {};
}

function addAltDoc(input) {
  const files = Array.from(input.files);
  if(!files.length) return;
  const tip = document.getElementById('altdoc-tip')?.value || 'Document';
  const exp = document.getElementById('altdoc-exp')?.value || '';
  const desc = document.getElementById('altdoc-desc')?.value || '';

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const list = JSON.parse(localStorage.getItem('altdocs')||'[]');
      list.unshift({
        id: Date.now() + Math.random(),
        tip, exp, desc,
        name: file.name,
        type: file.type,
        data: e.target.result  // base64 complet
      });
      localStorage.setItem('altdocs', JSON.stringify(list));
      renderAltDocs();
      showNotification('📁 Document adăugat!', file.name);
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function renderAltDocs() {
  const el = document.getElementById('altdoc-list');
  if(!el) return;
  const list = JSON.parse(localStorage.getItem('altdocs')||'[]');
  if(!list.length) { el.innerHTML = '<div class="empty"><div class="ei">📁</div><p>Niciun document adăugat.</p></div>'; return; }
  el.innerHTML = list.map(d => {
    const isPdf = d.type==='application/pdf' || d.name?.endsWith('.pdf');
    const isImg = d.type?.startsWith('image/');
    const icon = isPdf ? '📋' : isImg ? '🖼️' : '📄';
    const expColor = d.exp ? (new Date(d.exp) < new Date() ? 'var(--red)' : new Date(d.exp) < new Date(Date.now()+30*864e5) ? 'var(--amber)' : 'var(--green)') : 'var(--t3)';
    return `<div style="background:var(--s2);border:1px solid var(--b2);border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${icon} ${d.tip}</div>
          <div style="font-size:11px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.name}</div>
          ${d.exp?`<div style="font-size:11px;color:${expColor};margin-top:3px">📅 Valabil până: ${d.exp}</div>`:''}
          ${d.desc?`<div style="font-size:11px;color:var(--t3);margin-top:2px">${d.desc}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          ${d.data?`<button onclick="viewAltDoc(${JSON.stringify(d.id)})" style="background:rgba(79,125,255,0.1);border:1px solid rgba(79,125,255,0.3);color:var(--accent);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:700">👁️ Vezi</button>
          <button onclick="downloadAltDoc(${JSON.stringify(d.id)})" style="background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);color:var(--green);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:700">⬇️</button>`:''}
          <button onclick="delAltDoc(${JSON.stringify(d.id)})" style="background:rgba(255,59,59,0.1);border:1px solid rgba(255,59,59,0.3);color:var(--red);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:700">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function viewAltDoc(id) {
  const list = JSON.parse(localStorage.getItem('altdocs')||'[]');
  const d = list.find(x=>x.id==id);
  if(!d||!d.data) return;
  const isPdf = d.type==='application/pdf'||d.name?.endsWith('.pdf');
  const isImg = d.type?.startsWith('image/');
  document.getElementById('doc-viewer-modal')?.remove();
  const html = `<div id="doc-viewer-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)this.remove()">
    <div style="background:var(--s1);border:1px solid var(--b2);border-radius:16px;max-width:700px;width:100%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--b2)">
        <div style="font-weight:700;font-size:15px">📄 ${d.tip} — ${d.name}</div>
        <div style="display:flex;gap:8px">
          <button onclick="downloadAltDoc('${d.id}')" style="background:rgba(0,232,154,0.1);border:1px solid rgba(0,232,154,0.3);color:var(--green);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px;font-weight:700">⬇️ Descarcă</button>
          <button onclick="document.getElementById('doc-viewer-modal').remove()" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:22px">×</button>
        </div>
      </div>
      <div style="flex:1;overflow:auto;padding:16px;display:flex;align-items:center;justify-content:center">
        ${isPdf
          ? `<iframe src="${d.data}" style="width:100%;height:70vh;border:none;border-radius:8px"></iframe>`
          : isImg
            ? `<img src="${d.data}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:8px">`
            : `<div style="text-align:center;color:var(--t3)"><div style="font-size:48px;margin-bottom:12px">📄</div><div>Previzualizare indisponibilă pentru acest tip de fișier.</div><button onclick="downloadAltDoc('${d.id}')" class="btn btn-primary btn-sm" style="margin-top:12px">⬇️ Descarcă fișierul</button></div>`
        }
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function downloadAltDoc(id) {
  const list = JSON.parse(localStorage.getItem('altdocs')||'[]');
  const d = list.find(x=>x.id==id);
  if(!d||!d.data) return;
  const a = document.createElement('a');
  a.href = d.data;
  a.download = d.name || 'document';
  a.click();
}

function delAltDoc(id) {
  if(!confirm('Ștergi documentul?')) return;
  let list = JSON.parse(localStorage.getItem('altdocs')||'[]');
  list = list.filter(d => d.id != id);
  localStorage.setItem('altdocs', JSON.stringify(list));
  renderAltDocs();
}

// ═══ GOOGLE TTS — Voce română naturală ═══
let _ttsAudio = null;

function stopVoice() {
  if(_ttsAudio) { _ttsAudio.pause(); _ttsAudio.currentTime = 0; _ttsAudio = null; }
  window.speechSynthesis && window.speechSynthesis.cancel();
}

async function speakRomanian(text, gender = 'female', rate = 1.0, pitch = 0) {
  stopVoice();

  try {
    const res = await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: gender, rate, pitch })
    });

    if(res.ok) {
      const data = await res.json();
      console.log('TTS response:', data.error || 'OK', 'has audio:', !!data.audio);
      if(data.audio) {
        const audioSrc = 'data:audio/mp3;base64,' + data.audio;
        _ttsAudio = new Audio(audioSrc);
        _ttsAudio.play();
        return;
      }
      if(data.error) console.log('TTS error:', data.error);
    }
  } catch(e) {
    console.log('TTS fetch error:', e.message);
  }

  // Fallback browser TTS
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ro-RO';
  utt.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const roVoice = voices.find(v => v.lang === 'ro-RO' || v.lang.startsWith('ro'));
  if(roVoice) utt.voice = roVoice;
  window.speechSynthesis.speak(utt);
}

// ═══ SETĂRI VOCE ═══
function loadVoices() {
  // Restaurează setările salvate
  const rate = localStorage.getItem('voice-rate') || '1.0';
  const pitch = localStorage.getItem('voice-pitch') || '1.0';
  const gender = localStorage.getItem('voice-gender') || 'female';
  const rateEl = document.getElementById('voice-rate');
  const pitchEl = document.getElementById('voice-pitch');
  if(rateEl) { rateEl.value = rate; const rv = document.getElementById('rate-val'); if(rv) rv.textContent = parseFloat(rate).toFixed(1); }
  if(pitchEl) { pitchEl.value = pitch; const pv = document.getElementById('pitch-val'); if(pv) pv.textContent = parseFloat(pitch).toFixed(1); }
  setVoiceGender(gender, false);
}

function setVoiceGender(gender, save = true) {
  if(save) localStorage.setItem('voice-gender', gender);
  const fb = document.getElementById('voice-btn-female');
  const mb = document.getElementById('voice-btn-male');
  if(fb && mb) {
    if(gender === 'female') {
      fb.style.background = 'var(--accent)'; fb.style.color = '#fff';
      mb.style.background = 'var(--s2)'; mb.style.color = 'var(--t1)';
    } else {
      mb.style.background = 'var(--accent)'; mb.style.color = '#fff';
      fb.style.background = 'var(--s2)'; fb.style.color = 'var(--t1)';
    }
  }
}

function setVoice() {}

function testVoice() {
  const rate = parseFloat(document.getElementById("voice-rate")?.value || "1.0");
  const pitch = parseFloat(document.getElementById("voice-pitch")?.value || "0");
  const gender = localStorage.getItem("voice-gender") || "female";
  localStorage.setItem("voice-rate", rate);
  localStorage.setItem("voice-pitch", pitch);
  const textF = "Bună ziua! Sunt Alina, asistenta ta vocală AutoAssist. Cum te pot ajuta cu mașina ta?";
  const textM = "Bună ziua! Sunt Emil, asistentul tău vocal AutoAssist. Cum te pot ajuta cu mașina ta?";
  speakRomanian(gender === "female" ? textF : textM, gender, rate, pitch);
}

function resetVoiceSettings() {
  localStorage.removeItem('voice-gender');
  localStorage.removeItem('voice-rate');
  localStorage.removeItem('voice-pitch');
  localStorage.removeItem('voice-name');
  loadVoices();
  showNotification('🔄 Resetat!', 'Setările vocii au revenit la implicit.');
}

if(window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 500);
}


// ═══ EXPORT PDF PREMIUM ═══
function exportDocarPDF() {
  if(!isPremium()) {
    showUpgradeModal('export_pdf');
    return;
  }
  if(!cars || cars.length === 0) {
    alert('Nu ai mașini în garaj pentru export!');
    return;
  }

  let content = `DOSAR AUTO — AutoAssist\nGenerat: ${new Date().toLocaleDateString('ro-RO')}\n\n`;
  content += `Utilizator: ${currentUser?.email || 'necunoscut'}\n`;
  content += '='.repeat(50) + '\n\n';

  cars.forEach((c, i) => {
    content += `MAȘINA ${i+1}: ${c.brand} ${c.model} ${c.year}\n`;
    content += `-`.repeat(40) + '\n';
    content += `Nr. înmatriculare: ${c.plate}\n`;
    content += `Kilometraj: ${c.km || '-'} km\n`;
    content += `Combustibil: ${c.fuel || '-'}\n`;
    content += `Motor: ${c.engine || '-'}\n`;
    content += `VIN: ${c.vin || '-'}\n\n`;
    content += `DOCUMENTE:\n`;
    content += `  RCA: ${c.docs?.rca || 'Necompletat'}\n`;
    content += `  ITP: ${c.docs?.itp || 'Necompletat'}\n`;
    content += `  Rovinietă: ${c.docs?.rov || 'Necompletat'}\n`;
    content += `  Extinctor: ${c.docs?.ext || 'Necompletat'}\n`;
    content += `  Trusă: ${c.docs?.trz || 'Necompletat'}\n\n`;
    if(c.mnt?.oilLast) {
      content += `MENTENANȚĂ:\n`;
      content += `  Ulei schimbat la: ${c.mnt.oilLast} km\n`;
      content += `  Interval schimb: ${c.mnt.oilInt || 10000} km\n\n`;
    }
    content += '\n';
  });

  content += '='.repeat(50) + '\n';
  content += 'AutoAssist — Asistentul & Managerul tău auto\n';
  content += 'www.autoassist.ro\n';

  // Crează fișier text descărcabil (PDF real necesită librărie)
  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AutoAssist_Dosar_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('✅ Dosar exportat!', 'Fișierul a fost descărcat pe dispozitivul tău.');
}

// ═══ SMS SETTINGS ═══
function initSMSSettings() {
  const lock = document.getElementById('sms-premium-lock');
  const body = document.getElementById('sms-settings-body');
  if(!lock || !body) return;
  if(!isPremium()) {
    lock.style.display = 'block';
    body.style.display = 'none';
  } else {
    lock.style.display = 'none';
    body.style.display = 'block';
    // Încarcă setările salvate
    const saved = JSON.parse(localStorage.getItem('aa_sms_settings') || '{}');
    if(saved.phone) document.getElementById('sms-phone').value = saved.phone;
    if(document.getElementById('sms-rca')) document.getElementById('sms-rca').checked = saved.rca !== false;
    if(document.getElementById('sms-itp')) document.getElementById('sms-itp').checked = saved.itp !== false;
    if(document.getElementById('sms-rov')) document.getElementById('sms-rov').checked = saved.rov !== false;
  }
}

function saveSMSSettings() {
  if(!isPremium()) { showUpgradeModal('sms'); return; }
  const phone = document.getElementById('sms-phone')?.value?.trim();
  if(!phone) { 
    document.getElementById('sms-save-status').innerHTML = '<span style="color:var(--red)">⚠️ Introdu numărul de telefon!</span>';
    return; 
  }
  const settings = {
    phone,
    rca: document.getElementById('sms-rca')?.checked,
    itp: document.getElementById('sms-itp')?.checked,
    rov: document.getElementById('sms-rov')?.checked,
    saved: new Date().toISOString()
  };
  localStorage.setItem('aa_sms_settings', JSON.stringify(settings));
  // Salvează și în Supabase dacă e logat
  if(supabaseClient && currentUser) {
    supabaseClient.from('user_settings').upsert({
      user_id: currentUser.id,
      sms_phone: phone,
      sms_rca: settings.rca,
      sms_itp: settings.itp,
      sms_rov: settings.rov
    }).then(() => {});
  }
  const status = document.getElementById('sms-save-status');
  if(status) status.innerHTML = '<span style="color:var(--green)">✅ Setările SMS au fost salvate! Vei primi SMS-uri la numerele de expirare configurate.</span>';
  showNotification('✅ SMS activat!', `Vei primi alerte pe ${phone}`);
}

// ═══ RAPORT AI STARE MAȘINĂ ═══
async function generateCarReport(carId) {
  if(!isPremium()) { showUpgradeModal('raport_ai'); return; }
  
  const car = cars.find(c => c.id == carId);
  if(!car) return;

  const btn = document.getElementById('raport-btn-' + carId);
  if(btn) { btn.disabled = true; btn.textContent = '⏳ Generez raport...'; }

  const today = new Date();
  const daysUntil = v => v ? Math.ceil((new Date(v) - today) / 864e5) : null;
  
  const prompt = `Ești un expert auto român. Analizează această mașină și generează un raport complet de stare în română:

Mașină: ${car.brand} ${car.model} ${car.year}
Nr. înmatriculare: ${car.plate}
Kilometraj: ${car.km || 'necunoscut'} km
Combustibil: ${car.fuel || 'necunoscut'}
Motor: ${car.engine || 'necunoscut'}

DOCUMENTE:
- RCA: ${car.docs?.rca ? `expiră ${car.docs.rca} (${daysUntil(car.docs.rca)} zile)` : 'necunoscut'}
- ITP: ${car.docs?.itp ? `expiră ${car.docs.itp} (${daysUntil(car.docs.itp)} zile)` : 'necunoscut'}
- Rovinietă: ${car.docs?.rov ? `expiră ${car.docs.rov} (${daysUntil(car.docs.rov)} zile)` : 'necunoscut'}

MENTENANȚĂ:
- Ulei schimbat la: ${car.mnt?.oilLast || 'necunoscut'} km
- Interval schimb ulei: ${car.mnt?.oilInt || 10000} km
- Km actuali: ${car.km || 0}

Generează un raport structurat cu:
1. STARE GENERALĂ (Excelentă/Bună/Atenție/Critică) cu explicație
2. DOCUMENTE — ce expiră curând și urgența
3. MENTENANȚĂ — ce verificări sunt recomandate la acest kilometraj pentru ${car.brand} ${car.model}
4. PROBLEME COMUNE — cele mai frecvente probleme la ${car.brand} ${car.model} ${car.year} la ${car.km || '?'} km
5. RECOMANDĂRI — top 3 acțiuni prioritare
6. COST ESTIMAT mentenanță preventivă în Romania

Fii specific, practic și în română.`;

  try {
    const res = await fetch('https://zspcknjuqdjfxtqrqhhm.supabase.co/functions/v1/asistent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGNrbmp1cWRqZnh0cXJxaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzI5NDcsImV4cCI6MjA1OTEwODk0N30.5YhiDJmZ4SKSCkm9H4d5FdBWZ0fJuWkSBhCL5bVFYxE'
      },
      body: JSON.stringify({
        messages: [{role:'user', content: prompt}],
        system: 'Ești un expert auto român care generează rapoarte clare și utile.',
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500
      })
    });
    const data = await res.json();
    const reply = data.reply || 'Nu s-a putut genera raportul.';
    
    // Afișez raportul într-un modal
    openReportModal(car, reply);
  } catch(e) {
    showNotification('❌ Eroare', 'Nu s-a putut genera raportul. Încearcă din nou.');
  } finally {
    if(btn) { btn.disabled = false; btn.textContent = '🤖 Raport AI'; }
  }
}

function openReportModal(car, report) {
  const existing = document.getElementById('mo-car-report');
  if(existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'mo';
  modal.id = 'mo-car-report';
  modal.innerHTML = `
    <div class="md" style="max-width:600px">
      <div class="md-handle"></div>
      <div class="md-h">
        <div class="md-t">🤖 Raport AI — ${car.brand} ${car.model} ${car.year}</div>
        <div class="md-x" onclick="closeM('car-report')">✕</div>
      </div>
      <div style="padding-bottom:20px">
        <div style="background:var(--s2);border-radius:10px;padding:16px;margin-bottom:12px;font-size:13px;color:var(--t2);line-height:1.7;white-space:pre-wrap">${report.replace(/</g,'&lt;')}</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" style="flex:1" onclick="exportReportTXT('${car.plate}', \`${report.replace(/`/g,"'")}\`)">📄 Descarcă raport</button>
          <button class="btn btn-ghost" onclick="closeM('car-report')">Închide</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('open'), 10);
}

function exportReportTXT(plate, report) {
  const blob = new Blob([`RAPORT AI AutoAssist\nMașină: ${plate}\nData: ${new Date().toLocaleDateString('ro-RO')}\n\n${report}`], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Raport_${plate}_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
}
