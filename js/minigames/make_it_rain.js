// RAINMAKER / MAKE IT RAIN — SANDBOX ADAPTER (F06-A, OL-011 PARALLEL_SAFE Wave 0)
//
// Grey-box harness around the reusable core (js/systems/rainmaker/make_it_rain_core.js).
// This file owns rendering + pointer input + round lifecycle for the SANDBOX ONLY.
// The future full RAINMAKER scene replaces this adapter and keeps the core intact.
//
// ISOLATION: no shared registration, no WAKE hooks, no phone app, no persistence by default.
// ART: neutral geometric DEVELOPMENT PLACEHOLDER shapes only. No characters, no identity.
// AUDIO: inert hooks only. No sound is loaded, sourced or played.
(function (global) {
  'use strict';

  var VERSION = 1;

  function noop() {}

  function defaultAudioHooks() {
    // Authored hook opportunities preserved for the full build. All inert (silent) in the sandbox.
    return {
      onRoundStart: noop,
      onLoad: noop,
      onFlick: noop,
      onHit: noop,
      onMiss: noop,
      onOverthrow: noop,
      onBeat: noop,
      onFan: noop,
      onStreak: noop,
      onStorm: noop,
      onResult: noop
    };
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function formatMoney(n) {
    n = Math.round(n || 0);
    return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function createGame(canvas, options) {
    options = options || {};
    var T = global.RAMakeItRainTunables;
    var Core = global.RAMakeItRainCore;
    if (!T || !Core) throw new Error('make_it_rain adapter requires tunables + core');
    var tunables = T.merge(T.defaults, options.tunables || {});
    var hooks = Object.assign(defaultAudioHooks(), options.audio || {});

    var core = Core.create({ tunables: tunables, seed: options.seed });

    var ctx = canvas.getContext('2d');
    var cssW = 1, cssH = 1, dpr = 1;
    var running = false, rafId = 0;
    var roundStart = 0;
    var lastFrame = 0;
    var animations = [];
    var popups = [];
    var shake = 0;
    var pointer = null;          // {id, samples:[{x,y,t}], lastX, lastY, active}
    var hintUntil = 0;
    var lastBeatIndex = -1;
    var stormed = false;

    // ---------------- coordinate helpers ----------------
    function fit() {
      var rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function toNorm(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1),
        y: clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1)
      };
    }

    // ---------------- round lifecycle ----------------
    function startRound(budget) {
      core.reset({ budget: budget == null ? tunables.round.defaultBudget : budget });
      animations.length = 0;
      popups.length = 0;
      shake = 0;
      stormed = false;
      lastBeatIndex = -1;
      pointer = null;
      roundStart = now();
      hintUntil = roundStart + 4200;
      running = true;
      hooks.onRoundStart({ budget: core.budget });
      if (!rafId) rafId = requestAnimationFrame(frame);
      return core.state();
    }
    function reset() { return startRound(core.budget); }

    function now() {
      return (global.performance && global.performance.now) ? global.performance.now() : Date.now();
    }

    // ---------------- pointer input ----------------
    function velocityFromSamples(samples, t) {
      var windowMs = options.velocityWindowMs || 110;
      var fresh = samples.filter(function (s) { return t - s.t <= windowMs; });
      if (fresh.length < 2) fresh = samples.slice(-2);
      if (fresh.length < 2) return { vx: 0, vy: 0 };
      var a = fresh[0], b = fresh[fresh.length - 1];
      var dt = Math.max(1, b.t - a.t);
      return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
    }

    function onDown(ev) {
      if (core.ended) return;
      var p = toNorm(ev.clientX, ev.clientY);
      if (p.y < (tunables.stack.startZoneTop == null ? 0.42 : tunables.stack.startZoneTop)) return; // must begin on the roll
      ev.preventDefault();
      if (canvas.setPointerCapture && ev.pointerId != null) { try { canvas.setPointerCapture(ev.pointerId); } catch (e) {} }
      var t = now() - roundStart;
      pointer = { id: ev.pointerId, active: true, samples: [{ x: p.x, y: p.y, t: t }], lastX: p.x, lastY: p.y };
      core.beginDrag({ x: p.x, y: p.y, t: t });
    }
    function onMove(ev) {
      if (!pointer || !pointer.active || (ev.pointerId != null && pointer.id != null && ev.pointerId !== pointer.id)) return;
      ev.preventDefault();
      var p = toNorm(ev.clientX, ev.clientY);
      var t = now() - roundStart;
      pointer.samples.push({ x: p.x, y: p.y, t: t });
      if (pointer.samples.length > 24) pointer.samples.shift();
      pointer.lastX = p.x; pointer.lastY = p.y;
      core.dragTo({ x: p.x, y: p.y, t: t });
      var load = core.state().load;
      if (load) hooks.onLoad({ bills: load.bills });
    }
    function onUp(ev) {
      if (!pointer || !pointer.active) return;
      if (ev.pointerId != null && pointer.id != null && ev.pointerId !== pointer.id) return;
      ev.preventDefault();
      pointer.active = false;
      var t = now() - roundStart;
      var v = velocityFromSamples(pointer.samples, t);
      var p = toNorm(ev.clientX, ev.clientY);
      var load = core.state().load;
      var result = core.release({ vx: v.vx, vy: v.vy, x: p.x, y: p.y, t: t });
      resolveFeedback(result, load);
      pointer = null;
    }
    function onCancel(ev) {
      if (!pointer) return;
      if (ev && ev.pointerId != null && pointer.id != null && ev.pointerId !== pointer.id) return;
      pointer = null;
      core.cancelDrag();
    }

    function resolveFeedback(result, load) {
      if (!result || result.kind === 'invalid') return;
      hooks.onFlick(result);
      var speed = clamp(result.speed / tunables.aim.maxSpeed, 0, 1);
      var fanAnim = {
        kind: result.kind, bills: result.bills, t0: now(),
        from: { x: 0.5, y: 0.80 }, to: { x: result.landingX, y: 0.34 },
        arc: 0.10 + speed * tunables.aim.arcSpeedScale, spread: result.fan ? 0.06 : 0.035,
        dur: tunables.feedback.billFlyMs, fan: !!result.fan, seed: result.bills * 7 + result.dollars
      };
      animations.push(fanAnim);

      if (result.kind === 'hit') {
        popups.push({ text: '+' + Math.round(result.hypeGained) + ' HYPE', x: result.targetX, y: 0.26, t0: now(), ttl: 900, color: tunables.visual.hype });
        if (result.onBeat) popups.push({ text: 'ON BEAT x' + tunables.hype.onBeat, x: 0.5, y: 0.14, t0: now(), ttl: 800, color: tunables.visual.beat });
        if (result.fan) popups.push({ text: 'FAN! +CROWD', x: 0.5, y: 0.20, t0: now(), ttl: 800, color: tunables.visual.crowd });
        if (result.streak >= 2) popups.push({ text: 'STREAK x' + result.streak, x: 0.5, y: 0.05, t0: now(), ttl: 800, color: tunables.visual.text });
        hooks.onHit(result);
        if (result.fan) hooks.onFan(result);
        if (result.onBeat) hooks.onBeat(result);
        if (result.streak >= 2) hooks.onStreak(result);
      } else {
        popups.push({ text: result.kind === 'overthrow' ? 'BAD WINDOW — WASTED' : 'MISS — FLOOR', x: result.landingX, y: 0.30, t0: now(), ttl: 1000, color: tunables.visual.waste });
        shake = tunables.feedback.shakeMs;
        hooks.onMiss(result);
        if (result.kind === 'overthrow') hooks.onOverthrow(result);
      }
    }

    // ---------------- update ----------------
    function frame(ts) {
      rafId = 0;
      if (!running) return;
      fit();
      var t = now() - roundStart;
      core.advance(t);

      var beat = core.beatAt(t);
      if (beat.onBeat && beat.index !== lastBeatIndex) {
        lastBeatIndex = beat.index;
        hooks.onBeat({ index: beat.index, perfect: beat.perfect });
      }
      if (!stormed && core.crowd >= tunables.hype.stormThreshold) { stormed = true; hooks.onStorm({ crowd: core.crowd }); }

      animations = animations.filter(function (a) { return now() - a.t0 < a.dur + 260; });
      popups = popups.filter(function (p) { return now() - p.t0 < p.ttl; });
      if (shake > 0) shake = Math.max(0, shake - 16);

      draw(t);
      if (core.ended) {
        running = false;
        hooks.onResult(core.summary());
        drawResult();
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    // ---------------- draw ----------------
    function draw(t) {
      var V = tunables.visual;
      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * shake * 0.12, (Math.random() - 0.5) * shake * 0.12);
      // stage
      ctx.fillStyle = V.stage; ctx.fillRect(-20, -20, cssW + 40, cssH + 40);
      drawRails(V);
      drawFloor(V);
      drawSpotlight(t, V);
      drawTarget(t, V);
      drawStack(V);
      drawDragFan(V);
      drawAnimations(V);
      drawBeatStrip(t, V);
      drawMeters(t, V);
      drawPopups(t, V);
      if (t < hintUntil && core.flicks === 0 && !(pointer && pointer.active)) drawHint(t, V);
      ctx.restore();
      drawPlaceholderTag(V);
    }

    function X(nx) { return nx * cssW; }
    function Y(ny) { return ny * cssH; }

    function drawRails(V) {
      ctx.fillStyle = V.rail;
      ctx.fillRect(0, Y(0.004), cssW, Math.max(2, cssH * 0.006));
      ctx.fillRect(0, Y(0.86), cssW, Math.max(2, cssH * 0.005));
    }
    function drawFloor(V) {
      ctx.fillStyle = V.floor;
      ctx.fillRect(0, Y(0.86), cssW, cssH - Y(0.86));
    }
    function drawSpotlight(t, V) {
      var tx = X(core.targetX(t));
      var ty = Y(0.34);
      var active = core.spotlightActive(t);
      var r = X(tunables.target.radius) * (active ? 1.5 : 1.2);
      var grad = ctx.createRadialGradient(tx, ty, 1, tx, ty, r);
      if (active) { grad.addColorStop(0, 'rgba(255,215,106,0.45)'); grad.addColorStop(1, 'rgba(255,215,106,0)'); }
      else { grad.addColorStop(0, 'rgba(90,96,110,0.18)'); grad.addColorStop(1, 'rgba(90,96,110,0)'); }
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = active ? 3 : 2;
      ctx.strokeStyle = active ? V.spotlightOn : V.spotlightOff;
      ctx.beginPath(); ctx.arc(tx, ty, X(tunables.target.radius) * 0.9, 0, Math.PI * 2); ctx.stroke();
    }
    function drawTarget(t, V) {
      // Neutral geometric silhouette — DEVELOPMENT PLACEHOLDER. No identity.
      var tx = X(core.targetX(t)), ty = Y(0.34);
      var w = X(0.09), h = Y(0.11);
      ctx.fillStyle = V.target;
      ctx.strokeStyle = V.targetEdge;
      ctx.lineWidth = 2;
      // head
      ctx.beginPath(); ctx.arc(tx, ty - h * 0.62, w * 0.30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // body (rounded capsule)
      var bx = tx - w * 0.5, by = ty - h * 0.28;
      var r = w * 0.28;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.arcTo(bx + w, by, bx + w, by + h, r);
      ctx.arcTo(bx + w, by + h, bx, by + h, r);
      ctx.arcTo(bx, by + h, bx, by, r);
      ctx.arcTo(bx, by, bx + w, by, r);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    function drawStack(V) {
      var cx = X(0.5), baseY = Y(0.83);
      var avail = core.availableBills;
      var maxBills = tunables.stack.maxBills;
      var fullness = clamp(avail / maxBills, 0, 1);
      var w = X(0.30) * (0.45 + 0.55 * fullness);
      var h = Y(0.065) * (0.5 + 0.5 * fullness);
      // roll body
      ctx.fillStyle = V.stack;
      ctx.strokeStyle = V.stackEdge;
      ctx.lineWidth = 2;
      roundRect(cx - w / 2, baseY - h, w, h, Math.min(w, h) * 0.18);
      ctx.fill(); ctx.stroke();
      // layered bills
      var layers = Math.max(1, Math.round(6 * fullness));
      ctx.strokeStyle = V.stackEdge;
      ctx.lineWidth = 1;
      for (var i = 1; i < layers; i++) {
        var ly = baseY - h + (h / layers) * i;
        ctx.beginPath(); ctx.moveTo(cx - w / 2 + 3, ly); ctx.lineTo(cx + w / 2 - 3, ly); ctx.stroke();
      }
      // label
      ctx.fillStyle = V.dim;
      ctx.font = font(11);
      ctx.textAlign = 'center';
      ctx.fillText(formatMoney(avail * tunables.stack.billValue), cx, baseY + 15);
    }
    function drawDragFan(V) {
      if (!pointer || !pointer.active) return;
      var load = core.state().load;
      if (!load || load.bills < 1) return;
      var from = { x: X(0.5), y: Y(0.80) };
      var to = { x: X(pointer.lastX), y: Y(pointer.lastY) };
      var n = load.bills;
      for (var i = 0; i < n; i++) {
        var f = n === 1 ? 0 : (i / (n - 1) - 0.5);
        var bx = lerp(from.x, to.x, 0.15 + 0.6 * (i / Math.max(1, n))) + f * X(0.10);
        var by = lerp(from.y, to.y, 0.15 + 0.6 * (i / Math.max(1, n)));
        drawBill(bx, by, V, 1);
      }
      ctx.fillStyle = V.text; ctx.font = font(12); ctx.textAlign = 'center';
      ctx.fillText('LOAD ' + load.bills + (load.bills >= tunables.fan.minBills ? ' — FAN' : ''), X(0.5), Y(0.67));
    }
    function drawBill(x, y, V, a) {
      var w = X(0.038), h = Y(0.020);
      ctx.globalAlpha = a;
      ctx.fillStyle = V.bill; ctx.strokeStyle = V.billEdge; ctx.lineWidth = 1;
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.25);
      ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    function drawAnimations(V) {
      var tNow = now();
      for (var i = 0; i < animations.length; i++) {
        var a = animations[i];
        var p = clamp((tNow - a.t0) / a.dur, 0, 1);
        var e = easeOut(p);
        var mx = (a.from.x + a.to.x) / 2, my = a.from.y - a.arc;
        for (var b = 0; b < a.bills; b++) {
          var f = a.bills === 1 ? 0 : (b / (a.bills - 1) - 0.5);
          var px = quad(a.from.x, mx + f * a.spread * 2, a.to.x, e);
          var py = quad(a.from.y, my, a.to.y, e);
          if (p > 0.85 && a.kind !== 'hit') {
            var drop = (p - 0.85) / 0.15;
            py = lerp(py, 0.82, drop);
          }
          var alpha = a.kind === 'hit' ? (1 - p * 0.7) : (1 - p);
          if (alpha > 0) drawBill(X(px), Y(py), V, alpha);
        }
      }
    }
    function drawBeatStrip(t, V) {
      var interval = 60000 / tunables.beat.bpm;
      var count = 8;
      var y = Y(0.038);
      var w = cssW / (count + 1);
      var beat = core.beatAt(t);
      var current = beat.index % count;
      for (var i = 0; i < count; i++) {
        var x = w * (i + 0.5);
        var on = i === current;
        var scale = on ? (1 - clamp(beat.delta / interval, 0, 1)) : 0;
        ctx.fillStyle = on ? V.beat : V.spotlightOff;
        var bw = w * 0.5, bh = 4 + scale * 6;
        ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh);
      }
    }
    function drawMeters(t, V) {
      var s = core.state();
      // left column
      ctx.textAlign = 'left';
      ctx.font = font(12);
      ctx.fillStyle = V.dim; ctx.fillText('CASH', X(0.04), Y(0.10));
      ctx.fillStyle = V.text; ctx.font = font(18); ctx.fillText(formatMoney(s.cash), X(0.04), Y(0.135));
      ctx.fillStyle = V.dim; ctx.font = font(12); ctx.fillText('SPENT', X(0.04), Y(0.175));
      ctx.fillStyle = V.text; ctx.font = font(14); ctx.fillText(formatMoney(s.spent), X(0.04), Y(0.202));
      ctx.fillStyle = V.dim; ctx.font = font(12); ctx.fillText('WASTE', X(0.04), Y(0.245));
      ctx.fillStyle = V.waste; ctx.font = font(14); ctx.fillText(formatMoney(s.waste), X(0.04), Y(0.272));

      // right column
      ctx.textAlign = 'right';
      ctx.fillStyle = V.dim; ctx.font = font(12); ctx.fillText('HYPE', X(0.96), Y(0.10));
      ctx.fillStyle = V.hype; ctx.font = font(18); ctx.fillText(Math.round(s.hype), X(0.96), Y(0.135));
      ctx.fillStyle = V.dim; ctx.font = font(12); ctx.fillText('BEST STREAK', X(0.96), Y(0.175));
      ctx.fillStyle = V.text; ctx.font = font(14); ctx.fillText('x' + s.bestStreak, X(0.96), Y(0.202));
      var timeLeft = Math.ceil(s.timeLeftMs / 1000);
      ctx.fillStyle = V.dim; ctx.font = font(12); ctx.fillText('TIME', X(0.96), Y(0.245));
      ctx.fillStyle = timeLeft <= 5 ? V.waste : V.text; ctx.font = font(14); ctx.fillText(timeLeft + 's', X(0.96), Y(0.272));

      // crowd bar (sits above the cash roll so the two never overlap)
      var barY = Y(0.71), barW = cssW * 0.8, barX = (cssW - barW) / 2;
      ctx.fillStyle = V.rail; roundRect(barX, barY, barW, 10, 5); ctx.fill();
      ctx.fillStyle = V.crowd; roundRect(barX, barY, barW * clamp(s.crowd / tunables.hype.crowdMax, 0, 1), 10, 5); ctx.fill();
      ctx.fillStyle = V.dim; ctx.font = font(11); ctx.textAlign = 'center';
      ctx.fillText('CROWD' + (s.crowd >= tunables.hype.stormThreshold ? ' — STORM!' : ''), X(0.5), barY - 4);
    }
    function drawPopups(t, V) {
      var tNow = now();
      ctx.textAlign = 'center';
      for (var i = 0; i < popups.length; i++) {
        var p = popups[i];
        var k = clamp((tNow - p.t0) / p.ttl, 0, 1);
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = p.color; ctx.font = font(14);
        ctx.fillText(p.text, X(p.x), Y(p.y) - k * 22);
        ctx.globalAlpha = 1;
      }
    }
    function drawHint(t, V) {
      var pulse = 0.5 + 0.5 * Math.sin(t / 180);
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.55 + pulse * 0.45;
      ctx.fillStyle = V.text; ctx.font = font(13);
      ctx.fillText('DRAG THE ROLL  ↓', X(0.5), Y(0.63));
      ctx.fillStyle = V.beat;
      ctx.fillText('FLICK UP ON THE BEAT  ↑', X(0.5), Y(0.58));
      ctx.globalAlpha = 1;
    }
    function drawPlaceholderTag(V) {
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(139,143,160,0.7)';
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText('DEVELOPMENT PLACEHOLDER', cssW - 6, cssH - 4);
    }
    function drawResult() {
      var V = tunables.visual, s = core.summary();
      ctx.fillStyle = 'rgba(10,10,14,0.82)';
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.textAlign = 'center';
      ctx.fillStyle = V.text; ctx.font = font(16);
      ctx.fillText('RESULT', X(0.5), Y(0.15));
      ctx.fillStyle = V.hype; ctx.font = font(20);
      ctx.fillText('RAIN SCORE', X(0.5), Y(0.24));
      ctx.font = font(42);
      ctx.fillText(String(s.rainScore), X(0.5), Y(0.33));
      var rows = [
        ['MONEY SPENT', formatMoney(s.spent)],
        ['HYPE GENERATED', String(Math.round(s.hype))],
        ['WASTE', formatMoney(s.waste)],
        ['BEST STREAK', 'x' + s.bestStreak],
        ['HITS / MISSES / OVERTHROWS', s.hits + ' / ' + s.misses + ' / ' + s.overthrows]
      ];
      ctx.font = font(13);
      for (var i = 0; i < rows.length; i++) {
        var y = Y(0.44 + i * 0.07);
        ctx.textAlign = 'left'; ctx.fillStyle = V.dim; ctx.fillText(rows[i][0], X(0.16), y);
        ctx.textAlign = 'right'; ctx.fillStyle = V.text; ctx.fillText(rows[i][1], X(0.84), y);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = V.dim; ctx.font = font(12);
      ctx.fillText('CLICK A BUDGET BELOW TO PLAY AGAIN', X(0.5), Y(0.84));
    }

    // ---------------- canvas helpers ----------------
    function font(px) { return px + 'px "Courier New", ui-monospace, monospace'; }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function quad(a, b, c, t) { var u = 1 - t; return u * u * a + 2 * u * t * b + t * t * c; }

    // ---------------- wiring ----------------
    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('pointerup', onUp, { passive: false });
    canvas.addEventListener('pointercancel', onCancel, { passive: false });
    if (global.ResizeObserver) {
      var ro = new ResizeObserver(function () { fit(); });
      ro.observe(canvas);
    }

    var api = {
      version: VERSION,
      tunables: tunables,
      core: core,
      startRound: startRound,
      reset: reset,
      stop: function () { running = false; },
      setSeed: function (seed) { core.reset({ budget: core.budget, seed: seed }); },
      getState: function () { return core.state(); },
      getSummary: function () { return core.summary(); },
      setAudio: function (next) { hooks = Object.assign(defaultAudioHooks(), next || {}); },
      // Deterministic hooks used by the real-browser test harness. Not used by pointer input.
      debug: {
        advance: function (t) { return core.advance(t); },
        beginDrag: function (p) { return core.beginDrag(p); },
        dragTo: function (p) { return core.dragTo(p); },
        cancelDrag: function () { return core.cancelDrag(); },
        release: function (p) { var r = core.release(p); resolveFeedback(r, null); return r; },
        state: function () { return core.state(); },
        summary: function () { return core.summary(); },
        // Force a synchronous layout+draw. Lets review harnesses capture a frame even when
        // requestAnimationFrame is throttled (background/hidden tabs).
        render: function () { fit(); draw(now() - roundStart); return core.state(); },
        tick: function (t) { core.advance(t); fit(); draw(t); return core.state(); },
        forceEnd: function () { core.advance(tunables.round.durationMs); running = false; fit(); draw(tunables.round.durationMs); drawResult(); return core.summary(); },
        animations: function () { return animations.length; }
      }
    };
    return api;
  }

  global.RAMakeItRainSandbox = {
    version: VERSION,
    mount: function (canvas, options) { return createGame(canvas, options); },
    createGame: createGame,
    formatMoney: formatMoney,
    defaultAudioHooks: defaultAudioHooks
  };
})(typeof window !== 'undefined' ? window : globalThis);
