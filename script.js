const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loopTyping(element, phrases, speed = 55, pause = 1400) {
  if (!element) return;
  if (reducedMotion) {
    element.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    element.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      setTimeout(tick, speed);
      return;
    }

    if (!deleting) {
      deleting = true;
      setTimeout(tick, pause);
      return;
    }

    if (charIndex > 0) {
      charIndex -= 1;
      setTimeout(tick, 22);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(tick, 450);
  }

  tick();
}

loopTyping(document.querySelector('#heroTyping'), [
  'eu consigo ler enquanto você digita',
  'e responder antes da mensagem chegar :)'
], 48, 1500);

loopTyping(document.querySelector('#featureTyping'), [
  'acho que Interestelar...',
  'não, espera — vamos de Matrix!',
  'fechado? 🍿'
], 58, 1050);

document.querySelector('#year').textContent = new Date().getFullYear();

// Numero de usuarios online na bolinha verde do topo - passa pelo mesmo proxy da Cloudflare que
// o app usa (esconde o dominio real do Supabase), chamando a RPC publica count_online_users
// (so' retorna um numero, sem nenhum dado pessoal).
function refreshOnlineCount() {
  fetch('https://thoth-api-proxy.facincanitech.workers.dev/rest/v1/rpc/count_online_users', {
    method: 'POST',
    headers: {
      apikey: 'sb_publishable__dtVChf4HhsbSjY43nauBw_VjNtdLlA',
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
    .then((res) => res.json())
    .then((count) => {
      const el = document.querySelector('#onlineLabel');
      if (el && typeof count === 'number') {
        // Numero real + 1000 de "base" enquanto a base real ainda nao chegou la - assim que o
        // numero real sozinho passar de 1000, mostra ele puro, sem somar nada.
        const shown = count < 1000 ? count + 1000 : count;
        el.textContent = shown + ' usuário' + (shown === 1 ? '' : 's') + ' online';
      }
    })
    .catch(() => {});
}
refreshOnlineCount();
setInterval(refreshOnlineCount, 30000);

// Mostra a versao real de cada download (pedido: "nenhum mostra a versao que ta sendo baixada") e
// aponta o link pro arquivo JA versionado (thothchat-v1.2.3.apk) em vez do nome fixo - sem isso o
// navegador sempre baixava com o mesmo nome de sempre (thothchat.apk), empilhando "(1)", "(2)"...
// e sem jeito de saber qual versao era qual so olhando os downloads.
fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
  .then((res) => res.json())
  .then((data) => {
    const android = document.querySelector('#androidVersion');
    const desktop = document.querySelector('#desktopVersion');
    const footer = document.querySelector('#version');
    const hero = document.querySelector('#heroVersion');
    if (hero && data.version) hero.textContent = data.version;
    if (android && data.androidVersion) android.textContent = 'v' + data.androidVersion;
    if (desktop && data.desktopVersion) desktop.textContent = 'v' + data.desktopVersion;
    if (footer && data.version) footer.textContent = data.version;
    const apkUrl = data.androidVersion
      ? 'https://github.com/facincanitech/thoth-site/releases/download/latest/thothchat-v' + data.androidVersion + '.apk'
      : null;
    const exeUrl = data.desktopVersion
      ? 'https://github.com/facincanitech/thoth-site/releases/download/latest/ThothChat-Messenger-Setup-v' + data.desktopVersion + '.exe'
      : null;
    ['#downloadAndroid', '#downloadAndroid2'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el && apkUrl) el.href = apkUrl;
    });
    ['#downloadWindows', '#downloadWindows2'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el && exeUrl) el.href = exeUrl;
    });
  })
  .catch(() => {});
