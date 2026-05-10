// api/debug-rca.js — endpoint temporar pentru debug
// GET /api/debug-rca?nr=DB99CLN

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const nr = (req.query.nr || '').toUpperCase().replace(/\s/g, '');
  if (!nr) return res.status(400).json({ error: 'Nr lipsă' });

  try {
    // Pas 1: GET pagina AIDA
    const init = await fetch('https://www.aida.info.ro/polite-rca', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      }
    });

    const setCookie = init.headers.get('set-cookie') || '';
    const cookie = setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ');
    const htmlInit = await init.text();

    // Extrage token
    const tokenMatch = htmlInit.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1] : '';

    const azi = new Date();
    const dataStr = `${azi.getFullYear()}-${String(azi.getMonth()+1).padStart(2,'0')}-${String(azi.getDate()).padStart(2,'0')}`;

    const body = new URLSearchParams({
      'CriteriuCautare': '1',
      'NrInmatriculare': nr,
      'DataVerificare': dataStr,
      'acord': 'true',
    });
    if (token) body.set('__RequestVerificationToken', token);

    // Pas 2: POST cerere
    const res2 = await fetch('https://www.aida.info.ro/polite-rca', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.aida.info.ro',
        'Referer': 'https://www.aida.info.ro/polite-rca',
        'Cookie': cookie,
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      body: body.toString()
    });

    const htmlResult = await res2.text();

    // Returnăm primii 3000 caractere din HTML ca să vedem ce conține
    return res.json({
      nr,
      status: res2.status,
      hadToken: !!token,
      cookie: cookie.substring(0, 100),
      htmlLength: htmlResult.length,
      // Primele 3000 caractere din răspuns
      htmlPreview: htmlResult.substring(0, 3000),
      // Toate datele găsite în format DD.MM.YYYY
      datesFound: htmlResult.match(/([0-9]{2}[.][0-9]{2}[.][0-9]{4})/g) || [],
      // Cuvinte cheie relevante
      hasValid: !!htmlResult.match(/valid[aă]|valabil/i),
      hasExpired: !!htmlResult.match(/expir[at]+|nu exist/i),
      hasPolita: !!htmlResult.match(/poli[tț][aă]/i),
    });

  } catch(e) {
    return res.json({ error: e.message, stack: e.stack });
  }
};
