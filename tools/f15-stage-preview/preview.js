/* F15 THREE-DANCER STAGE PREVIEW — CANDIDATE, PENDING UBE STAGE REVIEW.
   Preview-only. No money, progression, dates, saves or relationship mechanics. */
(function () {
  'use strict';
  var F06_SRC = '../../js/frag/F06/make_it_rain.js';
  var FPS = 24;
  var DRAW_CALL = 'drawTarget(L, tx, spot, N);';   // F06 placeholder mannequin; the only thing removed (in memory)
  var HEADROOM_PX = 6, TALLEST_MASTER_PX = 600;
  var DECK_FEET_FRAC = 0.55;                       // same feet line the F06 mannequin stands on

  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), gameCanvas = $('stage-canvas'), over = $('dancers');
  var octx = over.getContext('2d');
  var cfg, man, game, sheets = {};
  var st = { rings: true, layout: null, selected: null, playing: true, elapsed: 0, lastNow: 0, key: '' };
  var geo = { stageW: 0, stageH: 0, feetY: 0, k: 1, dpr: 1, hudBottom: 0, boxes: {} };

  function getJSON(u) { return fetch(u, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }
  function loadImg(u) {
    return new Promise(function (ok, bad) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { bad(new Error(u)); }; i.src = u; });
  }

  // The real F06 club renderer, unmodified on disk; only the placeholder target call is dropped in memory.
  function bootClub() {
    return fetch(F06_SRC, { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (src) {
      if (src.indexOf(DRAW_CALL) < 0) throw new Error('F06 renderer changed: placeholder call not found');
      var s = document.createElement('script');
      s.textContent = src.replace(DRAW_CALL, '/* preview: placeholder mannequin removed */') + '\n//# sourceURL=F06-make_it_rain.patched-in-memory.js';
      document.head.appendChild(s);
      game = window.RAMakeItRainSandbox.mount(gameCanvas, {
        seed: 1,
        onRoundEnd: function () { setTimeout(function () { game.startRound(game.core.budget); }, 60); }
      });
      window.makeItRainGame = game;
      game.startRound(10000);
    });
  }

  function layoutDef() { return cfg.layouts[st.layout]; }
  function slots() { return layoutDef().slots.slice().sort(function (a, b) { return a.z - b.z; }); }

  function measure() {
    var sr = stage.getBoundingClientRect(), cr = gameCanvas.getBoundingClientRect();
    var W = stage.clientWidth, H = stage.clientHeight;
    var dpr = Math.min(3, window.devicePixelRatio || 1);
    var logicalH = gameCanvas.height || 1;
    var deckTop = Math.round(logicalH * 0.43), deckH = Math.round(logicalH * 0.075);
    var scale = cr.height / logicalH;                                   // F06 SCALE (2)
    var offY = (cr.top - sr.top) - stage.clientTop;
    geo.stageW = W; geo.stageH = H; geo.dpr = dpr;
    geo.feetY = offY + (deckTop + Math.round(deckH * DECK_FEET_FRAC)) * scale;
    // Fixed per layout/viewport (never per frame): width-proportional scale, capped so the tallest dancer
    // (WOLF, 600 master px) keeps HEADROOM_PX clear of the F06 HUD on short stages.
    var kw = layoutDef().refScale * W / layoutDef().refStageWidth;
    var kh = (geo.feetY - (offY + 61 * scale) - HEADROOM_PX) / TALLEST_MASTER_PX;
    geo.kWidth = kw; geo.kHeadroom = kh; geo.k = Math.min(kw, kh); geo.clamped = kh < kw;
    geo.hudBottom = offY + 61 * scale;                                  // F06 lamp-head / wall top (logical y 61)
  }

  function frameFor(id) {
    var n = man.dancers[id].frames;
    return Math.floor(st.elapsed / (1000 / FPS)) % n;
  }

  function draw() {
    var W = geo.stageW, H = geo.stageH, dpr = geo.dpr;
    var cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (over.width !== cw || over.height !== ch) { over.width = cw; over.height = ch; }
    over.style.width = W + 'px'; over.style.height = H + 'px';
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, cw, ch);
    octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high';
    geo.boxes = {};
    var list = slots();
    // floor marks first (under every dancer): selected = cyan pool (gold stays reserved for F06's moving hit zone), others = dim ring
    if (st.rings) list.forEach(function (s) {
      var cx = s.cx * W * dpr, cy = geo.feetY * dpr, rx = 0.30 * 464 * geo.k * (s.scaleMul || 1) * dpr, ry = Math.max(3 * dpr, rx * 0.2);
      var sel = s.id === st.selected;
      octx.beginPath(); octx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      if (sel) { octx.fillStyle = 'rgba(95,227,255,0.22)'; octx.fill(); }
      octx.lineWidth = (sel ? 2 : 1) * dpr; octx.strokeStyle = sel ? '#5fe3ff' : 'rgba(164,159,192,0.45)'; octx.stroke();
    });
    list.forEach(function (s) {
      var d = man.dancers[s.id], img = sheets[s.id], f = frameFor(s.id), k = geo.k * (s.scaleMul || 1);
      var dw = d.cell[0] * 3 * k, dh = d.cell[1] * 3 * k;
      var dx = s.cx * W - d.anchor_in_cell_px[0] * 3 * k, dy = geo.feetY - dh;
      octx.drawImage(img, (f % d.cols) * d.cell[0], Math.floor(f / d.cols) * d.cell[1], d.cell[0], d.cell[1],
        Math.round(dx * dpr), Math.round(dy * dpr), Math.round(dw * dpr), Math.round(dh * dpr));
      geo.boxes[s.id] = { x: dx, y: dy, w: dw, h: dh, frame: f };
    });
  }

  function tick(now) {
    if (st.playing && st.lastNow) st.elapsed += now - st.lastNow;
    st.lastNow = now;
    measure();
    var fr = Object.keys(man.dancers).map(frameFor).join(',');
    var key = [st.rings, fr, st.layout, st.selected, geo.stageW, geo.stageH, geo.feetY, geo.dpr].join('|');
    if (key !== st.key) { st.key = key; draw(); }
    requestAnimationFrame(tick);
  }

  function select(id) {
    st.selected = id;
    Array.prototype.forEach.call($('pv-select').children, function (b) { b.setAttribute('aria-checked', b.dataset.id === id ? 'true' : 'false'); });
    st.key = '';
  }
  function setLayout(name) {
    st.layout = name;
    $('pv-layout').textContent = 'LAYOUT ' + (name === 'recommended' ? 'A' : 'B');
    $('pv-note').textContent = layoutDef().title;
    st.key = '';
  }
  function setPlaying(p) { st.playing = p; $('pv-pause').textContent = p ? 'PAUSE' : 'PLAY'; $('pv-pause').setAttribute('aria-pressed', p ? 'false' : 'true'); }

  function buildUI() {
    var order = layoutDef().slots.map(function (s) { return s.id; });
    order.forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.dataset.id = id; b.setAttribute('role', 'radio');
      b.textContent = cfg.labels[id];
      b.addEventListener('click', function () { select(id); });
      $('pv-select').appendChild(b);
    });
    $('pv-pause').addEventListener('click', function () { setPlaying(!st.playing); });
    $('pv-restart').addEventListener('click', function () { st.elapsed = 0; st.lastNow = performance.now(); st.key = ''; });
    $('pv-layout').addEventListener('click', function () {
      var names = Object.keys(cfg.layouts); setLayout(names[(names.indexOf(st.layout) + 1) % names.length]);
    });
  }

  Promise.all([getJSON('layouts.json'), getJSON('runtime_candidates/manifest.json')]).then(function (r) {
    cfg = r[0]; man = r[1];
    return Promise.all(Object.keys(man.dancers).map(function (id) {
      return loadImg('runtime_candidates/' + man.dancers[id].file).then(function (i) { sheets[id] = i; });
    }));
  }).then(function () {
    st.layout = cfg.defaultLayout;
    buildUI(); setLayout(st.layout); setPlaying(true);
    select(layoutDef().slots[1].id);
    return bootClub();
  }).then(function () {
    st.lastNow = performance.now(); requestAnimationFrame(tick);
    window.f15Preview = {
      state: function () {
        return { layout: st.layout, selected: st.selected, playing: st.playing, elapsedMs: st.elapsed,
          frames: Object.keys(man.dancers).reduce(function (o, id) { o[id] = frameFor(id); return o; }, {}), geo: geo };
      },
      select: select, setLayout: setLayout, setPlaying: setPlaying,
      setRings: function (v) { st.rings = !!v; st.key = ''; },   // QA only
      seek: function (ms) { st.elapsed = ms; st.key = ''; },   // deterministic capture hook (QA only)
      restart: function () { $('pv-restart').click(); }
    };
  }).catch(function (e) {
    document.body.insertAdjacentHTML('afterbegin', '<pre style="color:#ff5a5f;padding:8px;white-space:pre-wrap">PREVIEW FAILED: ' + e.message + '</pre>');
    console.error(e);
  });
})();
