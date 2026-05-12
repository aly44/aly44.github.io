(function () {
  const canvas = document.getElementById('page-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], mx = -9999, my = -9999;
  let prevMx = -9999, prevMy = -9999, cursorEnergy = 0;
  window.addEventListener('mousemove', function(e) {
    if (prevMx > -9000) {
      const spd = Math.hypot(e.clientX - prevMx, e.clientY - prevMy);
      cursorEnergy = Math.min(1, cursorEnergy + spd * 0.012);
    }
    prevMx = e.clientX; prevMy = e.clientY;
    mx = e.clientX; my = e.clientY;
  }, { passive: true });
  window.addEventListener('click', function(e) {
    pts.forEach(function(a) {
      var dx = a.x - e.clientX, dy = a.y - e.clientY;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 180 && d > 0) { var f = (1 - d / 180) * 1.5; a.vx += (dx / d) * f; a.vy += (dy / d) * f; }
    });
  }, { passive: true });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makePt() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
      r:  Math.random() * 0.9 + 0.2
    };
  }

  function frame() {
    cursorEnergy *= 0.96;
    ctx.clearRect(0, 0, W, H);
    const n = pts.length;
    const maxSpd   = 0.38 + cursorEnergy * 1.6;
    const lineBase = 0.09 + cursorEnergy * 0.11;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      if (cursorEnergy > 0.08) {
        a.vx += (Math.random() - 0.5) * cursorEnergy * 0.04;
        a.vy += (Math.random() - 0.5) * cursorEnergy * 0.04;
      }
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
      if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
      const _pdx = mx - a.x, _pdy = my - a.y, _pd2 = _pdx*_pdx + _pdy*_pdy;
      if (_pd2 < 17000 && _pd2 > 100) { const _pd = Math.sqrt(_pd2); a.vx += (_pdx/_pd)*0.003; a.vy += (_pdy/_pd)*0.003; }
      const _spd = Math.hypot(a.vx, a.vy); if (_spd > maxSpd) { a.vx *= maxSpd/_spd; a.vy *= maxSpd/_spd; }

      for (let j = i + 1; j < n; j++) {
        const b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${lineBase * (1 - d / 160)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.28)';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  pts = Array.from({ length: 65 }, makePt);
  frame();
})();

(function () {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, sparks = [], lastSpawn = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', function (e) {
    const now = Date.now();
    if (now - lastSpawn < 28) return;
    lastSpawn = now;
    sparks.push({
      x:    e.clientX,
      y:    e.clientY,
      vx:   (Math.random() - 0.5) * 2.2,
      vy:   (Math.random() - 0.5) * 2.2 - 0.8,
      life: 1,
      size: 1.5 + Math.random() * 2.5,
      col:  Math.random() < 0.72 ? '0,212,255' : '157,120,245'
    });
  }, { passive: true });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= 0.05;
      s.vx   *= 0.97;
      s.vy   += 0.045;
      s.x    += s.vx;
      s.y    += s.vy;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.col},${s.life * 0.78})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  frame();
})();

(function () {
  let _ac = null;
  function _getAC() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    return _ac;
  }

  function playHover() {
    try {
      const ac  = _getAC();
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = 700;
      g.gain.setValueAtTime(0.035, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.001, ac.currentTime + 0.06);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.06);
    } catch (e) {}
  }

  function playClick() {
    try {
      const ac  = _getAC();
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = 520;
      g.gain.setValueAtTime(0.05, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.001, ac.currentTime + 0.09);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.09);
    } catch (e) {}
  }

  function attachSounds(root) {
    root.querySelectorAll('a,button').forEach(function (el) {
      if (el._soundsBound) return;
      el._soundsBound = true;
      el.addEventListener('mouseenter', playHover, { passive: true });
      el.addEventListener('click', playClick, { passive: true });
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    attachSounds(document);

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches('a,button')) {
            if (!node._soundsBound) {
              node._soundsBound = true;
              node.addEventListener('mouseenter', playHover, { passive: true });
              node.addEventListener('click', playClick, { passive: true });
            }
          }
          attachSounds(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
