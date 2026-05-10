export const config = { runtime: 'edge' };

const HEADERS_BROWSER = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });

  const { searchParams } = new URL(req.url);
  const nrAuto = (searchParams.get('nr') || '').toUpperCase().replace(/\s/g, '');

  if (!nrAuto || nrAuto.length < 4) return json({ error: 'Nr. înmatriculare invalid' }, 400);

  const [rca, rovinieta] = await Promise.allSettled([
    verificaRCA(nrAuto),
    verificaRovinieta(nrAuto),
  ]);

  return json({
    nr: nrAuto,
    judet: getJudet(nrAuto),
    timestamp: new Date().toISOString(),
    rca: rca.status === 'fulfilled' ? rca.value : { error: true, mesaj: 'Eroare verificare RCA' },
    rovinieta: rovinieta.status === 'fulfilled' ? rovinieta.value : { error: true, mesaj: 'Eroare verificare rovignetă' },
    itp: { mesaj: 'Introdu VIN din talon pentru ITP automat', necesitaVIN: true }
  });
}

async function verificaRCA(nrAuto) {
  const initRes = await fetch('https://www.aida.info.ro/polite-rca', {
    headers: { ...HEADERS_BROWSER, 'Referer': 'https://www.aida.info.ro/' }
  });
  const sessionCookie = extractCookies(initRes.headers.get('set-cookie'));
  const html = await initRes.text();
  const tokenMatch = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
  const token = tokenMatch ? tokenMatch[1] : '';
  const azi = new Date();
  const dataFmt = `${azi.getFullYear()}-${String(azi.getMonth()+1).padStart(2,'0')}-${String(azi.getDate()).padStart(2,'0')}`;
  const body = new URLSearchParams({ 'CriteriuCautare': '1', 'NrInmatriculare': nrAuto, 'DataVerificare': dataFmt, 'acord': 'true' });
  if (token) body.set('__RequestVerificationToken', token);
  const res = await fetch('https://www.aida.info.ro/polite-rca', {
    method: 'POST',
    headers: { ...HEADERS_BROWSER, 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': 'https://www.aida.info.ro/polite-rca', 'Origin': 'https://www.aida.info.ro', 'Cookie': sessionCookie },
    body: body.toString()
  });
  return parseRCA(await res.text());
}

function parseRCA(html) {
  if (html.match(/nu exist[aă]|nu a fost g[aă]sit/i)) return { valid: false, expira: null, mesaj: 'Nu există poliță RCA validă' };
  const dates = html.match(/([0-9]{2}[.][0-9]{2}[.][0-9]{4})/g) || [];
  const asig = html.match(/(?:Allianz|Groupama|Omniasig|Euroins|Generali|Uniqa|Grawe|Asirom|Hellas|Signal|Axeria)[^<\n]*/i);
  for (const d of dates) {
    const p = d.split('.');
    const dt = new Date(+p[2], +p[1]-1, +p[0]);
    if (dt > new Date()) return { valid: true, expira: d, asigurator: asig ? asig[0].trim().slice(0,30) : null, zileRamase: Math.ceil((dt-new Date())/86400000), mesaj: 'Poliță RCA validă' };
  }
  return dates.length ? { valid: false, expira: dates[0], mesaj: 'RCA expirat' } : { valid: null, mesaj: 'Status RCA nedeterminat' };
}

async function verificaRovinieta(nrAuto) {
  for (const url of [
    `https://api.erovinieta.ro/vignettes?plateNumber=${encodeURIComponent(nrAuto)}&countryCode=RO`,
    `https://www.erovinieta.ro/api/vignettes/${encodeURIComponent(nrAuto)}`
  ]) {
    try {
      const res = await fetch(url, { headers: { ...HEADERS_BROWSER, 'Accept': 'application/json', 'Referer': 'https://www.erovinieta.ro/' } });
      if (res.ok) return parseRovinieta(await res.json());
    } catch(e) { continue; }
  }
  const res = await fetch(`https://www.erovinieta.ro/verificare-vigneta?nr=${encodeURIComponent(nrAuto)}`, { headers: HEADERS_BROWSER });
  const html = await res.text();
  const dates = html.match(/([0-9]{2}[./-][0-9]{2}[./-][0-9]{4})/g);
  if (html.match(/expir[at]+|nu exist[aă]/i)) return { valid: false, mesaj: 'Nu există rovignetă activă' };
  if (html.match(/activ[aă]|valabil[aă]/i) && dates) return { valid: true, expira: dates[dates.length-1], zileRamase: calcZile(dates[dates.length-1]), mesaj: 'Rovignetă activă' };
  return { valid: null, mesaj: 'Status rovignetă nedeterminat' };
}

function parseRovinieta(data) {
  const items = Array.isArray(data) ? data : (data?.vignettes || data?.items || []);
  if (!items.length) return { valid: false, mesaj: 'Nu există rovignetă activă' };
  const azi = new Date();
  const activa = items.find(v => new Date(v.endDate || v.validTo) > azi);
  if (!activa) return { valid: false, expira: formatData(items[0]?.endDate), mesaj: 'Rovignetă expirată' };
  return { valid: true, expira: formatData(activa.endDate || activa.validTo), zileRamase: calcZile(activa.endDate || activa.validTo), categorie: activa.category || 'A', mesaj: 'Rovignetă activă' };
}

function getJudet(nr) {
  const m = {'B':'București','AB':'Alba','AR':'Arad','AG':'Argeș','BC':'Bacău','BH':'Bihor','BN':'Bistrița-Năsăud','BT':'Botoșani','BV':'Brașov','BR':'Brăila','BZ':'Buzău','CS':'Caraș-Severin','CL':'Călărași','CJ':'Cluj','CT':'Constanța','CV':'Covasna','DB':'Dâmbovița','DJ':'Dolj','GL':'Galați','GR':'Giurgiu','GJ':'Gorj','HR':'Harghita','HD':'Hunedoara','IL':'Ialomița','IS':'Iași','IF':'Ilfov','MM':'Maramureș','MH':'Mehedinți','MS':'Mureș','NT':'Neamț','OT':'Olt','PH':'Prahova','SM':'Satu Mare','SJ':'Sălaj','SB':'Sibiu','SV':'Suceava','TR':'Teleorman','TM':'Timiș','TL':'Tulcea','VS':'Vaslui','VL':'Vâlcea','VN':'Vrancea'};
  return m[nr.match(/^([A-Z]{1,2})/)?.[1] || ''] || null;
}

function extractCookies(h) { return h ? h.split(',').map(c=>c.split(';')[0].trim()).join('; ') : ''; }
function formatData(s) { if(!s) return null; try { const d=new Date(s); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; } catch { return s; } }
function calcZile(s) { if(!s) return null; try { return Math.ceil((new Date(s)-new Date())/86400000); } catch { return null; } }
function json(d,s=200) { return new Response(JSON.stringify(d),{status:s,headers:corsHeaders()}); }
function corsHeaders() { return {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Cache-Control':'no-store'}; }
