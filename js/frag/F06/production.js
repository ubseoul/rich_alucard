(function (global) {
  'use strict';
  // F06 owns lifecycle and IF-1 calls; the approved core and renderer remain unchanged.
  const FLAG = 'F06.rainmaker';
  const enabled = () => global.RAFeatures.enabled(FLAG);
  const state = () => global.RAFrag.get('F06');
  const write = value => global.RAFrag.patch('F06', '', value);
  let mounted = null;
  function sound(id) {
    const entry = global.RAAudioManifest?.get(id);
    if (entry?.registered && (entry.file || entry.parts?.length)) global.RAAudio?.sfx(id);
  }
  // RM codes are authored in the OPEN patch. Missing/unregistered assets remain silent.
  function mount(canvas, options = {}) {
    if (!enabled()) throw new Error('F06_DISABLED');
    if (mounted) throw new Error('F06_ALREADY_MOUNTED');
    // RC2 (OL-063): options.terms = RAStripClub.terms() when the phone's STRIP CLUB app opens the club. Absent for every other caller,
    // so a direct mount charges exactly what the core threw. The approved core and tunables are untouched.
    const terms = options.terms || null;
    let round = null, disposed = false;
    const game = global.RAMakeItRainSandbox.mount(canvas, {
      seed: options.seed,
      hideTarget: options.hideTarget,       // F15 seam: the host stages its own performers
      tunables: options.tunables,
      audio: {
        onLoad: () => sound('RM_01'),
        onFlick: result => {
          if (!round || disposed) return;
          const current = game.getState(), saved = state();
          if (saved.active?.id !== round.id) return;
          const delta = current.spent - saved.active.spent;
          if (delta <= 0) return; // duplicate feedback is never a second charge
          const charge = terms ? global.RAStripClub.price(terms, delta) : delta;
          const payment = global.RASalesChannels.record('rainmaker', {amount: -charge, kind: 'flick', memo: String(round.id)});
          if (!payment.ok) { abort(); options.onError?.('insufficient-funds'); return; }
          if (terms) { terms.paid += charge; if (terms.first) global.RAStripClub.markFirstVisit(); }
          if(terms){global.RALife?.setFlag('stripClubSeen',true);global.RALife?.setFlag('stripClubLastDay',global.RALife.today().day);}
          // Reload abandons a partial round; it never replays a charge or grants a reward.
          const next = state();
          next.active.spent = current.spent;
          next.spent += charge;
          next.thrown = (next.thrown || 0) + delta;
          next.active.paid = (next.active.paid || 0) + charge;
          next.lastReceipt = {id:round.id,thrown:delta,paid:charge,discount:terms?.first?terms.discount:0};
          write(next);
          options.onSpend?.({delta:charge, thrown:delta, result, round: round.id}); // support tracks actual debit
          sound('RM_02');
        },
        onHit: () => sound('RM_04')
      },
      onRoundEnd: summary => {
        const saved = state();
        if (!round || saved.active?.id !== round.id || disposed) return;
        saved.active = null;
        saved.completed++;
        saved.bestRainScore = Math.max(saved.bestRainScore, summary.rainScore);
        saved.lastResult = {id: round.id, ...summary};
        write(saved);
        round = null;
        options.onResult?.(summary);
      }
    });
    function abort() {
      game.stop();
      const saved = state();
      if (round && saved.active?.id === round.id) { saved.active = null; write(saved); }
      round = null;
    }
    function start(budget = 10000) {
      if (disposed || !enabled()) return false;
      if (terms) {
        // first visit: the preset is trimmed to what the cap still allows (throw dollars); later visits keep the presets
        if (!(budget > 0 && budget <= 25000)) return false;
        if (terms.first) { budget = Math.min(budget, global.RAStripClub.room(terms)); if (budget < terms.minRound) return false; }
        else if (![5000, 10000, 25000].includes(budget)) return false;
      } else if (![5000, 10000, 25000].includes(budget)) return false;
      if (global.RAMoneyLedger.balance() < (terms && terms.first ? global.RAStripClub.price(terms, budget) : budget)) return false;
      if (round) abort();
      const saved = state();
      round = {id: ++saved.sequence, budget, spent: 0};
      saved.active = {...round};
      write(saved);
      game.startRound(budget);
      options.onStart?.({budget});
      return true;
    }
    function dispose() {
      if (disposed) return;
      abort(); disposed = true;
      game.destroy();
      mounted = null;
      options.onClose?.();
    }
    mounted = {start, dispose, game, terms};
    return mounted;
  }
  const RC5_CSS = `
  .rc5-cap{color:#f6efd9;font:8px/1.7 var(--font);margin:6px 2px 0;text-align:center;min-height:14px;white-space:pre-line}
  .rc5-cap:empty{display:none}
  .rc5-gate,.rc5-receipt{position:absolute;inset:0;z-index:6;display:grid;align-content:center;justify-items:center;gap:8px;padding:18px 16px;text-align:center;background:radial-gradient(ellipse at 50% 38%,rgba(125,25,75,.55),rgba(7,6,15,.94) 72%);font-family:var(--font);overflow:hidden}
  .rc5-gate[hidden],.rc5-receipt[hidden]{display:none}
  .rc5-k{margin:0;color:#5fe3ff;font-size:8px;letter-spacing:.2em}
  .rc5-name{margin:0;color:#ff4fa3;font-size:28px;line-height:1;text-shadow:3px 3px 0 #17131e,0 0 18px rgba(255,79,163,.55);animation:rc5Neon 2.6s steps(1,end) infinite}
  .rc5-name small{display:block;margin-top:6px;font-size:7px;color:#f6c85a;text-shadow:none;letter-spacing:.2em}
  .rc5-lines{display:grid;gap:6px;margin:6px 0 2px}.rc5-lines p{margin:0;color:#f6efd9;font-size:9px;line-height:1.6}
  .rc5-lines .rc5-terms{color:#f6c85a;font-size:7px;max-width:30ch;margin:2px auto 0}
  .rc5-how{list-style:none;margin:6px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%}
  .rc5-how li{border:2px solid #403b72;background:#17142c;color:#b7b1df;font-size:6px;line-height:1.7;padding:6px 2px}
  .rc5-how b{display:block;color:#f6efd9;font-size:7px;font-weight:400}
  .rc5-fine{margin:0;color:#a49fc0;font-size:6px;letter-spacing:.08em}
  .rc5-gate .rc5-go{margin-top:8px;min-width:220px;animation:rc5Pulse 1.1s steps(2,end) infinite}
  .rc5-paid{margin:2px 0 0;display:grid;gap:4px}.rc5-paid small{color:#a49fc0;font-size:7px;letter-spacing:.2em}
  .rc5-paid b{color:#f6c85a;font-size:30px;font-weight:400;text-shadow:3px 3px 0 #7d194b,0 0 16px rgba(246,200,90,.45)}
  .rc5-paid b.rc5-pop{animation:rc5Pop .28s steps(3,end)}
  .rc5-sub{margin:0;color:#ff8cc6;font-size:7px}
  .rc5-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;width:100%;margin-top:4px}
  .rc5-stats span{display:grid;gap:4px;border:2px solid #403b72;background:#17142c;padding:6px 0;color:#a49fc0;font-size:6px}
  .rc5-stats b{color:#f6efd9;font-size:13px;font-weight:400}
  .rc5-said{margin:6px 0 0;color:#f6efd9;font-size:9px;line-height:1.6;max-width:32ch}
  .rc5-prog{margin:0;color:#5fe3ff;font-size:7px}
  .rc5-acts{display:flex;gap:8px;margin-top:8px}.rc5-acts .btn--again{min-width:170px}
  .rc5-rain{position:absolute;inset:0;pointer-events:none;z-index:-1}
  .rc5-rain i{position:absolute;top:-24px;left:var(--x);width:14px;height:8px;background:#2fbf6a;box-shadow:inset 0 0 0 1px #1a7a45,inset 5px 0 0 -3px #a6f5c2;animation:rc5Fall var(--s) linear var(--d) both}
  @keyframes rc5Fall{0%{transform:translateY(0) rotate(0)}50%{transform:translateY(55vh) rotate(160deg) translateX(10px)}100%{transform:translateY(110vh) rotate(340deg) translateX(-8px)}}
  @keyframes rc5Neon{0%,90%,100%{opacity:1}92%{opacity:.5}95%{opacity:1}97%{opacity:.7}}
  @keyframes rc5Pulse{50%{translate:0 -2px}}
  @keyframes rc5Pop{50%{transform:scale(1.18)}}
  @media (prefers-reduced-motion:reduce){.rc5-rain,.rc5-name,.rc5-gate .rc5-go,.rc5-paid b.rc5-pop{animation:none}.rc5-rain{display:none}}
  `;
  global.RASalesChannels.claim('rainmaker', {fragment: 'F06', meta: {scope: 'approved MAKE IT RAIN', rewards: false}});
  // A saved active round cannot be reconstructed without changing the approved pure core.
  // Treat reload as departure, retaining paid expenses and never applying unfinished results.
  if (enabled() && global.RAFrag.has('F06') && state().active) { const saved = state(); saved.active = null; write(saved); }
  global.RAFeatures.onChange(() => { if (!enabled()) mounted?.dispose(); });
  function launch(opts = {}) {
    if (!enabled() || mounted) return false;
    const previousFocus = global.document.activeElement;
    const host = global.document.createElement('div');
    host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true');
    host.setAttribute('aria-label', 'MAKE IT RAIN');
    host.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#090813;overflow:auto';
    const shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = '<link rel="stylesheet" href="js/frag/F06/make_it_rain.css"><main class="cab"><div class="stage"><canvas id="stage-canvas" aria-label="Drag up to load bills, flick to throw"></canvas><div class="result-actions" hidden><button class="btn btn--again" type="button">RUN IT BACK</button></div></div><div class="player-bar"><button class="btn btn--budget" data-budget="5000">$5K</button><button class="btn btn--budget" data-budget="10000">$10K</button><button class="btn btn--budget" data-budget="25000">$25K</button><button class="btn btn--ghost" data-back>BACK</button></div><p role="status"></p></main>';
    global.document.body.appendChild(host);
    const actions = shadow.querySelector('.result-actions');
    const status = shadow.querySelector('[role="status"]');
    // RC2 (OL-063): the club's own notes (first-visit terms, cap, NEED CASH) were unstyled dark-on-dark text; they are now readable.
    const say = text => { status.textContent = text; status.className = 'rc5-cap'; };
    const key = event => { if (event.key === 'Escape') { event.stopPropagation(); session.dispose(); } };
    const scene = () => session.dispose();
    const f15 = global.RAF15Club?.enabled?.() ? global.RAF15Club.open({shadow, stage: shadow.querySelector('.stage'), canvas: shadow.querySelector('canvas')}) : null;   // F15 seam (dark)
    // RC5 polish (presentation only, no rule or number changes): the round waits behind a tap-to-start card so the clock never
    // runs before the player reads the room; the caption sits right under the stage where a 390px phone can see it; a finished
    // round lands on a NIGHT RECEIPT with the payoff instead of a bare button below the fold.
    const stageEl = shadow.querySelector('.stage'), polish = global.document.createElement('style');
    polish.textContent = RC5_CSS; shadow.appendChild(polish); stageEl.after(status);
    const W = global.RAWriting, esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const dancer = f15 ? f15.selected() : null, dancerName = dancer ? (global.RAF15Tunables?.NAMES?.[dancer] || dancer.toUpperCase()) : null;
    const t0 = opts.terms;
    const gate = global.document.createElement('div'); gate.className = 'rc5-gate';
    gate.innerHTML = `<p class="rc5-k">${dancerName ? 'TONIGHT ON THE POLE' : 'MAKE IT RAIN'}</p>${dancerName ? `<p class="rc5-name">${esc(dancerName)}<small>21+</small></p>` : ''}<div role="status" class="rc5-lines"><p>RICH: ${esc(W.voice(16))}</p>${t0?.first ? `<p>RICH: ${esc(W.voice(20))}</p><p class="rc5-terms">${esc(t0.line)}</p>` : ''}</div><ul class="rc5-how"><li><b>DRAG UP</b> load</li><li><b>FLICK</b> throw</li><li><b>HIT HER LIGHT</b> hype</li></ul>${dancerName ? '<p class="rc5-fine">paying her unlocks dates</p>' : ''}<button class="btn btn--again rc5-go" type="button">MAKE IT RAIN · $10K</button>`;
    stageEl.appendChild(gate);
    const receipt = global.document.createElement('div'); receipt.className = 'rc5-receipt'; receipt.hidden = true; stageEl.appendChild(receipt);
    const fmt = n => '$' + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    function showReceipt(summary, paid) {
      const d = f15?.selected?.(), name = d ? (global.RAF15Tunables?.NAMES?.[d] || d.toUpperCase()) : null, prog = d ? global.RAF15?.progress?.(d) : null;
      const line = summary.spent === 0 ? 'RICH: scared money dont make money'
        : summary.hits > 0 ? (d ? W.throwReaction(d, paid) : 'RICH: '+W.voice(17))
        : (name ? `${name}: floor money still money` : 'RICH: all that on the floor damn');
      const progLine = !prog ? '' : prog.maxed ? `ON ${name} ${fmt(prog.spent)} · ALL DATES SEEN` : prog.availableLevel ? `ON ${name} ${fmt(prog.spent)} · DATE READY ↓` : `ON ${name} ${fmt(prog.spent)} · DATE AT ${fmt(prog.nextThreshold)}`;
      const off = opts.terms?.first && summary.spent > paid;
      receipt.innerHTML = `<div class="rc5-rain" aria-hidden="true">${Array.from({length: Math.min(18, 6 + summary.hits * 3)}, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i * 173) % 900}ms;--s:${1400 + (i * 97) % 900}ms"></i>`).join('')}</div><p class="rc5-k">NIGHT RECEIPT</p><p class="rc5-paid"><small>PAID</small><b data-to="${paid}">$0</b></p>${off ? `<p class="rc5-sub">THREW ${fmt(summary.spent)} · HOUSE COVERED HALF</p>` : ''}<div class="rc5-stats"><span><b>${summary.hits}</b>HITS</span><span><b>${summary.misses}</b>MISS</span><span><b>${summary.overthrows}</b>OVER</span><span><b>x${summary.bestStreak}</b>BEST</span></div><p class="rc5-said">${esc(line)}</p>${progLine ? `<p class="rc5-prog">${esc(progLine)}</p>` : ''}<div class="rc5-acts"></div>`;
      const acts = receipt.querySelector('.rc5-acts'), again = shadow.querySelector('.btn--again:not(.rc5-go)');
      if (again) { again.textContent = 'RUN IT BACK'; acts.appendChild(again); }
      const leave = global.document.createElement('button'); leave.type = 'button'; leave.className = 'btn btn--ghost'; leave.textContent = 'LEAVE'; leave.addEventListener('click', () => session.dispose()); acts.appendChild(leave);
      receipt.hidden = false;
      const b = receipt.querySelector('[data-to]'), to = Number(b.dataset.to) || 0, t1 = global.performance.now();
      const tick = () => { if (receipt.hidden || !b.isConnected) return; const k = Math.min(1, (global.performance.now() - t1) / 900); b.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) global.requestAnimationFrame(tick); else b.classList.add('rc5-pop'); };
      global.requestAnimationFrame(tick);
    }
    const session = mount(shadow.querySelector('canvas'), {
      terms: opts.terms || null,
      hideTarget: !!f15, tunables: f15?.tunables,
      onSpend: event => { f15?.onSpend(event);const receipt=`THROWN $${event.thrown} / PAID $${event.delta}${opts.terms?.first?' · 50% OFF':''}`;say((!host.dataset.voiceThrow?'RICH: '+global.RAWriting.voice(17)+'\n':'')+receipt);host.dataset.voiceThrow='1'; },
      onStart: ({budget}) => {
        actions.hidden = true; status.textContent = ''; gate.hidden = true; receipt.hidden = true;
        shadow.querySelectorAll('[data-budget]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.budget) === budget)));
      },
      onResult: summary => { actions.hidden = false;const paid=global.RAStripClub?.price(opts.terms,summary.spent)??summary.spent;say(`NIGHT DONE · PAID ${fmt(paid)}`);showReceipt(summary,paid); },
      onError: () => { say('RICH: '+global.RAWriting.voice(19)); },
      onClose: () => {
        f15?.close();
        global.document.removeEventListener('keydown', key, true);
        global.document.removeEventListener('ra:scene', scene);
        host.remove(); previousFocus?.focus?.();
      }
    });
    function start(budget) {
      if (session.start(budget)) return;
      const t = opts.terms;
      say(t && t.first && t.paid > 0 ? (global.RAEconLines?.get('club.cap_reached') || 'NEED CASH') : ('RICH: '+global.RAWriting.voice(19)));
    }
    shadow.querySelectorAll('[data-budget]').forEach(button => button.addEventListener('click', () => start(Number(button.dataset.budget))));
    shadow.querySelector('.btn--again').addEventListener('click', () => start(session.game.core.budget));
    gate.querySelector('.rc5-go').addEventListener('click', () => start(10000));
    f15?.bind(session, {start, launchScene: id => { session.dispose(); return global.RAAdventureScene?.begin?.(id, {from: 'phone'}); }});
    const back = shadow.querySelector('[data-back]');
    back.addEventListener('click', () => session.dispose()); back.focus();
    global.document.addEventListener('keydown', key, true);
    global.document.addEventListener('ra:scene', scene);
    gate.querySelector('.rc5-go').focus();
    return true;
  }
  global.RAPhoneRegistry.declare('F06', {
    id: 'rainmaker', flag: FLAG,
    // RC2 (OL-063): the STRIP CLUB phone app (js/systems/strip_club.js) is the one home-screen entry; this app stays reachable
    // by openApp() and applies the same first-visit terms, so neither door skips the protection.
    hidden: true,
    render: () => '<h1>RAINMAKER</h1><button type="button" class="phone-button" data-phone-action="do:rainmaker:launch">MAKE IT RAIN</button>',
    onAction: action => { if (action === 'launch') launch({terms: global.RAStripClub?.terms?.() || null}); }
  });
  global.RAF06Rainmaker = {mount, launch, state, enabled, close: () => mounted?.dispose()};
})(window);
