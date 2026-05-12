(function () {
  // ─── PAGE TRANSITION ─────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:#06060a;opacity:1;pointer-events:none;transition:opacity 0.35s cubic-bezier(0.16,1,0.3,1);';
  document.body.appendChild(overlay);
  requestAnimationFrame(function() { requestAnimationFrame(function() { overlay.style.opacity = '0'; }); });

  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank' || link.hasAttribute('download')) return;
    if (href.startsWith('http') && !href.includes(location.hostname)) return;
    e.preventDefault();
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    setTimeout(function() { window.location.href = link.href; }, 320);
  });

  // ─── TEXT SCRAMBLE ON SECTION TITLES ─────────────────────────────────────────
  var SCHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$><_';

  function scramble(el) {
    var target = el.textContent.trim();
    el.dataset.orig = target;
    var frame = 0, FRAMES = 20;
    function tick() {
      el.textContent = target.split('').map(function(ch, i) {
        if (ch === ' ') return ' ';
        if (frame / FRAMES > i / target.length) return ch;
        return SCHARS[Math.floor(Math.random() * SCHARS.length)];
      }).join('');
      if (++frame <= FRAMES) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  var sIo = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      scramble(e.target);
      sIo.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  function initScramble() {
    document.querySelectorAll('.sec-title').forEach(function(el) { sIo.observe(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initScramble);
  else initScramble();

  // ─── MAGNETIC BUTTONS ─────────────────────────────────────────────────────────
  function initMagnetic() {
    document.querySelectorAll('.btn').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.28) + 'px,' + (dy * 0.28) + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1),color 0.2s,background 0.2s,border-color 0.2s,box-shadow 0.2s';
        btn.style.transform = '';
        setTimeout(function() { btn.style.transition = ''; }, 500);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMagnetic);
  else initMagnetic();
})();

// ─── CURSOR GLOW ──────────────────────────────────────────────────────────────
(function () {
  var glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,0.07) 0%,rgba(0,212,255,0.02) 45%,transparent 70%);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);opacity:0;transition:opacity 0.5s;';
  document.body.appendChild(glow);
  var on = false;
  document.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
    if (!on) { glow.style.opacity = '1'; on = true; }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; on = false; });
})();

// ─── MOUSE SPOTLIGHT ──────────────────────────────────────────────────────────
(function () {
  var spot = document.createElement('div');
  spot.style.cssText = 'position:fixed;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,0.025) 0%,transparent 70%);pointer-events:none;z-index:2;transform:translate(-50%,-50%);opacity:0;transition:opacity 0.7s;';
  document.body.appendChild(spot);
  var on = false;
  document.addEventListener('mousemove', function (e) {
    spot.style.left = e.clientX + 'px';
    spot.style.top  = e.clientY + 'px';
    if (!on) { spot.style.opacity = '1'; on = true; }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { spot.style.opacity = '0'; on = false; });
})();

// ─── FILM GRAIN ───────────────────────────────────────────────────────────────
(function () {
  var SIZE = 256;
  var off = document.createElement('canvas');
  off.width = off.height = SIZE;
  var octx = off.getContext('2d');
  var ni = octx.createImageData(SIZE, SIZE);
  for (var i = 0; i < ni.data.length; i += 4) {
    var v = Math.random() * 255 | 0;
    ni.data[i] = ni.data[i + 1] = ni.data[i + 2] = v;
    ni.data[i + 3] = 20;
  }
  octx.putImageData(ni, 0, 0);
  var gc = document.createElement('canvas');
  gc.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99990;opacity:0.045;';
  document.body.appendChild(gc);
  var gctx = gc.getContext('2d');
  var gW = 0, gH = 0, gPat, gf = 0;
  function gresize() {
    gW = gc.width = window.innerWidth;
    gH = gc.height = window.innerHeight;
    gPat = gctx.createPattern(off, 'repeat');
  }
  function gtick() {
    if (++gf % 4 === 0 && gPat) {
      var ox = (Math.random() * SIZE) | 0;
      var oy = (Math.random() * SIZE) | 0;
      gctx.save();
      gctx.translate(-ox, -oy);
      gctx.fillStyle = gPat;
      gctx.fillRect(ox, oy, gW + SIZE, gH + SIZE);
      gctx.restore();
    }
    requestAnimationFrame(gtick);
  }
  window.addEventListener('resize', gresize);
  gresize();
  gtick();
})();

// ─── BLUR-UP IMAGES ───────────────────────────────────────────────────────────
(function () {
  var s = document.createElement('style');
  s.textContent = '.proj-thumb img{transition:transform 0.45s cubic-bezier(0.16,1,0.3,1),filter 0.55s ease;}.proj-thumb img.blur-up{filter:blur(8px);}';
  document.head.appendChild(s);
  function init() {
    document.querySelectorAll('.proj-thumb img').forEach(function (img) {
      img.classList.add('blur-up');
      function reveal() { img.classList.remove('blur-up'); }
      if (img.complete && img.naturalWidth > 0) { setTimeout(reveal, 40); }
      else { img.addEventListener('load', reveal, { once: true }); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// ─── TERMINAL EASTER EGG (backtick to open) ───────────────────────────────────
(function () {
  var PAGES = { home: 'index.html', about: 'about.html', projects: 'projects.html', contact: 'contact.html', drive: 'drive.html' };
  var PROJECTS = [
    '  going-once        [unity]',
    '  ruinous-hunter    [unreal ue5]',
    '  mario-games       [unity & unreal]',
    '  tower-defense     [c++/opengl]',
    '  custom-engine     [c++/bgfx/box2d/jolt]',
    '  path-of-trials    [unreal]',
    '  2d-stealth        [unity]',
    '  survivors         [c++]',
    '  sprint-racer      [c++]',
    '  arcade-minigames  [unity]',
    '  ai-tank-combat    [unity]',
    '  ai-slot-cars      [unity]',
    '  asteroids         [c++]',
  ];
  var CMDS = {
    help: ['  help               show this list', '  whoami             who is this', '  ls                 list all projects', '  contact            show contact info', '  goto <page>        home | about | projects | contact | drive', '  sudo hire aly      ...', '  clear              clear terminal'],
    whoami: ['  name    →  aly embaby', '  role    →  gameplay programmer', '  stack   →  unity c#  /  unreal c++  /  c++', '  school  →  algonquin college — game dev', '  base    →  ottawa, ON', '  status  →  open to work'],
    ls: PROJECTS,
    contact: ['  email      aly.embabyy@gmail.com', '  github     github.com/aly44', '  linkedin   linkedin.com/in/aly-embaby'],
  };

  var ts = document.createElement('style');
  ts.textContent = '#term-egg{position:fixed;inset:0;z-index:999999;background:rgba(6,6,10,0.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.2s;}#term-egg.open{opacity:1;pointer-events:all;}#term-win{width:min(680px,92vw);background:#0a0a10;border:1px solid rgba(0,212,255,0.3);border-radius:8px;box-shadow:0 0 60px rgba(0,212,255,0.1),0 20px 60px rgba(0,0,0,0.8);overflow:hidden;font-family:"Courier New",Consolas,monospace;font-size:0.82rem;}#term-bar{display:flex;align-items:center;padding:9px 14px;background:rgba(0,212,255,0.05);border-bottom:1px solid rgba(0,212,255,0.1);}#term-bar span{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:5px;}#term-title{margin-left:auto;font-size:0.68rem;color:rgba(0,212,255,0.35);letter-spacing:.1em;white-space:nowrap;}#term-body{padding:14px;height:300px;overflow-y:auto;line-height:1.65;}#term-output .tl{white-space:pre;color:rgba(240,239,248,0.75);}#term-output .tl.tc{color:#00d4ff;}#term-output .tl.tok{color:#00e87a;}#term-output .tl.terr{color:#ff5f57;}#term-output .tl.twarn{color:#febc2e;}#term-row{display:flex;align-items:center;margin-top:6px;}#term-row span{color:#00d4ff;margin-right:6px;}#term-input{flex:1;background:transparent;border:none;outline:none;color:#f0eff8;font-family:inherit;font-size:inherit;}@media(hover:hover){html.term-open *{cursor:auto!important;}}';
  document.head.appendChild(ts);

  var ov = document.createElement('div'); ov.id = 'term-egg';
  var win = document.createElement('div'); win.id = 'term-win';
  var bar = document.createElement('div'); bar.id = 'term-bar';
  bar.innerHTML = '<span style="background:#ff5f57"></span><span style="background:#febc2e"></span><span style="background:#28c840"></span><div id="term-title">aly@portfolio ~ terminal</div>';
  var body = document.createElement('div'); body.id = 'term-body';
  var out = document.createElement('div'); out.id = 'term-output';
  var row = document.createElement('div'); row.id = 'term-row';
  row.innerHTML = '<span>&#62;</span>';
  var inp = document.createElement('input'); inp.id = 'term-input'; inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
  row.appendChild(inp); body.appendChild(out); body.appendChild(row);
  win.appendChild(bar); win.appendChild(body); ov.appendChild(win);
  document.body.appendChild(ov);

  var hist = [], hIdx = -1, isOpen = false;

  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function line(text, cls) {
    var d = document.createElement('div'); d.className = 'tl' + (cls ? ' ' + cls : '');
    d.textContent = text; out.appendChild(d); body.scrollTop = body.scrollHeight;
  }
  function blank() { line(''); }
  function prompt(text) {
    var d = document.createElement('div'); d.className = 'tl';
    d.innerHTML = '<span style="color:#00d4ff;">&#62; </span>' + esc(text);
    out.appendChild(d); body.scrollTop = body.scrollHeight;
  }
  function greet() { line('  aly.portfolio — type "help" for commands', 'tc'); blank(); }

  function run(cmd) {
    cmd = cmd.trim(); if (!cmd) return;
    hist.unshift(cmd); hIdx = -1;
    prompt(cmd);
    var parts = cmd.toLowerCase().split(/\s+/), base = parts[0];
    if (cmd.toLowerCase() === 'sudo hire aly') {
      blank(); line('  [sudo] password for recruiter: ********', 'twarn');
      setTimeout(function() {
        line('  verifying credentials...', 'twarn');
        setTimeout(function() {
          line('  access granted.', 'tok');
          line('  initiating hire sequence...', 'tok');
          setTimeout(function() { blank(); line('  offer letter sent to aly.embabyy@gmail.com', 'tok'); blank(); }, 500);
        }, 700);
      }, 350);
      return;
    }
    if (base === 'goto') {
      var pg = parts[1] ? parts[1].replace(/[\[\]<>]/g, '') : '';
      if (pg && PAGES[pg]) { line('  navigating to ' + pg + '...', 'tc'); setTimeout(function() { window.location.href = PAGES[pg]; }, 500); }
      else { line('  usage: goto <page>   home | about | projects | contact | drive', 'terr'); }
      return;
    }
    if (base === 'clear') { while (out.firstChild) out.removeChild(out.firstChild); return; }
    if (!CMDS[base]) { line('  command not found: ' + cmd + ' — try "help"', 'terr'); return; }
    blank(); CMDS[base].forEach(function(l) { line(l); }); blank();
  }

  function open() { isOpen = true; ov.classList.add('open'); document.documentElement.classList.add('term-open'); inp.focus(); }
  function close() { isOpen = false; ov.classList.remove('open'); document.documentElement.classList.remove('term-open'); }

  greet();

  document.addEventListener('keydown', function(e) {
    if (e.key === '`') { e.preventDefault(); isOpen ? close() : open(); return; }
    if (e.key === 'Escape' && isOpen) { close(); }
  });
  inp.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { var v = inp.value; inp.value = ''; run(v); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx < hist.length - 1) { hIdx++; inp.value = hist[hIdx]; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx > 0 ? (inp.value = hist[--hIdx]) : (hIdx = -1, inp.value = ''); }
  });
  ov.addEventListener('click', function(e) { if (e.target === ov) close(); });
})();

// ─── SECTION NUMBER COUNTER ───────────────────────────────────────────────────
(function () {
  function rollNum(el) {
    var orig = el.textContent.trim();
    var target = parseInt(orig, 10);
    if (isNaN(target)) return;
    var len = orig.length;
    var FRAMES = 22, f = 0;
    function tick() {
      f++;
      var val = Math.round(target * Math.min(f / FRAMES, 1));
      var s = val.toString();
      while (s.length < len) s = '0' + s;
      el.textContent = s;
      if (f < FRAMES) requestAnimationFrame(tick);
      else el.textContent = orig;
    }
    el.textContent = '0'.repeat(len);
    requestAnimationFrame(tick);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      rollNum(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.8 });
  function init() {
    document.querySelectorAll('.sec-num').forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
