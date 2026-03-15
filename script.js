// === script.js — full interactive functionality ===
(function() {
  // cursor
  const cur = document.getElementById('cursor'), cur2 = document.getElementById('cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur2.style.left = mx + 'px'; cur2.style.top = my + 'px'; });
  (function loop() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cur.style.left = cx + 'px';
    cur.style.top = cy + 'px';
    requestAnimationFrame(loop);
  })();
  
  // cursor hover effect
  document.querySelectorAll('a, button, .mitem, .sig-card, .feat, .fact-card, .rev-card, .spec-card, .moss, .creature-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.width = '36px';
      cur.style.height = '36px';
      cur.style.background = 'rgba(64,212,232,0.08)';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.width = '20px';
      cur.style.height = '20px';
      cur.style.background = 'transparent';
    });
  });

  // ocean bg canvas
  const bgCanvas = document.getElementById('ocean-bg'), bgCtx = bgCanvas.getContext('2d');
  let W, H;
  function resizeBg() {
    W = bgCanvas.width = window.innerWidth;
    H = bgCanvas.height = window.innerHeight;
  }
  resizeBg();
  window.addEventListener('resize', resizeBg);
  
  let bgT = 0;
  function drawOceanBg() {
    bgT += 0.003;
    const grd = bgCtx.createRadialGradient(
      W * 0.5 + Math.sin(bgT) * 100, H, 0,
      W * 0.5, H * 0.5, Math.max(W, H)
    );
    grd.addColorStop(0, 'rgba(13,100,152,0.08)');
    grd.addColorStop(0.4, 'rgba(9,64,112,0.04)');
    grd.addColorStop(1, 'rgba(2,12,23,0)');
    
    bgCtx.clearRect(0, 0, W, H);
    bgCtx.fillStyle = grd;
    bgCtx.fillRect(0, 0, W, H);
    
    // caustic light patterns
    bgCtx.save();
    bgCtx.globalAlpha = 0.03;
    for (let i = 0; i < 6; i++) {
      const x = W * (i / 6) + Math.sin(bgT + i) * 80;
      const y = H * (0.1 + Math.cos(bgT * 0.7 + i) * 0.05);
      const r = 60 + Math.sin(bgT * 1.3 + i) * 20;
      const g = bgCtx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(64,212,232,1)');
      g.addColorStop(1, 'rgba(64,212,232,0)');
      bgCtx.fillStyle = g;
      bgCtx.beginPath();
      bgCtx.ellipse(x, y, r, r * 0.4, Math.sin(bgT + i) * 0.5, 0, Math.PI * 2);
      bgCtx.fill();
    }
    bgCtx.restore();
    
    requestAnimationFrame(drawOceanBg);
  }
  drawOceanBg();

  // bubble canvas
  const bubCanvas = document.getElementById('bubble-canvas'), bubCtx = bubCanvas.getContext('2d');
  function resizeBub() {
    bubCanvas.width = window.innerWidth;
    bubCanvas.height = window.innerHeight;
  }
  resizeBub();
  window.addEventListener('resize', resizeBub);
  
  let bubbles = [];
  function mkBub() {
    return {
      x: Math.random() * bubCanvas.width,
      y: bubCanvas.height + 20,
      r: Math.random() * 7 + 1.5,
      s: Math.random() * 0.6 + 0.2,
      op: Math.random() * 0.3 + 0.06,
      drift: (Math.random() - 0.5) * 0.35,
      wobble: Math.random() * Math.PI * 2
    };
  }
  for (let i = 0; i < 60; i++) {
    let b = mkBub();
    b.y = Math.random() * bubCanvas.height;
    bubbles.push(b);
  }
  
  function drawBubbles() {
    bubCtx.clearRect(0, 0, bubCanvas.width, bubCanvas.height);
    
    bubbles.forEach((b, i) => {
      b.y -= b.s;
      b.wobble += 0.02;
      b.x += Math.sin(b.wobble) * 0.4 + b.drift;
      
      if (b.y < -20) {
        bubbles[i] = mkBub();
      }
      
      // draw bubble outline
      bubCtx.beginPath();
      bubCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      bubCtx.strokeStyle = `rgba(64,212,232,${b.op})`;
      bubCtx.lineWidth = 0.8;
      bubCtx.stroke();
      
      // draw highlight
      bubCtx.beginPath();
      bubCtx.arc(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
      bubCtx.fillStyle = `rgba(255,255,255,${b.op * 0.5})`;
      bubCtx.fill();
    });
    
    requestAnimationFrame(drawBubbles);
  }
  drawBubbles();

  // fish canvas
  const fishCanvas = document.getElementById('fish-canvas'), fishCtx = fishCanvas.getContext('2d');
  function resizeFish() {
    fishCanvas.width = window.innerWidth;
    fishCanvas.height = window.innerHeight;
  }
  resizeFish();
  window.addEventListener('resize', resizeFish);
  
  const fishEmojis = ['🐠', '🐟', '🐡'];
  let fishArr = [];
  
  function mkFish() {
    const e = fishEmojis[Math.floor(Math.random() * fishEmojis.length)];
    const sz = 20 + Math.random() * 28;
    const speed = (Math.random() * 1.2 + 0.4) * (Math.random() < 0.5 ? 1 : -1);
    return {
      emoji: e,
      x: speed > 0 ? -60 : fishCanvas.width + 60,
      y: Math.random() * fishCanvas.height * 0.8 + fishCanvas.height * 0.1,
      speed,
      sz,
      wobble: 0,
      wobbleAmt: Math.random() * 3 + 1,
      opacity: Math.random() * 0.25 + 0.08
    };
  }
  for (let i = 0; i < 6; i++) {
    let f = mkFish();
    f.x = Math.random() * fishCanvas.width;
    fishArr.push(f);
  }
  
  function drawFish() {
    fishCtx.clearRect(0, 0, fishCanvas.width, fishCanvas.height);
    
    fishArr.forEach((f, i) => {
      f.x += f.speed;
      f.wobble += 0.04;
      const yWobble = Math.sin(f.wobble) * f.wobbleAmt;
      
      if (f.speed > 0 && f.x > fishCanvas.width + 80) {
        fishArr[i] = mkFish();
      }
      if (f.speed < 0 && f.x < -80) {
        let nf = mkFish();
        nf.speed = Math.abs(nf.speed) * -1;
        fishArr[i] = nf;
      }
      
      fishCtx.save();
      fishCtx.globalAlpha = f.opacity;
      fishCtx.font = `${f.sz}px serif`;
      fishCtx.textAlign = 'center';
      fishCtx.textBaseline = 'middle';
      
      if (f.speed < 0) {
        fishCtx.translate(f.x, f.y + yWobble);
        fishCtx.scale(-1, 1);
        fishCtx.fillText(f.emoji, 0, 0);
      } else {
        fishCtx.fillText(f.emoji, f.x, f.y + yWobble);
      }
      
      fishCtx.restore();
    });
    
    requestAnimationFrame(drawFish);
  }
  drawFish();

  // shimmer orbs
  const sw = document.getElementById('shimmer-wrap');
  for (let i = 0; i < 5; i++) {
    let s = document.createElement('div');
    s.className = 'shimmer';
    let sz = 200 + Math.random() * 300;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-duration:${8 + Math.random() * 8}s;animation-delay:${Math.random() * 8}s;`;
    sw.appendChild(s);
  }

  // caustic rays
  const caustics = document.getElementById('caustics');
  for (let i = 0; i < 12; i++) {
    let r = document.createElement('div');
    r.className = 'ray';
    let h = 200 + Math.random() * 400;
    let ra = (Math.random() - 0.5) * 60;
    r.style.cssText = `left:${Math.random() * 100}%;height:${h}px;width:${2 + Math.random() * 4}px;--ra:${ra}deg;animation-duration:${6 + Math.random() * 8}s;animation-delay:${Math.random() * 8}s;`;
    caustics.appendChild(r);
  }

  // kelp
  const kelpLayer = document.getElementById('kelp-layer');
  const kelpColors = [
    ['rgba(26,154,100,0.6)', 'rgba(15,90,60,0.8)'],
    ['rgba(20,120,80,0.5)', 'rgba(10,70,45,0.7)']
  ];
  for (let i = 0; i < 22; i++) {
    let k = document.createElement('div');
    k.className = 'kelp';
    let [c, cd] = kelpColors[Math.floor(Math.random() * kelpColors.length)];
    let w = 30 + Math.random() * 60;
    let h = 100 + Math.random() * 200;
    let rot = (Math.random() - 0.5) * 20;
    k.style.cssText = `--kw:${w}px;--kh:${h}px;--kc:${c};--kcd:${cd};--kd:${4 + Math.random() * 4}s;--kdl:${Math.random() * 4}s;--kr:${rot}deg;--km:${Math.random() * -10}px;`;
    kelpLayer.appendChild(k);
  }

  // jellyfish
  const jellyLayer = document.getElementById('jelly-layer');
  const jellyColors = [
    [64, 212, 232],
    [200, 164, 74],
    [168, 237, 240]
  ];
  for (let i = 0; i < 4; i++) {
    let [r, g, b] = jellyColors[i % jellyColors.length];
    let size = 40 + Math.random() * 60;
    let dur = 15 + Math.random() * 20;
    let startX = 10 + Math.random() * 80;
    
    let jDiv = document.createElement('div');
    jDiv.className = 'jelly';
    jDiv.style.cssText = `
      left:${startX}%;
      --jr:${r};--jg:${g};--jb:${b};
      --jw:${size}px;
      --jd:${dur}s;
      animation-duration:${dur}s;
      animation-delay:${Math.random() * -dur}s;
      --jdx1:${(Math.random() - 0.5) * 100}px;
      --jdx2:${(Math.random() - 0.5) * 150}px;
      --jdx3:${(Math.random() - 0.5) * 100}px;
      --jdx4:${(Math.random() - 0.5) * 80}px;
    `;
    
    let body = document.createElement('div');
    body.className = 'jelly-body';
    
    let tent = document.createElement('div');
    tent.className = 'jelly-tent';
    
    for (let t = 0; t < 5 + Math.floor(Math.random() * 4); t++) {
      let sp = document.createElement('span');
      let th = 30 + Math.random() * 50;
      let td = (1 + Math.random() * 2) + 's';
      sp.style.cssText = `height:${th}px;--td:${td};`;
      tent.appendChild(sp);
    }
    
    body.appendChild(tent);
    jDiv.appendChild(body);
    jellyLayer.appendChild(jDiv);
  }

  // nav scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', scrollY > 50);
  });

  // mobile menu
  document.getElementById('ham').addEventListener('click', () => {
    document.getElementById('navl').classList.toggle('open');
  });

  // menu tabs
  document.querySelectorAll('.mtab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(x => x.classList.remove('on'));
      document.querySelectorAll('.msec').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      document.getElementById('tab-' + t.dataset.tab).classList.add('on');
    });
  });

  // reveal observer
  const ro = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('.rv, .rvl, .rvr').forEach(el => ro.observe(el));

  // reservation mock
  window.handleRes = function(btn) {
    let orig = btn.innerHTML;
    btn.innerHTML = '<span>✓ Confirmed! See you at the shore 🌊</span>';
    btn.style.background = 'linear-gradient(135deg,#19a8c4,#052540)';
    btn.style.pointerEvents = 'none';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.pointerEvents = '';
    }, 4000);
  };

  // active nav highlight
  const secs = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const sy = scrollY + 130;
    secs.forEach(s => {
      let a = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (a) {
        a.style.color = (sy >= s.offsetTop && sy < s.offsetTop + s.offsetHeight) ? 'var(--goldlt)' : '';
      }
    });
  });
})();
