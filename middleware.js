import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = new URL(request.url);

  // Lasă API-urile să funcționeze mereu
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Lasă fișierele statice să treacă
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|json|xml|txt)$/)
  ) {
    return NextResponse.next();
  }

  // Verifică codul de preview
  const preview = searchParams.get('preview');
  if (preview === 'cata2026') {
    // Setează cookie ca să nu mai trebuiască codul la fiecare pagină
    const response = NextResponse.next();
    response.cookies.set('aa_preview', 'cata2026', { 
      maxAge: 60 * 60 * 24 * 7, // 7 zile
      path: '/' 
    });
    return response;
  }

  // Verifică cookie-ul de preview
  const previewCookie = request.cookies.get('aa_preview');
  if (previewCookie?.value === 'cata2026') {
    return NextResponse.next();
  }

  // Toți ceilalți văd Coming Soon
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoAssist — Lansare în curând</title>
  <meta name="description" content="AutoAssist — Prima platformă digitală auto din România. Lansare în curând.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      min-height: 100vh;
      background: #0a0a0f;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      overflow: hidden;
    }

    .bg {
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(ellipse at 20% 50%, rgba(79,125,255,0.12) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(0,232,154,0.08) 0%, transparent 50%);
      z-index: 0;
    }

    .content {
      position: relative;
      z-index: 1;
      max-width: 560px;
    }

    .logo-wrap {
      margin-bottom: 32px;
    }

    .logo-wrap img {
      height: 56px;
      filter: brightness(1.1);
    }

    .badge {
      display: inline-block;
      background: rgba(0,232,154,0.12);
      border: 1px solid rgba(0,232,154,0.3);
      color: #00e89a;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 20px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: clamp(28px, 6vw, 48px);
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h1 span {
      background: linear-gradient(135deg, #4f7dff, #00e89a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 16px;
      color: rgba(255,255,255,0.55);
      line-height: 1.7;
      margin-bottom: 40px;
    }

    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 40px;
    }

    .feature {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 8px 16px;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      font-weight: 500;
    }

    .notify-form {
      display: flex;
      gap: 10px;
      max-width: 400px;
      margin: 0 auto 24px;
    }

    .notify-form input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 13px 16px;
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .notify-form input:focus {
      border-color: rgba(79,125,255,0.5);
    }

    .notify-form input::placeholder {
      color: rgba(255,255,255,0.3);
    }

    .notify-form button {
      background: linear-gradient(135deg, #4f7dff, #00e89a);
      border: none;
      border-radius: 12px;
      padding: 13px 20px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s;
    }

    .notify-form button:hover { opacity: 0.85; }

    .contact {
      font-size: 13px;
      color: rgba(255,255,255,0.3);
    }

    .contact a {
      color: rgba(79,125,255,0.8);
      text-decoration: none;
    }

    .dots {
      display: flex;
      gap: 6px;
      justify-content: center;
      margin-bottom: 32px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      animation: pulse 1.5s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.3s; background: rgba(79,125,255,0.4); }
    .dot:nth-child(3) { animation-delay: 0.6s; background: rgba(0,232,154,0.4); }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.3); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="bg"></div>
  <div class="content">
    <div class="logo-wrap">
      <img src="/logo2.png" alt="AutoAssist" onerror="this.style.display='none'">
    </div>

    <div class="badge">🚀 Lansare în curând</div>

    <h1>Asistentul tău auto,<br><span>mereu disponibil</span></h1>

    <p>Prima platformă digitală din România care combină managementul complet al mașinii cu inteligență artificială. ITP, RCA, Rovinietă — toate într-un singur loc.</p>

    <div class="features">
      <div class="feature">🛡️ Verificare RCA</div>
      <div class="feature">🔬 Verificare ITP</div>
      <div class="feature">🛣️ Rovinietă</div>
      <div class="feature">🤖 Agenți AI</div>
      <div class="feature">🚗 Garaj virtual</div>
      <div class="feature">📄 Documente auto</div>
    </div>

    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>

    <div class="notify-form">
      <input type="email" placeholder="Email-ul tău" id="email-input">
      <button onclick="notify()">Notifică-mă</button>
    </div>

    <div class="contact">
      Întrebări? <a href="mailto:autoassist.romania@gmail.com">autoassist.romania@gmail.com</a>
    </div>
  </div>

  <script>
    function notify() {
      const email = document.getElementById('email-input').value;
      if (!email || !email.includes('@')) {
        document.getElementById('email-input').style.borderColor = 'rgba(255,80,80,0.5)';
        return;
      }
      document.querySelector('.notify-form').innerHTML = 
        '<div style="color:#00e89a;font-weight:600;font-size:15px">✅ Te vom notifica la lansare!</div>';
    }
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
